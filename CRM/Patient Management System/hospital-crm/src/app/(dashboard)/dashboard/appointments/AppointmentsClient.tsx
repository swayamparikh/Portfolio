"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getInitials } from "@/lib/utils";

interface Appointment {
  id: string;
  patient: string;
  doctor: string;
  scheduledAt: string;
  type: string;
  status: string;
  duration: number;
}

const statusColors: Record<string, string> = {
  SCHEDULED: "badge-blue",
  CONFIRMED: "badge-teal",
  CHECKED_IN: "badge-purple",
  COMPLETED: "badge-green",
  CANCELLED: "badge-red",
  NO_SHOW: "badge-orange",
};

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const start = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 35 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export default function AppointmentsClient({ appointments }: { appointments: Appointment[] }) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [statusFilter, setStatusFilter] = useState("All");
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const doctors = useMemo(() => [...new Set(appointments.map((a) => a.doctor))], [appointments]);

  const filtered = appointments.filter((a) => {
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    const matchDoctor = doctorFilter === "All" || a.doctor === doctorFilter;
    const matchDate = !dateFilter || a.scheduledAt.slice(0, 10) === dateFilter;
    return matchStatus && matchDoctor && matchDate;
  });

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">{appointments.length} total · {appointments.filter(a => a.status === "SCHEDULED" || a.status === "CONFIRMED").length} upcoming</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="tab-pills">
            <button className={`tab-pill ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>📋 List</button>
            <button className={`tab-pill ${view === "calendar" ? "active" : ""}`} onClick={() => setView("calendar")}>📅 Calendar</button>
          </div>
          <Link href="/dashboard/appointments/new" className="btn-primary">+ New Appointment</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ padding: "14px 20px" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <select className="form-select" style={{ width: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} id="status-filter">
              <option value="All">All Status</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
            <select className="form-select" style={{ width: 200 }} value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} id="doctor-filter">
              <option value="All">All Doctors</option>
              {doctors.map((d) => <option key={d}>{d}</option>)}
            </select>
            <input type="date" className="form-input" style={{ width: 180 }} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} id="date-filter" />
            {dateFilter && (
              <button className="btn-secondary" onClick={() => setDateFilter("")} style={{ fontSize: 12 }}>Clear date</button>
            )}
          </div>
        </div>
      </div>

      {view === "list" ? (
        <div className="card animate-fade-in">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((apt) => {
                const dt = new Date(apt.scheduledAt);
                return (
                  <tr key={apt.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div className="avatar-fallback" style={{ width: 32, height: 32, fontSize: 12 }}>
                          {getInitials(apt.patient)}
                        </div>
                        <span style={{ color: "#e2e8f0", fontWeight: 500, fontSize: 14 }}>{apt.patient}</span>
                      </div>
                    </td>
                    <td>{apt.doctor}</td>
                    <td>
                      <div style={{ fontSize: 14, color: "#e2e8f0" }}>{dt.toLocaleDateString()}</div>
                      <div style={{ fontSize: 12, color: "#5eead4", fontWeight: 600 }}>
                        {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td>{apt.type}</td>
                    <td>{apt.duration} min</td>
                    <td>
                      <span className={`badge ${statusColors[apt.status] ?? "badge-gray"}`}>
                        {apt.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={`/dashboard/appointments/${apt.id}`} className="btn-secondary" style={{ padding: "4px 12px", fontSize: 12 }}>View</Link>
                        {(apt.status === "SCHEDULED" || apt.status === "CONFIRMED") && (
                          <button className="btn-primary" style={{ padding: "4px 12px", fontSize: 12 }}>Check In</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#4d6280", padding: 24 }}>No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card animate-fade-in">
          <div className="card-header">
            <div className="card-title">{calendarMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: 13 }}
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
              >
                ← Prev
              </button>
              <button
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: 13 }}
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
              >
                Next →
              </button>
            </div>
          </div>
          <div className="card-body" style={{ padding: "8px 16px 16px" }}>
            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 4 }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#3d5270", fontWeight: 600, padding: "6px 0", textTransform: "uppercase" }}>{d}</div>
              ))}
            </div>
            <div className="calendar-grid">
              {calendarDays.map((day, i) => {
                const dateStr = day.toISOString().slice(0, 10);
                const dayApts = appointments.filter((a) => a.scheduledAt.slice(0, 10) === dateStr);
                const isToday = dateStr === todayStr;
                const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                return (
                  <div key={i} className={`calendar-cell ${isToday ? "today" : ""} ${!isCurrentMonth ? "other-month" : ""}`}>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? "#14b8a6" : "#6b82a0", marginBottom: 4 }}>
                      {day.getDate()}
                    </div>
                    {dayApts.slice(0, 3).map((a) => (
                      <div key={a.id} className="calendar-event" style={{
                        background: a.status === "COMPLETED" ? "rgba(16,185,129,0.15)" : "rgba(14,165,233,0.15)",
                        color: a.status === "COMPLETED" ? "#34d399" : "#38bdf8",
                      }}>
                        {new Date(a.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {a.patient.split(" ")[0]}
                      </div>
                    ))}
                    {dayApts.length > 3 && (
                      <div style={{ fontSize: 10, color: "#4d6280" }}>+{dayApts.length - 3} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
