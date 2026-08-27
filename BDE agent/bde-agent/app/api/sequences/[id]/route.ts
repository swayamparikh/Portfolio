import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sequences } from "@/lib/db/schema";
import { auth } from "@/auth";

const patchSequenceSchema = z.object({
  subject: z.string().optional(),
  templateBody: z.string().optional(),
  delayDays: z.number().int().min(0).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSequenceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db.update(sequences).set(parsed.data).where(eq(sequences.id, id)).returning();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
