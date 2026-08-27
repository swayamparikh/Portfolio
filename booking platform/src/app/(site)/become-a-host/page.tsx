import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Become a host" };

async function becomeHost() {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/signup");
  await prisma.user.update({ where: { id: session.user.id }, data: { role: "host" } });
  redirect("/host/listings/new");
}

export default async function BecomeAHostPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="font-heading text-3xl font-bold text-text-heading sm:text-4xl">
        Earn by hosting on Nestly
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-text-muted">
        List your space, set your own price with AI-assisted pricing suggestions, and get
        paid securely through Stripe Connect — minus a transparent platform commission.
      </p>

      <div className="mt-8">
        {session?.user ? (
          <form action={becomeHost}>
            <Button type="submit" size="lg">
              Start hosting
            </Button>
          </form>
        ) : (
          <Button href="/signup" size="lg">
            Sign up to get started
          </Button>
        )}
      </div>

      <div id="ai-pricing" className="mt-16 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
        <Feature title="AI smart pricing" body="Get a recommended nightly rate based on comparable listings and seasonality." />
        <Feature title="Instant payouts" body="Stripe Connect routes guest payments to you automatically, minus commission." />
        <Feature title="AI listing assistant" body="Draft a compelling description and tag amenities in seconds." />
      </div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border p-5">
      <h3 className="font-heading font-semibold text-text-heading">{title}</h3>
      <p className="mt-2 text-sm text-text-muted">{body}</p>
    </div>
  );
}
