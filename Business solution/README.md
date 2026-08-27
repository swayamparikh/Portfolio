# LedgerLite — AI Bookkeeping

**Idea & concept by Swayam Parikh** · *"Snap it, and it's booked."*

> Small businesses can't afford a bookkeeper. LedgerLite gives them one, powered by AI, for a fraction of the cost.

Full-stack implementation of the product spec in [`LedgerLite-Spec.md`](LedgerLite-Spec.md): a Node/Express API with a real OCR → AI extraction pipeline, and a Next.js web dashboard. Both run locally with **zero external setup** — no Postgres install, no Docker, no API key required to see it work end to end.

```
backend/   Express + TypeScript API — auth, OCR (Tesseract.js), AI (Groq, with a mock fallback), PDF reports
web/       Next.js (App Router) + TypeScript + Tailwind — dashboard, scan, review queue, ledger, reports, Ask AI
index.html / app.js / styles.css   A zero-install single-file preview of the same UI (open directly, no servers)
```

## Run it

**Backend**
```bash
cd backend
npm install
cp .env.example .env      # optionally paste a GROQ_API_KEY — see below
npm run dev                # http://localhost:4000
```
The database is a local SQLite file (`ledgerlite.db`) via Node's built-in `node:sqlite` — the schema is applied automatically on first boot. No Postgres, no service, no password.

**Web**
```bash
cd web
npm install
cp .env.local.example .env.local
npm run dev                # http://localhost:3000
```
Open `http://localhost:3000/login`, sign up, and a starter business is created for you automatically.

## AI (Groq)

`backend/src/services/ai.ts` calls the Groq API (free tier, `llama-3.3-70b-versatile`) for receipt extraction, categorization, monthly narratives, and Ask-AI answers. Add a key at [console.groq.com/keys](https://console.groq.com/keys) and paste it into `backend/.env` as `GROQ_API_KEY`. **Without a key, every AI function falls back to a deterministic mock** (regex/heuristic extraction, template narratives) so the full pipeline — upload → OCR → categorize → review → ledger → report — still works end to end.

## What's implemented

- **Auth** — email/password signup & login (bcrypt + JWT), multi-business per account.
- **Receipt pipeline** — real image upload → Tesseract.js OCR → AI structured extraction (vendor, date, total, tax, line items, category, **per-field confidence**) → lands in the review queue.
- **Review queue** — inline-editable extracted fields, low-confidence fields flagged, approve (with manual corrections) or reject, bulk-approve above a configurable confidence threshold.
- **Ledger** — full CRUD, search/filter by vendor, type, category, date.
- **Reports** — monthly aggregation, AI plain-English P&L narrative, 6-month trend & category-breakdown charts (recharts), and a real downloadable **PDF export** (pdf-lib).
- **Ask AI** — chat answering plain-English questions from the business's own aggregated ledger data.
- **Anomaly detection** — flags expenses well above a category's rolling average.
- **Multi-business & multi-currency** (USD/INR/EUR/GBP), per-business settings.
- **Mobile-responsive** throughout — bottom tab bar + floating scan button on mobile, sidebar + 4-up KPI grid on desktop, safe-area insets, `prefers-reduced-motion` support.

## Tech stack vs. spec

| Layer | Spec | This build |
|---|---|---|
| Web | Next.js + TypeScript + Tailwind | ✅ same |
| Backend | Node.js + Express | ✅ same |
| OCR | Tesseract.js | ✅ same |
| AI | Groq API | ✅ same (mock fallback when no key) |
| Charts | recharts | ✅ same |
| PDF | Puppeteer / pdf-lib | pdf-lib (lighter, no Chromium download) |
| Database | PostgreSQL | SQLite via `node:sqlite` — zero-setup for local/demo use. `backend/src/db/pool.ts` is a single-file adapter (`query(sql, params) → {rows}`); swap its body for `pg` to point at real Postgres without touching any route |
| Auth | NextAuth.js / Clerk | Hand-rolled JWT (no third-party auth service needed to run locally) |
| File storage | Cloudinary / Uploadthing | Local disk under `backend/uploads/` (swap `multer.diskStorage` for a cloud adapter for production) |
| Mobile app | Flutter | Not built in this pass — the web dashboard is fully responsive/mobile-usable meanwhile; ask if you want the Flutter capture app scaffolded next |

## Theme — "Clean Financial Trust"

Confident green `#12A150`, calm navy `#1E3A5F`, soft off-white `#FAFAF8`, Inter with tabular numerals — per Section 6 of the spec, implemented via Tailwind config (`web/tailwind.config.ts`) and shared utility classes in `web/app/globals.css`.
