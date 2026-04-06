import { useState, useRef, useEffect } from "react";

// ─── DXC Brand Tokens ──────────────────────────────────────────────────────
const DXC = {
  orange:        "#FF6200",
  orangeHover:   "#E55A00",
  navy:          "#1A1A2E",
  navyMid:       "#16213E",
  white:         "#FFFFFF",
  offWhite:      "#F5F5F5",
  lightGray:     "#E8E8E8",
  textDark:      "#1A1A1A",
  textMid:       "#555555",
  textLight:     "#888888",
  delivery:      { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
  sourcing:      { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
  qualification: { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
};

// ─── Tag Chip ──────────────────────────────────────────────────────────────
function TagChip({ label }) {
  return (
    <span style={{
      background: DXC.offWhite, color: DXC.textMid,
      border: `1px solid ${DXC.lightGray}`,
      fontSize: 10, fontWeight: 600,
      padding: "3px 9px", borderRadius: 4,
      letterSpacing: 0.3, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ─── Solutions Data ────────────────────────────────────────────────────────
const SOLUTIONS = [
  // ── CONSULTING ────────────────────────────────────────────────────────────
  {
    id: 1, rank: "01", category: "Consulting",
    title: "AI Use Case Radar",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "14/04/2026", deliveryDate: "28/07/2026",
    summary: "Cross-industry intelligence tool that scans and prioritizes emerging AI trends and use cases to benchmark innovation and align strategic roadmap decisions.",
    popup: {
      headline: "AI Use Case Radar",
      deliverable: "MVP in 6–10 Weeks",
      stage: "Qualification",
      description: "A sector-agnostic intelligence tool that continuously scans and prioritizes emerging AI use cases and market trends. Enables organizations to benchmark innovation, identify opportunities, and align their AI strategy with real-world advancements — updated automatically.",
      features: ["Continuous AI trend scanning", "Use case prioritization engine", "Sector benchmarking", "Innovation opportunity mapping", "Strategy alignment reports"],
      imageFile: "ai-use-case-radar.png",
    },
  },
  {
    id: 2, rank: "02", category: "Consulting",
    title: "Assessment Advisor",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "14/04/2026", deliveryDate: "28/07/2026",
    summary: "Comprehensive evaluation of an organization's data & AI landscape covering sources, structure, usage and risks to build strategy and align with business objectives.",
    popup: {
      headline: "Assessment Advisor",
      deliverable: "Full deliverable in 1–3 Weeks",
      stage: "Qualification",
      description: "Provides a comprehensive evaluation of your organization's data and AI maturity. It evaluates infrastructure, governance, talent gaps, and technology alignment — delivering a clear, prioritized action plan and strategic roadmap.",
      features: ["Data landscape mapping", "AI readiness scoring", "Gap analysis & recommendations", "Executive roadmap", "Alignment to Data Standards"],
      imageFile: "Assessment-Advisor.png",
    },
  },
  {
    id: 3, rank: "03", category: "Consulting",
    title: "ROI Simulator",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "14/04/2026", deliveryDate: "28/07/2026",
    summary: "Measures and communicates business value of data and AI investments with customizable financial models, scenario comparison, and sensitivity analysis.",
    popup: {
      headline: "ROI Simulator",
      deliverable: "VB & KPIs in 2 weeks · Full deliverable in 1–2 months",
      stage: "Qualification",
      description: "Measures and communicates the business value of data and AI investments in financial and operational terms. Business value and KPIs are defined within 2 weeks, giving leadership the evidence they need to commit to AI transformation with confidence.",
      features: ["Financial impact modeling", "KPI definition & tracking", "Scenario comparison", "Sensitivity analysis", "Executive-ready business case"],
      imageFile: "roi-simulator.png",
    },
  },

  // ── DELIVERY ──────────────────────────────────────────────────────────────
  {
    id: 4, rank: "04", category: "Delivery",
    title: "Data Health",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "14/04/2026", deliveryDate: "28/07/2026",
    summary: "End-to-end data quality platform with automated rule-based validation, real-time monitoring & alerts, and root-cause diagnostics across all systems.",
    popup: {
      headline: "Data Health",
      deliverable: "Full deliverable in 6 Weeks",
      stage: "Delivery",
      description: "An end-to-end platform that ensures data quality across all your systems. From discovery to action, Data Health gives you full control with built-in compliance, automation and intelligence — so your teams always work from trusted data.",
      features: ["Automated data validation", "Quality monitoring dashboards", "Compliance reporting", "Anomaly detection & alerting", "Root-cause diagnostics"],
      imageFile: "data-health.png",
    },
  },
  {
    id: 5, rank: "05", category: "Delivery",
    title: "Intelligent Analytics",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "14/04/2026", deliveryDate: "28/07/2026",
    summary: "Transforms raw data into actionable insights using ML, NLP and advanced statistical models, enabling proactive decision-making and uncovering hidden patterns in real time.",
    popup: {
      headline: "Intelligent Analytics",
      deliverable: "Full deliverable in 1–2 Weeks",
      stage: "Delivery",
      description: "Transforms raw data into actionable insights using ML, NLP and advanced statistical models. Enables proactive decision-making by uncovering hidden patterns in real time and explaining results contextually.",
      features: ["ML-powered insight generation", "NLP text analytics", "Real-time pattern detection", "Contextual result explanations", "Executive-ready dashboards"],
      imageFile: "Intelligent-Analytics.png",
    },
  },
  {
    id: 6, rank: "06", category: "Delivery",
    title: "AI Assistant",
    tags: ["Interface", "Agentic", "Pilot"],
    mvpDate: "14/04/2026", deliveryDate: "28/07/2026",
    summary: "Conversational AI assistant that interacts naturally with users, understands intent, and executes predefined tasks across HR platforms and communication channels.",
    popup: {
      headline: "AI Assistant",
      deliverable: "POC Live March 2026 · MVP April 2026",
      stage: "Delivery",
      description: "L'assistant IA fournit des réponses instantanées et fiables aux questions métier courantes, libérant les équipes opérationnelles pour des tâches à plus forte valeur ajoutée. Conçu pour être déployable à l'échelle mondiale et adaptable à tout domaine d'activité.",
      features: ["Semantic search & knowledge discovery", "Conversational AI interface", "Knowledge base management", "Role-based access control", "Multi-format upload (Word, Excel, PPT)"],
      imageFile: "AI-Assistant.png",
      roadmap: {
        v1: ["Semantic search", "Conversational UI", "Knowledge base", "Access control"],
        v2: ["RGPD / AI Act compliance", "Pilot deployment", "Multi-format upload"],
        v3: ["API integrations", "Domain personalization", "Extended use cases"],
        v4: ["Global scale", "Multi-tenant onboarding", "Voice interaction"],
      },
    },
  },
  {
    id: 7, rank: "07", category: "Delivery",
    title: "AO Handler",
    tags: ["Interface", "Agentic", "Prototype"],
    mvpDate: "14/04/2026", deliveryDate: "28/07/2026",
    summary: "Discovers public and private tenders, evaluates eligibility, and auto-generates compliant proposal drafts accelerating bid cycles and increasing win rates.",
    popup: {
      headline: "AO Handler",
      deliverable: "Full deliverable in 6–10 Weeks",
      stage: "Sourcing",
      description: "Cross-industry intelligence tool that discovers tenders, evaluates eligibility, and auto-generates winning proposals. Streamlines the entire bid management lifecycle with AI — from discovery to submission.",
      features: ["Tender discovery engine", "Eligibility auto-scoring", "AI proposal generation", "Bid management dashboard", "Win-rate analytics"],
      imageFile: "ao-handler.png",
    },
  },
  {
    id: 8, rank: "08", category: "Delivery",
    title: "Incidents Management",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "14/04/2026", deliveryDate: "28/07/2026",
    summary: "AI-powered incident detection and resolution platform that streamlines response workflows and reduces mean time to resolution across IT operations.",
    popup: {
      headline: "Incidents Management",
      deliverable: "Full deliverable in 8–12 Weeks",
      stage: "Delivery",
      description: "An intelligent platform that detects anomalies, classifies incidents, routes them automatically, and performs root-cause analysis — dramatically reducing MTTR and manual triage effort.",
      features: ["Real-time anomaly detection", "Automated root-cause analysis", "Incident routing & escalation", "Post-mortem reporting", "SLA compliance monitoring"],
      imageFile: "incidents-management.png",
    },
  },
  {
    id: 9, rank: "09", category: "Delivery",
    title: "Marketing Agents",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "14/04/2026", deliveryDate: "28/07/2026",
    summary: "Intelligent AI agents that automate and optimize marketing workflows from campaign planning to content generation and performance tracking.",
    popup: {
      headline: "Marketing Agents",
      deliverable: "Full deliverable in 6–10 Weeks",
      stage: "Sourcing",
      description: "A suite of autonomous AI agents that handle segmentation, campaign personalization, content generation, and performance optimization — freeing marketing teams to focus on strategy.",
      features: ["Audience segmentation AI", "Personalized content generation", "Campaign automation", "Performance analytics", "Multi-channel orchestration"],
      imageFile: "incidents-management.png",
    },
  },
  {
    id: 10, rank: "10", category: "Delivery",
    title: "Smart Collect Hub",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "14/04/2026", deliveryDate: "14/04/2026",
    summary: "AI-powered collection platform eliminating manual follow-ups, accelerating cash flow, and giving finance teams full visibility from invoice to payment.",
    popup: {
      headline: "Smart Collect Hub",
      deliverable: "POC Live March 2026 · MVP April 2026",
      stage: "Sourcing",
      description: "AI-powered collection platform that eliminates manual follow-ups, accelerates cash flow, and gives finance teams full visibility from invoice to payment.",
      features: ["Invoice creation & PDF generation", "AI reminder engine (GPT-4o-mini)", "Live dashboard & 2-way email inbox", "Payment ledger & multi-currency analytics", "Auto-escalation rules", "Multi-user roles"],
      imageFile: "Smart-Collect-Hub.png",
      roadmap: {
        v1: ["Invoice creation", "AI reminder engine", "Live dashboard"],
        v2: ["Auto email sync", "Multi-user roles", "Auto-escalation"],
        v3: ["DSO & BI reporting", "Self-service portal"],
        v4: ["AI dispute resolution", "Predictive payment scoring"],
      },
    },
  },

  // ── INNOVATION ────────────────────────────────────────────────────────────
  {
    id: 11, rank: "11", category: "Innovation",
    title: "AI Watch",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "20/04/2026", deliveryDate: "14/04/2026",
    summary: "Strategic intelligence platform that analyzes tech trends, startups, and innovations to generate insights for proactive innovation and investment decisions.",
    popup: {
      headline: "AI Watch — Veille Technologique",
      deliverable: "V2 MVP Live · V3 in planning",
      stage: "Delivery",
      description: "Agent stratégique analysant en continu les tendances technologiques, startups, brevets, levées de fonds et innovations sectorielles. Il synthétise l'information critique et génère des rapports à forte valeur décisionnelle.",
      features: ["Real-time monitoring (NewsAPI + RSS)", "AI summarization (GPT-4o-mini)", "Weak & strong signal detection", "Trending topics clustering", "PDF report generation", "Interactive React dashboard"],
      imageFile: "AI-Watch.png",
      roadmap: {
        v1: ["Auto news collection", "AI summarization", "Signal detection"],
        v2: ["Reports system", "Trends clustering", "Dashboard BI"],
        v3: ["Competitive radar", "Trend predictions", "COMEX-ready"],
      },
    },
  },
  {
    id: 12, rank: "12", category: "Innovation",
    title: "StartUp Connect AI",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "20/04/2026", deliveryDate: "14/04/2026",
    summary: "AI-powered engine that discovers startups and matches them to business needs, generating a relevant and explainable shortlist for strategic partnership decisions.",
    popup: {
      headline: "StartUp Connect AI",
      deliverable: "Full deliverable in 4–6 Weeks",
      stage: "Sourcing",
      description: "Continuously scans the global startup ecosystem and matches emerging companies to your specific innovation needs using AI fit scoring and strategic alignment analysis.",
      features: ["Startup discovery engine", "AI fit scoring", "Strategic alignment mapping", "Partnership recommendations", "Explainable shortlisting"],
      imageFile: "startup-connect-ai.png",
    },
  },
  {
    id: 13, rank: "13", category: "Innovation",
    title: "POC Workflow Tool",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "20/04/2026", deliveryDate: "14/04/2026",
    summary: "AI platform that structures and manages the innovation cycle from business needs to accelerate POC decision-making and streamline the proof-of-concept lifecycle.",
    popup: {
      headline: "POC Workflow Tool",
      deliverable: "Full deliverable in 3–5 Weeks",
      stage: "Qualification",
      description: "Structures and manages the full innovation lifecycle — from initial idea capture through feasibility analysis, resource planning, and go/no-go POC decisions — powered by AI.",
      features: ["Idea capture & scoring", "Feasibility analysis", "Resource planning", "Go/no-go decision engine", "Innovation lifecycle tracking"],
      imageFile: "Poc-Workflow-Tool.png",
    },
  },
  {
    id: 14, rank: "14", category: "Innovation",
    title: "Sandbox AI",
    tags: ["Interface", "Agentic", "MVP"],
    mvpDate: "14/04/2026", deliveryDate: "14/04/2026",
    summary: "Secure experimentation environment for testing and validating AI models and use cases in isolation before production deployment across enterprise systems.",
    popup: {
      headline: "Sandbox AI",
      deliverable: "Full deliverable in 2–4 Weeks",
      stage: "Qualification",
      description: "A secure, isolated environment where teams can safely test, experiment with, and validate AI models before production deployment. Full audit logging and access controls included.",
      features: ["Isolated testing environment", "Risk analysis engine", "Full audit trails", "Role-based access", "Model validation pipelines"],
      imageFile: "Poc-Workflow-Tool.png",
    },
  },
];

// ─── Image with Lightbox ───────────────────────────────────────────────────
function SolutionImage({ imageFile }) {
  const [imgError, setImgError] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  useEffect(() => { setImgError(false); }, [imageFile]);

  useEffect(() => {
    if (!lightbox) return;
    const fn = (e) => { if (e.key === "Escape") setLightbox(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [lightbox]);

  if (!imageFile || imgError) {
    return (
      <div style={{ height: 260, background: "#F8F8F8", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: "#888", fontSize: 13 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
        <div>Image not found:</div>
        <code style={{ background: "#E8E8E8", padding: "2px 6px",
          borderRadius: 4, fontSize: 11, marginTop: 4 }}>
          /solutions/{imageFile || "image.png"}
        </code>
      </div>
    );
  }

  return (
    <>
      {lightbox && (
        <div onClick={() => setLightbox(false)}
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.92)", zIndex: 2000,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out" }}>
          <img src={`/solutions/${imageFile}`} alt={imageFile}
            style={{ maxWidth: "90vw", maxHeight: "85vh",
              objectFit: "contain", borderRadius: 8,
              boxShadow: "0 8px 48px rgba(0,0,0,0.6)" }} />
          <div style={{ position: "absolute", bottom: 24, left: "50%",
            transform: "translateX(-50%)", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            Click anywhere to close · ESC
          </div>
        </div>
      )}
      <div style={{ position: "relative", cursor: "zoom-in" }} onClick={() => setLightbox(true)}>
        <img src={`/solutions/${imageFile}`} alt={imageFile}
          onError={() => setImgError(true)}
          style={{ width: "100%", height: 260, objectFit: "contain",
            background: "#F8F8F8", display: "block" }} />
        <div style={{ position: "absolute", bottom: 8, right: 10,
          background: "rgba(0,0,0,0.45)", color: "#fff", borderRadius: 6,
          padding: "3px 8px", fontSize: 11, pointerEvents: "none" }}>
          🔍 Click to enlarge
        </div>
      </div>
    </>
  );
}

// ─── Learn More Modal ──────────────────────────────────────────────────────
function LearnMoreModal({ solution, allSolutions, onClose, onNavigate }) {
  const touchStartX = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate(1);
      if (e.key === "ArrowLeft") onNavigate(-1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, onNavigate]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) onNavigate(diff > 0 ? 1 : -1);
    touchStartX.current = null;
  };

  if (!solution) return null;
  const { popup, category } = solution;
  const currentIdx = allSolutions.findIndex(s => s.id === solution.id);
  const stageMap = { Delivery: DXC.delivery, Sourcing: DXC.sourcing, Qualification: DXC.qualification };
  const stage = stageMap[popup.stage] || DXC.delivery;

  return (
    <>
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
      <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem", animation: "fadeIn 0.18s ease" }}>

        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
          style={{ background: DXC.white, borderRadius: 20, width: "100%",
            maxWidth: 700, maxHeight: "90vh", overflowY: "auto",
            boxShadow: "0 32px 80px rgba(0,0,0,0.25)", animation: "slideUp 0.22s ease" }}>

          <div style={{ height: 5, background: DXC.orange, borderRadius: "20px 20px 0 0" }} />

          {/* Modal Header */}
          <div style={{ background: `linear-gradient(135deg, ${DXC.navy} 0%, ${DXC.navyMid} 100%)`,
            padding: "1.75rem 2rem", position: "relative" }}>
            <button onClick={onClose}
              style={{ position: "absolute", top: 16, right: 16,
                background: "rgba(255,255,255,0.15)", border: "none",
                color: DXC.white, width: 36, height: 36, borderRadius: "50%",
                cursor: "pointer", fontSize: 18, display: "flex",
                alignItems: "center", justifyContent: "center" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            >×</button>

            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ background: DXC.orange, color: DXC.white,
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                {category}
              </span>
              <span style={{ background: stage.bg, color: stage.text,
                border: `1px solid ${stage.border}`,
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                IPM: {popup.stage}
              </span>
              <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                {currentIdx + 1} / {allSolutions.length}
              </span>
            </div>
            <h2 style={{ color: DXC.white, margin: 0, fontSize: "1.5rem",
              fontWeight: 700, lineHeight: 1.2 }}>{popup.headline}</h2>
          </div>

          {/* Modal Body */}
          <div style={{ padding: "2rem" }}>

            {/* Deliverable */}
            <div style={{ background: DXC.offWhite, borderRadius: 8,
              padding: "10px 16px", marginBottom: 24, fontSize: 13,
              color: DXC.textMid, borderLeft: `3px solid ${DXC.orange}` }}>
              ⏱ {popup.deliverable}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#AAA",
                textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12,
                borderLeft: "3px solid #FF6200", paddingLeft: 10 }}>
                DESCRIPTION
              </div>
              <p style={{ color: "#444", lineHeight: 1.75, margin: 0, fontSize: 15 }}>
                {popup.description}
              </p>
            </div>

            {/* Key Features */}
            <div style={{ borderTop: "1px solid #F5F5F5", paddingTop: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#AAA",
                textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12,
                borderLeft: "3px solid #FF6200", paddingLeft: 10 }}>
                KEY FEATURES
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {popup.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start",
                    gap: 8, background: DXC.offWhite, borderRadius: 8,
                    padding: "8px 12px", fontSize: "0.84rem", color: DXC.textMid }}>
                    <span style={{ color: DXC.orange, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            {popup.roadmap && (
              <div style={{ borderTop: "1px solid #F5F5F5", paddingTop: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#AAA",
                  textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12,
                  borderLeft: "3px solid #FF6200", paddingLeft: 10 }}>
                  ROADMAP
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {Object.entries(popup.roadmap).map(([version, items]) => (
                    <div key={version} style={{ flex: "1 1 140px", background: DXC.offWhite,
                      borderRadius: 10, padding: 12, border: `1px solid ${DXC.lightGray}` }}>
                      <div style={{ background: DXC.navy, color: DXC.white, fontWeight: 700,
                        fontSize: 11, padding: "3px 10px", borderRadius: 6,
                        marginBottom: 8, textAlign: "center", textTransform: "uppercase" }}>
                        {version.toUpperCase()}
                      </div>
                      {items.map((item) => (
                        <div key={item} style={{ fontSize: 12, color: DXC.textMid, marginBottom: 4 }}>
                          • {item}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Planning image */}
            <div style={{ borderTop: "1px solid #F5F5F5", paddingTop: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#AAA",
                textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 12,
                borderLeft: "3px solid #FF6200", paddingLeft: 10 }}>
                PLANNING
              </div>
              <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${DXC.lightGray}` }}>
                <SolutionImage imageFile={popup.imageFile} />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button style={{ background: DXC.orange, color: DXC.white, border: "none",
                borderRadius: 10, padding: "12px 24px", fontWeight: 700,
                fontSize: "0.9rem", cursor: "pointer", flex: 1, minWidth: 160 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = DXC.orangeHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = DXC.orange)}
              >📅 Book Discovery Call</button>
              <button onClick={onClose}
                style={{ background: DXC.offWhite, color: DXC.textMid,
                  border: `1px solid ${DXC.lightGray}`, borderRadius: 10,
                  padding: "12px 24px", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = DXC.lightGray)}
                onMouseLeave={(e) => (e.currentTarget.style.background = DXC.offWhite)}
              >Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Solution Card ─────────────────────────────────────────────────────────
function SolutionCard({ solution, onLearnMore }) {
  const { rank, title, tags, summary, category } = solution;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: DXC.white, borderRadius: 12,
        border: `1px solid ${DXC.lightGray}`,
        borderLeft: `4px solid ${hovered ? DXC.orange : "transparent"}`,
        display: "flex", flexDirection: "column", overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s, border-left-color 0.15s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? "0 8px 28px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ padding: "1.1rem 1.1rem 0.75rem", flex: 1,
        display: "flex", flexDirection: "column", gap: 10 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: DXC.orange,
            background: "#FFF3EB", padding: "2px 8px", borderRadius: 4 }}>
            #{rank}
          </span>
          <span style={{ fontSize: 10, fontWeight: 600, color: DXC.textLight,
            background: DXC.offWhite, padding: "2px 8px", borderRadius: 4,
            border: `1px solid ${DXC.lightGray}` }}>
            {category}
          </span>
        </div>

        <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700,
          color: DXC.textDark, lineHeight: 1.3 }}>{title}</h3>

        <p style={{ margin: 0, fontSize: "0.81rem", color: DXC.textMid,
          lineHeight: 1.55, flexGrow: 1 }}>{summary}</p>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {tags.map((t) => <TagChip key={t} label={t} />)}
        </div>
      </div>

      <button
        onClick={() => onLearnMore(solution)}
        style={{ width: "100%", background: "transparent", border: "none",
          borderTop: `1px solid ${DXC.lightGray}`, padding: "9px 12px",
          fontSize: "0.82rem", fontWeight: 600, color: DXC.textMid,
          cursor: "pointer", transition: "all 0.18s", textAlign: "center" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = DXC.orange;
          e.currentTarget.style.color = DXC.white;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = DXC.textMid;
        }}
      >
        Learn More →
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function Solutions() {
  const [filter, setFilter] = useState("All");
  const [activeSolution, setActiveSolution] = useState(null);

  const filters = ["All", "Consulting", "Delivery", "Innovation"];
  const counts = { All: SOLUTIONS.length };
  SOLUTIONS.forEach((s) => { counts[s.category] = (counts[s.category] || 0) + 1; });
  const filtered = filter === "All" ? SOLUTIONS : SOLUTIONS.filter((s) => s.category === filter);

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: DXC.offWhite, minHeight: "100vh" }}>

      {/* Header Banner */}
      <div style={{ background: `linear-gradient(160deg, ${DXC.navy} 0%, ${DXC.navyMid} 100%)`,
        padding: "40px 2rem", textAlign: "center" }}>
        <div style={{ marginBottom: 14 }}>
          <img src="/solutions/DXC.png" alt="DXC Technology"
            style={{ width: 120, objectFit: "contain" }} />
        </div>
        <h1 style={{ color: DXC.white, margin: "0 0 10px",
          fontSize: "1.8rem", fontWeight: 800, letterSpacing: -0.5 }}>
          AI ACCELERATOR PRODUCTS
        </h1>
        <p style={{ color: "rgba(255,255,255,0.65)", margin: 0,
          fontSize: "0.92rem", maxWidth: 520, marginInline: "auto", lineHeight: 1.6 }}>
          AI powered products turning technology into business value driven delivery for clients.
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: "2rem", maxWidth: 1280, margin: "0 auto" }}>

        {/* Count + Filter Tabs */}
        <div style={{ display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
          <p style={{ margin: 0, color: DXC.textMid, fontSize: "0.9rem" }}>
            Showing <strong style={{ color: DXC.textDark }}>{filtered.length}</strong> of {SOLUTIONS.length} solutions
            {filter !== "All" && <> · <span style={{ color: DXC.orange, fontWeight: 700 }}>{filter}</span></>}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
          {filters.map((f) => {
            const active = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  background: active ? DXC.navy : DXC.white,
                  color: active ? DXC.white : DXC.textMid,
                  border: active ? `2px solid ${DXC.navy}` : `2px solid ${DXC.lightGray}`,
                  borderRadius: 24, padding: "6px 18px", fontWeight: 700,
                  fontSize: "0.82rem", cursor: "pointer", transition: "all 0.18s",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                {f}
                <span style={{ background: active ? "rgba(255,255,255,0.2)" : DXC.offWhite,
                  borderRadius: 12, padding: "1px 7px", fontSize: "0.75rem" }}>
                  {counts[f] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1.25rem", marginBottom: "3rem" }}>
          {filtered.map((s) => (
            <SolutionCard key={s.id} solution={s} onLearnMore={setActiveSolution} />
          ))}
        </div>

        {/* CTA Banner */}
        <div style={{ background: DXC.navy, borderRadius: 20, padding: "2rem 2.5rem",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "1.5rem", marginBottom: "2rem" }}>
          <div>
            <p style={{ color: DXC.white, fontWeight: 800, margin: "0 0 6px", fontSize: "1.1rem" }}>
              Ready to act?
            </p>
            <p style={{ color: "rgba(255,255,255,0.7)", margin: 0,
              fontSize: "0.88rem", maxWidth: 460, lineHeight: 1.6 }}>
              Our DXC Data &amp; AI team offers a tailored 30-minute discovery session
              to align the right solutions with your priorities.
            </p>
          </div>
          <button style={{ background: DXC.orange, color: DXC.white, border: "none",
            borderRadius: 10, padding: "12px 24px", fontWeight: 700,
            fontSize: "0.9rem", cursor: "pointer", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = DXC.orangeHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = DXC.orange)}
          >📅 Book Discovery Call</button>
        </div>

        <div style={{ textAlign: "center", color: DXC.textLight, fontSize: 12, paddingBottom: "1rem" }}>
          © 2026 DXC Technology Company. All rights reserved.
        </div>
      </div>

      {activeSolution && (
        <LearnMoreModal
          solution={activeSolution}
          allSolutions={filtered}
          onClose={() => setActiveSolution(null)}
          onNavigate={(dir) => {
            const idx = filtered.findIndex(s => s.id === activeSolution.id);
            const next = filtered[idx + dir];
            if (next) setActiveSolution(next);
          }}
        />
      )}
    </div>
  );
}
