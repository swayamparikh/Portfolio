import { prisma } from "@/lib/prisma";
import type { ListingCardData } from "@/components/search/ListingCard";

export interface ListingSearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  priceMin?: number;
  priceMax?: number;
  amenities?: string[];
  instantBookOnly?: boolean;
  propertyType?: string;
}

function toCardData(listing: {
  id: string;
  title: string;
  address: string | null;
  basePricePerNight: unknown;
  instantBook: boolean;
  photos: { url: string }[];
  reviews: { rating: number }[];
}): ListingCardData {
  const ratings = listing.reviews.map((r) => r.rating);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  return {
    id: listing.id,
    title: listing.title,
    address: listing.address,
    basePricePerNight: Number(listing.basePricePerNight),
    photoUrl: listing.photos[0]?.url ?? null,
    instantBook: listing.instantBook,
    rating: avg,
    reviewCount: ratings.length,
  };
}

const cardInclude = {
  photos: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  reviews: { where: { revieweeType: "listing" as const }, select: { rating: true } },
};

export async function getFeaturedListings(limit = 8) {
  const listings = await prisma.listing.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: cardInclude,
  });
  return listings.map(toCardData);
}

export async function searchListings(params: ListingSearchParams) {
  const { location, guests, priceMin, priceMax, amenities, instantBookOnly, propertyType } = params;

  const listings = await prisma.listing.findMany({
    where: {
      status: "approved",
      ...(location
        ? {
            OR: [
              { address: { contains: location, mode: "insensitive" } },
              { title: { contains: location, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(guests ? { maxGuests: { gte: guests } } : {}),
      ...(priceMin != null ? { basePricePerNight: { gte: priceMin } } : {}),
      ...(priceMax != null ? { basePricePerNight: { lte: priceMax } } : {}),
      ...(amenities?.length ? { amenities: { hasEvery: amenities } } : {}),
      ...(instantBookOnly ? { instantBook: true } : {}),
      ...(propertyType ? { propertyType: propertyType as never } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: cardInclude,
  });

  // Date-range availability is enforced authoritatively at booking time by
  // the no_overlapping_bookings constraint; here we just filter out listings
  // with a manually blocked date inside the requested range, if provided.
  if (params.checkIn && params.checkOut) {
    const checkIn = new Date(params.checkIn);
    const checkOut = new Date(params.checkOut);
    const blocked = await prisma.availability.findMany({
      where: {
        listingId: { in: listings.map((l) => l.id) },
        isBlocked: true,
        date: { gte: checkIn, lt: checkOut },
      },
      select: { listingId: true },
    });
    const conflicting = await prisma.booking.findMany({
      where: {
        listingId: { in: listings.map((l) => l.id) },
        status: { in: ["pending", "confirmed"] },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { listingId: true },
    });
    const unavailable = new Set([
      ...blocked.map((b) => b.listingId),
      ...conflicting.map((c) => c.listingId),
    ]);
    return listings.filter((l) => !unavailable.has(l.id)).map(toCardData);
  }

  return listings.map(toCardData);
}

export async function getListingDetail(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      host: {
        select: { id: true, name: true, profilePhotoUrl: true, verified: true, createdAt: true },
      },
      reviews: {
        where: { revieweeType: "listing" },
        include: { reviewer: { select: { name: true, profilePhotoUrl: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return listing;
}
