import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Creates a Stripe Express account for the host and returns an onboarding
// link (Section 8: POST /api/host/stripe/onboard). Redirects back to the
// earnings page once STRIPE_SECRET_KEY is configured; otherwise explains
// what's missing instead of failing silently.
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login?callbackUrl=/host/earnings", request.url));
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error:
          "Stripe isn't configured yet. Set STRIPE_SECRET_KEY in your environment to enable host payouts.",
      },
      { status: 501 },
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  let stripeAccountId = user.stripeAccountId;
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: { transfers: { requested: true } },
    });
    stripeAccountId = account.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeAccountId } });
  }

  const origin = new URL(request.url).origin;
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${origin}/host/earnings`,
    return_url: `${origin}/host/earnings`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(accountLink.url);
}
