# BDE Agent

Lead generation & cold outreach dashboard, built per `../BDE_Agent_Spec.md`. Next.js (App Router) +
Drizzle/Postgres, deployed on Vercel with cron-driven sourcing/enrichment/sending.

## Setup

1. **Database.** Create a free Postgres instance (Neon, Supabase, or Vercel Postgres all work — Section 13).
   Copy `.env.example` to `.env.local` and set `DATABASE_URL`.

2. **Install deps** (already done if you're reading this right after scaffold):
   ```bash
   npm install
   ```

3. **Push the schema:**
   ```bash
   npm run db:push
   ```

4. **Fill in remaining `.env.local` values** — at minimum for a working local dev loop:
   - `NEXTAUTH_SECRET` (any random string — `openssl rand -base64 32`)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` (your dashboard login)
   - `ANTHROPIC_API_KEY` (personalization + reply classification)

   Everything else (Apollo, Hunter, BuiltWith, Instantly, Cal.com, Telegram/Discord) can be added
   later — each integration in `lib/integrations/` throws a clear "X_API_KEY is not set" error until
   configured, and Settings (`/settings`) shows which keys are live.

5. **Seed sequence templates + admin user:**
   ```bash
   npm run db:seed
   ```

6. **Run it:**
   ```bash
   npm run dev
   ```
   Sign in at `/login`, then add a lead manually at `/leads/new` to test scoring/pipeline/dashboard
   before wiring up any scraper (Section 21 build-sequencing note).

## Build order (matches Section 21 of the spec)

1. ✅ DB schema + auth + dashboard shell — this scaffold.
2. Manual lead entry (CRUD) — `/leads/new`, working now with fake data.
3. Wire one integration at a time: Apollo → BuiltWith → Instantly/Smartlead → Cal.com. Each has its
   own file in `lib/integrations/` and its own cron/webhook route already scaffolded — just add the
   API key and test against the real service.
4. Claude API calls (classification, personalization, proposal drafts) — already wired, but tune the
   prompts in `lib/integrations/claude.ts` once you have real reply data.
5. Suppression + escalation rules (Sections 19-20) — already enforced at the API/cron layer
   (`lib/suppression.ts`, hard-stop checks in `app/api/classify-reply/route.ts`) before the first
   real send batch.

## Before running live

Fill in the placeholders that only you can supply — the agent won't source or personalize well
without them:
- `lib/icp.ts` — your real ICP (industries, geographies, decision-maker titles).
- `lib/service-catalog.ts` — your real service catalog and fit-signal keywords.
- `scripts/seed.ts` — the Section 5 email templates are generic skeletons; personalize per service line.
- Section 16/17 of the spec (pricing, proposal terms) — not yet represented in code; wire in once
  you've fixed real numbers, e.g. as fields on the proposal draft endpoint.

## Deploying to Vercel

- Push this repo to GitHub, import into Vercel.
- Set every var from `.env.example` as a Vercel Environment Variable (including `CRON_SECRET` —
  Vercel Cron sends it automatically as a Bearer token, see `lib/cron-auth.ts`).
- `vercel.json` defines the cron schedule (Section 21). **Vercel's free Hobby plan only allows
  daily cron jobs** — so all four crons currently run once/day (source-leads 6:00 UTC, enrich-leads
  6:30 UTC, send-sequences 7:00 UTC, check-bounces 12:00 UTC) instead of the spec's ideal
  hourly send-sequences / every-4h check-bounces. This means send-sequences only catches leads
  whose timezone send-window (Section 2) overlaps 7:00 UTC on a given day — some regions' mornings
  will be missed most days. Upgrade to Vercel Pro (~$20/mo) once revenue starts to unlock
  sub-daily crons and restore the original hourly schedule.
- Point Instantly/Smartlead and Cal.com webhooks at
  `https://<your-domain>/api/webhooks/instantly` and `/api/webhooks/calcom`.

## Project layout

See Section 21 of `BDE_Agent_Spec.md` for the full rationale. Quick map:
- `lib/db/schema.ts` — all tables (leads, suppression_list, sequences, activity_log, daily_stats, users).
- `lib/integrations/` — one file per external API (Apollo, Hunter, BuiltWith, Instantly, Cal.com, Claude).
- `lib/scoring.ts` — fit_score + service_tags logic (Section 1/2).
- `lib/suppression.ts` — Section 19 suppression/dedupe, checked at both source and send.
- `app/(dashboard)/` — the six dashboard views (Section 13).
- `app/api/cron/` — the four scheduled jobs (Section 21).
- `app/api/webhooks/` — Instantly, Cal.com, and an optional Stripe deposit hook.
