"use client";

import { useState } from "react";
import { formatDateTime } from "@/lib/utils";

interface AuditLogRow {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  status: string;
}

interface AuditLogsClientProps {
  logs: AuditLogRow[];
  eventsToday: number;
  failedLogins: number;
  exports: number;
  activeSessions: number;
  forbidden?: boolean;
}

const actionColors: Record<string, string> = {
  CREATE: "badge-green",
  UPDATE: "badge-blue",
  DELETE: "badge-red",
  VIEW: "badge-gray",
  LOGIN: "badge-teal",
  LOGIN_FAIL: "badge-red",
  EXPORT: "badge-amber",
  UPLOAD: "badge-teal",
  AUTO: "badge-purple",
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "badge-red",
  HOSPITAL_ADMIN: "badge-amber",
  DOCTOR: "badge-teal",
  NURSE: "badge-purple",
  RECEPTIONIST: "badge-blue",
  TECHNICIAN: "badge-orange",
  SYSTEM: "badge-gray",
  "—": "badge-gray",
};

export default function AuditLogsClient({ logs, eventsToday, failedLogins, exports: exportsCount, activeSessions, forbidden }: AuditLogsClientProps) {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const actions = ["All", ...Array.from(new Set(logs.map((l) => l.action)))];

  const kpis = [
    { label: "Events Today", value: String(eventsToday), icon: "📋", color: "teal" },
    { label: "Failed Logins", value: String(failedLogins), icon: "🔐", color: "amber" },
    { label: "Data Exports", value: String(exportsCount), icon: "📤", color: "cyan" },
    { label: "Active Sessions", value: String(activeSessions), icon: "👤", color: "violet" },
  ];

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "All" || log.action === actionFilter;
    const matchStatus = statusFilter === "All" || log.status === statusFilter;
    return matchSearch && matchAction && matchStatus;
  });

  if (forbidden) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Audit Logs</h1>
            <p className="page-subtitle">Complete record of all system actions and access events</p>
          </div>
        </div>
        <div className="card">
          <div style={{ padding: "40px 24px", textAlign: "center", color: "#4d6280" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
            <div>You do not have permission to view audit logs.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Logs</h1>
          <p className="page-subtitle">Complete record of all system actions and access events</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary">📤 Export Logs</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stats-grid animate-fade-in" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className={`kpi-card ${kpi.color} animate-fade-in delay-${i * 100}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 11, color: "#4d6280", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{kpi.label}</p>
                <h3 style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", margin: "4px 0 0" }}>{kpi.value}</h3>
              </div>
              <span style={{ fontSize: 24 }}>{kpi.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {failedLogins > 0 && (
        <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>🔐</span>
          <div>
            <span style={{ color: "#fca5a5", fontWeight: 600, fontSize: 13 }}>Security Alert: </span>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>{failedLogins} failed login attempt{failedLogins === 1 ? "" : "s"} detected today.</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#3d5270" }}>🔍</span>
              <input
                className="search-input"
                placeholder="Search by user, resource, or action details…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="audit-search"
              />
            </div>
            <select className="form-select" style={{ width: 160 }} value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)} id="audit-action-filter">
              {actions.map(a => <option key={a}>{a}</option>)}
            </select>
            <select className="form-select" style={{ width: 140 }} value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)} id="audit-status-filter">
              <option value="All">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="card animate-fade-in">
        <div className="card-header">
          <div className="card-title">System Events ({filtered.length})</div>
          <div style={{ fontSize: 12, color: "#4d6280" }}>Latest 100 events</div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Details</th>
              <th>IP Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} style={{ borderLeft: log.status === "FAILED" ? "2px solid rgba(239,68,68,0.3)" : "2px solid transparent" }}>
                <td>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#5eead4" }}>{formatDateTime(log.timestamp)}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 500, color: "#e2e8f0", fontSize: 13 }}>{log.user}</div>
                </td>
                <td>
                  <span className={`badge ${roleColors[log.role] ?? "badge-gray"}`} style={{ fontSize: 10 }}>
                    {log.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${actionColors[log.action] ?? "badge-gray"}`}>{log.action}</span>
                </td>
                <td style={{ color: "#94a3b8", fontSize: 13 }}>{log.resource}</td>
                <td style={{ fontSize: 12, color: "#6b82a0", maxWidth: 280 }}>
                  <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.details}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "#4d6280" }}>
                    {log.ip}
                  </span>
                </td>
                <td>
                  <span className={`badge ${log.status === "SUCCESS" ? "badge-green" : "badge-red"}`}>
                    {log.status === "SUCCESS" ? "✓ OK" : "✗ FAIL"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "#3d5270" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div>No audit events match your filters.</div>
          </div>
        )}
        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#3d5270" }}>Showing {filtered.length} of {logs.length} events</span>
        </div>
      </div>
    </div>
  );
}
