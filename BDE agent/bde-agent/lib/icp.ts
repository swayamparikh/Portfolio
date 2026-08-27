// Section 2 — Ideal Client Profile. Fill in real values before running the
// source-leads cron live; these are the filters passed to Apollo/scrapers.
// Placeholders are marked TODO — the agent won't source well until they're real.

export const ICP = {
  // TODO: fill in your real target industries
  industries: ["e-commerce", "professional services", "healthcare", "logistics"],

  companySize: { min: 10, max: 200 },

  // Section 2 — international priority markets first (higher budgets, used to
  // hiring remote agencies/freelancers).
  geographies: ["United States", "United Kingdom", "Canada", "Australia", "United Arab Emirates", "Western Europe"],

  decisionMakerTitles: [
    "Founder",
    "CEO",
    "COO",
    "Head of Operations",
    "CTO",
    "HR Head",
    "Marketing Head",
  ],

  // Section 2 — buying trigger signals scanned for during enrichment.
  buyingTriggerSignals: [
    "recently_raised_funding",
    "hiring_role_service_replaces",
    "outdated_website_stack",
    "negative_reviews_manual_process",
    "competitor_launched_digital_product",
  ],

  // Section 2 — timezone-aware send windows (local hour range, 24h) so
  // send-sequences cron only fires when it lands in the prospect's morning.
  sendWindowsByRegion: {
    US: { startHour: 6, endHour: 9 },
    UK_EU: { startHour: 9, endHour: 11 },
    default: { startHour: 8, endHour: 10 },
  },
} as const;
