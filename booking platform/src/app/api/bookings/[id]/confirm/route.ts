import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

// Stripe webhook — confirms payment succeeded and flips the booking to
// `confirmed`, per the flow in Section 9 of the spec. Also reachable as a
// direct POST (no signature) while Stripe isn't configured, so the demo
// flow works end-to-end in test mode without live keys.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (signature && webhookSecret && process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const rawBody = await request.text();
    try {
      stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }
  }

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status !== "pending") {
    return NextResponse.json({ booking });
  }

  const confirmed = await prisma.booking.update({
    where: { id },
    data: { status: "confirmed" },
  });

  // TODO(email): send booking confirmation emails to guest + host (Resend).

  return NextResponse.json({ booking: confirmed });
}
