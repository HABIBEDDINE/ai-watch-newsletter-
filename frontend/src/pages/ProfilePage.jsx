import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const C = {
  purple:     "#1A4A9E",
  purpleDeep: "#102d6a",
  purplePale: "#e8eef8",
  purpleMid:  "#d0dcea",
  white:      "#ffffff",
  gray50:     "#fafafa",
  gray100:    "#f4f4f4",
  gray200:    "#e8e8e8",
  gray300:    "#d0d0d0",
  gray400:    "#999999",
  gray500:    "#666666",
  gray600:    "#444444",
  gray900:    "#111111",
  green:      "#15803d",
  greenLight: "#dcfce7",
  amber:      "#b45309",
  amberLight: "#fef3e2",
  red:        "#c0392b",
  redLight:   "#fdf0ef",
};

const ROLES = [
  { id: "cto",                label: "CTO / Technical Lead",  icon: "⚙️",  desc: "Tech strategy, architecture & innovation"       },
  { id: "innovation_manager", label: "Innovation Manager",    icon: "💡",  desc: "Use case discovery & emerging tech scouting"    },
  { id: "strategy_director",  label: "Strategy Director",     icon: "📈",  desc: "Market positioning & transformation roadmaps"   },
  { id: "other",              label: "Other",                 icon: "👤",  desc: "General access — customise feed freely"         },
];

