"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
}

interface HospitalData {
  id: string;
  name: string;
  licenseNumber: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string;
}

interface SettingsClientProps {
  user: UserData | null;
  hospital: HospitalData | null;
  canEditHospital: boolean;
}

const navItems = [
  { icon: "🏥", label: "Hospital Profile" },
  { icon: "👤", label: "My Account" },
  { icon: "🔔", label: "Notifications" },
  { icon: "🤖", label: "AI Configuration" },
  { icon: "💳", label: "Subscription & Billing" },
  { icon: "🔒", label: "Security" },
];

export default function SettingsClient({ user, hospital, canEditHospital }: SettingsClientProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState(0);

  const [hospitalForm, setHospitalForm] = useState({
    name: hospital?.name ?? "",
    licenseNumber: hospital?.licenseNumber ?? "",
    phone: hospital?.phone ?? "",
    email: hospital?.email ?? "",
    address: hospital?.address ?? "",
  });
  const [savingHospital, setSavingHospital] = useState(false);
  const [hospitalMsg, setHospitalMsg] = useState("");

  const [accountForm, setAccountForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
  });
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMsg, setAccountMsg] = useState("");

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  async function saveHospital() {
    if (!hospital) return;
    setSavingHospital(true);
    setHospitalMsg("");
    try {
      const res = await fetch(`/api/hospitals/${hospital.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hospitalForm),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save hospital profile");
      }
      setHospitalMsg("Saved successfully.");
      router.refresh();
    } catch (e) {
      setHospitalMsg(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingHospital(false);
    }
  }

  async function saveAccount() {
    setSavingAccount(true);
    setAccountMsg("");
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to save account");
      }
      setAccountMsg("Saved successfully.");
      router.refresh();
    } catch (e) {
      setAccountMsg(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingAccount(false);
    }
  }

  async function changePassword() {
    setPasswordErr("");
    setPasswordMsg("");
    if (passwordForm.newPassword.length < 8) {
      setPasswordErr("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErr("New password and confirmation do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Failed to change password");
      }
      setPasswordMsg("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      setPasswordErr(e instanceof Error ? e.message : "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your hospital and system preferences</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
        {/* Settings nav */}
        <div className="card" style={{ height: "fit-content" }}>
          <div className="card-body" style={{ padding: "12px" }}>
            {navItems.map((s, i) => (
              <div
                key={s.label}
                onClick={() => setActiveSection(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                  borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 500,
                  color: i === activeSection ? "#5eead4" : "#6b82a0",
                  background: i === activeSection ? "rgba(20,184,166,0.1)" : "transparent",
                  marginBottom: 2, transition: "all 0.15s",
                }}
              >
                <span>{s.icon}</span> {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* Settings content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {activeSection === 0 && (
            <div className="card animate-fade-in">
              <div className="card-header"><div className="card-title">🏥 Hospital Profile</div></div>
              <div className="card-body">
                {!hospital ? (
                  <div style={{ color: "#4d6280", fontSize: 13 }}>No hospital associated with this account.</div>
                ) : (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div className="form-group">
                        <label className="form-label">Hospital Name</label>
                        <input className="form-input" disabled={!canEditHospital} value={hospitalForm.name}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, name: e.target.value })} id="hospital-name" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">License Number</label>
                        <input className="form-input" disabled={!canEditHospital} value={hospitalForm.licenseNumber ?? ""}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, licenseNumber: e.target.value })} id="license-number" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-input" disabled={!canEditHospital} value={hospitalForm.phone ?? ""}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, phone: e.target.value })} id="hospital-phone" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" disabled={!canEditHospital} value={hospitalForm.email ?? ""}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, email: e.target.value })} id="hospital-email" />
                      </div>
                      <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                        <label className="form-label">Address</label>
                        <input className="form-input" disabled={!canEditHospital} value={hospitalForm.address ?? ""}
                          onChange={(e) => setHospitalForm({ ...hospitalForm, address: e.target.value })} id="hospital-address" />
                      </div>
                    </div>
                    {canEditHospital && (
                      <>
                        <button className="btn-primary" id="save-hospital-profile" onClick={saveHospital} disabled={savingHospital}>
                          {savingHospital ? "Saving…" : "✓ Save Changes"}
                        </button>
                        {hospitalMsg && <div style={{ fontSize: 12, color: hospitalMsg.includes("Failed") ? "#f87171" : "#10b981", marginTop: 8 }}>{hospitalMsg}</div>}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeSection === 1 && (
            <div className="card animate-fade-in">
              <div className="card-header"><div className="card-title">👤 My Account</div></div>
              <div className="card-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={accountForm.name}
                      onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} id="account-name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" value={user?.email ?? ""} disabled id="account-email" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={accountForm.phone ?? ""}
                      onChange={(e) => setAccountForm({ ...accountForm, phone: e.target.value })} id="account-phone" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <input className="form-input" value={user?.role ?? ""} disabled id="account-role" />
                  </div>
                </div>
                <button className="btn-primary" id="save-account" onClick={saveAccount} disabled={savingAccount}>
                  {savingAccount ? "Saving…" : "✓ Save Changes"}
                </button>
                {accountMsg && <div style={{ fontSize: 12, color: accountMsg.includes("Failed") ? "#f87171" : "#10b981", marginTop: 8 }}>{accountMsg}</div>}
              </div>
            </div>
          )}

          {activeSection === 4 && (
            <div className="card animate-fade-in">
              <div className="card-header"><div className="card-title">💳 Subscription</div></div>
              <div className="card-body">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "linear-gradient(135deg, rgba(15,118,110,0.12), rgba(8,145,178,0.08))", borderRadius: 12, border: "1px solid rgba(20,184,166,0.15)", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>{hospital?.subscriptionPlan ?? "FREE"} Plan</div>
                    <div style={{ fontSize: 13, color: "#4d6280" }}>Status: {hospital?.subscriptionStatus ?? "—"}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 5 && (
            <div className="card animate-fade-in">
              <div className="card-header"><div className="card-title">🔒 Security — Change Password</div></div>
              <div className="card-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 400 }}>
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input type="password" className="form-input" value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} id="current-password" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input type="password" className="form-input" value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} id="new-password" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-input" value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} id="confirm-password" />
                  </div>
                </div>
                {passwordErr && <div style={{ fontSize: 12, color: "#f87171", marginTop: 8 }}>{passwordErr}</div>}
                {passwordMsg && <div style={{ fontSize: 12, color: "#10b981", marginTop: 8 }}>{passwordMsg}</div>}
                <button className="btn-primary" id="save-password" onClick={changePassword} disabled={savingPassword} style={{ marginTop: 12 }}>
                  {savingPassword ? "Saving…" : "✓ Change Password"}
                </button>
              </div>
            </div>
          )}

          {activeSection === 2 && (
            <div className="card animate-fade-in">
              <div className="card-header"><div className="card-title">🔔 Notifications</div></div>
              <div className="card-body">
                <div style={{ color: "#4d6280", fontSize: 13 }}>Notification preferences are not yet configurable.</div>
              </div>
            </div>
          )}

          {activeSection === 3 && (
            <div className="card animate-fade-in">
              <div className="card-header"><div className="card-title">🤖 AI Configuration</div></div>
              <div className="card-body">
                <div style={{ color: "#4d6280", fontSize: 13 }}>AI feature toggles are not yet configurable at the hospital level.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
