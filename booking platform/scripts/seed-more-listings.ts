// Adds more demo listings on top of the base seed, to reach ~50 total for
// a fuller showcase. Safe to run multiple times against the same DB — it
// only adds new rows, never touches existing ones.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CITIES = [
  { city: "Austin, TX", lat: 30.2672, lng: -97.7431 },
  { city: "Seattle, WA", lat: 47.6062, lng: -122.3321 },
  { city: "Denver, CO", lat: 39.7392, lng: -104.9903 },
  { city: "Nashville, TN", lat: 36.1627, lng: -86.7816 },
  { city: "Chicago, IL", lat: 41.8781, lng: -87.6298 },
  { city: "Miami, FL", lat: 25.7617, lng: -80.1918 },
  { city: "Portland, OR", lat: 45.5152, lng: -122.6784 },
  { city: "New Orleans, LA", lat: 29.9511, lng: -90.0715 },
  { city: "Charleston, SC", lat: 32.7765, lng: -79.9311 },
  { city: "Asheville, NC", lat: 35.5951, lng: -82.5515 },
  { city: "Santa Fe, NM", lat: 35.687, lng: -105.9378 },
  { city: "Savannah, GA", lat: 32.0809, lng: -81.0912 },
  { city: "Boulder, CO", lat: 40.015, lng: -105.2705 },
  { city: "Sedona, AZ", lat: 34.8697, lng: -111.761 },
  { city: "Napa, CA", lat: 38.2975, lng: -122.2869 },
  { city: "Aspen, CO", lat: 39.1911, lng: -106.8175 },
  { city: "Key West, FL", lat: 24.5551, lng: -81.78 },
  { city: "Jackson Hole, WY", lat: 43.4799, lng: -110.7624 },
  { city: "Providence, RI", lat: 41.824, lng: -71.4128 },
  { city: "Austin, TX", lat: 30.2849, lng: -97.7341 },
];

const ADJECTIVES = [
  "Charming",
  "Modern",
  "Cozy",
  "Sunlit",
  "Elegant",
  "Rustic",
  "Chic",
  "Serene",
  "Historic",
  "Stylish",
  "Tranquil",
  "Bright",
  "Vintage",
  "Contemporary",
  "Peaceful",
];

const NOUNS = [
  "Bungalow",
  "Loft",
  "Cottage",
  "Townhouse",
  "Retreat",
  "Studio",
  "Cabin",
  "Villa",
  "Farmhouse",
  "Condo",
  "Guesthouse",
  "Row House",
  "Apartment",
];

const PROPERTY_TYPES = ["entire_place", "entire_place", "entire_place", "private_room", "shared_room"] as const;

const AMENITY_POOL = ["wifi", "kitchen", "parking", "pool", "washer", "air_conditioning"];

const PHOTO_POOL = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
  "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
  "https://images.unsplash.com/photo-1517824806704-9040b037703b",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
  "https://images.unsplash.com/photo-1513584684374-8bab748fbf90",
  "https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858",
  "https://images.unsplash.com/photo-1484101403633-562f891dc89a",
  "https://images.unsplash.com/photo-1560184897-ae75f418493e",
  "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf",
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
];

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[seed % arr.length];
}

function shuffledSubset<T>(arr: readonly T[], count: number, seed: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < count; i++) out.push(arr[(seed + i * 3) % arr.length]);
  return Array.from(new Set(out));
}

const TARGET_COUNT = 50;

async function main() {
  const existingCount = await prisma.listing.count();
  const toCreate = TARGET_COUNT - existingCount;

  if (toCreate <= 0) {
    console.log(`Already have ${existingCount} listings — nothing to add.`);
    return;
  }

  const hosts = await prisma.user.findMany({ where: { role: "host" } });
  if (hosts.length === 0) {
    console.log("No hosts found — run `npm run db:seed` first.");
    return;
  }

  console.log(`Creating ${toCreate} more listings (${existingCount} -> ${TARGET_COUNT})...`);

  for (let i = 0; i < toCreate; i++) {
    const seed = existingCount + i;
    const location = pick(CITIES, seed);
    const adjective = pick(ADJECTIVES, seed * 7 + 1);
    const noun = pick(NOUNS, seed * 5 + 2);
    const propertyType = pick(PROPERTY_TYPES, seed * 3 + 1);
    const host = hosts[seed % hosts.length];

    const basePrice = 70 + ((seed * 37) % 380); // $70–$450
    const cleaningFee = 20 + ((seed * 13) % 90);
    const maxGuests = propertyType === "shared_room" ? 1 : 1 + ((seed * 3) % 6);
    const bedrooms = propertyType === "shared_room" ? 1 : Math.max(1, Math.round(maxGuests / 2));
    const beds = Math.max(bedrooms, propertyType === "shared_room" ? 1 : 1 + (seed % 3));
    const bathrooms = Math.max(1, Math.round(bedrooms * 0.75));
    const instantBook = seed % 3 !== 0;
    const amenities = shuffledSubset(AMENITY_POOL, 2 + (seed % 4), seed);
    const photoCount = 2 + (seed % 3);
    const photos = shuffledSubset(PHOTO_POOL, photoCount, seed * 11);

    const title = `${adjective} ${noun} in ${location.city.split(",")[0]}`;

    const listing = await prisma.listing.create({
      data: {
        hostId: host.id,
        title,
        description:
          `This ${adjective.toLowerCase()} ${noun.toLowerCase()} in ${location.city} puts you close to ` +
          `everything worth seeing, with a layout designed for an easy, restful stay.`,
        propertyType,
        address: `${100 + seed} Main St, ${location.city}`,
        basePricePerNight: basePrice,
        cleaningFee,
        maxGuests,
        bedrooms,
        beds,
        bathrooms,
        amenities,
        instantBook,
        status: "approved",
        photos: {
          create: photos.map((url, idx) => ({
            url: `${url}?auto=format&fit=crop&w=1200&q=80`,
            sortOrder: idx,
          })),
        },
      },
    });

    await prisma.$executeRawUnsafe(
      `UPDATE listings SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
      location.lng + (((seed % 7) - 3) * 0.01),
      location.lat + (((seed % 5) - 2) * 0.01),
      listing.id,
    );

    if (seed % 2 === 0) {
      const guest = await prisma.user.findFirst({
        where: { role: "guest" },
        skip: seed % 4,
      });
      if (guest) {
        const checkIn = new Date();
        checkIn.setUTCDate(checkIn.getUTCDate() - (40 + seed));
        const checkOut = new Date(checkIn);
        checkOut.setUTCDate(checkOut.getUTCDate() + 3);

        const booking = await prisma.booking.create({
          data: {
            listingId: listing.id,
            guestId: guest.id,
            checkIn,
            checkOut,
            guestsCount: Math.min(2, maxGuests),
            totalPrice: basePrice * 3 + cleaningFee,
            platformCommission: Math.round((basePrice * 3 + cleaningFee) * 0.1 * 100) / 100,
            hostPayout: Math.round((basePrice * 3 + cleaningFee) * 0.9 * 100) / 100,
            status: "completed",
          },
        });

        await prisma.review.create({
          data: {
            bookingId: booking.id,
            reviewerId: guest.id,
            listingId: listing.id,
            revieweeType: "listing",
            rating: 3 + (seed % 3),
            comment: "Great stay overall — clean, well-located, and exactly as described.",
          },
        });
      }
    }

    if ((i + 1) % 10 === 0) console.log(`  ...${i + 1}/${toCreate}`);
  }

  const finalCount = await prisma.listing.count();
  console.log(`Done. Total listings: ${finalCount}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
