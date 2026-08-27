"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getInitials, formatDate, formatDateTime } from "@/lib/utils";

interface FollowUpRow {
  id: string;
  patient: string;
  day: number;
  scheduledAt: string;
  status: string;
  channel: string;
  message: string;
  sentAt: string | null;
}

interface FollowUpStats {
  total: number;
  sentThisMonth: number;
  pending: number;
  responseRate: number;
}

interface Candidate {
  patientId: string;
  patient: string;
  appointmentId: string | null;
}

interface FollowUpsClientProps {
  followUps: FollowUpRow[];
  stats: FollowUpStats;
  candidates: Candidate[];
}

const dayBadge = (day: number) => {
  if (day === 3) return "badge-teal";
  if (day === 7) return "badge-blue";
  if (day === 15) return "badge-purple";
  return "badge-amber";
};

const statusBadge = (status: string) => {
  if (status === "SENT") return "badge-green";
  if (status === "PENDING") return "badge-blue";
  if (status === "FAILED") return "badge-red";
  return "badge-gray";
};

export default function FollowUpsClient({ followUps, stats, candidates }: FollowUpsClientProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("All");
  const [dayFilter, setDayFilter] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genError, setGenError] = useState("");

  const filtered = followUps.filter((f) => {
    const matchStatus = statusFilter === "All" || f.status === statusFilter;
    const matchDay = dayFilter === "All" || f.day === +dayFilter;
    return matchStatus && matchDay;
  });

  function toggleSelect(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function generateForPatient(patientId: string, appointmentId: string | null) {
    setGenerating(true);
    setGenError("");
    try {
      const res = await fetch("/api/ai/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, appointmentId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to generate follow-ups");
      }
      setShowGenerateModal(false);
      router.refresh();
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Failed to generate follow-ups");
    } finally {
      setGenerating(false);
    }
  }

  const stats_ = [
    { label: "Total Follow-Ups", value: String(stats.total), icon: "🤖", color: "teal" },
    { label: "Sent This Month", value: String(stats.sentThisMonth), icon: "✅", color: "cyan" },
    { label: "Pending", value: String(stats.pending), icon: "⏳", color: "amber" },
    { label: "Response Rate", value: `${stats.responseRate}%`, icon: "📬", color: "violet" },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Follow-Up System</h1>
          <p className="page-subtitle">Automated patient engagement powered by AI</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" onClick={() => setShowGenerateModal(true)}>🤖 Generate Follow-Ups</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 24 }}>
        {stats_.map((s, i) => (
          <div key={s.label} className={`kpi-card ${s.color} animate-fade-in delay-${i * 100}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 11, color: "#4d6280", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</p>
                <h3 style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", margin: "6px 0 0" }}>{s.value}</h3>
              </div>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><div className="card-title">🤖 How AI Follow-Ups Work</div></div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {[
              { day: "Day 3", icon: "👋", title: "Check-In", desc: "AI asks how the patient is feeling after their appointment.", color: "#14b8a6" },
              { day: "Day 7", icon: "💊", title: "Symptom Check", desc: "Asks about symptom improvement and medication adherence.", color: "#38bdf8" },
              { day: "Day 15", icon: "⏰", title: "Reminder", desc: "Medication reminder and lifestyle guidance message.", color: "#a78bfa" },
              { day: "Day 30", icon: "📅", title: "Re-engagement", desc: "Invites the patient to book their next follow-up appointment.", color: "#fbbf24" },
            ].map((step) => (
              <div key={step.day} style={{ textAlign: "center", padding: "20px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{step.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: step.color, marginBottom: 4 }}>{step.day}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>{step.title}</div>
                <div style={{ fontSize: 12, color: "#4d6280", lineHeight: 1.6 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="tab-pills">
          {["All", "PENDING", "SENT", "FAILED"].map((s) => (
            <button key={s} className={`tab-pill ${statusFilter === s ? "active" : ""}`} onClick={() => setStatusFilter(s)}>
              {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <select className="form-select" style={{ width: 160 }} value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
          <option value="All">All Days</option>
          <option value="3">Day 3</option>
          <option value="7">Day 7</option>
          <option value="15">Day 15</option>
          <option value="30">Day 30</option>
        </select>
        {selected.length > 0 && (
          <span style={{ display: "flex", alignItems: "center", fontSize: 13, color: "#14b8a6" }}>
            {selected.length} selected
          </span>
        )}
      </div>

      {/* Follow-ups table */}
      <div className="card animate-fade-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" onChange={(e) => setSelected(e.target.checked ? filtered.map((f) => f.id) : [])}
                  style={{ accentColor: "#14b8a6", width: 14, height: 14 }} />
              </th>
              <th>Patient</th>
              <th>Day</th>
              <th>Scheduled</th>
              <th>Message Preview</th>
              <th>Channel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id}>
                <td>
                  <input type="checkbox" checked={selected.includes(f.id)} onChange={() => toggleSelect(f.id)}
                    style={{ accentColor: "#14b8a6", width: 14, height: 14 }} />
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar-fallback" style={{ width: 30, height: 30, fontSize: 11 }}>
                      {getInitials(f.patient)}
                    </div>
                    <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500 }}>{f.patient}</span>
                  </div>
                </td>
                <td><span className={`badge ${dayBadge(f.day)}`}>Day {f.day}</span></td>
                <td style={{ fontSize: 13 }}>{formatDate(f.scheduledAt)}</td>
                <td style={{ fontSize: 12, color: "#6b82a0", maxWidth: 280 }}>
                  {f.message.length > 80 ? f.message.slice(0, 80) + "…" : f.message}
                </td>
                <td>
                  <span style={{ fontSize: 12 }}>
                    {f.channel === "EMAIL" ? "📧 Email" : f.channel === "SMS" ? "📱 SMS" : "💬 WhatsApp"}
                  </span>
                </td>
                <td><span className={`badge ${statusBadge(f.status)}`}>{f.status}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#4d6280", padding: 24 }}>
                  No follow-ups match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showGenerateModal && (
        <div className="modal-backdrop" onClick={() => setShowGenerateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Generate AI Follow-Ups</h2>
              <button onClick={() => setShowGenerateModal(false)} style={{ background: "none", border: "none", color: "#4d6280", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            {genError && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{genError}</div>}
            {candidates.length === 0 ? (
              <div style={{ color: "#4d6280", fontSize: 13 }}>No patients currently need follow-ups generated.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto" }}>
                {candidates.map((c) => (
                  <div key={c.patientId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                    <span style={{ fontSize: 13, color: "#e2e8f0" }}>{c.patient}</span>
                    <button
                      className="btn-primary"
                      style={{ padding: "4px 12px", fontSize: 12 }}
                      disabled={generating}
                      onClick={() => generateForPatient(c.patientId, c.appointmentId)}
                    >
                      {generating ? "Generating…" : "Generate"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
