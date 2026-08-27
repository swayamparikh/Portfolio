'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useToast } from '@/components/Toast';
import type { Receipt } from '@/lib/types';

const EXP_CATS = ['Rent', 'Utilities', 'Supplies', 'Payroll', 'Marketing', 'Travel', 'Equipment', 'Food/Meals', 'Services', 'Sales', 'Other'];

export default function ReviewQueuePage() {
  const { activeBusiness } = useStore();
  const toast = useToast();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!activeBusiness) return;
    setLoading(true);
    const rows = await api.listReceipts(activeBusiness.id, 'needs_review');
    setReceipts(rows);
    setLoading(false);
  };
  useEffect(() => { load(); }, [activeBusiness]);

  const bulkApprove = async () => {
    const threshold = activeBusiness?.reviewConfidenceThreshold ?? 0.85;
    const good = receipts.filter((r) => r.extracted && Math.min(...Object.values(r.extracted.confidence)) >= threshold);
    for (const r of good) await api.approveReceipt(r.id, {});
    toast(`Approved ${good.length} high-confidence receipt${good.length === 1 ? '' : 's'}`, 'good');
    load();
  };

  return (
    <Shell reviewCount={receipts.length}>
      <div className="view-in">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="font-extrabold text-[16px]">Needs review</h2>
            <span className="text-xs text-muted">{receipts.length} receipt{receipts.length === 1 ? '' : 's'} · confirm or correct low-confidence fields</span>
          </div>
          {receipts.length > 0 && <button onClick={bulkApprove} className="btn btn-ghost !text-xs">Approve all high-confidence</button>}
        </div>

        {!loading && receipts.length === 0 && (
          <div className="text-center py-16 text-muted">
            <div className="text-4xl opacity-50 mb-3">☑</div>
            <h3 className="text-ink text-lg font-bold mb-1">Inbox zero 🎉</h3>
            <p className="text-sm mb-4">No receipts waiting. Scan one and it&apos;ll land here for a quick check.</p>
            <Link href="/scan" className="btn btn-primary">＋ Scan a receipt</Link>
          </div>
        )}

        <div className="flex flex-col gap-3.5">
          {receipts.map((r) => <ReviewCard key={r.id} receipt={r} onDone={load} />)}
        </div>
      </div>
    </Shell>
  );
}

function ReviewCard({ receipt, onDone }: { receipt: Receipt; onDone: () => void }) {
  const toast = useToast();
  const ext = receipt.extracted!;
  const [form, setForm] = useState({
    vendor: ext.vendor, totalAmount: ext.totalAmount, taxAmount: ext.taxAmount,
    date: ext.date, suggestedCategory: ext.suggestedCategory, type: ext.type
  });
  const lowFields = Object.entries(ext.confidence).filter(([, c]) => c < 0.8).map(([k]) => k);

  const approve = async () => {
    await api.approveReceipt(receipt.id, form);
    toast('Approved — moved to ledger', 'good');
    onDone();
  };
  const reject = async () => {
    await api.rejectReceipt(receipt.id);
    toast('Receipt rejected');
    onDone();
  };

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="grid grid-cols-[96px_1fr] md:grid-cols-[120px_1fr] gap-3.5 p-4">
        <div className="w-[96px] h-[120px] md:w-[120px] md:h-[150px] rounded-lg bg-navysoft border border-dashed border-line2 overflow-hidden flex-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${receipt.imageUrl}`} alt="Receipt" className="w-full h-full object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <strong className="text-[15px]">{ext.vendor}</strong>
            {lowFields.length ? <span className="pill pill-amber">{lowFields.length} to check</span> : <span className="pill pill-green">High confidence</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            <RField label="Vendor"><input className="field-input !py-1.5 !text-sm" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></RField>
            <RField label="Amount" conf={ext.confidence.amount}><input type="number" step="0.01" className="field-input !py-1.5 !text-sm" value={form.totalAmount} onChange={(e) => setForm({ ...form, totalAmount: parseFloat(e.target.value) || 0 })} /></RField>
            <RField label="Date" conf={ext.confidence.date}><input type="date" className="field-input !py-1.5 !text-sm" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></RField>
            <RField label="Category">
              <select className="field-input !py-1.5 !text-sm" value={form.suggestedCategory} onChange={(e) => setForm({ ...form, suggestedCategory: e.target.value })}>
                {EXP_CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </RField>
            <RField label="Type">
              <select className="field-input !py-1.5 !text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                <option value="expense">Expense</option><option value="income">Income</option>
              </select>
            </RField>
            <RField label="Tax"><input type="number" step="0.01" className="field-input !py-1.5 !text-sm" value={form.taxAmount} onChange={(e) => setForm({ ...form, taxAmount: parseFloat(e.target.value) || 0 })} /></RField>
          </div>
        </div>
      </div>
      <div className="flex gap-2.5 p-4 pt-0 flex-wrap">
        <button onClick={approve} className="btn btn-primary flex-1 min-w-[140px]">✓ Approve to ledger</button>
        <button onClick={reject} className="btn btn-ghost flex-1 min-w-[100px]">Reject</button>
      </div>
    </div>
  );
}

function RField({ label, conf, children }: { label: string; conf?: number; children: React.ReactNode }) {
  const low = conf !== undefined && conf < 0.8;
  return (
    <div className={`flex flex-col gap-1 ${low ? 'bg-amber-soft rounded-lg p-1.5 -m-1.5' : ''}`}>
      <label className="text-[10.5px] uppercase tracking-wide text-muted font-bold flex items-center gap-1.5">
        {label}
        {conf !== undefined && <span className={`text-[10px] font-bold px-1.5 rounded-full ${low ? 'bg-amber-soft text-amber-700' : 'bg-green-soft text-green-ink'}`}>{Math.round(conf * 100)}%</span>}
      </label>
      {children}
    </div>
  );
}
