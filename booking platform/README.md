# Nestly — Idea & Concept by Swayam Parikh

*"Book stays, not stress."*

An Airbnb-style stay marketplace built to demonstrate a genuinely complex, multi-role,
stateful system — real-time availability, double-booking prevention at the database
level, Stripe Connect payment splitting, and an AI layer most clone tutorials skip.
Full spec: [`Nestly-Booking-Platform-Spec.md`](./Nestly-Booking-Platform-Spec.md).

## Stack

Next.js 16 (App Router) + TypeScript, Tailwind CSS v4, Prisma + PostgreSQL/PostGIS,
NextAuth v5 (Credentials + Google), Stripe Connect, Groq (AI layer), Framer Motion.

## What's implemented

- **Guest**: search + filters, listing detail with AI review summary, real-time
  availability calendar, booking + Stripe PaymentIntent flow, trips dashboard,
  cancellation with refund-window policy, in-app messaging.
- **Host**: listing wizard with AI description generator, availability/pricing
  calendar with AI smart-pricing suggestions, booking inbox (accept/decline),
  earnings/payouts, Stripe Connect onboarding.
- **Admin**: listing approval queue, user suspend/reinstate, platform analytics
  (GMV, commission revenue, active listings), configurable commission rate.
- **Correctness**: a Postgres `EXCLUDE USING gist` constraint on `bookings`
  (see `prisma/sql/constraints.sql`) makes double-booking impossible at the DB
  level even under concurrent requests — this is the load-bearing guarantee
  called out in Section 7 of the spec, not just an app-level check.

## Getting started

1. **Provision a Postgres database that supports PostGIS** — Supabase or Neon
   both work and are free-tier friendly.
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` at minimum. Every
   other key (Stripe, Groq, Google OAuth, Cloudinary, Mapbox) is optional —
   every integration degrades gracefully without one (see "Running without
   API keys" below).
3. Install dependencies and set up the database:

   ```bash
   npm install
   npm run db:migrate      # applies the Prisma schema
   npm run db:constraints  # PostGIS + EXCLUDE constraint (or: psql "$DATABASE_URL" -f prisma/sql/constraints.sql)
   npm run db:seed         # demo listings, bookings, reviews, users
   npm run dev
   ```

4. Log in with any seeded demo account (password `password123`):
   - `admin@nestly.demo` — admin dashboard
   - `host1@nestly.demo` / `host2@nestly.demo` / `host3@nestly.demo` — host dashboard
   - `guest1@nestly.demo` … `guest4@nestly.demo` — guest flows

## Demo flow (matches Section 12 of the spec)

Search a location → open a listing and see its AI review summary → book with
Stripe test mode → switch to the host view and see the booking plus an
AI price suggestion on the calendar → switch to the admin view and see
platform analytics. All three roles, one flow.

## Running without API keys

Every third-party integration is written to degrade gracefully rather than
crash, so the core product is demoable immediately after seeding:

| Integration | Without a key |
|---|---|
| Stripe (`STRIPE_SECRET_KEY`) | Bookings are created as `pending` without a real PaymentIntent; host payout transfers no-op. |
| Groq (`GROQ_API_KEY`) | AI trip parsing, pricing, review summaries, and description generation fall back to deterministic heuristics instead of calling the LLM. |
| Google OAuth | The credentials (email/password) provider still works. |
| Cloudinary / Mapbox | Not wired into the UI yet — listing photos are plain image URLs, and there's no map view (see "Not yet built"). |

## Not yet built

- Map view toggle on search (Mapbox/Google Maps) — spec Stage 8 polish item.
- Two-way review *submission* UI (reviews render on listing pages once
  seeded/created, but there's no guest-facing "leave a review" form yet).
- Persisted wishlist (currently a placeholder page — no `wishlists` table).
- Transactional emails (Resend) for booking confirmations/reminders.
- Photo upload via Cloudinary/Uploadthing — the host listing form currently
  accepts direct image URLs.

## Project structure

```
prisma/schema.prisma       Full DB schema (Section 7), Prisma-expressible parts
prisma/sql/constraints.sql PostGIS extension + EXCLUDE constraint + indexes (raw SQL)
prisma/seed.ts              Demo data
src/auth.ts                 NextAuth v5 config (Credentials + Google, role-based JWT)
src/middleware.ts            Route protection for /host and /admin
src/lib/services/            pricing (booking math), payments (Stripe Connect),
                              ai (Groq + fallbacks), listings, analytics
src/app/(site)/               Guest-facing routes (search, listing, trips, messages…)
src/app/(host)/host/          Host dashboard routes
src/app/(admin)/admin/        Admin dashboard routes
src/app/api/                  REST endpoints per Section 8 of the spec
src/theme/                    Brand color/typography tokens (Section 5)
```

## Notes on schema additions beyond Section 7

Three columns exist in `prisma/schema.prisma` that aren't in the spec's
Section 7 table listing, each added because a spec-described feature was
otherwise unimplementable: `users.stripeAccountId` (Stripe Connect payouts,
Section 9.6), `users.suspended` (admin suspend capability, Section 4.3), and
a `platform_settings` key/value table (admin-configurable commission rate,
Section 4.3/8). Each is commented inline in the schema.
