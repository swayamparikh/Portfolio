"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const breadcrumbs: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/patients": "Patients",
  "/dashboard/appointments": "Appointments",
  "/dashboard/emr": "Medical Records",
  "/dashboard/staff": "Staff",
  "/dashboard/billing": "Billing",
  "/dashboard/reports": "Reports",
  "/dashboard/analytics": "Analytics",
  "/dashboard/follow-ups": "AI Follow-Ups",
  "/dashboard/prescriptions": "Prescriptions",
  "/dashboard/lab-reports": "Lab Reports",
  "/dashboard/settings": "Settings",
  "/dashboard/audit-logs": "Audit Logs",
};

export default function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);

  const pageTitle = breadcrumbs[pathname] ?? "MediCRM";

  const notifications = [
    { id: 1, text: "New appointment scheduled", time: "2m ago", icon: "📅" },
    { id: 2, text: "Follow-up email sent to John D.", time: "15m ago", icon: "🤖" },
    { id: 3, text: "Invoice #INV-2024-0042 paid", time: "1h ago", icon: "💳" },
    { id: 4, text: "Lab report uploaded for Sarah M.", time: "2h ago", icon: "🧪" },
  ];

  return (
    <header className="topbar">
      {/* Mobile spacer */}
      <div style={{ width: 40 }} className="lg:hidden" />

      {/* Page title */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{pageTitle}</h1>
        <p style={{ fontSize: 12, color: "#3d5270", margin: 0 }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Global search */}
      <div style={{ position: "relative", width: 260 }} className="hidden md:block">
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#3d5270" }}>🔍</span>
        <input
          className="search-input"
          placeholder="Search patients, records…"
          style={{ width: "100%" }}
          id="global-search"
        />
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/dashboard/appointments/new" className="btn-primary" style={{ padding: "8px 14px", fontSize: 13 }}>
          + New Appointment
        </Link>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            id="notifications-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10, padding: "8px 12px", cursor: "pointer", color: "#94a3b8",
              fontSize: 16, position: "relative", transition: "all 0.15s",
            }}
          >
            🔔
            <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#ef4444", border: "2px solid #060d1f" }} />
          </button>

          {notifOpen && (
            <div style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)",
              width: 320, background: "#0a1628", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.4)", zIndex: 50,
              overflow: "hidden",
            }}>
              <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>Notifications</span>
                <span style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", fontSize: 11, padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>4 new</span>
              </div>
              {notifications.map((n) => (
                <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: 18 }}>{n.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#94a3b8" }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: "#3d5270", marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "12px 16px", textAlign: "center" }}>
                <button onClick={() => setNotifOpen(false)} style={{ fontSize: 13, color: "#0f766e", background: "none", border: "none", cursor: "pointer" }}>
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
