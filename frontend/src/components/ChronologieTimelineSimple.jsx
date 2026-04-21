/**
 * Simple Chronologie Timeline Component
 * Chip-based layout grouped by fiscal year periods
 */
import React, { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { ALL_MONTHS, YEAR_GROUPS } from "../pages/newsletterSharedData";
import { rv } from "../pages/useBreakpoint";

const MONTH_IMGS = {
  "nov-2024": "/newsletter-images/page116_gen_ai_summit_2024_-_insights_on_ai___digital_transformation.jpg",
  "dec-2024": "/newsletter-images/page110_ben_m_sik_forum___casablanca.jpg",
  "jan-2025": "/newsletter-images/page002_quality_at_the_heart_of_the_adm_seminar.jpg",
  "fev-2025": "/newsletter-images/page097_a_look_back_at_our_recent_town_hall_with_leadership.jpg",
  "avr-2025": "/newsletter-images/page187_inside_gitex_africa_2025_dxc.jpg",
  "aout-2025": "/newsletter-images/page062_team_spirit_in_motion_dxc_cdg_at_the_casablanca_marathon_.jpg",
  "sep-2025": "/newsletter-images/page144_brandon_hall_group_excellence_gold.jpg",
  "oct-2025": "/newsletter-images/page117_fy25_s1_review_strengthened_partnership_and_shared_trust.jpg",
  "nov-2025": "/newsletter-images/page086_dxc_cdg_earns_cgem_csr_label_.jpg",
  "dec-2025": "/newsletter-images/page144_brandon_hall_group_excellence_gold.jpg",
  "fev-2026": "/newsletter-images/page010_new_contracts_strengthening_our.jpg",
  "mars-2026": "/newsletter-images/page023_fy26_vow_preparations_are_underway_.jpg",
};

function useTypewriter(text, speed = 30, start = false) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    if (!start || !text) { setDisplayed(""); return; }
    let idx = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, start]);
  return displayed;
}

