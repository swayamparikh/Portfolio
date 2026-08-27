# PhysioFlow AI

AI that turns each physiotherapy session into a structured SOAP note, tracks patient
exercise progress across visits, and drafts the insurance progress reports that keep
sessions authorized.

Built to the spec in [`physioflow-ai-spec.md`](./physioflow-ai-spec.md).

## Run it

```bash
npm install
npm run db:push     # creates the tables in Neon
npm run db:seed     # optional: demo clinic with 3 cases and visit history
npm run dev
```

Open http://localhost:3000

Seeded login: **demo@physioflow.ai** / **physioflow**

## Environment

`.env.local` is already populated with the Neon connection string.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | Neon Postgres (already set) |
| `ANTHROPIC_API_KEY` | no | Claude drafting. **Without it the app runs in offline drafting mode** — a deterministic template drafter fills in for Claude so every screen still works end to end. |
| `AUTH_SECRET` | yes | Change before deploying |

## What's built

| Spec item | Where |
|---|---|
| Fast session note generation | `/visits/new` → `generateSoapNote()` in `src/lib/ai.ts`. Reads the last 6 visits and references the delta numerically. |
| HEP builder | Patient page → "Generate from latest visit". Structured JSON output, patient-readable language. |
| Progress tracking dashboard | `ProgressChart` on the patient page — pain and every ROM measure plotted across the episode of care. Hand-rolled SVG, no chart library. |
| Insurance report drafting | Patient page → "Draft re-authorization report". Built from accumulated outcome data; flagged automatically within 2 visits of the cap. |
| Human in the loop | Every AI output lands in a review editor. Notes save only on approval, HEPs send only on an explicit click, reports are never transmitted — you copy them into your payer portal. |
| Phase 1 compliance | Patients are `patients_deidentified` — case reference codes only, no PHI columns. `audit_log` table is wired and recording from day one. |

## Stack

Next.js 15 (App Router) · Neon Postgres · Drizzle ORM · Claude API (`claude-opus-5`,
adaptive thinking) · Tailwind CSS v4 · Deploys to Vercel as-is.

## Deploying

Push to a Git repo, import into Vercel, and set `DATABASE_URL`, `ANTHROPIC_API_KEY`
and `AUTH_SECRET` as environment variables. Move to Vercel Pro before any real
patient data — see spec §7 Phase 2.

## Not built (deliberately out of scope for v1)

Full EHR replacement, wearables/motion-capture ROM, and automated insurance
submission — per spec §4. SMS/email delivery for HEPs records the send and is where
Twilio/Resend plugs in (`sendHep` in `src/app/(app)/actions.ts`).

---

Clinical drafts require review by a licensed physiotherapist before entering a
patient record.
