import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const listings = await prisma.listing.findMany({
    where: { status: "pending" },
    include: { host: { select: { name: true, email: true } }, photos: { take: 1 } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ listings });
}
