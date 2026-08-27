import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { suggestPrice } from "@/lib/services/ai";

export async function GET(
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

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date();
  const to = searchParams.get("to")
    ? new Date(searchParams.get("to")!)
    : new Date(from.getTime() + 1000 * 60 * 60 * 24 * 30);

  const comparable = await prisma.listing.aggregate({
    where: {
      status: "approved",
      propertyType: listing.propertyType,
      id: { not: listing.id },
    },
    _avg: { basePricePerNight: true },
  });

  const suggestions: { date: string; suggestedPrice: number }[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    const suggestedPrice = await suggestPrice({
      basePricePerNight: Number(listing.basePricePerNight),
      date: new Date(cursor),
      comparableAvgPrice: comparable._avg.basePricePerNight
        ? Number(comparable._avg.basePricePerNight)
        : undefined,
    });
    suggestions.push({ date: cursor.toISOString().slice(0, 10), suggestedPrice });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return NextResponse.json({ suggestions });
}
