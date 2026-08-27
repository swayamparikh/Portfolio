"use client";

import { useState } from "react";
import Link from "next/link";
import { getInitials, formatDate, getAgeFromDOB } from "@/lib/utils";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface PatientProfile {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string;
  bloodGroup: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  emergencyName: string | null;
  emergencyPhone: string | null;
  emergencyRelation: string | null;
  allergies: string[];
  currentMedications: string[];
  chronicConditions: string[];
  insuranceProvider: string | null;
  insuranceNumber: string | null;
  isActive: boolean;
}

const genderLabels: Record<string, string> = { MALE: "Male", FEMALE: "Female", OTHER: "Other" };

// NOTE: Consultations, Prescriptions, Lab Reports, Vitals, Follow-Ups, Timeline
// and Billing tabs below still use illustrative sample data — those entities
// (MedicalRecord, Prescription, LabReport, FollowUp, Invoice) are owned by the
// EMR/prescriptions/lab-reports/follow-ups/billing pages, which are out of
// scope for this pass. Only the patient bio/overview data below is wired to
// the real Patient record.
const vitalsHistory = [
  { date: "Jan", bp: 142, pulse: 88, spo2: 97 },
  { date: "Feb", bp: 138, pulse: 84, spo2: 97 },
  { date: "Mar", bp: 145, pulse: 90, spo2: 96 },
  { date: "Apr", bp: 135, pulse: 82, spo2: 98 },
  { date: "May", bp: 130, pulse: 79, spo2: 98 },
  { date: "Jun", bp: 128, pulse: 76, spo2: 99 },
];

const consultations = [
  { id: "c1", date: "2024-05-28", doctor: "Dr. Priya Mehta", type: "Review", notes: "BP improving with current medication. Continue Amlodipine. Advised low-sodium diet and 30 mins daily walk.", diagnosis: ["Hypertension - Controlled"], followUp: "1 month" },
  { id: "c2", date: "2024-04-15", doctor: "Dr. Priya Mehta", type: "Consultation", notes: "Patient reports mild headaches. BP 142/92 mmHg. Increased Amlodipine from 2.5mg to 5mg. Blood tests ordered.", diagnosis: ["Hypertension", "Mild headache"], followUp: "6 weeks" },
  { id: "c3", date: "2024-02-10", doctor: "Dr. Rahul Gupta", type: "Initial", notes: "First visit. Patient presents with elevated BP readings at home monitoring. BMI 28.4. Family history of hypertension and diabetes.", diagnosis: ["Hypertension - Stage 1"], followUp: "2 months" },
];

const prescriptions = [
  { id: "p1", date: "2024-05-28", doctor: "Dr. Priya Mehta", medications: [{ name: "Amlodipine", dosage: "5mg", frequency: "Once daily", duration: "3 months" }, { name: "Metformin", dosage: "500mg", frequency: "Twice daily with meals", duration: "3 months" }] },
];

const labReports = [
  { id: "l1", date: "2024-04-20", test: "Complete Blood Count (CBC)", status: "Normal", flag: false },
  { id: "l2", date: "2024-04-20", test: "Fasting Blood Glucose", status: "102 mg/dL", flag: true },
  { id: "l3", date: "2024-04-20", test: "HbA1c", status: "5.8%", flag: true },
  { id: "l4", date: "2024-04-20", test: "Lipid Profile", status: "LDL 118, HDL 42", flag: false },
];

const followUps = [
  { day: 3, status: "SENT", sentAt: "2024-05-31", message: "Hello Arjun, how are you feeling after your review appointment?" },
  { day: 7, status: "PENDING", scheduledAt: "2024-06-04", message: "Have your blood pressure readings been stable?" },
  { day: 15, status: "PENDING", scheduledAt: "2024-06-12", message: "Reminder to take your prescribed medication regularly." },
  { day: 30, status: "PENDING", scheduledAt: "2024-06-27", message: "Would you like to schedule your next follow-up appointment?" },
];

