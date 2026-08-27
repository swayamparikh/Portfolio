import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const FULL_REFUND_WINDOW_DAYS = 7;
const PARTIAL_REFUND_RATE = 0.5;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { listing: { select: { hostId: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isGuest = booking.guestId === session.user.id;
  const isHost = booking.listing.hostId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isGuest && !isHost && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (booking.status === "cancelled" || booking.status === "completed") {
    return NextResponse.json({ error: `Booking is already ${booking.status}.` }, { status: 400 });
  }

  const daysUntilCheckIn =
    (booking.checkIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  const refundRate = daysUntilCheckIn > FULL_REFUND_WINDOW_DAYS ? 1 : PARTIAL_REFUND_RATE;
  const refundAmount = Math.round(Number(booking.totalPrice) * refundRate * 100) / 100;

  const cancelled = await prisma.booking.update({
    where: { id },
    data: { status: "cancelled" },
  });

  // TODO(stripe): issue a refund of `refundAmount` via stripe.refunds.create
  // against booking.stripePaymentIntentId once Stripe keys are configured.

  return NextResponse.json({ booking: cancelled, refundAmount, refundRate });
}
