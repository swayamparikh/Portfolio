# DocMind — Self-Updating RAG Pipeline with Live Evaluation
### Product & Engineering Spec (for Claude Code build)

**Idea & Concept by:** Swayam Parikh
**Project type:** Full-stack AI/LLM portfolio project
**Purpose of this document:** Hand this entire file to Claude Code as the build brief. It contains the concept, architecture, UI theme spec, database schema, API design, evaluation harness design, and step-by-step build order.

---

## 1. App Overview

**Project Name:** DocMind
**Tagline:** *"Answers you can trace."*
**Category:** LLM / RAG (Retrieval-Augmented Generation) Workflow System
**Purpose:** A full-stack web app where users upload messy documents (PDFs, CSVs, emails), the system chunks + embeds + indexes them automatically, and answers natural-language questions **with exact source citations**. The system also **self-updates its index** when new documents arrive, and includes a **live evaluation dashboard** that automatically scores answer quality (faithfulness, relevance, retrieval accuracy) — proving the system isn't just a demo, but something actually engineered and measured.

**Why this stands out for a portfolio:**
- Most RAG portfolio projects stop at "upload PDF, ask question." This one adds three things almost nobody builds: **traceable citations**, **incremental self-updating indexing**, and an **automated evaluation harness** — the exact things real AI engineering teams care about.
- Demonstrates full-stack ownership: backend pipeline engineering, vector databases, LLM orchestration, and a polished frontend.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript | Web app |
| Styling | Tailwind CSS | Custom red/white futuristic theme tokens |
| Backend | Node.js + Express (or Fastify) | REST API |
| Database | PostgreSQL + `pgvector` extension | Stores documents, chunks, embeddings, eval runs |
| Embeddings | `@xenova/transformers` (local, free, runs in Node) or a free-tier embedding API | No cost, no rate limits if local |
| LLM (Generation + Judge) | **Groq API** (free tier — Llama 3.1/3.3 or Mixtral) | Fast inference, generous free limits |
| File Parsing | `pdf-parse` / `unpdf` (PDF), `csv-parse` (CSV), `mailparser` (email `.eml`) | |
| File Uploads | `multer` (backend) | |
| Background Jobs | Simple queue via `node-cron` or a lightweight job runner (`bullmq` + Redis if you want to go further) | For re-indexing on new uploads |
| Charts (Eval Dashboard) | `recharts` | Score-over-time, retrieval accuracy charts |
| Deployment | Backend + DB → Render/Railway (free tier), Frontend → Vercel | |

---

## 3. Core Features (MVP Scope)

1. **Document Upload & Ingestion** — Drag-and-drop PDFs/CSVs/emails, live ingestion progress (parsing → chunking → embedding → indexing), document library view with status badges.
2. **Chunking Pipeline** — Semantic-aware chunking per file type (paragraph/section for PDFs, row-group-with-headers for CSVs, thread-turn for emails). Every chunk stores `sourceFile`, `pageNumber`/`rowRange`, `chunkIndex`.
3. **Vector Indexing** — Embeddings generated per chunk, stored in `pgvector` with metadata for traceability.
4. **Ask a Question (Chat Interface)** — User asks natural-language questions; system retrieves top-k relevant chunks, reranks, and sends to Groq for a structured, cited answer.
5. **Inline Citations** — Every answer includes clickable citation chips (`[invoice_march.pdf, p.3]`) that expand to show the exact source snippet highlighted — full traceability, no "trust me" answers.
6. **Self-Updating Index** — When new documents are uploaded (or existing ones re-uploaded), the system incrementally re-indexes without wiping prior data. UI shows "Last indexed: X mins ago" per document.
7. **Automated Evaluation Harness** — A curated test set of Q&A pairs runs against the live system automatically:
   - **Retrieval accuracy** — did top-k chunks contain the needed info?
   - **Faithfulness score** — LLM-as-judge (Groq) checks if the answer is grounded in retrieved chunks (no hallucination)
   - **Relevance score** — LLM-as-judge rates how well the answer addresses the question
   - Results stored per run, visualized as trend charts over time as chunking/prompt/retrieval settings change.
