import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  boolean,
  jsonb,
  real,
  index,
} from "drizzle-orm/pg-core";

export const clinics = pgTable("clinics", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const physios = pgTable(
  "physios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("physio"), // physio | owner
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("physios_clinic_idx").on(t.clinicId)],
);

export const sessionsTable = pgTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(), // random token stored in cookie
    physioId: uuid("physio_id")
      .notNull()
      .references(() => physios.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("auth_sessions_physio_idx").on(t.physioId)],
);

/**
 * v1 stores de-identified patients only: a case_reference code, never a real name.
 * Phase 2 (post-BAA) is when real PHI columns get added — see spec §7.
 */
export const patients = pgTable(
  "patients_deidentified",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    caseReference: text("case_reference").notNull(),
    diagnosisSummary: text("diagnosis_summary").notNull(),
    bodyRegion: text("body_region"),
    sessionsAuthorized: integer("sessions_authorized").notNull().default(12),
    insurer: text("insurer"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("patients_clinic_idx").on(t.clinicId)],
);

export type ExerciseDone = {
  name: string;
  sets?: number;
  reps?: number;
  load?: string;
  notes?: string;
};

export const visits = pgTable(
  "visits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    physioId: uuid("physio_id")
      .notNull()
      .references(() => physios.id),
    visitDate: timestamp("visit_date", { withTimezone: true }).defaultNow().notNull(),
    exercisesDone: jsonb("exercises_done").$type<ExerciseDone[]>().default([]).notNull(),
    painScore: real("pain_score"),
    romMeasurements: jsonb("rom_measurements")
      .$type<Record<string, number>>()
      .default({})
      .notNull(),
    rawInputText: text("raw_input_text").notNull().default(""),
    aiGeneratedNote: text("ai_generated_note"),
    finalNote: text("final_note"),
    reviewed: boolean("reviewed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("visits_patient_idx").on(t.patientId)],
);

export type HepExercise = {
  name: string;
  sets: number;
  reps: string;
  frequency: string;
  instructions: string;
  cues?: string;
};

export const hepPlans = pgTable(
  "hep_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    generatedFromVisitId: uuid("generated_from_visit_id").references(() => visits.id, {
      onDelete: "set null",
    }),
    exercises: jsonb("exercises").$type<HepExercise[]>().default([]).notNull(),
    summary: text("summary"),
    reviewed: boolean("reviewed").notNull().default(false),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    sentChannel: text("sent_channel"), // sms | email
    adherenceLog: jsonb("adherence_log")
      .$type<{ date: string; completed: boolean }[]>()
      .default([])
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("hep_patient_idx").on(t.patientId)],
);

export const outcomeMeasures = pgTable(
  "outcome_measures",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    visitId: uuid("visit_id").references(() => visits.id, { onDelete: "cascade" }),
    measureType: text("measure_type").notNull(), // pain_scale | rom | strength | other
    label: text("label").notNull().default(""),
    value: real("value").notNull(),
    unit: text("unit"),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("outcomes_patient_idx").on(t.patientId)],
);

export const insuranceReports = pgTable(
  "insurance_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    sessionsUsed: integer("sessions_used").notNull().default(0),
    sessionsAuthorized: integer("sessions_authorized").notNull().default(0),
    aiGeneratedReport: text("ai_generated_report"),
    finalReport: text("final_report"),
    reviewedByPhysioId: uuid("reviewed_by_physio_id").references(() => physios.id),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("reports_patient_idx").on(t.patientId)],
);

/** Append-only audit trail — required before Phase 2 real-PHI handling (spec §7). */
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  physioId: uuid("physio_id").references(() => physios.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  meta: jsonb("meta").$type<Record<string, unknown>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Clinic = typeof clinics.$inferSelect;
export type Physio = typeof physios.$inferSelect;
export type Patient = typeof patients.$inferSelect;
export type Visit = typeof visits.$inferSelect;
export type HepPlan = typeof hepPlans.$inferSelect;
export type OutcomeMeasure = typeof outcomeMeasures.$inferSelect;
export type InsuranceReport = typeof insuranceReports.$inferSelect;
