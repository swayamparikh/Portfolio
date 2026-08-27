import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ action: z.enum(["accept", "decline"]) });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { listing: { select: { hostId: true } } },
  });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.listing.hostId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.status !== "pending") {
    return NextResponse.json({ error: "Booking is no longer pending." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: parsed.data.action === "accept" ? "confirmed" : "cancelled" },
  });

  return NextResponse.json({ booking: updated });
}
