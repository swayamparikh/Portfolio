"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  users: "M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  pen: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
};

export function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: keyof typeof ICONS | string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? "bg-cyan-400/10 font-semibold text-cyan-200 shadow-[inset_0_0_0_1px] shadow-cyan-400/25"
          : "text-muted hover:bg-white/4 hover:text-ink"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
        <path
          d={ICONS[icon] ?? ICONS.grid}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {children}
    </Link>
  );
}
