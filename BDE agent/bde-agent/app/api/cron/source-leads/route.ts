import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";
import { searchPeople } from "@/lib/integrations/apollo";
import { shouldExclude } from "@/lib/suppression";
import { applyScoringToLead } from "@/lib/scoring";
import { incrementDailyStat } from "@/lib/daily-stats";
import { ICP } from "@/lib/icp";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";

// Section 4 step 1 (PROSPECT) + Section 21 cron spec.
// Section 19: suppression/dedupe MUST be enforced here, not just at send —
// otherwise a suppressed contact gets re-scraped into a future batch.
export async function POST(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const DAILY_LEAD_TARGET = 35; // Section 11 funnel math: 30-35/day

  let people;
  try {
    people = await searchPeople({
      personTitles: [...ICP.decisionMakerTitles],
      organizationLocations: [...ICP.geographies],
      organizationNumEmployeesRanges: [`${ICP.companySize.min},${ICP.companySize.max}`],
      industries: [...ICP.industries],
      perPage: DAILY_LEAD_TARGET,
    });
  } catch (err) {
    // Confirmed against the live API: Apollo's free plan returns 403
    // API_INACCESSIBLE for people-search — only paid plans can source new
    // contacts this way. See lib/integrations/apollo.ts for the full note.
    return NextResponse.json(
      {
        sourced: 0,
        error: `Apollo people-search failed (likely a free-plan restriction — see lib/integrations/apollo.ts): ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 200 },
    );
  }

  let sourced = 0;
  const skipped: string[] = [];

  for (const person of people) {
    if (sourced >= DAILY_LEAD_TARGET) break;
    if (!person.email) continue;

    const { exclude, reason } = await shouldExclude(person.email);
    if (exclude) {
      skipped.push(`${person.email}: ${reason}`);
      continue;
    }

    const scored = applyScoringToLead({
      companyName: person.organization?.name ?? undefined,
      domain: person.organization?.website_url ?? undefined,
      contactName: person.name ?? undefined,
      title: person.title ?? undefined,
      email: person.email,
      linkedinUrl: person.linkedin_url ?? undefined,
      industry: person.organization?.industry ?? undefined,
      companySize: person.organization?.estimated_num_employees ?? undefined,
    });

    await db.insert(leads).values(scored).onConflictDoNothing();
    sourced += 1;
  }

  await incrementDailyStat("leadsSourced", sourced);

  return NextResponse.json({ sourced, skipped: skipped.length, skippedDetail: skipped });
}
