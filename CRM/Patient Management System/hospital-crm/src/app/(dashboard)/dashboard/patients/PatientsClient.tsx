"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getInitials, formatDate, getAgeFromDOB } from "@/lib/utils";

interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: string;
  bloodGroup: string;
  phone: string | null;
  email: string | null;
  chronicConditions: string[];
  isActive: boolean;
  lastVisit: string | null;
}

const genderLabels: Record<string, string> = { MALE: "Male", FEMALE: "Female", OTHER: "Other" };

const emptyForm = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "MALE",
  phone: "",
  email: "",
  bloodGroup: "UNKNOWN",
  emergencyName: "",
  emergencyPhone: "",
  address: "",
  allergies: "",
};

export default function PatientsClient({ patients }: { patients: Patient[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [showNewModal, setShowNewModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = patients.filter((p) => {
    const name = `${p.firstName} ${p.lastName}`;
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase()) ||
      (p.email ?? "").toLowerCase().includes(search.toLowerCase());
    const status = p.isActive ? "Active" : "Inactive";
    const matchStatus = statusFilter === "All" || status === statusFilter;
    const matchGender = genderFilter === "All" || genderLabels[p.gender] === genderFilter;
    return matchSearch && matchStatus && matchGender;
  });

  async function handleCreate() {
    setError("");
    if (!form.firstName || !form.lastName) {
      setError("First name and last name are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          dateOfBirth: form.dateOfBirth || undefined,
          gender: form.gender,
          bloodGroup: form.bloodGroup,
          phone: form.phone || undefined,
          email: form.email || undefined,
          address: form.address || undefined,
          emergencyName: form.emergencyName || undefined,
          emergencyPhone: form.emergencyPhone || undefined,
          allergies: form.allergies
            ? form.allergies.split(",").map((a) => a.trim()).filter(Boolean)
            : [],
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to register patient");
      }
      setShowNewModal(false);
      setForm(emptyForm);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to register patient");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Patients</h1>
          <p className="page-subtitle">{patients.length} total patients · {patients.filter((p) => p.isActive).length} active</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-secondary">📤 Export</button>
          <button className="btn-primary" onClick={() => setShowNewModal(true)}>+ Register Patient</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#3d5270", fontSize: 14 }}>🔍</span>
              <input
                className="search-input"
                placeholder="Search by name, MRN, or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="patient-search"
              />
            </div>
            <select className="form-select" style={{ width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select className="form-select" style={{ width: 140 }} value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
              <option value="All">All Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card animate-fade-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>MRN</th>
              <th>Age / Gender</th>
              <th>Blood Group</th>
              <th>Contact</th>
              <th>Last Visit</th>
              <th>Chronic Conditions</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const name = `${p.firstName} ${p.lastName}`;
              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar-fallback" style={{ width: 36, height: 36, fontSize: 13 }}>
                        {getInitials(name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{name}</div>
                        <div style={{ fontSize: 12, color: "#4d6280" }}>{p.email ?? "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "#5eead4", background: "rgba(20,184,166,0.08)", padding: "2px 8px", borderRadius: 6 }}>
                      {p.mrn}
                    </span>
                  </td>
                  <td>{p.dateOfBirth ? `${getAgeFromDOB(p.dateOfBirth)}y` : "—"} · {genderLabels[p.gender] ?? p.gender}</td>
                  <td>
                    <span className="badge badge-teal">{p.bloodGroup.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")}</span>
                  </td>
                  <td style={{ fontSize: 13 }}>{p.phone ?? "—"}</td>
                  <td style={{ fontSize: 13 }}>{p.lastVisit ? formatDate(p.lastVisit) : "—"}</td>
                  <td style={{ fontSize: 13 }}>{p.chronicConditions.length > 0 ? p.chronicConditions.join(", ") : "—"}</td>
                  <td>
                    <span className={`badge ${p.isActive ? "badge-green" : "badge-gray"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link href={`/dashboard/patients/${p.id}`} className="btn-secondary" style={{ padding: "4px 12px", fontSize: 12 }}>
                        View
                      </Link>
                      <Link href={`/dashboard/appointments/new?patientId=${p.id}`} className="btn-primary" style={{ padding: "4px 12px", fontSize: 12 }}>
                        Book
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "60px 24px", textAlign: "center", color: "#3d5270" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div>No patients match your search.</div>
          </div>
        )}
      </div>

      {/* New Patient Modal */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Register New Patient</h2>
                <p style={{ color: "#4d6280", fontSize: 13, margin: "4px 0 0" }}>Fill in the patient&apos;s details below</p>
              </div>
              <button onClick={() => setShowNewModal(false)} style={{ background: "none", border: "none", color: "#4d6280", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input className="form-input" placeholder="Arjun" id="new-patient-first-name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input className="form-input" placeholder="Sharma" id="new-patient-last-name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" id="new-patient-dob" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" id="new-patient-gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+91 98765 43210" id="new-patient-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="patient@email.com" id="new-patient-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-select" id="new-patient-blood-group" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                  <option value="UNKNOWN">Unknown</option>
                  <option value="A_POSITIVE">A+</option><option value="A_NEGATIVE">A-</option>
                  <option value="B_POSITIVE">B+</option><option value="B_NEGATIVE">B-</option>
                  <option value="AB_POSITIVE">AB+</option><option value="AB_NEGATIVE">AB-</option>
                  <option value="O_POSITIVE">O+</option><option value="O_NEGATIVE">O-</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact</label>
                <input className="form-input" placeholder="Name" id="new-patient-emergency" value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Phone</label>
                <input className="form-input" placeholder="Phone" id="new-patient-emergency-phone" value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Address</label>
                <input className="form-input" placeholder="Street, City, State" id="new-patient-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Known Allergies</label>
                <input className="form-input" placeholder="Penicillin, Peanuts, Latex (comma separated)" id="new-patient-allergies" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn-secondary" onClick={() => setShowNewModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: "center" }} id="save-patient-btn" onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : "✓ Register Patient"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
