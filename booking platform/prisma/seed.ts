// Demo data for local dev / portfolio review — run with `npm run db:seed`.
// Populates enough listings, bookings, and reviews that a reviewer never
// has to create their own data to see the product work (Section 12).

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "password123";

const LISTINGS = [
  {
    title: "Sunlit Loft in the Arts District",
    address: "480 S Santa Fe Ave, Los Angeles, CA",
    lat: 34.0407,
    lng: -118.2334,
    propertyType: "entire_place" as const,
    price: 189,
    cleaning: 60,
    maxGuests: 4,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    amenities: ["wifi", "kitchen", "air_conditioning", "washer"],
    instantBook: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    ],
  },
  {
    title: "Cozy Cabin Retreat by the Lake",
    address: "112 Pinecrest Rd, Lake Tahoe, CA",
    lat: 39.0968,
    lng: -120.0324,
    propertyType: "entire_place" as const,
    price: 245,
    cleaning: 85,
    maxGuests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    amenities: ["wifi", "kitchen", "parking", "washer"],
    instantBook: false,
    photos: [
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
    ],
  },
  {
    title: "Modern Studio Near Downtown",
    address: "88 Market St, San Francisco, CA",
    lat: 37.7936,
    lng: -122.3965,
    propertyType: "private_room" as const,
    price: 95,
    cleaning: 35,
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ["wifi", "kitchen", "air_conditioning"],
    instantBook: true,
    photos: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    ],
  },
  {
    title: "Beachfront Bungalow",
    address: "22 Ocean Front Walk, Venice, CA",
    lat: 33.985,
    lng: -118.4695,
    propertyType: "entire_place" as const,
    price: 320,
    cleaning: 100,
    maxGuests: 5,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    amenities: ["wifi", "kitchen", "pool", "parking", "air_conditioning"],
    instantBook: true,
    photos: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    ],
  },
  {
    title: "Mountain View A-Frame",
    address: "9 Ridgeline Dr, Big Bear Lake, CA",
    lat: 34.2439,
    lng: -116.9114,
    propertyType: "entire_place" as const,
    price: 210,
    cleaning: 70,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ["wifi", "kitchen", "parking"],
    instantBook: false,
    photos: [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
      "https://images.unsplash.com/photo-1517824806704-9040b037703b",
    ],
  },
  {
    title: "Minimalist Desert House",
    address: "701 Sunny Dunes Rd, Palm Springs, CA",
    lat: 33.8035,
    lng: -116.5453,
    propertyType: "entire_place" as const,
    price: 275,
    cleaning: 90,
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 2,
    amenities: ["wifi", "kitchen", "pool", "air_conditioning"],
    instantBook: true,
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
      "https://images.unsplash.com/photo-1513584684374-8bab748fbf90",
    ],
  },
  {
    title: "Shared Room in Historic Brownstone",
    address: "150 Beacon St, Boston, MA",
    lat: 42.3555,
    lng: -71.0709,
    propertyType: "shared_room" as const,
    price: 55,
    cleaning: 20,
    maxGuests: 1,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ["wifi", "kitchen", "washer"],
    instantBook: false,
    photos: ["https://images.unsplash.com/photo-1560185127-6ed189bf02f4"],
  },
  {
    title: "Skyline Penthouse",
    address: "1 World Trade Center, New York, NY",
    lat: 40.7127,
    lng: -74.0134,
    propertyType: "entire_place" as const,
    price: 450,
    cleaning: 120,
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: ["wifi", "kitchen", "air_conditioning", "parking"],
    instantBook: true,
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858",
    ],
  },
];

