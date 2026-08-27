import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { pool } from "../db/client.js";
import { detectFileType } from "../services/parsing.js";
import { ingestDocument } from "../services/ingestion.js";

const uploadDir = process.env.UPLOAD_DIR || "uploads";
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

export const documentsRouter = Router();

documentsRouter.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  let fileType;
  try {
    fileType = detectFileType(req.file.originalname);
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : "Unsupported file type" });
  }

  const storagePath = path.resolve(req.file.path);
  const { rows } = await pool.query(
    `INSERT INTO documents (filename, file_type, status, storage_path)
     VALUES ($1, $2, 'pending', $3) RETURNING *`,
    [req.file.originalname, fileType, storagePath]
  );
  const document = rows[0];

  // Ingest in the background; the client polls GET /api/documents for status updates.
  ingestDocument(document.id, storagePath, fileType).catch((err) => {
    console.error(`Ingestion failed for ${document.id}:`, err);
  });

  res.status(202).json(document);
});

documentsRouter.get("/", async (_req, res) => {
  const { rows } = await pool.query("SELECT * FROM documents ORDER BY uploaded_at DESC");
  res.json(rows);
});

documentsRouter.get("/:id", async (req, res) => {
  const { rows: docRows } = await pool.query("SELECT * FROM documents WHERE id = $1", [req.params.id]);
  if (docRows.length === 0) return res.status(404).json({ error: "Document not found" });

  const { rows: chunkRows } = await pool.query(
    "SELECT id, chunk_index, content, page_number, row_range FROM chunks WHERE document_id = $1 ORDER BY chunk_index",
    [req.params.id]
  );

  const { rows: queryRows } = await pool.query(
    `SELECT id, question, answer, confidence, created_at FROM queries
     WHERE citations @> $1::jsonb ORDER BY created_at DESC LIMIT 20`,
    [JSON.stringify([{ documentId: req.params.id }])]
  );

  res.json({ ...docRows[0], chunks: chunkRows, citedByQueries: queryRows });
});

documentsRouter.post("/:id/reindex", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM documents WHERE id = $1", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: "Document not found" });
  const document = rows[0];

  res.status(202).json({ status: "reindexing", documentId: document.id });

  ingestDocument(document.id, document.storage_path, document.file_type).catch((err) => {
    console.error(`Re-index failed for ${document.id}:`, err);
  });
});

documentsRouter.delete("/:id", async (req, res) => {
  await pool.query("DELETE FROM documents WHERE id = $1", [req.params.id]);
  res.status(204).send();
});
