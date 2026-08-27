"use client";

import Link from "next/link";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency, formatRelative } from "@/lib/utils";

interface KpiCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
  iconBg: string;
  iconColor: string;
  sub: string;
}

interface MonthlyPoint {
  month: string;
  revenue: number;
  patients: number;
  appointments: number;
}

interface StatusSlice {
  name: string;
  value: number;
  color: string;
}

interface TodayAppointment {
  id: string;
  time: string;
  patient: string;
  doctor: string;
  type: string;
  status: string;
}

interface ActivityItem {
  icon: string;
  text: string;
  time: string;
}

interface DashboardClientProps {
  kpiCards: KpiCard[];
  monthlyData: MonthlyPoint[];
  appointmentTypeData: StatusSlice[];
  todayAppointments: TodayAppointment[];
  recentActivity: ActivityItem[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px" }}>
      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
          {p.name}: {p.dataKey === "revenue" ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function DashboardClient({
  kpiCards,
  monthlyData,
  appointmentTypeData,
  todayAppointments,
  recentActivity,
}: DashboardClientProps) {
  return (
    <div>
      {/* KPI Cards */}
      <div className="stats-grid animate-fade-in" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {kpiCards.map((card, i) => (
          <div
            key={card.label}
            className={`kpi-card ${card.color} animate-fade-in delay-${i * 100}`}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 12, color: "#4d6280", fontWeight: 500, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.label}</p>
                <h3 style={{ fontSize: 28, fontWeight: 800, color: "#f1f5f9", margin: "4px 0 0" }}>{card.value}</h3>
              </div>
              <div className="kpi-icon" style={{ background: card.iconBg }}>
                <span style={{ fontSize: 20 }}>{card.icon}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: card.positive ? "#10b981" : "#f59e0b" }}>
                {card.positive ? "↑" : "↓"} {card.change}
              </span>
              <span style={{ fontSize: 12, color: "#3d5270" }}>· {card.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginBottom: 20 }} className="animate-fade-in delay-200">
        {/* Revenue + Appointments chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue & Appointments Trend</div>
              <div style={{ fontSize: 12, color: "#4d6280", marginTop: 2 }}>Last 6 months</div>
            </div>
            <select className="form-select" style={{ width: "auto", fontSize: 12, padding: "6px 10px" }}>
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="aptGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#4d6280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4d6280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#4d6280" }} />
                <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#14b8a6" strokeWidth={2} fill="url(#revGradient)" />
                <Area type="monotone" dataKey="appointments" name="Appointments" stroke="#38bdf8" strokeWidth={2} fill="url(#aptGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment status donut */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Appointment Status</div>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={appointmentTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {appointmentTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {appointmentTypeData.map((item) => (
                <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#6b82a0" }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }} className="animate-fade-in delay-300">
        {/* Today's appointments */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Today&apos;s Appointments</div>
            <Link href="/dashboard/appointments" className="btn-secondary" style={{ padding: "6px 14px", fontSize: 12 }}>
              View All
            </Link>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Type</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {todayAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td style={{ color: "#5eead4", fontWeight: 600, fontSize: 13 }}>{apt.time}</td>
                  <td style={{ color: "#e2e8f0", fontWeight: 500 }}>{apt.patient}</td>
                  <td>{apt.doctor}</td>
                  <td>{apt.type}</td>
                  <td>
                    <span className={`badge ${
                      apt.status === "COMPLETED" ? "badge-green" :
                      apt.status === "CHECKED_IN" ? "badge-purple" :
                      apt.status === "CONFIRMED" ? "badge-teal" :
                      "badge-blue"
                    }`}>
                      {apt.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <Link href={`/dashboard/appointments/${apt.id}`} style={{ color: "#0f766e", fontSize: 12, textDecoration: "none" }}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Activity</div>
          </div>
          <div className="card-body">
            <div className="timeline" style={{ paddingLeft: 24 }}>
              {recentActivity.map((item, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" />
                  <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
                    <span style={{ marginRight: 6 }}>{item.icon}</span>
                    {item.text}
                  </div>
                  <div style={{ fontSize: 11, color: "#3d5270", marginTop: 3 }}>{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
