import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiResetPassword } from "../services/api";

const C = {
  purple:"#1A4A9E", purpleDeep:"#102d6a", white:"#ffffff",
  gray100:"#f4f4f4", gray200:"#e8e8e8", gray400:"#999", gray600:"#444", gray900:"#111",
  red:"#c0392b", redLight:"#fdf0ef", green:"#15803d", greenLight:"#e6f7ee",
};

function PasswordStrength({ password }) {
  const checks = [
    { label:"8+ characters", ok: password.length >= 8 },
    { label:"Uppercase letter", ok: /[A-Z]/.test(password) },
    { label:"Number", ok: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div style={{ display:"flex", gap:8, marginTop:4, marginBottom:12, flexWrap:"wrap" }}>
      {checks.map(c => (
        <span key={c.label} style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:4,
          background: c.ok ? C.greenLight : C.gray100, color: c.ok ? C.green : C.gray400 }}>
          {c.ok ? "✓" : "○"} {c.label}
        </span>
      ))}
    </div>
  );
}

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError("Password must be ≥8 chars, 1 uppercase, 1 number"); return;
    }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setLoading(true); setError("");
    try {
      await apiResetPassword({ token, password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err.message?.includes("410") ? "This reset link is invalid or expired. Please request a new one."
        : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.gray100, display:"flex", alignItems:"center",
      justifyContent:"center", padding:24, fontFamily:"'Open Sans','Segoe UI',Arial,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <img src="/solutions/DXC.png" alt="DXC" style={{ height:26, objectFit:"contain", marginBottom:16 }} />
          <h2 style={{ fontSize:24, fontWeight:800, color:C.gray900, margin:"0 0 6px" }}>Set new password</h2>
          <p style={{ fontSize:13, color:C.gray400, margin:0 }}>Choose a strong password for your account</p>
        </div>

        <div style={{ background:C.white, borderRadius:12, padding:28, boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
          {done ? (
            <div style={{ textAlign:"center", padding:"8px 0" }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:C.greenLight,
                display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11L9 16L18 6" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:C.gray900, marginBottom:8 }}>Password updated!</div>
              <div style={{ fontSize:13, color:C.gray400 }}>Redirecting you to sign in…</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <div style={{ background:C.redLight, border:`1px solid ${C.red}30`,
                  borderLeft:`3px solid ${C.red}`, borderRadius:6,
                  padding:"10px 14px", fontSize:13, color:C.red, marginBottom:16 }}>
                  {error}
                </div>
              )}
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray600,
                letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>New Password</label>
              <div style={{ position:"relative", marginBottom:4 }}>
                <input type={showPw ? "text" : "password"} value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="New password" style={{ width:"100%", height:44, padding:"0 52px 0 14px",
                    border:`1.5px solid ${C.gray200}`, borderRadius:8, fontSize:14,
                    color:C.gray900, background:C.white, outline:"none", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor = C.purple}
                  onBlur={e => e.target.style.borderColor = C.gray200} />
                <button type="button" onClick={() => setShowPw(s=>!s)} style={{
                  position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", color:C.gray400, fontSize:12, fontWeight:600 }}>
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              <PasswordStrength password={password} />

              <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray600,
                letterSpacing:0.5, textTransform:"uppercase", marginBottom:6, marginTop:8 }}>Confirm Password</label>
              <input type="password" value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(""); }}
                placeholder="Repeat password" style={{ width:"100%", height:44, padding:"0 14px",
                  border:`1.5px solid ${C.gray200}`, borderRadius:8, fontSize:14,
                  color:C.gray900, background:C.white, outline:"none", boxSizing:"border-box", marginBottom:20 }}
                onFocus={e => e.target.style.borderColor = C.purple}
                onBlur={e => e.target.style.borderColor = C.gray200} />

              <button type="submit" disabled={loading} style={{ width:"100%", height:46,
                background: loading ? C.gray400 : C.purple, color:C.white, border:"none",
                borderRadius:8, fontSize:14, fontWeight:700, cursor: loading ? "default" : "pointer", letterSpacing:0.3 }}>
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>
          )}
        </div>
        <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:C.gray400 }}>
          <Link to="/login" style={{ color:C.purple, fontWeight:700, textDecoration:"none" }}>← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
