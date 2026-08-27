import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull, or } from "drizzle-orm";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { getTechStack } from "@/lib/integrations/builtwith";
import { enrichOrganizationByDomain } from "@/lib/integrations/apollo";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { applyScoringToLead } from "@/lib/scoring";

// Section 4 step 2 (ENRICH) + step 3 (TAG) + step 4 (SCORE).
// Runs after source-leads (Section 21 cron spec) on leads still missing
// tech-stack data, then re-scores fit + service tags with the new signal.
//
// Apollo's org-enrich endpoint works on their free plan (unlike people
// search — see lib/integrations/apollo.ts) and returns industry/headcount/
// funding/tech-stack in one call, so it's tried first; BuiltWith (if
// configured) fills in tech stack only, as a fallback.
export async function POST(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending = await db
    .select()
    .from(leads)
    .where(and(eq(leads.doNotContact, false), or(isNull(leads.techStack), eq(leads.techStack, []))))
    .limit(50);

  let enriched = 0;
  const errors: string[] = [];

  for (const lead of pending) {
    if (!lead.domain) continue;
    try {
      let techStack: string[] = [];
      let industry = lead.industry;
      let companySize = lead.companySize;
      let fundingStatus = lead.fundingStatus;

      if (process.env.APOLLO_API_KEY) {
        const org = await enrichOrganizationByDomain(lead.domain);
        techStack = org.technologyNames;
        industry = industry ?? org.industry;
        companySize = companySize ?? org.estimatedNumEmployees;
        fundingStatus = fundingStatus ?? org.latestFundingStage ?? (org.totalFundingPrinted ? `${org.totalFundingPrinted} total raised` : null);
      } else if (process.env.BUILTWITH_API_KEY) {
        techStack = await getTechStack(lead.domain);
      }

      const scored = applyScoringToLead({ ...lead, techStack, industry, companySize, fundingStatus });
      await db
        .update(leads)
        .set({
          techStack,
          industry,
          companySize,
          fundingStatus,
          fitScore: scored.fitScore,
          serviceTags: scored.serviceTags,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, lead.id));
      enriched += 1;
    } catch (err) {
      errors.push(`${lead.domain}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({ enriched, errors });
}
