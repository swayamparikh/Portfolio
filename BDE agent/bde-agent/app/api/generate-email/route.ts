import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, sequences } from "@/lib/db/schema";
import { generatePersonalizedEmail } from "@/lib/integrations/llm";

const requestSchema = z.object({
  leadId: z.string().uuid(),
  stepNumber: z.number().int().min(1),
  specificDetail: z.string().min(1), // real, verifiable detail from enrichment (Section 5)
});

// Section 21 — on-demand draft generation (e.g. for the dashboard's lead
// detail view), separate from the automated send-sequences cron.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { leadId, stepNumber, specificDetail } = parsed.data;

  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const serviceLine = (lead.serviceTags as string[] | null)?.[0] ?? "web_app_development";

  const templatesForServiceLine = await db.select().from(sequences).where(eq(sequences.serviceLine, serviceLine));
  const stepTemplate = templatesForServiceLine.find((r) => r.stepNumber === stepNumber);

  if (!stepTemplate) {
    return NextResponse.json({ error: `No sequence template found for service line "${serviceLine}"` }, { status: 404 });
  }

  const generated = await generatePersonalizedEmail({
    contactName: lead.contactName ?? "there",
    companyName: lead.companyName ?? lead.domain ?? "your company",
    serviceLine,
    templateBody: stepTemplate.templateBody,
    specificDetail,
  });

  return NextResponse.json(generated);
}
