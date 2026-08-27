'use client';
import { useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useReviewCount } from '@/lib/useReviewCount';

const SUGGESTED = [
  'How much did I spend on supplies last quarter?',
  "What's my biggest expense this month?",
  'Am I spending more than earlier this year?',
  'How much profit did I make?'
];

interface Msg { role: 'user' | 'ai'; text: string }

export default function AskPage() {
  const { activeBusiness } = useStore();
  const reviewCount = useReviewCount();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeBusiness) return;
    setMsgs([{ role: 'ai', text: `Hi! I'm your finance assistant for ${activeBusiness.name}. Ask me anything about your money — I'll answer in plain English.` }]);
  }, [activeBusiness]);

  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight }); }, [msgs, typing]);

  const ask = async (q: string) => {
    if (!q.trim() || !activeBusiness) return;
    setMsgs((m) => [...m, { role: 'user', text: q }]);
    setInput(''); setTyping(true);
    try {
      const { answer } = await api.ask(activeBusiness.id, q);
      setMsgs((m) => [...m, { role: 'ai', text: answer }]);
    } catch (err: any) {
      setMsgs((m) => [...m, { role: 'ai', text: err.message || "Sorry, I couldn't process that." }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <Shell reviewCount={reviewCount}>
      <div className="view-in flex flex-col" style={{ minHeight: '60dvh' }}>
        <div className="flex gap-2 flex-wrap mb-3">
          {SUGGESTED.map((q) => (
            <button key={q} onClick={() => ask(q)} className="px-3.5 py-2.5 rounded-full bg-surface border border-line2 text-[13px] font-semibold text-inksoft text-left hover:border-green hover:text-green-ink">
              {q}
            </button>
          ))}
        </div>

        <div ref={chatRef} className="flex-1 flex flex-col gap-3 overflow-y-auto pb-3">
          {msgs.map((m, i) => (
            <div key={i} className={`max-w-[82%] px-3.5 py-3 rounded-2xl text-[14.5px] leading-relaxed ${
              m.role === 'user' ? 'self-end bg-ink text-white rounded-br-sm' : 'self-start bg-surface border border-line shadow-card rounded-bl-sm'
            }`}>
              {m.role === 'ai' && <div className="text-[11px] font-bold text-green-ink flex items-center gap-1 mb-1">✦ LedgerLite AI</div>}
              {m.text}
            </div>
          ))}
          {typing && (
            <div className="self-start bg-surface border border-line shadow-card rounded-2xl rounded-bl-sm px-3.5 py-3">
              <div className="text-[11px] font-bold text-green-ink flex items-center gap-1 mb-1">✦ LedgerLite AI</div>
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />)}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="flex gap-2.5 sticky bottom-[calc(64px+8px)] md:bottom-0 bg-bg pt-2">
          <input className="field-input flex-1" placeholder="Ask about your finances…" value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="btn btn-primary" type="submit">Ask</button>
        </form>
      </div>
    </Shell>
  );
}
