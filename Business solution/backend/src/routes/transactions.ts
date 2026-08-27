import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { assertOwnsBusiness } from '../lib/ownership';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const { businessId, category, type, q, from, to } = req.query as Record<string, string>;
  if (!businessId) return res.status(400).json({ error: 'businessId is required' });
  if (!(await assertOwnsBusiness(businessId, req.userId!))) return res.status(404).json({ error: 'Business not found' });

  const params: any[] = [businessId];
  let sql = `SELECT id, receipt_id AS "receiptId", type, vendor, category, amount, tax_amount AS "taxAmount",
             currency, transaction_date AS "date", line_items AS "lineItems", confidence_score AS "confidenceScore",
             is_recurring AS "isRecurring", notes FROM transactions WHERE business_id = $1`;
  if (type) { params.push(type); sql += ` AND type = $${params.length}`; }
  if (category) { params.push(category); sql += ` AND category = $${params.length}`; }
  if (q) {
    const like = `%${q.toLowerCase()}%`;
    params.push(like, like);
    sql += ` AND (lower(vendor) LIKE $${params.length - 1} OR lower(notes) LIKE $${params.length})`;
  }
  if (from) { params.push(from); sql += ` AND transaction_date >= $${params.length}`; }
  if (to) { params.push(to); sql += ` AND transaction_date <= $${params.length}`; }
  sql += ' ORDER BY transaction_date DESC, created_at DESC';
  const { rows } = await pool.query(sql, params);
  res.json(rows.map((r: any) => ({ ...r, lineItems: r.lineItems ? JSON.parse(r.lineItems) : [] })));
});

const createSchema = z.object({
  businessId: z.string().uuid(), type: z.enum(['expense', 'income']), vendor: z.string().min(1),
  category: z.string().min(1), amount: z.number().positive(), taxAmount: z.number().min(0).default(0),
  currency: z.string().default('USD'), date: z.string(), notes: z.string().optional(), isRecurring: z.boolean().default(false)
});

router.post('/', async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const d = parsed.data;
  if (!(await assertOwnsBusiness(d.businessId, req.userId!))) return res.status(404).json({ error: 'Business not found' });
  const { rows } = await pool.query(
    `INSERT INTO transactions (id, business_id, type, vendor, category, amount, tax_amount, currency, transaction_date, notes, is_recurring, confidence_score)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,1) RETURNING id`,
    [crypto.randomUUID(), d.businessId, d.type, d.vendor, d.category, d.amount, d.taxAmount, d.currency, d.date, d.notes || null, d.isRecurring]
  );
  res.status(201).json({ id: rows[0].id });
});

router.put('/:id', async (req: AuthedRequest, res) => {
  const { rows: existing } = await pool.query('SELECT business_id FROM transactions WHERE id = $1', [req.params.id]);
  if (!existing[0] || !(await assertOwnsBusiness(existing[0].business_id, req.userId!))) return res.status(404).json({ error: 'Not found' });
  const { type, vendor, category, amount, taxAmount, date, notes, isRecurring } = req.body;
  await pool.query(
    `UPDATE transactions SET type = COALESCE($1,type), vendor = COALESCE($2,vendor), category = COALESCE($3,category),
     amount = COALESCE($4,amount), tax_amount = COALESCE($5,tax_amount), transaction_date = COALESCE($6,transaction_date),
     notes = COALESCE($7,notes), is_recurring = COALESCE($8,is_recurring) WHERE id = $9`,
    [type, vendor, category, amount, taxAmount, date, notes, isRecurring, req.params.id]
  );
  res.json({ ok: true });
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const { rows: existing } = await pool.query('SELECT business_id FROM transactions WHERE id = $1', [req.params.id]);
  if (!existing[0] || !(await assertOwnsBusiness(existing[0].business_id, req.userId!))) return res.status(404).json({ error: 'Not found' });
  await pool.query('DELETE FROM transactions WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

export default router;
