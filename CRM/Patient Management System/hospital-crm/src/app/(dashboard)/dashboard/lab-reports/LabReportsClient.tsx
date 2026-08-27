"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getInitials, formatDate } from "@/lib/utils";

interface LabResult {
  parameter: string;
  value: string;
  unit?: string;
  normalRange?: string;
  flag?: string;
}

interface LabReport {
  id: string;
  patient: string;
  mrn: string;
  patientId: string;
  reportType: string;
  testName: string;
  results: LabResult[];
  fileUrl: string | null;
  notes: string | null;
  reportedAt: string;
  status: "COMPLETED" | "PENDING";
  findings: "Normal" | "Abnormal" | "Pending";
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

const reportTypeOptions = ["Hematology", "Biochemistry", "Radiology", "Cardiology", "Neurology", "Other"];

const typeColors: Record<string, string> = {
  Hematology: "badge-teal",
  Biochemistry: "badge-blue",
  Radiology: "badge-purple",
  Cardiology: "badge-red",
  Neurology: "badge-amber",
};

const statusColors: Record<string, string> = {
  COMPLETED: "badge-green",
  PENDING: "badge-amber",
};

const findingColors: Record<string, string> = {
  Normal: "#10b981",
  Abnormal: "#fbbf24",
  Pending: "#94a3b8",
};

export default function LabReportsClient({
  labReports,
  patients,
  kpis,
}: {
  labReports: LabReport[];
  patients: PatientOption[];
  kpis: Kpi[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [patientId, setPatientId] = useState("");
  const [testName, setTestName] = useState("");
  const [reportType, setReportType] = useState(reportTypeOptions[0]);
  const [fileUrl, setFileUrl] = useState("");
  const [notes, setNotes] = useState("");

  const categories = ["All", ...reportTypeOptions.filter((c) => c !== "Other")];

  const filtered = labReports.filter((r) => {
    const matchSearch =
      r.patient.toLowerCase().includes(search.toLowerCase()) ||
      r.testName.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "All" || r.reportType === categoryFilter;
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  function resetForm() {
    setPatientId("");
    setTestName("");
    setReportType(reportTypeOptions[0]);
    setFileUrl("");
    setNotes("");
    setError("");
  }

  async function handleUpload() {
    setError("");
    if (!patientId || !testName) {
      setError("Patient and test name are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/lab-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          reportType,
          testName,
          fileUrl: fileUrl || undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to upload report");
      }
      setShowUploadModal(false);
      resetForm();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to upload report");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lab Reports</h1>
          <p className="page-subtitle">{labReports.length} reports · {labReports.filter(r => r.status === "PENDING").length} pending review</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" onClick={() => setShowUploadModal(true)} id="upload-report-btn">⬆ Upload Report</button>
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

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#3d5270" }}>🔍</span>
              <input
                className="search-input"
                placeholder="Search by patient or test name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="lab-search"
              />
            </div>
            <select className="form-select" style={{ width: 180 }} value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)} id="lab-category-filter">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select className="form-select" style={{ width: 160 }} value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)} id="lab-status-filter">
              <option value="All">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((report) => (
          <div key={report.id} className="card">
            {/* Header Row */}
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
              onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}>
              {/* Avatar */}
              <div className="avatar-fallback" style={{ width: 42, height: 42, fontSize: 14, borderRadius: 12, flexShrink: 0 }}>
                {getInitials(report.patient)}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{report.patient}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "#5eead4", background: "rgba(20,184,166,0.08)", padding: "1px 7px", borderRadius: 5 }}>{report.mrn}</span>
                  <span className={`badge ${typeColors[report.reportType] ?? "badge-gray"}`}>{report.reportType}</span>
                </div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>{report.testName}</div>
                <div style={{ fontSize: 12, color: "#4d6280", marginTop: 2 }}>
                  {formatDate(report.reportedAt)}
                </div>
              </div>
              {/* Right side */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <div style={{ textAlign: "right" }}>
                  <span className={`badge ${statusColors[report.status]}`}>{report.status}</span>
                  <div style={{ fontSize: 11, marginTop: 4, color: findingColors[report.findings], fontWeight: 600 }}>
                    {report.findings}
                  </div>
                </div>
                <span style={{ color: "#4d6280", fontSize: 16 }}>{expandedId === report.id ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Expanded Results */}
            {expandedId === report.id && report.results.length > 0 && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "16px 20px" }}>
                {report.notes && (
                  <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
                    <strong style={{ color: "#e2e8f0" }}>Notes: </strong>{report.notes}
                  </div>
                )}
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Parameter</th>
                      <th>Value</th>
                      <th>Reference Range</th>
                      <th>Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.results.map((result, i) => (
                      <tr key={i}>
                        <td style={{ color: "#e2e8f0", fontWeight: 500 }}>{result.parameter}</td>
                        <td>
                          <span style={{
                            fontWeight: 700, fontSize: 14,
                            color: result.flag === "H" ? "#f87171" : result.flag === "L" ? "#fbbf24" : "#10b981"
                          }}>
                            {result.value} {result.unit}
                          </span>
                        </td>
                        <td style={{ fontSize: 13, color: "#6b82a0" }}>{result.normalRange}</td>
                        <td>
                          {result.flag ? (
                            <span className={`badge ${result.flag === "H" ? "badge-red" : "badge-amber"}`}>
                              {result.flag === "H" ? "↑ High" : "↓ Low"}
                            </span>
                          ) : (
                            <span className="badge badge-green">✓ Normal</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => window.print()}>🖨️ Print Report</button>
                  {report.fileUrl && (
                    <a href={report.fileUrl} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }}>📎 View File</a>
                  )}
                </div>
              </div>
            )}

            {expandedId === report.id && report.status !== "COMPLETED" && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "16px 20px", color: "#4d6280", fontSize: 13 }}>
                Results not yet available for this report.
                {report.notes && <div style={{ marginTop: 6 }}><strong style={{ color: "#e2e8f0" }}>Notes: </strong>{report.notes}</div>}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#3d5270" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧪</div>
            <div>No lab reports match your search.</div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Upload Lab Report</h2>
                <p style={{ color: "#4d6280", fontSize: 13, margin: "4px 0 0" }}>Link a report file to a patient record</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} style={{ background: "none", border: "none", color: "#4d6280", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Patient *</label>
                <select className="form-select" id="lab-upload-patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                  <option value="">Select patient…</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Test Name *</label>
                <input className="form-input" placeholder="CBC, MRI, ECG…" id="lab-test-name" value={testName} onChange={(e) => setTestName(e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Category</label>
                <select className="form-select" id="lab-category" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                  {reportTypeOptions.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">File URL</label>
                <input className="form-input" placeholder="https://…" id="lab-file-url" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Notes</label>
                <textarea className="form-textarea" rows={2} placeholder="Additional notes for the doctor…" id="lab-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn-secondary" onClick={() => setShowUploadModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: "center" }} id="save-lab-btn" onClick={handleUpload} disabled={saving}>
                {saving ? "Uploading…" : "⬆ Upload & Link Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
