import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type { ExerciseDone, HepExercise } from "@/db/schema";

const MODEL = "claude-opus-5";

export const aiConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

const client = aiConfigured ? new Anthropic() : null;

/** Shared clinical voice. Kept stable so prompt caching can hit on it. */
const SYSTEM = `You are a documentation assistant working alongside a licensed physiotherapist in an outpatient musculoskeletal clinic.

You write in the register of a working clinician's chart note: specific, measured, and free of marketing language or hedging filler. You use standard physio abbreviations (ROM, AROM, PROM, HEP, NPRS, MMT, WB, ADLs) the way a clinician actually would.

Hard rules:
- Never invent a measurement, test result, or patient statement that is not in the input you were given. If something is not recorded, write "not assessed this visit" rather than guessing.
- When prior-visit data is supplied, reference the change explicitly and numerically (e.g. "knee flexion AROM improved 105° -> 118° since 14 Mar").
- Do not diagnose beyond what the referral or prior notes state, and do not recommend medication.
- Everything you write is a DRAFT that the treating physiotherapist reviews and edits before it enters the record. Write it so that review is fast: no placeholder brackets to fill in, no questions back to the clinician.
- Output plain text or light markdown headings only. No preamble, no sign-off, no "here is the note".`;

type VisitContext = {
  caseReference: string;
  diagnosisSummary: string;
  bodyRegion?: string | null;
  visitNumber: number;
  sessionsAuthorized: number;
  painScore?: number | null;
  romMeasurements: Record<string, number>;
  exercisesDone: ExerciseDone[];
  rawInputText: string;
  priorVisits: {
    date: string;
    painScore?: number | null;
    rom: Record<string, number>;
    note?: string | null;
  }[];
};

function fmtRom(rom: Record<string, number>) {
  const entries = Object.entries(rom ?? {});
  return entries.length ? entries.map(([k, v]) => `${k}: ${v}°`).join(", ") : "none recorded";
}

function fmtExercises(ex: ExerciseDone[]) {
  if (!ex?.length) return "none recorded";
  return ex
    .map(
      (e) =>
        `- ${e.name}${e.sets ? ` ${e.sets}x` : ""}${e.reps ? `${e.reps}` : ""}` +
        `${e.load ? ` @ ${e.load}` : ""}${e.notes ? ` (${e.notes})` : ""}`,
    )
    .join("\n");
}

function priorBlock(ctx: VisitContext) {
  if (!ctx.priorVisits.length) return "This is the initial visit — no prior sessions on record.";
  return ctx.priorVisits
    .slice(0, 6)
    .map(
      (v, i) =>
        `Visit ${ctx.visitNumber - 1 - i} (${v.date}): pain ${v.painScore ?? "n/r"}/10, ROM ${fmtRom(
          v.rom,
        )}${v.note ? `\n  Note excerpt: ${v.note.slice(0, 600)}` : ""}`,
    )
    .join("\n");
}

async function complete(prompt: string, maxTokens = 4000) {
  if (!client) throw new Error("NO_API_KEY");
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: prompt }],
  });

  if (res.stop_reason === "refusal") throw new Error("REFUSED");
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/* ------------------------------------------------------------------ */
/* 1. SOAP note                                                        */
/* ------------------------------------------------------------------ */

export async function generateSoapNote(ctx: VisitContext): Promise<string> {
  const prompt = `Draft the SOAP note for today's physiotherapy session.

PATIENT (de-identified)
Case reference: ${ctx.caseReference}
Working diagnosis: ${ctx.diagnosisSummary}
Body region: ${ctx.bodyRegion ?? "not specified"}
Session ${ctx.visitNumber} of ${ctx.sessionsAuthorized} authorized

TODAY
Pain (NPRS 0-10): ${ctx.painScore ?? "not recorded"}
ROM measured: ${fmtRom(ctx.romMeasurements)}
Exercises performed:
${fmtExercises(ctx.exercisesDone)}

Physio's quick input (voice/typed, unstructured):
"""
${ctx.rawInputText || "(none beyond the structured data above)"}
"""

PRIOR VISIT HISTORY (most recent first)
${priorBlock(ctx)}

Write four sections — Subjective, Objective, Assessment, Plan — under those exact headings.
Objective must list the exercises with sets/reps/load as performed.
Assessment must state progress relative to the prior visit with the actual numbers, and whether the patient is on track for the remaining authorized sessions.
Plan must state what happens next visit and any HEP change.`;

  try {
    return await complete(prompt);
  } catch {
    return offlineSoapNote(ctx);
  }
}

