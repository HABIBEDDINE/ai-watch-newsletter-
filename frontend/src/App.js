import { useState, useEffect, useCallback } from "react";
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { getFeed, getRadar, getHealth } from "./services/api";
import { ArticleProvider } from "./context/ArticleContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Compass, Lightbulb, BarChart2, FileText, Mail, TrendingUp, PanelLeftClose, PanelLeftOpen, LogOut, User, Bookmark } from "lucide-react";
import Explore from "./pages/Explore";
import Solutions from "./pages/Solutions";
import DataPreview from "./pages/DataPreview";
import Reports from "./pages/Reports";
import Newsletter from "./pages/Newsletter";
import ArticleDetail from "./pages/ArticleDetail";
import Trends from "./pages/Trends";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ProfilePage from "./pages/ProfilePage";
import SavedPage from "./pages/SavedPage";

const B = {
  purple:      "#1A4A9E",
  purpleDeep:  "#102d6a",
  purpleLight: "#4a7fd4",
  purplePale:  "#e8eef8",
  purpleMid:   "#d0dcea",
  black:       "#000000",
  darkBg:      "#0a0a0a",
  darkSection: "#111111",
  darkCard:    "#1a1a1a",
  darkBorder:  "#2a2a2a",
  white:       "#ffffff",
  offWhite:    "#f9f9f9",
  gray50:      "#fafafa",
  gray100:     "#f4f4f4",
  gray200:     "#e8e8e8",
  gray300:     "#d0d0d0",
  gray400:     "#999999",
  gray500:     "#666666",
  gray600:     "#444444",
  gray700:     "#222222",
  gray900:     "#111111",
  green:       "#C45F00",
  greenLight:  "#fdf0e6",
  red:         "#c0392b",
  redLight:    "#fdf0ef",
  amber:       "#b45309",
  amberLight:  "#fef3e2",
  blue:        "#1a5fa8",
  blueLight:   "#e8f0fb",
};

const PERSONAS = {
  cto: {
    id: "cto", initials: "AB", name: "Ahmed Benali",
    role: "Chief Technology Officer", company: "Stellantis Group",
    sector: "Automotive & Manufacturing",
    tagColor: B.purple, tagBg: B.purplePale,
    kpis: [
      { label: "Tech Signals",     value: "47",    delta: "+12 today",         up: true,  icon: "📡" },
      { label: "Patents Tracked",  value: "234",   delta: "+18 this week",     up: true,  icon: "📋" },
      { label: "Startups Watched", value: "1,204", delta: "+67 new",           up: true,  icon: "🚀" },
      { label: "DXC Match Score",  value: "94%",   delta: "AI Readiness fit",  up: true,  icon: "🎯" },
    ],
  },
  innovation: {
    id: "innovation", initials: "CD", name: "Camille Dubois",
    role: "Innovation Manager", company: "BNP Paribas",
    sector: "Banking & Finance",
    tagColor: B.blue, tagBg: B.blueLight,
    kpis: [
      { label: "Competitors Tracked", value: "23",     delta: "+2 this week", up: true, icon: "🏁" },
      { label: "Funding Rounds",      value: "14",     delta: "+5 new",       up: true, icon: "💰" },
      { label: "Use Cases Mapped",    value: "89",     delta: "+11 added",    up: true, icon: "🗂️" },
    ],
  },
  strategy: {
    id: "strategy", initials: "OT", name: "Omar Tazi",
    role: "Dir. Stratégie & IA", company: "Ministère Économie",
    sector: "Public Sector",
    tagColor: B.green, tagBg: B.greenLight,
    kpis: [
      { label: "ROI Estimé",               value: "€4.2M", delta: "+€0.8M pipeline", up: true,  icon: "📈" },
      { label: "Alertes Réglementaires",   value: "6",     delta: "+2 urgents",       up: false, icon: "⚖️" },
      { label: "AI Maturity Score",        value: "67%",   delta: "+4% ce mois",      up: true,  icon: "🧭" },
      { label: "Roadmap Progress",         value: "38%",   delta: "Sprint 3/6",       up: true,  icon: "🗓️" },
    ],
  },
};

const INDUSTRY_FILTERS = [
  { id: "all", label: "All Industries", personas: ["cto", "innovation", "strategy"] },
  { id: "automotive", label: "Automotive & Manufacturing", personas: ["cto"] },
  { id: "banking", label: "Banking & Finance", personas: ["innovation"] },
  { id: "public", label: "Public Sector", personas: ["strategy"] },
];

