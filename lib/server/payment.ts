import Stripe from "stripe";
import {
  MAX_GENERATIONS_PER_PURCHASE,
  MOCK_MODE,
  PURCHASE_VALID_DAYS,
} from "./config";

export const REPORT_PRODUCT_TAG = "sonder_report";
export const MOCK_SESSION_ID = "mock_paid_session";

let stripeClient: Stripe | null = null;
export function stripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripeClient;
}

export type PurchaseCheck =
  | { ok: true; consume: () => Promise<void> }
  | { ok: false; status: number; error: string };

/**
 * Confirms that a Stripe checkout session is a paid Sonder report purchase and
 * that it hasn't already been used up. Call `consume()` right before generating.
 *
 * No database needed: the use-count is stored on the Stripe payment itself.
 */
export async function checkPurchase(
  sessionId: unknown,
  client: Pick<Stripe, "checkout" | "paymentIntents"> | null = null
): Promise<PurchaseCheck> {
  if (typeof sessionId !== "string" || !sessionId) {
    return { ok: false, status: 402, error: "We couldn't find your payment. Unlock the report from your preview to continue." };
  }

  if (MOCK_MODE && sessionId === MOCK_SESSION_ID) {
    return { ok: true, consume: async () => {} };
  }

  let api: Pick<Stripe, "checkout" | "paymentIntents">;
  let session: Stripe.Checkout.Session;
  try {
    api = client ?? stripe();
    session = await api.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
  } catch {
    return { ok: false, status: 402, error: "We couldn't verify your payment. If you were charged, email us and we'll make it right." };
  }

  if (session.metadata?.product !== REPORT_PRODUCT_TAG) {
    return { ok: false, status: 402, error: "This payment isn't for a Sonder report." };
  }

  const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
  if (session.status !== "complete" || !paid) {
    return { ok: false, status: 402, error: "Your payment hasn't gone through yet. Please try again in a moment." };
  }

  const ageDays = (Date.now() / 1000 - session.created) / 86400;
  if (ageDays > PURCHASE_VALID_DAYS) {
    return { ok: false, status: 410, error: "This purchase has expired. Open your saved PDF, or take the assessment again." };
  }

  const pi = session.payment_intent;
  if (pi && typeof pi === "object") {
    const used = Number(pi.metadata?.sonder_generations ?? "0");
    if (used >= MAX_GENERATIONS_PER_PURCHASE) {
      return { ok: false, status: 429, error: "This purchase has already been used to write your report. Open it in the browser you bought it on, or download your PDF." };
    }
    return {
      ok: true,
      consume: async () => {
        await api.paymentIntents.update(pi.id, {
          metadata: { sonder_generations: String(used + 1) },
        });
      },
    };
  }

  // 100%-off promo code: no payment intent to count against.
  return { ok: true, consume: async () => {} };
}
