import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  dates: z
    .array(
      z.object({
        date: z.string(),
        isBlocked: z.boolean().optional(),
        customPrice: z.number().positive().nullable().optional(),
      }),
    )
    .min(1),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.hostId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  await prisma.$transaction(
    parsed.data.dates.map((d) =>
      prisma.availability.upsert({
        where: { listingId_date: { listingId: id, date: new Date(d.date) } },
        create: {
          listingId: id,
          date: new Date(d.date),
          isBlocked: d.isBlocked ?? false,
          customPrice: d.customPrice ?? null,
        },
        update: {
          ...(d.isBlocked !== undefined ? { isBlocked: d.isBlocked } : {}),
          ...(d.customPrice !== undefined ? { customPrice: d.customPrice } : {}),
        },
      }),
    ),
  );

  const availability = await prisma.availability.findMany({
    where: { listingId: id },
    orderBy: { date: "asc" },
  });

  return NextResponse.json({ availability });
}