8. **Eval Dashboard** — Visual dashboard showing score trends, pass/fail breakdown, and a way to re-run the eval suite on demand ("Run Evaluation" button).
9. **Document Detail View** — Click into a document to see its chunk breakdown, embedding status, and which questions have cited it.
10. **Settings** — Adjust chunk size, top-k retrieval count, and model temperature — changes reflected live in next eval run (great demo of iteration).

**Stretch goals (mention as future work, not required for MVP):**
- Multi-user auth & workspaces
- Support for `.docx`, `.txt`, scanned/OCR PDFs
- Hybrid search (keyword + vector)
- Streaming token-by-token answer rendering

---

## 4. UI/UX Design Direction — "Futuristic Red & White"

### 4.1 Visual Identity
A stark, high-contrast, precision-engineered look — think a fusion of a lab diagnostics HUD and a high-end tech console. **Not** a typical dark-mode app; the boldness comes from clean white space cut through with sharp red accents and glowing red data traces.

- **Base background:** Crisp white to near-white `#FAFAFA` / `#FFFFFF`, with an optional deep charcoal/black alternate "console mode" section (e.g. the Eval Dashboard can use a black background with white/red data — see 4.4).
- **Primary accent (Signal Red):** `#E10600` — used for primary actions, active states, citation highlights, the "thinking/processing" pulse, and data-trace lines in charts.
- **Secondary/structure:** Graphite `#1A1A1A` for headings/text, `#6B6B6B` for secondary text, `#E5E5E5` for borders/dividers.
- **Surfaces:** Clean white cards with a **fine 1px hairline border** (`#EAEAEA`) and a very subtle drop shadow — no glassmorphism/blur here; the futurism comes from *precision*, not glow. On hover/active, cards get a thin red glowing edge (`box-shadow: 0 0 0 1px #E10600, 0 0 12px rgba(225,6,0,0.25)`).
- **Typography:**
  - Headings: `Space Grotesk` or `IBM Plex Mono` for a technical, diagnostic feel — bold, tight tracking
  - Body: `Inter`
  - Data/numbers/citations: monospace (`JetBrains Mono` or `IBM Plex Mono`) — reinforces the "precision instrument" feel, especially for confidence scores and eval metrics
- **Iconography:** Thin 1.5px line icons, red on hover/active, black/graphite default. Avoid filled icons except for status dots.
- **Motion:**
  - Red "scan line" animation sweeps across a card while a document is being ingested/indexed (like a scanner)
  - Citation chips have a subtle red pulse when first appearing
  - Eval score charts animate draw-in with a red trace line
  - Buttons: white bg + red border by default, fill solid red with white text + soft glow on hover
- **Shape language:** Sharper corners than typical (8–12px radius, not fully rounded) — reinforces the "engineered instrument" feel over "soft app" feel. Thin red divider lines used deliberately as structural elements (like circuit traces), not just decoration.
- **Status colors (within the red/white system):**
  - Success/High confidence: Red is reserved for accent/action — use a clean green `#16A34A` only for small status dots (indexed/success), sparingly
  - Warning/Medium confidence: Amber `#D97706`, sparingly
  - Error/Low confidence/Failed eval: the primary Signal Red `#E10600` — reinforcing red as "pay attention" throughout, not just a brand color

### 4.2 Reference mood
Imagine a fusion of a modern lab diagnostics dashboard, a high-precision engineering console, and Swiss-style editorial design — white space used confidently, red used sparingly but decisively (like a laser pointer or a warning line on a schematic), monospace data everywhere numbers/citations appear.

### 4.3 Navigation Structure
Top nav bar (white, hairline bottom border) with a bold wordmark **"DocMind"** in graphite + a small red dot/pulse icon (like a "live" indicator). Left sidebar (on desktop) or bottom tabs (on mobile-responsive view):
- Documents | Ask | Eval Dashboard | Settings

### 4.4 Eval Dashboard — "Console Mode" (optional dramatic contrast)
To make this screen visually distinct and demo-worthy, invert the theme here: black `#0A0A0A` background, white text, red data-trace charts, monospace everything — like switching from the "app" to the "terminal/diagnostics" view. This contrast is a strong portfolio/demo moment.

---

## 5. Screen-by-Screen Spec