/* ------------------------------------------------------------------ */
/* 2. Home exercise program                                            */
/* ------------------------------------------------------------------ */

const HEP_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    exercises: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          sets: { type: "integer" },
          reps: { type: "string" },
          frequency: { type: "string" },
          instructions: { type: "string" },
          cues: { type: "string" },
        },
        required: ["name", "sets", "reps", "frequency", "instructions", "cues"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "exercises"],
  additionalProperties: false,
} as const;

export async function generateHep(
  ctx: VisitContext,
): Promise<{ summary: string; exercises: HepExercise[] }> {
  const prompt = `Build a home exercise program for this patient to run until their next visit.

Working diagnosis: ${ctx.diagnosisSummary}
Body region: ${ctx.bodyRegion ?? "not specified"}
Current pain (NPRS): ${ctx.painScore ?? "not recorded"}
Current ROM: ${fmtRom(ctx.romMeasurements)}
Performed in clinic today:
${fmtExercises(ctx.exercisesDone)}
Clinician's notes: ${ctx.rawInputText || "(none)"}

Rules:
- 3 to 5 exercises. Progress or regress from what was tolerated in clinic today; do not introduce anything unrelated to the diagnosis.
- Instructions are written for the patient at a lay reading level — plain sentences, no abbreviations, no jargon.
- "cues" is one short line on what good form feels like or what to stop for.
- summary is 1-2 sentences the patient reads at the top of the sheet.`;

  if (!client) return offlineHep(ctx);

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high", format: { type: "json_schema", schema: HEP_SCHEMA } },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: prompt }],
    });
    if (res.stop_reason === "refusal") return offlineHep(ctx);
    const text = res.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return offlineHep(ctx);
    return JSON.parse(text.text);
  } catch {
    return offlineHep(ctx);
  }
}

/* ------------------------------------------------------------------ */
/* 3. Insurance re-authorization report                                */
/* ------------------------------------------------------------------ */

type ReportContext = {
  caseReference: string;
  diagnosisSummary: string;
  insurer?: string | null;
  sessionsUsed: number;
  sessionsAuthorized: number;
  trend: {
    date: string;
    painScore?: number | null;
    rom: Record<string, number>;
  }[];
  latestNote?: string | null;
};

export async function generateInsuranceReport(ctx: ReportContext): Promise<string> {
  const trendLines = ctx.trend
    .map((t) => `${t.date}: pain ${t.painScore ?? "n/r"}/10, ROM ${fmtRom(t.rom)}`)
    .join("\n");

  const prompt = `Draft a progress report requesting continued authorization of physiotherapy.

Payer: ${ctx.insurer ?? "not specified"}
Case reference: ${ctx.caseReference}
Working diagnosis: ${ctx.diagnosisSummary}
Sessions used: ${ctx.sessionsUsed} of ${ctx.sessionsAuthorized} authorized

Objective outcome data across the episode of care (oldest first):
${trendLines || "no visits recorded"}

Most recent clinical note:
"""
${ctx.latestNote?.slice(0, 3000) ?? "(none)"}
"""

Structure the report with these headings:
1. Diagnosis and Referral Summary
2. Objective Outcome Measures — a table or list showing initial value, current value, and change for each measure that has at least two data points
3. Functional Progress to Date
4. Clinical Rationale for Continued Care — tie the requested visits to the remaining measurable deficit, not to time
5. Requested Authorization — state a specific number of additional visits and a frequency
6. Anticipated Discharge Criteria — stated as measurable thresholds

Ground every claim in the data above. Where a measure lacks a baseline, say so rather than implying one.`;

  try {
    return await complete(prompt, 6000);
  } catch {
    return offlineReport(ctx, trendLines);
  }
}

/* ------------------------------------------------------------------ */
/* Offline fallbacks — used when ANTHROPIC_API_KEY is unset or the      */
/* call fails, so the product still demos end to end.                   */
/* ------------------------------------------------------------------ */

