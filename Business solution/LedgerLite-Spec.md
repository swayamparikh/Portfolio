# LedgerLite — AI Bookkeeping for Businesses That Can't Afford a Bookkeeper
### Product & Engineering Spec (for Claude Code build)

**Idea & Concept by:** Swayam Parikh
**Project type:** Full-stack + mobile portfolio/business project
**Tagline:** *"Snap it, and it's booked."*
**Purpose of this document:** Hand this entire file to Claude Code as the build brief. It contains the concept, architecture, OCR/AI pipeline, mobile + web dashboard specs, database schema, API design, and step-by-step build order.

---

## 1. Product Overview

**Problem:** Small businesses (retail shops, freelancers, small service businesses, restaurants) can't afford a full-time accountant or bookkeeper. As a result, receipts pile up in drawers/phones, expenses go untracked, and owners have no real-time sense of whether they're actually profitable — they find out at tax time, often too late to fix anything.

**Solution:** LedgerLite lets a business owner **snap a photo of any receipt or invoice** — the AI extracts the vendor, amount, date, and line items, automatically categorizes it (rent, supplies, utilities, payroll, etc.), and rolls everything up into **plain-English monthly profit & loss summaries** — no accounting knowledge required, no manual data entry, no spreadsheet.

**Core promise:** Replace the very first hire a growing small business would otherwise make (a part-time bookkeeper) with a $10–20/mo app.

**Why this is a strong project (portfolio + real product):**
- Solves an extremely common, universally-understood pain point — no jargon needed to pitch it, which makes it land well both in interviews and in real sales conversations.
- Demonstrates a genuinely hard technical pipeline: OCR extraction → structured data parsing → AI categorization → financial aggregation/reporting — much more than a CRUD app.
- Naturally mobile + web (capture on phone, review on desktop) — showcases full-stack breadth across platforms, directly backing your CV's mobile/Flutter + full-stack claims.
- Directly monetizable as a real subscription SaaS, same as your other projects — every business is a potential customer, not just agencies.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Mobile App (receipt capture) | **Flutter** | Camera capture, gallery upload, offline queue (capture without signal, syncs later) — also directly strengthens your CV's Flutter claim |
| Web Dashboard | Next.js (App Router) + TypeScript | Review/edit transactions, reports, settings |
| Styling | Tailwind CSS | Clean financial-trust theme (Section 6) |
| Backend | Node.js + Express | REST API, OCR/AI orchestration |
| Database | PostgreSQL | Transactions, categories, businesses, reports |
| OCR Engine | `Tesseract.js` (free, open-source, runs on your own server — no per-image cost) as the base layer; optionally swap to Google Cloud Vision (free tier ~1000 units/mo) for better accuracy on messy receipts | Provider-agnostic `services/ocr.ts` so you can swap engines |
| AI Layer (extraction refinement + categorization + summaries) | **Groq API** (free tier — Llama 3.1/3.3) | Takes raw OCR text → structured JSON (vendor, amount, date, line items, category) |
| File Storage | `Cloudinary` or `Uploadthing` (free tier) | Stores receipt images |
| Charts | `recharts` | P&L trend, category breakdown |
| PDF Export | Puppeteer or `pdf-lib` | Monthly P&L report as a downloadable/shareable PDF |
| Auth | NextAuth.js / Clerk | Multi-business support (one user can manage multiple businesses, e.g. an accountant using it for clients) |
| Notifications | Email (Resend/SendGrid free tier) | Monthly report delivery, low-cash-flow alerts |
| Hosting | Backend → Render/Railway, Web → Vercel, Mobile → Google Play / TestFlight | |

---

## 3. Core Features (MVP Scope)

