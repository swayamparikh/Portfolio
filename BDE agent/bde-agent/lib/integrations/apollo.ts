// Section 3/7/21 — Apollo.io: bulk lead sourcing + verified emails.
// Docs: https://docs.apollo.io/reference/people-search
//
// IMPORTANT (confirmed against the live API, not just docs): Apollo's FREE
// plan does not include people-search or people-match at all — both return
// HTTP 403 API_INACCESSIBLE even with a valid key ("not included in your
// Free plan... even with a master key"). Only `organizations/enrich` works
// on the free plan. Practically: Apollo's free tier can enrich a company you
// already have a domain for (industry, headcount, funding, tech stack — see
// enrichOrganizationByDomain), but it cannot find new contacts/leads for you.
// Real lead discovery on $0 means the manual paths in spec Section 3
// (LinkedIn search, Google Maps) feeding /leads/new, with Apollo enriching
// from there — or upgrading to an Apollo paid plan for searchPeople to work.

const APOLLO_BASE_URL = "https://api.apollo.io/api/v1";

function requireKey(): string {
  const key = process.env.APOLLO_API_KEY;
  if (!key) throw new Error("APOLLO_API_KEY is not set");
  return key;
}

export interface ApolloSearchFilters {
  organizationNumEmployeesRanges?: string[]; // e.g. ["10,200"]
  personTitles?: string[];
  organizationLocations?: string[];
  industries?: string[];
  page?: number;
  perPage?: number;
}

export interface ApolloPerson {
  id: string;
  name: string | null;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  organization: {
    name: string | null;
    website_url: string | null;
    industry: string | null;
    estimated_num_employees: number | null;
  } | null;
}

export async function searchPeople(filters: ApolloSearchFilters): Promise<ApolloPerson[]> {
  const res = await fetch(`${APOLLO_BASE_URL}/mixed_people/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": requireKey(),
    },
    body: JSON.stringify({
      person_titles: filters.personTitles,
      organization_locations: filters.organizationLocations,
      organization_num_employees_ranges: filters.organizationNumEmployeesRanges,
      q_organization_industries: filters.industries,
      page: filters.page ?? 1,
      per_page: filters.perPage ?? 25,
    }),
  });

  if (!res.ok) {
    throw new Error(`Apollo search failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return (data.people ?? []) as ApolloPerson[];
}

export interface ApolloOrganizationEnrichment {
  industry: string | null;
  estimatedNumEmployees: number | null;
  technologyNames: string[];
  totalFundingPrinted: string | null;
  latestFundingStage: string | null;
  annualRevenuePrinted: string | null;
  shortDescription: string | null;
}

// Works on Apollo's free plan (unlike searchPeople/people-match above).
export async function enrichOrganizationByDomain(domain: string): Promise<ApolloOrganizationEnrichment> {
  const res = await fetch(
    `${APOLLO_BASE_URL}/organizations/enrich?domain=${encodeURIComponent(domain)}`,
    { headers: { "x-api-key": requireKey() } },
  );
  if (!res.ok) {
    throw new Error(`Apollo org enrich failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const org = data.organization ?? {};
  return {
    industry: org.industry ?? null,
    estimatedNumEmployees: org.estimated_num_employees ?? null,
    technologyNames: org.technology_names ?? [],
    totalFundingPrinted: org.total_funding_printed ?? null,
    latestFundingStage: org.latest_funding_stage ?? null,
    annualRevenuePrinted: org.annual_revenue_printed ?? null,
    shortDescription: org.short_description ?? null,
  };
}
