import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Earnings" };

const payoutTone = { pending: "ocean", paid: "trust", failed: "coral" } as const;

export default async function HostEarningsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/host/earnings");

  const [user, payouts, upcomingTotal] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { verified: true } }),
    prisma.payout.findMany({
      where: { hostId: session.user.id },
      include: { booking: { include: { listing: { select: { title: true } } } } },
      orderBy: { paidAt: "desc" },
    }),
    prisma.booking.aggregate({
      where: { listing: { hostId: session.user.id }, status: "confirmed" },
      _sum: { hostPayout: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-heading">Earnings</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-text-muted">Upcoming payouts</p>
          <p className="mt-1 font-heading text-2xl font-bold text-text-heading">
            {formatPrice(Number(upcomingTotal._sum.hostPayout ?? 0))}
          </p>
        </Card>
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-text-muted">Stripe Connect</p>
            <p className="mt-1 font-heading font-semibold text-text-heading">
              {user?.verified ? "Connected" : "Not connected"}
            </p>
          </div>
          {!user?.verified && (
            <Button
              size="sm"
              variant="secondary"
              title="Requires STRIPE_SECRET_KEY to be configured"
              href="/api/host/stripe/onboard"
            >
              Connect Stripe
            </Button>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-text-heading">Transaction history</h2>
        {payouts.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">
            Payouts appear here once a booking is confirmed and the payout schedule releases funds.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {payouts.map((p) => (
              <Card key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-text-heading">{p.booking?.listing.title}</p>
                  <p className="text-sm text-text-muted">
                    {p.paidAt ? p.paidAt.toDateString() : "Pending transfer"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-heading font-semibold text-text-heading">
                    {formatPrice(Number(p.amount))}
                  </span>
                  <Badge tone={payoutTone[p.status]}>{p.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
