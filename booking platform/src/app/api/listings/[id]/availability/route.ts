import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const today = new Date();
  const rangeStart = from ? new Date(from) : today;
  const rangeEnd = to ? new Date(to) : new Date(today.getTime() + 1000 * 60 * 60 * 24 * 365);

  const [availability, bookings] = await Promise.all([
    prisma.availability.findMany({
      where: { listingId: id, date: { gte: rangeStart, lte: rangeEnd } },
      select: { date: true, isBlocked: true, customPrice: true, aiSuggestedPrice: true },
      orderBy: { date: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        listingId: id,
        status: { in: ["pending", "confirmed"] },
        checkIn: { lte: rangeEnd },
        checkOut: { gte: rangeStart },
      },
      select: { checkIn: true, checkOut: true },
    }),
  ]);

  return NextResponse.json({
    availability,
    bookedRanges: bookings.map((b) => ({ checkIn: b.checkIn, checkOut: b.checkOut })),
  });
}
