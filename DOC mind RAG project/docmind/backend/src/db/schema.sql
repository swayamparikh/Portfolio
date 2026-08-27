CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf' | 'csv' | 'email'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'indexing' | 'indexed' | 'failed'
  error_message TEXT,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  last_indexed_at TIMESTAMPTZ,
  chunk_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  page_number INT,          -- for PDFs
  row_range TEXT,            -- for CSVs, e.g. '10-25'
  embedding VECTOR(384),     -- dimension matches Xenova/all-MiniLM-L6-v2
  created_at TIMESTAMPTZ DEFAULT now()
);

-- No ANN index (ivfflat/hnsw) on embedding: at portfolio/demo scale (low thousands of chunks)
-- an exact scan via the <=> operator is both fast and exact. An ivfflat index built with the
-- default list count relative to a small row count can under-probe and silently return zero
-- results for ORDER BY ... LIMIT queries. Add one back (with a lists value sized to row count,
-- and raised ivfflat.probes) only once the chunk count actually justifies ANN search.
CREATE INDEX IF NOT EXISTS chunks_document_id_idx ON chunks (document_id);

CREATE TABLE IF NOT EXISTS queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  confidence TEXT, -- 'high' | 'medium' | 'low'
  citations JSONB, -- [{documentId, chunkId, snippet, page}]
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eval_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eval_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ DEFAULT now(),
  chunk_size INT,
  top_k INT,
  temperature FLOAT,
  overall_faithfulness FLOAT,
  overall_relevance FLOAT,
  overall_retrieval_accuracy FLOAT
);

CREATE TABLE IF NOT EXISTS eval_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eval_run_id UUID REFERENCES eval_runs(id) ON DELETE CASCADE,
  eval_set_id UUID REFERENCES eval_sets(id) ON DELETE CASCADE,
  actual_answer TEXT,
  faithfulness_score FLOAT,
  relevance_score FLOAT,
  retrieval_hit BOOLEAN,
  passed BOOLEAN
);

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  chunk_size INT NOT NULL DEFAULT 800,
  chunk_overlap INT NOT NULL DEFAULT 120,
  top_k INT NOT NULL DEFAULT 5,
  reranking BOOLEAN NOT NULL DEFAULT true,
  model TEXT NOT NULL DEFAULT 'llama-3.3-70b-versatile',
  temperature FLOAT NOT NULL DEFAULT 0.2,
  CONSTRAINT settings_singleton CHECK (id = 1)
);

INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
