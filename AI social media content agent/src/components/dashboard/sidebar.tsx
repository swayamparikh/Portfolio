"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  Sparkles,
  Library,
  CalendarDays,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/generate", label: "Generate", icon: Sparkles },
  { href: "/dashboard/brands", label: "Brand Profiles", icon: Palette },
  { href: "/dashboard/library", label: "Library", icon: Library },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
];

export function DashboardNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="bg-card hidden w-60 shrink-0 flex-col border-r md:flex">
      <SidebarBrand />
      <DashboardNav />
    </aside>
  );
}

export function SidebarBrand({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
          <Sparkles className="size-3.5" />
        </span>
        ContentPilot AI
      </Link>
      {onClose && (
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}>
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
