"use client";

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

interface Kpi {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  patients: number;
}

interface DepartmentData {
  department: string;
  patients: number;
  revenue: number;
  satisfaction: number;
}

interface PatientFlow {
  hour: string;
  checkins: number;
}

interface DiagnosisDistribution {
  name: string;
  value: number;
  color: string;
}

interface DoctorPerformance {
  doctor: string;
  consultations: number;
  satisfaction: number;
  followups: number;
  revenue: number;
}

interface RadarDatum {
  metric: string;
  value: number;
}

interface AnalyticsClientProps {
  kpis: Kpi[];
  monthlyRevenue: MonthlyRevenue[];
  departmentData: DepartmentData[];
  patientFlowByHour: PatientFlow[];
  diagnosisDistribution: DiagnosisDistribution[];
  doctorPerformance: DoctorPerformance[];
  radarData: RadarDatum[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 16px" }}>
      <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 8 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 13, fontWeight: 600, margin: "2px 0" }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000 ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AnalyticsClient({
  kpis,
  monthlyRevenue,
  departmentData,
  patientFlowByHour,
  diagnosisDistribution,
  doctorPerformance,
  radarData,
}: AnalyticsClientProps) {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics & Insights</h1>
          <p className="page-subtitle">Performance metrics, trends, and hospital intelligence</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select className="form-select" style={{ width: 160 }} id="analytics-period">
            <option>Last 6 Months</option>
            <option>This Year</option>
            <option>Last Year</option>
          </select>
          <button className="btn-secondary">📤 Export Report</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid animate-fade-in" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className={`kpi-card ${kpi.color} animate-fade-in delay-${i * 100}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 11, color: "#4d6280", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>{kpi.label}</p>
                <h3 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", margin: "4px 0 0" }}>{kpi.value}</h3>
              </div>
              <div className="kpi-icon" style={{ background: "rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 20 }}>{kpi.icon}</span>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: kpi.positive ? "#10b981" : "#f59e0b" }}>
              {kpi.positive ? "↑" : "↓"} {kpi.change}
            </span>
          </div>
        ))}
      </div>

      {/* Revenue & Profit Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, marginBottom: 20 }} className="animate-fade-in delay-100">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue vs Expenses vs Profit</div>
              <div style={{ fontSize: 12, color: "#4d6280", marginTop: 2 }}>Monthly financial overview</div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: "#4d6280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4d6280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#4d6280" }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#14b8a6" strokeWidth={2} fill="url(#revG)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={2} fill="url(#expG)" />
                <Area type="monotone" dataKey="profit" name="Profit" stroke="#a78bfa" strokeWidth={2} fill="url(#profG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Diagnosis Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Diagnosis Distribution</div>
          </div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={diagnosisDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {diagnosisDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              {diagnosisDistribution.map((item) => (
                <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#6b82a0" }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Flow + Radar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, marginBottom: 20 }} className="animate-fade-in delay-200">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Patient Flow by Hour</div>
            <div style={{ fontSize: 12, color: "#4d6280" }}>Today's check-ins</div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={patientFlowByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="hour" tick={{ fill: "#4d6280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#4d6280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
                <Bar dataKey="checkins" name="Check-Ins" fill="url(#barGrad)" radius={[4, 4, 0, 0]}>
                  {patientFlowByHour.map((_, i) => (
                    <Cell key={i} fill={`rgba(20,184,166,${0.4 + (i / patientFlowByHour.length) * 0.6})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Performance Radar</div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "#4d6280", fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#3d5270", fontSize: 10 }} />
                <Radar name="Hospital" dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Performance Table */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="animate-fade-in delay-300">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Department Performance</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Patients</th>
                <th>Revenue</th>
                <th>Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept) => (
                <tr key={dept.department}>
                  <td style={{ color: "#e2e8f0", fontWeight: 500 }}>{dept.department}</td>
                  <td>{dept.patients}</td>
                  <td style={{ fontWeight: 600, color: "#14b8a6" }}>₹{(dept.revenue / 1000).toFixed(0)}k</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${dept.satisfaction}%`, height: "100%", background: dept.satisfaction >= 93 ? "#10b981" : "#38bdf8", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: "#94a3b8", minWidth: 32 }}>{dept.satisfaction}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Doctor Performance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Doctor Performance</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Consults</th>
                <th>Revenue</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {doctorPerformance.map((doc) => (
                <tr key={doc.doctor}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="avatar-fallback" style={{ width: 30, height: 30, fontSize: 11 }}>
                        {doc.doctor.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </div>
                      <span style={{ color: "#e2e8f0", fontWeight: 500, fontSize: 13 }}>{doc.doctor}</span>
                    </div>
                  </td>
                  <td>{doc.consultations}</td>
                  <td style={{ fontWeight: 600, color: "#14b8a6", fontSize: 13 }}>₹{(doc.revenue / 1000).toFixed(0)}k</td>
                  <td>
                    <span style={{ fontSize: 12, color: "#fbbf24" }}>★ {doc.satisfaction}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
