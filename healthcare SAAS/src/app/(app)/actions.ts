"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLog,
  hepPlans,
  insuranceReports,
  outcomeMeasures,
  patients,
  visits,
  type ExerciseDone,
} from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { generateHep, generateInsuranceReport, generateSoapNote } from "@/lib/ai";
import { cleanupRawInput } from "@/lib/cloudflare";

async function audit(
  physioId: string,
  action: string,
  entity: string,
  entityId?: string,
  meta: Record<string, unknown> = {},
) {
  await db.insert(auditLog).values({ physioId, action, entity, entityId, meta });
}

/** Confirms the patient belongs to the signed-in user's clinic. */
async function patientForUser(patientId: string, clinicId: string) {
  const [p] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, patientId), eq(patients.clinicId, clinicId)))
    .limit(1);
  if (!p) throw new Error("NOT_FOUND");
  return p;
}

/* ------------------------------- patients ------------------------------- */

export async function createPatient(_prev: unknown, form: FormData) {
  const user = await requireUser();
  const caseReference = String(form.get("caseReference") ?? "").trim();
  const diagnosisSummary = String(form.get("diagnosisSummary") ?? "").trim();
  const bodyRegion = String(form.get("bodyRegion") ?? "").trim() || null;
  const insurer = String(form.get("insurer") ?? "").trim() || null;
  const sessionsAuthorized = Number(form.get("sessionsAuthorized") ?? 12);

  if (!caseReference || !diagnosisSummary) {
    return { error: "Case reference and working diagnosis are required." };
  }
  if (!Number.isFinite(sessionsAuthorized) || sessionsAuthorized < 1) {
    return { error: "Authorized sessions must be a positive number." };
  }

  const [p] = await db
    .insert(patients)
    .values({
      clinicId: user.clinicId,
      caseReference,
      diagnosisSummary,
      bodyRegion,
      insurer,
      sessionsAuthorized,
    })
    .returning();

  await audit(user.id, "patient.create", "patient", p.id, { caseReference });
  revalidatePath("/patients");
  redirect(`/patients/${p.id}`);
}

/* -------------------------------- visits -------------------------------- */

function parseExercises(raw: string): ExerciseDone[] {
  // One exercise per line: "Leg press 3x12 @ 40kg — good form"
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [main, ...noteParts] = line.split(/\s+[—–-]\s+/);
      const setsReps = main.match(/(\d+)\s*[x×]\s*(\d+)/i);
      const load = main.match(/@\s*([\w.]+\s*\w*)/);
      const name = main
        .replace(/(\d+)\s*[x×]\s*(\d+)/i, "")
        .replace(/@\s*[\w.]+\s*\w*/, "")
        .trim();
      return {
        name: name || main.trim(),
        sets: setsReps ? Number(setsReps[1]) : undefined,
        reps: setsReps ? Number(setsReps[2]) : undefined,
        load: load ? load[1].trim() : undefined,
        notes: noteParts.join(" - ") || undefined,
      };
    });
}

function parseRom(raw: string): Record<string, number> {
  // "flexion 118, extension 0" or one per line
  const out: Record<string, number> = {};
  raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((seg) => {
      const m = seg.match(/^(.+?)[:\s]+(-?\d+(?:\.\d+)?)/);
      if (m) out[m[1].trim()] = Number(m[2]);
    });
  return out;
}

export async function logVisit(_prev: unknown, form: FormData) {
  const user = await requireUser();
  const patientId = String(form.get("patientId") ?? "");
  if (!patientId) return { error: "Choose a patient first." };

  const patient = await patientForUser(patientId, user.clinicId);

  const painRaw = form.get("painScore");
  const painScore = painRaw === null || painRaw === "" ? null : Number(painRaw);
  const romMeasurements = parseRom(String(form.get("rom") ?? ""));
  const exercisesDone = parseExercises(String(form.get("exercises") ?? ""));
  const rawInputText = String(form.get("rawInputText") ?? "").trim();

  if (painScore !== null && (painScore < 0 || painScore > 10)) {
    return { error: "Pain score must be between 0 and 10." };
  }

  const prior = await db
    .select()
    .from(visits)
    .where(eq(visits.patientId, patientId))
    .orderBy(desc(visits.visitDate))
    .limit(6);

  const [{ value: visitCount }] = await db
    .select({ value: count() })
    .from(visits)
    .where(eq(visits.patientId, patientId));

  // Cheap pass over Workers AI to turn shorthand fragments into full
  // sentences before Claude drafts the note — falls back to the raw text
  // untouched if Cloudflare isn't configured or the call fails.
  const cleanedInput = await cleanupRawInput(rawInputText);

  const note = await generateSoapNote({
    caseReference: patient.caseReference,
    diagnosisSummary: patient.diagnosisSummary,
    bodyRegion: patient.bodyRegion,
    visitNumber: visitCount + 1,
    sessionsAuthorized: patient.sessionsAuthorized,
    painScore,
    romMeasurements,
    exercisesDone,
    rawInputText: cleanedInput,
    priorVisits: prior.map((v) => ({
      date: v.visitDate.toISOString().slice(0, 10),
      painScore: v.painScore,
      rom: v.romMeasurements,
      note: v.finalNote ?? v.aiGeneratedNote,
    })),
  });

  const [visit] = await db
    .insert(visits)
    .values({
      patientId,
      physioId: user.id,
      painScore,
      romMeasurements,
      exercisesDone,
      rawInputText,
      aiGeneratedNote: note,
      reviewed: false,
    })
    .returning();

  // Outcome measures feed the progress chart and the re-auth report.
  const measures = [];
  if (painScore !== null) {
    measures.push({
      patientId,
      visitId: visit.id,
      measureType: "pain_scale",
      label: "NPRS",
      value: painScore,
      unit: "/10",
    });
  }
  for (const [label, value] of Object.entries(romMeasurements)) {
    measures.push({ patientId, visitId: visit.id, measureType: "rom", label, value, unit: "deg" });
  }
  if (measures.length) await db.insert(outcomeMeasures).values(measures);

  await audit(user.id, "visit.create", "visit", visit.id, { patientId });
  revalidatePath(`/patients/${patientId}`);
  redirect(`/patients/${patientId}?visit=${visit.id}#note`);
}

