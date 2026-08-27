import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

export interface PaymentIntentResult {
  id: string | null;
  clientSecret: string | null;
  mode: "stripe" | "unconfigured";
}

/**
 * Creates a Stripe PaymentIntent for the guest-facing total. Funds route
 * through the platform account (Stripe Connect) so the commission split can
 * be settled via a transfer to the host's Express account on confirmation.
 *
 * Falls back to a no-op result when STRIPE_SECRET_KEY isn't set, so the
 * booking flow stays testable before Stripe keys are provisioned.
 */
export async function createPaymentIntent(params: {
  amount: number;
  bookingId: string;
}): Promise<PaymentIntentResult> {
  const stripe = getStripe();
  if (!stripe) {
    return { id: null, clientSecret: null, mode: "unconfigured" };
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100),
    currency: "usd",
    metadata: { bookingId: params.bookingId },
    automatic_payment_methods: { enabled: true },
  });

  return { id: intent.id, clientSecret: intent.client_secret, mode: "stripe" };
}

/**
 * Transfers the host's payout (total minus platform commission) to their
 * connected Express account. No-ops when Stripe isn't configured or the
 * host hasn't completed onboarding.
 */
export async function transferHostPayout(params: {
  amount: number;
  hostStripeAccountId: string | null;
  bookingId: string;
}) {
  const stripe = getStripe();
  if (!stripe || !params.hostStripeAccountId) {
    return { id: null, mode: "unconfigured" as const };
  }

  const transfer = await stripe.transfers.create({
    amount: Math.round(params.amount * 100),
    currency: "usd",
    destination: params.hostStripeAccountId,
    metadata: { bookingId: params.bookingId },
  });

  return { id: transfer.id, mode: "stripe" as const };
}