const REVIEW_COMMENTS = [
  { rating: 5, comment: "Absolutely stunning space, exactly as pictured. Host was incredibly responsive." },
  { rating: 5, comment: "Loved the location — walkable to everything. Would book again in a heartbeat." },
  { rating: 4, comment: "Great stay overall, just a little street noise at night. Cleanliness was spotless." },
  { rating: 4, comment: "Check-in was smooth and the place matched the listing perfectly." },
  { rating: 3, comment: "Nice place but the wifi was spotty for video calls. Everything else was solid." },
  { rating: 5, comment: "Best Airbnb we've stayed in this year. Host left great local recommendations." },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@nestly.demo" },
    update: {},
    create: {
      email: "admin@nestly.demo",
      name: "Nestly Admin",
      role: "admin",
      passwordHash,
      verified: true,
    },
  });

  const hosts = await Promise.all(
    ["Maya Chen", "Diego Alvarez", "Priya Nair"].map((name, i) =>
      prisma.user.upsert({
        where: { email: `host${i + 1}@nestly.demo` },
        update: {},
        create: {
          email: `host${i + 1}@nestly.demo`,
          name,
          role: "host",
          passwordHash,
          verified: true,
        },
      }),
    ),
  );

  const guests = await Promise.all(
    ["Jordan Lee", "Sam Patel", "Casey Kim", "Alex Rivera"].map((name, i) =>
      prisma.user.upsert({
        where: { email: `guest${i + 1}@nestly.demo` },
        update: {},
        create: {
          email: `guest${i + 1}@nestly.demo`,
          name,
          role: "guest",
          passwordHash,
        },
      }),
    ),
  );

  console.log(`Seeded users: 1 admin, ${hosts.length} hosts, ${guests.length} guests.`);

  const listingIds: string[] = [];

  for (let i = 0; i < LISTINGS.length; i++) {
    const l = LISTINGS[i];
    const host = hosts[i % hosts.length];

    const listing = await prisma.listing.create({
      data: {
        hostId: host.id,
        title: l.title,
        description:
          `${l.title} offers a comfortable, well-equipped stay in a great location. ` +
          `Perfect for travelers who want a genuinely restful base to explore from.`,
        propertyType: l.propertyType,
        address: l.address,
        basePricePerNight: l.price,
        cleaningFee: l.cleaning,
        maxGuests: l.maxGuests,
        bedrooms: l.bedrooms,
        beds: l.beds,
        bathrooms: l.bathrooms,
        amenities: l.amenities,
        instantBook: l.instantBook,
        status: "approved",
        photos: {
          create: l.photos.map((url, idx) => ({
            url: `${url}?auto=format&fit=crop&w=1200&q=80`,
            sortOrder: idx,
          })),
        },
      },
    });

    // PostGIS geography column — not settable via the Prisma client directly.
    await prisma.$executeRawUnsafe(
      `UPDATE listings SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
      l.lng,
      l.lat,
      listing.id,
    );

    listingIds.push(listing.id);
  }

  console.log(`Seeded ${listingIds.length} approved listings.`);

  // One pending listing, so the admin approval queue isn't empty.
  const pendingHost = hosts[0];
  await prisma.listing.create({
    data: {
      hostId: pendingHost.id,
      title: "Brand New Riverside Cottage",
      description: "Just listed — awaiting review before it goes live.",
      propertyType: "entire_place",
      address: "5 Riverbank Ln, Portland, OR",
      basePricePerNight: 165,
      cleaningFee: 50,
      maxGuests: 3,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
      amenities: ["wifi", "kitchen"],
      status: "pending",
    },
  });

  // Past, completed bookings with reviews (so listing pages show ratings + AI summaries).
  let reviewCursor = 0;
  for (const listingId of listingIds) {
    const guest = guests[reviewCursor % guests.length];
    const checkIn = daysFromNow(-30 - reviewCursor * 3);
    const checkOut = daysFromNow(-27 - reviewCursor * 3);

    const booking = await prisma.booking.create({
      data: {
        listingId,
        guestId: guest.id,
        checkIn,
        checkOut,
        guestsCount: 2,
        totalPrice: 500,
        platformCommission: 50,
        hostPayout: 450,
        status: "completed",
      },
    });

    const reviewCount = 1 + (reviewCursor % 3);
    for (let r = 0; r < reviewCount; r++) {
      const sample = REVIEW_COMMENTS[(reviewCursor + r) % REVIEW_COMMENTS.length];
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          reviewerId: guests[(reviewCursor + r) % guests.length].id,
          listingId,
          revieweeType: "listing",
          rating: sample.rating,
          comment: sample.comment,
        },
      });
    }

    const listing = await prisma.listing.findUniqueOrThrow({ where: { id: listingId } });
    await prisma.payout.create({
      data: {
        hostId: listing.hostId,
        bookingId: booking.id,
        amount: 450,
        status: "paid",
        paidAt: checkOut,
      },
    });

    reviewCursor++;
  }

  // A couple of upcoming bookings — one confirmed, one pending — to populate
  // the guest trips dashboard and host booking inbox.
  const confirmedBooking = await prisma.booking.create({
    data: {
      listingId: listingIds[0],
      guestId: guests[0].id,
      checkIn: daysFromNow(14),
      checkOut: daysFromNow(18),
      guestsCount: 2,
      totalPrice: 892,
      platformCommission: 89.2,
      hostPayout: 802.8,
      status: "confirmed",
    },
  });

  await prisma.booking.create({
    data: {
      listingId: listingIds[1],
      guestId: guests[1].id,
      checkIn: daysFromNow(25),
      checkOut: daysFromNow(29),
      guestsCount: 3,
      totalPrice: 1120,
      platformCommission: 112,
      hostPayout: 1008,
      status: "pending",
    },
  });

  const listing0 = await prisma.listing.findUniqueOrThrow({ where: { id: listingIds[0] } });
  await prisma.message.createMany({
    data: [
      {
        bookingId: confirmedBooking.id,
        senderId: guests[0].id,
        recipientId: listing0.hostId,
        content: "Hi! Is early check-in possible around 11am?",
      },
      {
        bookingId: confirmedBooking.id,
        senderId: listing0.hostId,
        recipientId: guests[0].id,
        content: "Should be no problem — I'll confirm the day before your arrival.",
      },
    ],
  });

  // A couple of manually blocked dates on the first listing, to exercise the
  // availability calendar UI.
  await prisma.availability.createMany({
    data: [
      { listingId: listingIds[0], date: daysFromNow(5), isBlocked: true },
      { listingId: listingIds[0], date: daysFromNow(6), isBlocked: true },
      { listingId: listingIds[0], date: daysFromNow(20), customPrice: 249 },
    ],
    skipDuplicates: true,
  });

  console.log("Seeded bookings, reviews, payouts, messages, and availability overrides.");
  console.log("\nDemo logins (password: " + DEMO_PASSWORD + "):");
  console.log(`  Admin: ${admin.email}`);
  hosts.forEach((h) => console.log(`  Host:  ${h.email}`));
  guests.forEach((g) => console.log(`  Guest: ${g.email}`));
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
