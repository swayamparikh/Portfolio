/**
 * Seeds a demo clinic with de-identified cases, visit history and outcome data
 * so the dashboard and charts have something to show on first run.
 *
 *   npm run db:seed
 *
 * Login afterwards with  demo@physioflow.ai / physioflow
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { randomBytes, scryptSync } from "node:crypto";
import * as schema from "../src/db/schema";

const { clinics, physios, patients, visits, outcomeMeasures, hepPlans } = schema;

function hash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

const DEMO_EMAIL = "demo@physioflow.ai";

const CASES = [
  {
    caseReference: "RP-2026-014",
    diagnosisSummary: "Post-op ACL reconstruction, week 6",
    bodyRegion: "Right knee",
    insurer: "BlueCross",
    sessionsAuthorized: 12,
    visits: [
      { pain: 6, rom: { flexion: 92, extension: 5 }, ex: "Quad sets 3x10 — isometric only" },
      { pain: 5, rom: { flexion: 105, extension: 2 }, ex: "Leg press 3x12 @ 30kg — cautious" },
      { pain: 5, rom: { flexion: 110, extension: 0 }, ex: "Leg press 3x12 @ 35kg\nStep downs 3x8 — slight valgus" },
      { pain: 4, rom: { flexion: 114, extension: 0 }, ex: "Leg press 3x12 @ 40kg\nStep downs 3x10 — improving" },
      { pain: 3, rom: { flexion: 118, extension: 0 }, ex: "Leg press 3x12 @ 40kg\nStep downs 3x10 — no valgus\nBike 8min" },
    ],
  },
  {
    caseReference: "RP-2026-021",
    diagnosisSummary: "Subacromial pain syndrome, right shoulder",
    bodyRegion: "Right shoulder",
    insurer: "Aetna",
    sessionsAuthorized: 10,
    visits: [
      { pain: 7, rom: { abduction: 95, flexion: 110 }, ex: "Pendulum 2x20\nIsometric ER 3x10" },
      { pain: 6, rom: { abduction: 112, flexion: 128 }, ex: "Band ER 3x12 — light\nScaption to 90 3x10" },
      { pain: 5, rom: { abduction: 128, flexion: 145 }, ex: "Band ER 3x15\nScaption 3x12 @ 2kg" },
      { pain: 4, rom: { abduction: 145, flexion: 158 }, ex: "Band ER 3x15\nScaption 3x12 @ 3kg\nWall slides 3x10" },
    ],
  },
  {
    caseReference: "RP-2026-033",
    diagnosisSummary: "Chronic non-specific low back pain, 8 months",
    bodyRegion: "Lumbar spine",
    insurer: "UnitedHealthcare",
    sessionsAuthorized: 8,
    visits: [
      { pain: 6, rom: { "lumbar flexion": 40 }, ex: "Cat-camel 2x10\nDead bug 3x8" },
      { pain: 6, rom: { "lumbar flexion": 46 }, ex: "Dead bug 3x10\nGlute bridge 3x12" },
      { pain: 5, rom: { "lumbar flexion": 52 }, ex: "Dead bug 3x12\nGlute bridge 3x15\nSuitcase carry 3x20m" },
      { pain: 4, rom: { "lumbar flexion": 58 }, ex: "Hip hinge 3x10 @ 20kg\nSuitcase carry 3x30m" },
      { pain: 4, rom: { "lumbar flexion": 60 }, ex: "Hip hinge 3x10 @ 25kg\nSuitcase carry 3x30m\nBird dog 3x10" },
      { pain: 3, rom: { "lumbar flexion": 64 }, ex: "Hip hinge 3x10 @ 30kg\nFarmer carry 3x40m" },
    ],
  },
];

function parseEx(raw: string) {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [main, ...note] = line.split(/\s+[—–-]\s+/);
      const sr = main.match(/(\d+)\s*[x×]\s*(\d+)/i);
      const load = main.match(/@\s*([\w.]+\s*\w*)/);
      return {
        name: main.replace(/(\d+)\s*[x×]\s*(\d+)/i, "").replace(/@\s*[\w.]+\s*\w*/, "").trim(),
        sets: sr ? Number(sr[1]) : undefined,
        reps: sr ? Number(sr[2]) : undefined,
        load: load ? load[1].trim() : undefined,
        notes: note.join(" - ") || undefined,
      };
    });
}

