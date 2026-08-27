import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function assertOwnership(id: string, userId: string, role: string) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return null;
  if (listing.hostId !== userId && role !== "admin") return null;
  return listing;
}

const updateSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(4000).optional(),
  basePricePerNight: z.number().positive().optional(),
  cleaningFee: z.number().min(0).optional(),
  maxGuests: z.number().int().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  beds: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  instantBook: z.boolean().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ listing });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await assertOwnership(id, session.user.id, session.user.role);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update", issues: parsed.error.issues }, { status: 400 });
  }

  const listing = await prisma.listing.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ listing });
}
