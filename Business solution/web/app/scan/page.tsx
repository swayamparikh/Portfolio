'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useReviewCount } from '@/lib/useReviewCount';
import { useToast } from '@/components/Toast';
import type { ReceiptExtraction } from '@/lib/types';

const STEPS = ['Reading receipt…', 'Extracting vendor, date & total…', 'Categorising…', 'Done!'];

export default function ScanPage() {
  const { activeBusiness } = useStore();
  const reviewCount = useReviewCount();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<'camera' | 'processing' | 'done' | 'error'>('camera');
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ReceiptExtraction | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const pickFile = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeBusiness) return;
    setPhase('processing'); setStep(0); setErrorMsg('');

    const stepTimer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 650);
    try {
      const res = await api.uploadReceipt(activeBusiness.id, file);
      clearInterval(stepTimer); setStep(STEPS.length - 1);
      await new Promise((r) => setTimeout(r, 350));
      if (res.status === 'needs_review' && res.extracted) {
        setResult(res.extracted);
        setPhase('done');
        toast('Receipt processed — added to review queue', 'good');
      } else {
        setErrorMsg(res.error || 'Could not read this receipt automatically.');
        setPhase('error');
      }
    } catch (err: any) {
      clearInterval(stepTimer);
      setErrorMsg(err.message || 'Upload failed');
      setPhase('error');
    }
  };

  const reset = () => { setPhase('camera'); setResult(null); };

  return (
    <Shell reviewCount={reviewCount}>
      <div className="view-in max-w-[460px] mx-auto">
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} />

        {phase === 'camera' && (
          <>
            <div className="relative aspect-[3/4] rounded-[18px] overflow-hidden shadow-lg2 grid place-items-center"
              style={{ background: 'radial-gradient(120% 80% at 50% 0, #243b57, #0f1d2e)' }}>
              <div className="absolute inset-[14%_12%]">
                {['top-0 left-0 border-r-0 border-b-0 rounded-tl-xl', 'top-0 right-0 border-l-0 border-b-0 rounded-tr-xl',
                  'bottom-0 left-0 border-r-0 border-t-0 rounded-bl-xl', 'bottom-0 right-0 border-l-0 border-t-0 rounded-br-xl'].map((c, i) => (
                  <span key={i} className={`absolute w-[34px] h-[34px] border-[3px] border-green ${c}`} />
                ))}
              </div>
              <div className="w-3/5 bg-white rounded-md p-3.5 -rotate-2 shadow-2xl">
                {[9, 5, 5, 5, 5, 5].map((h, i) => (
                  <div key={i} className="rounded-[3px] bg-[#dfe4ea] mb-1.5" style={{ height: h, width: i === 0 ? '60%' : i % 2 ? '40%' : '100%' }} />
                ))}
              </div>
              <p className="absolute bottom-3 inset-x-0 text-center text-[#cfe8d8] text-[12.5px] font-semibold">Align the receipt within the frame</p>
            </div>
            <div className="flex items-center justify-center gap-7 my-4">
              <button onClick={pickFile} className="flex flex-col items-center gap-1 text-[11px] font-semibold text-muted">
                <span className="w-[46px] h-[46px] rounded-[13px] bg-surface border border-line2 grid place-items-center text-[19px]">🖼️</span>Gallery
              </button>
              <button onClick={pickFile} aria-label="Capture" className="w-[74px] h-[74px] rounded-full bg-white border-[5px] border-green shadow-card grid place-items-center active:scale-95 transition">
                <span className="w-[52px] h-[52px] rounded-full bg-green" />
              </button>
              <Link href="/ledger" className="flex flex-col items-center gap-1 text-[11px] font-semibold text-muted">
                <span className="w-[46px] h-[46px] rounded-[13px] bg-surface border border-line2 grid place-items-center text-[19px]">✎</span>Manual
              </Link>
            </div>
            <p className="text-xs text-muted text-center max-w-[320px] mx-auto">
              Snap a receipt — it&apos;s read by OCR, structured &amp; categorised by AI, and dropped into your review queue.
            </p>
          </>
        )}

        {phase === 'processing' && (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4">
              <svg viewBox="0 0 50 50" width="96" height="96">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#ECEBE6" strokeWidth={5} />
                <circle cx="25" cy="25" r="20" fill="none" stroke="#12A150" strokeWidth={5} strokeLinecap="round" strokeDasharray="90 126">
                  <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <div className="flex flex-col gap-2.5 text-left max-w-[320px] mx-auto">
              {STEPS.map((label, i) => (
                <div key={label} className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition
                  ${i === step ? 'border-green-soft bg-green-soft opacity-100' : i < step ? 'border-line opacity-100' : 'border-line opacity-50'}`}>
                  <span className={`w-7 h-7 rounded-full grid place-items-center text-sm flex-none
                    ${i === step ? 'bg-green text-white' : i < step ? 'bg-green-soft text-green-ink' : 'bg-line text-muted'}`}>
                    {i < step ? '✓' : i + 1}
                  </span>
                  <b className="text-[14.5px] font-bold">{label}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'done' && result && (
          <div className="text-center px-3">
            <div className="w-[104px] h-[104px] mx-auto mb-4">
              <svg viewBox="0 0 100 100">
                <circle className="check-circle" cx="50" cy="50" r="46" />
                <path className="check-mark" d="M28 52 L44 68 L74 34" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold mb-1">Snapped &amp; booked!</h2>
            <p className="text-sm text-muted mb-4">Here&apos;s what I read — added to your review queue.</p>
            <div className="card text-left grid grid-cols-2 gap-3">
              <Field label="Vendor" value={result.vendor} conf={result.confidence.vendor} />
              <Field label="Total" value={`${result.totalAmount.toFixed(2)}`} conf={result.confidence.amount} />
              <Field label="Date" value={result.date} conf={result.confidence.date} />
              <Field label="Category" value={result.suggestedCategory} conf={result.confidence.category} />
            </div>
            <div className="flex gap-2.5 mt-4 flex-wrap">
              <Link href="/review-queue" className="btn btn-primary flex-1 min-w-[150px]">Review it now</Link>
              <button onClick={reset} className="btn btn-ghost flex-1 min-w-[150px]">Scan another</button>
            </div>
          </div>
        )}

        {phase === 'error' && (
          <div className="text-center px-3">
            <div className="text-5xl mb-3">⚠️</div>
            <h2 className="text-lg font-extrabold mb-1">Couldn&apos;t read that one</h2>
            <p className="text-sm text-muted mb-4">{errorMsg}</p>
            <div className="flex gap-2.5 flex-wrap">
              <button onClick={reset} className="btn btn-primary flex-1 min-w-[150px]">Try again</button>
              <Link href="/ledger" className="btn btn-ghost flex-1 min-w-[150px]">Enter manually</Link>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

function Field({ label, value, conf }: { label: string; value: string; conf: number }) {
  const low = conf < 0.8;
  return (
    <div className={low ? 'bg-amber-soft rounded-lg p-1.5 -m-1.5' : ''}>
      <label className="text-[10.5px] uppercase tracking-wide text-muted font-bold flex items-center gap-1.5">
        {label}
        <span className={`text-[10px] font-bold px-1.5 rounded-full ${low ? 'bg-amber-soft text-amber-700' : 'bg-green-soft text-green-ink'}`}>{Math.round(conf * 100)}%</span>
      </label>
      <div className="font-bold text-[14.5px]">{value}</div>
    </div>
  );
}
