import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// DXC Brand Colors (Dark Theme)
const C = {
  dark: "#0E1020", darker: "#080A14", surface: "#141728",
  border: "#1E2340", orange: "#FFB476", coral: "#F2805E",
  accent: "#FFB476", white: "#F0F2FF", muted: "#8B91B5",
  red: "#F87171", redLight: "rgba(248, 113, 113, 0.1)",
  gradient: "linear-gradient(135deg, #FFB476, #F2805E)",
};

/* ── breakpoints ─────────────────────────────────────────────────────────── */
function useBreakpoint() {
  const get = () => {
    const w = window.innerWidth;
    if (w < 480)  return "xs";   // small phone
    if (w < 768)  return "sm";   // large phone / landscape phone
    if (w < 1024) return "md";   // tablet
    return "lg";                 // desktop / laptop
  };
  const [bp, setBp] = useState(get);
  useEffect(() => {
    const h = () => setBp(get());
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return bp;
}

/* ── text input ──────────────────────────────────────────────────────────── */
function Input({ label, type = "text", value, onChange, error, placeholder }) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display:"block", fontSize:11, fontWeight:600, color:C.muted,
        letterSpacing:0.5, textTransform:"uppercase", marginBottom:6,
      }}>{label}</label>
      <div style={{ position:"relative" }}>
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={type === "email" ? "email" : "current-password"}
          style={{
            width:"100%", height:50,
            padding: isPassword ? "0 56px 0 14px" : "0 14px",
            border:`1.5px solid ${error ? C.red : C.border}`,
            borderRadius:8, fontSize:15, color:C.white,
            background:C.surface, outline:"none", boxSizing:"border-box",
            transition:"border-color 0.15s",
            WebkitAppearance:"none",   // remove iOS inner shadow
          }}
          onFocus={e => { e.target.style.borderColor = error ? C.red : C.orange; }}
          onBlur={e  => { e.target.style.borderColor = error ? C.red : C.border; }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position:"absolute", right:14, top:"50%",
              transform:"translateY(-50%)",
              background:"none", border:"none", cursor:"pointer",
              color:C.muted, fontSize:12, fontWeight:600,
              padding:"6px 8px", touchAction:"manipulation",
              WebkitTapHighlightColor:"transparent",
            }}
          >{show ? "Hide" : "Show"}</button>
        )}
      </div>
      {error && <div style={{ fontSize:12, color:C.red, marginTop:4 }}>{error}</div>}
    </div>
  );
}

/* ── Google "G" icon ─────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

/* ── feature bullet ──────────────────────────────────────────────────────── */
function Feature({ text, small }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{
        width: small ? 18 : 20, height: small ? 18 : 20, borderRadius:"50%",
        background:"rgba(255, 180, 118, 0.15)", border:"1.5px solid rgba(255, 180, 118, 0.3)",
        display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5L4 7L8 3" stroke={C.orange} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span style={{ color:C.muted, fontSize: small ? 12 : 13 }}>{text}</span>
    </div>
  );
}

const FEATURES = [
  "Live news from 4 data sources",
  "AI-powered summaries & signals",
  "DXC solution matching",
];

