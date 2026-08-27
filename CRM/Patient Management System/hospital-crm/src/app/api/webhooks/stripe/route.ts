import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { sendEmail, invoiceEmail } from "@/lib/email";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[Stripe Webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as any;
        const invoice = await prisma.invoice.findFirst({
          where: { stripePaymentIntentId: paymentIntent.id },
          include: {
            patient: true,
            hospital: true,
          },
        });

        if (invoice) {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: "PAID", paidAt: new Date() },
          });

          await prisma.payment.create({
            data: {
              invoiceId: invoice.id,
              amount: invoice.totalAmount,
              method: "stripe",
              transactionId: paymentIntent.id,
            },
          });

          // Send receipt email
          if (invoice.patient.email) {
            const html = invoiceEmail({
              patientName: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
              invoiceNumber: invoice.invoiceNumber,
              amount: invoice.totalAmount,
              hospitalName: invoice.hospital.name,
              dueDate: invoice.dueDate ? format(invoice.dueDate, "MMM d, yyyy") : "N/A",
            });
            await sendEmail({
              to: invoice.patient.email,
              subject: `Payment Received — Invoice #${invoice.invoiceNumber}`,
              html,
            });
          }
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: sub.status.toUpperCase(),
            currentPeriodStart: new Date(sub.current_period_start * 1000),
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

