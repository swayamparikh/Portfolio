import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CalendarManager } from "@/components/host/CalendarManager";

export const metadata = { title: "Calendar & pricing" };

export default async function HostCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) notFound();
  if (listing.hostId !== session.user.id && session.user.role !== "admin") notFound();

  const availability = await prisma.availability.findMany({
    where: { listingId: id },
    orderBy: { date: "asc" },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-heading">{listing.title}</h1>
      <p className="mt-1 text-sm text-text-muted">
        Block dates, set custom nightly pricing, and see AI-suggested pricing based on
        seasonality and comparable listings.
      </p>

      <CalendarManager
        listingId={id}
        basePricePerNight={Number(listing.basePricePerNight)}
        initialAvailability={availability.map((a) => ({
          date: a.date.toISOString().slice(0, 10),
          isBlocked: a.isBlocked,
          customPrice: a.customPrice ? Number(a.customPrice) : null,
        }))}
      />
    </div>
  );
}
