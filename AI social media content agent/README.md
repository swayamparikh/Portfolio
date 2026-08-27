# ContentPilot AI

An AI-powered social media content generation agent. Give it a topic, a brand voice, and a
platform — get back a ready-to-post caption, grouped hashtags, alternative hooks, and a
best-time-to-post suggestion.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Supabase (Postgres + Auth), and
the xAI Grok API.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **UI:** Hand-rolled shadcn/ui-style components on Radix primitives
- **Backend:** Next.js Route Handlers (serverless, Vercel-compatible)
- **AI:** xAI Grok API (`grok-4-fast`, OpenAI-compatible schema)
- **Database & Auth:** Supabase (Postgres, Row Level Security, email/password + Google OAuth)
- **Charts:** Recharts

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](./supabase/schema.sql). This creates
   `brand_profiles`, `generated_content`, and `generation_usage` (rate-limit backing table),
   all with Row Level Security enabled.
3. Under **Authentication → Providers**, enable **Google** if you want Google sign-in (email/password
   is on by default). Set the redirect URL to `<your-domain>/auth/callback`.
4. Copy your project URL, anon key, and service role key from **Settings → API**.

### 3. Get a Grok API key

Create a key at [console.x.ai](https://console.x.ai).

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in:

```
GROK_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- `src/lib/prompts.ts` — the system/user prompt engineering for Grok. Encodes platform-specific
  formatting rules (Instagram vs. LinkedIn vs. X, etc.), brand tone, and the required JSON
  output contract. Edit this file to iterate on output quality without touching UI code.
- `src/lib/grok.ts` — thin wrapper around the xAI chat completions endpoint with retry-on-429/5xx
  and JSON parsing/normalization.
- `src/app/api/generate/route.ts` — the only route that talks to Grok. Rate-limits (20/day for
  logged-in users, 1/24h per IP for the public "try it free" demo), fetches the brand profile,
  calls Grok, and saves the result to `generated_content` for authenticated users.
- `src/lib/rate-limit.ts` — Supabase-backed rate limiter (`generation_usage` table) with an
  in-memory fallback if Supabase env vars aren't configured yet.
- `src/proxy.ts` / `src/lib/supabase/proxy.ts` — Next.js 16's `proxy` (formerly `middleware`)
  convention; refreshes the Supabase session on every request and gates `/dashboard/*`.

## Routes

```
/                     Landing page + live "try it free" demo (no login)
/login, /signup       Auth
/dashboard            Overview: totals, posts-by-platform chart, recent activity
/dashboard/brands     Brand profile CRUD
/dashboard/generate   Content generation tool
/dashboard/library    Saved content history (filter, favorite, copy, regenerate)
/dashboard/calendar   Generated content mapped onto a monthly calendar
/api/generate         Grok-backed generation endpoint
```

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add the four environment variables from `.env.example` in Project Settings → Environment
   Variables.
4. Deploy — Vercel auto-detects Next.js, build command is `next build`.
5. In Supabase, add your production domain's `/auth/callback` URL to the allowed redirect URLs.
