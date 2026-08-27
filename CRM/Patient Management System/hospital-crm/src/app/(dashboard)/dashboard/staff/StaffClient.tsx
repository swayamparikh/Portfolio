"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getInitials, formatDate } from "@/lib/utils";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  specialization: string;
  shift: string;
  joinedAt: string;
  phone: string | null;
  email: string;
  patients: number;
  isAvailable: boolean;
}

interface Department {
  id: string;
  name: string;
}

const roleColors: Record<string, string> = {
  Doctor: "badge-teal",
  Nurse: "badge-purple",
  Receptionist: "badge-blue",
  Admin: "badge-amber",
  Technician: "badge-amber",
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  designation: "",
  departmentId: "",
  shift: "Morning",
  role: "RECEPTIONIST",
};

export default function StaffClient({ staff, departments }: { staff: StaffMember[]; departments: Department[] }) {
  const router = useRouter();
  const [deptFilter, setDeptFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const departmentNames = ["All", ...departments.map((d) => d.name)];
  const roleOptions = ["Doctor", "Nurse", "Receptionist", "Admin", "Technician"];

  const filtered = staff.filter((s) => {
    const matchDept = deptFilter === "All" || s.department === deptFilter;
    const matchRole = roleFilter === "All" || s.role === roleFilter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchRole && matchSearch;
  });

  async function handleCreate() {
    setError("");
    if (!form.name || !form.email || !form.designation) {
      setError("Name, email and designation are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          designation: form.designation,
          departmentId: form.departmentId || undefined,
          shift: form.shift,
          role: form.role,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to add staff member");
      }
      setShowAddModal(false);
      setForm(emptyForm);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add staff member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Management</h1>
          <p className="page-subtitle">{staff.length} team members · {staff.filter(s => s.isAvailable).length} available today</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="tab-pills">
            <button className={`tab-pill ${viewMode === "cards" ? "active" : ""}`} onClick={() => setViewMode("cards")}>⊞ Cards</button>
            <button className={`tab-pill ${viewMode === "table" ? "active" : ""}`} onClick={() => setViewMode("table")}>☰ Table</button>
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Staff</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#3d5270" }}>🔍</span>
              <input className="search-input" placeholder="Search staff…" value={search} onChange={(e) => setSearch(e.target.value)} id="staff-search" />
            </div>
            <select className="form-select" style={{ width: 160 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="All">All Roles</option>
              {roleOptions.map((r) => <option key={r}>{r}</option>)}
            </select>
            <select className="form-select" style={{ width: 200 }} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              {departmentNames.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {viewMode === "cards" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }} className="animate-fade-in">
          {filtered.map((member) => (
            <div key={member.id} className="card" style={{ position: "relative", overflow: "visible" }}>
              <div className="card-body">
                <div style={{ position: "absolute", top: 16, right: 16 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: member.isAvailable ? "#10b981" : "#6b7280", display: "inline-block", boxShadow: member.isAvailable ? "0 0 8px rgba(16,185,129,0.5)" : "none" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div className="avatar-fallback" style={{ width: 52, height: 52, fontSize: 18, borderRadius: 16 }}>
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 15 }}>{member.name}</div>
                    <div style={{ fontSize: 12, color: "#4d6280" }}>{member.specialization}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                  <span className={`badge ${roleColors[member.role] ?? "badge-gray"}`}>{member.role}</span>
                  <span className="badge badge-gray">{member.department}</span>
                  <span className="badge badge-gray">{member.shift}</span>
                </div>
                <div style={{ fontSize: 12, color: "#4d6280", marginBottom: 4 }}>📧 {member.email}</div>
                <div style={{ fontSize: 12, color: "#4d6280", marginBottom: 12 }}>📞 {member.phone ?? "—"}</div>
                {member.role === "Doctor" && (
                  <div style={{ background: "rgba(20,184,166,0.06)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "#4d6280" }}>Total Appointments</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#14b8a6" }}>{member.patients}</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-secondary" style={{ flex: 1, fontSize: 12, justifyContent: "center" }}>View Profile</button>
                  <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }}>📅</button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: "60px 24px", textAlign: "center", color: "#3d5270" }}>
              No staff members match your search.
            </div>
          )}
        </div>
      ) : (
        <div className="card animate-fade-in">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Role</th>
                <th>Department</th>
                <th>Shift</th>
                <th>Joined</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar-fallback" style={{ width: 36, height: 36, fontSize: 13 }}>{getInitials(member.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{member.name}</div>
                        <div style={{ fontSize: 12, color: "#4d6280" }}>{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${roleColors[member.role] ?? "badge-gray"}`}>{member.role}</span></td>
                  <td>{member.department}</td>
                  <td>{member.shift}</td>
                  <td style={{ fontSize: 13 }}>{formatDate(member.joinedAt)}</td>
                  <td>
                    <span className={`badge ${member.isAvailable ? "badge-green" : "badge-gray"}`}>
                      {member.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: 12 }}>Edit</button>
                      <button className="btn-danger" style={{ padding: "4px 12px", fontSize: 12 }}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#4d6280", padding: 24 }}>No staff members match your search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Add Staff Member</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "#4d6280", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <p style={{ fontSize: 12, color: "#4d6280", marginBottom: 14 }}>
              Note: this form creates non-clinical staff (front-desk / admin) accounts. Doctor onboarding is managed separately.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" placeholder="Jane Smith" id="staff-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-select" id="staff-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="HOSPITAL_ADMIN">Admin</option>
                </select>
              </div>
              <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" placeholder="staff@hospital.com" id="staff-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="+91 98765 43210" id="staff-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" id="staff-dept" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })}>
                  <option value="">—</option>
                  {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Shift</label>
                <select className="form-select" id="staff-shift" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>
                  <option>Morning</option><option>Evening</option><option>Night</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Designation *</label>
                <input className="form-input" placeholder="e.g. Front Desk Executive" id="staff-designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn-secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: "center" }} id="save-staff-btn" onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : "✓ Add Staff Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