/* ── main component ──────────────────────────────────────────────────────── */
export default function LoginPage() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from || "/";
  const bp         = useBreakpoint();

  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [errors,      setErrors]      = useState({});
  const [submitting,  setSub]         = useState(false);
  const [serverError, setServerError] = useState("");

  const isMobile = bp === "xs" || bp === "sm";   // < 768 px
  const isTablet = bp === "md";                   // 768 – 1023 px
  const isDesktop = bp === "lg";                  // ≥ 1024 px

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleGoogleLogin = () => { window.location.href = "/api/auth/google"; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSub(true); setServerError("");
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(
        err.message?.includes("429")
          ? "Too many attempts. Try again later."
          : "Invalid email or password."
      );
    } finally { setSub(false); }
  };

  /* ── left panel width by breakpoint ── */
  const leftWidth = isDesktop ? 420 : isTablet ? 300 : 0;

  /* ── form card style ── */
  const formCardStyle = isMobile ? {
    width:"100%", padding:"0 20px", boxSizing:"border-box",
  } : isTablet ? {
    width:"100%", maxWidth:380, padding:"40px 36px",
    background:C.surface, borderRadius:16, border:`1px solid ${C.border}`,
    boxShadow:"0 8px 40px rgba(0,0,0,0.3)",
    boxSizing:"border-box",
  } : {
    width:"100%", maxWidth:400, padding:"0",
    boxSizing:"border-box",
  };

  return (
    <div style={{
      minHeight:"100vh",
      display:"flex",
      background: C.dark,
      fontFamily:"'Inter','Open Sans','Segoe UI',sans-serif",
      overflowX:"hidden",
    }}>

      {/* ── Left branding panel (tablet + desktop) ── */}
      {!isMobile && (
        <div style={{
          flex:`0 0 ${leftWidth}px`,
          background: C.darker,
          borderRight:`1px solid ${C.border}`,
          display:"flex", flexDirection:"column", justifyContent:"center",
          padding: isTablet ? "48px 32px" : "60px 48px",
          position:"relative", overflow:"hidden",
        }}>
          {/* decorative circle */}
          <div style={{
            position:"absolute", bottom:-80, right:-80,
            width:260, height:260, borderRadius:"50%",
            background:"rgba(255, 180, 118, 0.05)", pointerEvents:"none",
          }} />
          <div style={{
            position:"absolute", top:-100, left:-100,
            width:300, height:300, borderRadius:"50%",
            background:"rgba(99, 153, 240, 0.03)", pointerEvents:"none",
          }} />

          <div style={{ marginBottom: isTablet ? 24 : 32 }}>
            <img
              src="/DXC-logo.png"
              alt="DXC"
              style={{ height: isTablet ? 32 : 40, width: 'auto' }}
            />
          </div>

          <h1 style={{
            color:C.white,
            fontSize: isTablet ? 26 : 32,
            fontWeight:700, letterSpacing:-1, lineHeight:1.2,
            margin:`0 0 ${isTablet ? 12 : 16}px`,
          }}>
            AI Watch
          </h1>

          <p style={{
            color:C.muted,
            fontSize: isTablet ? 13 : 15,
            lineHeight:1.7,
            margin:`0 0 ${isTablet ? 28 : 40}px`,
          }}>
            Strategic technology intelligence platform. Monitor trends, track
            competitors, and surface actionable insights — powered by AI.
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap: isTablet ? 10 : 12 }}>
            {FEATURES.map(f => <Feature key={f} text={f} small={isTablet} />)}
          </div>
        </div>
      )}

      {/* ── Right / full-screen form area ── */}
      <div style={{
        flex:1,
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent: isMobile ? "flex-start" : "center",
        padding: isMobile ? "0" : isTablet ? "32px 24px" : "32px",
        minHeight:"100vh",
        overflowY:"auto",
        background: C.dark,
      }}>

        {/* Mobile top brand header */}
        {isMobile && (
          <div style={{
            width:"100%",
            background: C.darker,
            borderBottom:`1px solid ${C.border}`,
            padding: bp === "xs" ? "36px 20px 28px" : "44px 24px 36px",
            textAlign:"center",
            marginBottom:28,
          }}>
            <img
              src="/DXC-logo.png"
              alt="DXC"
              style={{ height: 32, width: 'auto', display: 'block', margin: '0 auto 12px' }}
            />
            <h1 style={{
              color:C.white, fontWeight:700, margin:"0 0 6px",
              fontSize: bp === "xs" ? 22 : 26, letterSpacing:-0.5,
            }}>AI Watch</h1>
            <p style={{ color:C.muted, fontSize:13, margin:0, lineHeight:1.5 }}>
              Strategic technology intelligence
            </p>
          </div>
        )}

        {/* Form card */}
        <div style={formCardStyle}>

          <div style={{ marginBottom:24 }}>
            <h2 style={{
              fontSize: isMobile ? (bp === "xs" ? 20 : 22) : 24,
              fontWeight:700, color:C.white, letterSpacing:-0.5, margin:"0 0 6px",
            }}>Welcome back</h2>
            <p style={{ fontSize:14, color:C.muted, margin:0 }}>
              Sign in to your AI Watch account
            </p>
          </div>

          {serverError && (
            <div style={{
              background:C.redLight, border:`1px solid rgba(248, 113, 113, 0.3)`,
              borderLeft:`3px solid ${C.red}`, borderRadius:8,
              padding:"10px 14px", fontSize:13, color:C.red, marginBottom:18,
            }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Work Email" type="email" value={email}
              onChange={v => { setEmail(v); setErrors(e => ({...e, email:""})); }}
              error={errors.email} placeholder="you@company.com"
            />
            <Input
              label="Password" type="password" value={password}
              onChange={v => { setPassword(v); setErrors(e => ({...e, password:""})); }}
              error={errors.password} placeholder="Your password"
            />

            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:-10, marginBottom:20 }}>
              <Link to="/forgot-password" style={{
                fontSize:13, color:C.orange, textDecoration:"none",
                fontWeight:600, padding:"4px 0",
              }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width:"100%", height:50,
                background: submitting ? C.muted : C.gradient,
                color: C.darker, border:"none", borderRadius:8,
                fontSize:15, fontWeight:700,
                cursor: submitting ? "default" : "pointer",
                letterSpacing:0.3, transition:"all 0.2s",
                touchAction:"manipulation", WebkitTapHighlightColor:"transparent",
              }}
              onMouseEnter={e => { if (!submitting) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.filter = "brightness(1.1)"; }}}
              onMouseLeave={e => { if (!submitting) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.filter = "brightness(1)"; }}}
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>

            {/* Divider */}
            <div style={{ display:"flex", alignItems:"center", gap:12, margin:"20px 0" }}>
              <div style={{ flex:1, height:1, background:C.border }} />
              <span style={{ fontSize:12, color:C.muted, fontWeight:500 }}>or</span>
              <div style={{ flex:1, height:1, background:C.border }} />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.muted; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
              style={{
                width:"100%", height:50, background:C.surface,
                border:`1.5px solid ${C.border}`, borderRadius:8,
                fontSize:15, fontWeight:600, color:C.white,
                cursor:"pointer", display:"flex", alignItems:"center",
                justifyContent:"center", gap:10,
                transition:"all 0.15s",
                touchAction:"manipulation", WebkitTapHighlightColor:"transparent",
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p style={{
              textAlign:"center",
              margin: isMobile ? "24px 0 40px" : "24px 0 0",
              fontSize:14, color:C.muted,
            }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color:C.orange, fontWeight:700, textDecoration:"none" }}>
                Create account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
