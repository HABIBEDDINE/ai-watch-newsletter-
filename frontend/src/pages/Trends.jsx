import { useState, useEffect, useCallback, useContext } from "react";
import { getTrends, getDeepDive, getPersonalizedTrends, getRecommendations, getMonthlySummary } from "../services/api";
import { useSaved } from "../hooks/useSaved";
import { AuthContext } from "../context/AuthContext";
import TrendsOnboarding from "../components/TrendsOnboarding";
import CategoryCombobox from "../components/CategoryCombobox";
import { Bookmark, LayoutGrid, List } from "lucide-react";

const ACCENT = "var(--accent)";
const ACCENT_BG = "var(--accent-dim)";

const ROLE_LABELS = {
  cto: "CTO / Technical Lead",
  innovation_manager: "Innovation Manager",
  strategy_director: "Strategy Director",
  other: "General",
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
  dev_tools:         ["var(--accent-hover)","var(--accent-dim)"],
  ai_agents:         ["#7c3aed","var(--purple-light)"],
  open_source:       ["#047857","var(--delta-bg)"],
  ai_infrastructure: ["#b45309","var(--amber-light)"],
  enterprise_apps:   ["#be185d","var(--red-light)"],
};

function getMomentumStyle(score) {
  if (score >= 9) return { label: "EXPLOSIVE", bg: "var(--delta-bg)",  color: "var(--delta-color)" };
  if (score >= 7) return { label: "RISING",    bg: "var(--amber-light)",  color: "var(--amber)" };
  return             { label: "GROWING",    bg: "var(--accent-dim)",   color: "var(--accent)"  };
}

