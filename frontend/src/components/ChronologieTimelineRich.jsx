/**
 * Rich Chronologie Timeline Component
 * Horizontal dot timeline with year color coding and detailed edition card
 */
import React, { useState } from "react";
import { ALL_MONTHS } from "../pages/newsletterSharedData";
import { rv } from "../pages/useBreakpoint";

const NODE_COLORS = { 2024: "#8B91B5", 2025: "#E84E0F", 2026: "#7C3AED" };

const TIMELINE_IMGS = {
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

export default function ChronologieTimelineRich({ bp, h2Size = 20 }) {
  // Default to first month so detail card shows on load
  const [selectedNode, setSelectedNode] = useState("nov-2024");
  const nodeData = selectedNode ? ALL_MONTHS.find(m => m.key === selectedNode) : null;

  const gridCard = rv(bp, "1fr", "1fr 1fr", "1fr 1fr");

  return (
    <>
      <style>{`
        .tl-rich-scroll::-webkit-scrollbar { height: 6px; }
        .tl-rich-scroll::-webkit-scrollbar-track { background: var(--bg-surface); border-radius: 3px; }
        .tl-rich-scroll::-webkit-scrollbar-thumb { background: var(--accent-orange); border-radius: 3px; }
        .tl-rich-node { transition: transform 0.18s; cursor: pointer; }
        .tl-rich-node:hover { transform: scale(1.08); }
        @keyframes tlFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .tl-rich-img { width: 100%; height: 100%; object-fit: cover; object-position: center center; display: block; }
      `}</style>

      <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: "0 0 4px" }}>
        Chronologie des 12 Éditions
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px" }}>
        Cliquez sur un mois pour afficher les détails
      </p>

      {/* Timeline track */}
      <div className="tl-rich-scroll" style={{
        overflowX: "auto",
        paddingBottom: 12,
        WebkitOverflowScrolling: "touch",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          width: "max-content",
          padding: "8px 4px",
          minWidth: "100%",
        }}>
          {ALL_MONTHS.map((m, i) => {
            const nc = NODE_COLORS[m.year] || "var(--accent-orange)";
            const active = selectedNode === m.key;
            return (
              <React.Fragment key={m.key}>
                {i > 0 && (
                  <div style={{
                    width: rv(bp, 16, 22, 28),
                    height: 2,
                    background: `linear-gradient(90deg, ${NODE_COLORS[ALL_MONTHS[i - 1].year]}, ${nc})`,
                    flexShrink: 0,
                  }} />
                )}
                <div
                  className="tl-rich-node"
                  onClick={() => setSelectedNode(m.key)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    minWidth: rv(bp, 44, 50, 56),
                    padding: "4px 2px",
                  }}
                >
                  {/* Dot with touch target */}
                  <div style={{
                    width: 44,
                    height: 44,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <div style={{
                      width: active ? 16 : 10,
                      height: active ? 16 : 10,
                      borderRadius: "50%",
                      background: active ? nc : "transparent",
                      border: `2.5px solid ${nc}`,
                      boxShadow: active ? `0 0 12px ${nc}66` : "none",
                      transition: "all 0.2s",
                    }} />
                  </div>
                  <div style={{
                    fontSize: rv(bp, 9, 10, 11),
                    fontWeight: active ? 700 : 500,
                    color: active ? nc : "var(--text-secondary)",
                    textAlign: "center",
                    lineHeight: 1.2,
                  }}>
                    {m.short}
                  </div>
                  <div style={{ fontSize: 9, color: "var(--text-muted)" }}>
                    {m.year}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Year legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
        {Object.entries(NODE_COLORS).map(([yr, c]) => (
          <div key={yr} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{yr}</span>
          </div>
        ))}
      </div>

      {/* Node detail card - always shows when a node is selected (default: nov-2024) */}
      {nodeData && (
        <div style={{
          marginTop: 20,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderLeft: `4px solid ${NODE_COLORS[nodeData.year]}`,
          borderRadius: 12,
          overflow: "hidden",
          animation: "tlFadeIn 0.25s ease",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}>
          {/* Hero image */}
          <div style={{
            height: rv(bp, 180, 240, 380),
            overflow: "hidden",
            background: "linear-gradient(135deg, var(--bg-surface), var(--bg-card))",
            position: "relative",
          }}>
            <img
              src={TIMELINE_IMGS[nodeData.key] || "/newsletter-images/page187_inside_gitex_africa_2025_dxc.jpg"}
              alt={nodeData.label}
              className="tl-rich-img"
              onError={e => {
                e.target.style.display = "none";
                e.target.parentElement.style.background = "linear-gradient(135deg, var(--bg-surface), var(--bg-card))";
              }}
            />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0) 100%)",
              pointerEvents: "none",
            }} />
            <div style={{ position: "absolute", bottom: "1.25rem", left: "1.5rem", color: "#fff" }}>
              <div style={{ fontSize: rv(bp, 16, 18, 22), fontWeight: 800, textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}>
                {nodeData.label}
              </div>
              <div style={{ fontSize: rv(bp, 12, 13, 14), opacity: 0.95, marginTop: 4, textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                {nodeData.highlight}
              </div>
            </div>
            <div style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "rgba(255,255,255,0.95)",
              color: "#1a1a2e",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}>
              {nodeData.articleCount} art.
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: rv(bp, "16px", "20px", "24px") }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: gridCard,
              gap: rv(bp, 16, 20, 24),
              marginBottom: 16,
            }}>
              {/* KPIs */}
              <div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 12,
                }}>
                  KPIs
                </div>
                {nodeData.kpis.map((k, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: NODE_COLORS[nodeData.year],
                      marginTop: 6,
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: rv(bp, 12, 13, 14), color: "var(--text-primary)", lineHeight: 1.5 }}>
                      {k}
                    </span>
                  </div>
                ))}
              </div>

              {/* Events */}
              <div>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 12,
                }}>
                  Événements
                </div>
                {nodeData.events.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 5,
                      background: NODE_COLORS[nodeData.year] + "18",
                      color: NODE_COLORS[nodeData.year],
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: rv(bp, 12, 13, 14), color: "var(--text-primary)", lineHeight: 1.5 }}>
                      {e}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote */}
            <div style={{ paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <div style={{
                fontSize: rv(bp, 13, 14, 14),
                color: "var(--text-secondary)",
                fontStyle: "italic",
                lineHeight: 1.65,
              }}>
                « {nodeData.quote} »
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
