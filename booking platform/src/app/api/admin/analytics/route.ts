import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPlatformAnalytics } from "@/lib/services/analytics";

export async function GET() {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const analytics = await getPlatformAnalytics();
  return NextResponse.json(analytics);
}
