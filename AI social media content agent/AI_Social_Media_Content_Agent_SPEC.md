# AI Social Media Content Agent — Project Spec

## 1. Project Overview

Build a full-stack web application called **"ContentPilot AI"** (rename as desired) — an AI-powered social media content generation agent. Users input a topic, brand voice, and platform, and the AI generates ready-to-post captions, hashtags, and content ideas. The app should feel like a polished SaaS product suitable for a client-facing portfolio piece and, later, real paying customers.

**Goal:** A production-quality MVP that can be demoed live, deployed on Vercel, and showcased in a portfolio with screenshots + a case study.

---

## 2. Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **UI Components:** shadcn/ui
- **Backend:** Next.js API routes (serverless functions, Vercel-compatible)
- **AI Provider:** xAI Grok API (`grok-beta` or latest available model) via free-tier API key
- **Database:** Supabase (Postgres) — free tier, for storing users, brand profiles, and generated content history
- **Auth:** Supabase Auth (email/password + Google OAuth)
- **Hosting:** Vercel
- **State Management:** React Context or Zustand (lightweight)
- **Icons:** lucide-react

---

## 3. Core Features (MVP)

### 3.1 Brand Profile Setup
- User creates one or more "Brand Profiles" containing:
  - Brand name
  - Industry/niche
  - Tone of voice (dropdown: Professional, Playful, Bold, Minimal, Luxury, Friendly — or custom text)
  - Target audience description
  - Optional: sample past posts (for style reference)

### 3.2 Content Generation Engine
- Input form with:
  - Topic / prompt (e.g., "New product launch — eco-friendly water bottle")
  - Platform selector: Instagram, LinkedIn, Twitter/X, Facebook, TikTok
  - Content type: Caption, Carousel outline, Video script, Hashtag set, Content calendar (7-day)
  - Tone override (optional, defaults to brand profile tone)
- On submit, call Grok API with a structured prompt combining brand profile + inputs
- Output should include:
  - Main caption/copy
  - 10-15 relevant hashtags (grouped: broad, niche, branded)
  - 2-3 alternative hook/opening lines
  - Suggested best posting time (static/best-practice logic, no need for real analytics)

### 3.3 Content History / Library
- Save every generated piece of content to the database, linked to the brand profile
- List view with filters (platform, date, content type)
- Copy-to-clipboard and "Regenerate" buttons on each item
- Ability to mark favorites

### 3.4 Content Calendar View (stretch goal, include if time permits)
- Simple calendar/grid UI showing generated posts mapped to future dates
- Drag-to-reschedule (optional, can be static list grouped by date if drag-drop is too complex for MVP)

### 3.5 Dashboard
- Overview page showing: total posts generated, posts by platform (simple bar chart), recent activity
- Use `recharts` for any charts

---

## 4. Pages / Routes

```
/                     → Landing page (marketing, CTA to sign up)
/login, /signup       → Auth pages
/dashboard            → Overview stats
/dashboard/brands     → Manage brand profiles (CRUD)
/dashboard/generate   → Main content generation tool
/dashboard/library     → Saved content history
/dashboard/calendar   → Content calendar (stretch goal)
/api/generate         → Serverless function calling Grok API
```

---

## 5. Grok API Integration Notes

- Use environment variable `GROK_API_KEY` (never hardcode)
- Base endpoint: `https://api.x.ai/v1/chat/completions` (OpenAI-compatible schema — use `fetch` or the `openai` npm package pointed at xAI's base URL)
- Example request shape:

```ts
const response = await fetch("https://api.x.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "grok-beta",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
  }),
});
```

- Build a well-engineered **system prompt** that encodes: brand tone, platform-specific formatting rules (e.g., LinkedIn = longer/professional, Twitter/X = short punchy, Instagram = emoji-friendly + hashtag block at end), and output format (ask model to return structured JSON: `{ caption, hashtags[], hooks[], bestTime }`)
- Handle rate limits / errors gracefully with a retry + user-friendly error toast
- Add basic request throttling per user (e.g., max 20 generations/day on free tier) to control API costs

---

## 6. Database Schema (Supabase / Postgres)

```sql
-- users table is handled by Supabase Auth

create table brand_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  industry text,
  tone text,
  audience text,
  sample_posts text,
  created_at timestamp default now()
);

create table generated_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  brand_profile_id uuid references brand_profiles(id),
  platform text not null,
  content_type text not null,
  topic text,
  caption text,
  hashtags text[],
  hooks text[],
  best_time text,
  is_favorite boolean default false,
  created_at timestamp default now()
);
```

Enable Row Level Security (RLS) so users can only access their own rows.

---

## 7. Design & UX Requirements

- Clean, modern SaaS aesthetic — dark mode default with a light mode toggle
- Landing page should include: hero section with clear value prop, feature highlights, a live "try it free" demo box (limited, no login required, 1 free generation), and pricing section (even if placeholder tiers for portfolio purposes)
- Mobile responsive throughout
- Loading states (skeleton loaders) for AI generation calls, since responses may take a few seconds
- Toast notifications for success/error states (use `sonner` or shadcn toast)

---

## 8. Environment Variables

```
GROK_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 9. Deployment (Vercel)

1. Push project to a GitHub repo
2. Import repo into Vercel
3. Add all environment variables in Vercel Project Settings → Environment Variables
4. Set build command: `next build` (default)
5. Deploy — Vercel auto-detects Next.js
6. Connect a custom domain if available (optional, for portfolio polish)

---

## 10. Deliverables Checklist for Claude Code

- [ ] Next.js project scaffolded with TypeScript + Tailwind + shadcn/ui
- [ ] Supabase project connected, schema migrated, RLS policies set
- [ ] Auth flow working (signup/login/logout, protected routes)
- [ ] Brand profile CRUD working
- [ ] Content generation form wired to `/api/generate` → Grok API
- [ ] Structured JSON output parsed and displayed cleanly in UI
- [ ] Content saved to `generated_content` table on generation
- [ ] Library page with filter/search/favorite/copy functionality
- [ ] Dashboard with basic stats + chart
- [ ] Landing page with try-it-free demo (rate-limited, no auth)
- [ ] Fully responsive, dark/light mode
- [ ] `.env.example` file included
- [ ] README with setup + deployment instructions
- [ ] Deployed and working live on Vercel

---

## 11. Notes for Claude Code

- Prioritize getting the core generate → save → view loop working end-to-end first before polishing the calendar/dashboard extras.
- Keep the Grok system prompt in a separate `lib/prompts.ts` file so it's easy to iterate on tone/quality without touching UI code.
- Add a simple in-memory or Supabase-based rate limiter on `/api/generate` to prevent abuse of the free Grok API key, especially on the public "try it free" demo.
- Use TypeScript types/interfaces for the AI response shape (`GeneratedContent`) shared between API route and frontend components.
- If Grok API free tier has strict rate limits, add graceful fallback messaging ("High demand right now, please try again in a moment") rather than a raw error.
