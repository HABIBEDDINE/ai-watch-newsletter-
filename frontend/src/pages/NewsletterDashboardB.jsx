/**
 * SCÉNARIO B — "L'Observatoire"
 * Fully responsive: Mobile < 640 | Tablet 640–1024 | Desktop > 1024
 * DXC design system (CSS variables — light & dark compatible)
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Users, Leaf,
  ArrowRight, CheckCircle, Sparkles, ChevronRight, BarChart2
} from "lucide-react";
import { ALL_MONTHS, YEAR_GROUPS } from "./newsletterSharedData";
import { useBreakpoint, rv } from "./useBreakpoint";

// ── Images ────────────────────────────────────────────────────────────────────
const IMG = {
  business: "/newsletter-images/page187_inside_gitex_africa_2025_dxc.jpg",
  people:   "/newsletter-images/page144_brandon_hall_group_excellence_gold.jpg",
  esg:      "/newsletter-images/page086_dxc_cdg_earns_cgem_csr_label_.jpg",
  hero:     "/newsletter-images/page117_fy25_s1_review_strengthened_partnership_and_shared_trust.jpg",
  vow:      "/newsletter-images/page023_fy26_vow_preparations_are_underway_.jpg",
  marathon: "/newsletter-images/page062_team_spirit_in_motion_dxc_cdg_at_the_casablanca_marathon_.jpg",
  iwd:      "/newsletter-images/page016_international_women_s_day_event___march_10th.jpg",
  seminar:  "/newsletter-images/page002_quality_at_the_heart_of_the_adm_seminar.jpg",
  gen_ai:   "/newsletter-images/page116_gen_ai_summit_2024_-_insights_on_ai___digital_transformation.jpg",
  forum:    "/newsletter-images/page110_ben_m_sik_forum___casablanca.jpg",
  town:     "/newsletter-images/page097_a_look_back_at_our_recent_town_hall_with_leadership.jpg",
};

const TIMELINE_IMGS = {
  "nov-2024": IMG.gen_ai,   "dec-2024": IMG.forum,
  "jan-2025": IMG.seminar,  "fev-2025": IMG.town,
  "avr-2025": IMG.business, "aout-2025": IMG.marathon,
  "sep-2025": IMG.people,   "dec-2025": IMG.esg,
  "mars-2026": IMG.vow,
};

const ACCORDIONS = [
  {
    id: "business", label: "Business & Clients", icon: TrendingUp,
    colorHex: "#E84E0F", img: IMG.business,
    stat: "+37M MAD", statSub: "vs objectif FY26",
    metrics: [
      ["Nouveaux contrats offshore", "12+"],
      ["Visites clients Q1 FY26",   "5 offshore"],
      ["GITEX Africa",              "3e édition"],
      ["EMEA Partners Forum Rabat", "80+ leaders EU"],
      ["Partenaires stratégiques",  "Umnia Bank · Carrefour"],
    ],
    achievements: [
      "5 visites clients offshore Q1 FY26 — rayonnement international confirmé",
      "GITEX Africa Marrakech — 3e participation consécutive",
      "1er EMEA Partners Forum à Rabat — 80+ leaders européens",
      "Portefeuille offshore considérablement enrichi",
    ],
  },
  {
    id: "people", label: "Collaborateurs & Talents", icon: Users,
    colorHex: "#7C3AED", img: IMG.people,
    stat: "1 465", statSub: "collaborateurs OneTeam",
    metrics: [
      ["VOW Score FY26",          "92% record"],
      ["Brandon Hall Awards",     "4 trophées"],
      ["Gold Awards",             "3 Gold"],
      ["Silver Awards",           "1 Silver"],
      ["Charte Managériale FY26", "100% engagement"],
    ],
    achievements: [
      "4 trophées Brandon Hall 2025 — reconnaissance internationale de l'excellence RH",
      "92% VOW FY26 — taux record absolu dans l'histoire DXC.CDG",
      "AI Center of Excellence lancé — positionnement IA renforcé",
      "OneTeam Rewards Ramadan — célébration des meilleurs collaborateurs",
    ],
  },
  {
    id: "esg", label: "ESG & Communauté", icon: Leaf,
    colorHex: "#15803D", img: IMG.esg,
    stat: "21 L", statSub: "de sang donné · 130 vies",
    metrics: [
      ["ISO 9001",         "Renouvelé sans non-conformité"],
      ["Label RSE CGEM",   "Obtenu FY26"],
      ["Don de sang",      "21 litres · 130 vies"],
      ["Chess Club",       "12e mondial"],
      ["Gaming Club",      "Champion E-League"],
    ],
    achievements: [
      "Label RSE CGEM obtenu — engagement RSE institutionnellement validé",
      "ISO 9001 renouvelé — zéro non-conformité pour la 2e fois consécutive",
      "Don de sang : 21 litres collectés, 130 vies potentiellement sauvées",
      "Chess Club 12e mondial · Gaming Club Champion E-League",
    ],
  },
];

const NODE_COLORS = { 2024: "#8B91B5", 2025: "#E84E0F", 2026: "#7C3AED" };

function useCountUp(target, duration = 1600, started = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!started) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setValue(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return value;
}

export default function NewsletterDashboardB() {
  const navigate = useNavigate();
  const bp = useBreakpoint();
  const [countStarted, setCountStarted] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const heroRef = useRef(null);

  const count1465 = useCountUp(1465, 1600, countStarted);
  const count174  = useCountUp(174,  1200, countStarted);
  const count12   = useCountUp(12,   900,  countStarted);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setCountStarted(true); },
      { threshold: 0.3 }
    );
    if (heroRef.current) obs.observe(heroRef.current);
    return () => obs.disconnect();
  }, []);

  const nodeData = selectedNode ? ALL_MONTHS.find(m => m.key === selectedNode) : null;

  // ── Responsive values ───────────────────────────────────────────────────────
  const pad      = rv(bp, "24px 16px", "32px 24px", "48px 56px");
  const padSm    = rv(bp, "20px 16px", "26px 24px", "36px 56px");
  const divider  = rv(bp, "0 16px",   "0 24px",    "0 56px");
  const h2Size   = rv(bp, 18,          20,           24);
  const heroDir  = rv(bp, "column",   "column",    "row");
  const heroGap  = rv(bp, 24,          32,           48);
  const bigCount = rv(bp, 80,          110,          140);
  const gridMet  = rv(bp, "1fr",       "1fr 1fr",   "1fr 1fr");
  const gridCard = rv(bp, "1fr",       "1fr 1fr",   "1fr 1fr");

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh", color: "var(--text-primary)", fontFamily: "var(--font-family,'Inter',sans-serif)", overflowX: "hidden" }}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .b-acc-btn { transition:background .15s;border:none;cursor:pointer;font-family:inherit;width:100%;text-align:left; }
        .b-acc-btn:hover { background:var(--bg-hover) !important; }
        .b-node { transition:transform .18s;cursor:pointer; }
        .b-node:hover { transform:scale(1.12); }
        .b-cta { transition:opacity .15s; }
        .b-cta:hover { opacity:.85; }
        .b-tl::-webkit-scrollbar { height:4px; }
        .b-tl::-webkit-scrollbar-track { background:var(--bg-surface); }
        .b-tl::-webkit-scrollbar-thumb { background:var(--accent-orange);border-radius:2px; }
        .img-cover { width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.38s ease; }
        .img-overlay { position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.42) 0%,rgba(0,0,0,0.08) 55%,transparent 100%);pointer-events:none; }
        .b-acc-photo:hover .img-cover { transform:scale(1.04); }
      `}</style>

      {/* ── HERO — count-up + photo ─────────────────────────────────────────── */}
      <div ref={heroRef} style={{
        background: "var(--bg-card)", borderBottom: "1px solid var(--border)",
        padding: pad, display: "flex", flexDirection: heroDir,
        gap: heroGap, alignItems: "center",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-dim)", border: "1px solid var(--accent-border)",
            borderRadius: 6, padding: "3px 10px", marginBottom: 20,
            fontSize: 11, fontWeight: 700, color: "var(--accent-orange)",
            letterSpacing: "0.08em", textTransform: "uppercase",
          }}>
            <BarChart2 size={11} /> L'Observatoire · DXC Technology Morocco
          </div>

          {/* Animated count */}
          <div style={{
            fontSize: bigCount, fontWeight: 900, lineHeight: 1,
            letterSpacing: "-0.04em", color: "var(--accent-orange)", marginBottom: 8,
          }}>
            {count1465.toLocaleString("fr-FR")}
          </div>
          <div style={{ fontSize: rv(bp, 13, 14, 15), color: "var(--text-secondary)", fontWeight: 500, marginBottom: 24 }}>
            collaborateurs OneTeam FY26 · DXC Technology Morocco
          </div>

          {/* Stat chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: rv(bp, 8, 10, 12) }}>
            {[
              { val: count12,  suf: " éditions", lbl: "FY25-FY26",      color: "var(--accent-orange)" },
              { val: count174, suf: " articles",  lbl: "Contenus publiés", color: "#7C3AED" },
              { val: "92%",    suf: "",           lbl: "VOW Score record", color: "#15803D" },
              { val: "4",      suf: " trophées",  lbl: "Brandon Hall",    color: "#B45309" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "var(--bg-surface)", border: "1px solid var(--border)",
                borderRadius: 8, padding: rv(bp, "9px 12px", "10px 14px", "11px 16px"),
              }}>
                <div style={{ fontSize: rv(bp, 16, 18, 20), fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.val}{s.suf}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero photo — tablet + desktop */}
        {!bp.mobile && (
          <div style={{
            width: rv(bp, "100%", "100%", "340px"),
            height: rv(bp, 210, 230, 250),
            borderRadius: 14, overflow: "hidden", position: "relative",
            flexShrink: 0, border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}>
            <img src={IMG.hero} alt="DXC Partnership" className="img-cover"
              onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
            />
            <div className="img-overlay" />
          </div>
        )}
        {bp.mobile && (
          <div style={{ width: "100%", height: 200, borderRadius: 12, overflow: "hidden", position: "relative", border: "1px solid var(--border)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <img src={IMG.hero} alt="DXC Partnership" className="img-cover"
              onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
            />
            <div className="img-overlay" />
          </div>
        )}
      </div>

      {/* ── ACCORDIONS ────────────────────────────────────────────────────────── */}
      <div style={{ padding: pad }}>
        <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: "0 0 4px" }}>Analyse par Pilier</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 18px" }}>
          Cliquez pour développer chaque axe stratégique
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ACCORDIONS.map(acc => {
            const open = openAccordion === acc.id;
            const Ic = acc.icon;
            return (
              <div key={acc.id} style={{
                background: "var(--bg-card)",
                border: `1px solid ${open ? acc.colorHex + "55" : "var(--border)"}`,
                borderRadius: 12, overflow: "hidden", transition: "border-color .2s",
              }}>
                <button className="b-acc-btn" onClick={() => setOpenAccordion(open ? null : acc.id)} style={{
                  padding: rv(bp, "15px 16px", "17px 18px", "18px 22px"),
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: open ? acc.colorHex + "08" : "transparent", color: "var(--text-primary)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: rv(bp, 32, 34, 36), height: rv(bp, 32, 34, 36), borderRadius: 8,
                      background: acc.colorHex + "18",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Ic size={rv(bp, 15, 16, 17)} color={acc.colorHex} />
                    </div>
                    <div>
                      <div style={{ fontSize: rv(bp, 13, 14, 15), fontWeight: 700, color: "var(--text-primary)" }}>{acc.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1 }}>
                        Indicateur clé : <span style={{ color: acc.colorHex, fontWeight: 600 }}>{acc.stat}</span> {acc.statSub}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--text-secondary)" style={{
                    transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0,
                  }} />
                </button>

                {open && (
                  <div style={{ padding: rv(bp, "0 16px 16px", "0 18px 18px", "0 22px 22px"), animation: "fadeIn .22s ease" }}>
                    {/* Photo */}
                    <div className="b-acc-photo" style={{ height: rv(bp, 160, 185, 210), borderRadius: 12, overflow: "hidden", marginBottom: 16, background: "linear-gradient(135deg,var(--bg-surface),var(--bg-card))", position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", cursor: "default" }}>
                      <img src={acc.img} alt={acc.label} className="img-cover"
                        onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
                      />
                      <div className="img-overlay" />
                      <div style={{ position: "absolute", bottom: 12, left: 14, color: "#fff" }}>
                        <div style={{ fontSize: rv(bp, 13, 14, 15), fontWeight: 800, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{acc.label}</div>
                        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{acc.statSub}</div>
                      </div>
                    </div>

                    {/* Big stat */}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                      <span style={{ fontSize: rv(bp, 36, 44, 52), fontWeight: 900, color: acc.colorHex, lineHeight: 1 }}>{acc.stat}</span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{acc.statSub}</span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: gridMet, gap: rv(bp, 16, 20, 22) }}>
                      {/* Metrics */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>
                          Métriques détaillées
                        </div>
                        {acc.metrics.map(([lbl, val], i) => (
                          <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                            padding: "8px 0",
                            borderBottom: i < acc.metrics.length - 1 ? "1px solid var(--border)" : "none",
                            gap: 8,
                          }}>
                            <span style={{ fontSize: rv(bp, 12, 12, 13), color: "var(--text-secondary)", flex: 1 }}>{lbl}</span>
                            <span style={{ fontSize: rv(bp, 12, 12, 13), fontWeight: 700, color: "var(--text-primary)", flexShrink: 0 }}>{val}</span>
                          </div>
                        ))}
                      </div>
                      {/* Achievements */}
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>
                          Réalisations
                        </div>
                        {acc.achievements.map((a, i) => (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 9 }}>
                            <CheckCircle size={13} color={acc.colorHex} style={{ flexShrink: 0, marginTop: 2 }} />
                            <span style={{ fontSize: rv(bp, 12, 12, 13), color: "var(--text-primary)", lineHeight: 1.5 }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ height: 1, background: "var(--border)", margin: divider }} />

      {/* ── TIMELINE ──────────────────────────────────────────────────────────── */}
      <div style={{ padding: pad }}>
        <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: "0 0 4px" }}>Chronologie des 12 Éditions</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px" }}>
          Cliquez sur un mois pour afficher les détails
        </p>

        <div className="b-tl" style={{ overflowX: "auto", paddingBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-end", width: "max-content", padding: "4px 4px 8px" }}>
            {ALL_MONTHS.map((m, i) => {
              const nc     = NODE_COLORS[m.year] || "var(--accent-orange)";
              const active = selectedNode === m.key;
              return (
                <React.Fragment key={m.key}>
                  {i > 0 && (
                    <div style={{
                      width: rv(bp, 24, 28, 32), height: 2, alignSelf: "center",
                      background: `linear-gradient(90deg,${NODE_COLORS[ALL_MONTHS[i-1].year]},${nc})`,
                      flexShrink: 0,
                    }} />
                  )}
                  <div className="b-node" onClick={() => setSelectedNode(active ? null : m.key)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, minWidth: rv(bp, 52, 56, 60) }}>
                    <div style={{
                      width: active ? 14 : 10, height: active ? 14 : 10, borderRadius: "50%",
                      background: active ? nc : "transparent", border: `2px solid ${nc}`,
                      boxShadow: active ? `0 0 8px ${nc}66` : "none", transition: "all .2s",
                    }} />
                    <div style={{ fontSize: rv(bp, 9, 10, 10), fontWeight: active ? 700 : 500, color: active ? nc : "var(--text-secondary)", textAlign: "center" }}>
                      {m.short}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)" }}>{m.year}</div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Year legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 4, flexWrap: "wrap" }}>
          {Object.entries(NODE_COLORS).map(([yr, c]) => (
            <div key={yr} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{yr}</span>
            </div>
          ))}
        </div>

        {/* Node detail card */}
        {nodeData && (
          <div style={{
            marginTop: 16, background: "var(--bg-card)",
            border: `1px solid var(--border)`,
            borderLeft: `4px solid ${NODE_COLORS[nodeData.year]}`,
            borderRadius: 12, overflow: "hidden",
            animation: "fadeIn .25s ease", boxShadow: "var(--shadow-sm)",
          }}>
            {TIMELINE_IMGS[nodeData.key] && (
              <div style={{ height: rv(bp, 165, 185, 205), overflow: "hidden", background: "linear-gradient(135deg,var(--bg-surface),var(--bg-card))", position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}>
                <img src={TIMELINE_IMGS[nodeData.key]} alt={nodeData.label} className="img-cover"
                  onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.60) 0%,rgba(0,0,0,0.10) 55%,transparent 100%)" }} />
                <div style={{ position: "absolute", bottom: 10, left: 14, color: "#fff" }}>
                  <div style={{ fontSize: rv(bp, 14, 15, 16), fontWeight: 800 }}>{nodeData.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>{nodeData.highlight}</div>
                </div>
                <div style={{
                  position: "absolute", top: 8, right: 10,
                  background: NODE_COLORS[nodeData.year], color: "#fff",
                  borderRadius: 5, padding: "2px 8px", fontSize: 10, fontWeight: 700,
                }}>
                  {nodeData.articleCount} art.
                </div>
              </div>
            )}
            <div style={{ padding: rv(bp, "14px 16px", "16px 18px", "18px 20px") }}>
              <div style={{ display: "grid", gridTemplateColumns: gridCard, gap: rv(bp, 14, 16, 18), marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 9 }}>KPIs</div>
                  {nodeData.kpis.map((k, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 7 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: NODE_COLORS[nodeData.year], marginTop: 6, flexShrink: 0 }} />
                      <span style={{ fontSize: rv(bp, 12, 12, 13), color: "var(--text-primary)", lineHeight: 1.5 }}>{k}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 9 }}>Événements</div>
                  {nodeData.events.map((e, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 7 }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, background: NODE_COLORS[nodeData.year] + "20", color: NODE_COLORS[nodeData.year], fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ fontSize: rv(bp, 12, 12, 13), color: "var(--text-primary)", lineHeight: 1.5 }}>{e}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: rv(bp, 12, 12, 13), color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.6 }}>
                  « {nodeData.quote} »
                </div>
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
            Explorer toutes les données
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>174 articles · 12 éditions · FY25-FY26</div>
        </div>
        <button className="b-cta" onClick={() => navigate("/dxc-newsletter")} style={{
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
