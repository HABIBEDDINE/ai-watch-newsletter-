import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const C = {
  purple:"#1A4A9E", purpleDeep:"#102d6a", purplePale:"#e8eef8",
  white:"#ffffff", gray100:"#f4f4f4", gray200:"#e8e8e8",
  gray400:"#999", gray600:"#444", gray900:"#111",
  green:"#15803d", greenLight:"#e6f7ee",
  red:"#c0392b", redLight:"#fdf0ef",
  orange:"#FF6200",
};

const ROLES = [
  { id:"cto",                label:"CTO / Technical Lead",    icon:"⚙️",  desc:"Tech strategy, architecture & innovation" },
  { id:"innovation_manager", label:"Innovation Manager",       icon:"💡",  desc:"Use case discovery & emerging tech scouting" },
  { id:"strategy_director",  label:"Strategy Director",        icon:"📈",  desc:"Market positioning & transformation roadmaps" },
  { id:"other",              label:"Other",                    icon:"👤",  desc:"General access — customise feed freely" },
];

function Input({ label, value, onChange, placeholder, disabled }) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray600,
        letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width:"100%", height:46, padding:"0 14px",
          border:`1.5px solid ${C.gray200}`, borderRadius:8,
          fontSize:14, color: disabled ? C.gray400 : C.gray900,
          background: disabled ? C.gray100 : C.white,
          outline:"none", boxSizing:"border-box", transition:"border-color 0.15s",
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = C.purple; }}
        onBlur={e  => { e.target.style.borderColor = C.gray200; }}
      />
    </div>
  );
}

export default function ProfilePage() {
  const { user, applyToken } = useAuth();

  const [form, setForm]       = useState({ full_name:"", company:"", role:"" });
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null); // { kind, message }
  const [resending, setResend] = useState(false);

  // Fetch full profile from API (JWT doesn't include company)
  useEffect(() => {
    if (!user) return;
    fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("aiwatch_at")}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setForm({
            full_name: data.full_name || "",
            company:   data.company   || "",
            role:      data.role      || "other",
          });
        }
      })
      .catch(() => {
        // fallback to JWT data
        setForm({
          full_name: user.full_name || "",
          company:   "",
          role:      user.role      || "other",
        });
      });
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
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${localStorage.getItem("aiwatch_at")}`,
        },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          company:   form.company.trim(),
          role:      form.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Update failed");
      // Apply new token → updates user in AuthContext + localStorage
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
        method:"POST",
        headers:{"Content-Type":"application/json"},
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

  const initials = user?.full_name?.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase() || "U";

  return (
    <div style={{ maxWidth:600, margin:"0 auto", padding:"32px 24px", fontFamily:"'Open Sans','Segoe UI',Arial,sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:72, right:20, zIndex:1000,
          background:C.white, border:`1px solid ${toast.kind==="success" ? C.green : C.red}`,
          borderLeft:`4px solid ${toast.kind==="success" ? C.green : C.red}`,
          padding:"10px 16px", borderRadius:8, fontSize:13,
          color: toast.kind==="success" ? C.green : C.red,
          boxShadow:"0 4px 16px rgba(0,0,0,0.08)", maxWidth:360,
        }}>
          {toast.message}
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:C.gray900, margin:"0 0 4px", letterSpacing:-0.4 }}>
          My Profile
        </h1>
        <p style={{ fontSize:13, color:C.gray400, margin:0 }}>
          Update your name, company, and role to personalise your experience.
        </p>
      </div>

      {/* Verification banner */}
      {user && !user.is_verified && (
        <div style={{
          background:"#fffbeb", border:"1px solid #fcd34d",
          borderLeft:"3px solid #f59e0b", borderRadius:8,
          padding:"12px 16px", marginBottom:24,
          display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap",
        }}>
          <div>
            <span style={{ fontSize:13, fontWeight:600, color:"#92400e" }}>Email not verified</span>
            <span style={{ fontSize:13, color:"#92400e", opacity:0.8 }}> — check your inbox for a verification link.</span>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={resending}
            style={{
              background:"none", border:"1px solid #f59e0b", borderRadius:6,
              padding:"5px 12px", fontSize:12, fontWeight:700, color:"#92400e",
              cursor: resending ? "default" : "pointer", flexShrink:0,
              opacity: resending ? 0.6 : 1,
            }}
          >{resending ? "Sending…" : "Resend email"}</button>
        </div>
      )}

      {/* Avatar */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
        <div style={{
          width:56, height:56, borderRadius:"50%", background:C.purple,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:20, fontWeight:700, color:C.white, flexShrink:0,
        }}>{initials}</div>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:C.gray900 }}>{user?.full_name || "—"}</div>
          <div style={{ fontSize:12, color:C.gray400 }}>{user?.email}</div>
        </div>
      </div>

      {/* Form */}
      <div style={{ background:C.white, borderRadius:12, padding:28, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <form onSubmit={handleSave} noValidate>
          <Input label="Full Name" value={form.full_name}
            onChange={v => setForm(f=>({...f,full_name:v}))} placeholder="Your full name" />
          <Input label="Work Email" value={user?.email || ""} onChange={()=>{}} disabled />
          <Input label="Company" value={form.company}
            onChange={v => setForm(f=>({...f,company:v}))} placeholder="DXC Technology (optional)" />

          {/* Role selector */}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray600,
              letterSpacing:0.5, textTransform:"uppercase", marginBottom:10 }}>Your Role</label>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {ROLES.map(r => {
                const active = form.role === r.id;
                return (
                  <button
                    key={r.id} type="button"
                    onClick={() => setForm(f=>({...f,role:r.id}))}
                    style={{
                      display:"flex", alignItems:"center", gap:14,
                      padding:"12px 14px", borderRadius:8, textAlign:"left", width:"100%",
                      border:`1.5px solid ${active ? C.purple : C.gray200}`,
                      background: active ? C.purplePale : C.white,
                      cursor:"pointer", transition:"all 0.15s",
                    }}
                  >
                    <span style={{ fontSize:20 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color: active ? C.purple : C.gray900 }}>{r.label}</div>
                      <div style={{ fontSize:11, color:C.gray400, marginTop:2 }}>{r.desc}</div>
                    </div>
                    {active && (
                      <div style={{ marginLeft:"auto", width:18, height:18, borderRadius:"50%",
                        background:C.purple, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              width:"100%", height:48, background: saving ? C.gray400 : C.purple,
              color:C.white, border:"none", borderRadius:8, fontSize:14,
              fontWeight:700, cursor: saving ? "default" : "pointer",
              letterSpacing:0.3, transition:"background 0.2s",
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = C.purpleDeep; }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = C.purple; }}
          >{saving ? "Saving…" : "Save Changes"}</button>
        </form>
      </div>
    </div>
  );
}
