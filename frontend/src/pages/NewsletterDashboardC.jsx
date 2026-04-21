/**
 * SCÉNARIO C — "L'Observatoire"
 * Fully responsive: Mobile < 768 | Tablet 768–1024 | Desktop > 1024
 * DXC design system (CSS variables — light & dark compatible)
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Users, Leaf, Award, Globe, Shield,
  ArrowRight, Star, CheckCircle, ChevronRight,
  Sparkles, Calendar, FileText, Trophy
} from "lucide-react";
import { useBreakpoint } from "./useBreakpoint";
import ChronologieTimelineRich from "../components/ChronologieTimelineRich";

// ── Image map ─────────────────────────────────────────────────────────────────
const IMG = {
  hero:      "/newsletter-images/page187_inside_gitex_africa_2025_dxc.jpg",
  brandon:   "/newsletter-images/page144_brandon_hall_group_excellence_gold.jpg",
  iwd:       "/newsletter-images/page022_in_the_spotlight_our_svp_lamiaa.jpg",
  cgem:      "/newsletter-images/page086_dxc_cdg_earns_cgem_csr_label_.jpg",
  vow:       "/newsletter-images/page023_fy26_vow_preparations_are_underway_.jpg",
  marathon:  "/newsletter-images/page184_colleagues_from_across_dxc_cdg_took_on_the.jpg",
  seminar:   "/newsletter-images/page002_quality_at_the_heart_of_the_adm_seminar.jpg",
  town_hall: "/newsletter-images/page097_a_look_back_at_our_recent_town_hall_with_leadership.jpg",
  umnia:     "/newsletter-images/page004_a_strategic_partnership_with_umnia_bank.jpg",
  partners:  "/newsletter-images/page117_fy25_s1_review_strengthened_partnership_and_shared_trust.jpg",
  contracts: "/newsletter-images/page010_new_contracts_strengthening_our.jpg",
  cares:     "/newsletter-images/page015_dxc_cares_turning_commitment_into.jpg",
  forum_ben: "/newsletter-images/page110_ben_m_sik_forum___casablanca.jpg",
  gen_ai:    "/newsletter-images/page116_gen_ai_summit_2024_-_insights_on_ai___digital_transformation.jpg",
};

const HIGHLIGHTS = [
  {
    id: "gitex-africa-2025", img: IMG.hero, caption: "GITEX Africa 2025", sub: "Marrakech — 3e participation",
    title: "GITEX Africa 2025 — DXC.CDG à Marrakech", source: "ONETEAM Newsletter", published_at: "2025-04-01",
    category: "Events & Upcoming", month: "April 2025",
    content: "DXC Technology Morocco a participé pour la 3e année consécutive au GITEX Africa 2025 à Marrakech. Cet événement majeur de la tech africaine a réuni plus de 1500 exposants et 45 000 visiteurs. Notre équipe a présenté les dernières innovations en matière de transformation digitale, cloud computing et intelligence artificielle. Une opportunité exceptionnelle de renforcer notre présence sur le continent africain et de nouer de nouveaux partenariats stratégiques."
  },
  {
    id: "brandon-hall-awards", img: IMG.brandon, caption: "Brandon Hall Awards", sub: "4 trophées d'excellence RH",
    title: "Brandon Hall Awards — 4 trophées d'excellence RH", source: "ONETEAM Newsletter", published_at: "2025-09-01",
    category: "Awards & Recognition", month: "September 2025",
    content: "DXC Technology Morocco a remporté 4 trophées prestigieux aux Brandon Hall Group Excellence Awards 2025 : 3 Gold et 1 Silver. Ces distinctions récompensent l'excellence de nos programmes RH en matière de développement des talents, formation managériale et engagement collaborateur. Une reconnaissance internationale qui témoigne de notre engagement envers nos 1 465 collaborateurs."
  },
  {
    id: "label-rse-cgem", img: IMG.cgem, caption: "Label RSE CGEM", sub: "Engagement RSE validé",
    title: "Label RSE CGEM — Engagement RSE validé", source: "ONETEAM Newsletter", published_at: "2025-11-01",
    category: "CSR & Community", month: "November 2025",
    content: "DXC Technology Morocco a obtenu le prestigieux Label RSE de la CGEM (Confédération Générale des Entreprises du Maroc). Cette certification reconnaît notre engagement en matière de responsabilité sociale et environnementale. Elle valide nos actions concrètes : politique environnementale, bien-être au travail, éthique des affaires et contribution au développement local."
  },
  {
    id: "journee-femmes", img: IMG.iwd, caption: "Journée Femmes", sub: "International Women's Day",
    title: "Journée Internationale des Femmes — DXC.CDG", source: "ONETEAM Newsletter", published_at: "2025-03-08",
    category: "DEI & Inclusion", month: "March 2025",
    content: "À l'occasion de la Journée Internationale des Femmes, DXC Technology Morocco a organisé une série d'événements célébrant la diversité et l'inclusion. Tables rondes, témoignages inspirants et ateliers ont mis en lumière le leadership féminin au sein de notre organisation. Notre SVP Lamiaa a partagé son parcours et sa vision pour un environnement de travail plus inclusif."
  },
  {
    id: "marathon-casablanca", img: IMG.marathon, caption: "Marathon de Casablanca", sub: "Esprit d'équipe & sport",
    title: "Marathon de Casablanca — Esprit d'équipe & sport", source: "ONETEAM Newsletter", published_at: "2025-10-01",
    category: "Wellbeing & Health", month: "October 2025",
    content: "L'équipe DXC.CDG a brillé au Marathon de Casablanca 2025 ! Plus de 50 collaborateurs ont participé à cet événement sportif majeur, renforçant les liens d'équipe et promouvant le bien-être au travail. Une belle démonstration de l'esprit ONETEAM qui anime notre organisation au quotidien."
  },
  {
    id: "gen-ai-summit-2024", img: IMG.gen_ai, caption: "Gen AI Summit 2024", sub: "Innovation & Transformation",
    title: "Gen AI Summit 2024 — Insights IA & Transformation", source: "ONETEAM Newsletter", published_at: "2024-11-01",
    category: "Innovation & Tech", month: "November 2024",
    content: "DXC Technology Morocco a participé au Gen AI Summit 2024, l'événement de référence sur l'intelligence artificielle générative au Maroc. Nos experts ont présenté les cas d'usage concrets de l'IA dans la transformation digitale des entreprises. Sessions interactives, démonstrations live et networking ont permis de partager notre expertise avec plus de 500 participants."
  },
];

const PILLARS = [
  {
    id: "business", label: "Business", icon: TrendingUp,
    color: "var(--accent-orange)", colorHex: "#E84E0F",
    quote: "La confiance des clients est notre actif le plus précieux.",
    bigStat: "+37M MAD", bigStatSub: "vs objectif FY26",
    kpis: [
      { label: "Contrats offshore",  value: "12+",         icon: Globe },
      { label: "Visites clients Q1", value: "5",           icon: Star },
      { label: "GITEX Africa",       value: "3e édition",  icon: Award },
      { label: "Partners Forum",     value: "80+ leaders", icon: CheckCircle },
    ],
    blocks: [
      { title: "Expansion Offshore",        img: IMG.contracts,
        items: ["12+ nouveaux contrats signés", "5 visites clients offshore Q1 FY26", "Rayonnement international confirmé"] },
      { title: "Événements Clés",           img: IMG.hero,
        items: ["GITEX Africa Marrakech — 3e fois consécutive", "1er EMEA Partners Forum à Rabat", "80+ leaders européens présents"] },
      { title: "Partenariats Stratégiques", img: IMG.umnia,
        items: ["Umnia Bank — nouveau partenariat", "Carrefour Italie — renouvellement", "TotalEnergy — renforcé"] },
    ],
  },
  {
    id: "people", label: "Collaborateurs", icon: Users,
    color: "var(--purple)", colorHex: "#7C3AED",
    quote: "1 465 talents qui font de DXC.CDG une organisation d'exception.",
    bigStat: "92%", bigStatSub: "VOW Score — record absolu",
    kpis: [
      { label: "Collaborateurs", value: "1 465",      icon: Users },
      { label: "Brandon Hall",   value: "4 trophées", icon: Award },
      { label: "Gold Awards",    value: "3 Gold",     icon: Star },
      { label: "VOW Score",      value: "92%",        icon: CheckCircle },
    ],
    blocks: [
      { title: "Reconnaissance RH",      img: IMG.brandon,
        items: ["4 trophées Brandon Hall 2025", "3 Gold + 1 Silver", "Reconnaissance internationale"] },
      { title: "Excellence Managériale", img: IMG.town_hall,
        items: ["Charte Managériale FY26 déployée", "Town Hall Leadership FY25", "Formation managériale renforcée"] },
      { title: "Bien-être & Inclusion",  img: IMG.iwd,
        items: ["Programme Recharge Ramadan", "Assurance maladie simplifiée", "DEI & Inclusion renforcé"] },
    ],
  },
  {
    id: "esg", label: "ESG", icon: Leaf,
    color: "var(--green)", colorHex: "#15803D",
    quote: "Notre engagement RSE dépasse les frontières de l'entreprise.",
    bigStat: "21 L", bigStatSub: "de sang donné — 130 vies",
    kpis: [
      { label: "ISO 9001",       value: "Renouvelé",   icon: Shield },
      { label: "Label RSE CGEM", value: "Obtenu",      icon: CheckCircle },
      { label: "Don de sang",    value: "130 vies",    icon: Star },
      { label: "Chess Club",     value: "12e mondial", icon: Award },
    ],
    blocks: [
      { title: "Certifications", img: IMG.cgem,
        items: ["ISO 9001 renouvelé — zéro non-conformité", "Label RSE CGEM obtenu", "Engagement qualité confirmé"] },
      { title: "Communauté",     img: IMG.cares,
        items: ["Don de sang : 21 litres collectés", "Forum Ben M'sik — impact local", "130 vies potentiellement sauvées"] },
      { title: "Sport & Clubs",  img: IMG.marathon,
        items: ["Chess Club — 12e rang mondial", "Gaming Club — Champion E-League", "Marathon de Casablanca"] },
    ],
  },
];

// Hero stat card config
const HERO_STATS = [
  { val: "+37M MAD", lbl: "Croissance",     color: "#15803D", Icon: TrendingUp },
  { val: "92%",      lbl: "VOW Score",      color: "#7C3AED", Icon: Award },
  { val: "1 465",    lbl: "Collaborateurs", color: "#059669", Icon: Users },
  { val: "4",        lbl: "Brandon Hall",   color: "#D97706", Icon: Trophy },
];

export default function NewsletterDashboardC() {
  const navigate  = useNavigate();
  const bp        = useBreakpoint();
  const [activeTab, setActiveTab] = useState("business");
  const tabsRef = useRef(null);
  const [tabsSticky, setTabsSticky] = useState(false);

  const isMobile = bp.mobile;
  const isTablet = bp.tablet;

  // Sticky tabs
  useEffect(() => {
    const onScroll = () => {
      if (!tabsRef.current) return;
      setTabsSticky(window.scrollY > parseInt(tabsRef.current.dataset.top || "0") - 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (tabsRef.current) tabsRef.current.dataset.top = tabsRef.current.offsetTop;
  }, []);

  // ── Responsive values ───────────────────────────────────────────────────────
  const pad       = isMobile ? "16px" : isTablet ? "24px" : "48px 56px";
  const padSm     = isMobile ? "16px" : isTablet ? "20px 24px" : "36px 56px";
  const divider   = isMobile ? "0 16px" : isTablet ? "0 24px" : "0 56px";
  const h2Size    = isMobile ? 18 : isTablet ? 20 : 24;
  const bigStat   = isMobile ? 28 : isTablet ? 36 : 48;
  const kpiVal    = isMobile ? 14 : isTablet ? 16 : 18;
  const gridHL    = isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)";
  const gridKPI   = isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "repeat(4,1fr)";
  const gridBlock = isMobile ? "1fr" : isTablet ? "1fr" : "repeat(3,1fr)";
  const tabPad    = isMobile ? "0 16px" : isTablet ? "0 24px" : "0 56px";
  const tabFSize  = isMobile ? 12 : 14;

  return (
    <div style={{
      background: "var(--bg-primary)",
      minHeight: "100vh",
      color: "var(--text-primary)",
      fontFamily: "var(--font-family,'Inter',sans-serif)",
      overflowX: "hidden",
      maxWidth: "100vw",
      boxSizing: "border-box",
    }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        .c-tab  { border:none;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap; }
        .c-tab:hover { opacity:.8; }
        .c-card { transition:box-shadow .2s,transform .2s; }
        .c-card:hover { box-shadow:0 8px 24px rgba(0,0,0,0.1);transform:translateY(-2px); }
        .c-cta  { transition:opacity .15s; }
        .c-cta:hover { opacity:.85; }
        .c-hl   { transition:transform .2s,box-shadow .2s; }
        .c-hl:hover { transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.1); }
        .c-tabs-scroll { overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none; }
        .c-tabs-scroll::-webkit-scrollbar { display:none; }
        .img-cover { width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.35s ease; }
        .img-overlay { position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.4) 0%,rgba(0,0,0,0.05) 60%,transparent 100%);pointer-events:none; }
        .c-card:hover .img-cover { transform:scale(1.03); }
        .c-hl:hover   .img-cover { transform:scale(1.03); }
        .c-hero-stat { transition:transform 0.2s ease, box-shadow 0.2s ease; }
        .c-hero-stat:hover { transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.08); }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{
        background: isMobile ? "var(--bg-card)" : "linear-gradient(135deg, var(--bg-card) 0%, #fff9f5 100%)",
        borderBottom: "1px solid var(--border)",
        padding: isMobile ? "20px 16px" : isTablet ? "32px 24px" : "48px 56px",
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 20 : 32,
        position: "relative",
        overflow: "hidden",
        maxWidth: "100%",
      }}>
        {/* Decorative orange orb - desktop only */}
        {!isMobile && (
          <div style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            background: "radial-gradient(circle, rgba(232,119,34,0.06), transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }} />
        )}

        {/* Desktop: Two-column layout */}
        {!isMobile && (
          <div style={{
            display: "flex",
            flexDirection: isTablet ? "column" : "row",
            gap: isTablet ? 24 : 48,
            alignItems: isTablet ? "stretch" : "center",
          }}>
            {/* Left — text + KPIs */}
            <div style={{ flex: isTablet ? "1" : "0 0 58%", minWidth: 0 }}>
              {/* Badge */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(232,119,34,0.08)", border: "1px solid rgba(232,119,34,0.15)",
                borderRadius: 6, padding: "5px 12px", marginBottom: 16,
                fontSize: 11, fontWeight: 700, color: "#E84E0F",
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                <Sparkles size={14} color="#E84E0F" />
                ONETEAM Newsletter · DXC Technology Morocco
              </div>

              <h1 style={{
                fontSize: isTablet ? "2.5rem" : "clamp(2.5rem, 5vw, 4.25rem)",
                fontWeight: 900, color: "var(--text-primary)",
                margin: "0 0 8px", lineHeight: 1.1, letterSpacing: "-0.02em",
              }}>
                L'Observatoire
              </h1>

              <div style={{
                fontSize: isTablet ? "1.25rem" : "clamp(1.25rem, 2vw, 1.75rem)",
                fontWeight: 600, color: "#E84E0F", marginBottom: 10,
              }}>
                DXC Technology Morocco
              </div>

              <div style={{
                display: "inline-flex", alignItems: "center",
                background: "#E84E0F", color: "#fff",
                borderRadius: 8, padding: "8px 20px", marginBottom: 20,
                fontSize: "1.125rem", fontWeight: 800,
              }}>
                FY26
              </div>

              {/* Info chips - colorized */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                {[
                  { icon: Calendar, text: "12 éditions", color: "#2563eb", bg: "rgba(59, 130, 246, 0.1)" },
                  { icon: FileText, text: "174 articles", color: "#9333ea", bg: "rgba(168, 85, 247, 0.1)" },
                  { icon: Users, text: "1 465 talents", color: "#059669", bg: "rgba(16, 185, 129, 0.1)" },
                ].map((chip, i) => (
                  <div key={i} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: chip.bg, border: `1px solid ${chip.color}33`,
                    borderRadius: 8, padding: "8px 14px",
                    fontSize: "0.875rem", color: chip.color, fontWeight: 500,
                  }}>
                    <chip.icon size={14} color={chip.color} />
                    {chip.text}
                  </div>
                ))}
              </div>

              <p style={{
                fontSize: 14, color: "var(--text-muted)", fontStyle: "italic",
                margin: "0 0 24px", maxWidth: 420,
              }}>
                Une année de transformation digitale et humaine.
              </p>

              {/* Stat cards - 4 column grid on desktop */}
              <div style={{
                display: "grid",
                gridTemplateColumns: isTablet ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
                gap: 12,
              }}>
                {HERO_STATS.map(s => (
                  <div key={s.lbl} className="c-hero-stat" style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: "1rem 1.25rem", cursor: "default",
                    minHeight: 120, display: "flex", flexDirection: "column",
                  }}>
                    <s.Icon size={18} color={s.color} style={{ marginBottom: 10 }} />
                    <div style={{
                      fontSize: "clamp(1.125rem, 1.8vw, 1.5rem)",
                      fontWeight: 800, color: s.color, lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}>
                      {s.val}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 6, fontWeight: 500 }}>
                      {s.lbl}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — hero photo */}
            <div style={{
              flex: isTablet ? "1" : "0 0 42%",
              maxWidth: isTablet ? "100%" : 480,
            }}>
              <div style={{
                aspectRatio: "4/3",
                maxHeight: isTablet ? 280 : 320,
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
              }}>
                <img src={IMG.hero} alt="GITEX Africa 2025" className="img-cover"
                  onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile: Single column stacked layout */}
        {isMobile && (
          <>
            {/* Badge - smaller on mobile, allow wrap */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap",
              background: "rgba(232,119,34,0.08)", border: "1px solid rgba(232,119,34,0.15)",
              borderRadius: 6, padding: "6px 10px",
              fontSize: "0.7rem", fontWeight: 700, color: "#E84E0F",
              letterSpacing: "0.04em", textTransform: "uppercase",
              lineHeight: 1.4,
            }}>
              <Sparkles size={12} color="#E84E0F" style={{ flexShrink: 0 }} />
              <span>ONETEAM Newsletter · DXC Morocco</span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: "clamp(2rem, 9vw, 3rem)",
              fontWeight: 900, color: "var(--text-primary)",
              margin: 0, lineHeight: 1.1, letterSpacing: "-0.02em",
              textAlign: "left", wordBreak: "keep-all",
            }}>
              L'Observatoire
            </h1>

            {/* Subtitle */}
            <div style={{
              fontSize: "1.25rem", fontWeight: 600, color: "#E84E0F",
              textAlign: "left",
            }}>
              DXC Technology Morocco
            </div>

            {/* FY26 Pill */}
            <div style={{
              display: "inline-flex", alignItems: "center", alignSelf: "flex-start",
              background: "#E84E0F", color: "#fff",
              borderRadius: 6, padding: "6px 14px",
              fontSize: "0.95rem", fontWeight: 800,
            }}>
              FY26
            </div>

            {/* Info chips - colorized */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { icon: Calendar, text: "12 éditions", color: "#2563eb", bg: "rgba(59, 130, 246, 0.1)" },
                { icon: FileText, text: "174 articles", color: "#9333ea", bg: "rgba(168, 85, 247, 0.1)" },
                { icon: Users, text: "1 465 talents", color: "#059669", bg: "rgba(16, 185, 129, 0.1)" },
              ].map((chip, i) => (
                <div key={i} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: chip.bg, border: `1px solid ${chip.color}33`,
                  borderRadius: 8, padding: "6px 12px",
                  fontSize: 12, color: chip.color, fontWeight: 500,
                }}>
                  <chip.icon size={12} color={chip.color} />
                  {chip.text}
                </div>
              ))}
            </div>

            {/* Tagline */}
            <p style={{
              fontSize: "0.9rem", color: "var(--text-muted)", fontStyle: "italic",
              margin: 0, textAlign: "left",
            }}>
              Une année de transformation digitale et humaine.
            </p>

            {/* Stat cards - 2x2 grid on mobile */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
              width: "100%",
            }}>
              {HERO_STATS.map(s => (
                <div key={s.lbl} style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 8, padding: "0.875rem 1rem",
                  minHeight: 90, display: "flex", flexDirection: "column",
                }}>
                  <s.Icon size={14} color={s.color} style={{ marginBottom: 6 }} />
                  <div style={{
                    fontSize: "clamp(0.95rem, 4vw, 1.125rem)",
                    fontWeight: 800, color: s.color, lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 4, fontWeight: 500 }}>
                    {s.lbl}
                  </div>
                </div>
              ))}
            </div>

            {/* Hero image - stacked at bottom on mobile */}
            <div style={{
              width: "100%",
              height: 200,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}>
              <img src={IMG.hero} alt="GITEX Africa 2025" style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
              }}
                onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
              />
            </div>
          </>
        )}
      </div>

      {/* ── TEMPS FORTS ──────────────────────────────────────────────────────── */}
      <div style={{ padding: pad, maxWidth: "100%" }}>
        <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: "0 0 4px", color: "var(--text-primary)" }}>
          Temps Forts de l'Année
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
          6 moments marquants FY25-FY26
        </p>
        <div style={{ display: "grid", gridTemplateColumns: gridHL, gap: isMobile ? 12 : 16 }}>
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="c-hl" onClick={() => navigate(`/dxc-newsletter/${h.id}`, { state: { article: h } })} style={{
              background: "var(--bg-card)", border: "1px solid #eee",
              borderRadius: 12, overflow: "hidden", cursor: "pointer",
            }}>
              <div style={{ height: isMobile ? 160 : 180, overflow: "hidden", background: "var(--bg-surface)", position: "relative" }}>
                <img src={h.img} alt={h.caption} className="img-cover"
                  onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
                />
                <div className="img-overlay" />
              </div>
              <div style={{ padding: isMobile ? "12px 14px" : "14px 16px 16px" }}>
                <div style={{ fontSize: isMobile ? 12 : 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{h.caption}</div>
                <div style={{ fontSize: isMobile ? 11 : 12, color: "var(--text-secondary)" }}>{h.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: divider }} />

      {/* ── PILLAR TABS ─────────────────────────────────────────────────────── */}
      <div ref={tabsRef} style={{
        position: tabsSticky ? "sticky" : "relative",
        top: tabsSticky ? 0 : "auto", zIndex: 40,
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        boxShadow: tabsSticky ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
        transition: "box-shadow .2s",
      }}>
        <div className="c-tabs-scroll" style={{ padding: tabPad, display: "flex", gap: 4 }}>
          {PILLARS.map(p => {
            const active = activeTab === p.id;
            const Ic = p.icon;
            return (
              <button key={p.id} className="c-tab" onClick={() => setActiveTab(p.id)} style={{
                padding: isMobile ? "10px 12px" : "14px 20px",
                fontSize: tabFSize, fontWeight: 600, background: "transparent",
                color: active ? p.color : "var(--text-secondary)",
                borderBottom: active ? `2px solid ${p.colorHex}` : "2px solid transparent",
                display: "flex", alignItems: "center", gap: 5, marginBottom: -1,
                flexShrink: 0,
              }}>
                <Ic size={isMobile ? 12 : 15} /> {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PILLAR CONTENT ────────────────────────────────────────────────────── */}
      {PILLARS.map(section => {
        if (activeTab !== section.id) return null;
        const Ic = section.icon;
        return (
          <div key={section.id} style={{ padding: pad, animation: "fadeUp .3s ease", maxWidth: "100%" }}>
            {/* Quote */}
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderLeft: `3px solid ${section.colorHex}`, borderRadius: 8,
              padding: isMobile ? "10px 12px" : "14px 18px",
              marginBottom: isMobile ? 16 : 24,
              fontSize: isMobile ? 12 : 14, color: "var(--text-secondary)",
              fontStyle: "italic", lineHeight: 1.6,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <Ic size={14} color={section.colorHex} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>"{section.quote}"</span>
            </div>

            {/* Big stat - stack on mobile */}
            <div style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "baseline",
              gap: isMobile ? 4 : 10,
              marginBottom: isMobile ? 16 : 22,
            }}>
              <span style={{
                fontSize: isMobile ? "clamp(2rem, 9vw, 2.5rem)" : bigStat,
                fontWeight: 900, color: section.color, lineHeight: 1,
              }}>
                {section.bigStat}
              </span>
              <span style={{ fontSize: isMobile ? 12 : 14, color: "var(--text-secondary)" }}>
                {section.bigStatSub}
              </span>
            </div>

            {/* KPI cards - 2x2 on mobile */}
            <div style={{ display: "grid", gridTemplateColumns: gridKPI, gap: isMobile ? 8 : 14, marginBottom: isMobile ? 16 : 24 }}>
              {section.kpis.map(k => {
                const KIcon = k.icon;
                return (
                  <div key={k.label} className="c-card" style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: isMobile ? "10px" : "16px",
                  }}>
                    <KIcon size={isMobile ? 12 : 15} color={section.colorHex} style={{ marginBottom: 6 }} />
                    <div style={{ fontSize: kpiVal, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{k.value}</div>
                    <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.3 }}>{k.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Detail blocks - stack on mobile, 120px image */}
            <div style={{ display: "grid", gridTemplateColumns: gridBlock, gap: isMobile ? 12 : 16 }}>
              {section.blocks.map(block => (
                <div key={block.title} className="c-card" style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 12, overflow: "hidden",
                }}>
                  <div style={{ height: isMobile ? 120 : 140, overflow: "hidden", background: "var(--bg-surface)", position: "relative" }}>
                    <img src={block.img} alt={block.title} className="img-cover"
                      onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
                    />
                    <div className="img-overlay" />
                  </div>
                  <div style={{ padding: isMobile ? "12px 14px" : "16px 20px 20px" }}>
                    <div style={{
                      fontSize: isMobile ? 9 : 10, fontWeight: 700, color: section.color,
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
                    }}>
                      {block.title}
                    </div>
                    {block.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "flex-start" }}>
                        <ChevronRight size={isMobile ? 10 : 12} color={section.colorHex} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: isMobile ? 11 : 13, color: "var(--text-primary)", lineHeight: 1.5 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div style={{ height: 1, background: "var(--border)", margin: divider }} />

      {/* ── CHRONOLOGIE TIMELINE ─────────────────────────────────────────────── */}
      <div style={{ padding: pad, maxWidth: "100%" }}>
        <ChronologieTimelineRich bp={bp} h2Size={h2Size} />
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--bg-surface)", borderTop: "1px solid var(--border)", padding: padSm,
        display: "flex", flexDirection: "column",
        alignItems: "stretch", gap: 16,
      }}>
        <div>
          <div style={{ fontSize: isMobile ? 15 : 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            ONETEAM Newsletter FY26
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            174 articles · 12 éditions · 1 465 collaborateurs
          </div>
        </div>
        <button className="c-cta" onClick={() => navigate("/dxc-newsletter")} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          background: "#E84E0F", color: "#fff",
          fontWeight: 700, fontSize: 14, padding: "12px 20px",
          borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit",
          width: "100%",
        }}>
          Explorer la Newsletter <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