// ── Reusable field component ───────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{
        display: "block", fontSize: 11, fontWeight: 700, color: C.gray500,
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
        border: `1.5px solid ${focused ? C.purple : C.gray200}`,
        borderRadius: 8, fontSize: 14,
        color: disabled ? C.gray400 : C.gray900,
        background: disabled ? C.gray100 : C.white,
        outline: "none", boxSizing: "border-box",
        transition: "border-color 0.15s",
      }}
    />
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isOk = toast.kind === "success";
  return (
    <div style={{
      position: "fixed", top: 72, right: 24, zIndex: 1000,
      background: C.white,
      border: `1px solid ${isOk ? C.green : C.red}`,
      borderLeft: `4px solid ${isOk ? C.green : C.red}`,
      padding: "10px 16px", borderRadius: 8, fontSize: 13,
      color: isOk ? C.green : C.red,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: 360,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span>{isOk ? "✓" : "✕"}</span>
      <span>{toast.message}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, applyToken } = useAuth();

  const [form, setForm]       = useState({ full_name: "", company: "", role: "other" });
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);
  const [resending, setResend] = useState(false);

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
          company:   data.company   || "",
          role:      data.role      || "other",
        });
      })
      .catch(() => setForm({
        full_name: user.full_name || "",
        company:   "",
        role:      user.role      || "other",
      }));
  }, [user?.user_id]); // eslint-disable-line react-hooks/exhaustive-deps

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
          company:   form.company.trim(),
          role:      form.role,
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
    <div style={{
      minHeight: "100vh", background: C.gray50,
      fontFamily: "'Inter','Open Sans','Segoe UI',Arial,sans-serif",
      padding: "0 0 48px",
    }}>

      <Toast toast={toast} />

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${C.purpleDeep} 0%, ${C.purple} 60%, #2d6fd4 100%)`,
        padding: "40px 32px 80px",
        position: "relative",
      }}>
        <h1 style={{ color: C.white, fontSize: 13, fontWeight: 700, letterSpacing: 2,
          textTransform: "uppercase", opacity: 0.7, margin: "0 0 4px" }}>
          Account
        </h1>
        <h2 style={{ color: C.white, fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
          My Profile
        </h2>
      </div>

      {/* ── Content area ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 680, margin: "-56px auto 0", padding: "0 24px", position: "relative", zIndex: 1 }}>

        {/* ── Identity card ──────────────────────────────────────────────── */}
        <div style={{
          background: C.white, borderRadius: 16, padding: "28px 28px 24px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
        }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.purple}, #2d6fd4)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, fontWeight: 800, color: C.white, flexShrink: 0,
            boxShadow: `0 4px 16px rgba(26,74,158,0.35)`,
          }}>{initials}</div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.gray900, letterSpacing: -0.3 }}>
              {user?.full_name || "—"}
            </div>
            <div style={{ fontSize: 13, color: C.gray400, marginTop: 2 }}>{user?.email}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {/* Role badge */}
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                background: C.purplePale, color: C.purple,
                padding: "3px 10px", borderRadius: 999,
              }}>
                {activeRole.icon} {activeRole.label}
              </span>
              {/* Verification badge */}
              {user?.is_verified
                ? <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    background: C.greenLight, color: C.green,
                    padding: "3px 10px", borderRadius: 999,
                  }}>✓ Verified</span>
                : <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    background: C.amberLight, color: C.amber,
                    padding: "3px 10px", borderRadius: 999,
                  }}>⚠ Unverified</span>
              }
            </div>
          </div>
        </div>

        {/* ── Verification banner ─────────────────────────────────────────── */}
        {user && !user.is_verified && (
          <div style={{
            background: C.amberLight, border: `1px solid #fcd34d`,
            borderLeft: `4px solid #f59e0b`, borderRadius: 12,
            padding: "14px 20px", marginBottom: 20,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, flexWrap: "wrap",
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Email not verified</div>
              <div style={{ fontSize: 12, color: "#92400e", opacity: 0.8, marginTop: 2 }}>
                Check your inbox for a verification link to unlock all features.
              </div>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={resending}
              style={{
                background: "#f59e0b", border: "none", borderRadius: 8,
                padding: "8px 16px", fontSize: 12, fontWeight: 700, color: C.white,
                cursor: resending ? "default" : "pointer", flexShrink: 0,
                opacity: resending ? 0.6 : 1, transition: "opacity 0.15s",
              }}
            >{resending ? "Sending…" : "Resend email"}</button>
          </div>
        )}

        {/* ── Edit profile card ───────────────────────────────────────────── */}
        <div style={{
          background: C.white, borderRadius: 16, padding: 28,
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)", marginBottom: 20,
        }}>
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.gray900, margin: "0 0 4px", letterSpacing: -0.2 }}>
              Personal Information
            </h3>
            <p style={{ fontSize: 12, color: C.gray400, margin: 0 }}>
              Update your name and company to personalise your experience.
            </p>
          </div>

          <form onSubmit={handleSave} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
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
                background: saving ? C.gray300 : C.purple,
                color: C.white, border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer",
                letterSpacing: 0.3, transition: "background 0.2s",
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = C.purpleDeep; }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.background = C.purple; }}
            >{saving ? "Saving…" : "Save Changes"}</button>
          </form>
        </div>

        {/* ── Role selector card ──────────────────────────────────────────── */}
        <div style={{
          background: C.white, borderRadius: 16, padding: 28,
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.gray900, margin: "0 0 4px", letterSpacing: -0.2 }}>
              Your Role
            </h3>
            <p style={{ fontSize: 12, color: C.gray400, margin: 0 }}>
              Your role helps us personalise your news feed and recommendations.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {ROLES.map(r => {
              const active = form.role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: r.id }))}
                  style={{
                    padding: "14px 16px", borderRadius: 10, textAlign: "left",
                    border: `2px solid ${active ? C.purple : C.gray200}`,
                    background: active ? C.purplePale : C.white,
                    cursor: "pointer", transition: "all 0.15s", position: "relative",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = C.purpleMid; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = C.gray200; }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{r.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: active ? C.purple : C.gray900, marginBottom: 3 }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 11, color: C.gray400, lineHeight: 1.4 }}>{r.desc}</div>
                  {active && (
                    <div style={{
                      position: "absolute", top: 10, right: 10,
                      width: 18, height: 18, borderRadius: "50%", background: C.purple,
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
              background: saving ? C.gray300 : C.purple,
              color: C.white, border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 700, cursor: saving ? "default" : "pointer",
              letterSpacing: 0.3, transition: "background 0.2s",
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = C.purpleDeep; }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = C.purple; }}
          >{saving ? "Saving…" : "Save Role"}</button>
        </div>

      </div>
    </div>
  );
}
