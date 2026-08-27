'use client';
import { useEffect, useMemo, useState } from 'react';
import Shell from '@/components/Shell';
import TxnRow from '@/components/TxnRow';
import TxnModal from '@/components/TxnModal';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useReviewCount } from '@/lib/useReviewCount';
import type { Transaction } from '@/lib/types';

export default function LedgerPage() {
  const { activeBusiness } = useStore();
  const reviewCount = useReviewCount();
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [modalTxn, setModalTxn] = useState<Transaction | 'new' | null>(null);

  const load = async () => {
    if (!activeBusiness) return;
    const params: Record<string, string> = {};
    if (type) params.type = type;
    if (category) params.category = category;
    if (search) params.q = search;
    setTxns(await api.listTransactions(activeBusiness.id, params));
  };
  useEffect(() => { load(); }, [activeBusiness, type, category, search]);

  const categories = useMemo(() => [...new Set(txns.map((t) => t.category))].sort(), [txns]);

  return (
    <Shell reviewCount={reviewCount}>
      <div className="view-in">
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div>
            <h2 className="font-extrabold text-[16px]">Ledger</h2>
            <span className="text-xs text-muted">{txns.length} transaction{txns.length === 1 ? '' : 's'}</span>
          </div>
          <button onClick={() => setModalTxn('new')} className="btn btn-primary !text-xs">＋ Add</button>
        </div>

        <div className="flex gap-2.5 flex-wrap mb-3.5">
          <input type="search" placeholder="Search vendor or note…" className="field-input flex-1 min-w-[150px]" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="field-input !w-auto" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option>
          </select>
          <select className="field-input !w-auto" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="card !p-1 sm:!px-4">
          {txns.length === 0 && <div className="text-center py-12 text-muted"><div className="text-4xl opacity-50 mb-2">≣</div><h3 className="text-ink font-bold mb-1">No matches</h3><p className="text-sm">Try clearing a filter.</p></div>}
          {txns.map((t) => <TxnRow key={t.id} t={t} onClick={() => setModalTxn(t)} />)}
        </div>
      </div>

      {modalTxn && (
        <TxnModal
          txn={modalTxn === 'new' ? null : modalTxn}
          onClose={() => setModalTxn(null)}
          onSaved={() => { setModalTxn(null); load(); }}
        />
      )}
    </Shell>
  );
}
