"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function PortalTopbar() {
  const { data: session } = useSession();

  return (
    <header
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#070e20",
      }}
    >
      <Link href="/portal" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
        <div className="sidebar-logo-icon">🏥</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>MediCRM Patient Portal</div>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 13, color: "#94a3b8" }}>{session?.user?.name}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "8px 14px", cursor: "pointer", color: "#e2e8f0", fontSize: 13,
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