function formatDate(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function SkeletonCard() {
  return (
    <div style={{ background: "var(--card-bg)", border: "1.5px solid var(--border-color)", borderRadius: 12, padding: 20 }}>
      {[80, 60, 100, 100, 40].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? 20 : i === 2 ? 14 : i === 3 ? 14 : 12,
          width: `${w}%`,
          background: "var(--surface)",
          borderRadius: 4,
          marginBottom: 10,
          animation: "pulse 1.5s ease-in-out infinite",
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}

function RankCircle({ rank }) {
  const isTop3 = rank <= 3;
  return (
    <div style={{
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: isTop3 ? "var(--accent)" : "var(--surface)",
      color: isTop3 ? "#fff" : "var(--text-muted)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
      fontWeight: 700,
      flexShrink: 0,
    }}>
      {rank}
    </div>
  );
}

function CategoryPill({ category }) {
  const [color, bg] = CATEGORY_COLORS[category] || ["var(--text-secondary)", "var(--surface)"];
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
      background: "var(--surface)", color: "var(--text-secondary)", letterSpacing: 0.2,
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

// Channel badges for multi-source signals
const CHANNEL_CONFIG = {
  NL: { label: "Newsletter", color: "var(--accent)", bg: "var(--accent-dim)", emoji: "📰" },
  HN: { label: "HackerNews", color: "#E35B1A", bg: "#fff3ee", emoji: "🔶" },
  RD: { label: "Reddit", color: "#FF4500", bg: "#fff0ec", emoji: "👥" },
  AX: { label: "arXiv", color: "#B31B1B", bg: "#fef0f0", emoji: "🔬" },
  GH: { label: "GitHub", color: "#238636", bg: "#e6f4ea", emoji: "⭐" },
  OFFICIAL: { label: "Official", color: "var(--accent)", bg: "var(--accent-dim)", emoji: "✓" },
  RESEARCH: { label: "Research", color: "#B31B1B", bg: "#fef0f0", emoji: "📚" },
  MEDIA: { label: "Media", color: "#7c3aed", bg: "#ede9fe", emoji: "📰" },
  YOUTUBE: { label: "YouTube", color: "#FF0000", bg: "#fee2e2", emoji: "▶️" },
};

// Trend trigger badges
const TRIGGER_CONFIG = {
  NEW_RELEASE:  { icon: '🚀', label: 'New Release',  color: 'var(--accent)', bg: 'var(--accent-dim)' },
  BENCHMARK:    { icon: '📊', label: 'Benchmark',    color: 'var(--accent)', bg: '#ede9fe' },
  FUNDING:      { icon: '💰', label: 'Funding',      color: '#059669', bg: '#d1fae5' },
  REGULATION:   { icon: '⚖️', label: 'Regulation',   color: '#d97706', bg: '#fef3c7' },
  RESEARCH:     { icon: '🔬', label: 'Research',     color: '#B31B1B', bg: '#fef0f0' },
  VIRAL:        { icon: '🔥', label: 'Viral',        color: '#E35B1A', bg: '#fff3ee' },
};

// Format publication date for display
function formatPublishedDate(dateStr) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}

function SignalBadge({ channel }) {
  const config = CHANNEL_CONFIG[channel] || CHANNEL_CONFIG.NL;
  return (
    <span
      title={config.label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        padding: "2px 7px",
        borderRadius: "20px",
        fontSize: "10px",
        fontWeight: "600",
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.color}22`,
      }}
    >
      {config.emoji} {channel}
    </span>
  );
}

function TopCard({ trend, rank, onDeepDive, onSave, loadingDive, isSaved, userRole }) {
  const detectedDate = formatDate(trend.detected_at);

  return (
    <div className="trend-card" style={{
      background: "var(--card-bg)",
      border: rank === 1 ? "1.5px solid var(--accent)" : "1.5px solid var(--border-color)",
      borderRadius: 12,
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      position: "relative",
      boxShadow: rank === 1 ? "0 4px 20px rgba(255, 180, 118,0.15)" : "none",
      transition: "box-shadow 0.2s",
      width: "100%",
      minWidth: 0,
      overflow: "hidden",
    }}>
      {/* Rank + Score row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <RankCircle rank={rank} />
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--purple)", lineHeight: 1 }}>{trend.score}</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>/10</div>
        </div>
      </div>

      {/* Date + Momentum + Verified Badge + Trigger */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        {/* Verified source badge */}
        {trend.primary_source?.is_verified && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '10px',
            fontWeight: '600',
            color: 'var(--accent)',
            background: 'var(--accent-dim)',
            padding: '2px 7px',
            borderRadius: '10px',
            border: '1px solid #bfdbfe',
          }}>
            ✓ {trend.primary_source?.org || 'Verified'}
          </span>
        )}
        {/* Publication date */}
        {trend.primary_source?.published && (
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {formatPublishedDate(trend.primary_source.published)}
          </span>
        )}
        {!trend.primary_source?.published && detectedDate && (
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>
            {detectedDate}
          </span>
        )}
        <MomentumBadge score={trend.score} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "var(--delta-color)" }}>{trend.momentum}</span>
        {/* Trend trigger badge */}
        {trend.trend_trigger && TRIGGER_CONFIG[trend.trend_trigger] && (
          <span style={{
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 8px',
            borderRadius: '10px',
            background: TRIGGER_CONFIG[trend.trend_trigger].bg,
            color: TRIGGER_CONFIG[trend.trend_trigger].color,
          }}>
            {TRIGGER_CONFIG[trend.trend_trigger].icon}{' '}
            {TRIGGER_CONFIG[trend.trend_trigger].label}
          </span>
        )}
      </div>

      {/* Topic */}
      <div className="trend-card-title" style={{
        fontSize: 15,
        fontWeight: 800,
        color: "var(--text-primary)",
        lineHeight: 1.3,
        wordWrap: "break-word",
        overflowWrap: "break-word",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {trend.topic}
      </div>

      {/* Role insight (if personalized) */}
      {trend.role_insight && (
        <div style={{
          fontSize: 11, color: "var(--accent)", fontStyle: "italic",
          background: "var(--accent-dim)", padding: "6px 10px", borderRadius: 6,
        }}>
          {trend.role_insight}
        </div>
      )}

      {/* Summary */}
      <div style={{
        fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55,
        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {trend.summary}
      </div>

      {/* Why trending */}
      {trend.why_trending && (
        <div style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
          padding: '6px 10px',
          background: 'var(--bg-hover)',
          borderRadius: '6px',
          borderLeft: '3px solid #E35B1A',
        }}>
          {trend.why_trending}
        </div>
      )}

      {/* Tags */}
      {trend.tags?.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {trend.tags.map(t => <TagPill key={t} tag={t} />)}
        </div>
      )}

      {/* Multiple source chips */}
      {trend.all_sources && trend.all_sources.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-color)',
        }}>
          {trend.all_sources.slice(0, 4).map((src, i) => (
            <a
              key={i}
              href={src.url}
              target="_blank"
              rel="noreferrer"
              title={src.title}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '20px',
                fontSize: '10px',
                fontWeight: '600',
                textDecoration: 'none',
                background: src.is_verified ? 'var(--accent-dim)' : 'var(--bg-hover)',
                color: src.is_verified ? 'var(--accent)' : 'var(--text-muted)',
                border: `1px solid ${src.is_verified ? '#bfdbfe' : 'var(--border-color)'}`,
              }}
              onClick={e => e.stopPropagation()}
            >
              {src.is_verified && '✓ '}
              {src.org || src.source}
            </a>
          ))}
          {trend.all_sources.length > 4 && (
            <span style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              padding: '2px 6px',
            }}>
              +{trend.all_sources.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Channel signals + Category */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {(trend.channels || []).map(ch => (
          <SignalBadge key={ch} channel={ch} />
        ))}
        <CategoryPill category={trend.category} />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 4, width: "100%", boxSizing: "border-box" }}>
        <button
          onClick={() => onDeepDive(trend)}
          disabled={loadingDive === trend.id}
          style={{
            flex: 1, padding: "8px 0", borderRadius: 8, border: `1.5px solid var(--accent)`,
            background: "var(--accent)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
            opacity: loadingDive === trend.id ? 0.7 : 1,
            minWidth: 0, minHeight: 44, boxSizing: "border-box",
          }}
        >
          {loadingDive === trend.id ? "Loading..." : "Deep Dive"}
        </button>
        <button
          onClick={() => onSave(trend)}
          style={{
            width: 44, height: 44, borderRadius: 8, flexShrink: 0,
            border: isSaved ? "1.5px solid var(--accent)" : "1.5px solid var(--border-color)",
            background: isSaved ? "var(--accent-dim)" : "var(--card-bg)",
            color: isSaved ? "var(--accent)" : "var(--text-muted)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxSizing: "border-box",
          }}
          title={isSaved ? "Remove from saved" : "Save trend"}
        >
          <Bookmark size={16} strokeWidth={2} fill={isSaved ? "var(--accent)" : "none"} />
        </button>
      </div>
    </div>
  );
}

function RankedRow({ trend, rank, onDeepDive, onSave, loadingDive, isSaved }) {
  const detectedDate = formatDate(trend.detected_at);
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      onClick={() => onDeepDive(trend)}
      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      style={{
        display: "flex", alignItems: "center", gap: isNarrow ? 8 : 12,
        padding: isNarrow ? "12px 12px" : "12px 16px",
        minHeight: isNarrow ? 56 : 48,
        borderRadius: 8, cursor: "pointer",
        transition: "background 0.15s", borderBottom: "1px solid var(--surface)",
      }}
    >
      <RankCircle rank={rank} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: isNarrow ? 12 : 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: isNarrow ? 2 : 1, WebkitBoxOrient: "vertical",
        }}>
          {trend.topic}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <CategoryPill category={trend.category} />
          {/* Verified source badge */}
          {trend.primary_source?.is_verified && !isNarrow && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              fontSize: '9px',
              fontWeight: '600',
              color: 'var(--accent)',
              background: 'var(--accent-dim)',
              padding: '1px 5px',
              borderRadius: '8px',
            }}>
              ✓ {trend.primary_source?.org?.split(' ')[0] || 'Verified'}
            </span>
          )}
          {/* Trend trigger badge */}
          {trend.trend_trigger && TRIGGER_CONFIG[trend.trend_trigger] && !isNarrow && (
            <span style={{
              fontSize: '9px',
              fontWeight: '600',
              padding: '1px 5px',
              borderRadius: '8px',
              background: TRIGGER_CONFIG[trend.trend_trigger].bg,
              color: TRIGGER_CONFIG[trend.trend_trigger].color,
            }}>
              {TRIGGER_CONFIG[trend.trend_trigger].icon}
            </span>
          )}
          {!isNarrow && (trend.channels || []).slice(0, 2).map(ch => (
            <SignalBadge key={ch} channel={ch} />
          ))}
          {detectedDate && !isNarrow && (
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{detectedDate}</span>
          )}
        </div>
      </div>
      {/* Hide momentum text on narrow screens */}
      {!isNarrow && (
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--delta-color)", flexShrink: 0 }}>
          {trend.momentum}
        </div>
      )}
      {/* Hide momentum badge on narrow screens */}
      {!isNarrow && <MomentumBadge score={trend.score} />}
      <div style={{ fontSize: isNarrow ? 12 : 13, fontWeight: 700, color: "var(--purple)", flexShrink: 0, minWidth: 32, textAlign: "right" }}>
        {trend.score}/10
      </div>
      <button
        onClick={e => { e.stopPropagation(); onSave(trend); }}
        style={{
          width: isNarrow ? 36 : 28, height: isNarrow ? 36 : 28, borderRadius: 6, border: "none",
          background: "transparent", color: isSaved ? "var(--accent)" : "var(--text-muted)",
          cursor: "pointer", flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        title={isSaved ? "Remove" : "Save"}
      >
        <Bookmark size={14} strokeWidth={2} fill={isSaved ? "var(--accent)" : "none"} />
      </button>
    </div>
  );
}

// Parse legacy markdown deep dive into sections
function parseMarkdownDeepDive(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;

  const sections = {};

  // Extract "What It Is" section
  const whatMatch = rawText.match(/#{1,3}\s*\d*\.?\s*What It Is\s*([\s\S]*?)(?=#{1,3}|\n\n\n|$)/i);
  if (whatMatch) sections.what_it_is = whatMatch[1].trim();

  // Extract "Enterprise Impact" section
  const impactMatch = rawText.match(/#{1,3}\s*\d*\.?\s*Enterprise Impact\s*([\s\S]*?)(?=#{1,3}|\n\n\n|$)/i);
  if (impactMatch) sections.enterprise_impact = impactMatch[1].trim();

  // Extract "Action Plan" section
  const actionMatch = rawText.match(/#{1,3}\s*\d*\.?\s*Action Plan\s*([\s\S]*?)(?=#{1,3}|\n\n\n|$)/i);
  if (actionMatch) sections.action_plan = actionMatch[1].trim();

  return Object.keys(sections).length > 0 ? sections : null;
}

// Clean markdown formatting from text
function cleanText(text) {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);
  return text
    .replace(/^#{1,3}\s*\d*\.?\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .trim();
}

// Section header component
function SectionHeader({ title }) {
  return (
    <div style={{
      fontSize: 11,
      fontWeight: 700,
      color: "var(--accent)",
      letterSpacing: 1.5,
      textTransform: "uppercase",
      marginBottom: 10,
      paddingBottom: 8,
      borderBottom: "1px solid var(--border)",
    }}>
      {title}
    </div>
  );
}

// Section content component
function SectionContent({ text }) {
  return (
    <p style={{
      fontSize: 14,
      color: "var(--text-primary)",
      lineHeight: 1.8,
      margin: 0,
      whiteSpace: "pre-line",
    }}>
      {cleanText(text)}
    </p>
  );
}

// Perplexity-style sources component
function SourcesSection({ sources }) {
  console.log('[SourcesSection] Received sources:', sources);
  if (!sources || sources.length === 0) {
    console.log('[SourcesSection] No sources to display');
    return null;
  }

  return (
    <div style={{ marginTop: 28 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--text-muted)",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 12,
      }}>
        Sources
      </div>

      {/* Source chips row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {sources.map((source, i) => (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            title={source.title}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              background: "var(--hover-bg)",
              border: "1px solid var(--border)",
              borderRadius: 20,
              textDecoration: "none",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.background = "var(--accent-dim)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.background = "var(--hover-bg)";
            }}
          >
            <div style={{
              width: 16, height: 16, borderRadius: "50%",
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: "#fff", flexShrink: 0,
            }}>
              {source.number || i + 1}
            </div>
            <span style={{
              fontSize: 12, fontWeight: 500, color: "var(--text-secondary)",
              maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {source.publisher}
            </span>
          </a>
        ))}
      </div>

      {/* Full source cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sources.map((source, i) => (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "12px 14px",
              background: "var(--card-bg)", border: "1px solid var(--border)",
              borderRadius: 8, textDecoration: "none", transition: "border-color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: "var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0, marginTop: 1,
            }}>
              {source.number || i + 1}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
                marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {source.title}
              </div>
              {source.snippet && (
                <div style={{
                  fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 4,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {source.snippet}
                </div>
              )}
              <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 500 }}>
                {source.publisher}
              </div>
            </div>
            <span style={{ fontSize: 13, color: "var(--text-muted)", flexShrink: 0, marginTop: 2 }}>→</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// Deep dive content renderer - handles both JSON and legacy markdown
function DeepDiveContent({ deepDive }) {
  console.log('[DeepDiveContent] Input type:', typeof deepDive);
  console.log('[DeepDiveContent] Input value:', deepDive);

  if (!deepDive) return null;

  // Check if it's JSON object or string
  let data = deepDive;
  if (typeof deepDive === 'string') {
    console.log('[DeepDiveContent] Parsing string...');
    // Try to parse as JSON first
    try {
      data = JSON.parse(deepDive);
      console.log('[DeepDiveContent] Parsed JSON:', data);
    } catch (e) {
      console.log('[DeepDiveContent] JSON parse failed:', e.message);
      // It's legacy markdown, parse it
      data = parseMarkdownDeepDive(deepDive);
      if (!data) {
        // Fallback to raw text display
        return (
          <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
            {cleanText(deepDive)}
          </div>
        );
      }
    }
  }

  console.log('[DeepDiveContent] Final data keys:', Object.keys(data || {}));
  console.log('[DeepDiveContent] Sources:', data?.sources);

  // Extract sources - handle both direct and nested structures
  const sources = data?.sources || data?.deep_dive?.sources || [];
  console.log('[DeepDiveContent] Extracted sources:', sources);

  return (
    <div>
      {/* What It Is */}
      {data.what_it_is && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="What It Is" />
          <SectionContent text={data.what_it_is} />
        </div>
      )}

      {/* Enterprise Impact */}
      {data.enterprise_impact && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Enterprise Impact" />
          <SectionContent text={data.enterprise_impact} />
        </div>
      )}

      {/* Action Plan */}
      {data.action_plan && (
        <div style={{ marginBottom: 24 }}>
          <SectionHeader title="Action Plan" />
          <SectionContent text={data.action_plan} />
        </div>
      )}

      {/* Sources - with debug display */}
      <div style={{ marginTop: 28 }}>
        <div style={{ height: 1, background: "var(--border)", marginBottom: 20 }} />
        <div style={{
          fontSize: 11, fontWeight: 700, color: "var(--text-muted)",
          letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14,
        }}>
          Sources & Further Reading
        </div>

        {sources && sources.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16 }}>
            {sources.map((src, i) => {
              const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${src.title || ''} ${src.publisher || ''}`)}`;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 16px",
                    background: "var(--card-bg)", border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: 6,
                    background: "var(--surface)",
                    color: "var(--text-muted)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {src.number || i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
                      marginBottom: 4,
                    }}>
                      {src.title || 'Source'}
                    </div>
                    {src.snippet && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 4 }}>
                        {src.snippet}
                      </div>
                    )}
                    <a
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Search for this article on Google"
                      style={{
                        fontSize: 11,
                        color: "var(--accent)",
                        fontWeight: 500,
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {src.publisher || 'Publisher'} ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
            No sources available.
          </p>
        )}
      </div>
    </div>
  );
}

function DeepDiveModal({ trend, onClose, onSave, loading, isSaved }) {
  const [isNarrow, setIsNarrow] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!trend) return null;

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: isNarrow ? 8 : 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--card-bg)", borderRadius: isNarrow ? 12 : 16, width: isNarrow ? "100%" : "min(700px, 95vw)",
          maxHeight: isNarrow ? "95vh" : "88vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ padding: isNarrow ? "16px 16px 14px" : "24px 28px 20px", borderBottom: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                <CategoryPill category={trend.category} />
                <MomentumBadge score={trend.score} />
                {!isNarrow && (
                  <>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--delta-color)" }}>{trend.momentum}</span>
                    {trend.detected_at && (
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                        {formatDate(trend.detected_at)}
                      </span>
                    )}
                  </>
                )}
              </div>
              <div style={{ fontSize: isNarrow ? 17 : 20, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.3, marginBottom: 6, wordBreak: "break-word" }}>
                {trend.topic}
              </div>
              {!isNarrow && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {trend.tags?.map(t => <TagPill key={t} tag={t} />)}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: isNarrow ? 24 : 28, fontWeight: 800, color: "var(--purple)" }}>{trend.score}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>score /10</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: isNarrow ? "16px" : "24px 28px", flex: 1 }}>
          {loading || trend._generating ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "40px 0" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "3px solid var(--accent)", borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }} />
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                {trend._generating ? "Deep dive is being prepared, please wait..." : "Generating deep dive analysis..."}
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : trend.deep_dive ? (
            <DeepDiveContent deepDive={trend.deep_dive} />
          ) : (
            <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7 }}>{trend.summary}</div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: isNarrow ? "12px 16px" : "16px 28px",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: isNarrow ? "column" : "row",
          gap: 10,
          justifyContent: "space-between"
        }}>
          <button
            onClick={() => onSave(trend)}
            style={{
              padding: isNarrow ? "10px 16px" : "9px 20px", borderRadius: 8,
              border: "1.5px solid var(--accent)",
              background: "var(--accent-dim)",
              color: "var(--accent)",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              width: isNarrow ? "100%" : "auto",
            }}
          >
            <Bookmark size={14} strokeWidth={2} fill={isSaved ? "var(--accent)" : "none"} />
            {isSaved ? "Saved" : "Save"}
          </button>
          <div style={{ display: "flex", gap: 10, width: isNarrow ? "100%" : "auto" }}>
            {trend.url && (
              <a
                href={trend.url} target="_blank" rel="noreferrer"
                style={{
                  padding: isNarrow ? "10px 16px" : "9px 20px", borderRadius: 8,
                  border: "1.5px solid var(--border-color)",
                  background: "var(--card-bg)", color: "var(--text-secondary)",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flex: isNarrow ? 1 : "none",
                }}
              >
                View Source
              </a>
            )}
            <button
              onClick={onClose}
              style={{
                padding: isNarrow ? "10px 16px" : "9px 20px", borderRadius: 8,
                border: "1.5px solid var(--border-color)", background: "var(--card-bg)",
                color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                flex: isNarrow ? 1 : "none",
              }}
            >
              Close
            </button>
          </div>
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

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

export default function Trends() {
  const { user } = useContext(AuthContext);
  const { saved, toggleSave } = useSaved();
  const [allTrends,         setAllTrends]         = useState([]);
  const [personalizedTrends, setPersonalizedTrends] = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [, setLoadingPersonalized] = useState(false);
  const [error,             setError]             = useState(null);
  const [lastUpdated,       setLastUpdated]       = useState(null);
  const [category,          setCategory]          = useState("all");
  const [diveModal,         setDiveModal]         = useState(null);
  const [loadingDive,       setLoadingDive]       = useState(null);
  const [showOnboarding,    setShowOnboarding]    = useState(false);
  const [isMobile,          setIsMobile]          = useState(window.innerWidth < 768);
  const [recommendations,   setRecommendations]   = useState([]);
  const [loadingRecs,       setLoadingRecs]       = useState(false);
  const [period,            setPeriod]            = useState("month");
  const [monthlySummary,    setMonthlySummary]    = useState(null);
  const [summaryCollapsed,  setSummaryCollapsed]  = useState(() => {
    return localStorage.getItem("aiwatch_trends_summary_collapsed") === "true";
  });
  const [trendsViewMode, setTrendsViewMode] = useState(() => {
    return localStorage.getItem("aiwatch_trends_view") || "list";
  });

  // Track window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if user needs onboarding
  useEffect(() => {
    if (user && !user.onboarding_completed && !localStorage.getItem("trends_onboarding_skipped")) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Derive displayed trends client-side
  const trends = category === "all"
    ? allTrends
    : allTrends.filter(t => t.category === category);

  const loadTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrends(null, period);
      setAllTrends(data.trends || []);
      setLastUpdated(data.last_updated);
    } catch (err) {
      setError(err.message || "Failed to load trends");
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Fetch monthly summary on mount
  useEffect(() => {
    getMonthlySummary()
      .then(setMonthlySummary)
      .catch(() => setMonthlySummary(null));
  }, []);

  const loadPersonalizedTrends = useCallback(async () => {
    if (!user?.role) return;
    setLoadingPersonalized(true);
    try {
      const data = await getPersonalizedTrends(user.role, user.trend_topics || []);
      setPersonalizedTrends(data.trends || []);
    } catch (err) {
      console.warn("Failed to load personalized trends:", err);
    } finally {
      setLoadingPersonalized(false);
    }
  }, [user?.role, user?.trend_topics]);

  useEffect(() => { loadTrends(); }, [loadTrends]);
  useEffect(() => {
    if (user?.role && user?.onboarding_completed) {
      loadPersonalizedTrends();
    }
  }, [loadPersonalizedTrends, user?.role, user?.onboarding_completed]);

  // Fetch role-based recommendations
  useEffect(() => {
    if (!user?.role) return;
    const fetchRecs = async () => {
      setLoadingRecs(true);
      try {
        const data = await getRecommendations(user.role);
        setRecommendations(data.trends || []);
      } catch (err) {
        console.warn("Failed to load recommendations:", err);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecs();
  }, [user?.role]);

  const handleDeepDive = async (trend, isRetry = false) => {
    // Check if we have valid cached data (from deep_dive or deepdive column)
    if (!isRetry) {
      // Try trend.deep_dive first, then trend.deepdive (raw DB column name)
      let cached = trend.deep_dive || trend.deepdive;

      if (cached) {
        // Parse if string
        if (typeof cached === 'string') {
          try {
            cached = JSON.parse(cached);
          } catch (e) {
            cached = null;
          }
        }
        // Use cache if it has valid structure with sources
        if (cached && typeof cached === 'object' && cached.sources && cached.sources.length > 0) {
          setDiveModal({ ...trend, deep_dive: cached });
          return;
        }
      }

      // Also check deepdive_status - if 'done', the API will return cached data instantly
      if (trend.deepdive_status === 'done' && trend.deepdive) {
        try {
          const parsed = typeof trend.deepdive === 'string' ? JSON.parse(trend.deepdive) : trend.deepdive;
          if (parsed && parsed.sources) {
            setDiveModal({ ...trend, deep_dive: parsed });
            return;
          }
        } catch (e) {
          // Fall through to API call
        }
      }
    }

    setDiveModal({ ...trend, deep_dive: null });
    setLoadingDive(trend.id);
    try {
      const data = await getDeepDive(trend.id, user?.role);

      // Handle "generating" status - poll until complete
      if (data.status === "generating") {
        setDiveModal({ ...trend, deep_dive: null, _generating: true });
        setTimeout(() => {
          handleDeepDive(trend, true);  // Retry with isRetry flag
        }, (data.retry_in || 15) * 1000);
        return;
      }

      const updated = { ...trend, deep_dive: data.deep_dive, deepdive_status: 'done' };
      setAllTrends(prev => prev.map(t => t.id === trend.id ? updated : t));
      setPersonalizedTrends(prev => prev.map(t => t.id === trend.id ? updated : t));
      setRecommendations(prev => prev.map(t => t.id === trend.id ? updated : t));
      setDiveModal(updated);
    } catch (err) {
      setDiveModal(prev => prev ? { ...prev, deep_dive: `Analysis unavailable: ${err.message}` } : null);
    } finally {
      setLoadingDive(null);
    }
  };

  const handleSave = (trend) => {
    toggleSave("trend", trend.id, {
      topic: trend.topic, category: trend.category,
      trend_score: trend.score, summary: trend.summary,
    });
  };

  const handleOnboardingComplete = ({ role, topics }) => {
    setShowOnboarding(false);
    // Reload personalized trends with new preferences
    loadPersonalizedTrends();
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    localStorage.setItem("trends_onboarding_skipped", "true");
  };

  const top3   = trends.slice(0, 3);
  const ranked = trends.slice(3);

  return (
    <div className="page-container" style={{
      padding: isMobile ? "16px" : "24px 28px",
      paddingBottom: isMobile ? "max(24px, env(safe-area-inset-bottom))" : "24px",
      maxWidth: 1100,
      margin: "0 auto",
      overflowX: "hidden",
      boxSizing: "border-box",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .filter-chips-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <TrendsOnboarding
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      {/* Header */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "flex-start",
        marginBottom: 24,
        gap: isMobile ? 16 : 12,
        minWidth: 0,
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: -0.3, marginBottom: 4 }}>
            AI Trends
          </h1>
          <div style={{ fontSize: isMobile ? 12 : 13, color: "var(--text-muted)" }}>
            Updated daily at 8:00 AM UTC
            {lastUpdated && !isMobile && (
              <span style={{ marginLeft: 8, color: "var(--text-secondary)" }}>
                • Last refresh: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        {user && !user.onboarding_completed && (
          <button
            onClick={() => setShowOnboarding(true)}
            style={{
              padding: isMobile ? "12px 16px" : "9px 20px", borderRadius: 8,
              border: "1.5px solid var(--accent)",
              background: "var(--accent-dim)",
              color: "var(--accent)",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              width: isMobile ? "100%" : "auto",
              textAlign: "center",
              minHeight: 44, boxSizing: "border-box",
              flexShrink: 0, whiteSpace: "nowrap",
            }}
          >
            Personalize Trends
          </button>
        )}
      </div>

      {/* Recommended for your role */}
      {user && recommendations.length > 0 && (
        <div style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "20px 24px",
          marginBottom: 24,
        }}>
          {/* Section header */}
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 16,
          }}>
            Recommended for {ROLE_LABELS[user?.role] || "You"}
          </div>

          {/* Horizontal scroll container */}
          <div
            className="recommendations-scroll"
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style>{`
              .recommendations-scroll::-webkit-scrollbar { display: none; }
            `}</style>
            {loadingRecs ? (
              // Skeleton cards
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                  width: 240,
                  minWidth: 240,
                  height: 160,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  animation: "pulse 1.5s ease-in-out infinite",
                }} />
              ))
            ) : (
              recommendations.slice(0, 5).map((rec, i) => {
                const momentum = getMomentumStyle(rec.score);
                return (
                  <div
                    key={rec.id || i}
                    onClick={() => handleDeepDive(rec)}
                    style={{
                      width: 240,
                      minWidth: 240,
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 16,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      transition: "box-shadow 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Top row: Category pill + Score badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <CategoryPill category={rec.category} />
                      <span style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "var(--accent)",
                      }}>
                        {rec.role_score || rec.score}
                      </span>
                    </div>

                    {/* Title with role badge */}
                    <div style={{ flex: 1, minHeight: 0 }}>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        lineHeight: 1.35,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                        {rec.topic}
                      </div>
                    </div>

                    {/* Bottom row: Momentum + Deep Dive button */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: momentum.bg,
                        color: momentum.color,
                        letterSpacing: 0.8,
                      }}>
                        {momentum.label}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeepDive(rec); }}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--accent)",
                          background: "transparent",
                          border: "1px solid var(--accent)",
                          borderRadius: 6,
                          padding: "4px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Deep Dive →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Monthly Summary Card */}
      {monthlySummary && (
        <div style={{
          background: "linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-primary) 100%)",
          borderLeft: "4px solid var(--accent)",
          borderRadius: 12,
          padding: summaryCollapsed ? "16px 24px" : "20px 24px",
          marginBottom: 24,
          border: "1px solid var(--border-color)",
        }}>
          {/* Header */}
          <div
            onClick={() => {
              const newState = !summaryCollapsed;
              setSummaryCollapsed(newState);
              localStorage.setItem("aiwatch_trends_summary_collapsed", String(newState));
            }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <div style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 18 }}>🔥</span>
              What's trending in AI this month
            </div>
            <button style={{
              background: "none",
              border: "none",
              fontSize: 18,
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px 8px",
            }}>
              {summaryCollapsed ? "+" : "−"}
            </button>
          </div>

          {/* Content (collapsible) */}
          {!summaryCollapsed && (
            <>
              <div style={{
                height: 1,
                background: "var(--border-color)",
                margin: "12px 0 16px",
              }} />

              {/* Summary text */}
              <p style={{
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                margin: "0 0 16px",
              }}>
                {monthlySummary.summary}
              </p>

              {/* Top themes pills */}
              {monthlySummary.top_themes && monthlySummary.top_themes.length > 0 && (
                <div style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}>
                  {monthlySummary.top_themes.map((theme, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "4px 12px",
                        borderRadius: 20,
                        border: "1px solid var(--accent)",
                        color: "var(--accent)",
                        background: "transparent",
                      }}
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div style={{
                fontSize: 11,
                color: "var(--text-muted)",
              }}>
                Updated daily · Powered by AI Watch Intelligence
              </div>
            </>
          )}
        </div>
      )}

      {/* Filter row: Category + Period dropdowns */}
      <div style={{
        display: "flex",
        gap: 12,
        marginBottom: 24,
        flexWrap: isMobile ? "wrap" : "nowrap",
      }}>
        <CategoryCombobox
          selected={category}
          onSelect={setCategory}
          categories={ALL_CATEGORIES.map(cat => ({ id: cat.id, label: cat.label }))}
          isMobile={isMobile}
          fullWidth={isMobile}
          placeholder="All Categories"
        />
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            padding: "10px 14px",
            fontSize: 13,
            fontWeight: 500,
            border: "1px solid var(--border-color)",
            borderRadius: 8,
            background: "var(--card-bg)",
            color: "var(--text-primary)",
            cursor: "pointer",
            minWidth: isMobile ? "100%" : 140,
            outline: "none",
          }}
        >
          {PERIOD_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "var(--red-light)", border: "1px solid var(--red)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--red)" }}>
          {error.includes("PERPLEXITY") || error.includes("key")
            ? "Configure PERPLEXITY_API_KEY to enable live trends"
            : error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",
            gap: 16,
            marginBottom: 24
          }}>
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: 52, background: "var(--surface)", borderRadius: 8, animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && trends.length === 0 && !error && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📡</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: "var(--text-secondary)" }}>No trends available</div>
          <div style={{ fontSize: 13 }}>Trends are refreshed daily at 8:00 AM UTC. Check back soon!</div>
        </div>
      )}

      {/* Personalized Section */}
      {!loading && personalizedTrends.length > 0 && category === "all" && (
        <>
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 12
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.5, textTransform: "uppercase" }}>
              For You
            </div>
            <span style={{
              fontSize: 9, padding: "2px 6px", borderRadius: 4,
              background: "var(--accent-dim)", color: "var(--accent)", fontWeight: 600
            }}>
              {user?.role?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div className="trends-personalized" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 40,
          }}>
            <style>{`
              @media (max-width: 768px) {
                .trends-personalized { grid-template-columns: 1fr !important; }
              }
            `}</style>
            {personalizedTrends.slice(0, 3).map((t, i) => (
              <TopCard
                key={`personalized-${t.id}`}
                trend={t}
                rank={i + 1}
                onDeepDive={handleDeepDive}
                onSave={handleSave}
                loadingDive={loadingDive}
                isSaved={saved.has(String(t.id))}
                userRole={user?.role}
              />
            ))}
          </div>
        </>
      )}

      {/* General Trends - Top 3 */}
      {!loading && top3.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
            {personalizedTrends.length > 0 && category === "all" ? "General Trends" : "Top Signals"}
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
                isSaved={saved.has(String(t.id))}
                userRole={user?.role}
              />
            ))}
          </div>
        </>
      )}

      {/* Ranked list / Grid */}
      {!loading && ranked.length > 0 && (
        <>
          {/* Header with view toggle */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.5, textTransform: "uppercase" }}>
              All Trends
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[
                { mode: "list", Icon: List },
                { mode: "grid", Icon: LayoutGrid },
              ].map(({ mode, Icon }) => (
                <button
                  key={mode}
                  onClick={() => {
                    setTrendsViewMode(mode);
                    localStorage.setItem("aiwatch_trends_view", mode);
                  }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 6,
                    border: trendsViewMode === mode ? "1.5px solid var(--accent)" : "1px solid var(--border-color)",
                    background: trendsViewMode === mode ? "var(--accent-dim)" : "var(--card-bg)",
                    color: trendsViewMode === mode ? "var(--accent)" : "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* List view */}
          {trendsViewMode === "list" && (
            <div style={{ background: "var(--card-bg)", border: "1.5px solid var(--border-color)", borderRadius: 12, overflow: "hidden", marginBottom: 32 }}>
              {ranked.map((t, i) => (
                <RankedRow
                  key={t.id}
                  trend={t}
                  rank={i + 4}
                  onDeepDive={handleDeepDive}
                  onSave={handleSave}
                  loadingDive={loadingDive}
                  isSaved={saved.has(String(t.id))}
                />
              ))}
            </div>
          )}

          {/* Grid view */}
          {trendsViewMode === "grid" && (
            <div
              className="trends-grid-view"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                marginBottom: 32,
              }}
            >
              <style>{`
                @media (max-width: 1024px) {
                  .trends-grid-view { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 640px) {
                  .trends-grid-view { grid-template-columns: 1fr !important; }
                }
              `}</style>
              {ranked.map((t, i) => {
                const momentum = getMomentumStyle(t.score);
                const isTrendSaved = saved.has(String(t.id));
                return (
                  <div
                    key={t.id}
                    onClick={() => handleDeepDive(t)}
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 16,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      transition: "box-shadow 0.2s",
                      position: "relative",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {/* Rank + Score row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <RankCircle rank={i + 4} />
                        <CategoryPill category={t.category} />
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "var(--accent)" }}>
                        {t.score}
                      </span>
                    </div>

                    {/* Title */}
                    <div style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      lineHeight: 1.35,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      flex: 1,
                    }}>
                      {t.topic}
                    </div>

                    {/* Bottom row: Momentum + Deep Dive + Bookmark */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 999,
                        background: momentum.bg,
                        color: momentum.color,
                        letterSpacing: 0.8,
                      }}>
                        {momentum.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeepDive(t); }}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--accent)",
                            background: "transparent",
                            border: "1px solid var(--accent)",
                            borderRadius: 6,
                            padding: "4px 10px",
                            cursor: "pointer",
                          }}
                        >
                          Deep Dive
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSave(t); }}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: "none",
                            background: "transparent",
                            color: isTrendSaved ? "var(--accent)" : "var(--text-muted)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Bookmark size={14} fill={isTrendSaved ? "var(--accent)" : "none"} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* RECOMMENDATIONS FOR ROLE */}
      {user && personalizedTrends.length > 0 && personalizedTrends.some(t => t.role_insight) && (
        <div style={{ marginTop: '48px' }}>
          {/* Section header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-color)',
          }}>
            <div>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                Recommended for {({
                  cto: 'CTOs',
                  innovation_manager: 'Innovation Managers',
                  strategy_director: 'Strategy Directors',
                  other: 'You',
                }[user?.role] || 'You')}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '2px',
              }}>
                Same trends re-ranked for your role with personalised insights
              </div>
            </div>
            <span style={{
              marginLeft: 'auto',
              background: '#fff3ee',
              color: '#E35B1A',
              fontSize: '11px',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: '600',
              flexShrink: 0,
            }}>
              {({
                cto: 'CTO',
                innovation_manager: 'Innovation',
                strategy_director: 'Strategy',
                other: 'General',
              }[user?.role] || 'General')}
            </span>
          </div>

          {/* Role trend cards */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {personalizedTrends.filter(t => t.role_insight).slice(0, 5).map((trend, i) => (
              <div
                key={trend.id || i}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                }}
                onClick={() => handleDeepDive(trend)}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '8px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                    }}>
                      {trend.topic}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}>
                      {trend.summary}
                    </div>
                  </div>
                  <div style={{
                    textAlign: 'right',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#E35B1A',
                    }}>
                      {trend.role_score || trend.score}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)',
                    }}>
                      role score
                    </div>
                  </div>
                </div>

                {/* Role insight */}
                {trend.role_insight && (
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--accent)',
                    background: 'var(--accent-dim)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginTop: '10px',
                    fontStyle: 'italic',
                    borderLeft: '3px solid var(--accent)',
                  }}>
                    💡 {trend.role_insight}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deep Dive Modal */}
      {diveModal && (
        <DeepDiveModal
          trend={diveModal}
          loading={loadingDive === diveModal?.id}
          onClose={() => setDiveModal(null)}
          onSave={handleSave}
          isSaved={saved.has(String(diveModal?.id))}
        />
      )}
    </div>
  );
}
