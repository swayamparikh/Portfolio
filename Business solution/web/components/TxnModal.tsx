'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useToast } from './Toast';
import { todayLocal } from '@/lib/date';
import type { Transaction } from '@/lib/types';

const CATS = ['Rent', 'Utilities', 'Supplies', 'Payroll', 'Marketing', 'Travel', 'Equipment', 'Food/Meals', 'Services', 'Sales', 'Other'];

export default function TxnModal({ txn, onClose, onSaved }: { txn: Transaction | null; onClose: () => void; onSaved: () => void }) {
  const { activeBusiness } = useStore();
  const toast = useToast();
  const isNew = !txn;
  const [form, setForm] = useState({
    type: txn?.type || 'expense', vendor: txn?.vendor || '', category: txn?.category || 'Supplies',
    amount: txn?.amount ?? '', date: txn?.date || todayLocal(), notes: txn?.notes || ''
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!form.vendor.trim() || !form.amount) { setError('Add a vendor and amount'); return; }
    setBusy(true); setError('');
    try {
      const data = { ...form, amount: Number(form.amount), businessId: activeBusiness!.id, currency: activeBusiness!.currency };
      if (isNew) await api.createTransaction(data);
      else await api.updateTransaction(txn!.id, data);
      toast(isNew ? 'Transaction added' : 'Transaction saved', 'good');
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!txn) return;
    setBusy(true);
    try { await api.deleteTransaction(txn.id); toast('Transaction deleted'); onSaved(); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(15,29,46,.4)] z-[70] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="card w-full sm:max-w-[520px] rounded-b-none sm:rounded-xl max-h-[92dvh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-[16px]">{isNew ? 'Add transaction' : 'Edit transaction'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg grid place-items-center hover:bg-bg" aria-label="Close">✕</button>
        </div>
        <div className="grid grid-cols-2 gap-x-3">
          <Field label="Type"><select className="field-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}><option value="expense">Expense</option><option value="income">Income</option></select></Field>
          <Field label="Date"><input type="date" className="field-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        </div>
        <Field label="Vendor / source"><input className="field-input" placeholder="e.g. Office Depot" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-x-3">
          <Field label="Category"><select className="field-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label={`Amount (${activeBusiness?.currency})`}><input type="number" step="0.01" placeholder="0.00" className="field-input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value as any })} /></Field>
        </div>
        <Field label="Notes"><input className="field-input" placeholder="Optional" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
        {error && <p className="text-sm text-red bg-red-soft rounded-lg px-3 py-2 mb-3">{error}</p>}
        <div className="flex gap-2.5">
          <button disabled={busy} onClick={save} className="btn btn-primary flex-1">{isNew ? 'Add transaction' : 'Save changes'}</button>
          {!isNew && <button disabled={busy} onClick={remove} className="btn btn-danger">Delete</button>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="mb-3"><label className="text-xs font-semibold text-inksoft block mb-1">{label}</label>{children}</div>;
}
