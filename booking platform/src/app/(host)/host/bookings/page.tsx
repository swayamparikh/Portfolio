import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { BookingRespondButtons } from "@/components/host/BookingRespondButtons";

export const metadata = { title: "Booking requests" };

const statusTone = { pending: "ocean", confirmed: "trust", completed: "trust", cancelled: "coral" } as const;

export default async function HostBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/host/bookings");

  const bookings = await prisma.booking.findMany({
    where: { listing: { hostId: session.user.id } },
    include: { listing: { select: { title: true, instantBook: true } }, guest: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-heading">Bookings</h1>

      {bookings.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">No bookings yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium text-text-heading">{b.listing.title}</p>
                <p className="text-sm text-text-muted">
                  {b.guest.name ?? b.guest.email} · {b.checkIn.toDateString()} – {b.checkOut.toDateString()}
                </p>
                <p className="text-sm text-text-muted">
                  {formatPrice(Number(b.totalPrice))} total · your payout {formatPrice(Number(b.hostPayout))}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={statusTone[b.status]}>{b.status}</Badge>
                {b.status === "pending" && !b.listing.instantBook && (
                  <BookingRespondButtons bookingId={b.id} />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
