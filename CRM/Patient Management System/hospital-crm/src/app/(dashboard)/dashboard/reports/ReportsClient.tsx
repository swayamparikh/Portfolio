"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface PatientGrowth {
  month: string;
  new: number;
  returning: number;
}

interface DoctorPerformance {
  doctor: string;
  patients: number;
  appointments: number;
  revenue: number;
  rating: number;
}

interface DiagnosisBreakdown {
  name: string;
  value: number;
  color: string;
}

interface ReportsClientProps {
  monthlyRevenue: MonthlyRevenue[];
  patientGrowth: PatientGrowth[];
  newPatientsTotal: number;
  returningTotal: number;
  doctorPerformance: DoctorPerformance[];
  diagnosisBreakdown: DiagnosisBreakdown[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px" }}>
      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 6 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
          {p.name}: {p.dataKey.includes("revenue") || p.dataKey.includes("profit") || p.dataKey.includes("expenses") ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function ReportsClient({
  monthlyRevenue,
  patientGrowth,
  newPatientsTotal,
  returningTotal,
  doctorPerformance,
  diagnosisBreakdown,
}: ReportsClientProps) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Performance insights for your healthcare facility</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select className="form-select" style={{ width: 160 }}>
            <option>Last 6 months</option>
            <option>Last year</option>
            <option>This quarter</option>
          </select>
          <button className="btn-primary">📤 Export Report</button>
        </div>
      </div>

      {/* Revenue chart */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }} className="animate-fade-in">
        <div className="card">
          <div className="card-header"><div className="card-title">💰 Revenue vs Expenses</div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#4d6280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4d6280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#4d6280" }} />
                <Bar dataKey="revenue" name="Revenue" fill="#0f766e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#0891b2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnosis breakdown */}
        <div className="card">
          <div className="card-header"><div className="card-title">🩺 Top Diagnoses</div></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={diagnosisBreakdown} cx="50%" cy="50%" outerRadius={65} dataKey="value">
                  {diagnosisBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
              {diagnosisBreakdown.map((d) => (
                <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                    <span style={{ fontSize: 12, color: "#6b82a0" }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patient growth */}
      <div className="card animate-fade-in delay-100" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <div className="card-title">👥 Patient Growth</div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ fontSize: 13, color: "#6b82a0" }}>🟢 New: <strong style={{ color: "#10b981" }}>{newPatientsTotal}</strong></span>
            <span style={{ fontSize: 13, color: "#6b82a0" }}>🔵 Returning: <strong style={{ color: "#38bdf8" }}>{returningTotal}</strong></span>
          </div>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={patientGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#4d6280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4d6280", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="new" name="New Patients" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="returning" name="Returning Patients" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Doctor performance table */}
      <div className="card animate-fade-in delay-200">
        <div className="card-header">
          <div className="card-title">👨‍⚕️ Doctor Performance</div>
          <button className="btn-secondary" style={{ fontSize: 12 }}>📊 Export CSV</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Patients Seen</th>
              <th>Appointments</th>
              <th>Revenue Generated</th>
              <th>Patient Rating</th>
              <th>Retention Rate</th>
            </tr>
          </thead>
          <tbody>
            {doctorPerformance.map((d) => {
              const retention = Math.round((d.rating / 5) * 100);
              return (
              <tr key={d.doctor}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0f766e" }} />
                    <span style={{ color: "#e2e8f0", fontWeight: 500 }}>{d.doctor}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: "#14b8a6" }}>{d.patients}</td>
                <td>{d.appointments}</td>
                <td style={{ fontWeight: 600, color: "#e2e8f0" }}>₹{d.revenue.toLocaleString("en-IN")}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "#fbbf24" }}>★</span>
                    <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{d.rating}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                      <div style={{ width: `${retention}%`, height: "100%", background: "linear-gradient(90deg,#0f766e,#14b8a6)", borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>{retention}%</span>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
