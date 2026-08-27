import Link from "next/link";
import { ClipboardList, Users, BarChart3, Settings } from "lucide-react";
import { DashboardMobileNav } from "@/components/layout/DashboardMobileNav";

const links = [
  { href: "/admin/listings", label: "Listing approvals", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <Link href="/" className="mb-8 block font-heading text-lg font-bold text-text-heading">
            Nestly <span className="text-sm font-medium text-ocean">Admin</span>
          </Link>

          <nav className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-text-body hover:bg-white"
              >
                <link.icon className="h-4 w-4 text-ocean" />
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <DashboardMobileNav variant="admin" />
          <span className="mb-4 block font-heading text-lg font-bold text-text-heading lg:hidden">
            Nestly <span className="text-ocean">Admin</span>
          </span>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
