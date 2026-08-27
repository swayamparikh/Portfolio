import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const listingSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(4000).optional(),
  propertyType: z.enum(["entire_place", "private_room", "shared_room"]),
  address: z.string().min(3).max(200),
  basePricePerNight: z.number().positive(),
  cleaningFee: z.number().min(0).default(0),
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().min(0),
  beds: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  amenities: z.array(z.string()).default([]),
  instantBook: z.boolean().default(false),
  photoUrls: z.array(z.string().url()).default([]),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "host" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Only hosts can create listings." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid listing data", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { photoUrls, ...data } = parsed.data;

  const listing = await prisma.listing.create({
    data: {
      ...data,
      hostId: session.user.id,
      status: "pending",
      photos: {
        create: photoUrls.map((url, i) => ({ url, sortOrder: i })),
      },
    },
    include: { photos: true },
  });

  return NextResponse.json({ listing }, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listings = await prisma.listing.findMany({
    where: { hostId: session.user.id },
    include: { photos: { take: 1, orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ listings });
}
