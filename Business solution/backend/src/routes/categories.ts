import crypto from 'crypto';
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { assertOwnsBusiness } from '../lib/ownership';

const router = Router();
router.use(requireAuth);

router.get('/:businessId', async (req: AuthedRequest, res) => {
  if (!(await assertOwnsBusiness(req.params.businessId, req.userId!))) return res.status(404).json({ error: 'Not found' });
  const { rows } = await pool.query('SELECT id, name, type, is_default AS "isDefault" FROM categories WHERE business_id = $1 ORDER BY is_default DESC, name', [req.params.businessId]);
  res.json(rows);
});

const createSchema = z.object({ businessId: z.string().uuid(), name: z.string().min(1), type: z.enum(['expense', 'income']) });

router.post('/', async (req: AuthedRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });
  const { businessId, name, type } = parsed.data;
  if (!(await assertOwnsBusiness(businessId, req.userId!))) return res.status(404).json({ error: 'Not found' });
  const { rows } = await pool.query(
    'INSERT INTO categories (id, business_id, name, type, is_default) VALUES ($1, $2, $3, $4, 0) RETURNING id, name, type',
    [crypto.randomUUID(), businessId, name, type]
  );
  res.status(201).json(rows[0]);
});

export default router;
