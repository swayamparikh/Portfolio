import crypto from 'crypto';
import { Router } from 'express';
import { pool } from '../db/pool';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { assertOwnsBusiness } from '../lib/ownership';
import { detectAnomalies } from '../services/ai';

const router = Router();
router.use(requireAuth);

router.get('/:businessId', async (req: AuthedRequest, res) => {
  if (!(await assertOwnsBusiness(req.params.businessId, req.userId!))) return res.status(404).json({ error: 'Not found' });
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const { rows: txns } = await pool.query(
    `SELECT id, category, amount, vendor FROM transactions WHERE business_id = $1 AND type = 'expense' AND transaction_date >= $2`,
    [req.params.businessId, cutoff]
  );
  const found = await detectAnomalies(txns.map((t) => ({ id: t.id, category: t.category, amount: Number(t.amount), vendor: t.vendor })));
  const results = [];
  for (const a of found) {
    const { rows } = await pool.query(
      `INSERT INTO anomalies (id, transaction_id, reason) VALUES ($1, $2, $3)
       ON CONFLICT(transaction_id) DO NOTHING RETURNING id, transaction_id AS "transactionId", reason, flagged_at AS "flaggedAt"`,
      [crypto.randomUUID(), a.transactionId, a.reason]
    );
    if (rows[0]) results.push(rows[0]);
  }
  const { rows: existing } = await pool.query(
    `SELECT a.id, a.transaction_id AS "transactionId", a.reason, a.flagged_at AS "flaggedAt"
     FROM anomalies a JOIN transactions t ON t.id = a.transaction_id
     WHERE t.business_id = $1 AND a.dismissed = 0 ORDER BY a.flagged_at DESC LIMIT 20`,
    [req.params.businessId]
  );
  res.json(existing);
});

router.put('/:id/dismiss', async (req: AuthedRequest, res) => {
  const { rows } = await pool.query(
    `SELECT t.business_id AS "businessId" FROM anomalies a JOIN transactions t ON t.id = a.transaction_id WHERE a.id = $1`,
    [req.params.id]
  );
  if (!rows[0] || !(await assertOwnsBusiness(rows[0].businessId, req.userId!))) return res.status(404).json({ error: 'Not found' });
  await pool.query('UPDATE anomalies SET dismissed = 1 WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

export default router;
