import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const C = {
  navy:"#1A1A2E", purple:"#1A4A9E", purpleDeep:"#102d6a",
  white:"#ffffff", gray100:"#f4f4f4", gray400:"#999", gray900:"#111",
  green:"#15803d", greenLight:"#e6f7ee",
  red:"#c0392b", redLight:"#fdf0ef",
};

export default function VerifyEmailPage() {
  const [params]   = useSearchParams();
  const { silentRefresh } = useAuth();
  const [status, setStatus]   = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async r => {
        const data = await r.json();
        if (r.ok) {
          setStatus("success");
          // Refresh the JWT so is_verified: true is reflected in the app
          silentRefresh();
        } else {
          setStatus("error");
          setMessage(data.detail || "Verification failed. The link may be expired or already used.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Network error. Please try again.");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
      background:C.gray100, fontFamily:"'Open Sans','Segoe UI',Arial,sans-serif", padding:24,
    }}>
      <div style={{
        width:"100%", maxWidth:440, background:C.white, borderRadius:12,
        boxShadow:"0 2px 16px rgba(0,0,0,0.07)", overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{ background:C.navy, padding:"24px 32px" }}>
          <span style={{ color:C.white, fontSize:18, fontWeight:800, letterSpacing:-0.3 }}>AI Watch</span>
          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginLeft:8 }}>by DXC Technology</span>
        </div>

        <div style={{ padding:"36px 32px 32px" }}>
          {status === "verifying" && (
            <>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{
                  width:36, height:36, borderRadius:"50%",
                  border:`3px solid ${C.gray100}`, borderTop:`3px solid ${C.purple}`,
                  animation:"spin 0.8s linear infinite", flexShrink:0,
                }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <span style={{ fontSize:15, fontWeight:700, color:C.gray900 }}>Verifying your email…</span>
              </div>
              <p style={{ fontSize:13, color:C.gray400, margin:0 }}>This should only take a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div style={{
                width:52, height:52, borderRadius:"50%",
                background:C.greenLight, display:"flex", alignItems:"center",
                justifyContent:"center", marginBottom:20,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13L9 17L19 7" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 style={{ fontSize:22, fontWeight:800, color:C.gray900, margin:"0 0 8px" }}>Email verified!</h2>
              <p style={{ fontSize:14, color:C.gray400, margin:"0 0 28px", lineHeight:1.6 }}>
                Your account is now fully active. You can use all features including email alerts and personalised briefings.
              </p>
              <Link to="/" style={{
                display:"inline-block", background:C.purple, color:C.white,
                textDecoration:"none", padding:"12px 24px", borderRadius:8,
                fontSize:14, fontWeight:700, letterSpacing:0.3,
              }}>Go to Dashboard →</Link>
            </>
          )}

          {status === "error" && (
            <>
              <div style={{
                width:52, height:52, borderRadius:"50%",
                background:C.redLight, display:"flex", alignItems:"center",
                justifyContent:"center", marginBottom:20,
              }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M11 7v5M11 15h.01" stroke={C.red} strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="11" cy="11" r="9" stroke={C.red} strokeWidth="2"/>
                </svg>
              </div>
              <h2 style={{ fontSize:20, fontWeight:800, color:C.gray900, margin:"0 0 8px" }}>Verification failed</h2>
              <p style={{ fontSize:14, color:C.gray400, margin:"0 0 24px", lineHeight:1.6 }}>{message}</p>
              <Link to="/login" style={{
                display:"inline-block", background:C.purple, color:C.white,
                textDecoration:"none", padding:"11px 22px", borderRadius:8,
                fontSize:14, fontWeight:700,
              }}>Back to Login</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
