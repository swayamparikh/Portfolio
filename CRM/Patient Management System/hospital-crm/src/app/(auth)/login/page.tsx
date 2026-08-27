"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #060d1f 0%, #0a1628 50%, #060d1f 100%)" }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: "linear-gradient(135deg, rgba(15,118,110,0.12) 0%, rgba(8,145,178,0.08) 100%)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#0f766e,#0891b2)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
            🏥
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>MediCRM</div>
            <div style={{ fontSize: 12, color: "#4d6280" }}>Healthcare Management Platform</div>
          </div>
        </div>

        <div>
          <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.2, marginBottom: 20, color: "#f1f5f9" }}>
            The Future of{" "}
            <span style={{ background: "linear-gradient(135deg,#14b8a6,#38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Healthcare
            </span>{" "}
            Management
          </h1>
          <p style={{ fontSize: 16, color: "#4d6280", lineHeight: 1.7, marginBottom: 40 }}>
            AI-powered patient engagement, automated follow-ups, complete EMR,
            and real-time analytics — all in one platform built for modern healthcare organizations.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "🤖", title: "AI-Powered Follow-Ups", desc: "Automated patient engagement at Day 3, 7, 15, and 30" },
              { icon: "📊", title: "Real-Time Analytics", desc: "KPIs, revenue tracking, and doctor performance metrics" },
              { icon: "🔒", title: "HIPAA-Ready Security", desc: "Role-based access, audit logs, and encrypted data" },
            ].map((f) => (
              <div key={f.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.05)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{f.title}</div>
                  <div style={{ color: "#4d6280", fontSize: 13 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {[
            { val: "10K+", label: "Patients Managed" },
            { val: "500+", label: "Doctors Onboarded" },
            { val: "99.9%", label: "Uptime SLA" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#14b8a6" }}>{s.val}</div>
              <div style={{ fontSize: 12, color: "#4d6280" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div style={{ width: "100%", maxWidth: 420 }} className="animate-fade-in">
          <div style={{ marginBottom: 40, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,#0f766e,#0891b2)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>
              🏥
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Welcome back</h2>
            <p style={{ color: "#4d6280", fontSize: 15 }}>Sign in to your MediCRM account</p>
          </div>

          {/* Demo credentials banner */}
          <div style={{ background: "rgba(20,184,166,0.08)", border: "1px solid rgba(20,184,166,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, fontSize: 13 }}>
            <div style={{ color: "#5eead4", fontWeight: 600, marginBottom: 6 }}>🔑 Demo Credentials</div>
            <div style={{ color: "#94a3b8", lineHeight: 1.8 }}>
              <div><span style={{ color: "#4d6280" }}>Admin:</span> admin@medicrm.health / Admin@123</div>
              <div><span style={{ color: "#4d6280" }}>Doctor:</span> doctor@medicrm.health / Doctor@123</div>
              <div><span style={{ color: "#4d6280" }}>Patient:</span> patient@medicrm.health / Patient@123</div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#f87171", fontSize: 14 }}>
                ⚠️ {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                {...register("email")}
                type="email"
                className="form-input"
                placeholder="doctor@hospital.com"
                id="email"
                autoComplete="email"
              />
              {errors.email && (
                <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.email.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                {...register("password")}
                type="password"
                className="form-input"
                placeholder="••••••••"
                id="password"
                autoComplete="current-password"
              />
              {errors.password && (
                <p style={{ color: "#f87171", fontSize: 12, marginTop: 4 }}>{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary"
              id="login-submit"
              disabled={isLoading}
              style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: 15, marginTop: 4 }}
            >
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                  Signing in…
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "#3d5270", fontSize: 13, marginTop: 28 }}>
            Protected by enterprise-grade security · HIPAA-ready infrastructure
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#060d1f", color: "#94a3b8", fontFamily: "Inter, sans-serif" }}>
        <div style={{ width: 44, height: 44, border: "3px solid rgba(20,184,166,0.1)", borderTopColor: "#14b8a6", borderRadius: "50%", animation: "spin 0.7s linear infinite", marginBottom: 16 }} />
        <div style={{ fontSize: 14 }}>Loading MediCRM Secure Portal…</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

