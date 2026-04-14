import Stripe from "stripe";
import { NextRequest } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { session_id } = await request.json();

    if (!session_id) {
      return Response.json({ verified: false });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const verified = session.payment_status === "paid";

    return Response.json({ verified });
  } catch (error) {
    console.error("Stripe verification error:", error);
    return Response.json({ verified: false });
  }
}
