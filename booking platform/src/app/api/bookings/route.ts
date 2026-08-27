import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createBooking, isRangeAvailable, priceStay } from "@/lib/services/pricing";
import { createPaymentIntent } from "@/lib/services/payments";

const bookingSchema = z.object({
  listingId: z.string().uuid(),
  checkIn: z.string(),
  checkOut: z.string(),
  guestsCount: z.number().int().min(1),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to book." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { listingId, guestsCount } = parsed.data;
  const checkIn = new Date(parsed.data.checkIn);
  const checkOut = new Date(parsed.data.checkOut);

  if (!(checkOut > checkIn)) {
    return NextResponse.json({ error: "checkOut must be after checkIn" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "approved") {
    return NextResponse.json({ error: "Listing is not bookable." }, { status: 404 });
  }
  if (listing.maxGuests && guestsCount > listing.maxGuests) {
    return NextResponse.json(
      { error: `This listing sleeps a maximum of ${listing.maxGuests} guests.` },
      { status: 400 },
    );
  }

  // Fast-path UX check — the DB EXCLUDE constraint (prisma/sql/constraints.sql)
  // is the authoritative guard against a concurrent double-booking.
  const available = await isRangeAvailable(listingId, checkIn, checkOut);
  if (!available) {
    return NextResponse.json(
      { error: "These dates are no longer available." },
      { status: 409 },
    );
  }

  try {
    const booking = await createBooking({
      listingId,
      guestId: session.user.id,
      checkIn,
      checkOut,
      guestsCount,
    });

    const price = await priceStay(listingId, checkIn, checkOut);
    const paymentIntent = await createPaymentIntent({
      amount: price.total,
      bookingId: booking.id,
    });

    if (paymentIntent.clientSecret) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { stripePaymentIntentId: paymentIntent.id },
      });
    }

    return NextResponse.json(
      {
        booking,
        price,
        payment: paymentIntent,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create booking.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
