'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function LoginPage() {
  const { login, signup } = useStore();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      if (mode === 'login') await login(email, password);
      else await signup(email, password, name);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center px-4 bg-bg">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 justify-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green to-green-ink text-white grid place-items-center font-extrabold text-2xl shadow-[0_4px_12px_rgba(18,161,80,.35)]">₹</div>
          <div>
            <strong className="text-xl font-extrabold block">LedgerLite</strong>
            <span className="text-xs text-muted">Snap it, and it&apos;s booked.</span>
          </div>
        </div>

        <div className="card">
          <div className="flex rounded-lg bg-bg p-1 mb-5">
            <button type="button" onClick={() => setMode('login')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${mode === 'login' ? 'bg-white shadow-sm text-ink' : 'text-muted'}`}>Log in</button>
            <button type="button" onClick={() => setMode('signup')} className={`flex-1 py-2 rounded-md text-sm font-bold transition ${mode === 'signup' ? 'bg-white shadow-sm text-ink' : 'text-muted'}`}>Sign up</button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-semibold text-inksoft block mb-1">Name</label>
                <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-inksoft block mb-1">Email</label>
              <input required type="email" className="field-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-inksoft block mb-1">Password</label>
              <input required minLength={6} type="password" className="field-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <p className="text-sm text-red bg-red-soft rounded-lg px-3 py-2">{error}</p>}
            <button disabled={busy} className="btn btn-primary w-full mt-1">
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-muted mt-4">Idea &amp; concept by Swayam Parikh</p>
      </div>
    </div>
  );
}
