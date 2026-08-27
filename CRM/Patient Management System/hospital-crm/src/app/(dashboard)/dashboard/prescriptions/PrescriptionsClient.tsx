"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getInitials, formatDate } from "@/lib/utils";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface Prescription {
  id: string;
  patient: string;
  mrn: string;
  patientId: string;
  medications: Medication[];
  instructions: string | null;
  issuedAt: string;
  validUntil: string | null;
  status: "ACTIVE" | "EXPIRED";
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
}

interface Kpi {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const statusColors: Record<string, string> = {
  ACTIVE: "badge-green",
  EXPIRED: "badge-gray",
};

export default function PrescriptionsClient({
  prescriptions,
  patients,
  kpis,
}: {
  prescriptions: Prescription[];
  patients: PatientOption[];
  kpis: Kpi[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showNewRx, setShowNewRx] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [patientId, setPatientId] = useState("");
  const [instructions, setInstructions] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [meds, setMeds] = useState<Medication[]>([
    { name: "", dosage: "", frequency: "Once daily", duration: "30 days" },
  ]);

  const filtered = prescriptions.filter((rx) => {
    const matchSearch =
      rx.patient.toLowerCase().includes(search.toLowerCase()) ||
      rx.mrn.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || rx.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function resetForm() {
    setPatientId("");
    setInstructions("");
    setValidUntil("");
    setMeds([{ name: "", dosage: "", frequency: "Once daily", duration: "30 days" }]);
    setError("");
  }

  async function handleCreate() {
    setError("");
    if (!patientId) {
      setError("Please select a patient");
      return;
    }
    const validMeds = meds.filter((m) => m.name && m.dosage && m.frequency && m.duration);
    if (validMeds.length === 0) {
      setError("Add at least one complete medication");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          medications: validMeds,
          instructions: instructions || undefined,
          validUntil: validUntil || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to issue prescription");
      }
      setShowNewRx(false);
      resetForm();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to issue prescription");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Prescriptions</h1>
          <p className="page-subtitle">{prescriptions.length} total prescriptions · {prescriptions.filter(r => r.status === "ACTIVE").length} active</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" onClick={() => setShowNewRx(true)} id="new-prescription-btn">+ New Prescription</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stats-grid animate-fade-in" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
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

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#3d5270" }}>🔍</span>
              <input
                className="search-input"
                placeholder="Search by patient or MRN…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="rx-search"
              />
            </div>
            {["All", "ACTIVE", "EXPIRED"].map((s) => (
              <button key={s} className={`tab-pill ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)} id={`filter-rx-${s.toLowerCase()}`}>
                {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((rx) => (
          <div key={rx.id} className="card" style={{ overflow: "visible" }}>
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
              onClick={() => setExpandedId(expandedId === rx.id ? null : rx.id)}>
              <div className="avatar-fallback" style={{ width: 42, height: 42, fontSize: 15, borderRadius: 12, flexShrink: 0 }}>
                {getInitials(rx.patient)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{rx.patient}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "#5eead4", background: "rgba(20,184,166,0.08)", padding: "1px 7px", borderRadius: 5 }}>{rx.mrn}</span>
                  <span className={`badge ${statusColors[rx.status]}`}>{rx.status}</span>
                </div>
                <div style={{ fontSize: 12, color: "#4d6280", marginTop: 3 }}>
                  {formatDate(rx.issuedAt)}{rx.validUntil ? ` · valid until ${formatDate(rx.validUntil)}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: "#4d6280" }}>{rx.medications.length} drug{rx.medications.length !== 1 ? "s" : ""}</span>
                <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); window.print(); }}>🖨️ Print</button>
                <span style={{ color: "#4d6280", fontSize: 16 }}>{expandedId === rx.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {expandedId === rx.id && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "16px 20px" }}>
                {rx.instructions && (
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
                    <strong style={{ color: "#e2e8f0" }}>Instructions: </strong>{rx.instructions}
                  </div>
                )}
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rx.medications.map((med, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>💊</span>
                            <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{med.name}</span>
                          </div>
                        </td>
                        <td><span className="badge badge-teal">{med.dosage}</span></td>
                        <td style={{ fontSize: 13 }}>{med.frequency}</td>
                        <td style={{ fontSize: 13, color: "#94a3b8" }}>{med.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#3d5270" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💊</div>
            <div>No prescriptions match your search.</div>
          </div>
        )}
      </div>

      {/* New Prescription Modal */}
      {showNewRx && (
        <div className="modal-backdrop" onClick={() => setShowNewRx(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>New Prescription</h2>
                <p style={{ color: "#4d6280", fontSize: 13, margin: "4px 0 0" }}>Issue a prescription for a patient</p>
              </div>
              <button onClick={() => setShowNewRx(false)} style={{ background: "none", border: "none", color: "#4d6280", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Patient *</label>
                <select className="form-select" id="rx-patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                  <option value="">Select patient…</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Valid Until</label>
                <input className="form-input" type="date" id="rx-valid-until" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>

            {/* Medications */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>💊 Medications</div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr 2fr auto", gap: 8, marginBottom: 8 }}>
                {["Drug Name", "Dose", "Frequency", "Duration", ""].map((h) => (
                  <div key={h} style={{ fontSize: 11, color: "#3d5270", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
                ))}
              </div>
              {meds.map((med, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr 2fr auto", gap: 8, marginBottom: 8 }}>
                  <input className="form-input" placeholder="e.g. Amlodipine" value={med.name}
                    onChange={(e) => { const n = [...meds]; n[i].name = e.target.value; setMeds(n); }} id={`rx-med-${i}`} />
                  <input className="form-input" placeholder="5mg" value={med.dosage}
                    onChange={(e) => { const n = [...meds]; n[i].dosage = e.target.value; setMeds(n); }} id={`rx-dose-${i}`} />
                  <select className="form-select" value={med.frequency}
                    onChange={(e) => { const n = [...meds]; n[i].frequency = e.target.value; setMeds(n); }}>
                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>Three times daily</option>
                    <option>Before meals</option>
                    <option>After meals</option>
                    <option>At bedtime</option>
                  </select>
                  <input className="form-input" placeholder="30 days" value={med.duration}
                    onChange={(e) => { const n = [...meds]; n[i].duration = e.target.value; setMeds(n); }} id={`rx-dur-${i}`} />
                  <button onClick={() => setMeds(meds.filter((_, j) => j !== i))}
                    style={{ background: "none", border: "none", color: "#4d6280", cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
              ))}
              <button onClick={() => setMeds([...meds, { name: "", dosage: "", frequency: "Once daily", duration: "30 days" }])}
                className="btn-secondary" style={{ fontSize: 13 }} id="add-rx-med">+ Add Medication</button>
            </div>

            <div className="form-group">
              <label className="form-label">Instructions to Patient</label>
              <textarea className="form-textarea" rows={2} placeholder="Take with food, avoid alcohol, return if symptoms worsen…"
                value={instructions} onChange={(e) => setInstructions(e.target.value)} id="rx-instructions" />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-secondary" onClick={() => setShowNewRx(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: "center" }} id="save-rx-btn" onClick={handleCreate} disabled={saving}>
                {saving ? "Issuing…" : "💊 Issue Prescription"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
