# DocMind — Answers you can trace.

Idea & Concept by **Swayam Parikh**

A self-updating RAG (Retrieval-Augmented Generation) pipeline with a live evaluation dashboard. Upload messy documents (PDFs, CSVs, `.eml` emails), ask natural-language questions, and get answers with exact, clickable source citations — plus an automated evaluation harness that scores faithfulness, relevance, and retrieval accuracy on every run.

## Why I built this

Most RAG portfolio projects stop at "upload a PDF, ask a question." DocMind adds the three things real AI engineering teams actually care about:

- **Traceable citations** — every answer links back to the exact chunk (and page/row) it came from.
- **Incremental self-updating indexing** — re-uploading or re-indexing a document only touches that document's chunks, never wipes the rest of the index.
- **An automated evaluation harness** — a curated Q&A test set runs against the live system, scored by an LLM-as-judge for faithfulness and relevance, with retrieval-hit tracking and trend charts over time.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind |
| Backend | Node.js + Express |
| Database | PostgreSQL + `pgvector` |
| Embeddings | `@xenova/transformers` (local, free) |
| LLM (generation + judge) | Groq API |
| Charts | Recharts |

## Project structure

```
docmind/
├── frontend/   # Next.js app (Documents, Ask, Eval Dashboard, Settings)
└── backend/    # Express API (ingestion, retrieval, LLM, eval harness)
```

## Setup

### 1. Database

Create a free Postgres instance with the `pgvector` extension available (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com) — both support `CREATE EXTENSION vector`). Copy the connection string.

### 2. Backend

```bash
cd backend
cp .env.example .env
# fill in DATABASE_URL and GROQ_API_KEY in .env
npm install
npm run db:migrate   # creates tables + pgvector extension
npm run dev           # http://localhost:4000
```

Get a free Groq API key at https://console.groq.com/keys.

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev            # http://localhost:3000
```

## Using it

1. **Documents** — drag and drop a PDF, CSV, or `.eml` file. Watch it move from `Indexing...` (red scan-line) to `Indexed` (green dot).
2. **Ask** — ask a question about your uploaded documents. The answer comes back with inline citation chips — click one to expand the exact source snippet.
3. **Eval Dashboard** — add a few Q&A pairs via `POST /api/eval-sets`, then click "Run Evaluation" to score faithfulness, relevance, and retrieval accuracy. Adjust chunk size / top-k / temperature in the side panel and re-run to see the trend chart move.
4. **Settings** — tune chunking, retrieval, and generation parameters live.

## Evaluation methodology

Each eval run:
1. Retrieves top-k chunks for every test question (vector search + optional lexical rerank).
2. Generates a structured, cited answer via Groq.
3. Scores **faithfulness** (is the answer grounded in the retrieved chunks, no hallucination?) and **relevance** (does it address the question?) using Groq as an LLM-as-judge, each 0–1.
4. Records a **retrieval hit** if the expected answer text appears in a retrieved chunk.
5. A result **passes** if it's a retrieval hit AND both scores are ≥ 0.6.

Results are stored per run in `eval_runs` / `eval_results`, so changing chunk size, top-k, or temperature in Settings and re-running produces a visible trend line — a live demo of iterative RAG tuning.

## Stretch goals (not in MVP)

- Multi-user auth & workspaces
- `.docx` / `.txt` / OCR PDF support
- Hybrid keyword + vector search
- Streaming token-by-token answers

## Deployment

- Backend + DB → Render/Railway (free tier)
- Frontend → Vercel, with `NEXT_PUBLIC_API_URL` pointed at the deployed backend
