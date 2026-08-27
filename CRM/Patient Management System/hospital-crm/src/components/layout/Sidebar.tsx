"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles?: string[];
}

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "📊" },
      { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
    ],
  },
  {
    label: "Patient Care",
    items: [
      { href: "/dashboard/patients", label: "Patients", icon: "👥" },
      { href: "/dashboard/appointments", label: "Appointments", icon: "📅" },
      { href: "/dashboard/emr", label: "Medical Records", icon: "📋" },
    ],
  },
  {
    label: "Clinical",
    items: [
      { href: "/dashboard/prescriptions", label: "Prescriptions", icon: "💊" },
      { href: "/dashboard/lab-reports", label: "Lab Reports", icon: "🧪" },
      { href: "/dashboard/follow-ups", label: "AI Follow-Ups", icon: "🤖" },
      { href: "/dashboard/wellness", label: "Wellness Chat", icon: "💬" },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/dashboard/hospitals", label: "Hospitals", icon: "🏥", roles: ["SUPER_ADMIN"] },
      { href: "/dashboard/staff", label: "Staff", icon: "👨‍⚕️", roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN"] },
      { href: "/dashboard/billing", label: "Billing", icon: "💳" },
      { href: "/dashboard/reports", label: "Reports", icon: "📄" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
      { href: "/dashboard/audit-logs", label: "Audit Logs", icon: "🔍", roles: ["SUPER_ADMIN", "HOSPITAL_ADMIN"] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "";
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden"
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 60,
          background: "rgba(15,118,110,0.9)", border: "none",
          borderRadius: 10, padding: "8px 12px", cursor: "pointer",
          color: "white", fontSize: 18,
        }}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 35 }}
        />
      )}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <div className="sidebar-logo-icon">🏥</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>MediCRM</div>
              <div style={{ fontSize: 10, color: "#3d5270" }}>Healthcare Platform</div>
            </div>
          </Link>
        </div>

        {/* Hospital badge */}
        {session?.user?.hospitalName && (
          <div style={{ margin: "12px 10px", padding: "10px 12px", background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.1)", borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: "#3d5270", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Active Hospital</div>
            <div style={{ fontSize: 13, color: "#5eead4", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session.user.hospitalName}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navSections.map((section) => {
            const filteredItems = section.items.filter(
              (item) => !item.roles || item.roles.includes(role)
            );
            if (filteredItems.length === 0) return null;
            return (
              <div key={section.label}>
                <div className="nav-section-label">{section.label}</div>
                {filteredItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive(item.href) ? "active" : ""}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="icon">{item.icon}</span>
                    {item.label}
                    {isActive(item.href) && (
                      <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#14b8a6", flexShrink: 0 }} />
                    )}
                  </Link>
                ))}
              </div>
            );
          })}
        </nav>

        {/* User profile */}
        <div style={{ padding: "12px 10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)" }}>
            <div className="avatar-fallback" style={{ width: 34, height: 34, fontSize: 13 }}>
              {getInitials(session?.user?.name ?? "U")}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session?.user?.name}
              </div>
              <div style={{ fontSize: 11, color: "#3d5270", textTransform: "capitalize" }}>
                {role.toLowerCase().replace("_", " ")}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#3d5270", fontSize: 16, padding: 4, borderRadius: 6, transition: "color 0.15s" }}
              title="Sign out"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
