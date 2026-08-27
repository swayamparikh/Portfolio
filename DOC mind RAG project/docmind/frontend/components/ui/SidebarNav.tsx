"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const LINKS = [
  { href: "/documents", label: "Documents" },
  { href: "/ask", label: "Ask" },
  { href: "/eval", label: "Eval Dashboard" },
  { href: "/settings", label: "Settings" },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center justify-between border-b border-hairline bg-white px-4 py-3 md:w-56 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r md:px-5 md:py-6">
      <Link href="/documents" className="flex items-center gap-2 font-heading text-lg font-bold text-graphite">
        DocMind
        <span className="h-2 w-2 animate-pulse-red rounded-full bg-signal" />
      </Link>
      <div className="flex gap-1 md:mt-8 md:flex-col md:gap-1">
        {LINKS.map((link) => {
          const active = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "rounded-instrument px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-graphite text-white" : "text-muted hover:bg-surface hover:text-graphite"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
