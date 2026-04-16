// src/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { id: "cto", label: "CTO / Technical Lead", icon: "⚙️", desc: "Tech strategy, architecture & innovation" },
  { id: "innovation_manager", label: "Innovation Manager", icon: "💡", desc: "Use case discovery & emerging tech scouting" },
  { id: "strategy_director", label: "Strategy Director", icon: "📈", desc: "Market positioning & transformation roadmaps" },
  { id: "other", label: "Other", icon: "👤", desc: "General access — customise feed freely" },
];

// Reusable field component
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
        letterSpacing: 1, textTransform: "uppercase", marginBottom: 6,
      }}>{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", height: 44, padding: "0 14px",
        border: `1.5px solid ${focused ? "var(--orange)" : "var(--border-color)"}`,
        borderRadius: 8, fontSize: 14,
        color: disabled ? "var(--text-muted)" : "var(--text-primary)",
        background: disabled ? "var(--surface)" : "var(--input-bg)",
        outline: "none", boxSizing: "border-box",
        transition: "border-color 0.15s",
      }}
    />
  );
}

// Toast
function Toast({ toast }) {
  if (!toast) return null;
  const isOk = toast.kind === "success";
  return (
    <div style={{
      position: "fixed", top: 72, right: 24, zIndex: 1000,
      background: "var(--card-bg)",
      border: `1px solid ${isOk ? "var(--green)" : "var(--red)"}`,
      borderLeft: `4px solid ${isOk ? "var(--green)" : "var(--red)"}`,
      padding: "10px 16px", borderRadius: 8, fontSize: 13,
      color: isOk ? "var(--green)" : "var(--red)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: 360,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span>{isOk ? "✓" : "✕"}</span>
      <span>{toast.message}</span>
    </div>
  );
}

// Main component
export default function ProfilePage() {
  const { user, applyToken } = useAuth();

  const [form, setForm] = useState({ full_name: "", company: "", role: "other" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [resending, setResend] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Alert preferences
  const [alerts, setAlerts] = useState({
    emailDigest: true,
    strongSignals: true,
    weeklyReport: false,
    trendAlerts: true,
  });

  // Handle resize
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Load profile from API
  useEffect(() => {
    if (!user) return;
    fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("aiwatch_at")}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setForm({
          full_name: data.full_name || "",
          company: data.company || "",
          role: data.role || "other",
        });
      })
      .catch(() => setForm({
        full_name: user.full_name || "",
        company: "",
        role: user.role || "other",
      }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const showToast = (kind, message) => {
    setToast({ kind, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { showToast("error", "Full name is required."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("aiwatch_at")}`,
        },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          company: form.company.trim(),
          role: form.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Update failed");
      applyToken(data.access_token);
      showToast("success", "Profile updated successfully.");
    } catch (err) {
      showToast("error", err.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResend(true);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to resend");
      showToast("success", data.message || "Verification email sent.");
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setResend(false);
    }
  };

  const initials = user?.full_name
    ?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";

  const activeRole = ROLES.find(r => r.id === form.role) || ROLES[3];

  return (
    <div className="page-container" style={{ maxWidth: "100vw", overflowX: "hidden" }}>
      <Toast toast={toast} />

      {/* Hero banner */}
      <div style={{
        background: "linear-gradient(135deg, var(--orange) 0%, #c04a1f 100%)",
        padding: isMobile ? "24px 20px" : "40px 32px",
        borderRadius: 16,
        marginBottom: isMobile ? 16 : 24,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -50, right: -50,
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }} />
        <h1 style={{ color: "#fff", fontSize: isMobile ? 11 : 13, fontWeight: 700, letterSpacing: 2,
          textTransform: "uppercase", opacity: 0.8, margin: "0 0 4px" }}>
          Account
        </h1>
        <h2 style={{ color: "#fff", fontSize: isMobile ? 22 : 28, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
          My Profile
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 16 : 20 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Identity card */}
          <div style={{
            background: "var(--card-bg)", borderRadius: 16, padding: isMobile ? "20px 16px" : "28px 28px 24px",
            border: "1px solid var(--border-color)",
            display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 20, flexWrap: "wrap",
          }}>
            {/* Avatar */}
            <div style={{
              width: isMobile ? 60 : 72, height: isMobile ? 60 : 72, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--orange), #c04a1f)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "#fff", flexShrink: 0,
              boxShadow: "0 4px 16px rgba(224,90,43,0.35)",
            }}>{initials}</div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, width: isMobile ? "100%" : "auto" }}>
              <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 800, color: "var(--text-primary)", letterSpacing: -0.3 }}>
                {user?.full_name || "—"}
              </div>
              <div style={{ fontSize: isMobile ? 12 : 13, color: "var(--text-muted)", marginTop: 2, wordBreak: "break-all" }}>{user?.email}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {/* Role badge */}
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                  background: "var(--orange-light)", color: "var(--orange)",
                  padding: "3px 10px", borderRadius: 999,
                }}>
                  {activeRole.icon} {activeRole.label}
                </span>
                {/* Verification badge */}
                {user?.is_verified
                  ? <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                      background: "var(--green-light)", color: "var(--green)",
                      padding: "3px 10px", borderRadius: 999,
                    }}>✓ Verified</span>
                  : <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                      background: "var(--amber-light)", color: "var(--amber)",
                      padding: "3px 10px", borderRadius: 999,
                    }}>⚠ Unverified</span>
                }
              </div>
            </div>
          </div>

          {/* Verification banner */}
          {user && !user.is_verified && (
            <div style={{
              background: "var(--amber-light)", border: "1px solid var(--amber)",
              borderLeft: "4px solid var(--amber)", borderRadius: 12,
              padding: "14px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 12, flexWrap: "wrap",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)" }}>Email not verified</div>
                <div style={{ fontSize: 12, color: "var(--amber)", opacity: 0.8, marginTop: 2 }}>
                  Check your inbox for a verification link to unlock all features.
                </div>
              </div>
              <button
                onClick={handleResendVerification}
                disabled={resending}
                style={{
                  background: "var(--amber)", border: "none", borderRadius: 8,
                  padding: "8px 16px", fontSize: 12, fontWeight: 700, color: "#fff",
                  cursor: resending ? "default" : "pointer", flexShrink: 0,
                  opacity: resending ? 0.6 : 1, transition: "opacity 0.15s",
                }}
              >{resending ? "Sending…" : "Resend email"}</button>
            </div>
          )}

          {/* Edit profile card */}
          <div style={{
            background: "var(--card-bg)", borderRadius: 16, padding: isMobile ? 20 : 28,
            border: "1px solid var(--border-color)",
          }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: -0.2 }}>
                Personal Information
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                Update your name and company to personalise your experience.
              </p>
            </div>

            <form onSubmit={handleSave} noValidate>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "0" : "0 20px" }}>
                <Field label="Full Name">
                  <TextInput
                    value={form.full_name}
                    onChange={v => setForm(f => ({ ...f, full_name: v }))}
                    placeholder="Your full name"
                  />
                </Field>
                <Field label="Work Email">
                  <TextInput value={user?.email || ""} onChange={() => {}} disabled />
                </Field>
              </div>

              <Field label="Company">
                <TextInput
                  value={form.company}
                  onChange={v => setForm(f => ({ ...f, company: v }))}
                  placeholder="e.g. DXC Technology (optional)"
                />
              </Field>

              <button
                type="submit"
                disabled={saving}
                style={{
                  marginTop: 8, height: 44, padding: "0 28px",
                  background: saving ? "var(--border-color)" : "var(--orange)",
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer",
                  letterSpacing: 0.3, transition: "background 0.2s",
                }}
              >{saving ? "Saving…" : "Save Changes"}</button>
            </form>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Role selector card */}
          <div style={{
            background: "var(--card-bg)", borderRadius: 16, padding: isMobile ? 20 : 28,
            border: "1px solid var(--border-color)",
          }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: -0.2 }}>
                Your Role
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                Your role helps us personalise your news feed and recommendations.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
              {ROLES.map(r => {
                const active = form.role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r.id }))}
                    style={{
                      padding: isMobile ? "12px 14px" : "14px 16px", borderRadius: 10, textAlign: "left",
                      border: `2px solid ${active ? "var(--orange)" : "var(--border-color)"}`,
                      background: active ? "var(--orange-light)" : "var(--card-bg)",
                      cursor: "pointer", transition: "all 0.15s", position: "relative",
                    }}
                  >
                    <div style={{ fontSize: isMobile ? 20 : 22, marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontSize: isMobile ? 11 : 12, fontWeight: 700, color: active ? "var(--orange)" : "var(--text-primary)", marginBottom: 3 }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{r.desc}</div>
                    {active && (
                      <div style={{
                        position: "absolute", top: 10, right: 10,
                        width: 18, height: 18, borderRadius: "50%", background: "var(--orange)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              style={{
                marginTop: 20, height: 44, padding: "0 28px",
                background: saving ? "var(--border-color)" : "var(--orange)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer",
                letterSpacing: 0.3, transition: "background 0.2s",
              }}
            >{saving ? "Saving…" : "Save Role"}</button>
          </div>

          {/* Alert preferences card */}
          <div style={{
            background: "var(--card-bg)", borderRadius: 16, padding: isMobile ? 20 : 28,
            border: "1px solid var(--border-color)",
          }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: -0.2 }}>
                Alert Preferences
              </h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
                Configure how you want to receive notifications and updates.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { key: "emailDigest", label: "Daily Email Digest", desc: "Receive a summary of top articles each morning" },
                { key: "strongSignals", label: "Strong Signal Alerts", desc: "Get notified when strong signals are detected" },
                { key: "weeklyReport", label: "Weekly Report", desc: "Receive a comprehensive weekly intelligence report" },
                { key: "trendAlerts", label: "Trend Alerts", desc: "Get notified when new trends are identified" },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12, padding: "12px 0", borderBottom: "1px solid var(--surface)",
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
                  </div>
                  <button
                    onClick={() => setAlerts(a => ({ ...a, [key]: !a[key] }))}
                    style={{
                      width: 44, height: 24, borderRadius: 999, border: "none",
                      background: alerts[key] ? "var(--orange)" : "var(--border-color)", position: "relative",
                      cursor: "pointer", flexShrink: 0, transition: "background 0.2s",
                    }}
                  >
                    <span style={{
                      position: "absolute", top: 3,
                      left: alerts[key] ? 23 : 3, width: 18, height: 18,
                      borderRadius: "50%", background: "#fff",
                      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
