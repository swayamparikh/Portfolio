-- LedgerLite database schema (SQLite via Node's built-in node:sqlite)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_type TEXT, -- 'retail' | 'restaurant' | 'service' | 'freelance' | 'other'
  currency TEXT DEFAULT 'USD',
  review_confidence_threshold REAL DEFAULT 0.85,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  ocr_raw_text TEXT,
  status TEXT DEFAULT 'pending', -- 'pending' | 'needs_review' | 'approved' | 'rejected'
  extracted TEXT, -- JSON: { vendor, date, totalAmount, taxAmount, currency, lineItems[], suggestedCategory, confidence }
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  receipt_id TEXT REFERENCES receipts(id),
  type TEXT NOT NULL, -- 'expense' | 'income'
  vendor TEXT,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  tax_amount NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  transaction_date TEXT NOT NULL,
  line_items TEXT, -- JSON array
  confidence_score REAL,
  is_recurring INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'expense' | 'income'
  is_default INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS monthly_reports (
  id TEXT PRIMARY KEY,
  business_id TEXT REFERENCES businesses(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- 'YYYY-MM-01'
  total_income NUMERIC,
  total_expenses NUMERIC,
  net_profit NUMERIC,
  ai_narrative TEXT,
  pdf_url TEXT,
  generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (business_id, month)
);

CREATE TABLE IF NOT EXISTS anomalies (
  id TEXT PRIMARY KEY,
  transaction_id TEXT REFERENCES transactions(id) ON DELETE CASCADE,
  reason TEXT,
  dismissed INTEGER DEFAULT 0,
  flagged_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (transaction_id)
);

CREATE INDEX IF NOT EXISTS idx_txn_business_date ON transactions(business_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_business_status ON receipts(business_id, status);
