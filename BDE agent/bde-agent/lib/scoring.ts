// Section 1 ("Agent logic": tag 1-3 service lines per lead) + Section 2
// (buying trigger signals) → fit_score (0-100) and service_tags.

import { SERVICE_CATALOG, type ServiceLineKey } from "./service-catalog";
import { ICP } from "./icp";
import type { NewLead } from "./db/schema";

export interface ScoringInput {
  industry?: string | null;
  companySize?: number | null;
  techStack?: string[];
  hiringSignals?: string[];
  fundingStatus?: string | null;
  title?: string | null;
  geo?: string | null;
}

export interface ScoringResult {
  fitScore: number;
  serviceTags: ServiceLineKey[];
}

function textCorpus(input: ScoringInput): string {
  return [
    input.industry ?? "",
    ...(input.techStack ?? []),
    ...(input.hiringSignals ?? []),
    input.fundingStatus ?? "",
    input.title ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

export function assignServiceTags(input: ScoringInput): ServiceLineKey[] {
  const corpus = textCorpus(input);
  const matches = SERVICE_CATALOG.filter((service) =>
    service.fitSignalKeywords.some((kw) => corpus.includes(kw.toLowerCase())),
  );
  // Section 1: tag with 1-3 likely-fit service lines, highest-signal first.
  return matches.slice(0, 3).map((s) => s.key);
}

export function computeFitScore(input: ScoringInput): number {
  let score = 0;

  // Industry match against ICP (Section 2)
  if (input.industry && ICP.industries.some((i) => input.industry!.toLowerCase().includes(i))) {
    score += 20;
  }

  // Company size within ICP band
  if (
    input.companySize != null &&
    input.companySize >= ICP.companySize.min &&
    input.companySize <= ICP.companySize.max
  ) {
    score += 15;
  }

  // Geography — international priority markets (Section 2)
  if (input.geo && ICP.geographies.some((g) => input.geo!.toLowerCase().includes(g.toLowerCase()))) {
    score += 15;
  }

  // Decision-maker title match (Section 2)
  if (input.title && ICP.decisionMakerTitles.some((t) => input.title!.toLowerCase().includes(t.toLowerCase()))) {
    score += 15;
  }

  // Buying trigger signals (Section 2)
  if (input.fundingStatus) score += 15; // recently raised funding
  if (input.hiringSignals && input.hiringSignals.length > 0) score += 10; // hiring signal present
  if (input.techStack && input.techStack.length > 0) score += 5; // outdated/known stack detected — refine per real signal quality

  // Reachability bonus — service-line match found at all
  if (assignServiceTags(input).length > 0) score += 5;

  return Math.max(0, Math.min(100, score));
}

export function scoreLead(input: ScoringInput): ScoringResult {
  return {
    fitScore: computeFitScore(input),
    serviceTags: assignServiceTags(input),
  };
}

export function applyScoringToLead(lead: Partial<NewLead>): Partial<NewLead> {
  const result = scoreLead({
    industry: lead.industry,
    companySize: lead.companySize,
    techStack: lead.techStack as string[] | undefined,
    hiringSignals: lead.hiringSignals as string[] | undefined,
    fundingStatus: lead.fundingStatus,
    title: lead.title,
    geo: lead.geo,
  });
  return {
    ...lead,
    fitScore: result.fitScore,
    serviceTags: result.serviceTags,
  };
}
