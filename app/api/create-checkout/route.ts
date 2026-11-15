import { REPORT_PRICE_CENTS } from "@/lib/pricing";
import { MOCK_MODE, originFrom } from "@/lib/server/config";
import { MOCK_SESSION_ID, REPORT_PRODUCT_TAG, stripe } from "@/lib/server/payment";

export async function POST(request: Request) {
  const origin = originFrom(request);

  if (MOCK_MODE) {
    return Response.json({ url: `${origin}/report?session_id=${MOCK_SESSION_ID}` });
  }

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Sonder Report",
              description: "Your complete nine-section Sonder Report, written from your answers.",
            },
            unit_amount: REPORT_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      // Lets you create 100%-off codes in Stripe for testers and friends.
      allow_promotion_codes: true,
      metadata: { product: REPORT_PRODUCT_TAG },
      payment_intent_data: { metadata: { product: REPORT_PRODUCT_TAG } },
      success_url: `${origin}/report?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/preview`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json({ error: "Checkout couldn't open. Please try again." }, { status: 500 });
  }
}