export async function saveNote(formData: FormData) {
  const user = await requireUser();
  const visitId = String(formData.get("visitId"));
  const finalNote = String(formData.get("finalNote") ?? "");
  const patientId = String(formData.get("patientId"));

  await patientForUser(patientId, user.clinicId);
  await db
    .update(visits)
    .set({ finalNote, reviewed: true })
    .where(eq(visits.id, visitId));

  await audit(user.id, "visit.review", "visit", visitId);
  revalidatePath(`/patients/${patientId}`);
}

/* --------------------------------- HEP ---------------------------------- */

export async function buildHep(formData: FormData) {
  const user = await requireUser();
  const patientId = String(formData.get("patientId"));
  const visitId = String(formData.get("visitId"));
  const patient = await patientForUser(patientId, user.clinicId);

  const [visit] = await db.select().from(visits).where(eq(visits.id, visitId)).limit(1);
  if (!visit) throw new Error("NOT_FOUND");

  const hep = await generateHep({
    caseReference: patient.caseReference,
    diagnosisSummary: patient.diagnosisSummary,
    bodyRegion: patient.bodyRegion,
    visitNumber: 1,
    sessionsAuthorized: patient.sessionsAuthorized,
    painScore: visit.painScore,
    romMeasurements: visit.romMeasurements,
    exercisesDone: visit.exercisesDone,
    rawInputText: visit.rawInputText,
    priorVisits: [],
  });

  const [plan] = await db
    .insert(hepPlans)
    .values({
      patientId,
      generatedFromVisitId: visitId,
      exercises: hep.exercises,
      summary: hep.summary,
    })
    .returning();

  await audit(user.id, "hep.create", "hep_plan", plan.id, { patientId });
  revalidatePath(`/patients/${patientId}`);
}

export async function sendHep(formData: FormData) {
  const user = await requireUser();
  const planId = String(formData.get("planId"));
  const patientId = String(formData.get("patientId"));
  const channel = String(formData.get("channel") ?? "email");
  await patientForUser(patientId, user.clinicId);

  // Delivery integration (Twilio / Resend) plugs in here. The physio's explicit
  // click is the human-in-the-loop gate — nothing leaves automatically.
  await db
    .update(hepPlans)
    .set({ reviewed: true, sentAt: new Date(), sentChannel: channel })
    .where(eq(hepPlans.id, planId));

  await audit(user.id, "hep.send", "hep_plan", planId, { channel });
  revalidatePath(`/patients/${patientId}`);
}

/* ---------------------------- insurance report --------------------------- */

export async function draftReport(formData: FormData) {
  const user = await requireUser();
  const patientId = String(formData.get("patientId"));
  const patient = await patientForUser(patientId, user.clinicId);

  const history = await db
    .select()
    .from(visits)
    .where(eq(visits.patientId, patientId))
    .orderBy(asc(visits.visitDate));

  const latest = history[history.length - 1];

  const report = await generateInsuranceReport({
    caseReference: patient.caseReference,
    diagnosisSummary: patient.diagnosisSummary,
    insurer: patient.insurer,
    sessionsUsed: history.length,
    sessionsAuthorized: patient.sessionsAuthorized,
    trend: history.map((v) => ({
      date: v.visitDate.toISOString().slice(0, 10),
      painScore: v.painScore,
      rom: v.romMeasurements,
    })),
    latestNote: latest?.finalNote ?? latest?.aiGeneratedNote ?? null,
  });

  const [row] = await db
    .insert(insuranceReports)
    .values({
      patientId,
      sessionsUsed: history.length,
      sessionsAuthorized: patient.sessionsAuthorized,
      aiGeneratedReport: report,
    })
    .returning();

  await audit(user.id, "report.draft", "insurance_report", row.id, { patientId });
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/reports");
}

export async function saveReport(formData: FormData) {
  const user = await requireUser();
  const reportId = String(formData.get("reportId"));
  const patientId = String(formData.get("patientId"));
  const finalReport = String(formData.get("finalReport") ?? "");
  const markSubmitted = formData.get("submit") === "1";
  await patientForUser(patientId, user.clinicId);

  await db
    .update(insuranceReports)
    .set({
      finalReport,
      reviewedByPhysioId: user.id,
      ...(markSubmitted ? { submittedAt: new Date() } : {}),
    })
    .where(eq(insuranceReports.id, reportId));

  await audit(user.id, markSubmitted ? "report.submit" : "report.review", "insurance_report", reportId);
  revalidatePath(`/patients/${patientId}`);
  revalidatePath("/reports");
}
