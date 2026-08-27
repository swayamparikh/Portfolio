import crypto from 'crypto';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../db/pool';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { assertOwnsBusiness } from '../lib/ownership';
import { extractText } from '../services/ocr';
import { extractReceiptData } from '../services/ai';

const router = Router();
router.use(requireAuth);

const uploadDir = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname) || '.jpg'}`)
  }),
  limits: { fileSize: 10 * 1024 * 1024 }
});

/** Upload image, run OCR -> AI extraction, land the receipt in the needs_review queue. */
router.post('/upload', upload.single('image'), async (req: AuthedRequest, res) => {
  const businessId = req.body.businessId as string;
  if (!businessId) return res.status(400).json({ error: 'businessId is required' });
  if (!(await assertOwnsBusiness(businessId, req.userId!))) return res.status(404).json({ error: 'Business not found' });
  if (!req.file) return res.status(400).json({ error: 'image file is required' });

  const { rows: bizRows } = await pool.query('SELECT currency FROM businesses WHERE id = $1', [businessId]);
  const currency = bizRows[0]?.currency || 'USD';
  const imageUrl = `/uploads/${req.file.filename}`;

  const { rows } = await pool.query(
    'INSERT INTO receipts (id, business_id, image_url, status) VALUES ($1, $2, $3, $4) RETURNING id',
    [crypto.randomUUID(), businessId, imageUrl, 'pending']
  );
  const receiptId = rows[0].id;

  // Process synchronously so the caller gets the extraction immediately (demo-friendly; queue this in production).
  try {
    const ocrText = await extractText(path.join(uploadDir, req.file.filename));
    const extraction = await extractReceiptData(ocrText, currency);
    await pool.query(
      `UPDATE receipts SET ocr_raw_text = $1, extracted = $2, status = 'needs_review' WHERE id = $3`,
      [ocrText, JSON.stringify(extraction), receiptId]
    );
    res.status(201).json({ id: receiptId, imageUrl, status: 'needs_review', extracted: extraction });
  } catch (err) {
    console.error('Receipt processing failed:', err);
    await pool.query(`UPDATE receipts SET status = 'pending' WHERE id = $1`, [receiptId]);
    res.status(202).json({ id: receiptId, imageUrl, status: 'pending', error: 'Processing failed — retry or enter manually' });
  }
});

router.get('/', async (req: AuthedRequest, res) => {
  const { businessId, status } = req.query as { businessId?: string; status?: string };
  if (!businessId) return res.status(400).json({ error: 'businessId is required' });
  if (!(await assertOwnsBusiness(businessId, req.userId!))) return res.status(404).json({ error: 'Business not found' });
  const params: any[] = [businessId];
  let sql = 'SELECT id, image_url AS "imageUrl", status, extracted, uploaded_at AS "uploadedAt" FROM receipts WHERE business_id = $1';
  if (status) { params.push(status); sql += ` AND status = $${params.length}`; }
  sql += ' ORDER BY uploaded_at DESC';
  const { rows } = await pool.query(sql, params);
  res.json(rows.map((r: any) => ({ ...r, extracted: r.extracted ? JSON.parse(r.extracted) : null })));
});

router.get('/:id', async (req: AuthedRequest, res) => {
  const { rows } = await pool.query(
    `SELECT r.id, r.image_url AS "imageUrl", r.status, r.extracted, r.ocr_raw_text AS "ocrRawText", r.business_id AS "businessId"
     FROM receipts r WHERE r.id = $1`, [req.params.id]
  );
  const receipt = rows[0];
  if (!receipt || !(await assertOwnsBusiness(receipt.businessId, req.userId!))) return res.status(404).json({ error: 'Not found' });
  res.json({ ...receipt, extracted: receipt.extracted ? JSON.parse(receipt.extracted) : null });
});

/** Approve a reviewed receipt into the permanent ledger (with any manual corrections applied). */
router.post('/:id/approve', async (req: AuthedRequest, res) => {
  const { rows } = await pool.query('SELECT * FROM receipts WHERE id = $1', [req.params.id]);
  const receipt = rows[0];
  if (!receipt || !(await assertOwnsBusiness(receipt.business_id, req.userId!))) return res.status(404).json({ error: 'Not found' });

  const extracted = receipt.extracted ? JSON.parse(receipt.extracted) : {};
  const data = { ...extracted, ...req.body }; // manual field edits override AI extraction
  const { rows: txnRows } = await pool.query(
    `INSERT INTO transactions (id, business_id, receipt_id, type, vendor, category, amount, tax_amount, currency, transaction_date, line_items, confidence_score)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    [
      crypto.randomUUID(), receipt.business_id, receipt.id, data.type || 'expense', data.vendor, data.suggestedCategory || data.category,
      data.totalAmount ?? data.amount, data.taxAmount ?? data.tax ?? 0, data.currency, data.date,
      JSON.stringify(data.lineItems || []),
      data.confidence ? Math.min(...Object.values(data.confidence).map(Number)) : 1
    ]
  );
  await pool.query(`UPDATE receipts SET status = 'approved' WHERE id = $1`, [receipt.id]);
  res.json({ transactionId: txnRows[0].id });
});

router.put('/:id/reject', async (req: AuthedRequest, res) => {
  const { rows } = await pool.query('SELECT business_id FROM receipts WHERE id = $1', [req.params.id]);
  if (!rows[0] || !(await assertOwnsBusiness(rows[0].business_id, req.userId!))) return res.status(404).json({ error: 'Not found' });
  await pool.query(`UPDATE receipts SET status = 'rejected' WHERE id = $1`, [req.params.id]);
  res.json({ ok: true });
});

export default router;