const FEED = {
  cto: [
    {
      id: 1, urgency: "HIGH", tag: "Disruption Alert", source: "TechCrunch", time: "2h ago",
      title: "Toyota deploys Agentic AI for autonomous supply chain — 23% cost reduction",
      summary: "Toyota's new AI agent network autonomously manages 340+ suppliers, reducing procurement costs by 23% and decision latency from 4 hours to 8 minutes. This represents a direct competitive threat to other automotive manufacturers who have yet to adopt similar systems.",
      signals: ["Supply Chain", "Agentic AI", "Competitive Intel"],
      dxc: { name: "Agentic AI Accelerator", fit: 95, timeline: "1–2 months", cta: "Book Assessment" },
    },
    {
      id: 2, urgency: "MEDIUM", tag: "Patent Watch", source: "EPO Database", time: "5h ago",
      title: "3 EU patents filed on LiDAR + Gen AI fusion for real-time defect detection",
      summary: "Continental, Bosch, and a French startup have filed patents combining LiDAR sensors with generative AI for manufacturing quality control. Could redefine QA processes on production lines within 18 months.",
      signals: ["Patent", "Quality Control", "Manufacturing"],
      dxc: { name: "Intelligent Analytics", fit: 82, timeline: "1–2 weeks", cta: "Request Demo" },
    },
    {
      id: 3, urgency: "LOW", tag: "Startup Radar", source: "Dealroom", time: "1d ago",
      title: "Synthesis AI raises €45M Series B — synthetic training data for automotive",
      summary: "Paris-based Synthesis AI closed a €45M round led by Balderton Capital. Their platform generates photorealistic synthetic datasets for ADAS training, potentially cutting data collection costs by 80%.",
      signals: ["Funding", "Synthetic Data", "ADAS"],
      dxc: { name: "AI Use Case Radar", fit: 74, timeline: "2–3 weeks", cta: "Explore" },
    },
  ],
  innovation: [
    {
      id: 4, urgency: "HIGH", tag: "Competitor Move", source: "Financial Times", time: "3h ago",
      title: "HSBC launches real-time AI fraud detection — 99.2% accuracy, 0.3ms latency",
      summary: "HSBC's FinShield processes 2.3M transactions/second with AI-native fraud detection. Direct upgrade over rule-based systems. Estimated €180M in prevented fraud in Q1 alone — setting a new industry benchmark.",
      signals: ["Fraud", "Real-time AI", "Competitor"],
      dxc: { name: "Intelligent Analytics", fit: 96, timeline: "1–2 weeks", cta: "Simulate ROI" },
    },
    {
      id: 5, urgency: "MEDIUM", tag: "Funding Alert", source: "Les Échos", time: "6h ago",
      title: "Mistral AI raises €600M — European LLM sovereignty gaining board-level traction",
      summary: "Mistral AI's latest round values the company at €6B. The French government is backing this as a GDPR-native alternative to US LLMs, now under evaluation by several EU financial institutions.",
      signals: ["Funding", "EU Sovereignty", "LLM"],
      dxc: { name: "Gen AI MVP", fit: 88, timeline: "6–10 weeks", cta: "Schedule Workshop" },
    },
    {
      id: 6, urgency: "MEDIUM", tag: "Market Report", source: "Accenture Research", time: "1d ago",
      title: "Agentic AI adoption in banking jumps 340% YoY — average ROI 4.2x in 18 months",
      summary: "New Accenture report shows banks deploying agentic AI for customer onboarding, KYC automation, and credit decisioning. Top adopters: Deutsche Bank, ING, Crédit Agricole.",
      signals: ["Agentic AI", "ROI", "KYC"],
      dxc: { name: "Agentic AI Accelerator", fit: 91, timeline: "1–2 months", cta: "View Case Study" },
    },
  ],
  strategy: [
    {
      id: 7, urgency: "HIGH", tag: "Regulatory", source: "EUR-Lex Official", time: "1h ago",
      title: "EU AI Act Article 22 enforcement — public sector deadline confirmed August 2025",
      summary: "The European Commission confirmed August 2025 as the compliance deadline for public sector AI systems. Non-compliant systems face suspension orders. Morocco's bilateral trade agreements may create additional compliance obligations.",
      signals: ["EU AI Act", "Compliance", "Risk"],
      dxc: { name: "Data Framework", fit: 98, timeline: "3–6 months", cta: "Compliance Audit" },
    },
    {
      id: 8, urgency: "MEDIUM", tag: "Investment", source: "G7 Communiqué", time: "4h ago",
      title: "G7 commits $28B to national AI infrastructure — open window for regional leaders",
      summary: "G7 summit declaration includes a coordinated $28B investment in sovereign AI compute and talent programs 2025–2027. An open positioning window exists for emerging market leaders in AI governance.",
      signals: ["Investment", "Sovereign AI", "G7"],
      dxc: { name: "ROI Simulator", fit: 90, timeline: "1–2 months", cta: "Model ROI" },
    },
    {
      id: 9, urgency: "LOW", tag: "Benchmark", source: "Oxford Internet Institute", time: "2d ago",
      title: "Estonia & UAE top AI Readiness Index 2025 — public sector transformation playbook",
      summary: "Key differentiators: unified data governance layer, AI procurement framework, and citizen-facing AI audit trails. The report provides an actionable benchmark for governments targeting top-10 AI readiness.",
      signals: ["Readiness", "Governance", "Benchmark"],
      dxc: { name: "AI Readiness Assessment", fit: 85, timeline: "1–3 weeks", cta: "Run Assessment" },
    },
  ],
};

