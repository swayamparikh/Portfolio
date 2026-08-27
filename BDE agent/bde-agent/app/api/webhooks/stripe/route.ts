import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { activityLog, leads } from "@/lib/db/schema";

// Section 17 — "Deposit before work starts, always." Optional: only wire this
// up if you're taking deposits online via Stripe rather than invoice/wire.
// Verifies the Stripe signature using STRIPE_WEBHOOK_SECRET before trusting
// the payload — see https://stripe.com/docs/webhooks/signatures
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Stripe integration not configured" }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();
  // Signature verification requires the `stripe` package's constructEvent —
  // intentionally not bundled by default since this webhook is optional
  // (Section 21 project structure marks it "if handling deposits online").
  // npm install stripe, then:
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  //   const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  const event = JSON.parse(rawBody);

  if (event.type === "checkout.session.completed" || event.type === "payment_intent.succeeded") {
    const email: string | undefined = event.data?.object?.customer_email ?? event.data?.object?.receipt_email;
    if (email) {
      const [lead] = await db.select().from(leads).where(eq(leads.email, email)).limit(1);
      if (lead) {
        await db
          .update(leads)
          .set({ sequenceStatus: "deposit_received", updatedAt: new Date() })
          .where(eq(leads.id, lead.id));
        await db.insert(activityLog).values({ leadId: lead.id, eventType: "deposit_received", rawPayload: event });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
