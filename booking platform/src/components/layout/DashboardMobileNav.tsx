"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Calendar,
  Wallet,
  MessageSquare,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon components (function refs) can't cross the server->client RSC
// boundary as props, so the link configs — icons included — live here,
// in the client component that actually renders them. The layouts only
// pass a `variant` string.
const NAV_LINKS = {
  host: [
    { href: "/host/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/host/listings", label: "Listings", icon: Home },
    { href: "/host/bookings", label: "Bookings", icon: Calendar },
    { href: "/host/earnings", label: "Earnings", icon: Wallet },
    { href: "/host/messages", label: "Messages", icon: MessageSquare },
  ],
  admin: [
    { href: "/admin/listings", label: "Approvals", icon: ClipboardList },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
} as const;

export function DashboardMobileNav({ variant }: { variant: keyof typeof NAV_LINKS }) {
  const pathname = usePathname();
  const links = NAV_LINKS[variant];

  return (
    <nav className="sticky top-0 z-30 -mx-4 mb-4 overflow-x-auto border-b border-border bg-white/95 px-4 backdrop-blur lg:hidden">
      <div className="flex gap-1 py-2">
        {links.map((link) => {
          const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                active ? "bg-text-heading text-white" : "text-text-body hover:bg-surface",
              )}
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