export default function ChronologieTimelineSimple({ bp, h2Size = 20 }) {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const selectedData = ALL_MONTHS.find(m => m.key === selectedMonth);
  const quoteText = selectedData ? `« ${selectedData.quote} »` : "";
  const typed = useTypewriter(quoteText, 24, cardReady);

  const handleMonthClick = (key) => {
    if (generating) return;
    if (selectedMonth === key) {
      setSelectedMonth(null);
      setCardReady(false);
      return;
    }
    setSelectedMonth(key);
    setCardReady(false);
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setCardReady(true);
    }, 600);
  };

  const gridCard = rv(bp, "1fr", "1fr 1fr", "1fr 1fr");

  return (
    <>
      <style>{`
        .tl-simple-pill { border: none; cursor: pointer; font-family: inherit; transition: all 0.15s; }
        .tl-simple-pill:hover { opacity: 0.8; }
        @keyframes tlSimpleFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tlSimpleBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .tl-simple-img { width: 100%; height: 100%; object-fit: cover; display: block; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <Calendar size={18} color="var(--accent-orange)" />
        <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: 0, color: "var(--text-primary)" }}>
          Chronologie des 12 Éditions
        </h2>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>
        Parcourez les 12 éditions mensuelles de la newsletter FY26
      </p>

      {/* Year groups with chips */}
      {YEAR_GROUPS.map(yg => {
        const months = ALL_MONTHS.filter(m => yg.months.includes(m.key));
        return (
          <div key={yg.year} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}>
              {yg.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: rv(bp, 6, 8, 8) }}>
              {months.map(m => {
                const active = selectedMonth === m.key;
                return (
                  <button
                    key={m.key}
                    className="tl-simple-pill"
                    onClick={() => handleMonthClick(m.key)}
                    disabled={generating}
                    style={{
                      padding: rv(bp, "7px 12px", "8px 14px", "8px 16px"),
                      borderRadius: 6,
                      fontSize: rv(bp, 12, 13, 13),
                      fontWeight: 600,
                      border: `1px solid ${active ? m.color : "var(--border)"}`,
                      background: active ? m.color + "18" : "var(--bg-surface)",
                      color: active ? m.color : "var(--text-secondary)",
                      cursor: generating ? "wait" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      minHeight: 44,
                    }}
                  >
                    {m.short}
                    <span style={{
                      background: active ? m.color : "var(--border)",
                      color: active ? "#fff" : "var(--text-muted)",
                      borderRadius: 4,
                      padding: "2px 6px",
                      fontSize: 10,
                      fontWeight: 700,
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
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: rv(bp, "14px", "16px", "20px"),
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          marginTop: 12,
        }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent-orange)",
                animation: `tlSimpleBounce 0.8s ease ${i * 0.17}s infinite`,
              }}
            />
          ))}
          <span style={{ fontSize: 13, color: "var(--text-secondary)", marginLeft: 4 }}>
            Génération du résumé…
          </span>
        </div>
      )}

      {/* Generated card */}
      {selectedData && cardReady && !generating && (
        <div style={{
          marginTop: 20,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderLeft: `4px solid ${selectedData.color}`,
          borderRadius: 12,
          overflow: "hidden",
          animation: "tlSimpleFadeUp 0.3s ease",
          boxShadow: "var(--shadow-sm)",
        }}>
          {/* Photo */}
          <div style={{
            height: rv(bp, 160, 185, 210),
            overflow: "hidden",
            background: "linear-gradient(135deg, var(--bg-surface), var(--bg-card))",
            position: "relative",
          }}>
            <img
              src={MONTH_IMGS[selectedData.key] || "/newsletter-images/page187_inside_gitex_africa_2025_dxc.jpg"}
              alt={selectedData.label}
              className="tl-simple-img"
              onError={e => {
                e.target.style.display = "none";
                e.target.parentElement.style.background = "linear-gradient(135deg, var(--bg-surface), var(--bg-card))";
              }}
            />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 55%)",
            }} />
            <div style={{ position: "absolute", bottom: 12, left: 16 }}>
              <div style={{ fontSize: rv(bp, 15, 17, 18), fontWeight: 800, color: "#fff" }}>
                {selectedData.label}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                {selectedData.highlight}
              </div>
            </div>
            <div style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: selectedData.color,
              color: "#fff",
              borderRadius: 6,
              padding: "3px 9px",
              fontSize: 11,
              fontWeight: 700,
            }}>
              {selectedData.articleCount} articles
            </div>
          </div>

          <div style={{ padding: rv(bp, "16px", "20px", "24px") }}>
            {/* Typewriter quote */}
            <div style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "11px 14px",
              fontSize: rv(bp, 12, 13, 13),
              color: "var(--text-secondary)",
              fontStyle: "italic",
              lineHeight: 1.7,
              marginBottom: 16,
              minHeight: 44,
            }}>
              {typed}
              {typed.length < quoteText.length && (
                <span style={{
                  borderRight: `2px solid ${selectedData.color}`,
                  marginLeft: 2,
                  animation: "tlSimpleFadeUp 0.5s step-end infinite",
                }}>
                  &nbsp;
                </span>
              )}
            </div>

            {/* KPIs + Events */}
            <div style={{
              display: "grid",
              gridTemplateColumns: rv(bp, "1fr", "1fr 1fr", gridCard),
              gap: rv(bp, 14, 16, 18),
            }}>
              <div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 9,
                }}>
                  KPIs
                </div>
                {selectedData.kpis.map((k, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 7 }}>
                    <div style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: selectedData.color,
                      marginTop: 6,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: rv(bp, 12, 12, 13), color: "var(--text-primary)", lineHeight: 1.5 }}>
                      {k}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 9,
                }}>
                  Événements
                </div>
                {selectedData.events.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 7 }}>
                    <div style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: selectedData.color + "20",
                      color: selectedData.color,
                      fontSize: 10,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: rv(bp, 12, 12, 13), color: "var(--text-primary)", lineHeight: 1.5 }}>
                      {e}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