### 5.1 Documents (Home)
- Header: "Documents" + upload button (top right, red outline → fills red on hover)
- Drag-and-drop zone (dashed red border on drag-over)
- Document cards in a grid: filename, type icon, status badge (`Indexing...` with red scan-line animation → `Indexed` green dot), chunk count, last indexed timestamp
- Click a card → Document Detail view (chunk list, embedding status, linked Q&A history)

### 5.2 Ask (Chat/Query Interface)
- Clean chat layout: white background, user messages right-aligned (light graphite bubble), AI messages left-aligned (white card with hairline border)
- AI answer renders with inline citation chips: small red-bordered pill `[invoice_march.pdf · p.3]` — tapping expands an accordion showing the exact retrieved snippet with the matched text highlighted in a light red wash
- Confidence badge per answer: `HIGH CONFIDENCE` (graphite), `MEDIUM` (amber), `LOW / VERIFY` (red) — monospace, small, top-right of the answer card
- "Thinking" state: a thin red horizontal scan-line animates across a skeleton card while retrieval + generation run
- Suggested question chips above input (based on uploaded docs)

### 5.3 Eval Dashboard (Console Mode — black theme)
- Header: "Evaluation Console" + "Run Evaluation" button (white outline on black, fills white w/ black text on hover, red glow pulse while running)
- Top stat row: Overall Faithfulness Score, Relevance Score, Retrieval Accuracy — large monospace numbers with red trend arrows (▲/▼ vs last run)
- Line chart: score-over-time across eval runs (red trace line on black grid)
- Table below: each test question, expected vs actual answer summary, pass/fail (red = fail, white/green = pass), retrieval hit/miss
- Filter/settings panel: adjust chunk size, top-k, temperature — "Re-run with these settings" button

### 5.4 Document Detail View
- Document metadata (filename, type, upload date, size)
- Chunk list: each chunk shown with its index, page/row range, and a preview snippet
- "Re-index this document" button (manual trigger, useful for demo)
- "Questions that cited this document" list

### 5.5 Settings
- Chunking strategy: chunk size slider, overlap slider
- Retrieval: top-k slider, reranking toggle
- Generation: model selector (Groq models), temperature slider
- Danger zone: "Clear all documents & index" (confirmation modal, red confirm button)
- About: project credit — **"Idea & Concept by Swayam Parikh"** + link to GitHub repo

---

## 6. Database Schema (PostgreSQL + pgvector)

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf' | 'csv' | 'email'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'indexing' | 'indexed' | 'failed'
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  last_indexed_at TIMESTAMPTZ,
  chunk_count INT DEFAULT 0
);

CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  page_number INT,          -- for PDFs
  row_range TEXT,            -- for CSVs, e.g. '10-25'
  embedding VECTOR(384),     -- dimension depends on embedding model used
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON chunks USING ivfflat (embedding vector_cosine_ops);

CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  confidence TEXT, -- 'high' | 'medium' | 'low'
  citations JSONB, -- [{document_id, chunk_id, snippet, page_number}]
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE eval_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE eval_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ DEFAULT now(),
  chunk_size INT,
  top_k INT,
  temperature FLOAT,
  overall_faithfulness FLOAT,
  overall_relevance FLOAT,
  overall_retrieval_accuracy FLOAT
);

CREATE TABLE eval_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_run_id UUID REFERENCES eval_runs(id) ON DELETE CASCADE,
  eval_set_id UUID REFERENCES eval_sets(id),
  actual_answer TEXT,
  faithfulness_score FLOAT,
  relevance_score FLOAT,
  retrieval_hit BOOLEAN,
  passed BOOLEAN
);
```

---

## 7. API Design (Node.js/Express)

```
POST   /api/documents/upload          → upload + trigger ingestion
GET    /api/documents                 → list all documents + status
GET    /api/documents/:id             → document detail + chunks
POST   /api/documents/:id/reindex     → manual re-index trigger
DELETE /api/documents/:id             → remove document + its chunks

POST   /api/query                     → { question } → { answer, citations, confidence }

GET    /api/eval-sets                 → list eval Q&A pairs
POST   /api/eval-sets                 → add new eval Q&A pair
POST   /api/eval/run                  → trigger full evaluation run
GET    /api/eval/runs                 → list past eval runs (for trend chart)
GET    /api/eval/runs/:id             → detailed results for one run

