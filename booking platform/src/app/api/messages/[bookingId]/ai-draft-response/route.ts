import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { draftHostResponse } from "@/lib/services/ai";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ bookingId: string }> },
) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "host" && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await params;
  const { guestMessage } = await request.json().catch(() => ({ guestMessage: "" }));
  if (!guestMessage) {
    return NextResponse.json({ error: "guestMessage is required" }, { status: 400 });
  }

  const draft = await draftHostResponse({ guestMessage });
  return NextResponse.json({ draft });
}
