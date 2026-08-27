import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SessionProvider from "@/components/providers/SessionProvider";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | MediCRM" },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role === "PATIENT") {
    redirect("/portal");
  }

  return (
    <SessionProvider session={session}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div className="main-layout">
          <Topbar />
          <main className="page-content">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
