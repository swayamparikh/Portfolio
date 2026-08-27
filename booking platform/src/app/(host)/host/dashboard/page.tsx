import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Host dashboard" };

export default async function HostDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/host/dashboard");

  const hostId = session.user.id;

  const [listingCount, upcomingBookings, earnings, pendingBookings] = await Promise.all([
    prisma.listing.count({ where: { hostId } }),
    prisma.booking.count({
      where: { listing: { hostId }, status: "confirmed", checkOut: { gte: new Date() } },
    }),
    prisma.booking.aggregate({
      where: { listing: { hostId }, status: { in: ["confirmed", "completed"] } },
      _sum: { hostPayout: true },
    }),
    prisma.booking.findMany({
      where: { listing: { hostId }, status: "pending" },
      include: { listing: { select: { title: true } }, guest: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    { label: "Active listings", value: listingCount },
    { label: "Upcoming bookings", value: upcomingBookings },
    { label: "Total earnings", value: formatPrice(Number(earnings._sum.hostPayout ?? 0)) },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-heading">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-text-muted">{s.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-text-heading">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-text-heading">
            Pending booking requests
          </h2>
          <Link href="/host/bookings" className="text-sm font-medium text-ocean">
            View all
          </Link>
        </div>

        {pendingBookings.length === 0 ? (
          <p className="text-sm text-text-muted">No pending requests right now.</p>
        ) : (
          <div className="space-y-3">
            {pendingBookings.map((b) => (
              <Card key={b.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-text-heading">{b.listing.title}</p>
                  <p className="text-sm text-text-muted">
                    {b.guest.name} · {b.checkIn.toDateString()} – {b.checkOut.toDateString()}
                  </p>
                </div>
                <Badge tone="ocean">{b.status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
