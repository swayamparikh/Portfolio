'use client';
import { fmtMoney } from '@/lib/store';
import type { Transaction } from '@/lib/types';

const CATS: Record<string, string> = {
  Rent: '🏠', Utilities: '💡', Supplies: '📦', Payroll: '👥', Marketing: '📣',
  Travel: '✈️', Equipment: '🖥️', 'Food/Meals': '🍽️', Sales: '💰', Services: '🧾', Other: '•'
};

export default function TxnRow({ t, onClick }: { t: Transaction; onClick?: () => void }) {
  const date = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className={`grid grid-cols-[40px_1fr_auto] gap-3 items-center py-3 border-b border-line last:border-0 ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      <div className={`w-10 h-10 rounded-[11px] grid place-items-center text-[17px] ${t.type === 'income' ? 'bg-green-soft text-green-ink' : 'bg-navysoft text-ink'}`}>
        {CATS[t.category] || '•'}
      </div>
      <div className="min-w-0">
        <div className="font-bold text-[14.5px] truncate">{t.vendor}</div>
        <div className="text-[12.5px] text-muted flex gap-2 items-center flex-wrap mt-0.5">
          <span>{date}</span>·<span>{t.category}</span>
          {t.isRecurring && <span className="pill pill-navy !px-1.5 !py-0.5">recurring</span>}
        </div>
      </div>
      <div className={`font-extrabold text-[15px] whitespace-nowrap ${t.type === 'income' ? 'text-green-ink' : 'text-ink'}`}>
        {t.type === 'income' ? '+' : '-'}{fmtMoney(t.amount, t.currency)}
      </div>
    </div>
  );
}