### 3.1 Receipt/Invoice Capture (Mobile)
- Camera capture with auto-edge-detection/crop (like a scanner app) or gallery upload
- Offline capture queue — works with no signal, auto-uploads when back online (important for real-world small business use — spotty wifi at a shop counter)
- Batch capture mode (snap multiple receipts in a row, process together)
- Manual entry fallback (for when OCR can't read a damaged receipt)

### 3.2 AI Extraction & Categorization Pipeline
- OCR extracts raw text from the image
- AI parses raw text into structured data: **vendor name, date, total amount, tax amount, currency, line items (if itemized)**
- AI assigns a **category** (Rent, Utilities, Supplies, Payroll, Marketing, Travel, Equipment, Food/Meals, Other — customizable list per business type)
- AI assigns **transaction type**: Expense or Income (for sales invoices/receipts issued by the business)
- Confidence score shown per extracted field — low-confidence fields are highlighted for quick manual review/correction (never silently trust a bad OCR read)
- Duplicate detection (flags if the same receipt looks like it's already been uploaded)

### 3.3 Review Queue (Web Dashboard)
- Every scanned receipt lands in a "Needs Review" queue showing the extracted data side-by-side with the original image
- One-tap confirm, or quick inline edit of any field
- Bulk-approve for high-confidence extractions (configurable confidence threshold)
- Once approved, moves into the permanent ledger

### 3.4 Ledger & Transactions
- Full searchable/filterable transaction list (by date, category, vendor, amount range)
- Manual transaction entry (for non-receipt income/expenses, e.g. bank transfers)
- Attach/view original receipt image on any transaction
- Edit/delete/re-categorize any transaction

### 3.5 Plain-English Financial Reports
- **Monthly P&L Summary**: not just numbers — an AI-generated plain-English narrative, e.g. *"This month you made $8,200 in revenue and spent $5,100, mostly on supplies (up 20% from last month) and rent. You're on track for a healthier margin than last month."*
- Category breakdown chart (pie/bar — where the money is going)
- Revenue vs. expense trend line (last 6/12 months)
- Cash flow snapshot (what's coming in vs. going out this month)
- Downloadable/shareable PDF report (useful for actual tax prep or showing a real accountant/investor)
- **AI Q&A on your finances**: ask questions like *"How much did I spend on supplies last quarter?"* or *"Am I spending more than last year?"* — answered directly from the ledger data

### 3.6 Alerts & Reminders
- Low cash flow warning (spending significantly outpacing income this month)
- Unusual expense flag (a transaction significantly larger than category average — possible error or fraud check)
- Monthly report auto-emailed on the 1st of each month
- Recurring expense reminders (rent, subscriptions) if a business marks them as recurring

### 3.7 Multi-Business / Multi-Currency
- One account can manage multiple businesses (useful for freelancers with side businesses, or if you pivot this into a tool accountants use across multiple small clients)
- Multi-currency support for international small businesses

---

## 4. AI Integration Plan (Groq)

`services/ai.ts` — core functions:
- `extractReceiptData(ocrText, imageContext): Promise<ReceiptExtraction>` — structured JSON: `{ vendor, date, totalAmount, taxAmount, currency, lineItems[], suggestedCategory, confidence }`
- `categorizeTransaction(description, amount, businessType): Promise<{ category, confidence }>`
- `generateMonthlyNarrative(transactions[], previousMonthData): Promise<string>` — the plain-English P&L summary
- `answerFinanceQuestion(question, transactions[]): Promise<string>` — the Q&A feature
- `detectAnomalies(transactions[]): Promise<Anomaly[]>` — flags unusual spending patterns

**Prompt design notes:**
- Force structured JSON output for extraction/categorization so the review-queue UI can render editable fields directly.
- For the narrative summary, explicitly prompt for **plain, non-jargon language** — the entire value proposition is "you don't need to understand accounting," so the AI's tone must actively avoid terms like "accrual," "COGS," etc. unless explained simply.
- Feed the AI a compact aggregated summary (totals by category, not every raw transaction) for narrative/Q&A generation to keep prompts small and free-tier-friendly, same pattern as your DocMind project.

---

## 5. Database Schema (PostgreSQL)

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  business_type TEXT, -- 'retail' | 'restaurant' | 'service' | 'freelance' | 'other'
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  ocr_raw_text TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'needs_review' | 'approved' | 'rejected'
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  receipt_id UUID REFERENCES receipts(id),
  type TEXT NOT NULL, -- 'expense' | 'income'
  vendor TEXT,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tax_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  transaction_date DATE NOT NULL,
  line_items JSONB, -- [{ description, amount }]
  confidence_score FLOAT, -- AI extraction confidence
  is_recurring BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'expense' | 'income'
  is_default BOOLEAN DEFAULT false
);

CREATE TABLE monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  month DATE NOT NULL, -- first day of the reported month
  total_income NUMERIC,
  total_expenses NUMERIC,
  net_profit NUMERIC,
  ai_narrative TEXT,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  reason TEXT,
  flagged_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. UI/UX Theme — "Clean Financial Trust"

**Direction:** Needs to feel trustworthy, calm, and simple — this app is handling someone's money, so the design should reduce anxiety, not add to it. Light, clean, approachable — the opposite of an intimidating spreadsheet or a scary accounting tool.

- **Base:** Soft off-white `#FAFAF8` background
- **Primary accent (Confident Green):** `#0F9D58`-adjacent tone, e.g. `#12A150` — represents "healthy finances," used for positive numbers, primary CTAs ("Scan Receipt," "Approve"), income figures
- **Secondary accent (Calm Navy):** `#1E3A5F` — used for headings, nav, neutral data — conveys stability/trust without being cold
- **Alert (soft, not alarming):** Amber `#E8A33D` for "needs review," muted red `#D64545` reserved only for genuine problems (overspending, anomalies) — used sparingly so alerts stay meaningful
- **Cards:** White surfaces, soft rounded corners (14px), light shadow, generous whitespace — never dense/cluttered like traditional accounting software
- **Typography:** `Inter` throughout for maximum readability and a calm, professional feel; large, clear numerals for financial figures (tabular figures for alignment in tables)
- **Key UI moment — the P&L narrative card:** styled almost like a friendly note/letter rather than a data table — larger, readable text, a small AI-sparkle icon, this is meant to feel like "a smart friend explaining your finances," reinforcing the core value prop
- **Mobile capture screen:** Full-screen camera view with a clear auto-detected receipt outline overlay (green corners snapping to detected edges), big single-tap capture button, minimal chrome — the capture flow needs to feel as fast and frictionless as a payment app
- **Motion:** Gentle checkmark animation when a receipt is successfully processed, smooth number count-up animations on the dashboard P&L figures, subtle progress indicator during OCR/AI processing (shows steps: "Reading receipt..." → "Categorizing..." → "Done!") so the wait feels transparent, not like a black box

---

## 7. API Design (Core Endpoints)

```
# Auth & Businesses
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/businesses                    → create a business
GET    /api/businesses                    → list user's businesses

# Receipt Capture & Processing
POST   /api/receipts/upload               → upload image, triggers OCR+AI pipeline
GET    /api/receipts/:id                  → status + extracted data
GET    /api/receipts?status=needs_review  → review queue

# Transactions
GET    /api/transactions                  → filterable ledger list
POST   /api/transactions                  → manual entry
PUT    /api/transactions/:id              → edit/re-categorize
DELETE /api/transactions/:id
POST   /api/transactions/:id/approve      → move from review to approved ledger

# Reports
GET    /api/reports/monthly/:businessId/:month
POST   /api/reports/monthly/:businessId/:month/generate  → trigger AI narrative + PDF
GET    /api/reports/monthly/:businessId/:month/pdf

# AI Q&A
POST   /api/ai/ask                        → { businessId, question } → plain-English answer

# Anomalies & Alerts
GET    /api/anomalies/:businessId
PUT    /api/anomalies/:id/dismiss

# Settings
GET    /api/categories/:businessId
POST   /api/categories                    → custom category
PUT    /api/businesses/:id/settings       → currency, alert thresholds, recurring reminders
```

---

## 8. Suggested Folder Structure

```
ledgerlite/
├── mobile/                        # Flutter app
│   ├── lib/
│   │   ├── screens/
│   │   │   ├── capture/           # camera + crop + offline queue
│   │   │   ├── ledger/
│   │   │   └── reports/
│   │   ├── services/
│   │   │   └── api_client.dart
│   │   └── main.dart
│
├── web/                           # Next.js dashboard
│   ├── app/
│   │   ├── review-queue/
│   │   ├── ledger/
│   │   ├── reports/
│   │   ├── ask/                   # AI Q&A screen
│   │   └── settings/
│   └── components/
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── ocr.ts             # Tesseract.js / Cloud Vision wrapper
│   │   │   ├── ai.ts              # Groq: extraction, categorization, narrative, Q&A
│   │   │   ├── reports.ts         # aggregation + PDF generation
│   │   │   └── anomalies.ts
│   │   ├── db/
│   │   │   └── schema.sql
│   │   └── index.ts
│   └── package.json
│
└── README.md
```

---

## 9. Build Order (Recommended for Claude Code)

**Stage 1 — Foundation**
1. Scaffold backend + Postgres schema + web dashboard shell
2. Build auth + business creation flow

**Stage 2 — Core OCR/AI Pipeline (the hard, valuable part — build first)**
3. Build receipt upload endpoint + Tesseract.js OCR integration
4. Build Groq extraction (raw OCR text → structured JSON)
5. Build categorization logic
6. Test extensively with real messy receipt photos (blurry, crumpled, handwritten) — this is where most of the actual engineering challenge lives

**Stage 3 — Web Review & Ledger**
7. Build Review Queue UI (side-by-side image + extracted data + edit/approve)
8. Build full Transactions/Ledger list with filters
9. Build manual transaction entry

**Stage 4 — Reports**
10. Build monthly aggregation logic
11. Build AI narrative generation (plain-English P&L)
12. Build charts (category breakdown, trend line)
13. Build PDF export

**Stage 5 — Mobile App (Flutter)**
14. Build camera capture screen with edge-detection crop
15. Build offline queue + background sync
16. Build mobile ledger view + report view (lighter version of web dashboard)

**Stage 6 — Polish & Extras**
17. AI Q&A feature
18. Anomaly detection + alerts
19. Multi-business support, multi-currency
20. Email report delivery (monthly digest)

---

## 10. Portfolio Presentation Notes
- README should open with **"Idea & Concept by Swayam Parikh"**, framed clearly around the problem/solution/pitch-line structure: *"Small businesses can't afford a bookkeeper. LedgerLite gives them one, powered by AI, for a fraction of the cost."*
- This project directly backs multiple CV claims at once (mobile/Flutter, AI integration, full-stack, real-world SaaS thinking) — call that out explicitly in your case study write-up.
- Strongest demo flow: open the mobile app → snap a real crumpled receipt → watch it process live ("Reading... Categorizing... Done") → switch to web dashboard → see it land in the review queue → approve it → view the updated P&L narrative update in real time. This single flow is genuinely impressive to watch and easy to record as a 60-second demo video.
- Since this solves a universal, non-technical pain point, it's also one of your most naturally "pitchable" projects for direct sales to real small businesses — worth actually launching, not just portfolio-displaying.

---

*End of spec — ready to hand to Claude Code.*