GET    /api/settings                  → get current chunk/retrieval/model settings
PUT    /api/settings                  → update settings
```

---

## 8. AI Integration Plan (Groq)

- Store API key as `GROQ_API_KEY` in backend `.env` (never exposed to frontend — all LLM calls happen server-side, unlike a pure client app, since this is a proper full-stack backend).
- Create `services/llm.ts`:
  - `generateAnswer(question, retrievedChunks): Promise<{ answer, citations, confidence }>`
  - `judgeFaithfulness(answer, retrievedChunks): Promise<number>` — LLM-as-judge call
  - `judgeRelevance(question, answer): Promise<number>` — LLM-as-judge call
- **Generation prompt** must force structured JSON output with explicit citation requirements:
```json
{
  "answer": "string",
  "citations": [
    { "documentId": "uuid", "chunkId": "uuid", "page": 3, "snippet": "exact matched text" }
  ],
  "confidence": "high|medium|low"
}
```
- **Judge prompts** should be strict and return only a numeric score (0–1) plus a one-line justification, to keep eval runs fast and cheap on the free tier.
- Rate-limit awareness: batch eval runs with small delays between calls to stay within Groq's free-tier limits; show progress in the Eval Dashboard while a run executes.

---

## 9. Suggested Folder Structure

```
docmind/
├── frontend/                     # Next.js app
│   ├── app/
│   │   ├── documents/
│   │   ├── ask/
│   │   ├── eval/                 # console-mode black theme
│   │   └── settings/
│   ├── components/
│   │   ├── ui/                   # Card, Button, CitationChip, ScanLine, etc.
│   │   ├── charts/
│   │   └── documents/
│   ├── theme/
│   │   ├── colors.ts             # red/white tokens + console-mode overrides
│   │   └── typography.ts
│   └── lib/api.ts                # fetch wrappers to backend
│
├── backend/                      # Node.js/Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── documents.ts
│   │   │   ├── query.ts
│   │   │   ├── eval.ts
│   │   │   └── settings.ts
│   │   ├── services/
│   │   │   ├── ingestion.ts      # parsing + chunking
│   │   │   ├── embeddings.ts
│   │   │   ├── retrieval.ts
│   │   │   ├── llm.ts            # Groq integration
│   │   │   └── evaluator.ts
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── client.ts
│   │   ├── jobs/
│   │   │   └── reindexWatcher.ts
│   │   └── index.ts
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 10. Build Order (Recommended for Claude Code)

1. Scaffold monorepo (frontend + backend folders), set up Postgres + pgvector locally
2. Build DB schema + backend DB client
3. Build ingestion pipeline: file upload → parse → chunk → embed → store (test with PDFs first, then CSV, then email)
4. Build retrieval service (vector search + basic reranking)
5. Integrate Groq for generation with structured/cited JSON output
6. Build `/api/query` endpoint end-to-end, test with real documents
7. Build frontend theme system first (red/white tokens, Card/Button/ScanLine/CitationChip primitives)
8. Build Documents screen (upload + list + detail)
9. Build Ask screen (chat UI + citation chips + confidence badges)
10. Build self-updating re-indexing (watcher/manual trigger + "last indexed" UI)
11. Build evaluation harness backend (eval sets table, run logic, LLM-as-judge scoring)
12. Build Eval Dashboard frontend (console black theme, charts, run trigger)
13. Build Settings screen (chunk size/top-k/temperature controls wired to live behavior)
14. Polish: scan-line animations, hover glows, empty states, error handling
15. Deploy backend+DB (Render/Railway) and frontend (Vercel), wire env vars/secrets

---

## 11. Portfolio Presentation Notes
- README should clearly state: **"Idea & Concept by Swayam Parikh"**, with a "Why I built this" section explaining the citation-traceability + self-updating-index + eval-harness angle — this is the pitch that differentiates it from generic RAG tutorials.
- Include a short demo video/GIF showing: upload a doc → ask a question → click a citation → open Eval Dashboard → run evaluation → watch scores update live. This single flow tells the whole story in under a minute.
- Consider writing a short blog post/case study alongside the repo explaining the evaluation methodology (faithfulness/relevance scoring) — this signals genuine LLM engineering understanding to reviewers, not just app-building.
- Pin the live demo link + GitHub repo at the top of the README with tech stack badges.

---

*End of spec — ready to hand to Claude Code.*
