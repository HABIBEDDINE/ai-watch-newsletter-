/**
 * SCÉNARIO A — "Le Rapport Annuel"
 * Fully responsive: Mobile < 640 | Tablet 640–1024 | Desktop > 1024
 * DXC design system (CSS variables — light & dark compatible)
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Users, Leaf, Award, Globe, Shield,
  ArrowRight, Calendar, Star, CheckCircle, Sparkles
} from "lucide-react";
import { ALL_MONTHS, YEAR_GROUPS } from "./newsletterSharedData";
import { useBreakpoint, rv } from "./useBreakpoint";

// ── Image maps ────────────────────────────────────────────────────────────────
const EDITION_IMGS = {
  "nov-2024": "/newsletter-images/page116_gen_ai_summit_2024_-_insights_on_ai___digital_transformation.jpg",
  "dec-2024": "/newsletter-images/page110_ben_m_sik_forum___casablanca.jpg",
  "jan-2025": "/newsletter-images/page002_quality_at_the_heart_of_the_adm_seminar.jpg",
  "fev-2025": "/newsletter-images/page097_a_look_back_at_our_recent_town_hall_with_leadership.jpg",
  "avr-2025": "/newsletter-images/page187_inside_gitex_africa_2025_dxc.jpg",
  "aout-2025": "/newsletter-images/page062_team_spirit_in_motion_dxc_cdg_at_the_casablanca_marathon_.jpg",
  "sep-2025": "/newsletter-images/page071_dxc_cdg_shines_with_4_brandon_hall_group_excellence_awards_.jpg",
  "dec-2025": "/newsletter-images/page086_dxc_cdg_earns_cgem_csr_label_.jpg",
  "mars-2026": "/newsletter-images/page023_fy26_vow_preparations_are_underway_.jpg",
};

const EVENTS_PHOTOS = [
  { img: "/newsletter-images/page187_inside_gitex_africa_2025_dxc.jpg",
    title: "GITEX Africa 2025",           cat: "Événement International", period: "Avr 2025" },
  { img: "/newsletter-images/page144_brandon_hall_group_excellence_gold.jpg",
    title: "Brandon Hall Awards",          cat: "Awards & Reconnaissance", period: "Sep 2025" },
  { img: "/newsletter-images/page022_in_the_spotlight_our_svp_lamiaa.jpg",
    title: "Journée Femmes",              cat: "DEI & Inclusion",         period: "Fév 2025" },
  { img: "/newsletter-images/page086_dxc_cdg_earns_cgem_csr_label_.jpg",
    title: "Label RSE CGEM",              cat: "ESG & Communauté",        period: "Nov 2025" },
  { img: "/newsletter-images/page023_fy26_vow_preparations_are_underway_.jpg",
    title: "VOW FY26 — Record 92%",       cat: "Collaborateurs",          period: "Mar 2026" },
  { img: "/newsletter-images/page184_colleagues_from_across_dxc_cdg_took_on_the.jpg",
    title: "Marathon de Casablanca",      cat: "Sport & Bien-être",       period: "Aoû 2025" },
  { img: "/newsletter-images/page117_fy25_s1_review_strengthened_partnership_and_shared_trust.jpg",
    title: "Revue S1 FY25",              cat: "Business & Clients",       period: "Jun 2025" },
  { img: "/newsletter-images/page004_a_strategic_partnership_with_umnia_bank.jpg",
    title: "Partenariat Umnia Bank",      cat: "Business & Clients",       period: "Jan 2025" },
  { img: "/newsletter-images/page015_dxc_cares_turning_commitment_into.jpg",
    title: "DXC Cares",                  cat: "ESG & Communauté",         period: "Fév 2025" },
  { img: "/newsletter-images/page116_gen_ai_summit_2024_-_insights_on_ai___digital_transformation.jpg",
    title: "Gen AI Summit 2024",          cat: "Innovation & Tech",        period: "Nov 2024" },
  { img: "/newsletter-images/page097_a_look_back_at_our_recent_town_hall_with_leadership.jpg",
    title: "Town Hall Leadership",        cat: "Management",               period: "Fév 2025" },
  { img: "/newsletter-images/page110_ben_m_sik_forum___casablanca.jpg",
    title: "Forum Ben M'sik",            cat: "ESG & Communauté",         period: "Déc 2024" },
];

const PILLARS = [
  {
    id: "business", label: "Business", icon: TrendingUp, colorHex: "#E84E0F",
    kpis: [
      { label: "Chiffre d'affaires", value: "+37M MAD",  sub: "vs objectif FY26" },
      { label: "Contrats offshore",  value: "12+",        sub: "portefeuille enrichi" },
      { label: "Visites clients",    value: "5 offshore", sub: "Q1 FY26" },
      { label: "GITEX Africa",       value: "3e édition", sub: "présence consécutive" },
    ],
  },
  {
    id: "collab", label: "Collaborateurs", icon: Users, colorHex: "#7C3AED",
    kpis: [
      { label: "Collaborateurs",      value: "1 465",      sub: "OneTeam FY26" },
      { label: "VOW Score",           value: "92%",        sub: "taux record absolu" },
      { label: "Brandon Hall",        value: "4 trophées", sub: "2 Gold + 1 Gold + 1 Silver" },
      { label: "Eng. formation",      value: "100%",       sub: "Charte Managériale FY26" },
    ],
  },
  {
    id: "esg", label: "ESG", icon: Leaf, colorHex: "#15803D",
    kpis: [
      { label: "ISO 9001",            value: "Renouvelé",       sub: "zéro non-conformité" },
      { label: "Label RSE CGEM",      value: "Obtenu",          sub: "engagement RSE validé" },
      { label: "Don de sang",         value: "21 L",            sub: "130 vies sauvées" },
      { label: "Impact communautaire", value: "Forum Ben M'sik", sub: "Casablanca" },
    ],
  },
];

const EDITION_KEYS = ["nov-2024","jan-2025","fev-2025","avr-2025","aout-2025","sep-2025","dec-2025","mars-2026"];

export default function NewsletterDashboardA() {
  const navigate = useNavigate();
  const bp = useBreakpoint();
  const [activePillar, setActivePillar] = useState("business");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [cardVisible, setCardVisible] = useState(false);

  const handleMonthClick = (key) => {
    if (selectedMonth === key) { setSelectedMonth(null); setCardVisible(false); return; }
    setCardVisible(false); setSelectedMonth(key);
    setTimeout(() => setCardVisible(true), 80);
  };

  const selectedData = ALL_MONTHS.find(m => m.key === selectedMonth);
  const pillar = PILLARS.find(p => p.id === activePillar);

  // ── Responsive values ───────────────────────────────────────────────────────
  const pad      = rv(bp, "24px 16px", "32px 24px", "48px 56px");
  const padSm    = rv(bp, "20px 16px", "26px 24px", "36px 56px");
  const divider  = rv(bp, "0 16px",   "0 24px",    "0 56px");
  const h1Size   = rv(bp, 32,          44,           56);
  const h1Sub    = rv(bp, 22,          30,           40);
  const h2Size   = rv(bp, 18,          20,           24);
  const kpiVal   = rv(bp, 18,          20,           24);
  const gridKPI  = rv(bp, "1fr 1fr",   "1fr 1fr",    "repeat(4,1fr)");
  const gridEvt  = rv(bp, "1fr",       "1fr 1fr",    "repeat(3,1fr)");
  const gridCard = rv(bp, "1fr",       "1fr 1fr",    "1fr 1fr");
  const cardW    = rv(bp, 165,          185,          200);

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "var(--font-family,'Inter',sans-serif)", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .a-card { transition:box-shadow .2s,transform .2s; }
        .a-card:hover { box-shadow:var(--shadow-md);transform:translateY(-2px); }
        .a-tab  { border:none;cursor:pointer;font-family:inherit;background:transparent;transition:all .15s;white-space:nowrap; }
        .a-tab:hover { opacity:.8; }
        .a-pill { border:none;cursor:pointer;font-family:inherit;transition:all .15s; }
        .a-pill:hover { opacity:.8; }
        .a-cta  { transition:opacity .15s; }
        .a-cta:hover { opacity:.85; }
        .a-strip::-webkit-scrollbar { height:4px; }
        .a-strip::-webkit-scrollbar-track { background:var(--bg-surface); }
        .a-strip::-webkit-scrollbar-thumb { background:var(--accent-orange);border-radius:2px; }
        .a-tabs-sc { overflow-x:auto;-webkit-overflow-scrolling:touch; }
        .a-tabs-sc::-webkit-scrollbar { display:none; }
        .img-cover { width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.38s ease; }
        .img-overlay { position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.42) 0%,rgba(0,0,0,0.08) 55%,transparent 100%);pointer-events:none; }
        .a-card:hover .img-cover { transform:scale(1.04); }
      `}</style>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", padding: pad }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
          borderRadius: 6, padding: "3px 10px", marginBottom: 14,
          fontSize: 11, fontWeight: 700, color: "var(--accent-orange)",
          letterSpacing: "0.08em", textTransform: "uppercase",
        }}>
          Rapport Annuel FY25–FY26 · DXC Technology Morocco
        </div>

        <h1 style={{ fontSize: h1Size, fontWeight: 900, margin: "0 0 2px", lineHeight: 1.05, letterSpacing: "-0.02em", wordBreak: "break-word" }}>
          ONETEAM
        </h1>
        <div style={{ fontSize: h1Sub, fontWeight: 800, color: "var(--accent-orange)", marginBottom: 14, lineHeight: 1, letterSpacing: "-0.02em" }}>
          Newsletter
        </div>
        <p style={{ fontSize: rv(bp, 13, 14, 14), color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6, maxWidth: 520 }}>
          Rapport annuel FY25-FY26 · 12 éditions · 174 articles
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            { val: "+37M MAD", lbl: "Croissance",     color: "var(--accent-orange)" },
            { val: "92%",      lbl: "VOW Score",      color: "#7C3AED" },
            { val: "1 465",    lbl: "Collaborateurs", color: "#15803D" },
            { val: "4",        lbl: "Brandon Hall",   color: "#B45309" },
          ].map(s => (
            <div key={s.lbl} style={{
              background: "var(--bg-surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: rv(bp, "10px 12px", "11px 14px", "12px 18px"),
            }}>
              <div style={{ fontSize: rv(bp, 18, 20, 22), fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3, fontWeight: 500 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EDITIONS STRIP ───────────────────────────────────────────────────── */}
      <div style={{ padding: pad }}>
        <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: "0 0 4px" }}>Les Éditions Phares</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
          Cliquez pour explorer la newsletter complète
        </p>
        <div className="a-strip" style={{ overflowX: "auto", paddingBottom: 8 }}>
          <div style={{ display: "flex", gap: rv(bp, 10, 12, 14), width: "max-content", padding: "2px 2px 6px" }}>
            {EDITION_KEYS.map((key) => {
              const m = ALL_MONTHS.find(x => x.key === key);
              if (!m) return null;
              return (
                <div key={key} className="a-card" onClick={() => navigate("/dxc-newsletter", { state: { selectedMonth: key } })} style={{
                  width: cardW, flexShrink: 0,
                  background: "var(--bg-card)", border: "1px solid var(--border)",
                  borderRadius: 14, overflow: "hidden", cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                }}>
                  <div style={{ height: rv(bp, 118, 130, 142), overflow: "hidden", background: "linear-gradient(135deg,var(--bg-surface),var(--bg-card))", position: "relative" }}>
                    {EDITION_IMGS[key] && (
                      <img src={EDITION_IMGS[key]} alt={m.label} className="img-cover"
                        onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
                      />
                    )}
                    <div className="img-overlay" />
                    <div style={{
                      position: "absolute", top: 6, right: 6,
                      background: "rgba(0,0,0,0.60)",
                      borderRadius: 5, padding: "2px 7px",
                      fontSize: 10, fontWeight: 700, color: "#fff",
                    }}>
                      {m.articleCount} art.
                    </div>
                  </div>
                  <div style={{ padding: rv(bp, "8px 10px 10px", "9px 11px 11px", "10px 12px 12px") }}>
                    <div style={{ fontSize: rv(bp, 12, 12, 13), fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                      {m.highlight.length > 48 ? m.highlight.slice(0, 48) + "…" : m.highlight}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: divider }} />

      {/* ── PILLAR TABS ───────────────────────────────────────────────────────── */}
      <div style={{ padding: pad }}>
        <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: "0 0 4px" }}>Piliers Stratégiques</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
          Performance FY26 par axe stratégique
        </p>

        {/* Scrollable tabs on mobile */}
        <div style={{ borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
          <div className="a-tabs-sc" style={{ display: "flex" }}>
            {PILLARS.map(p => {
              const Ic = p.icon;
              const active = activePillar === p.id;
              return (
                <button key={p.id} className="a-tab" onClick={() => setActivePillar(p.id)} style={{
                  padding: rv(bp, "11px 14px", "12px 16px", "12px 18px"),
                  fontSize: rv(bp, 12, 13, 14), fontWeight: 600,
                  color: active ? `${p.colorHex}` : "var(--text-secondary)",
                  borderBottom: active ? `2px solid ${p.colorHex}` : "2px solid transparent",
                  marginBottom: -1, display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                }}>
                  <Ic size={rv(bp, 13, 13, 14)} /> {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: gridKPI, gap: rv(bp, 10, 12, 14) }}>
          {pillar.kpis.map(k => (
            <div key={k.label} className="a-card" style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderLeft: `3px solid ${pillar.colorHex}`,
              borderRadius: 9, padding: rv(bp, "14px", "15px", "16px"),
            }}>
              <div style={{ fontSize: kpiVal, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, marginBottom: 5 }}>{k.value}</div>
              <div style={{ fontSize: rv(bp, 11, 12, 12), color: "var(--text-primary)", fontWeight: 600, marginBottom: 2 }}>{k.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontStyle: "italic" }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: divider }} />

      {/* ── EVENTS GRID — 1 col mobile | 2 col tablet | 3 col desktop ─────────── */}
      <div style={{ padding: pad }}>
        <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: "0 0 4px" }}>Temps Forts de l'Année</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
          12 événements marquants FY25-FY26
        </p>
        <div style={{ display: "grid", gridTemplateColumns: gridEvt, gap: rv(bp, 10, 12, 14) }}>
          {EVENTS_PHOTOS.map((ev, i) => (
            <div key={i} className="a-card" style={{
              background: "var(--bg-card)", border: "1px solid var(--border)",
              borderRadius: 14, overflow: "hidden",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
            }}>
              <div style={{ height: rv(bp, 165, 175, 185), overflow: "hidden", background: "linear-gradient(135deg,var(--bg-surface),var(--bg-card))", position: "relative" }}>
                <img src={ev.img} alt={ev.title} className="img-cover"
                  onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
                />
                <div className="img-overlay" />
              </div>
              <div style={{ padding: rv(bp, "10px 12px", "10px 12px", "10px 12px") }}>
                <div style={{
                  display: "inline-block", marginBottom: 5,
                  background: "var(--accent-dim)", color: "var(--accent-orange)",
                  borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 700,
                }}>
                  {ev.cat}
                </div>
                <div style={{ fontSize: rv(bp, 12, 12, 12), fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 4 }}>
                  {ev.title}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={10} /> {ev.period}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: divider }} />

      {/* ── MONTHLY GENERATOR ─────────────────────────────────────────────────── */}
      <div style={{ padding: pad }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Sparkles size={17} color="var(--accent-orange)" />
          <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: 0 }}>Générateur Mensuel</h2>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>
          Sélectionnez un mois pour afficher le résumé complet
        </p>

        {YEAR_GROUPS.map(yg => {
          const months = ALL_MONTHS.filter(m => yg.months.includes(m.key));
          return (
            <div key={yg.year} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                {yg.label}
              </div>
              {/* flex-wrap — no horizontal scroll */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: rv(bp, 6, 7, 8) }}>
                {months.map(m => {
                  const active = selectedMonth === m.key;
                  return (
                    <button key={m.key} className="a-pill" onClick={() => handleMonthClick(m.key)} style={{
                      padding: rv(bp, "6px 10px", "6px 12px", "7px 14px"),
                      borderRadius: 6, fontSize: rv(bp, 12, 12, 13), fontWeight: 600,
                      border: `1px solid ${active ? m.color : "var(--border)"}`,
                      background: active ? m.color + "18" : "var(--bg-surface)",
                      color: active ? m.color : "var(--text-secondary)", cursor: "pointer",
                    }}>
                      {m.short}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {selectedData && cardVisible && (
          <div style={{
            marginTop: 16, background: "var(--bg-card)",
            border: `1px solid var(--border)`, borderLeft: `4px solid ${selectedData.color}`,
            borderRadius: 12, overflow: "hidden", animation: "fadeUp .3s ease", boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ height: rv(bp, 175, 200, 220), overflow: "hidden", background: "linear-gradient(135deg,var(--bg-surface),var(--bg-card))", position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}>
              <img src={EDITION_IMGS[selectedData.key] || "/newsletter-images/page002_quality_at_the_heart_of_the_adm_seminar.jpg"}
                alt={selectedData.label} className="img-cover"
                onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.62) 0%,rgba(0,0,0,0.12) 55%,transparent 100%)" }} />
              <div style={{ position: "absolute", bottom: 10, left: 14, color: "#fff" }}>
                <div style={{ fontSize: rv(bp, 14, 16, 17), fontWeight: 800 }}>{selectedData.label}</div>
                <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{selectedData.highlight}</div>
              </div>
            </div>
            <div style={{ padding: rv(bp, "16px", "18px", "22px") }}>
              <div style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 7,
                padding: "11px 14px", fontSize: rv(bp, 12, 13, 13), color: "var(--text-secondary)",
                fontStyle: "italic", lineHeight: 1.65, marginBottom: 16,
              }}>
                « {selectedData.quote} »
              </div>
              <div style={{ display: "grid", gridTemplateColumns: gridCard, gap: rv(bp, 14, 16, 18), marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 9 }}>KPIs clés</div>
                  {selectedData.kpis.map((k, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 7 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: selectedData.color, marginTop: 6, flexShrink: 0 }} />
                      <span style={{ fontSize: rv(bp, 12, 12, 13), color: "var(--text-primary)", lineHeight: 1.5 }}>{k}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 9 }}>Événements</div>
                  {selectedData.events.map((e, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 7 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: selectedData.color + "20", color: selectedData.color, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ fontSize: rv(bp, 12, 12, 13), color: "var(--text-primary)", lineHeight: 1.5 }}>{e}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{selectedData.articleCount} articles publiés</span>
                <button className="a-cta" onClick={() => navigate("/dxc-newsletter")} style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "var(--accent-orange)", color: "#fff",
                  fontWeight: 700, fontSize: 13, padding: "7px 16px",
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
        justifyContent: "space-between", gap: rv(bp, 14, 14, 16),
      }}>
        <div>
          <div style={{ fontSize: rv(bp, 14, 16, 17), fontWeight: 800, color: "var(--text-primary)", marginBottom: 3 }}>
            Découvrez toutes les éditions
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>174 articles · 12 mois · Une équipe soudée</div>
        </div>
        <button className="a-cta" onClick={() => navigate("/dxc-newsletter")} style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "var(--accent-orange)", color: "#fff",
          fontWeight: 700, fontSize: rv(bp, 13, 13, 14), padding: rv(bp, "9px 16px", "10px 18px", "11px 22px"),
          borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
        }}>
          Accéder à la Newsletter <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
