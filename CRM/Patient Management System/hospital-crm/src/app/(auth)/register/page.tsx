"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const hospitalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  hospitalName: z.string().min(3, "Hospital name must be at least 3 characters"),
});

const patientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  bloodGroup: z.enum([
    "A_POSITIVE",
    "A_NEGATIVE",
    "B_POSITIVE",
    "B_NEGATIVE",
    "AB_POSITIVE",
    "AB_NEGATIVE",
    "O_POSITIVE",
    "O_NEGATIVE",
    "UNKNOWN",
  ]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

type HospitalForm = z.infer<typeof hospitalSchema>;
type PatientForm = z.infer<typeof patientSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"hospital" | "patient">("hospital");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const hospitalForm = useForm<HospitalForm>({
    resolver: zodResolver(hospitalSchema),
  });

  const patientForm = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: "OTHER",
      bloodGroup: "UNKNOWN",
    },
  });

  async function onHospitalSubmit(data: HospitalForm) {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hospital",
          name: data.name,
          email: data.email,
          password: data.password,
          hospitalName: data.hospitalName,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to register hospital");
      }

      setSuccess("Registration successful! Redirecting to login…");
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  async function onPatientSubmit(data: PatientForm) {
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "patient",
          email: data.email,
          password: data.password,
          name: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          gender: data.gender,
          bloodGroup: data.bloodGroup,
          dateOfBirth: data.dateOfBirth,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to register patient");
      }

      setSuccess(`Registration successful! MRN Assigned: ${result.mrn}. Redirecting to login…`);
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #060d1f 0%, #0a1628 50%, #060d1f 100%)" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12" style={{ background: "linear-gradient(135deg, rgba(15,118,110,0.12) 0%, rgba(8,145,178,0.08) 100%)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#0f766e,#0891b2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
            🏥
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>MediCRM</div>
            <div style={{ fontSize: 12, color: "#4d6280" }}>Healthcare Management Platform</div>
          </div>
        </Link>

        <div>
          <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 20, color: "#f1f5f9" }}>
            Join the Next Gen{" "}
            <span style={{ background: "linear-gradient(135deg,#14b8a6,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Healthcare
            </span>{" "}
            ecosystem
          </h1>
          <p style={{ fontSize: 15, color: "#4d6280", lineHeight: 1.7, marginBottom: 32 }}>
            Register your healthcare facility to streamline appointments, EMRs, and billing, or sign up as a patient for personalized care and secure AI wellness assistance.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "🌐", title: "Single Unified Workspace", desc: "Access patients, appointments, billing and records from anywhere" },
              { icon: "💊", title: "Comprehensive EMR Builder", desc: "Build patient histories, track vitals, and issue prescriptions in seconds" },
              { icon: "🤖", title: "AI-powered Follow-ups", desc: "Improve retention with automated day-offset checkins" },
            ].map((item) => (
              <div key={item.title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.05)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 13.5 }}>{item.title}</div>
                  <div style={{ color: "#4d6280", fontSize: 12.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ color: "#3d5270", fontSize: 12.5 }}>
          © 2026 MediCRM Inc. · HIPAA Compliant Portal
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12" style={{ overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 480 }} className="animate-fade-in">
          <div style={{ marginBottom: 30, textAlign: "center" }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Create your Account</h2>
            <p style={{ color: "#4d6280", fontSize: 14.5 }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#14b8a6", textDecoration: "underline", fontWeight: 500 }}>
                Sign In
              </Link>
            </p>
          </div>

          {/* Form Tabs */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: 4, marginBottom: 24 }}>
            <button
              onClick={() => { setTab("hospital"); setError(""); setSuccess(""); }}
              style={{
                flex: 1, padding: "8px 16px", borderRadius: 9, border: "none", fontSize: 13.5, fontWeight: 600,
                background: tab === "hospital" ? "linear-gradient(135deg, #0f766e, #0891b2)" : "transparent",
                color: tab === "hospital" ? "white" : "#6b82a0", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              🏢 Hospital / Clinic Admin
            </button>
            <button
              onClick={() => { setTab("patient"); setError(""); setSuccess(""); }}
              style={{
                flex: 1, padding: "8px 16px", borderRadius: 9, border: "none", fontSize: 13.5, fontWeight: 600,
                background: tab === "patient" ? "linear-gradient(135deg, #0f766e, #0891b2)" : "transparent",
                color: tab === "patient" ? "white" : "#6b82a0", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              👤 Patient Portal Account
            </button>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#f87171", fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#34d399", fontSize: 14 }}>
              ✅ {success}
            </div>
          )}

          {tab === "hospital" ? (
            <form onSubmit={hospitalForm.handleSubmit(onHospitalSubmit)}>
              <div className="form-group">
                <label className="form-label">Full Name (Administrator)</label>
                <input
                  {...hospitalForm.register("name")}
                  className="form-input"
                  placeholder="Dr. Rajesh Kapoor"
                  id="hosp-name"
                />
                {hospitalForm.formState.errors.name && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{hospitalForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Hospital / Clinic Name</label>
                <input
                  {...hospitalForm.register("hospitalName")}
                  className="form-input"
                  placeholder="Apex Diagnostic & Clinic Center"
                  id="hosp-facility"
                />
                {hospitalForm.formState.errors.hospitalName && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{hospitalForm.formState.errors.hospitalName.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Work Email Address</label>
                <input
                  {...hospitalForm.register("email")}
                  type="email"
                  className="form-input"
                  placeholder="admin@apexclinic.com"
                  id="hosp-email"
                />
                {hospitalForm.formState.errors.email && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{hospitalForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Secure Password</label>
                <input
                  {...hospitalForm.register("password")}
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  id="hosp-pwd"
                />
                {hospitalForm.formState.errors.password && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{hospitalForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary"
                id="hosp-submit"
                disabled={isLoading}
                style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14.5, marginTop: 10 }}
              >
                {isLoading ? "Creating Hospital Workspace…" : "Register Hospital & Sign Up →"}
              </button>
            </form>
          ) : (
            <form onSubmit={patientForm.handleSubmit(onPatientSubmit)}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label className="form-label">First Name</label>
                  <input
                    {...patientForm.register("firstName")}
                    className="form-input"
                    placeholder="Arjun"
                    id="pat-fname"
                  />
                  {patientForm.formState.errors.firstName && (
                    <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{patientForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    {...patientForm.register("lastName")}
                    className="form-input"
                    placeholder="Sharma"
                    id="pat-lname"
                  />
                  {patientForm.formState.errors.lastName && (
                    <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{patientForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  {...patientForm.register("email")}
                  type="email"
                  className="form-input"
                  placeholder="arjun.sharma@example.com"
                  id="pat-email"
                />
                {patientForm.formState.errors.email && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{patientForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Secure Password</label>
                <input
                  {...patientForm.register("password")}
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  id="pat-pwd"
                />
                {patientForm.formState.errors.password && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{patientForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  {...patientForm.register("phone")}
                  className="form-input"
                  placeholder="+91 98765 43210"
                  id="pat-phone"
                />
                {patientForm.formState.errors.phone && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{patientForm.formState.errors.phone.message}</p>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                <div>
                  <label className="form-label">Gender</label>
                  <select {...patientForm.register("gender")} className="form-input" style={{ background: "#0a1628" }} id="pat-gender">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Blood Group</label>
                  <select {...patientForm.register("bloodGroup")} className="form-input" style={{ background: "#0a1628" }} id="pat-blood">
                    <option value="A_POSITIVE">A+</option>
                    <option value="A_NEGATIVE">A-</option>
                    <option value="B_POSITIVE">B+</option>
                    <option value="B_NEGATIVE">B-</option>
                    <option value="AB_POSITIVE">AB+</option>
                    <option value="AB_NEGATIVE">AB-</option>
                    <option value="O_POSITIVE">O+</option>
                    <option value="O_NEGATIVE">O-</option>
                    <option value="UNKNOWN">Unknown</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  {...patientForm.register("dateOfBirth")}
                  type="date"
                  className="form-input"
                  id="pat-dob"
                />
                {patientForm.formState.errors.dateOfBirth && (
                  <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{patientForm.formState.errors.dateOfBirth.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary"
                id="pat-submit"
                disabled={isLoading}
                style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 14.5, marginTop: 10 }}
              >
                {isLoading ? "Creating Patient Account…" : "Register Patient Account →"}
              </button>
            </form>
          )}

          <p style={{ textAlign: "center", color: "#3d5270", fontSize: 12.5, marginTop: 24 }}>
            HIPAA-Ready Architecture · Secure TLS Encryption
          </p>
        </div>
      </div>
    </div>
  );
}
