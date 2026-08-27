# PhysioFlow AI — Product & Build Spec

## 1. One-line pitch
AI that turns each physiotherapy session into a structured clinical note automatically, tracks patient exercise progress across visits, and drafts the insurance progress reports needed to keep sessions authorized — cutting a physio's after-hours charting to minutes.

## 2. The problem
Physiotherapy clinics run on high patient volume with **recurring visits** — the same patients coming back 1-3x/week for weeks or months of an exercise-based treatment plan. That recurring structure creates three compounding pain points:

- **Documentation fatigue.** After every single session, the physio has to write a SOAP note (Subjective, Objective, Assessment, Plan) — what exercises were done, pain levels, range of motion, progress vs. last visit, plan for next session. Multiply by 10-15 patients/day and this becomes hours of after-hours charting — one of the top reasons physios burn out.
- **Poor visibility into patient progress between visits.** Physios prescribe home exercise programs (HEPs), but have almost no reliable way to know if patients actually did them, which hurts outcomes and makes it hard to show progress.
- **Insurance re-authorization pressure.** Most insurers cap the number of covered PT sessions and require a progress report with functional outcome data (pain scores, ROM, strength) to approve additional visits. Writing these reports well, and on time, is a recurring administrative tax on top of daily notes.

This is repetitive, structured, document-heavy work tied to data the clinic already has (session notes, outcome measures) — a strong fit for AI drafting with a human reviewing before anything is finalized.

## 3. Target customer
- **Primary buyer:** Clinic owner or lead physiotherapist at a small-to-mid size physiotherapy clinic (1-10 physios).
- **End users:** Practicing physiotherapists (the ones writing notes every session).
- **Champion:** Your physio contacts — they can validate the pain directly (they feel it themselves) and introduce you to clinic owners, which is a much shorter path than orthopedics since the buyer and the user are often the same person or in the same small office.

## 4. Core MVP features
1. **Fast session note generation** — Physio enters quick structured/voice input during or right after a session (exercises done, sets/reps, pain level, notes on form/progress). AI drafts a full, properly formatted SOAP note in seconds, referencing the patient's prior visits for continuity ("improved from last session's ROM of X to Y").
2. **Home exercise program (HEP) builder** — AI generates a personalized home exercise plan based on the diagnosis/session goals, with clear instructions, and can text/email it to the patient with simple reminders (e.g. "did you do today's exercises?").
3. **Progress tracking dashboard** — Pain scale, range of motion, and functional outcome measures plotted across visits per patient, so the physio (and the clinic) can see the trend line, not just today's note.
4. **Insurance progress report drafting** — When a patient nears their session cap, AI drafts the re-authorization progress report using the accumulated visit data and outcome trends — the physio reviews and submits it instead of writing it from scratch.
5. **Human-in-the-loop always** — Every AI-drafted note or report is reviewed/edited by the physio before it's saved to the patient record or sent anywhere. Nothing auto-submits.

### Explicitly out of scope for v1
- Full EHR/practice-management system replacement — this complements existing scheduling/billing tools, it doesn't replace them, at least initially.
- Wearables/motion-capture integration for objective ROM measurement — interesting later, not needed to prove the core value.
- Automated insurance submission — keep a human click in the loop for anything sent externally.

## 5. Why this is defensible / unique
- Most "AI documentation" tools target doctors' visits generally. This is tuned specifically to **physio's repeat-visit structure** — every note references and builds on the prior visit automatically, which generic scribe tools don't do well.
- Combining daily notes + HEP adherence + insurance progress reports in one flow means the data compounds: today's session note feeds tomorrow's HEP suggestion and next month's re-authorization report, instead of three disconnected tools.
- Your physio contacts let you build this with real clinicians validating note quality from day one — accuracy and "does this sound like a real clinical note" matters enormously here, and generic AI tools get this wrong without physio-specific tuning.

## 6. Suggested pitch angle to your physio contacts
Frame it as time given back, not "AI in healthcare": *"I'm building a tool that turns your session notes into a draft automatically so you're not charting until 9pm — want to try it on a few patients and tell me if the notes are actually good?"* Physios feel the charting burden personally, so they're a much faster yes than a practice manager evaluating ROI from a spreadsheet. Once 1-2 physios are using it and like it, ask them to introduce you to the clinic owner for a paid pilot across the practice.

