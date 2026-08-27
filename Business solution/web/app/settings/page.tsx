'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useReviewCount } from '@/lib/useReviewCount';
import { useToast } from '@/components/Toast';

const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP'];
const TYPES = ['retail', 'restaurant', 'service', 'freelance', 'other'];

export default function SettingsPage() {
  const { activeBusiness, businesses, refreshBusinesses, setActiveBusinessId } = useStore();
  const reviewCount = useReviewCount();
  const toast = useToast();
  const [currency, setCurrency] = useState(activeBusiness?.currency || 'USD');
  const [threshold, setThreshold] = useState(activeBusiness?.reviewConfidenceThreshold ?? 0.85);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('retail');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setCurrency(activeBusiness?.currency || 'USD');
    setThreshold(activeBusiness?.reviewConfidenceThreshold ?? 0.85);
  }, [activeBusiness]);

  const saveSettings = async () => {
    if (!activeBusiness) return;
    setBusy(true);
    try {
      await api.updateBusinessSettings(activeBusiness.id, { currency, reviewConfidenceThreshold: threshold });
      await refreshBusinesses();
      toast('Settings saved', 'good');
    } finally { setBusy(false); }
  };

  const addBusiness = async () => {
    if (!newName.trim()) return;
    setBusy(true);
    try {
      const biz = await api.createBusiness({ name: newName.trim(), businessType: newType, currency: newCurrency });
      await refreshBusinesses();
      setActiveBusinessId(biz.id);
      setNewName('');
      toast(`${biz.name} added`, 'good');
    } finally { setBusy(false); }
  };

  return (
    <Shell reviewCount={reviewCount}>
      <div className="view-in flex flex-col gap-3.5 max-w-[560px]">
        <div className="card">
          <h2 className="font-extrabold text-[16px] mb-3">Business settings — {activeBusiness?.name}</h2>
          <div className="mb-3">
            <label className="text-xs font-semibold text-inksoft block mb-1">Currency</label>
            <select className="field-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="mb-4">
            <label className="text-xs font-semibold text-inksoft block mb-1">Auto-approve confidence threshold ({Math.round(threshold * 100)}%)</label>
            <input type="range" min={0.5} max={1} step={0.01} className="w-full accent-[#12A150]" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} />
            <p className="text-xs text-muted mt-1">Receipts whose lowest field-confidence is at or above this get swept up by &quot;Approve all high-confidence&quot; in the review queue.</p>
          </div>
          <button onClick={saveSettings} disabled={busy} className="btn btn-primary">Save settings</button>
        </div>

        <div className="card">
          <h2 className="font-extrabold text-[16px] mb-1">Your businesses</h2>
          <p className="text-xs text-muted mb-3">Manage multiple businesses — useful for freelancers with side gigs, or an accountant managing several clients.</p>
          <div className="flex flex-col gap-2 mb-4">
            {businesses.map((b) => (
              <div key={b.id} className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${b.id === activeBusiness?.id ? 'border-green-soft bg-green-soft' : 'border-line'}`}>
                <span className="font-semibold text-sm">{b.name}</span>
                <span className="text-xs text-muted">{b.currency} · {b.businessType}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input className="field-input sm:col-span-1" placeholder="New business name" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <select className="field-input" value={newType} onChange={(e) => setNewType(e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            <select className="field-input" value={newCurrency} onChange={(e) => setNewCurrency(e.target.value)}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <button onClick={addBusiness} disabled={busy || !newName.trim()} className="btn btn-ghost mt-2.5">＋ Add business</button>
        </div>
      </div>
    </Shell>
  );
}
