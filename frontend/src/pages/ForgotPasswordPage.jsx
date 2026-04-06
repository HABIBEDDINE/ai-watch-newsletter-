import { useState } from "react";
import { Link } from "react-router-dom";
import { apiForgotPassword } from "../services/api";

const C = {
  purple:"#1A4A9E", purpleDeep:"#102d6a", purplePale:"#e8eef8",
  white:"#ffffff", gray100:"#f4f4f4", gray200:"#e8e8e8",
  gray400:"#999", gray600:"#444", gray900:"#111",
  red:"#c0392b", redLight:"#fdf0ef", green:"#15803d", greenLight:"#e6f7ee",
};

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [submitted, setSub]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address"); return;
    }
    setLoading(true); setError("");
    try {
      await apiForgotPassword({ email });
      setSub(true);
    } catch {
      setError("Something went wrong. Please try again.");
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
          <h2 style={{ fontSize:24, fontWeight:800, color:C.gray900, margin:"0 0 6px" }}>Reset your password</h2>
          <p style={{ fontSize:13, color:C.gray400, margin:0 }}>We'll send a reset link to your email</p>
        </div>

        <div style={{ background:C.white, borderRadius:12, padding:28, boxShadow:"0 2px 16px rgba(0,0,0,0.06)" }}>
          {submitted ? (
            <div style={{ textAlign:"center", padding:"8px 0" }}>
              <div style={{ width:48, height:48, borderRadius:"50%", background:C.greenLight,
                display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11L9 16L18 6" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:C.gray900, marginBottom:8 }}>Check your email</div>
              <div style={{ fontSize:13, color:C.gray400, lineHeight:1.6 }}>
                If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox and spam folder.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.gray600,
                letterSpacing:0.5, textTransform:"uppercase", marginBottom:6 }}>Work Email</label>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="you@company.com"
                style={{ width:"100%", height:44, padding:"0 14px", border:`1.5px solid ${error ? C.red : C.gray200}`,
                  borderRadius:8, fontSize:14, color:C.gray900, background:C.white, outline:"none", boxSizing:"border-box", marginBottom:6 }}
                onFocus={e => e.target.style.borderColor = C.purple}
                onBlur={e => e.target.style.borderColor = error ? C.red : C.gray200} />
              {error && <div style={{ fontSize:12, color:C.red, marginBottom:12 }}>{error}</div>}
              <div style={{ marginBottom:20 }} />
              <button type="submit" disabled={loading} style={{ width:"100%", height:46,
                background: loading ? C.gray400 : C.purple, color:C.white, border:"none", borderRadius:8,
                fontSize:14, fontWeight:700, cursor: loading ? "default" : "pointer", letterSpacing:0.3 }}>
                {loading ? "Sending…" : "Send Reset Link"}
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
