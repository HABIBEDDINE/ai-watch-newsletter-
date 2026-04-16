// src/pages/TrendsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { getTrends, refreshTrends, getDeepDive, matchSolutions } from "../services/api";
import { useSaved } from "../hooks/useSaved";
import { Bookmark, X } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import TrendCard from "../components/ui/TrendCard";
import TrendSkeleton from "../components/ui/TrendSkeleton";

const CATEGORY_LABELS = {
  llm_models: "LLM Models",
  dev_tools: "Dev & Coding AI",
  ai_agents: "AI Agents",
  open_source: "Open Source AI",
  ai_infrastructure: "AI Infrastructure",
  enterprise_apps: "Enterprise AI Apps",
};

const ALL_CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "llm_models", label: "LLM Models" },
  { id: "dev_tools", label: "Dev & Coding AI" },
  { id: "ai_agents", label: "AI Agents" },
  { id: "open_source", label: "Open Source AI" },
  { id: "ai_infrastructure", label: "AI Infrastructure" },
  { id: "enterprise_apps", label: "Enterprise AI Apps" },
];

function StatCard({ label, value, accent = false }) {
  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 8,
      padding: '18px 20px',
    }}>
      <div style={{
        fontSize: 28,
        fontWeight: 700,
        color: accent ? 'var(--orange)' : 'var(--text-primary)',
        marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

function DeepDivePanel({ trend, onClose, onSave, loading, isSaved }) {
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  if (!trend) return null;

  const paragraphs = trend.deep_dive
    ? trend.deep_dive.split(/\n{2,}/).filter(Boolean)
    : [];
  const labels = ["What It Is", "Enterprise Impact", "Action Plan"];

  const handleMatchSolutions = async () => {
    if (matchResult) return;
    setMatchLoading(true);
    try {
      const res = await matchSolutions({
        title: trend.topic || "",
        summary: trend.summary || "",
        industry: trend.category || "",
        signal: trend.momentum || "",
      });
      setMatchResult(res.matches || []);
    } catch {
      setMatchResult([]);
    } finally {
      setMatchLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: 480,
      maxWidth: '100vw',
      background: 'var(--card-bg)',
      borderLeft: '1px solid var(--border-color)',
      boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
      zIndex: 300,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--orange)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            {CATEGORY_LABELS[trend.category] || trend.category}
          </div>
          <div style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.3,
          }}>
            {trend.topic}
          </div>
          <div style={{
            display: 'flex',
            gap: 8,
            marginTop: 10,
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--orange)',
            }}>
              {trend.score}/10
            </span>
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--green)',
              background: 'var(--green-light)',
              padding: '2px 8px',
              borderRadius: 20,
            }}>
              {trend.momentum}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            color: 'var(--text-muted)',
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: 36,
              height: 36,
              margin: '0 auto 12px',
              border: '3px solid var(--border-color)',
              borderTop: '3px solid var(--orange)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Generating deep dive analysis...
            </div>
          </div>
        ) : paragraphs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {paragraphs.map((para, i) => (
              <div key={i}>
                {i < labels.length && (
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--orange)',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}>
                    {labels[i]}
                  </div>
                )}
                <div style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                }}>
                  {para}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {trend.summary}
          </div>
        )}

        {/* Match Solutions */}
        {!matchResult && !loading && (
          <button
            onClick={handleMatchSolutions}
            disabled={matchLoading}
            style={{
              marginTop: 24,
              width: '100%',
              padding: '10px 0',
              borderRadius: 8,
              border: '1.5px solid var(--orange)',
              background: matchLoading ? 'var(--orange-light)' : 'transparent',
              color: 'var(--orange)',
              fontSize: 13,
              fontWeight: 600,
              cursor: matchLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {matchLoading ? 'Matching...' : 'Match DXC Solutions'}
          </button>
        )}

        {matchResult && matchResult.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--orange)',
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Matched Solutions
            </div>
            {matchResult.map((m, i) => (
              <div key={i} style={{
                padding: '12px 14px',
                background: 'var(--orange-light)',
                borderLeft: '3px solid var(--orange)',
                borderRadius: 4,
                marginBottom: 8,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--orange)', marginBottom: 4 }}>
                  {m.solution}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {m.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        gap: 10,
      }}>
        <button
          onClick={() => onSave(trend)}
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: 8,
            border: '1.5px solid var(--orange)',
            background: isSaved ? 'var(--orange-light)' : 'transparent',
            color: 'var(--orange)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <Bookmark size={14} fill={isSaved ? 'var(--orange)' : 'none'} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '10px 0',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg)',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function TrendsPage() {
  const { saved, toggleSave } = useSaved();
  const [allTrends, setAllTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [category, setCategory] = useState("all");
  const [divePanel, setDivePanel] = useState(null);
  const [loadingDive, setLoadingDive] = useState(null);
  const [visibleCount, setVisibleCount] = useState(9);

  const trends = category === "all"
    ? allTrends
    : allTrends.filter(t => t.category === category);

  const loadTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTrends();
      setAllTrends(data.trends || []);
      setLastUpdated(data.last_updated);
    } catch {
      setError("Trends temporarily unavailable. Please try again.");
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
    } catch {
      setError("Unable to refresh trends. Please try again later.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeepDive = async (trend) => {
    if (trend.deep_dive) {
      setDivePanel(trend);
      return;
    }
    setDivePanel({ ...trend, deep_dive: null });
    setLoadingDive(trend.id);
    try {
      const data = await getDeepDive(trend.id);
      const updated = { ...trend, deep_dive: data.deep_dive };
      setAllTrends(prev => prev.map(t => t.id === trend.id ? updated : t));
      setDivePanel(updated);
    } catch {
      setDivePanel(prev => prev ? { ...prev, deep_dive: 'Analysis unavailable. Please try again later.' } : null);
    } finally {
      setLoadingDive(null);
    }
  };

  const handleSave = (trend) => {
    toggleSave("trend", trend.id, {
      topic: trend.topic,
      category: trend.category,
      trend_score: trend.score,
      summary: trend.summary,
    });
  };

  const relativeTime = (iso) => {
    if (!iso) return null;
    const diff = Math.floor((Date.now() - new Date(iso)) / 60000);
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  const avgScore = allTrends.length
    ? (allTrends.reduce((a, b) => a + (b.score || 0), 0) / allTrends.length).toFixed(1)
    : "—";
  const trendingCount = allTrends.filter(t => t.score >= 8).length;

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .trends-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .trends-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .trends-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 4px',
            letterSpacing: -0.5,
          }}>
            AI Trends
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            {lastUpdated
              ? `Updated ${relativeTime(lastUpdated)}`
              : "Live AI tools & model intelligence"}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loading}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: '1.5px solid var(--orange)',
            background: refreshing ? 'var(--orange-light)' : 'var(--orange)',
            color: refreshing ? 'var(--orange)' : '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: (refreshing || loading) ? 0.7 : 1,
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Trends'}
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 24,
      }}>
        <StatCard label="Active Topics" value={allTrends.length} />
        <StatCard label="Trending Now" value={trendingCount} accent />
        <StatCard label="Avg Score" value={avgScore} />
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        flexWrap: 'wrap',
      }}>
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => { setCategory(cat.id); setVisibleCount(9); }}
            style={{
              padding: '7px 16px',
              borderRadius: 999,
              border: `1.5px solid ${category === cat.id ? 'var(--orange)' : 'var(--border-color)'}`,
              background: category === cat.id ? 'var(--orange)' : 'var(--card-bg)',
              color: category === cat.id ? '#fff' : 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'var(--red-light)',
          border: '1px solid var(--red)',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          fontSize: 13,
          color: 'var(--red)',
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="trends-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <TrendSkeleton key={i} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && trends.length === 0 && !error && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--surface)',
          borderRadius: 10,
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📡</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            No trends loaded yet
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
            Click Refresh to fetch the latest AI trend intelligence
          </div>
          <button
            onClick={handleRefresh}
            style={{
              padding: '12px 28px',
              borderRadius: 8,
              background: 'var(--orange)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Load Trends Now
          </button>
        </div>
      )}

      {/* Trends Grid */}
      {!loading && trends.length > 0 && (
        <>
          <div className="trends-grid" style={{ marginBottom: 24 }}>
            {trends.slice(0, visibleCount).map(trend => (
              <TrendCard
                key={trend.id}
                trend={{
                  topic: trend.topic,
                  trend_score: trend.score,
                  category: CATEGORY_LABELS[trend.category] || trend.category,
                  momentum_delta: trend.momentum ? parseInt(trend.momentum) : 0,
                  summary: trend.summary,
                }}
                onClick={() => handleDeepDive(trend)}
              />
            ))}
          </div>

          {/* Load More */}
          {visibleCount < trends.length && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => setVisibleCount(v => v + 9)}
                style={{
                  padding: '12px 32px',
                  borderRadius: 8,
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Load More Trends ({trends.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Deep Dive Panel */}
      {divePanel && (
        <>
          <div
            onClick={() => setDivePanel(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 250,
            }}
          />
          <DeepDivePanel
            trend={divePanel}
            loading={loadingDive === divePanel?.id}
            onClose={() => setDivePanel(null)}
            onSave={handleSave}
            isSaved={saved.has(String(divePanel?.id))}
          />
        </>
      )}
    </DashboardLayout>
  );
}
