import { useState, useEffect, useCallback } from "react";
import { getTrends, refreshTrends, getDeepDive, saveTrend, unsaveTrend, matchSolutions } from "../services/api";

const ACCENT = "#1A4A9E";
const ACCENT_BG = "#e8eef8";

const B = {
  white:    "#ffffff",
  gray50:   "#fafafa",
  gray100:  "#f4f4f4",
  gray200:  "#e8e8e8",
  gray300:  "#d0d0d0",
  gray400:  "#999999",
  gray500:  "#666666",
  gray600:  "#444444",
  gray700:  "#222222",
  green:    "#C45F00",
  greenBg:  "#fdf0e6",
  amber:    "#d97706",
  amberBg:  "#fef3c7",
  blue:     "#2563eb",
  blueBg:   "#dbeafe",
  red:      "#dc2626",
};

const CATEGORY_LABELS = {
  llm_models:       "LLM Models",
  dev_tools:        "Dev & Coding AI",
  ai_agents:        "AI Agents",
  open_source:      "Open Source AI",
  ai_infrastructure:"AI Infrastructure",
  enterprise_apps:  "Enterprise AI Apps",
};

const CATEGORY_COLORS = {
  llm_models:        [ACCENT,   ACCENT_BG],
  dev_tools:         ["#0369a1","#e0f2fe"],
  ai_agents:         ["#7c3aed","#ede9fe"],
  open_source:       ["#047857","#d1fae5"],
  ai_infrastructure: ["#b45309","#fef3c7"],
  enterprise_apps:   ["#be185d","#fce7f3"],
};

function getMomentumStyle(score) {
  if (score >= 9) return { label: "EXPLOSIVE", bg: B.greenBg,  color: B.green };
  if (score >= 7) return { label: "RISING",    bg: B.amberBg,  color: B.amber };
  return             { label: "GROWING",    bg: B.blueBg,   color: B.blue  };
}

function SkeletonCard() {
  return (
    <div style={{ background: B.white, border: `1.5px solid ${B.gray200}`, borderRadius: 12, padding: 20 }}>
      {[80, 60, 100, 100, 40].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 20 : i === 2 ? 14 : i === 3 ? 14 : 12,
          width: `${w}%`,
          background: B.gray100,
          borderRadius: 4,
          marginBottom: 10,
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}

function CategoryPill({ category }) {
  const [color, bg] = CATEGORY_COLORS[category] || [B.gray500, B.gray100];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
      background: bg, color, letterSpacing: 0.3,
    }}>
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}

function TagPill({ tag }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 999,
      background: B.gray100, color: B.gray500, letterSpacing: 0.2,
    }}>
      {tag}
    </span>
  );
}

function MomentumBadge({ score }) {
  const { label, bg, color } = getMomentumStyle(score);
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 999,
      background: bg, color, letterSpacing: 0.8,
    }}>
      {label}
    </span>
  );
}