const tabs = ["Overview", "Consultations", "Prescriptions", "Lab Reports", "Vitals", "Follow-Ups", "Timeline", "Billing"];

export default function PatientProfileClient({ patient }: { patient: PatientProfile }) {
  const [activeTab, setActiveTab] = useState("Overview");
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState("");

  const patientId = patient.id;
  const name = `${patient.firstName} ${patient.lastName}`;
  const age = patient.dateOfBirth ? getAgeFromDOB(patient.dateOfBirth) : null;

  async function generateAISummary() {
    setAiSummaryLoading(true);
    // Simulated AI summary — no AI backend wired for this endpoint yet.
    await new Promise(r => setTimeout(r, 1800));
    setAiSummary(
      `**Patient Summary — ${name}${age ? ` (${age}${genderLabels[patient.gender]?.[0] ?? ""})` : ""}**\n\n` +
      `**Key Conditions:** ${patient.chronicConditions.length > 0 ? patient.chronicConditions.join(", ") : "None recorded"}\n\n` +
      `**Current Medications:** ${patient.currentMedications.length > 0 ? patient.currentMedications.join(", ") : "None recorded"}\n\n` +
      `**Known Allergies:** ${patient.allergies.length > 0 ? patient.allergies.join(", ") : "None recorded"}\n\n` +
      "**Note:** This is a placeholder summary. Connect an AI summarization endpoint to generate a real clinical synopsis from this patient's consultation history."
    );
    setAiSummaryLoading(false);
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28 }}>
        <div className="avatar-fallback" style={{ width: 72, height: 72, fontSize: 26, borderRadius: 20, flexShrink: 0 }}>
          {getInitials(name)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{name}</h1>
            <span className={`badge ${patient.isActive ? "badge-green" : "badge-gray"}`}>{patient.isActive ? "Active" : "Inactive"}</span>
            <span className="badge badge-teal">{patient.bloodGroup.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")}</span>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
            {[
              { label: "MRN", value: patient.mrn },
              { label: "Age", value: age !== null ? `${age}y` : "—" },
              { label: "Gender", value: genderLabels[patient.gender] ?? patient.gender },
              { label: "Phone", value: patient.phone ?? "—" },
              { label: "Insurance", value: patient.insuranceProvider ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} style={{ fontSize: 13 }}>
                <span style={{ color: "#3d5270" }}>{label}: </span>
                <span style={{ color: "#94a3b8", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Link href={`/dashboard/appointments/new?patientId=${patientId}`} className="btn-primary" style={{ fontSize: 13 }}>
            📅 Book Appointment
          </Link>
          <button className="btn-secondary" style={{ fontSize: 13 }}>📤 Export</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-pills" style={{ marginBottom: 24, flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button key={tab} className={`tab-pill ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)} id={`tab-${tab.toLowerCase().replace(" ", "-")}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "Overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="animate-fade-in">
          {/* Personal info */}
          <div className="card">
            <div className="card-header"><div className="card-title">👤 Personal Information</div></div>
            <div className="card-body">
              {[
                { label: "Full Name", value: name },
                { label: "Date of Birth", value: patient.dateOfBirth ? formatDate(patient.dateOfBirth, "MMMM d, yyyy") : "—" },
                { label: "Email", value: patient.email ?? "—" },
                { label: "Phone", value: patient.phone ?? "—" },
                { label: "Address", value: patient.address ?? "—" },
                {
                  label: "Emergency Contact",
                  value: patient.emergencyName
                    ? `${patient.emergencyName}${patient.emergencyRelation ? ` (${patient.emergencyRelation})` : ""}${patient.emergencyPhone ? ` · ${patient.emergencyPhone}` : ""}`
                    : "—",
                },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, gap: 12 }}>
                  <span style={{ fontSize: 13, color: "#4d6280", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#94a3b8", textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Medical info */}
          <div className="card">
            <div className="card-header"><div className="card-title">🩺 Medical Information</div></div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#4d6280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Allergies</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {patient.allergies.map((a) => (
                    <span key={a} className="badge badge-red">{a}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#4d6280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Chronic Conditions</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {patient.chronicConditions.map((c) => (
                    <span key={c} className="badge badge-amber">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#4d6280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Current Medications</div>
                {patient.currentMedications.map((m) => (
                  <div key={m} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13, color: "#94a3b8" }}>
                    <span style={{ color: "#14b8a6" }}>💊</span> {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="card" style={{ gridColumn: "1 / -1" }}>
            <div className="card-header">
              <div className="card-title">🤖 AI Medical Summary</div>
              <button className="btn-primary" onClick={generateAISummary} disabled={aiSummaryLoading} style={{ fontSize: 13 }}>
                {aiSummaryLoading ? "⏳ Generating…" : "✨ Generate AI Summary"}
              </button>
            </div>
            <div className="card-body">
              {aiSummary ? (
                <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{aiSummary}</div>
              ) : (
                <div style={{ color: "#3d5270", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                  Click &quot;Generate AI Summary&quot; to get an AI-powered analysis of this patient&apos;s medical history.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Consultations" && (
        <div className="animate-fade-in">
          {consultations.map((c) => (
            <div key={c.id} className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{c.type} — {c.date}</div>
                  <div style={{ fontSize: 13, color: "#4d6280" }}>{c.doctor}</div>
                </div>
                <span className="badge badge-teal">{c.followUp} follow-up</span>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#3d5270", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Consultation Notes</div>
                  <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7 }}>{c.notes}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#3d5270", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Diagnoses</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {c.diagnosis.map((d) => (
                      <span key={d} className="badge badge-blue">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Vitals" && (
        <div className="card animate-fade-in">
          <div className="card-header"><div className="card-title">📈 Vitals Trend</div></div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { label: "Blood Pressure", value: "128/84", unit: "mmHg", icon: "❤️" },
                { label: "Pulse Rate", value: "76", unit: "bpm", icon: "💓" },
                { label: "Temperature", value: "98.4", unit: "°F", icon: "🌡️" },
                { label: "Weight", value: "78", unit: "kg", icon: "⚖️" },
                { label: "SpO₂", value: "99", unit: "%", icon: "🫁" },
                { label: "BMI", value: "28.4", unit: "kg/m²", icon: "📏" },
              ].map((v) => (
                <div key={v.label} className="vital-item">
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{v.icon}</div>
                  <div className="vital-value">{v.value}</div>
                  <div className="vital-unit">{v.unit}</div>
                  <div className="vital-label">{v.label}</div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={vitalsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "#4d6280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4d6280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
                <Line type="monotone" dataKey="bp" name="Systolic BP" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="pulse" name="Pulse" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="spo2" name="SpO₂ %" stroke="#a78bfa" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "Prescriptions" && (
        <div className="animate-fade-in">
          {prescriptions.map((p) => (
            <div key={p.id} className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>Prescription — {p.date}</div>
                  <div style={{ fontSize: 13, color: "#4d6280" }}>Issued by {p.doctor}</div>
                </div>
                <button className="btn-secondary" style={{ fontSize: 12 }}>📄 Download PDF</button>
              </div>
              <div className="card-body">
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
                    {p.medications.map((m, i) => (
                      <tr key={i}>
                        <td style={{ color: "#e2e8f0", fontWeight: 500 }}>💊 {m.name}</td>
                        <td>{m.dosage}</td>
                        <td>{m.frequency}</td>
                        <td>{m.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Lab Reports" && (
        <div className="card animate-fade-in">
          <div className="card-header">
            <div className="card-title">🧪 Lab Reports</div>
            <button className="btn-primary" style={{ fontSize: 12 }}>+ Upload Report</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Test Name</th>
                <th>Result</th>
                <th>Flag</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labReports.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td style={{ color: "#e2e8f0" }}>{r.test}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.flag ? <span className="badge badge-amber">⚠️ Abnormal</span> : <span className="badge badge-green">✓ Normal</span>}
                  </td>
                  <td>
                    <button className="btn-secondary" style={{ fontSize: 12, padding: "4px 12px" }}>📄 View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "Follow-Ups" && (
        <div className="animate-fade-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {followUps.map((f) => (
              <div key={f.day} className="card" style={{ border: `1px solid ${f.status === "SENT" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.07)"}` }}>
                <div className="card-body">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#14b8a6" }}>Day {f.day}</div>
                    <span className={`badge ${f.status === "SENT" ? "badge-green" : "badge-blue"}`}>{f.status}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "#6b82a0", lineHeight: 1.6, marginBottom: 12 }}>{f.message}</p>
                  <div style={{ fontSize: 11, color: "#3d5270" }}>
                    {f.status === "SENT" ? `✓ Sent ${f.sentAt}` : `📅 Scheduled ${f.scheduledAt}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Timeline" && (
        <div className="card animate-fade-in">
          <div className="card-header"><div className="card-title">📍 Patient Medical Journey</div></div>
          <div className="card-body">
            <div className="timeline">
              {[
                { icon: "👤", title: "Patient Registered", date: "Jan 5, 2024", desc: "Initial registration at MediCRM. Personal and emergency contact details recorded." },
                { icon: "🩺", title: "First Consultation", date: "Feb 10, 2024", desc: "Presented with elevated BP (152/96). Diagnosed with Stage 1 Hypertension. Amlodipine 2.5mg started." },
                { icon: "🧪", title: "Lab Work Ordered", date: "Apr 15, 2024", desc: "CBC, Fasting glucose, HbA1c, Lipid profile tests ordered. FBG: 102 mg/dL, HbA1c: 5.8% — pre-diabetic range." },
                { icon: "💊", title: "Medication Adjusted", date: "Apr 15, 2024", desc: "Amlodipine increased to 5mg. Metformin 500mg added for pre-diabetes management." },
                { icon: "📅", title: "Follow-Up Review", date: "May 28, 2024", desc: "BP 128/84 — significant improvement. Lifestyle changes are working. Continue current medications." },
                { icon: "🤖", title: "AI Follow-Up Sent", date: "May 31, 2024", desc: "Day 3 automated follow-up email sent. Patient responded positively." },
              ].map((e, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>
                        <span style={{ marginRight: 8 }}>{e.icon}</span>{e.title}
                      </div>
                      <div style={{ fontSize: 13, color: "#6b82a0", lineHeight: 1.6 }}>{e.desc}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "#3d5270", flexShrink: 0 }}>{e.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "Billing" && (
        <div className="card animate-fade-in">
          <div className="card-header">
            <div className="card-title">💳 Billing History</div>
            <Link href={`/dashboard/billing/new?patientId=${patientId}`} className="btn-primary" style={{ fontSize: 13 }}>+ Create Invoice</Link>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Invoice #</th><th>Date</th><th>Services</th><th>Amount</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: "monospace", color: "#5eead4" }}>INV-MED-2024-0012</td>
                <td>2024-05-28</td>
                <td>Consultation + CBC</td>
                <td style={{ color: "#e2e8f0", fontWeight: 600 }}>₹2,500</td>
                <td><span className="badge badge-green">PAID</span></td>
                <td><button className="btn-secondary" style={{ fontSize: 12, padding: "4px 12px" }}>View</button></td>
              </tr>
              <tr>
                <td style={{ fontFamily: "monospace", color: "#5eead4" }}>INV-MED-2024-0007</td>
                <td>2024-04-15</td>
                <td>Consultation + Lab Panel</td>
                <td style={{ color: "#e2e8f0", fontWeight: 600 }}>₹4,200</td>
                <td><span className="badge badge-green">PAID</span></td>
                <td><button className="btn-secondary" style={{ fontSize: 12, padding: "4px 12px" }}>View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
