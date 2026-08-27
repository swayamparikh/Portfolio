'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import KpiTile from '@/components/KpiTile';
import NarrativeCard from '@/components/Narrative';
import { TrendBarChart, CategoryDonut } from '@/components/Charts';
import TxnRow from '@/components/TxnRow';
import { api } from '@/lib/api';
import { useStore, fmtMoney } from '@/lib/store';
import { useReviewCount } from '@/lib/useReviewCount';
import { currentMonthLocal } from '@/lib/date';
import type { MonthSeries, Transaction, Anomaly } from '@/lib/types';

export default function DashboardPage() {
  const { activeBusiness } = useStore();
  const reviewCount = useReviewCount();
  const [series, setSeries] = useState<MonthSeries[]>([]);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [narrative, setNarrative] = useState('Loading your summary…');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeBusiness) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [s, t, a] = await Promise.all([
          api.series(activeBusiness.id, 6),
          api.listTransactions(activeBusiness.id),
          api.anomalies(activeBusiness.id)
        ]);
        if (cancelled) return;
        setSeries(s.map((m: any) => ({ ...m, label: monthLabel(m.month) })));
        setTxns(t);
        setAnomalies(a);
        const report = await api.generateMonthlyReport(activeBusiness.id, currentMonthLocal());
        if (!cancelled) setNarrative(report.narrative || report.aiNarrative || "No activity yet this month.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeBusiness]);

  const cur = series[series.length - 1];
  const prev = series[series.length - 2];
  const dNet = cur && prev && prev.net ? Math.round(((cur.net - prev.net) / Math.abs(prev.net)) * 100) : 0;
  const cashLow = cur && cur.expense > cur.income * 1.05;

  return (
    <Shell reviewCount={reviewCount}>
      <div className="view-in flex flex-col gap-3.5">
        {cashLow && (
          <div className="card !bg-amber-soft border-amber flex items-center gap-2.5">
            <span className="text-xl">⚠️</span>
            <div><strong>Low cash-flow heads-up.</strong> <span className="text-amber-700 text-[12.5px]">Spending is outpacing income this month by {fmtMoney(cur.expense - cur.income, activeBusiness?.currency)}.</span></div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile label="💰 Revenue" value={cur?.income || 0} currency={activeBusiness?.currency} tone="pos" sub="this month" />
          <KpiTile label="💸 Expenses" value={cur?.expense || 0} currency={activeBusiness?.currency} sub="this month" />
          <KpiTile label="📈 Net profit" value={cur?.net || 0} currency={activeBusiness?.currency} tone={cur?.net >= 0 ? 'pos' : 'neg'}
            sub={<span className={dNet >= 0 ? 'text-green-ink' : 'text-red'}>{dNet >= 0 ? '▲' : '▼'} {Math.abs(dNet)}% vs last month</span>} />
          <KpiTile label="🧾 Transactions" value={txns.length} plain sub={`${reviewCount} awaiting review`} />
        </div>

        <NarrativeCard title={`${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })} · Plain-English summary`} text={loading ? 'Crunching the numbers…' : narrative} />

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-[16px]">Revenue vs. expenses</h2>
            <span className="text-xs text-muted font-medium">last 6 months</span>
          </div>
          {series.length > 0 && <TrendBarChart series={series} currency={activeBusiness?.currency || 'USD'} />}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-[16px]">Where the money goes</h2>
            <span className="text-xs text-muted font-medium">this month</span>
          </div>
          {cur && <CategoryDonut byCategory={cur.byCategory} currency={activeBusiness?.currency || 'USD'} />}
        </div>

        {anomalies.length > 0 && (
          <div className="card">
            <h2 className="font-extrabold text-[16px] mb-3">⚠️ Flagged for you</h2>
            <div className="flex flex-col">
              {anomalies.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-3 border-b border-line last:border-0">
                  <div className="w-10 h-10 rounded-[11px] bg-red-soft text-red grid place-items-center font-bold">!</div>
                  <div className="flex-1 text-[13px] text-inksoft">{a.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-extrabold text-[16px]">Recent activity</h2>
            <Link href="/ledger" className="btn btn-ghost !text-xs !py-1.5">View all</Link>
          </div>
          <div className="flex flex-col">
            {txns.slice(0, 5).map((t) => <TxnRow key={t.id} t={t} />)}
            {!txns.length && <p className="text-sm text-muted py-4 text-center">No transactions yet — scan a receipt to get started.</p>}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short' });
}
