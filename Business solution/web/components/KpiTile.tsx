'use client';
import { useEffect, useRef, useState } from 'react';
import { fmtMoney } from '@/lib/store';

export default function KpiTile({ label, value, currency, plain, tone, sub }: {
  label: string; value: number; currency?: string; plain?: boolean; tone?: 'pos' | 'neg'; sub?: React.ReactNode;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf: number;
    const dur = 900;
    const step = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const p = Math.min(1, (now - startRef.current) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const color = tone === 'pos' ? 'text-green-ink' : tone === 'neg' ? 'text-red' : 'text-ink';
  return (
    <div className="card !p-4">
      <div className="text-xs text-muted font-semibold">{label}</div>
      <div className={`text-[26px] font-extrabold mt-1.5 tracking-tight tnum ${color}`}>
        {plain ? Math.round(display) : fmtMoney(display, currency)}
      </div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}
