import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import Link from "next/link";

export default async function PortalPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const patient = await prisma.patient.findUnique({
    where: { userId },
    include: {
      appointments: {
        orderBy: { scheduledAt: "desc" },
        take: 5,
        include: { doctor: { include: { user: true } } },
      },
      prescriptions: { orderBy: { issuedAt: "desc" }, take: 5 },
      labReports: { orderBy: { reportedAt: "desc" }, take: 5 },
      invoices: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!patient) {
    return (
      <div className="glass-card" style={{ padding: 24 }}>
        <p style={{ color: "#94a3b8" }}>
          No patient record is linked to this account yet. Please contact your hospital's front desk.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="glass-card" style={{ padding: 24 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: "#f1f5f9" }}>
          Welcome, {patient.firstName} {patient.lastName}
        </h2>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>MRN: {patient.mrn}</p>
        <div style={{ marginTop: 16 }}>
          <Link href="/dashboard/wellness" className="btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
            💬 Chat with AI Wellness Assistant
          </Link>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#e2e8f0" }}>📅 Recent Appointments</h3>
        {patient.appointments.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: 13 }}>No appointments yet.</p>
        ) : (
          patient.appointments.map((a) => (
            <div key={a.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "#cbd5e1" }}>
              {format(new Date(a.scheduledAt), "MMM d, yyyy h:mm a")} — Dr. {a.doctor.user.name} ({a.status})
            </div>
          ))
        )}
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#e2e8f0" }}>💊 Recent Prescriptions</h3>
        {patient.prescriptions.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: 13 }}>No prescriptions yet.</p>
        ) : (
          patient.prescriptions.map((p) => (
            <div key={p.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "#cbd5e1" }}>
              Issued {format(new Date(p.issuedAt), "MMM d, yyyy")} — {Array.isArray(p.medications) ? (p.medications as any[]).map((m) => m.name).join(", ") : ""}
            </div>
          ))
        )}
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#e2e8f0" }}>🧪 Recent Lab Reports</h3>
        {patient.labReports.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: 13 }}>No lab reports yet.</p>
        ) : (
          patient.labReports.map((l) => (
            <div key={l.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "#cbd5e1" }}>
              {format(new Date(l.reportedAt), "MMM d, yyyy")} — {l.testName} ({l.reportType})
            </div>
          ))
        )}
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#e2e8f0" }}>💳 Recent Invoices</h3>
        {patient.invoices.length === 0 ? (
          <p style={{ color: "#64748b", fontSize: 13 }}>No invoices yet.</p>
        ) : (
          patient.invoices.map((i) => (
            <div key={i.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "#cbd5e1" }}>
              {i.invoiceNumber} — ₹{i.totalAmount.toFixed(2)} ({i.status})
            </div>
          ))
        )}
      </div>
    </div>
  );
}