const PRODUCTS = {
  cto: [
    { name: "AI Readiness Assessment", score: 94, fit: "Critical",  desc: "Full AI maturity evaluation across data, infra & governance",       time: "1–3 weeks",   tag: "Quick Start" },
    { name: "Agentic AI Accelerator",  score: 88, fit: "High",      desc: "Deploy autonomous workflows for supply chain operations",            time: "1–2 months",  tag: "Competitive Edge" },
    { name: "AI Use Case Radar",       score: 76, fit: "Strategic", desc: "Continuous sector-specific AI trend scanning & alerting",           time: "2–3 weeks",   tag: "Ongoing" },
  ],
  innovation: [
    { name: "AI Use Case Radar",       score: 97, fit: "Critical",  desc: "Sector-agnostic intelligence for competitive benchmarking",         time: "2–3 weeks",   tag: "Top Match" },
    { name: "Gen AI MVP",              score: 85, fit: "High",      desc: "Scalable Generative AI deployment framework with guardrails",       time: "6–10 weeks",  tag: "High Impact" },
    { name: "Intelligent Analytics",   score: 79, fit: "Strategic", desc: "ML/NLP pipeline for real-time competitive market insights",         time: "1–2 weeks",   tag: "Quick Win" },
  ],
  strategy: [
    { name: "ROI Simulator",           score: 96, fit: "Critical",  desc: "Quantify AI investment value with financial modeling",              time: "1–2 months",  tag: "Decision Ready" },
    { name: "Data Framework",          score: 91, fit: "Critical",  desc: "Unified governance & EU AI Act compliance architecture",            time: "3–6 months",  tag: "Foundation" },
    { name: "AI Readiness Assessment", score: 82, fit: "High",      desc: "National AI maturity benchmark & strategic roadmap",               time: "1–3 weeks",   tag: "Quick Start" },
  ],
};

const TRENDS_DATA = {
  cto:        [22, 35, 28, 45, 38, 52, 47],
  innovation: [18, 24, 31, 27, 42, 38, 45],
  strategy:   [12, 18, 22, 35, 29, 44, 38],
};

function MiniChart({ data, color }) {
  const max = Math.max(...data);
  const days = ["M","T","W","T","F","S","S"];
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:52 }}>
      {data.map((v, i) => (
        <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1, gap:4 }}>
          <div style={{
            width:"100%", height:`${(v/max)*38}px`,
            background: i === data.length-1 ? color : `${color}40`,
            borderRadius:"2px 2px 0 0", transition:"height 0.4s ease",
          }} />
          <span style={{ fontSize:9, color:B.gray400, fontWeight:600, letterSpacing:0.5 }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

function ScoreBar({ value, color }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, height:4, background:B.gray200, borderRadius:2, overflow:"hidden" }}>
        <div style={{ width:`${value}%`, height:"100%", background:color, borderRadius:2, transition:"width 0.6s ease" }} />
      </div>
      <span style={{ fontSize:12, fontWeight:700, color, minWidth:34 }}>{value}%</span>
    </div>
  );
}