## 7. Compliance approach (phased — don't skip this)
- **Phase 1 (validation, weeks 1-4):** Use de-identified/synthetic sample sessions only, or have your physio contacts test with dummy patients. Prove note quality and get feedback before touching real records.
- **Phase 2 (pilot, first real clinic):** Before handling real patient data — sign a Business Associate Agreement (BAA) with the clinic, use HIPAA-eligible hosting, encrypt data at rest/in transit, add audit logging, minimize retention.
- **Phase 3 (scale):** Formal SOC 2 once you have multiple paying clinics — don't over-invest in this before product-market fit.

## 8. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend + app framework | Next.js (App Router) | Deployed on Vercel |
| Hosting | Vercel | Free/hobby tier fine for MVP; upgrade to Pro when handling real patient data |
| Database | Postgres via Neon | Serverless Postgres, generous free tier, clean Vercel integration |
| ORM | Drizzle (or Prisma) | Drizzle pairs well with Neon's serverless driver |
| AI — note & report drafting | Anthropic Claude API | Core value of the product — long-context clinical reasoning, references prior visits, drafts SOAP notes and progress reports |
| AI — lightweight tasks (voice transcription cleanup, quick classification) | Cloudflare Workers AI (free tier) | Cheap/fast for auxiliary tasks so you're not spending Claude tokens on simple transcription cleanup |
| File/audio storage | Cloudflare R2 (free tier) or Vercel Blob | For voice notes or uploaded session data, if used |
| Auth | Clerk or Auth.js | Clinic-level accounts, physio roles |
| Patient reminders (HEP nudges) | Twilio (SMS) or Resend (email) | Simple exercise reminders, no need for a full patient app in v1 |

## 9. Data model (initial draft)

```
clinics
  id, name, created_at

physios
  id, clinic_id, name, email, created_at

patients_deidentified   -- v1: use case_reference codes, no real PHI until Phase 2
  id, clinic_id, case_reference, diagnosis_summary, created_at

visits
  id, patient_ref_id, physio_id, visit_date,
  exercises_done (jsonb), pain_score, rom_measurements (jsonb),
  raw_input_text, ai_generated_note, reviewed (bool), created_at

hep_plans
  id, patient_ref_id, generated_from_visit_id, exercises (jsonb),
  sent_at, adherence_log (jsonb)

outcome_measures
  id, patient_ref_id, visit_id, measure_type (pain_scale | rom | strength | other),
  value, recorded_at

insurance_reports
  id, patient_ref_id, sessions_used, sessions_authorized,
  ai_generated_report, reviewed_by_physio_id, submitted_at
```

## 10. MVP build order (suggested for Claude Code sessions)
1. Scaffold Next.js app on Vercel, connect Neon Postgres, set up Drizzle schema from Section 9.
2. Auth + clinic/physio roles (Clerk).
3. Patient + visit CRUD — create a patient (de-identified), log a visit with quick structured input.
4. Claude API integration: given today's visit input + prior visit history, generate a draft SOAP note that references progress since last time.
5. HEP builder: generate a home exercise plan from diagnosis + session notes, with a simple send-via-SMS/email flow.
6. Progress dashboard: chart pain score / ROM / outcome measures over visits per patient.
7. Insurance progress report drafting: pull visit history + outcome trend, draft the re-authorization report.
8. Review/edit UI for every AI output before it's saved/sent — no auto-submission anywhere.

## 11. Validation plan (before writing more than a prototype)
1. Get 20-30 minutes with 3-5 physios via your contacts — ideally ones who actively complain about after-hours charting.
2. Show them a mock session: quick input → AI-drafted SOAP note, and ask them directly: "Would you trust this enough to just review and save, or would you rewrite it?"
3. Ask: "What would you pay per month to get your evenings back?" and "What would stop you from using this daily?" (Common blockers: EHR integration, note accuracy, clinic's existing software lock-in.)
4. If 2+ want to keep using it, offer a free/discounted pilot in exchange for using it on real (de-identified first, then real-with-BAA) patients and honest feedback — this becomes your first case study for pitching clinic owners.

## 12. Alternative/adjacent angles worth keeping in your back pocket
If daily documentation doesn't land first, these are close-adjacent pain points with the same buyer:
- **Pure HEP adherence tool** — smaller scope, just exercise plans + reminders + a simple compliance dashboard, faster to build and pitch.
- **Insurance re-authorization drafting only** — narrower than full documentation, but very high-value per instance since a denied re-auth means the patient's treatment (and the clinic's revenue) stops.
- **New patient intake automation** — AI-assisted intake forms that pre-populate the first visit's assessment, reducing first-session admin time.