function delta(ctx: VisitContext) {
  const prev = ctx.priorVisits[0];
  if (!prev) return "No prior visit to compare against — this is the baseline session.";
  const bits: string[] = [];
  if (typeof ctx.painScore === "number" && typeof prev.painScore === "number") {
    const d = prev.painScore - ctx.painScore;
    bits.push(
      d > 0
        ? `Pain down ${d.toFixed(1)} points (${prev.painScore} -> ${ctx.painScore}/10).`
        : d < 0
          ? `Pain up ${Math.abs(d).toFixed(1)} points (${prev.painScore} -> ${ctx.painScore}/10).`
          : `Pain unchanged at ${ctx.painScore}/10.`,
    );
  }
  for (const [k, v] of Object.entries(ctx.romMeasurements ?? {})) {
    const p = prev.rom?.[k];
    if (typeof p === "number") bits.push(`${k} ${p}° -> ${v}° (${v - p >= 0 ? "+" : ""}${v - p}°).`);
  }
  return bits.join(" ") || "No comparable measures recorded at the prior visit.";
}

function offlineSoapNote(ctx: VisitContext): string {
  return `**Subjective**
Patient attends session ${ctx.visitNumber} of ${ctx.sessionsAuthorized} for ${ctx.diagnosisSummary}. Reported pain ${ctx.painScore ?? "not recorded"}/10 (NPRS). Clinician input this visit: ${ctx.rawInputText || "no additional subjective report recorded."}

**Objective**
ROM: ${fmtRom(ctx.romMeasurements)}.
Exercises performed:
${fmtExercises(ctx.exercisesDone)}

**Assessment**
${delta(ctx)} Presentation remains consistent with ${ctx.diagnosisSummary}. ${ctx.visitNumber >= ctx.sessionsAuthorized - 2 ? "Approaching the authorized session cap — a progress report for re-authorization is indicated." : "Progressing within the current authorization."}

**Plan**
Continue the current plan of care. Progress load/range as tolerated next visit, reassess ROM and NPRS, and update the home exercise program.

_(Offline draft — set ANTHROPIC_API_KEY for a full clinical draft. Review and edit before saving.)_`;
}

function offlineHep(ctx: VisitContext) {
  const base = ctx.exercisesDone.slice(0, 4);
  const exercises: HepExercise[] =
    base.length > 0
      ? base.map((e) => ({
          name: e.name,
          sets: e.sets ?? 3,
          reps: String(e.reps ?? 10),
          frequency: "Once daily",
          instructions: `Repeat the ${e.name.toLowerCase()} you practiced in clinic, moving slowly and stopping short of sharp pain.`,
          cues: "Mild muscle fatigue is fine. Sharp or spreading pain means stop for the day.",
        }))
      : [
          {
            name: "Gentle range-of-motion drill",
            sets: 3,
            reps: "10",
            frequency: "Twice daily",
            instructions:
              "Move the affected joint slowly through as much comfortable range as you have, then return.",
            cues: "Stay inside a pain level of about 3 out of 10.",
          },
        ];
  return {
    summary: `Home program for ${ctx.diagnosisSummary}. Do these until your next appointment and note any day you have to skip.`,
    exercises,
  };
}

function offlineReport(ctx: ReportContext, trendLines: string): string {
  const first = ctx.trend[0];
  const last = ctx.trend[ctx.trend.length - 1];
  return `**1. Diagnosis and Referral Summary**
Case ${ctx.caseReference} — ${ctx.diagnosisSummary}. ${ctx.sessionsUsed} of ${ctx.sessionsAuthorized} authorized visits used.

**2. Objective Outcome Measures**
${trendLines || "No visit data recorded."}
${
  first && last && typeof first.painScore === "number" && typeof last.painScore === "number"
    ? `Pain: ${first.painScore}/10 at baseline -> ${last.painScore}/10 currently (change ${(last.painScore - first.painScore).toFixed(1)}).`
    : "Insufficient paired pain data for a baseline-to-current comparison."
}

**3. Functional Progress to Date**
See the measure list above; narrative synthesis requires clinician review.

**4. Clinical Rationale for Continued Care**
Measurable deficits remain relative to the uninvolved side and to the functional demands of the patient's role.

**5. Requested Authorization**
Requesting additional visits at the current frequency — clinician to specify count.

**6. Anticipated Discharge Criteria**
Discharge on achieving symmetrical range, pain ≤2/10 with functional loading, and independent home program.

_(Offline draft — set ANTHROPIC_API_KEY for a full report. Review and edit before submission.)_`;
}