function NewsCard({ item, accentColor, expanded, onToggle }) {
  const cardColor = accentColor || B.purple;
  return (
    <div
      onClick={onToggle}
      onMouseEnter={e => { e.currentTarget.style.background = B.gray50; e.currentTarget.style.borderLeft = `4px solid ${cardColor}`; }}
      onMouseLeave={e => { e.currentTarget.style.background = expanded ? B.gray50 : B.white; e.currentTarget.style.borderLeft = `4px solid ${expanded ? cardColor : "transparent"}`; }}
      style={{
        background: expanded ? B.gray50 : B.white,
        padding:"20px 24px",
        borderBottom:`1px solid ${B.gray200}`,
        borderLeft:`4px solid ${expanded ? cardColor : "transparent"}`,
        cursor:"pointer", transition:"all 0.2s",
      }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:11, color:B.gray400 }}>{item.source} · {item.time} · {item.industry || "General"}</span>
          <span style={{ color:B.gray400, fontSize:16, display:"inline-block", transform: expanded ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}>›</span>
        </div>
      </div>

      <div style={{ fontSize:14, fontWeight:700, color:B.gray900, lineHeight:1.45, marginBottom:10, letterSpacing:-0.1 }}>
        {item.title}
      </div>

      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        {item.signals.map(s => (
          <span key={s} style={{
            fontSize:10, color:cardColor, background:"transparent",
            border:`1px solid ${cardColor}50`,
            padding:"2px 8px", borderRadius:2,
            fontWeight:700, letterSpacing:0.5, textTransform:"uppercase",
          }}>{s}</span>
        ))}
      </div>

      {expanded && (
        <div style={{ marginTop:18, paddingTop:18, borderTop:`1px solid ${B.gray200}` }}>
          <p style={{ fontSize:13.5, color:B.gray600, lineHeight:1.75, marginBottom:20 }}>{item.summary}</p>
          <div style={{
            background:B.darkBg, padding:"20px 24px",
            display:"flex", justifyContent:"space-between", alignItems:"center", gap:16,
          }}>
            <div>
              <div style={{ fontSize:10, color:cardColor, fontWeight:800, letterSpacing:1.5, textTransform:"uppercase", marginBottom:6 }}>
                DXC Recommended Solution
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:B.white, marginBottom:8 }}>{item.dxc.name}</div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:160 }}>
                  <div style={{ flex:1, height:3, background:B.darkBorder, borderRadius:2 }}>
                    <div style={{ width:`${item.dxc.fit}%`, height:"100%", background:cardColor, borderRadius:2 }} />
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:cardColor, minWidth:34 }}>{item.dxc.fit}%</span>
                </div>
                <span style={{ fontSize:11, color:B.gray400 }}>{item.dxc.timeline}</span>
              </div>
            </div>
            <button
              onMouseEnter={e => { e.target.style.background = B.white; e.target.style.color = B.darkBg; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = B.white; }}
              style={{
                background:"transparent", color:B.white,
                border:`2px solid ${B.white}`, borderRadius:0,
                padding:"10px 22px", fontSize:12, fontWeight:700,
                cursor:"pointer", whiteSpace:"nowrap", flexShrink:0,
                letterSpacing:0.5, transition:"all 0.2s",
              }}
            >{item.dxc.cta} →</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, p }) {
  const fitColor = product.fit === "Critical" ? B.red : product.fit === "High" ? B.amber : B.blue;
  return (
    <div
      onMouseEnter={e => { e.currentTarget.style.borderLeft = `4px solid ${p.tagColor}`; e.currentTarget.style.background = B.gray50; }}
      onMouseLeave={e => { e.currentTarget.style.borderLeft = `4px solid transparent`; e.currentTarget.style.background = B.white; }}
      style={{
        background:B.white, padding:"20px 24px",
        borderBottom:`1px solid ${B.gray200}`,
        borderLeft:`4px solid transparent`, transition:"all 0.2s",
      }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <div style={{ fontSize:15, fontWeight:700, color:B.gray900, letterSpacing:-0.2 }}>{product.name}</div>
        <span style={{
          fontSize:10, fontWeight:800, color:fitColor,
          background:`${fitColor}10`, border:`1px solid ${fitColor}30`,
          padding:"3px 9px", borderRadius:2, letterSpacing:0.8, textTransform:"uppercase",
        }}>{product.fit}</span>
      </div>
      <div style={{ fontSize:13, color:B.gray500, marginBottom:14, lineHeight:1.6 }}>{product.desc}</div>
      <ScoreBar value={product.score} color={p.tagColor} />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12 }}>
        <span style={{ fontSize:11, color:B.gray400, fontWeight:600 }}>⏱ {product.time}</span>
        <span style={{ fontSize:10, fontWeight:800, color:p.tagColor, letterSpacing:0.8, textTransform:"uppercase" }}>{product.tag}</span>
      </div>
    </div>
  );
}

