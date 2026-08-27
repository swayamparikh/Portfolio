import Link from "next/link";
import { LayoutDashboard, Home, Calendar, Wallet, MessageSquare, PlusCircle } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/Button";
import { DashboardMobileNav } from "@/components/layout/DashboardMobileNav";

const links = [
  { href: "/host/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/host/listings", label: "Listings", icon: Home },
  { href: "/host/bookings", label: "Bookings", icon: Calendar },
  { href: "/host/earnings", label: "Earnings", icon: Wallet },
  { href: "/host/messages", label: "Messages", icon: MessageSquare },
];

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:flex-row lg:gap-8">
      <aside className="hidden w-56 shrink-0 lg:block">
        <Link href="/" className="mb-8 block font-heading text-lg font-bold">
          <span className="bg-gradient-to-r from-coral-from to-coral-to bg-clip-text text-transparent">
            Nestly
          </span>{" "}
          <span className="text-sm font-medium text-text-muted">Host</span>
        </Link>

        <nav className="space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-text-body hover:bg-surface"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <Button href="/host/listings/new" size="sm" className="mt-6 w-full justify-center">
          <PlusCircle className="h-4 w-4" />
          New listing
        </Button>

        <p className="mt-6 text-xs text-text-muted">
          Signed in as {session?.user?.name ?? session?.user?.email}
        </p>
      </aside>

      <div className="min-w-0 flex-1">
        <DashboardMobileNav variant="host" />
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="font-heading text-lg font-bold text-text-heading">
            Host <span className="text-text-muted">dashboard</span>
          </span>
          <Button href="/host/listings/new" size="sm">
            <PlusCircle className="h-4 w-4" />
            New
          </Button>
        </div>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