async function main() {
  const existing = await db.select().from(physios).where(eq(physios.email, DEMO_EMAIL)).limit(1);
  if (existing.length) {
    console.log("Demo clinic already seeded. Delete the clinic row to re-seed.");
    return;
  }

  const [clinic] = await db.insert(clinics).values({ name: "Riverside Physiotherapy" }).returning();
  const [physio] = await db
    .insert(physios)
    .values({
      clinicId: clinic.id,
      name: "Alex Moore",
      email: DEMO_EMAIL,
      passwordHash: hash("physioflow"),
      role: "owner",
    })
    .returning();

  for (const c of CASES) {
    const [patient] = await db
      .insert(patients)
      .values({
        clinicId: clinic.id,
        caseReference: c.caseReference,
        diagnosisSummary: c.diagnosisSummary,
        bodyRegion: c.bodyRegion,
        insurer: c.insurer,
        sessionsAuthorized: c.sessionsAuthorized,
      })
      .returning();

    const spacing = 4; // days between visits
    const total = c.visits.length;

    for (let i = 0; i < total; i++) {
      const v = c.visits[i];
      const date = new Date(Date.now() - (total - 1 - i) * spacing * 864e5);
      const exercises = parseEx(v.ex);

      const [visit] = await db
        .insert(visits)
        .values({
          patientId: patient.id,
          physioId: physio.id,
          visitDate: date,
          painScore: v.pain,
          romMeasurements: v.rom,
          exercisesDone: exercises,
          rawInputText: `Session ${i + 1}. Tolerating load well.`,
          aiGeneratedNote: `**Subjective**\nSession ${i + 1} of ${c.sessionsAuthorized} for ${c.diagnosisSummary}. Reported pain ${v.pain}/10 (NPRS).\n\n**Objective**\nROM: ${Object.entries(v.rom).map(([k, val]) => `${k} ${val}°`).join(", ")}.\n${exercises.map((e) => `- ${e.name} ${e.sets}x${e.reps}${e.load ? ` @ ${e.load}` : ""}`).join("\n")}\n\n**Assessment**\nProgressing within the current plan of care.\n\n**Plan**\nContinue progression, reassess ROM and NPRS next visit.`,
          reviewed: i < total - 1,
          finalNote: null,
        })
        .returning();

      const measures = [
        {
          patientId: patient.id,
          visitId: visit.id,
          measureType: "pain_scale",
          label: "NPRS",
          value: v.pain,
          unit: "/10",
          recordedAt: date,
        },
        ...Object.entries(v.rom).map(([label, value]) => ({
          patientId: patient.id,
          visitId: visit.id,
          measureType: "rom",
          label,
          value,
          unit: "deg",
          recordedAt: date,
        })),
      ];
      await db.insert(outcomeMeasures).values(measures);
    }

    // A sent HEP on the first case so adherence UI has something real.
    if (c.caseReference === "RP-2026-014") {
      await db.insert(hepPlans).values({
        patientId: patient.id,
        summary:
          "Do these once a day between now and your next appointment. Some muscle fatigue is expected — sharp knee pain is not.",
        exercises: [
          {
            name: "Sit-to-stand from a chair",
            sets: 3,
            reps: "10",
            frequency: "Once daily",
            instructions:
              "Sit on a firm chair with feet flat. Stand up without using your hands, then lower slowly back down over three seconds.",
            cues: "Keep your kneecap tracking over your second toe on the way down.",
          },
          {
            name: "Heel slides",
            sets: 3,
            reps: "12",
            frequency: "Twice daily",
            instructions:
              "Lying on your back, slide your heel toward your bottom until you feel a gentle stretch, hold two seconds, then slide back out.",
            cues: "Stretch, not pain. Stop before it turns sharp.",
          },
          {
            name: "Step downs",
            sets: 3,
            reps: "10",
            frequency: "Once daily",
            instructions:
              "Stand on a low step. Lower the opposite heel slowly toward the floor, tap lightly, then press back up.",
            cues: "Watch your knee in a mirror — it should not drift inward.",
          },
        ],
        reviewed: true,
        sentAt: new Date(Date.now() - 3 * 864e5),
        sentChannel: "sms",
        adherenceLog: [
          { date: new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10), completed: true },
          { date: new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10), completed: true },
          { date: new Date(Date.now() - 1 * 864e5).toISOString().slice(0, 10), completed: false },
        ],
      });
    }
  }

  console.log("Seeded Riverside Physiotherapy.");
  console.log("  Login:    demo@physioflow.ai");
  console.log("  Password: physioflow");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
