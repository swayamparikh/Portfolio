import { Router } from 'express';
import { pool } from '../db/pool';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { assertOwnsBusiness } from '../lib/ownership';
import { answerFinanceQuestion } from '../services/ai';
import { aggregateMonth } from '../services/reports';
import { monthStartOffset } from '../lib/date';

const router = Router();
router.use(requireAuth);

router.post('/ask', async (req: AuthedRequest, res) => {
  const { businessId, question } = req.body as { businessId: string; question: string };
  if (!businessId || !question) return res.status(400).json({ error: 'businessId and question are required' });
  if (!(await assertOwnsBusiness(businessId, req.userId!))) return res.status(404).json({ error: 'Business not found' });

  const { rows } = await pool.query('SELECT currency FROM businesses WHERE id = $1', [businessId]);
  const currency = rows[0]?.currency || 'USD';

  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = monthStartOffset(i);
    const agg = await aggregateMonth(businessId, monthStart, currency);
    monthly.push({ month: monthStart.slice(0, 7), income: agg.income, expense: agg.expense, net: agg.net, byCategory: agg.byCategory });
  }

  const answer = await answerFinanceQuestion(question, { monthly, currency });
  res.json({ answer });
});

export default router;
