import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { nightsBetween } from "@/lib/utils";

const SERVICE_FEE_RATE = 0.08;
const COMMISSION_RATE_SETTING_KEY = "commission_rate";

/** Admin-configurable via /admin/settings; falls back to the env default. */
export async function getCommissionRate(): Promise<number> {
  const setting = await prisma.platformSetting.findUnique({
    where: { key: COMMISSION_RATE_SETTING_KEY },
  });
  if (setting) return Number(setting.value);
  return Number(process.env.PLATFORM_COMMISSION_RATE ?? "0.10");
}

export interface PriceBreakdown {
  nights: number;
  nightlyRates: number[];
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  total: number;
  platformCommission: number;
  hostPayout: number;
}

/**
 * Prices a stay using per-date custom pricing where set, falling back to the
 * listing's base rate. Mirrors the booking flow in Section 9 of the spec.
 */
export async function priceStay(
  listingId: string,
  checkIn: Date,
  checkOut: Date,
): Promise<PriceBreakdown> {
  const listing = await prisma.listing.findUniqueOrThrow({
    where: { id: listingId },
    select: { basePricePerNight: true, cleaningFee: true },
  });

  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) {
    throw new Error("check_out must be after check_in");
  }

  const availability = await prisma.availability.findMany({
    where: {
      listingId,
      date: { gte: checkIn, lt: checkOut },
    },
    select: { date: true, customPrice: true },
  });

  const customByDate = new Map(
    availability.map((a) => [a.date.toISOString().slice(0, 10), a.customPrice]),
  );

  const basePrice = Number(listing.basePricePerNight);
  const nightlyRates: number[] = [];
  const cursor = new Date(checkIn);
  for (let i = 0; i < nights; i++) {
    const key = cursor.toISOString().slice(0, 10);
    const custom = customByDate.get(key);
    nightlyRates.push(custom != null ? Number(custom) : basePrice);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const subtotal = round2(nightlyRates.reduce((sum, rate) => sum + rate, 0));
  const cleaningFee = round2(Number(listing.cleaningFee));
  const serviceFee = round2(subtotal * SERVICE_FEE_RATE);
  const total = round2(subtotal + cleaningFee + serviceFee);
  const commissionRate = await getCommissionRate();
  const platformCommission = round2(total * commissionRate);
  const hostPayout = round2(total - platformCommission);

  return {
    nights,
    nightlyRates,
    subtotal,
    cleaningFee,
    serviceFee,
    total,
    platformCommission,
    hostPayout,
  };
}

/**
 * Returns true if the requested date range is free of blocked dates and
 * conflicting bookings. This is a pre-check for UX only — the database
 * EXCLUDE constraint (see prisma/sql/constraints.sql) is the real guarantee
 * against double-booking under concurrent requests.
 */
export async function isRangeAvailable(
  listingId: string,
  checkIn: Date,
  checkOut: Date,
) {
  const [blockedDate, conflictingBooking] = await Promise.all([
    prisma.availability.findFirst({
      where: {
        listingId,
        isBlocked: true,
        date: { gte: checkIn, lt: checkOut },
      },
    }),
    prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ["pending", "confirmed"] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    }),
  ]);

  return !blockedDate && !conflictingBooking;
}

/**
 * Creates the booking row. Relies on the DB-level `no_overlapping_bookings`
 * EXCLUDE constraint to reject the write atomically if another request won
 * the race for the same dates — the isRangeAvailable() check above is only
 * a fast-path UX guard, not the source of truth.
 */
export async function createBooking(params: {
  listingId: string;
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  guestsCount: number;
}) {
  const price = await priceStay(params.listingId, params.checkIn, params.checkOut);

  try {
    return await prisma.booking.create({
      data: {
        listingId: params.listingId,
        guestId: params.guestId,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guestsCount: params.guestsCount,
        totalPrice: price.total,
        platformCommission: price.platformCommission,
        hostPayout: price.hostPayout,
        status: "pending",
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.code === "P2010" || err.code === "P2002")
    ) {
      throw new Error("These dates were just booked by someone else. Please pick different dates.");
    }
    throw err;
  }
}

function round2(value: number) {
  return Math.round(value * 100) / 100;
}
