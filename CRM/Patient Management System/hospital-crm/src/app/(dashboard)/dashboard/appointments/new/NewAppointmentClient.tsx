"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface PatientOption {
  id: string;
  name: string;
  mrn: string;
}

interface DoctorOption {
  id: string;
  name: string;
  specialization: string;
  fee: number;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
];

function formatSlotLabel(slot: string) {
  const [h, m] = slot.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function NewAppointmentClient({ patients, doctors }: { patients: PatientOption[]; doctors: DoctorOption[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId") ?? "";

  const [step, setStep] = useState(1);
  const [patientSearch, setPatientSearch] = useState("");
  const [form, setForm] = useState({
    patientId: preselectedPatientId,
    doctorId: "",
    date: "",
    time: "",
    type: "Consultation",
    chiefComplaint: "",
    notes: "",
  });
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const selectedPatient = patients.find((p) => p.id === form.patientId);
  const selectedDoctor = doctors.find((d) => d.id === form.doctorId);

  useEffect(() => {
    if (preselectedPatientId) {
      const p = patients.find((pp) => pp.id === preselectedPatientId);
      if (p) setPatientSearch(`${p.name} (${p.mrn})`);
    }
  }, [preselectedPatientId, patients]);

  const filteredPatients = useMemo(() => {
    if (!patientSearch) return [];
    const q = patientSearch.toLowerCase();
    return patients
      .filter((p) => p.name.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q))
      .slice(0, 8);
  }, [patientSearch, patients]);

  useEffect(() => {
    if (!form.doctorId || !form.date) {
      setBookedSlots([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/appointments?doctorId=${form.doctorId}&date=${form.date}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Array<{ scheduledAt: string; status: string }>) => {
        if (cancelled) return;
        const booked = data
          .filter((a) => ["SCHEDULED", "CONFIRMED", "CHECKED_IN"].includes(a.status))
          .map((a) => new Date(a.scheduledAt).toISOString().slice(11, 16));
        setBookedSlots(booked);
      })
      .catch(() => {
        if (!cancelled) setBookedSlots([]);
      });
    return () => {
      cancelled = true;
    };
  }, [form.doctorId, form.date]);

  async function handleSubmit() {
    setError("");
    setSubmitting(true);
    try {
      const scheduledAt = new Date(`${form.date}T${form.time}:00`).toISOString();
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: form.patientId,
          doctorId: form.doctorId,
          scheduledAt,
          duration: 30,
          type: form.type,
          chiefComplaint: form.chiefComplaint || undefined,
          notes: form.notes || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to book appointment");
      }
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/appointments"), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 20, animation: "bounce 0.5s ease" }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Appointment Booked!</h2>
          <p style={{ color: "#4d6280" }}>Confirmation email sent to patient. Redirecting…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Appointment</h1>
          <p className="page-subtitle">Schedule an appointment for a patient</p>
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 32 }}>
        {["Patient", "Doctor & Time", "Details", "Confirm"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: step > i + 1 ? "#0f766e" : step === i + 1 ? "linear-gradient(135deg,#0f766e,#0891b2)" : "rgba(255,255,255,0.05)",
                border: step >= i + 1 ? "none" : "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700,
                color: step >= i + 1 ? "white" : "#3d5270",
              }}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? "#e2e8f0" : "#3d5270" }}>{s}</span>
            </div>
            {i < 3 && <div style={{ width: 60, height: 1, background: step > i + 1 ? "#0f766e" : "rgba(255,255,255,0.08)", margin: "0 12px" }} />}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 680 }}>
        {step === 1 && (
          <div className="card animate-fade-in">
            <div className="card-header"><div className="card-title">👤 Patient Details</div></div>
            <div className="card-body">
              <div className="form-group" style={{ position: "relative" }}>
                <label className="form-label">Search Patient by Name or MRN *</label>
                <input
                  className="form-input"
                  placeholder="Arjun Sharma or MED240001"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setForm({ ...form, patientId: "" });
                  }}
                  id="patient-name-search"
                />
                {patientSearch && !form.patientId && filteredPatients.length > 0 && (
                  <div style={{ background: "#0f1c33", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, marginTop: 6, overflow: "hidden" }}>
                    {filteredPatients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setForm({ ...form, patientId: p.id });
                          setPatientSearch(`${p.name} (${p.mrn})`);
                        }}
                        style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: "#94a3b8", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      >
                        {p.name} · <span style={{ color: "#5eead4", fontFamily: "monospace" }}>{p.mrn}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.1)", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#5eead4", marginBottom: 4 }}>Tip</div>
                <div style={{ fontSize: 13, color: "#6b82a0" }}>For new patients, first <a href="/dashboard/patients" style={{ color: "#14b8a6" }}>register them</a> in the Patients module, then book an appointment.</div>
              </div>
              <button className="btn-primary" onClick={() => setStep(2)} disabled={!form.patientId} style={{ width: "100%", justifyContent: "center" }} id="step1-next">
                Continue →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="card animate-fade-in">
            <div className="card-header"><div className="card-title">👨‍⚕️ Select Doctor & Time</div></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Doctor *</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {doctors.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setForm({ ...form, doctorId: d.id, time: "" })}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                        background: form.doctorId === d.id ? "rgba(20,184,166,0.1)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${form.doctorId === d.id ? "rgba(20,184,166,0.3)" : "rgba(255,255,255,0.06)"}`,
                        borderRadius: 12, cursor: "pointer", transition: "all 0.15s",
                      }}
                      id={`doctor-${d.id}`}
                    >
                      <div className="avatar-fallback" style={{ width: 40, height: 40, fontSize: 14, flexShrink: 0 }}>
                        {d.name.split(" ").slice(1).map((n: string) => n[0]).join("")}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{d.name}</div>
                        <div style={{ fontSize: 12, color: "#4d6280" }}>{d.specialization}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#14b8a6" }}>₹{d.fee}</div>
                    </div>
                  ))}
                  {doctors.length === 0 && (
                    <div style={{ color: "#4d6280", fontSize: 13 }}>No doctors available.</div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value, time: "" })} id="appointment-date" />
              </div>
              {form.date && (
                <div className="form-group">
                  <label className="form-label">Time Slot *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {timeSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = form.time === slot;
                      return (
                        <button
                          key={slot}
                          disabled={isBooked}
                          onClick={() => !isBooked && setForm({ ...form, time: slot })}
                          id={`time-slot-${slot.replace(/[: ]/g, "-")}`}
                          style={{
                            padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 500,
                            border: `1px solid ${isSelected ? "rgba(20,184,166,0.4)" : isBooked ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)"}`,
                            background: isSelected ? "rgba(20,184,166,0.15)" : isBooked ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.04)",
                            color: isSelected ? "#5eead4" : isBooked ? "#2d3d55" : "#94a3b8",
                            cursor: isBooked ? "not-allowed" : "pointer",
                          }}
                        >
                          {isBooked ? "✗" : ""} {formatSlotLabel(slot)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(3)} disabled={!form.doctorId || !form.date || !form.time} style={{ flex: 2, justifyContent: "center" }} id="step2-next">Continue →</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card animate-fade-in">
            <div className="card-header"><div className="card-title">📝 Appointment Details</div></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Appointment Type</label>
                <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} id="appointment-type">
                  <option>Consultation</option>
                  <option>Follow-Up</option>
                  <option>Initial Assessment</option>
                  <option>Review</option>
                  <option>Emergency</option>
                  <option>Procedure</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Chief Complaint *</label>
                <input className="form-input" placeholder="Primary reason for visit…" value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} id="chief-complaint" />
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea className="form-textarea" placeholder="Any relevant information for the doctor…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} id="appointment-notes" />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</button>
                <button className="btn-primary" onClick={() => setStep(4)} disabled={!form.chiefComplaint} style={{ flex: 2, justifyContent: "center" }} id="step3-next">Continue →</button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="card animate-fade-in">
            <div className="card-header"><div className="card-title">✓ Confirm Appointment</div></div>
            <div className="card-body">
              {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}
              <div style={{ background: "rgba(20,184,166,0.06)", border: "1px solid rgba(20,184,166,0.1)", borderRadius: 12, padding: 20, marginBottom: 20 }}>
                {[
                  { label: "Patient", value: selectedPatient?.name },
                  { label: "Doctor", value: selectedDoctor?.name },
                  { label: "Specialization", value: selectedDoctor?.specialization },
                  { label: "Date", value: form.date },
                  { label: "Time", value: formatSlotLabel(form.time) },
                  { label: "Type", value: form.type },
                  { label: "Chief Complaint", value: form.chiefComplaint },
                  { label: "Consultation Fee", value: `₹${selectedDoctor?.fee}` },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 13, color: "#4d6280" }}>{label}</span>
                    <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-secondary" onClick={() => setStep(3)} style={{ flex: 1 }}>← Back</button>
                <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ flex: 2, justifyContent: "center" }} id="confirm-appointment-btn">
                  {submitting ? "⏳ Booking…" : "✓ Confirm & Book"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