export default function AIWatchDXC() {
  return (
    <AuthProvider>
    <ArticleProvider>
    <Routes>
      {/* ── Public auth routes ── */}
      <Route path="/login"            element={<LoginPage />} />
      <Route path="/register"         element={<RegisterPage />} />
      <Route path="/forgot-password"  element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email"     element={<VerifyEmailPage />} />
      {/* ── Protected app shell ── */}
      <Route path="/*" element={
        <ProtectedRoute>
          <AppShell />
        </ProtectedRoute>
      } />
    </Routes>
    </ArticleProvider>
    </AuthProvider>
  );
}

function AppShell() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [industryFilter, setIndustryFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [tick,     setTick]     = useState(0);
  const [feed,     setFeed]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [products, setProducts] = useState(PRODUCTS.cto);
  const [toasts, setToasts] = useState([]);
  const [health, setHealth] = useState({ status: "checking" });
  const [loadError, setLoadError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const activeIndustry = INDUSTRY_FILTERS.find(x => x.id === industryFilter) || INDUSTRY_FILTERS[0];
  const primaryPersona = activeIndustry.personas[0];
  const p = PERSONAS[primaryPersona];

  const pushToast = useCallback((message, kind = "error") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const loadDashboardData = useCallback(async (selectedIndustryId) => {
    setExpanded(null);
    setLoading(true);
    setLoadError("");

    const selectedIndustry = INDUSTRY_FILTERS.find(x => x.id === selectedIndustryId) || INDUSTRY_FILTERS[0];
    const personasToLoad = selectedIndustry.personas;
    const mainPersona = personasToLoad[0];

    try {
      const feedResults = await Promise.allSettled(
        personasToLoad.map(personaId =>
          getFeed(personaId, 4).then(data => ({ personaId, data }))
        )
      );

      const combinedFeed = feedResults
        .filter(r => r.status === "fulfilled")
        .flatMap(r => (r.value.data.feed || []).map((item, idx) => ({
          ...item,
          id: `${r.value.personaId}-${item.id}-${idx}`,
          industry: PERSONAS[r.value.personaId].sector,
          accentColor: PERSONAS[r.value.personaId].tagColor,
        })));

      if (combinedFeed.length > 0) {
        setFeed(combinedFeed);
      } else {
        const fallbackCombined = personasToLoad.flatMap(personaId =>
          (FEED[personaId] || []).map((item, idx) => ({
            ...item,
            id: `${personaId}-${item.id}-${idx}`,
            industry: PERSONAS[personaId].sector,
            accentColor: PERSONAS[personaId].tagColor,
          }))
        );
        setFeed(fallbackCombined);
      }

      const [radarResult] = await Promise.allSettled([
        getRadar(mainPersona, 4),
      ]);

      if (radarResult.status === "fulfilled") {
        setProducts(radarResult.value.products || PRODUCTS[mainPersona]);
      } else {
        setProducts(PRODUCTS[mainPersona]);
      }

      const hasFeedFailure = feedResults.some(r => r.status === "rejected");
      const hasAuxFailure = radarResult.status === "rejected";
      if (hasFeedFailure) {
        setLoadError("Some backend APIs are slow or unavailable. Showing partial fallback data.");
        pushToast("Explore is using fallback data because feed APIs timed out.", "error");
      } else if (hasAuxFailure) {
        setLoadError("");
        pushToast("Some secondary sections were delayed; Explore remains live.", "info");
      } else {
        setLoadError("");
      }
    } catch (err) {
      console.error("Unexpected dashboard load error:", err);
      const fallbackCombined = personasToLoad.flatMap(personaId =>
        (FEED[personaId] || []).map((item, idx) => ({
          ...item,
          id: `${personaId}-${item.id}-${idx}`,
          industry: PERSONAS[personaId].sector,
          accentColor: PERSONAS[personaId].tagColor,
        }))
      );
      setFeed(fallbackCombined);
      setProducts(PRODUCTS[mainPersona]);
      setLoadError("Could not reach backend APIs. Showing fallback data.");
      pushToast("Backend request failed. Showing fallback data.", "error");
    } finally {
      setLoading(false);
    }
  }, [pushToast]);

  useEffect(() => { const t = setInterval(() => setTick(x => x+1), 2500); return () => clearInterval(t); }, []);
  useEffect(() => {
    loadDashboardData(industryFilter);
  }, [industryFilter, loadDashboardData]);

  useEffect(() => {
    let mounted = true;
    let failCount = 0;

    const checkHealth = () => {
      getHealth()
        .then(() => {
          if (mounted) {
            failCount = 0;
            setHealth({ status: "online" });
          }
        })
        .catch(() => {
          if (mounted) {
            failCount += 1;
            if (failCount >= 2) {
              setHealth({ status: "offline" });
            }
          }
        });
    };

    checkHealth();
    const intervalId = setInterval(checkHealth, 15000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const liveStatus = health.status === "online" ? "LIVE" : health.status === "offline" ? "API DOWN" : "CHECKING";
  const liveColor = health.status === "online" ? B.green : health.status === "offline" ? B.red : B.amber;

  const navTabs = [
    { id:"feed",       label:"News Feed",       path:"/",             Icon: Compass,     desc:"Browse and filter live articles"    },
    { id:"trends",     label:"AI Trends",       path:"/trends",       Icon: TrendingUp,  desc:"Live AI tools & model intelligence"  },
    { id:"radar",      label:"Solutions",       path:"/solutions",    Icon: Lightbulb,   desc:"DXC product recommendations"        },
    { id:"data",       label:"Data Table",      path:"/data-preview", Icon: BarChart2,   desc:"Sort and export article data"       },
    { id:"reports",    label:"My Reports",      path:"/reports",      Icon: FileText,    desc:"Save and download PDF reports"      },
    { id:"saved",      label:"Saved Items",     path:"/saved",        Icon: Bookmark,    desc:"Your saved articles and trends"     },
    { id:"newsletter", label:"Newsletter",      path:"/newsletter",   Icon: Mail,        desc:"Compose and send intelligence briefs"},
    { id:"profile",    label:"My Profile",      path:"/profile",      Icon: User,        desc:"Edit your name, company and role"   },
  ];

  const location = useLocation();

  return (
    <div style={{ minHeight:"100vh", background:B.gray100, fontFamily:"'Open Sans','Segoe UI',Arial,sans-serif", color:B.gray900 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .fade { animation: fadeUp 0.3s ease both; }
        .dxc-nav-btn:hover { color:${B.purple} !important; background:${B.gray100} !important; }
        .dxc-persona-btn:hover { opacity:0.85; }
        .dxc-btn-primary { background:${B.purple}!important; color:${B.white}!important; border:2px solid ${B.purple}!important; border-radius:0!important; font-weight:700!important; letter-spacing:0.5px!important; transition:all 0.2s!important; cursor:pointer!important; }
        .dxc-btn-primary:hover { background:${B.purpleDeep}!important; border-color:${B.purpleDeep}!important; }
        .dxc-btn-outline { background:transparent!important; color:${B.gray700}!important; border:2px solid ${B.gray700}!important; border-radius:0!important; font-weight:700!important; letter-spacing:0.5px!important; transition:all 0.2s!important; cursor:pointer!important; }
        .dxc-btn-outline:hover { background:${B.gray700}!important; color:${B.white}!important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:${B.gray100}; }
        ::-webkit-scrollbar-thumb { background:${B.gray300}; }
        .aw-sidebar { transition: width 0.28s ease; overflow: hidden; }
        .aw-sidebar-label { white-space: nowrap; overflow: hidden; transition: opacity 0.18s ease; }
        .aw-sidebar-label.hidden { opacity: 0; width: 0; pointer-events: none; }
        .aw-collapse-btn { display: flex; }
        @media (max-width: 767px) { .aw-collapse-btn { display: none !important; } }
        .aw-nav-icon-wrap:hover { background: ${B.purplePale} !important; }
      `}</style>

      {toasts.length > 0 && (
        <div className="aw-toast-wrap" style={{ position:"fixed", top:72, right:20, zIndex:1000, display:"flex", flexDirection:"column", gap:8 }}>
          {toasts.map(t => (
            <div key={t.id} className="aw-toast-item" style={{
              minWidth:320, maxWidth:420,
              border:`1px solid ${t.kind === "error" ? B.red : B.blue}`,
              background:B.white,
              borderLeft:`4px solid ${t.kind === "error" ? B.red : B.blue}`,
              padding:"10px 12px",
              boxShadow:"0 4px 16px rgba(0,0,0,0.08)",
              fontSize:12,
              color:B.gray700,
            }}>
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* ── TOPBAR ── */}
      <div style={{
        background:B.white, height:56,
        display:"flex", alignItems:"center", padding:`0 ${isMobile ? 16 : 28}px`, justifyContent:"space-between",
        position:"sticky", top:0, zIndex:200, borderBottom:`1px solid ${B.gray100}`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 6px", display:"flex", flexDirection:"column", gap:4 }}
              aria-label="Menu"
            >
              <span style={{ display:"block", width:20, height:2, background:B.gray700, borderRadius:2 }} />
              <span style={{ display:"block", width:20, height:2, background:B.gray700, borderRadius:2 }} />
              <span style={{ display:"block", width:20, height:2, background:B.gray700, borderRadius:2 }} />
            </button>
          )}
          <img src="/solutions/DXC.png" alt="DXC" style={{ height:28, objectFit:"contain", display:"block" }} />
          <span style={{ fontSize:isMobile ? 16 : 18, fontWeight:800, color:B.gray900, letterSpacing:-0.4, fontFamily:"'Open Sans',sans-serif", lineHeight:1 }}>AI Watch</span>
          <div style={{ display:"flex", alignItems:"center", gap:5, border:`1px solid ${liveColor}40`, borderRadius:2, padding:"3px 9px" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:liveColor, animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:10, fontWeight:700, color:liveColor, letterSpacing:1 }}>{liveStatus}</span>
          </div>
        </div>
      </div>

      {/* ── MOBILE SIDEBAR BACKDROP ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:"fixed", top:56, right:0, bottom:0, left:0, background:"rgba(0,0,0,0.45)", zIndex:199 }}
        />
      )}

      {/* ── LAYOUT ── */}
      <div style={{ display:"flex", height:"calc(100vh - 56px)" }}>

        {/* ── LEFT SIDEBAR ── */}
        <div className={`aw-sidebar${!sidebarOpen ? " aw-sidebar-hidden" : ""}`} style={{
          width: isMobile ? 210 : (sidebarCollapsed ? 52 : 210),
          minWidth: isMobile ? 210 : (sidebarCollapsed ? 52 : 210),
          background:B.white, borderRight:`1px solid ${B.gray100}`,
          padding:"0", display:"flex", flexDirection:"column",
          overflowY:"auto", overflowX:"hidden", flexShrink:0,
          ...(isMobile ? {
            position:"fixed", top:56, left:0, height:"calc(100vh - 56px)",
            zIndex:200, boxShadow:"4px 0 20px rgba(0,0,0,0.15)",
          } : {}),
        }}>

          {/* ── COLLAPSE TOGGLE (desktop only) ── */}
          <button
            className="aw-collapse-btn"
            onClick={() => setSidebarCollapsed(c => !c)}
            title={sidebarCollapsed ? "Expand menu" : "Collapse menu"}
            onMouseEnter={e => { e.currentTarget.style.background = B.gray50; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            style={{
              height:44, width:"100%", border:"none", cursor:"pointer",
              background:"transparent",
              borderBottom:`1px solid ${B.gray100}`,
              display:"flex", alignItems:"center",
              justifyContent: sidebarCollapsed ? "center" : "space-between",
              padding: sidebarCollapsed ? "0" : "0 12px 0 16px",
              flexShrink:0, transition:"background 0.15s",
            }}
          >
            <span className={`aw-sidebar-label${sidebarCollapsed ? " hidden" : ""}`}
              style={{ fontSize:11, fontWeight:700, color:B.gray400, letterSpacing:1.2, textTransform:"uppercase", whiteSpace:"nowrap" }}>
              Navigation
            </span>
            <div style={{
              width:28, height:28, borderRadius:6,
              background: B.gray100,
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0, transition:"background 0.15s",
            }}>
              {sidebarCollapsed
                ? <PanelLeftOpen  size={15} strokeWidth={1.8} color={B.gray500} />
                : <PanelLeftClose size={15} strokeWidth={1.8} color={B.gray500} />
              }
            </div>
          </button>

          {/* spacer below toggle */}
          <div style={{ height:4 }} />

          {navTabs.map(t2 => {
            const isActive = location.pathname === t2.path;
            const collapsed = sidebarCollapsed && !isMobile;
            return (
              <Link
                key={t2.id}
                to={t2.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                onMouseEnter={e => { if (!isActive) e.currentTarget.querySelector(".aw-nav-icon-wrap").style.background = B.purplePale; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.querySelector(".aw-nav-icon-wrap").style.background = "transparent"; }}
                title={collapsed ? t2.label : undefined}
                style={{
                  display:"flex",
                  alignItems:"center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? "5px 0" : "4px 10px 4px 10px",
                  margin: "1px 6px",
                  borderRadius:8,
                  border:"none",
                  background:"transparent",
                  color: isActive ? B.purple : B.gray500,
                  fontSize:13, fontWeight: isActive ? 700 : 400,
                  cursor:"pointer", width:"calc(100% - 12px)", transition:"all 0.15s",
                  textDecoration:"none",
                }}
              >
                {/* icon pill */}
                <div className="aw-nav-icon-wrap" style={{
                  width: collapsed ? 36 : 32, height: collapsed ? 36 : 32,
                  borderRadius:8, flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background: isActive ? B.purplePale : "transparent",
                  transition:"background 0.15s",
                }}>
                  <t2.Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? B.purple : B.gray400} />
                </div>
                {/* label */}
                <div className={`aw-sidebar-label${collapsed ? " hidden" : ""}`} style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight: isActive ? 700 : 500, color: isActive ? B.purple : B.gray600, lineHeight:1.3 }}>
                    {t2.label}
                  </div>
                  {isActive && (
                    <div style={{ fontSize:11, color:B.purple, fontWeight:400, marginTop:1, opacity:0.65, lineHeight:1.35 }}>
                      {t2.desc}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          <div style={{ flex:1 }} />

          {/* ── USER FOOTER ── */}
          <div style={{
            padding: sidebarCollapsed && !isMobile ? "12px 0" : "12px 10px",
            borderTop: `1px solid ${B.gray100}`,
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed && !isMobile ? "center" : "flex-start",
            gap: 10,
            flexShrink: 0,
          }}>
            {/* Avatar — click to profile */}
            <Link to="/profile" onClick={() => isMobile && setSidebarOpen(false)}
              title="My Profile"
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: B.purple, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 13, fontWeight: 700,
                color: B.white, flexShrink: 0, textDecoration: "none",
                position: "relative",
              }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              {/* unverified dot */}
              {user && !user.is_verified && (
                <span style={{
                  position:"absolute", top:0, right:0,
                  width:9, height:9, borderRadius:"50%",
                  background:"#f59e0b", border:`2px solid ${B.white}`,
                }} />
              )}
            </Link>

            {/* Name + role */}
            <div className={`aw-sidebar-label${sidebarCollapsed && !isMobile ? " hidden" : ""}`}
              style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: B.gray900,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.full_name || "User"}
              </div>
              <div style={{ fontSize: 11, color: B.gray400, textTransform: "capitalize" }}>
                {user?.role?.replace(/_/g, " ") || ""}
              </div>
            </div>

            {/* Logout button */}
            {(!sidebarCollapsed || isMobile) && (
              <button
                onClick={handleLogout}
                title="Sign out"
                onMouseEnter={e => e.currentTarget.style.background = B.gray100}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                style={{ background: "none", border: "none", cursor: "pointer",
                  padding: 6, color: B.gray400, borderRadius: 6,
                  display: "flex", alignItems: "center", flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex:1, overflowY:"auto", background:B.white, minWidth:0 }}>

          {/* Email verification banner */}
          {user && !user.is_verified && (
            <div style={{
              background:"#fffbeb", borderBottom:"1px solid #fcd34d",
              padding:"9px 20px", display:"flex", alignItems:"center",
              justifyContent:"space-between", gap:12, flexWrap:"wrap",
              fontSize:13,
            }}>
              <span style={{ color:"#92400e" }}>
                <strong>Verify your email</strong> — check your inbox for a verification link to unlock all features.
              </span>
              <Link to="/profile" style={{
                color:"#92400e", fontWeight:700, fontSize:12,
                textDecoration:"none", border:"1px solid #f59e0b",
                padding:"3px 10px", borderRadius:5, whiteSpace:"nowrap",
              }}>Manage →</Link>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Explore />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/data-preview" element={<DataPreview />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>

      </div>
    </div>
  );
}