import { Router } from 'express';
import { pool } from '../db/pool';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { assertOwnsBusiness } from '../lib/ownership';
import { aggregateMonth, buildReportPdf, generateMonthlyReport } from '../services/reports';
import { monthStartOffset } from '../lib/date';

const router = Router();
router.use(requireAuth);

async function getBiz(businessId: string, userId: string) {
  const { rows } = await pool.query('SELECT id, name, currency FROM businesses WHERE id = $1 AND owner_user_id = $2', [businessId, userId]);
  return rows[0];
}

router.get('/monthly/:businessId/:month', async (req: AuthedRequest, res) => {
  const biz = await getBiz(req.params.businessId, req.userId!);
  if (!biz) return res.status(404).json({ error: 'Not found' });
  const monthStart = `${req.params.month}-01`;
  const { rows } = await pool.query(
    'SELECT month, total_income AS "totalIncome", total_expenses AS "totalExpenses", net_profit AS "netProfit", ai_narrative AS "aiNarrative" FROM monthly_reports WHERE business_id = $1 AND month = $2',
    [biz.id, monthStart]
  );
  if (rows.length) return res.json(rows[0]);
  const agg = await aggregateMonth(biz.id, monthStart, biz.currency);
  res.json({ month: monthStart, totalIncome: agg.income, totalExpenses: agg.expense, netProfit: agg.net, aiNarrative: null, byCategory: agg.byCategory });
});

router.post('/monthly/:businessId/:month/generate', async (req: AuthedRequest, res) => {
  const biz = await getBiz(req.params.businessId, req.userId!);
  if (!biz) return res.status(404).json({ error: 'Not found' });
  const monthStart = `${req.params.month}-01`;
  const report = await generateMonthlyReport(biz.id, monthStart, biz.currency);
  res.json(report);
});

router.get('/monthly/:businessId/:month/pdf', async (req: AuthedRequest, res) => {
  const biz = await getBiz(req.params.businessId, req.userId!);
  if (!biz) return res.status(404).json({ error: 'Not found' });
  const monthStart = `${req.params.month}-01`;
  const report = await generateMonthlyReport(biz.id, monthStart, biz.currency);
  const pdfBytes = await buildReportPdf(biz.name, { ...report, currency: biz.currency });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="ledgerlite-${req.params.month}.pdf"`);
  res.send(Buffer.from(pdfBytes));
});

router.get('/series/:businessId', async (req: AuthedRequest, res) => {
  const biz = await getBiz(req.params.businessId, req.userId!);
  if (!biz) return res.status(404).json({ error: 'Not found' });
  const n = Math.min(24, parseInt((req.query.months as string) || '6', 10));
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const monthStart = monthStartOffset(i);
    const agg = await aggregateMonth(biz.id, monthStart, biz.currency);
    out.push({ ...agg, month: monthStart.slice(0, 7) });
  }
  res.json(out);
});

export default router;
