"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  patient: string;
  mrn: string;
  patientId: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  status: string;
  dueDate: string | null;
  createdAt: string;
  paidAt: string | null;
}

interface PatientOption {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string;
}

interface Kpi {
  label: string;
  value: number;
  sub: string;
  icon: string;
  color: string;
  isCount?: boolean;
}

const statusColors: Record<string, string> = {
  DRAFT: "badge-gray",
  SENT: "badge-blue",
  PAID: "badge-green",
  OVERDUE: "badge-red",
  CANCELLED: "badge-gray",
};

export default function BillingClient({
  invoices,
  patients,
  kpis,
}: {
  invoices: Invoice[];
  patients: PatientOption[];
  kpis: Kpi[];
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("All");
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [patientId, setPatientId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState([
    { description: "Consultation Fee", quantity: 1, unitPrice: 800, category: "Consultation" },
  ]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = invoices.filter((i) => statusFilter === "All" || i.status === statusFilter);
  const total = lineItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const tax = total * 0.05;

  function addLineItem() {
    setLineItems([...lineItems, { description: "", quantity: 1, unitPrice: 0, category: "Consultation" }]);
  }

  function resetForm() {
    setPatientId("");
    setDueDate("");
    setNotes("");
    setLineItems([{ description: "Consultation Fee", quantity: 1, unitPrice: 800, category: "Consultation" }]);
    setError("");
  }

  async function handleCreate() {
    setError("");
    if (!patientId) {
      setError("Please select a patient");
      return;
    }
    if (lineItems.some((i) => !i.description)) {
      setError("All line items need a description");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          items: lineItems.map((i) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.quantity * i.unitPrice,
            category: i.category,
          })),
          taxRate: 0.05,
          discount: 0,
          dueDate: dueDate || undefined,
          notes: notes || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to create invoice");
      }
      setShowNewInvoice(false);
      resetForm();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create invoice");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(inv: Invoice, status: string) {
    setBusyId(inv.id);
    try {
      const res = await fetch(`/api/billing/${inv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Invoicing</h1>
          <p className="page-subtitle">Manage invoices, payments, and revenue</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" onClick={() => setShowNewInvoice(true)}>+ Create Invoice</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 24 }}>
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className={`kpi-card ${kpi.color} animate-fade-in delay-${i * 100}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 11, color: "#4d6280", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{kpi.label}</p>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: "#f1f5f9", margin: "4px 0 0" }}>
                  {kpi.isCount ? kpi.value : formatCurrency(kpi.value)}
                </h3>
              </div>
              <span style={{ fontSize: 22 }}>{kpi.icon}</span>
            </div>
            <div style={{ fontSize: 12, color: "#4d6280" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["All", "DRAFT", "SENT", "PAID", "OVERDUE"].map((s) => (
          <button
            key={s}
            className={`tab-pill ${statusFilter === s ? "active" : ""}`}
            onClick={() => setStatusFilter(s)}
            id={`filter-${s.toLowerCase()}`}
          >
            {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Invoices table */}
      <div className="card animate-fade-in">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Patient</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Services</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <span style={{ fontFamily: "monospace", fontSize: 12, color: "#5eead4", background: "rgba(20,184,166,0.08)", padding: "2px 8px", borderRadius: 6 }}>
                    {inv.invoiceNumber}
                  </span>
                </td>
                <td style={{ color: "#e2e8f0", fontWeight: 500 }}>{inv.patient}</td>
                <td style={{ fontSize: 13 }}>{formatDate(inv.createdAt)}</td>
                <td style={{ fontSize: 13, color: inv.status === "OVERDUE" ? "#f87171" : "inherit" }}>
                  {inv.dueDate ? formatDate(inv.dueDate) : "—"}
                </td>
                <td style={{ fontSize: 13 }}>{inv.items.map((it) => it.description).join(", ")}</td>
                <td style={{ fontWeight: 700, color: "#e2e8f0" }}>{formatCurrency(inv.totalAmount)}</td>
                <td><span className={`badge ${statusColors[inv.status]}`}>{inv.status}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    {inv.status === "DRAFT" && (
                      <button
                        className="btn-primary"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        disabled={busyId === inv.id}
                        onClick={() => updateStatus(inv, "SENT")}
                      >
                        Send
                      </button>
                    )}
                    {inv.status === "SENT" && (
                      <button
                        className="btn-primary"
                        style={{ padding: "4px 10px", fontSize: 12 }}
                        disabled={busyId === inv.id}
                        onClick={() => updateStatus(inv, "PAID")}
                      >
                        💳 Mark Paid
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "#4d6280", padding: 24 }}>
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Invoice Modal */}
      {showNewInvoice && (
        <div className="modal-backdrop" onClick={() => setShowNewInvoice(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 720 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>Create Invoice</h2>
                <p style={{ color: "#4d6280", fontSize: 13, margin: "4px 0 0" }}>Add line items to generate a patient invoice</p>
              </div>
              <button onClick={() => setShowNewInvoice(false)} style={{ background: "none", border: "none", color: "#4d6280", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {error && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Patient *</label>
                <select className="form-select" id="invoice-patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                  <option value="">Select patient…</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} ({p.mrn})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" id="invoice-due-date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            {/* Line items */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                {["Description", "Qty", "Unit Price", "Total", ""].map((h) => (
                  <div key={h} style={{ fontSize: 11, color: "#3d5270", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
                ))}
              </div>
              {lineItems.map((item, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1fr 1fr auto", gap: 8, marginBottom: 8 }}>
                  <input className="form-input" placeholder="Service description" value={item.description}
                    onChange={(e) => { const n = [...lineItems]; n[i].description = e.target.value; setLineItems(n); }}
                    id={`line-item-desc-${i}`} />
                  <input className="form-input" type="number" min="1" value={item.quantity}
                    onChange={(e) => { const n = [...lineItems]; n[i].quantity = +e.target.value; setLineItems(n); }}
                    id={`line-item-qty-${i}`} />
                  <input className="form-input" type="number" min="0" placeholder="0" value={item.unitPrice}
                    onChange={(e) => { const n = [...lineItems]; n[i].unitPrice = +e.target.value; setLineItems(n); }}
                    id={`line-item-price-${i}`} />
                  <div style={{ display: "flex", alignItems: "center", fontSize: 14, color: "#e2e8f0", fontWeight: 600 }}>
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                  <button onClick={() => setLineItems(lineItems.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#4d6280", cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
              ))}
              <button onClick={addLineItem} className="btn-secondary" style={{ fontSize: 13 }} id="add-line-item">+ Add Line Item</button>
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} id="invoice-notes" />
            </div>

            {/* Totals */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b82a0", marginBottom: 8 }}>
                <span>Subtotal</span><span>{formatCurrency(total)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b82a0", marginBottom: 8 }}>
                <span>GST (5%)</span><span>{formatCurrency(tax)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: "#14b8a6", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
                <span>Total</span><span>{formatCurrency(total + tax)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-secondary" onClick={() => setShowNewInvoice(false)} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" style={{ flex: 2, justifyContent: "center" }} id="save-invoice-btn" onClick={handleCreate} disabled={saving}>
                {saving ? "Saving…" : "✓ Create Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
