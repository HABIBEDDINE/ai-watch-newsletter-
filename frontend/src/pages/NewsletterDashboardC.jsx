/**
 * SCÉNARIO C — "Le Rapport Vivant"
 * Fully responsive: Mobile < 640 | Tablet 640–1024 | Desktop > 1024
 * DXC design system (CSS variables — light & dark compatible)
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Users, Leaf, Award, Globe, Shield,
  ArrowRight, Calendar, Star, CheckCircle, Sparkles, ChevronRight
} from "lucide-react";
import { ALL_MONTHS, YEAR_GROUPS } from "./newsletterSharedData";
import { useBreakpoint, rv } from "./useBreakpoint";

// ── Image map ─────────────────────────────────────────────────────────────────
const IMG = {
  hero:      "/newsletter-images/page187_inside_gitex_africa_2025_dxc.jpg",
  brandon:   "/newsletter-images/page144_brandon_hall_group_excellence_gold.jpg",
  iwd:       "/newsletter-images/page016_international_women_s_day_event___march_10th.jpg",
  cgem:      "/newsletter-images/page086_dxc_cdg_earns_cgem_csr_label_.jpg",
  vow:       "/newsletter-images/page023_fy26_vow_preparations_are_underway_.jpg",
  marathon:  "/newsletter-images/page062_team_spirit_in_motion_dxc_cdg_at_the_casablanca_marathon_.jpg",
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
  { img: IMG.hero,     caption: "GITEX Africa 2025",       sub: "Marrakech — 3e participation" },
  { img: IMG.brandon,  caption: "Brandon Hall Awards",      sub: "4 trophées d'excellence RH" },
  { img: IMG.cgem,     caption: "Label RSE CGEM",           sub: "Engagement RSE validé" },
  { img: IMG.iwd,      caption: "Journée Femmes",           sub: "International Women's Day" },
  { img: IMG.marathon, caption: "Marathon de Casablanca",   sub: "Esprit d'équipe & sport" },
  { img: IMG.gen_ai,   caption: "Gen AI Summit 2024",       sub: "Innovation & Transformation" },
];

const MONTH_IMGS = {
  "nov-2024": IMG.gen_ai,   "dec-2024": IMG.forum_ben,
  "jan-2025": IMG.seminar,  "fev-2025": IMG.town_hall,
  "avr-2025": IMG.hero,     "aout-2025": IMG.marathon,
  "sep-2025": IMG.brandon,  "oct-2025": IMG.partners,
  "nov-2025": IMG.cgem,     "dec-2025": IMG.brandon,
  "mars-2026": IMG.vow,     "jan-2026": IMG.iwd,
};

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

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text, speed = 24, trigger = false) {
  const [displayed, setDisplayed] = useState("");
  const idxRef = useRef(0);
  const tmrRef = useRef(null);
  useEffect(() => {
    if (!trigger || !text) return;
    setDisplayed(""); idxRef.current = 0; clearInterval(tmrRef.current);
    tmrRef.current = setInterval(() => {
      idxRef.current += 1;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) clearInterval(tmrRef.current);
    }, speed);
    return () => clearInterval(tmrRef.current);
  }, [text, trigger]);
  return displayed;
}

export default function NewsletterDashboardC() {
  const navigate  = useNavigate();
  const bp        = useBreakpoint();
  const [activeTab, setActiveTab]       = useState("business");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [generating, setGenerating]     = useState(false);
  const [cardReady, setCardReady]       = useState(false);
  const tabsRef = useRef(null);
  const [tabsSticky, setTabsSticky]     = useState(false);

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

  const selectedData = ALL_MONTHS.find(m => m.key === selectedMonth);
  const quoteText    = selectedData ? `« ${selectedData.quote} »` : "";
  const typed        = useTypewriter(quoteText, 24, cardReady);

  const handleMonthClick = (key) => {
    if (generating) return;
    if (selectedMonth === key) { setSelectedMonth(null); setCardReady(false); return; }
    setSelectedMonth(key); setCardReady(false); setGenerating(true);
    setTimeout(() => { setGenerating(false); setCardReady(true); }, 800);
  };

  // ── Responsive values ───────────────────────────────────────────────────────
  const pad       = rv(bp, "24px 16px", "32px 24px", "48px 56px");
  const padSm     = rv(bp, "20px 16px", "26px 24px", "36px 56px");
  const divider   = rv(bp, "0 16px",   "0 24px",    "0 56px");
  const heroDir   = rv(bp, "column",   "column",    "row");
  const heroAlign = rv(bp, "stretch",  "stretch",   "center");
  const heroGap   = rv(bp, 24,         32,          52);
  const imgH      = rv(bp, 200,        240,         260);
  const imgW      = rv(bp, "100%",     "100%",      "380px");
  const imgShrink = rv(bp, 0,          0,           0);
  const titleSize = rv(bp, 26,         34,          44);
  const subSize   = rv(bp, 20,         26,          34);
  const h2Size    = rv(bp, 18,         20,          24);
  const bigStat   = rv(bp, 40,         52,          62);
  const kpiVal    = rv(bp, 18,         20,          22);
  const gridHL    = rv(bp, "1fr",      "1fr 1fr",   "repeat(3,1fr)");
  const gridKPI   = rv(bp, "1fr 1fr",  "1fr 1fr",   "repeat(4,1fr)");
  const gridBlock = rv(bp, "1fr",      "1fr 1fr",   "repeat(3,1fr)");
  const gridCard  = rv(bp, "1fr",      "1fr 1fr",   "1fr 1fr");
  const tabPad    = rv(bp, "0 16px",   "0 24px",    "0 56px");
  const tabFSize  = rv(bp, 13,         13,          14);
  const tabGap    = rv(bp, 0,          4,           0);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "var(--font-family,'Inter',sans-serif)", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes bounceD { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .c-tab  { border:none;cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap; }
        .c-tab:hover { opacity:.8; }
        .c-pill { border:none;cursor:pointer;font-family:inherit;transition:all .15s; }
        .c-pill:hover { opacity:.8; }
        .c-card { transition:box-shadow .2s,transform .2s; }
        .c-card:hover { box-shadow:var(--shadow-md);transform:translateY(-2px); }
        .c-cta  { transition:opacity .15s; }
        .c-cta:hover { opacity:.85; }
        .c-hl   { transition:transform .2s,box-shadow .2s; }
        .c-hl:hover { transform:translateY(-3px);box-shadow:var(--shadow-md); }
        .c-tabs-scroll { overflow-x:auto;-webkit-overflow-scrolling:touch; }
        .c-tabs-scroll::-webkit-scrollbar { display:none; }
        .img-cover { width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.38s ease; }
        .img-overlay { position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.42) 0%,rgba(0,0,0,0.08) 55%,transparent 100%);pointer-events:none; }
        .c-card:hover .img-cover { transform:scale(1.04); }
        .c-hl:hover   .img-cover { transform:scale(1.04); }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: pad,
        display: "flex", flexDirection: heroDir,
        gap: heroGap, alignItems: heroAlign,
      }}>
        {/* Left — text + KPIs */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
            borderRadius: 6, padding: "3px 10px", marginBottom: 14,
            fontSize: 11, fontWeight: 700, color: "var(--accent-orange)",
            letterSpacing: "0.08em", textTransform: "uppercase",
            maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            ONETEAM Newsletter · DXC Technology Morocco
          </div>

          <h1 style={{
            fontSize: titleSize, fontWeight: 900, color: "var(--text-primary)",
            margin: "0 0 4px", lineHeight: 1.1, letterSpacing: "-0.02em",
            wordBreak: "break-word",
          }}>
            Le Rapport Vivant
          </h1>
          <div style={{
            fontSize: subSize, fontWeight: 800, color: "var(--accent-orange)",
            marginBottom: 12, letterSpacing: "-0.02em",
          }}>
            FY26
          </div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: "0 0 24px", maxWidth: 440 }}>
            12 éditions · 174 articles · 1 465 talents · Une année de transformation digitale et humaine.
          </p>

          {/* KPI chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[
              { val: "+37M MAD", lbl: "Croissance",       color: "var(--accent-orange)" },
              { val: "92%",      lbl: "VOW Score",        color: "var(--purple)" },
              { val: "1 465",    lbl: "Collaborateurs",   color: "var(--green)" },
              { val: "4",        lbl: "Brandon Hall",     color: "var(--amber)" },
            ].map(s => (
              <div key={s.lbl} style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "10px 14px", minWidth: 0, flex: "0 0 auto",
              }}>
                <div style={{ fontSize: kpiVal, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3, fontWeight: 500 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — hero photo (tablet + desktop) */}
        {!bp.mobile && (
          <div style={{
            width: imgW, height: imgH, borderRadius: 14, overflow: "hidden", position: "relative",
            flexShrink: imgShrink, border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)", alignSelf: "flex-start",
          }}>
            <img src={IMG.hero} alt="GITEX Africa 2025" className="img-cover"
              onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
            />
            <div className="img-overlay" />
          </div>
        )}
        {/* Mobile: full-width image below text */}
        {bp.mobile && (
          <div style={{
            width: "100%", height: 210, borderRadius: 12, overflow: "hidden", position: "relative",
            border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}>
            <img src={IMG.hero} alt="GITEX Africa 2025" className="img-cover"
              onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
            />
            <div className="img-overlay" />
          </div>
        )}
      </div>

      {/* ── TEMPS FORTS ──────────────────────────────────────────────────────── */}
      <div style={{ padding: pad }}>
        <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: "0 0 4px", color: "var(--text-primary)" }}>
          Temps Forts de l'Année
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px" }}>
          6 moments marquants FY25-FY26
        </p>
        <div style={{ display: "grid", gridTemplateColumns: gridHL, gap: rv(bp, 12, 14, 16) }}>
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className="c-hl" onClick={() => navigate("/dxc-newsletter")} style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 14, overflow: "hidden", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            }}>
              <div style={{ height: rv(bp, 160, 175, 185), overflow: "hidden", background: "linear-gradient(135deg,var(--bg-surface),var(--bg-card))", position: "relative" }}>
                <img src={h.img} alt={h.caption} className="img-cover"
                  onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
                />
                <div className="img-overlay" />
              </div>
              <div style={{ padding: rv(bp, "10px 12px", "12px 14px", "12px 14px") }}>
                <div style={{ fontSize: rv(bp, 12, 13, 13), fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{h.caption}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{h.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: divider }} />

      {/* ── PILLAR TABS (sticky, scrollable) ─────────────────────────────────── */}
      <div ref={tabsRef} style={{
        position: tabsSticky ? "sticky" : "relative",
        top: tabsSticky ? 0 : "auto", zIndex: 40,
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        boxShadow: tabsSticky ? "var(--shadow-sm)" : "none",
        transition: "box-shadow .2s",
      }}>
        <div className="c-tabs-scroll" style={{ padding: tabPad, display: "flex", gap: tabGap }}>
          {PILLARS.map(p => {
            const active = activeTab === p.id;
            const Ic = p.icon;
            return (
              <button key={p.id} className="c-tab" onClick={() => setActiveTab(p.id)} style={{
                padding: rv(bp, "12px 14px", "13px 16px", "14px 20px"),
                fontSize: tabFSize, fontWeight: 600, background: "transparent",
                color: active ? p.color : "var(--text-secondary)",
                borderBottom: active ? `2px solid ${p.colorHex}` : "2px solid transparent",
                display: "flex", alignItems: "center", gap: 6, marginBottom: -1,
                flexShrink: 0,
              }}>
                <Ic size={rv(bp, 13, 14, 15)} /> {p.label}
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
          <div key={section.id} style={{ padding: pad, animation: "fadeUp .3s ease" }}>
            {/* Quote */}
            <div style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderLeft: `3px solid ${section.colorHex}`, borderRadius: 8,
              padding: rv(bp, "12px 14px", "13px 16px", "14px 18px"),
              marginBottom: rv(bp, 20, 24, 28),
              fontSize: rv(bp, 13, 14, 14), color: "var(--text-secondary)",
              fontStyle: "italic", lineHeight: 1.6,
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <Ic size={16} color={section.colorHex} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>"{section.quote}"</span>
            </div>

            {/* Big stat */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: rv(bp, 16, 20, 22), flexWrap: "wrap" }}>
              <span style={{ fontSize: bigStat, fontWeight: 900, color: section.color, lineHeight: 1 }}>
                {section.bigStat}
              </span>
              <span style={{ fontSize: rv(bp, 12, 13, 14), color: "var(--text-secondary)" }}>{section.bigStatSub}</span>
            </div>

            {/* KPI cards — 2 col mobile, 2 col tablet, 4 col desktop */}
            <div style={{ display: "grid", gridTemplateColumns: gridKPI, gap: rv(bp, 10, 12, 14), marginBottom: rv(bp, 20, 24, 28) }}>
              {section.kpis.map(k => {
                const KIcon = k.icon;
                return (
                  <div key={k.label} className="c-card" style={{
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: 10, padding: rv(bp, "14px", "15px", "16px"),
                  }}>
                    <KIcon size={15} color={section.colorHex} style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: kpiVal, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{k.value}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 4, lineHeight: 1.3 }}>{k.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Detail blocks — 1 col mobile, 2 col tablet, 3 col desktop */}
            <div style={{ display: "grid", gridTemplateColumns: gridBlock, gap: rv(bp, 12, 14, 16) }}>
              {section.blocks.map(block => (
                <div key={block.title} className="c-card" style={{
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 14, overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                }}>
                  <div style={{ height: rv(bp, 170, 188, 205), overflow: "hidden", background: "linear-gradient(135deg,var(--bg-surface),var(--bg-card))", position: "relative" }}>
                    <img src={block.img} alt={block.title} className="img-cover"
                      onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
                    />
                    <div className="img-overlay" />
                  </div>
                  <div style={{ padding: rv(bp, "12px 14px", "13px 15px", "14px 16px") }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: section.color,
                      textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
                    }}>
                      {block.title}
                    </div>
                    {block.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 7, marginBottom: 7, alignItems: "flex-start" }}>
                        <ChevronRight size={12} color={section.colorHex} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.5 }}>{item}</span>
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

      {/* ── MONTHLY GENERATOR ─────────────────────────────────────────────────── */}
      <div style={{ padding: pad }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Sparkles size={18} color="var(--accent-orange)" />
          <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
            Générateur de Résumés
          </h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 28px" }}>
          Sélectionnez un mois pour afficher le résumé de l'édition
        </p>

        {YEAR_GROUPS.map(yg => {
          const months = ALL_MONTHS.filter(m => yg.months.includes(m.key));
          return (
            <div key={yg.year} style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8,
              }}>
                {yg.label}
              </div>
              {/* flex-wrap ensures no horizontal overflow */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: rv(bp, 6, 8, 8) }}>
                {months.map(m => {
                  const active = selectedMonth === m.key;
                  return (
                    <button key={m.key} className="c-pill" onClick={() => handleMonthClick(m.key)}
                      disabled={generating}
                      style={{
                        padding: rv(bp, "6px 11px", "7px 12px", "7px 14px"),
                        borderRadius: 6, fontSize: rv(bp, 12, 13, 13), fontWeight: 600,
                        border: `1px solid ${active ? m.color : "var(--border)"}`,
                        background: active ? m.color + "18" : "var(--bg-surface)",
                        color: active ? m.color : "var(--text-secondary)",
                        cursor: generating ? "wait" : "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                      {m.short}
                      <span style={{
                        background: active ? m.color : "var(--border)",
                        color: active ? "#fff" : "var(--text-muted)",
                        borderRadius: 4, padding: "1px 5px",
                        fontSize: 10, fontWeight: 700,
                      }}>
                        {m.articleCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Generating dots */}
        {generating && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: rv(bp, "14px", "16px", "20px"),
            background: "var(--bg-surface)", border: "1px solid var(--border)",
            borderRadius: 10, marginTop: 12,
          }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%", background: "var(--accent-orange)",
                animation: `bounceD .8s ease ${i * 0.17}s infinite`,
              }} />
            ))}
            <span style={{ fontSize: 13, color: "var(--text-secondary)", marginLeft: 4 }}>
              Génération du résumé…
            </span>
          </div>
        )}

        {/* Generated card */}
        {selectedData && cardReady && !generating && (
          <div style={{
            marginTop: 20, background: "var(--bg-card)",
            border: `1px solid var(--border)`,
            borderLeft: `4px solid ${selectedData.color}`,
            borderRadius: 12, overflow: "hidden",
            animation: "fadeUp .3s ease", boxShadow: "var(--shadow-sm)",
          }}>
            {/* Photo */}
            <div style={{ height: rv(bp, 185, 210, 230), overflow: "hidden", background: "linear-gradient(135deg,var(--bg-surface),var(--bg-card))", position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}>
              <img src={MONTH_IMGS[selectedData.key] || IMG.hero} alt={selectedData.label} className="img-cover"
                onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.65) 0%,rgba(0,0,0,0.1) 55%)" }} />
              <div style={{ position: "absolute", bottom: 12, left: 16 }}>
                <div style={{ fontSize: rv(bp, 15, 17, 18), fontWeight: 800, color: "#fff" }}>{selectedData.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{selectedData.highlight}</div>
              </div>
              <div style={{
                position: "absolute", top: 10, right: 10,
                background: selectedData.color, color: "#fff",
                borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700,
              }}>
                {selectedData.articleCount} articles
              </div>
            </div>

            <div style={{ padding: rv(bp, "16px", "20px", "24px") }}>
              {/* Typewriter quote */}
              <div style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 8, padding: "11px 14px",
                fontSize: rv(bp, 12, 13, 13), color: "var(--text-secondary)",
                fontStyle: "italic", lineHeight: 1.7, marginBottom: 16, minHeight: 44,
              }}>
                {typed}
                {typed.length < quoteText.length && (
                  <span style={{ borderRight: `2px solid ${selectedData.color}`, marginLeft: 2, animation: "fadeIn .5s step-end infinite" }}>&nbsp;</span>
                )}
              </div>

              {/* KPIs + Events — 1 col mobile, 2 col tablet+ */}
              <div style={{ display: "grid", gridTemplateColumns: gridCard, gap: rv(bp, 16, 18, 20), marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>KPIs clés</div>
                  {selectedData.kpis.map((k, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 7 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: selectedData.color, marginTop: 6, flexShrink: 0 }} />
                      <span style={{ fontSize: rv(bp, 12, 13, 13), color: "var(--text-primary)", lineHeight: 1.5 }}>{k}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Événements</div>
                  {selectedData.events.map((e, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 7 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, background: selectedData.color + "20", color: selectedData.color, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                      <span style={{ fontSize: rv(bp, 12, 13, 13), color: "var(--text-primary)", lineHeight: 1.5 }}>{e}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Calendar size={12} /> {selectedData.articleCount} articles publiés
                </span>
                <button className="c-cta" onClick={() => navigate("/dxc-newsletter")} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--accent-orange)", color: "#fff",
                  fontWeight: 700, fontSize: 13, padding: "8px 16px",
                  borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "inherit",
                }}>
                  Voir les articles <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--bg-surface)", borderTop: "1px solid var(--border)", padding: padSm,
        display: "flex", flexDirection: rv(bp, "column", "column", "row"),
        alignItems: rv(bp, "flex-start", "flex-start", "center"),
        justifyContent: "space-between", gap: rv(bp, 16, 16, 20),
      }}>
        <div>
          <div style={{ fontSize: rv(bp, 15, 16, 18), fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>
            ONETEAM Newsletter FY26
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            174 articles · 12 éditions · 1 465 collaborateurs
          </div>
        </div>
        <button className="c-cta" onClick={() => navigate("/dxc-newsletter")} style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "var(--accent-orange)", color: "#fff",
          fontWeight: 700, fontSize: rv(bp, 13, 14, 14), padding: rv(bp, "10px 18px", "11px 20px", "12px 24px"),
          borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
        }}>
          Explorer la Newsletter <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
