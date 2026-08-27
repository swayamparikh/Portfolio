"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface Hospital {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  subscriptionPlan: string;
  isActive: boolean;
  createdAt: string;
  patients: number;
  doctors: number;
  subscriptionStatus: string;
}

const planColors: Record<string, string> = {
  FREE: "badge-gray",
  STARTER: "badge-blue",
  PROFESSIONAL: "badge-purple",
  ENTERPRISE: "badge-teal",
};

export default function HospitalsClient({ hospitals }: { hospitals: Hospital[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", city: "", email: "", phone: "", subscriptionPlan: "FREE" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    setError("");
    if (!form.name || !form.slug) {
      setError("Name and slug are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create hospital");
      }
      setShowAddModal(false);
      setForm({ name: "", slug: "", city: "", email: "", phone: "", subscriptionPlan: "FREE" });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create hospital");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(h: Hospital) {
    await fetch(`/api/hospitals/${h.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !h.isActive }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hospitals</h1>
          <p className="page-subtitle">{hospitals.length} hospitals · {hospitals.filter((h) => h.isActive).length} active</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ Add Hospital</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <input
            className="search-input"
            placeholder="Search hospitals…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Hospital</th>
              <th>City</th>
              <th>Plan</th>
              <th>Subscription</th>
              <th>Patients</th>
              <th>Doctors</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((h) => (
              <tr key={h.id}>
                <td>
                  <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{h.name}</div>
                  <div style={{ fontSize: 12, color: "#4d6280" }}>{h.slug}</div>
                </td>
                <td>{h.city ?? "—"}</td>
                <td><span className={`badge ${planColors[h.subscriptionPlan] ?? "badge-gray"}`}>{h.subscriptionPlan}</span></td>
                <td>{h.subscriptionStatus}</td>
                <td>{h.patients}</td>
                <td>{h.doctors}</td>
                <td style={{ fontSize: 13 }}>{formatDate(h.createdAt)}</td>
                <td>
                  <span className={`badge ${h.isActive ? "badge-green" : "badge-gray"}`}>
                    {h.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: 12 }} onClick={() => toggleActive(h)}>
                    {h.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", color: "#4d6280", padding: 24 }}>
                  No hospitals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Add Hospital</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: "#4d6280", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Slug *</label>
                <input className="form-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-hospital" />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Plan</label>
                <select className="form-select" value={form.subscriptionPlan} onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })}>
                  <option>FREE</option>
                  <option>STARTER</option>
                  <option>PROFESSIONAL</option>
                  <option>ENTERPRISE</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="btn-secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: "center" }} onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : "✓ Add Hospital"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
