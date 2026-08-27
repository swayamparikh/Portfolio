'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import NarrativeCard from '@/components/Narrative';
import KpiTile from '@/components/KpiTile';
import { TrendLineChart, CategoryDonut } from '@/components/Charts';
import { api, downloadPdf } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useReviewCount } from '@/lib/useReviewCount';
import { useToast } from '@/components/Toast';
import { currentMonthLocal } from '@/lib/date';
import type { MonthSeries } from '@/lib/types';

export default function ReportsPage() {
  const { activeBusiness } = useStore();
  const reviewCount = useReviewCount();
  const toast = useToast();
  const [series, setSeries] = useState<MonthSeries[]>([]);
  const [narrative, setNarrative] = useState('Loading your summary…');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!activeBusiness) return;
    let cancelled = false;
    (async () => {
      const s = await api.series(activeBusiness.id, 6);
      if (cancelled) return;
      setSeries(s.map((m: any) => ({ ...m, label: monthLabel(m.month) })));
      const report = await api.generateMonthlyReport(activeBusiness.id, currentMonthLocal());
      if (!cancelled) setNarrative(report.narrative || 'No activity yet this month.');
    })();
    return () => { cancelled = true; };
  }, [activeBusiness]);

  const cur = series[series.length - 1];

  const exportPdf = async () => {
    if (!activeBusiness) return;
    setDownloading(true);
    try {
      await downloadPdf(activeBusiness.id, currentMonthLocal());
      toast('PDF downloaded', 'good');
    } catch (err: any) {
      toast(err.message || 'Could not generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Shell reviewCount={reviewCount}>
      <div className="view-in flex flex-col gap-3.5">
        <NarrativeCard title={`Monthly P&L · ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`} text={narrative} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiTile label="Total income" value={cur?.income || 0} currency={activeBusiness?.currency} tone="pos" />
          <KpiTile label="Total expenses" value={cur?.expense || 0} currency={activeBusiness?.currency} />
          <KpiTile label="Net profit" value={cur?.net || 0} currency={activeBusiness?.currency} tone={cur?.net >= 0 ? 'pos' : 'neg'} />
          <KpiTile label="Profit margin" value={cur?.income ? Math.round((cur.net / cur.income) * 100) : 0} plain sub="%" />
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-extrabold text-[16px]">6-month trend</h2>
            <span className="text-xs text-muted">income vs expense</span>
          </div>
          {series.length > 0 && <TrendLineChart series={series} currency={activeBusiness?.currency || 'USD'} />}
        </div>

        <div className="card">
          <h2 className="font-extrabold text-[16px] mb-3">Category breakdown</h2>
          {cur && <CategoryDonut byCategory={cur.byCategory} currency={activeBusiness?.currency || 'USD'} />}
        </div>

        <div className="card flex items-center justify-between gap-3 flex-wrap">
          <div><strong>Monthly P&amp;L report</strong><div className="text-xs text-muted">Shareable PDF for tax prep or your accountant.</div></div>
          <button onClick={exportPdf} disabled={downloading} className="btn btn-primary">{downloading ? 'Generating…' : '⬇ Download PDF'}</button>
        </div>
      </div>
    </Shell>
  );
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short' });
}
