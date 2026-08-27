import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { ensureDefaultCategories } from '../db/init';

const router = Router();
router.use(requireAuth);

const createSchema = z.object({
  name: z.string().min(1),
  businessType: z.string().optional(),
  currency: z.string().default('USD')
});

router.get('/', async (req: AuthedRequest, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, business_type AS "businessType", currency, review_confidence_threshold AS "reviewConfidenceThreshold" FROM businesses WHERE owner_user_id = $1 ORDER BY created_at',
    [req.userId]
  );
  res.json(rows);
});

router.post('/', async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { name, businessType, currency } = parsed.data;
  const { rows } = await pool.query(
    'INSERT INTO businesses (id, owner_user_id, name, business_type, currency) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, business_type AS "businessType", currency',
    [crypto.randomUUID(), req.userId, name, businessType || 'other', currency]
  );
  await ensureDefaultCategories(rows[0].id);
  res.status(201).json(rows[0]);
});

router.put('/:id/settings', async (req: AuthedRequest, res) => {
  const { currency, reviewConfidenceThreshold } = req.body;
  const { rows } = await pool.query(
    `UPDATE businesses SET currency = COALESCE($1, currency), review_confidence_threshold = COALESCE($2, review_confidence_threshold)
     WHERE id = $3 AND owner_user_id = $4 RETURNING id, name, currency, review_confidence_threshold AS "reviewConfidenceThreshold"`,
    [currency || null, reviewConfidenceThreshold ?? null, req.params.id, req.userId]
  );
  if (!rows.length) return res.status(404).json({ error: 'Business not found' });
  res.json(rows[0]);
});

export default router;
