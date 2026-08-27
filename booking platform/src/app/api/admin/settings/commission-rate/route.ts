import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCommissionRate } from "@/lib/services/pricing";

export async function GET() {
  const rate = await getCommissionRate();
  return NextResponse.json({ commissionRate: rate });
}

const schema = z.object({ commissionRate: z.number().min(0).max(0.5) });

export async function PUT(request: Request) {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid rate" }, { status: 400 });

  await prisma.platformSetting.upsert({
    where: { key: "commission_rate" },
    create: { key: "commission_rate", value: String(parsed.data.commissionRate) },
    update: { value: String(parsed.data.commissionRate) },
  });

  return NextResponse.json({ commissionRate: parsed.data.commissionRate });
}
