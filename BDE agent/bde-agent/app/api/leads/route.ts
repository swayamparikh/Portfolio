import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { applyScoringToLead } from "@/lib/scoring";
import { shouldExclude } from "@/lib/suppression";

const createLeadSchema = z.object({
  companyName: z.string().optional(),
  domain: z.string().optional(),
  contactName: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  linkedinUrl: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.number().int().optional(),
  geo: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  hiringSignals: z.array(z.string()).optional(),
  fundingStatus: z.string().optional(),
  referralSource: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(leads).orderBy(desc(leads.updatedAt)).limit(500);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  // Section 19: suppression/dedupe check at intake, not just at send.
  if (input.email) {
    const { exclude, reason } = await shouldExclude(input.email);
    if (exclude) {
      return NextResponse.json({ error: `Lead excluded: ${reason}` }, { status: 409 });
    }
  }

  const scored = applyScoringToLead(input);
  const [created] = await db
    .insert(leads)
    .values({ ...input, ...scored })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
