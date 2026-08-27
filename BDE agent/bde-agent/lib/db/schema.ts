import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums — Section 6 (Lead Data Schema) + Section 19 (Suppression)
// ---------------------------------------------------------------------------

export const sequenceStatusEnum = pgEnum("sequence_status", [
  "not_started",
  "in_progress",
  "replied",
  "booked",
  "proposal_sent",
  "contract_sent",
  "deposit_received",
  "client",
  "bounced",
  "opted_out",
]);

export const replySentimentEnum = pgEnum("reply_sentiment", [
  "unclassified",
  "positive",
  "negative",
  "neutral",
  "not_now",
  "wrong_person",
  "out_of_office",
  "frustrated_or_complaint", // Section 20 hard-stop trigger
]);

export const suppressionReasonEnum = pgEnum("suppression_reason", [
  "opt_out",
  "hard_bounce",
  "spam_complaint",
  "existing_client",
  "manual",
]);

export const activityEventEnum = pgEnum("activity_event_type", [
  "sourced",
  "enriched",
  "sent",
  "opened",
  "clicked",
  "replied",
  "bounced",
  "booked",
  "proposal_sent",
  "contract_sent",
  "deposit_received",
]);

// ---------------------------------------------------------------------------
// users — single-operator auth (Section 13: simple email/password auth)
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// leads — Section 6 schema, verbatim field-for-field
// ---------------------------------------------------------------------------

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(), // lead_id
  companyName: text("company_name"),
  domain: text("domain"),
  contactName: text("contact_name"),
  title: text("title"),
  email: text("email").unique(),
  linkedinUrl: text("linkedin_url"),
  industry: text("industry"),
  companySize: integer("company_size"),
  geo: text("geo"),
  techStack: jsonb("tech_stack").$type<string[]>().default([]),
  hiringSignals: jsonb("hiring_signals").$type<string[]>().default([]),
  fundingStatus: text("funding_status"),
  fitScore: integer("fit_score").default(0),
  serviceTags: jsonb("service_tags").$type<string[]>().default([]),
  sequenceStatus: sequenceStatusEnum("sequence_status").notNull().default("not_started"),
  lastTouchDate: timestamp("last_touch_date", { withTimezone: true }),
  replySentiment: replySentimentEnum("reply_sentiment").notNull().default("unclassified"),
  notes: text("notes"),
  doNotContact: boolean("do_not_contact").notNull().default(false),
  proposalSentDate: timestamp("proposal_sent_date", { withTimezone: true }),
  proposalValue: numeric("proposal_value"),
  referralSource: text("referral_source"),
  clientSinceDate: timestamp("client_since_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// suppression_list — Section 19, checked at SOURCE step, not just SEND
// ---------------------------------------------------------------------------

export const suppressionList = pgTable("suppression_list", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  reason: suppressionReasonEnum("reason").notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// sequences — Section 5 templates, keyed by service line + step
// ---------------------------------------------------------------------------

export const sequences = pgTable("sequences", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceLine: text("service_line").notNull(),
  stepNumber: integer("step_number").notNull(),
  subject: text("subject").notNull(),
  templateBody: text("template_body").notNull(),
  delayDays: integer("delay_days").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// activity_log — every touch on a lead, feeds dashboard + webhook debugging
// ---------------------------------------------------------------------------

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  leadId: uuid("lead_id")
    .notNull()
    .references(() => leads.id, { onDelete: "cascade" }),
  eventType: activityEventEnum("event_type").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  rawPayload: jsonb("raw_payload"),
});

// ---------------------------------------------------------------------------
// daily_stats — denormalized, Section 21 note: don't compute from activity_log
// on every page load
// ---------------------------------------------------------------------------

export const dailyStats = pgTable("daily_stats", {
  date: date("date").primaryKey(),
  leadsSourced: integer("leads_sourced").notNull().default(0),
  emailsSent: integer("emails_sent").notNull().default(0),
  replies: integer("replies").notNull().default(0),
  bounces: integer("bounces").notNull().default(0),
  meetingsBooked: integer("meetings_booked").notNull().default(0),
  sendingPaused: boolean("sending_paused").notNull().default(false), // Section 19 bounce-spike auto-pause
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Sequence = typeof sequences.$inferSelect;
export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type DailyStats = typeof dailyStats.$inferSelect;
export type SuppressionEntry = typeof suppressionList.$inferSelect;
