'use client';
import { createContext, useCallback, useContext, useState } from 'react';

interface Toast { id: number; msg: string; kind?: 'good' | 'info' }
const ToastCtx = createContext<(msg: string, kind?: 'good' | 'info') => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((msg: string, kind?: 'good' | 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed left-0 right-0 bottom-[calc(64px+14px)] md:bottom-6 flex flex-col items-center gap-2 z-[80] pointer-events-none px-4">
        {toasts.map((t) => (
          <div key={t.id} className={`px-4 py-3 rounded-xl font-semibold text-sm shadow-lg2 text-white max-w-[420px] flex items-center gap-2 ${t.kind === 'good' ? 'bg-green-ink' : 'bg-ink'}`}>
            <span>{t.kind === 'good' ? '✓' : 'ℹ'}</span>{t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