function TopCard({ trend, rank, onDeepDive, onSave, loadingDive }) {
  const medals = ["🥇", "🥈", "🥉"];
  const [matchResult,  setMatchResult]  = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError,   setMatchError]   = useState(null);

  const handleMatchSolutions = async () => {
    if (matchResult) return;
    setMatchLoading(true);
    setMatchError(null);
    try {
      const res = await matchSolutions({
        title:    trend.topic || "",
        summary:  trend.summary || "",
        industry: trend.category || "",
        signal:   trend.momentum || "",
      });
      setMatchResult(res.matches || []);
    } catch (err) {
      setMatchError(err.message || "Failed to match solutions.");
    } finally {
      setMatchLoading(false);
    }
  };

  return (
    <div style={{
      background: B.white,
      border: `1.5px solid ${rank === 1 ? ACCENT + "55" : B.gray200}`,
      borderRadius: 12,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      position: "relative",
      boxShadow: rank === 1 ? `0 4px 20px ${ACCENT}18` : "none",
      transition: "box-shadow 0.2s",
    }}>
      {/* Rank + Score row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 22 }}>{medals[rank - 1]}</span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{trend.score}</div>
          <div style={{ fontSize: 10, color: B.gray400, fontWeight: 600 }}>/10</div>
        </div>
      </div>

      {/* Momentum badge */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <MomentumBadge score={trend.score} />
        <span style={{ fontSize: 11, fontWeight: 700, color: B.green }}>{trend.momentum}</span>
      </div>

      {/* Topic */}
      <div style={{ fontSize: 16, fontWeight: 800, color: B.gray700, lineHeight: 1.3 }}>
        {trend.topic}
      </div>

      {/* Summary (2-line clamp) */}
      <div style={{
        fontSize: 12, color: B.gray500, lineHeight: 1.55,
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {trend.summary}
      </div>

      {/* Tags */}
      {trend.tags?.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {trend.tags.map(t => <TagPill key={t} tag={t} />)}
        </div>
      )}

      {/* Category */}
      <CategoryPill category={trend.category} />

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button
          onClick={() => onDeepDive(trend)}
          disabled={loadingDive === trend.id}
          style={{
            flex: 1, padding: "8px 0", borderRadius: 8, border: `1.5px solid ${ACCENT}`,
            background: ACCENT, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
            opacity: loadingDive === trend.id ? 0.7 : 1,
          }}
        >
          {loadingDive === trend.id ? "Loading..." : "Deep Dive"}
        </button>
        <button
          onClick={() => onSave(trend)}
          style={{
            width: 36, height: 36, borderRadius: 8,
            border: `1.5px solid ${trend.saved ? B.red : B.gray300}`,
            background: trend.saved ? "#fff0f0" : B.white,
            color: trend.saved ? B.red : B.gray400,
            fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title={trend.saved ? "Remove from watchlist" : "Save to watchlist"}
        >
          {trend.saved ? "♥" : "♡"}
        </button>
      </div>

      {/* ── Match DXC Solutions ── */}
      {!matchResult && (
        <button
          onClick={handleMatchSolutions}
          disabled={matchLoading}
          style={{
            marginTop: 4, width: "100%", padding: "7px 0", borderRadius: 8,
            border: `1.5px solid ${ACCENT}40`,
            background: matchLoading ? ACCENT_BG : "transparent",
            color: matchLoading ? ACCENT : B.gray500,
            fontSize: 11, fontWeight: 700, cursor: matchLoading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { if (!matchLoading) { e.currentTarget.style.background = ACCENT_BG; e.currentTarget.style.color = ACCENT; }}}
          onMouseLeave={e => { if (!matchLoading) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = B.gray500; }}}
        >
          {matchLoading ? (
            <>
              <span style={{ width: 10, height: 10, border: `2px solid ${ACCENT}40`, borderTop: `2px solid ${ACCENT}`, borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
              Matching...
            </>
          ) : (
            "Match Solutions"
          )}
        </button>
      )}

      {matchError && (
        <div style={{ fontSize: 11, color: "#b45309", background: "#fef3e2", border: "1px solid #b4530940", padding: "6px 10px", borderRadius: 6, marginTop: 4 }}>
          {matchError}
        </div>
      )}

      {matchResult && matchResult.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: ACCENT, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
            Matched Solutions
          </div>
          {matchResult.map((m, i) => (
            <div key={i} style={{
              display: "flex", gap: 8, alignItems: "flex-start",
              padding: "8px 10px", background: ACCENT_BG,
              borderLeft: `3px solid ${ACCENT}`, borderRadius: 4,
            }}>
              <span style={{
                flexShrink: 0, width: 16, height: 16, borderRadius: "50%",
                background: ACCENT, color: "#fff",
                fontSize: 9, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {i + 1}
              </span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, marginBottom: 2 }}>{m.solution}</div>
                <div style={{ fontSize: 10, color: B.gray600, lineHeight: 1.5 }}>{m.explanation}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RankedRow({ trend, rank, onDeepDive, onSave, loadingDive }) {
  return (
    <div
      onClick={() => onDeepDive(trend)}
      onMouseEnter={e => e.currentTarget.style.background = "#e8eef8"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 16px", borderRadius: 8, cursor: "pointer",
        transition: "background 0.15s", borderBottom: `1px solid ${B.gray100}`,
      }}
    >
      <div style={{ width: 28, textAlign: "center", fontSize: 13, fontWeight: 700, color: B.gray400, flexShrink: 0 }}>
        {rank}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: B.gray700, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {trend.topic}
        </div>
        <CategoryPill category={trend.category} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: B.green, flexShrink: 0 }}>
        {trend.momentum}
      </div>
      <MomentumBadge score={trend.score} />
      <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, flexShrink: 0, minWidth: 32, textAlign: "right" }}>
        {trend.score}/10
      </div>
      <button
        onClick={e => { e.stopPropagation(); onSave(trend); }}
        style={{
          width: 28, height: 28, borderRadius: 6, border: "none",
          background: "transparent", color: trend.saved ? B.red : B.gray300,
          fontSize: 14, cursor: "pointer", flexShrink: 0,
        }}
        title={trend.saved ? "Remove" : "Save"}
      >
        {trend.saved ? "♥" : "♡"}
      </button>
    </div>
  );
}

function DeepDiveModal({ trend, onClose, onSave, loading }) {
  if (!trend) return null;

  const paragraphs = trend.deep_dive
    ? trend.deep_dive.split(/\n{2,}/).filter(Boolean)
    : [];
  const labels = ["What It Is", "Enterprise Impact", "Action Plan"];

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: B.white, borderRadius: 16, width: "min(660px, 95vw)",
          maxHeight: "88vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${B.gray100}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <CategoryPill category={trend.category} />
                <MomentumBadge score={trend.score} />
                <span style={{ fontSize: 11, fontWeight: 700, color: B.green }}>{trend.momentum}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: B.gray700, lineHeight: 1.3, marginBottom: 6 }}>
                {trend.topic}
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {trend.tags?.map(t => <TagPill key={t} tag={t} />)}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: ACCENT }}>{trend.score}</div>
              <div style={{ fontSize: 10, color: B.gray400 }}>score /10</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 28px", flex: 1 }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: `3px solid ${ACCENT}`, borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }} />
              <div style={{ fontSize: 13, color: B.gray500 }}>Generating deep dive analysis...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : paragraphs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {paragraphs.map((para, i) => (
                <div key={i}>
                  {i < labels.length && (
                    <div style={{ fontSize: 11, fontWeight: 800, color: ACCENT, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                      {labels[i]}
                    </div>
                  )}
                  <div style={{ fontSize: 14, color: B.gray600, lineHeight: 1.7 }}>{para}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: B.gray500, lineHeight: 1.7 }}>{trend.summary}</div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", borderTop: `1px solid ${B.gray100}`, display: "flex", gap: 10, justifyContent: "space-between" }}>
          <button
            onClick={() => onSave(trend)}
            style={{
              padding: "9px 20px", borderRadius: 8,
              border: `1.5px solid ${trend.saved ? B.red : ACCENT}`,
              background: trend.saved ? "#fff0f0" : ACCENT_BG,
              color: trend.saved ? B.red : ACCENT,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}
          >
            {trend.saved ? "♥ Saved" : "♡ Save to Watchlist"}
          </button>
          {trend.url && (
            <a
              href={trend.url} target="_blank" rel="noreferrer"
              style={{
                padding: "9px 20px", borderRadius: 8,
                border: `1.5px solid ${B.gray300}`,
                background: B.white, color: B.gray600,
                fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none",
                display: "flex", alignItems: "center",
              }}
            >
              View Source
            </a>
          )}
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px", borderRadius: 8,
              border: `1.5px solid ${B.gray300}`, background: B.white,
              color: B.gray600, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const ALL_CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "llm_models",        label: "LLM Models" },
  { id: "dev_tools",         label: "Dev & Coding AI" },
  { id: "ai_agents",         label: "AI Agents" },
  { id: "open_source",       label: "Open Source AI" },
  { id: "ai_infrastructure", label: "AI Infrastructure" },
  { id: "enterprise_apps",   label: "Enterprise AI Apps" },
];

export default function Trends() {
  const [allTrends,    setAllTrends]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [category,     setCategory]     = useState("all");
  const [diveModal,    setDiveModal]    = useState(null);   // trend object
  const [loadingDive,  setLoadingDive]  = useState(null);   // trend id

  // Derive displayed trends client-side — no API call per tab click
  const trends = category === "all"
    ? allTrends
    : allTrends.filter(t => t.category === category);

  const loadTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrends(); // always fetch all
      setAllTrends(data.trends || []);
      setLastUpdated(data.last_updated);
    } catch (err) {
      setError(err.message || "Failed to load trends");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTrends(); }, [loadTrends]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const data = await refreshTrends();
      setAllTrends(data.trends || []);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      setError("Refresh failed: " + (err.message || "Unknown error"));
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeepDive = async (trend) => {
    if (trend.deep_dive) {
      setDiveModal(trend);
      return;
    }
    setDiveModal({ ...trend, deep_dive: null });
    setLoadingDive(trend.id);
    try {
      const data = await getDeepDive(trend.id);
      const updated = { ...trend, deep_dive: data.deep_dive };
      setAllTrends(prev => prev.map(t => t.id === trend.id ? updated : t));
      setDiveModal(updated);
    } catch (err) {
      setDiveModal(prev => prev ? { ...prev, deep_dive: `Analysis unavailable: ${err.message}` } : null);
    } finally {
      setLoadingDive(null);
    }
  };

  const handleSave = async (trend) => {
    try {
      if (trend.saved) {
        await unsaveTrend(trend.id);
        setAllTrends(prev => prev.map(t => t.id === trend.id ? { ...t, saved: false } : t));
        if (diveModal?.id === trend.id) setDiveModal(prev => prev ? { ...prev, saved: false } : null);
      } else {
        await saveTrend(trend.id);
        setAllTrends(prev => prev.map(t => t.id === trend.id ? { ...t, saved: true } : t));
        if (diveModal?.id === trend.id) setDiveModal(prev => prev ? { ...prev, saved: true } : null);
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const top3      = trends.slice(0, 3);
  const ranked    = trends.slice(3);
  const watchlist = allTrends.filter(t => t.saved);

  const relativeTime = (iso) => {
    if (!iso) return null;
    const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (diff < 1)  return "just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1100, margin: "0 auto" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: B.gray700, letterSpacing: -0.3, marginBottom: 4 }}>
            AI Trends
          </h1>
          <div style={{ fontSize: 13, color: B.gray400 }}>
            {lastUpdated
              ? `Updated ${relativeTime(lastUpdated)}`
              : "Live AI tools & model intelligence"}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          style={{
            padding: "9px 20px", borderRadius: 8,
            border: `1.5px solid ${ACCENT}`,
            background: refreshing ? ACCENT_BG : ACCENT,
            color: refreshing ? ACCENT : "#fff",
            fontSize: 13, fontWeight: 700, cursor: refreshing ? "not-allowed" : "pointer",
            opacity: (refreshing || loading) ? 0.7 : 1,
            transition: "all 0.15s",
          }}
        >
          {refreshing ? "Refreshing..." : "Refresh Trends"}
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            style={{
              padding: "6px 14px", borderRadius: 999,
              border: `1.5px solid ${category === cat.id ? ACCENT : B.gray200}`,
              background: category === cat.id ? ACCENT : B.white,
              color: category === cat.id ? "#fff" : B.gray500,
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: B.red }}>
          {error.includes("PERPLEXITY") || error.includes("key")
            ? "Configure PERPLEXITY_API_KEY to enable live trends"
            : error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: 52, background: B.gray50, borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && trends.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: B.gray400 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📡</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: B.gray600 }}>No trends loaded yet</div>
          <div style={{ fontSize: 13, marginBottom: 24 }}>Click Refresh to fetch the latest AI trend intelligence</div>
          <button
            onClick={handleRefresh}
            style={{
              padding: "12px 28px", borderRadius: 8,
              background: ACCENT, color: "#fff",
              fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer",
            }}
          >
            Load Trends Now
          </button>
        </div>
      )}

      {/* Top 3 featured cards */}
      {!loading && top3.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: B.gray400, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
            Top Signals
          </div>
          <div className="trends-top3" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 32,
          }}>
            <style>{`
              @media (max-width: 768px) {
                .trends-top3 { grid-template-columns: 1fr !important; }
              }
            `}</style>
            {top3.map((t, i) => (
              <TopCard
                key={t.id}
                trend={t}
                rank={i + 1}
                onDeepDive={handleDeepDive}
                onSave={handleSave}
                loadingDive={loadingDive}
              />
            ))}
          </div>
        </>
      )}

      {/* Ranked list */}
      {!loading && ranked.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: B.gray400, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
            Ranked Intelligence
          </div>
          <div style={{ background: B.white, border: `1.5px solid ${B.gray200}`, borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
            {ranked.map((t, i) => (
              <RankedRow
                key={t.id}
                trend={t}
                rank={i + 4}
                onDeepDive={handleDeepDive}
                onSave={handleSave}
                loadingDive={loadingDive}
              />
            ))}
          </div>
        </>
      )}

      {/* Watchlist */}
      {watchlist.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: B.gray400, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
            Your Watchlist ({watchlist.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[...watchlist].sort((a, b) => b.score - a.score).map(t => (
              <div key={t.id} style={{
                background: B.white, border: `1.5px solid ${B.gray200}`, borderRadius: 10,
                padding: "12px 16px", display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: B.gray700, marginBottom: 4 }}>{t.topic}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <CategoryPill category={t.category} />
                    <span style={{ fontSize: 11, color: B.gray400 }}>{t.score}/10</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeepDive(t)}
                  style={{
                    padding: "6px 14px", borderRadius: 6, border: `1px solid ${ACCENT}`,
                    background: ACCENT_BG, color: ACCENT, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Deep Dive
                </button>
                <button
                  onClick={() => handleSave(t)}
                  style={{
                    width: 28, height: 28, borderRadius: 6, border: `1px solid #fca5a5`,
                    background: "#fff0f0", color: B.red, fontSize: 13, cursor: "pointer",
                  }}
                  title="Remove from watchlist"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Deep Dive Modal */}
      {diveModal && (
        <DeepDiveModal
          trend={diveModal}
          loading={loadingDive === diveModal?.id}
          onClose={() => setDiveModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
