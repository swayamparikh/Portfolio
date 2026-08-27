import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SessionProvider from "@/components/providers/SessionProvider";
import PortalTopbar from "@/components/layout/PortalTopbar";

export const metadata: Metadata = {
  title: { default: "Patient Portal", template: "%s | MediCRM" },
};

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "PATIENT") {
    redirect("/dashboard");
  }

  return (
    <SessionProvider session={session}>
      <div style={{ minHeight: "100vh" }}>
        <PortalTopbar />
        <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px 60px" }}>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
