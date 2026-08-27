'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

const NAV = [
  { href: '/', label: 'Dashboard', icon: '▚' },
  { href: '/scan', label: 'Scan Receipt', icon: '◎' },
  { href: '/review-queue', label: 'Review Queue', icon: '☑', badgeKey: 'review' },
  { href: '/ledger', label: 'Ledger', icon: '≣' },
  { href: '/reports', label: 'Reports', icon: '◔' },
  { href: '/ask', label: 'Ask AI', icon: '✦' }
];
const MOBILE_TABS = [
  { href: '/', label: 'Home', icon: '▚' },
  { href: '/ledger', label: 'Ledger', icon: '≣' },
  { href: '/scan', label: '', icon: '＋', isScan: true },
  { href: '/review-queue', label: 'Review', icon: '☑', badgeKey: 'review' },
  { href: '/reports', label: 'Reports', icon: '◔' }
];

const TITLES: Record<string, string> = {
  '/': 'Dashboard', '/scan': 'Scan Receipt', '/review-queue': 'Review Queue',
  '/ledger': 'Ledger', '/reports': 'Reports', '/ask': 'Ask AI', '/settings': 'Settings'
};

export default function Shell({ children, reviewCount = 0 }: { children: React.ReactNode; reviewCount?: number }) {
  const { ready, authed, businesses, activeBusiness, setActiveBusinessId, logout, user } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (ready && !authed) router.replace('/login');
  }, [ready, authed, router]);

  useEffect(() => setMenuOpen(false), [pathname]);

  if (!ready) return <div className="min-h-dvh grid place-items-center text-muted">Loading LedgerLite…</div>;
  if (!authed) return null;

  return (
    <div className="min-h-dvh md:ml-[248px]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-[248px] bg-surface border-r border-line flex flex-col gap-4 p-4 z-[60] transition-transform
        ${menuOpen ? 'translate-x-0 shadow-lg2' : '-translate-x-full'} md:translate-x-0 md:shadow-none`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[11px] bg-gradient-to-br from-green to-green-ink text-white grid place-items-center font-extrabold text-xl shadow-[0_4px_12px_rgba(18,161,80,.35)]">₹</div>
          <div className="leading-tight">
            <strong className="text-[17px] font-extrabold block">LedgerLite</strong>
            <span className="text-[11.5px] text-muted">Snap it, and it&apos;s booked.</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wide text-muted font-semibold">Business</label>
          <select
            className="field-input font-semibold"
            value={activeBusiness?.id || ''}
            onChange={(e) => setActiveBusinessId(e.target.value)}
          >
            {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-[14.5px] transition
                  ${active ? 'bg-green-soft text-green-ink' : 'text-inksoft hover:bg-bg'}`}>
                <span className={`w-5 text-center ${active ? 'text-green' : 'text-muted'}`}>{item.icon}</span>
                <span className="flex-1 flex items-center gap-2">{item.label}
                  {item.badgeKey === 'review' && reviewCount > 0 && (
                    <em className="not-italic text-[11px] font-bold bg-amber text-white min-w-[19px] h-[19px] px-1.5 rounded-full grid place-items-center">{reviewCount}</em>
                  )}
                </span>
              </Link>
            );
          })}
          <Link href="/settings" className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-[14.5px] transition ${pathname === '/settings' ? 'bg-green-soft text-green-ink' : 'text-inksoft hover:bg-bg'}`}>
            <span className="w-5 text-center text-muted">⚙</span>Settings
          </Link>
        </nav>

        <div className="mt-auto pt-3 border-t border-line text-xs text-muted">
          <p className="mb-2">Idea &amp; concept by<br /><strong className="text-inksoft">Swayam Parikh</strong></p>
          <p className="truncate mb-2">{user?.email}</p>
          <button onClick={logout} className="btn btn-ghost btn-block !text-xs !py-2 w-full">Log out</button>
        </div>
      </aside>

      {/* Mobile drawer scrim */}
      {menuOpen && <div className="fixed inset-0 bg-[rgba(15,29,46,.4)] z-[55] md:hidden" onClick={() => setMenuOpen(false)} />}

      {/* Topbar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 md:px-7 py-3 md:py-4 bg-[rgba(250,250,248,.86)] backdrop-blur border-b border-line" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
        <button className="md:hidden w-9 h-9 rounded-lg grid place-items-center text-xl hover:bg-line" onClick={() => setMenuOpen(true)} aria-label="Open menu">☰</button>
        <div className="font-extrabold text-lg md:text-xl flex-1">{TITLES[pathname] || 'LedgerLite'}</div>
        <select
          className="md:hidden field-input !text-sm !py-1.5 max-w-[130px]"
          value={activeBusiness?.id || ''}
          onChange={(e) => setActiveBusinessId(e.target.value)}
        >
          {businesses.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <Link href="/scan" className="btn btn-primary hidden md:inline-flex">＋ Scan Receipt</Link>
      </header>

      <main className="max-w-[1080px] mx-auto px-4 md:px-7 pt-4 md:pt-6 pb-24 md:pb-10">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed left-0 right-0 bottom-0 h-16 z-50 bg-white/95 backdrop-blur border-t border-line flex items-center justify-around" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {MOBILE_TABS.map((tab) => {
          const active = pathname === tab.href;
          if (tab.isScan) {
            return (
              <Link key={tab.href} href={tab.href} aria-label="Scan receipt" className="flex-none -mt-6">
                <span className="w-[52px] h-[52px] rounded-full bg-green text-white grid place-items-center text-2xl shadow-[0_6px_16px_rgba(18,161,80,.45)] border-4 border-bg">＋</span>
              </Link>
            );
          }
          return (
            <Link key={tab.href} href={tab.href} className={`flex flex-col items-center gap-0.5 text-[10.5px] font-semibold flex-1 relative py-1.5 ${active ? 'text-green-ink' : 'text-muted'}`}>
              <span className="text-lg">{tab.icon}</span>{tab.label}
              {tab.badgeKey === 'review' && reviewCount > 0 && (
                <em className="not-italic absolute top-0.5 right-[calc(50%-22px)] text-[9px] font-bold bg-amber text-white min-w-[16px] h-4 px-1 rounded-full grid place-items-center">{reviewCount}</em>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
