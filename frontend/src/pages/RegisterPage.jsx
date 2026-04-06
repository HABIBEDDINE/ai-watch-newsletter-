import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRegister } from "../services/api";

const C = {
  navy: "#1A1A2E", orange: "#FF6200", purple: "#1A4A9E",
  purpleDeep: "#102d6a", purplePale: "#e8eef8", white: "#ffffff",
  gray100: "#f4f4f4", gray200: "#e8e8e8", gray400: "#999",
  gray600: "#444", gray900: "#111", red: "#c0392b", redLight: "#fdf0ef",
};

const ROLES = [
  { id:"cto",                  label:"CTO / Technical Lead",         icon:"⚙️",  desc:"Tech strategy, architecture & innovation decisions" },
  { id:"innovation_manager",   label:"Innovation Manager",            icon:"💡",  desc:"Ideation, use case discovery & emerging tech scouting" },
  { id:"strategy_director",    label:"Strategy Director",             icon:"📈",  desc:"Market positioning, investment & transformation roadmaps" },
  { id:"other",                label:"Other",                         icon:"👤",  desc:"General access — customise your feed later" },
];

function Input({ label, type="text", value, onChange, error, placeholder, hint }) {
  const [show, setShow] = useState(false);
  const isPass = type === "password";
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray600,
        letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>{label}</label>
      <div style={{ position:"relative" }}>
        <input type={isPass && show ? "text" : type} value={value}
          onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width:"100%", height:44, padding: isPass ? "0 52px 0 14px" : "0 14px",
            border:`1.5px solid ${error ? C.red : C.gray200}`, borderRadius:8,
            fontSize:14, color:C.gray900, background:C.white, outline:"none", boxSizing:"border-box" }}
          onFocus={e => e.target.style.borderColor = C.purple}
          onBlur={e => e.target.style.borderColor = error ? C.red : C.gray200} />
        {isPass && <button type="button" onClick={() => setShow(s=>!s)} style={{
          position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
          background:"none", border:"none", cursor:"pointer", color:C.gray400, fontSize:12, fontWeight:600 }}>
          {show ? "Hide" : "Show"}
        </button>}
      </div>
      {error && <div style={{ fontSize:12, color:C.red, marginTop:4 }}>{error}</div>}
      {hint && !error && <div style={{ fontSize:11, color:C.gray400, marginTop:4 }}>{hint}</div>}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    { label:"8+ characters", ok: password.length >= 8 },
    { label:"Uppercase letter", ok: /[A-Z]/.test(password) },
    { label:"Number", ok: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div style={{ display:"flex", gap:8, marginTop:-8, marginBottom:16, flexWrap:"wrap" }}>
      {checks.map(c => (
        <span key={c.label} style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4,
          background: c.ok ? "#e6f7ee" : C.gray100, color: c.ok ? "#15803d" : C.gray400 }}>
          {c.ok ? "✓" : "○"} {c.label}
        </span>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ full_name:"", email:"", company:"", password:"", role:"" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSub] = useState(false);

  const set = (k, v) => { setForm(f => ({...f, [k]:v})); setErrors(e => ({...e, [k]:""})); };

  const validateStep1 = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/\d/.test(form.password))
      e.password = "Password must be ≥8 chars, 1 uppercase, 1 number";
    return e;
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  const handleSubmit = async (selectedRole) => {
    setSub(true); setServerError("");
    try {
      await apiRegister({ ...form, role: selectedRole });
      await login(form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.message || "";
      setServerError(msg.includes("409") ? "An account with this email already exists."
        : msg.includes("422") ? "Password doesn't meet requirements."
        : "Registration failed. Please try again.");
      setStep(1);
    } finally {
      setSub(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.gray100, display:"flex", alignItems:"center",
      justifyContent:"center", padding:24, fontFamily:"'Open Sans','Segoe UI',Arial,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:480 }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img src="/solutions/DXC.png" alt="DXC" style={{ height:28, objectFit:"contain", marginBottom:16 }} />
          <h2 style={{ fontSize:24, fontWeight:800, color:C.gray900, letterSpacing:-0.5, margin:"0 0 6px" }}>
            {step === 1 ? "Create your account" : "Choose your role"}
          </h2>
          <p style={{ fontSize:13, color:C.gray400, margin:0 }}>
            {step === 1 ? "Step 1 of 2 — Your credentials" : "Step 2 of 2 — Personalise your experience"}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display:"flex", gap:6, marginBottom:28 }}>
          {[1,2].map(s => (
            <div key={s} style={{ flex:1, height:3, borderRadius:2,
              background: s <= step ? C.purple : C.gray200, transition:"background 0.3s" }} />
          ))}
        </div>

        <div style={{ background:C.white, borderRadius:12, padding:28,
          boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>

          {serverError && (
            <div style={{ background:C.redLight, border:`1px solid ${C.red}30`,
              borderLeft:`3px solid ${C.red}`, borderRadius:6,
              padding:"10px 14px", fontSize:13, color:C.red, marginBottom:20 }}>
              {serverError}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1} noValidate>
              <Input label="Full Name" value={form.full_name} onChange={v => set("full_name",v)} error={errors.full_name} placeholder="Amine Benali" />
              <Input label="Work Email" type="email" value={form.email} onChange={v => set("email",v)} error={errors.email} placeholder="you@company.com" />
              <Input label="Company" value={form.company} onChange={v => set("company",v)} placeholder="DXC Technology (optional)" />
              <Input label="Password" type="password" value={form.password} onChange={v => set("password",v)} error={errors.password} placeholder="Create a strong password" />
              <PasswordStrength password={form.password} />
              <button type="submit" style={{ width:"100%", height:46, background:C.purple,
                color:C.white, border:"none", borderRadius:8, fontSize:14, fontWeight:700,
                cursor:"pointer", letterSpacing:0.3, transition:"background 0.2s" }}
                onMouseEnter={e => e.target.style.background = C.purpleDeep}
                onMouseLeave={e => e.target.style.background = C.purple}>
                Continue →
              </button>
            </form>
          ) : (
            <div>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => handleSubmit(r.id)} disabled={submitting}
                    style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px",
                      border:`1.5px solid ${C.gray200}`, borderRadius:8, background:C.white,
                      cursor: submitting ? "default" : "pointer", textAlign:"left", width:"100%",
                      transition:"all 0.15s" }}
                    onMouseEnter={e => { if(!submitting) { e.currentTarget.style.borderColor=C.purple; e.currentTarget.style.background=C.purplePale; }}}
                    onMouseLeave={e => { e.currentTarget.style.borderColor=C.gray200; e.currentTarget.style.background=C.white; }}>
                    <span style={{ fontSize:22 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:C.gray900 }}>{r.label}</div>
                      <div style={{ fontSize:12, color:C.gray400, marginTop:2 }}>{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ width:"100%", height:36, background:"none",
                border:"none", cursor:"pointer", fontSize:13, color:C.gray400 }}>
                ← Back
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:C.gray400 }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color:C.purple, fontWeight:700, textDecoration:"none" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
