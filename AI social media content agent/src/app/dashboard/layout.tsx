import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { UserMenu } from "@/components/dashboard/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b px-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <MobileNav />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserMenu email={user.email ?? ""} />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
