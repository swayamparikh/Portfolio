import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/logo";
import { NavLink } from "@/components/nav-link";
import { logout } from "../(auth)/actions";
import { aiConfigured } from "@/lib/ai";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-abyss/60 px-5 py-6 backdrop-blur-xl lg:flex">
        <Logo />

        <nav className="mt-9 flex flex-col gap-1">
          <NavLink href="/dashboard" icon="grid">Dashboard</NavLink>
          <NavLink href="/patients" icon="users">Patients</NavLink>
          <NavLink href="/visits/new" icon="pen">Log a visit</NavLink>
          <NavLink href="/reports" icon="file">Insurance reports</NavLink>
        </nav>

        <div className="mt-auto space-y-4">
          {!aiConfigured && (
            <div className="rounded-lg border border-amber-400/25 bg-amber-400/8 p-3 text-[11px] leading-relaxed text-amber-200/90">
              <strong className="block">Offline drafting mode</strong>
              Set <code className="font-mono">ANTHROPIC_API_KEY</code> in
              <code className="font-mono"> .env.local</code> for full Claude drafts.
            </div>
          )}

          <div className="rounded-lg border border-white/8 bg-white/3 p-3">
            <div className="truncate text-sm font-semibold">{user.name}</div>
            <div className="truncate text-xs text-muted">{user.clinicName}</div>
            <form action={logout}>
              <button className="mt-3 text-xs text-muted transition hover:text-rose-300">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-void/80 px-5 py-3 backdrop-blur-xl lg:hidden">
          <Logo small />
          <nav className="flex items-center gap-4 text-xs text-muted">
            <Link href="/dashboard" className="transition hover:text-ink">Home</Link>
            <Link href="/patients" className="transition hover:text-ink">Patients</Link>
            <Link href="/visits/new" className="text-cyan-300">Log visit</Link>
          </nav>
        </header>

        <main className="min-w-0 flex-1 px-5 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}
