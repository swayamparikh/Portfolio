import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateListingDescription } from "@/lib/services/ai";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "host" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const description = await generateListingDescription({
    title: body.title,
    propertyType: body.propertyType ?? null,
    amenities: body.amenities ?? [],
    bedrooms: body.bedrooms ?? null,
    address: body.address ?? null,
  });

  return NextResponse.json({ description });
}
