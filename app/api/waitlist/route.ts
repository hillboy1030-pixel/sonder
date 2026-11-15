import { MOCK_MODE } from "@/lib/server/config";
import { stripe } from "@/lib/server/payment";

// Journal waitlist. Emails are saved as Stripe customers tagged
// waitlist=journal, so there's no extra database or service to set up.
// To see the list: Stripe Dashboard → Customers → search "waitlist".

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let email = "";
  try {
    const body = await request.json();
    email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  } catch {
    // fall through
  }
  if (!EMAIL.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (MOCK_MODE) return Response.json({ ok: true });

  try {
    const existing = await stripe().customers.list({ email, limit: 1 });
    if (existing.data[0]) {
      await stripe().customers.update(existing.data[0].id, {
        metadata: { ...existing.data[0].metadata, waitlist: "journal" },
      });
    } else {
      await stripe().customers.create({
        email,
        description: "Sonder Journal waitlist",
        metadata: { waitlist: "journal", joined: new Date().toISOString().slice(0, 10) },
      });
    }
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Waitlist error:", error);
    return Response.json({ error: "We couldn't add you just now. Please try again." }, { status: 500 });
  }
}
