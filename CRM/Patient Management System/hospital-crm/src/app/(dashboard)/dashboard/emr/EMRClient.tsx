"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getInitials, formatDate } from "@/lib/utils";

interface Record {
  id: string;
  patient: string;
  mrn: string;
  patientId: string;
  doctor: string;
  diagnosis: string[];
  vitals: { bp?: string; pulse?: string | number; temp?: string | number; weight?: string | number; height?: string | number; spo2?: string | number };
  consultationNotes: string | null;
  treatmentPlan: string | null;
  createdAt: string;
  followUpDate: string | null;
  prescriptionCount: number;
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
}

interface DoctorOption {
  id: string;
  name: string;
  specialization: string;
}

export default function EMRClient({
  records,
  patients,
  doctors,
}: {
  records: Record[];
  patients: PatientOption[];
  doctors: DoctorOption[];
}) {
  const router = useRouter();
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [patientId, setPatientId] = useState("");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [vitals, setVitals] = useState({ bp: "", pulse: "", temp: "", weight: "", height: "", spo2: "" });
  const [complaint, setComplaint] = useState("");
  const [notes, setNotes] = useState("");
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [meds, setMeds] = useState([{ name: "", dosage: "", frequency: "", duration: "" }]);
  const [medInstructions, setMedInstructions] = useState("");

  const bmi = vitals.weight && vitals.height
    ? (parseFloat(vitals.weight) / Math.pow(parseFloat(vitals.height) / 100, 2)).toFixed(1)
    : "-";

  const filtered = records.filter((r) =>
    r.patient.toLowerCase().includes(search.toLowerCase()) ||
    r.mrn.toLowerCase().includes(search.toLowerCase())
  );

  function resetForm() {
    setPatientId("");
    setDoctorId(doctors[0]?.id ?? "");
    setVitals({ bp: "", pulse: "", temp: "", weight: "", height: "", spo2: "" });
    setComplaint("");
    setNotes("");
    setDiagnosisInput("");
    setTreatmentPlan("");
    setFollowUpDate("");
    setMeds([{ name: "", dosage: "", frequency: "", duration: "" }]);
    setMedInstructions("");
    setError("");
    setStep(1);
  }

  async function handleSave() {
    setError("");
    if (!patientId) {
      setError("Please select a patient");
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      const diagnosis = diagnosisInput
        .split(",")
        .map((d) => d.trim())
        .filter(Boolean);

      const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          doctorId: doctorId || undefined,
          consultationNotes: [complaint && `Chief complaint: ${complaint}`, notes].filter(Boolean).join("\n\n") || undefined,
          diagnosis,
          treatmentPlan: treatmentPlan || undefined,
          followUpDate: followUpDate || undefined,
          vitals: { ...vitals, bmi: bmi !== "-" ? bmi : undefined },
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save record");
      }
      const record = await res.json();

      const validMeds = meds.filter((m) => m.name && m.dosage && m.frequency && m.duration);
      if (validMeds.length > 0) {
        await fetch("/api/prescriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientId,
            medicalRecordId: record.id,
            medications: validMeds,
            instructions: medInstructions || undefined,
          }),
        });
      }

      setShowNewRecord(false);
      resetForm();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save record");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Medical Records (EMR)</h1>
          <p className="page-subtitle">Electronic patient records and consultation history</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewRecord(true)}>+ New Consultation Record</button>
      </div>

      {/* Records Table */}
      <div className="card animate-fade-in">
        <div className="card-header">
          <div className="card-title">Recent Consultations</div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#3d5270", fontSize: 13 }}>🔍</span>
            <input className="search-input" placeholder="Search records…" style={{ width: 240, paddingLeft: 32 }}
              value={search} onChange={(e) => setSearch(e.target.value)} id="emr-search" />
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Doctor</th>
              <th>Diagnoses</th>
              <th>Vitals (BP)</th>
              <th>Rx</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="avatar-fallback" style={{ width: 32, height: 32, fontSize: 12 }}>{getInitials(r.patient)}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{r.patient}</div>
                      <div style={{ fontSize: 11, color: "#3d5270", fontFamily: "monospace" }}>{r.mrn}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 13 }}>{formatDate(r.createdAt)}</td>
                <td style={{ fontSize: 13 }}>{r.doctor}</td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {r.diagnosis.length > 0
                      ? r.diagnosis.map((d) => (
                          <span key={d} style={{ fontSize: 11, color: "#94a3b8" }}>{d}</span>
                        ))
                      : <span style={{ fontSize: 11, color: "#3d5270" }}>—</span>}
                  </div>
                </td>
                <td>
                  <span style={{ fontFamily: "monospace", fontSize: 13, color: "#5eead4" }}>
                    {r.vitals?.bp ? `${r.vitals.bp} mmHg` : "—"}
                  </span>
                </td>
                <td style={{ fontSize: 13 }}>{r.prescriptionCount}</td>
                <td>
                  <Link href={`/patients/${r.patientId}`} className="btn-secondary" style={{ padding: "4px 12px", fontSize: 12 }}>
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#4d6280", padding: 24 }}>
                  No medical records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Consultation Record Modal */}
      {showNewRecord && (
        <div className="modal-backdrop" onClick={() => setShowNewRecord(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 760 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>New Consultation Record</h2>
                <p style={{ color: "#4d6280", fontSize: 13, margin: "4px 0 0" }}>
                  Step {step} of 3 — {step === 1 ? "Patient & Vitals" : step === 2 ? "Consultation Notes" : "Prescription"}
                </p>
              </div>
              <button onClick={() => setShowNewRecord(false)} style={{ background: "none", border: "none", color: "#4d6280", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}

            {step === 1 && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Patient *</label>
                    <select className="form-select" id="emr-patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                      <option value="">Select patient…</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.mrn})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Doctor</label>
                    <select className="form-select" id="emr-doctor" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>📊 Vitals</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { label: "Blood Pressure", placeholder: "120/80", key: "bp" as const, unit: "mmHg" },
                    { label: "Pulse Rate", placeholder: "72", key: "pulse" as const, unit: "bpm" },
                    { label: "Temperature", placeholder: "98.6", key: "temp" as const, unit: "°F" },
                    { label: "Weight", placeholder: "70", key: "weight" as const, unit: "kg" },
                    { label: "Height", placeholder: "170", key: "height" as const, unit: "cm" },
                    { label: "SpO₂", placeholder: "98", key: "spo2" as const, unit: "%" },
                  ].map((v) => (
                    <div key={v.key} className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">{v.label} <span style={{ color: "#3d5270" }}>({v.unit})</span></label>
                      <input
                        className="form-input"
                        placeholder={v.placeholder}
                        value={vitals[v.key]}
                        onChange={(e) => setVitals({ ...vitals, [v.key]: e.target.value })}
                        id={`vitals-${v.key}`}
                      />
                    </div>
                  ))}
                </div>
                {vitals.weight && vitals.height && (
                  <div style={{ background: "rgba(20,184,166,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
                    <span style={{ color: "#4d6280" }}>Calculated BMI: </span>
                    <strong style={{ color: parseFloat(bmi) > 30 ? "#f59e0b" : parseFloat(bmi) > 25 ? "#fbbf24" : "#10b981" }}>{bmi} kg/m²</strong>
                    <span style={{ color: "#3d5270", marginLeft: 8 }}>
                      {parseFloat(bmi) > 30 ? "(Obese)" : parseFloat(bmi) > 25 ? "(Overweight)" : parseFloat(bmi) > 18.5 ? "(Normal)" : "(Underweight)"}
                    </span>
                  </div>
                )}
                <button className="btn-primary" onClick={() => setStep(2)} style={{ width: "100%", justifyContent: "center" }} id="emr-step1-next">Continue →</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="form-group">
                  <label className="form-label">Chief Complaint</label>
                  <input className="form-input" placeholder="Primary reason for visit…" id="emr-complaint" value={complaint} onChange={(e) => setComplaint(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Notes</label>
                  <textarea className="form-textarea" rows={5} placeholder="Detailed clinical notes, patient history, examination findings…"
                    id="emr-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Diagnoses (comma separated)</label>
                  <input className="form-input" placeholder="Hypertension, Pre-diabetic…" id="emr-diagnosis"
                    value={diagnosisInput} onChange={(e) => setDiagnosisInput(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Treatment Plan</label>
                  <textarea className="form-textarea" rows={3} placeholder="Medications, lifestyle modifications, referrals, follow-up plan…"
                    id="emr-treatment" value={treatmentPlan} onChange={(e) => setTreatmentPlan(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Follow-Up Date</label>
                  <input className="form-input" type="date" id="emr-followup-date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
                  <button className="btn-primary" onClick={() => setStep(3)} style={{ flex: 2, justifyContent: "center" }} id="emr-step2-next">Continue →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", marginBottom: 12 }}>💊 Prescription (Optional)</div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 2fr 2fr", gap: 10, marginBottom: 8 }}>
                  {["Medication", "Dose", "Frequency", "Duration"].map((h) => (
                    <div key={h} style={{ fontSize: 11, color: "#3d5270", textTransform: "uppercase" }}>{h}</div>
                  ))}
                </div>
                {meds.map((med, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 2fr 2fr", gap: 10, marginBottom: 8 }}>
                    <input className="form-input" placeholder="Drug name" value={med.name}
                      onChange={(e) => { const n = [...meds]; n[i].name = e.target.value; setMeds(n); }} id={`med-name-${i}`} />
                    <input className="form-input" placeholder="10mg" value={med.dosage}
                      onChange={(e) => { const n = [...meds]; n[i].dosage = e.target.value; setMeds(n); }} id={`med-dose-${i}`} />
                    <input className="form-input" placeholder="Once daily" value={med.frequency}
                      onChange={(e) => { const n = [...meds]; n[i].frequency = e.target.value; setMeds(n); }} id={`med-freq-${i}`} />
                    <input className="form-input" placeholder="30 days" value={med.duration}
                      onChange={(e) => { const n = [...meds]; n[i].duration = e.target.value; setMeds(n); }} id={`med-dur-${i}`} />
                  </div>
                ))}
                <button onClick={() => setMeds([...meds, { name: "", dosage: "", frequency: "", duration: "" }])}
                  className="btn-secondary" style={{ fontSize: 13 }} id="add-emr-med">+ Add Medication</button>
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Additional Instructions</label>
                  <textarea className="form-textarea" rows={2} placeholder="Take with food, avoid alcohol, rest…"
                    id="med-instructions" value={medInstructions} onChange={(e) => setMedInstructions(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</button>
                  <button className="btn-primary" onClick={handleSave} style={{ flex: 2, justifyContent: "center" }} id="save-emr-btn" disabled={saving}>
                    {saving ? "Saving…" : "✓ Save Record"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
