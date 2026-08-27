import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

const NAV = [
  { href: "/pipeline", label: "Pipeline" },
  { href: "/activity", label: "Activity" },
  { href: "/leads", label: "Leads" },
  { href: "/analytics", label: "Analytics" },
  { href: "/sequences", label: "Sequences" },
  { href: "/settings", label: "Settings" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-black/10 p-4 dark:border-white/10">
        <div className="mb-6">
          <p className="font-semibold">BDE Agent</p>
          <p className="text-xs opacity-60">{session.user?.email}</p>
        </div>
        <nav className="space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-2 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          className="mt-6"
        >
          <button type="submit" className="text-xs opacity-60 hover:opacity-100">
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
