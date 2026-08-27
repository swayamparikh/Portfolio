import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";

export const metadata = { title: "Your trips" };

type BookingWithListing = Prisma.BookingGetPayload<{
  include: { listing: { include: { photos: true } } };
}>;

export default async function TripsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/trips");

  const bookings = await prisma.booking.findMany({
    where: { guestId: session.user.id },
    include: { listing: { include: { photos: { take: 1, orderBy: { sortOrder: "asc" } } } } },
    orderBy: { checkIn: "desc" },
  });

  const now = new Date();
  const upcoming = bookings.filter(
    (b) => b.checkOut >= now && (b.status === "confirmed" || b.status === "pending"),
  );
  const past = bookings.filter((b) => !upcoming.includes(b));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-heading text-2xl font-bold text-text-heading">Your trips</h1>

      <Section title="Upcoming" bookings={upcoming} emptyLabel="No upcoming trips yet." />
      <Section title="Past" bookings={past} emptyLabel="No past trips yet." />
    </div>
  );
}

function Section({
  title,
  bookings,
  emptyLabel,
}: {
  title: string;
  bookings: BookingWithListing[];
  emptyLabel: string;
}) {
  return (
    <div className="mt-8">
      <h2 className="font-heading text-lg font-semibold text-text-heading">{title}</h2>
      {bookings.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {bookings.map((b) => (
            <Card key={b.id} className="flex gap-4 p-4">
              <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-surface">
                {b.listing.photos[0] && (
                  <Image src={b.listing.photos[0].url} alt={b.listing.title} fill className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/listing/${b.listingId}`} className="font-heading font-semibold text-text-heading hover:text-ocean">
                    {b.listing.title}
                  </Link>
                  <p className="text-sm text-text-muted">
                    {b.checkIn.toDateString()} – {b.checkOut.toDateString()}
                  </p>
                  <p className="text-sm text-text-muted">{formatPrice(Number(b.totalPrice))} total</p>
                </div>
                <div className="flex items-center justify-between">
                  <Badge tone={statusTone(b.status)}>{b.status}</Badge>
                  {(b.status === "pending" || b.status === "confirmed") && (
                    <CancelBookingButton bookingId={b.id} />
                  )}
                  {b.status === "completed" && (
                    <Link href={`/listing/${b.listingId}?review=1`} className="text-sm font-medium text-ocean">
                      Leave a review
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function statusTone(status: string) {
  if (status === "confirmed" || status === "completed") return "trust" as const;
  if (status === "cancelled") return "coral" as const;
  return "ocean" as const;
}
