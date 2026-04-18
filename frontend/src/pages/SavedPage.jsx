// src/pages/SavedPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSaved } from "../services/api";
import { useSaved } from "../hooks/useSaved";
import { Bookmark } from "lucide-react";

export default function SavedPage() {
  const navigate = useNavigate();
  const { toggleSave } = useSaved();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | article | trend
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    getSaved()
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (item) => {
    await toggleSave(item.item_type, item.item_id, item.item_data);
    setItems(prev => prev.filter(i => i.item_id !== item.item_id));
  };

  const displayed = filter === "all" ? items : items.filter(i => i.item_type === filter);

  const articleCount = items.filter(i => i.item_type === "article").length;
  const trendCount = items.filter(i => i.item_type === "trend").length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .saved-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
        @media (max-width: 600px) {
          .saved-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.5, margin: "0 0 4px" }}>
          Saved Items
        </h1>
        <p style={{ fontSize: isMobile ? 12 : 13, color: "var(--text-muted)", margin: 0 }}>
          {items.length} saved — {articleCount} article{articleCount !== 1 ? "s" : ""}, {trendCount} trend{trendCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="filter-chips-scroll" style={{
        display: "flex",
        gap: 8,
        marginBottom: isMobile ? 16 : 24,
        overflowX: isMobile ? "auto" : "visible",
        paddingBottom: isMobile ? 4 : 0,
      }}>
        {[
          { id: "all", label: `All (${items.length})` },
          { id: "article", label: `Articles (${articleCount})` },
          { id: "trend", label: `Trends (${trendCount})` },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: isMobile ? "6px 14px" : "8px 18px",
              borderRadius: 999,
              border: `1.5px solid ${filter === f.id ? "var(--accent)" : "var(--border-color)"}`,
              background: filter === f.id ? "var(--accent)" : "var(--card-bg)",
              color: filter === f.id ? "#fff" : "var(--text-muted)",
              fontSize: isMobile ? 12 : 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 13 }}>
          <div style={{
            width: 32, height: 32, margin: "0 auto 12px",
            border: "3px solid var(--border-color)", borderTop: "3px solid var(--orange)",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
          }} />
          Loading saved items…
        </div>
      )}

      {/* Empty state */}
      {!loading && displayed.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: isMobile ? "40px 16px" : "60px 20px",
          background: "var(--surface)",
          borderRadius: 10,
          border: "1px solid var(--border-color)",
        }}>
          <Bookmark size={isMobile ? 28 : 36} strokeWidth={1.5} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
          <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>
            Nothing saved yet
          </div>
          <div style={{ fontSize: isMobile ? 12 : 13, color: "var(--text-muted)", marginBottom: isMobile ? 20 : 24, lineHeight: 1.6 }}>
            Click the bookmark icon on any article or trend to save it here.
          </div>
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 10,
            justifyContent: "center",
          }}>
            <button
              onClick={() => navigate("/feed")}
              style={{
                padding: "9px 20px", borderRadius: 7, border: "none",
                background: "var(--orange)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                width: isMobile ? "100%" : "auto",
              }}
            >Browse Articles</button>
            <button
              onClick={() => navigate("/trends")}
              style={{
                padding: "9px 20px", borderRadius: 7, border: "1.5px solid var(--border-color)",
                background: "var(--card-bg)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                width: isMobile ? "100%" : "auto",
              }}
            >Browse Trends</button>
          </div>
        </div>
      )}

      {/* Items grid */}
      {!loading && displayed.length > 0 && (
        <div className="saved-grid">
          {displayed.map(item => {
            const isArticle = item.item_type === "article";
            const d = item.item_data || {};

            if (isArticle) {
              // Text-only article card (no thumbnail)
              return (
                <div
                  key={item.item_id}
                  onClick={() => navigate(`/article/${item.item_id}`, {
                    state: { article: { id: item.item_id, title: d.title, topic: d.category, signal_strength: d.signal, source: d.source, url: d.url } },
                  })}
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 8,
                    padding: isMobile ? "16px" : "20px 24px",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                    overflow: "hidden",
                    minWidth: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-color)"}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      flex: 1,
                      lineHeight: 1.4,
                      margin: 0,
                      minWidth: 0,
                      wordWrap: "break-word",
                      overflowWrap: "break-word",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {d.title || "Untitled Article"}
                    </h3>
                    <button
                      onClick={e => { e.stopPropagation(); handleRemove(item); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--orange)", fontSize: 16, flexShrink: 0, padding: 2 }}
                    >
                      <Bookmark size={16} fill="var(--orange)" />
                    </button>
                  </div>
                  {d.summary && (
                    <p style={{
                      fontSize: isMobile ? 13 : 14,
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      marginBottom: 12,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: isMobile ? 2 : 3,
                      WebkitBoxOrient: "vertical",
                      margin: 0,
                      marginBottom: 12,
                    }}>
                      {d.summary}
                    </p>
                  )}
                  <div style={{
                    fontSize: isMobile ? 11 : 12,
                    color: "var(--text-muted)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}>
                    <span style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      minWidth: 0,
                      flex: 1,
                    }}>{d.category || d.topic || "General"} · {d.source || ""} · {formatDate(item.saved_at)}</span>
                    {d.url && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{ color: "var(--accent)", fontSize: 12, fontWeight: 500, flexShrink: 0 }}
                      >
                        Read →
                      </a>
                    )}
                  </div>
                </div>
              );
            } else {
              // Text-only trend card (no thumbnail)
              return (
                <div
                  key={item.item_id}
                  onClick={() => d.url && window.open(d.url, "_blank", "noreferrer")}
                  style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 8,
                    padding: isMobile ? "16px" : "20px 24px",
                    cursor: d.url ? "pointer" : "default",
                    transition: "border-color 0.15s",
                    overflow: "hidden",
                    minWidth: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-color)"}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 500, color: "var(--accent)" }}>
                      {d.trend_score || 7}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleRemove(item); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--orange)", fontSize: 16, flexShrink: 0, padding: 2 }}
                    >
                      <Bookmark size={16} fill="var(--orange)" />
                    </button>
                  </div>
                  <h3 style={{
                    fontSize: isMobile ? 13 : 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: 4,
                    margin: 0,
                    marginBottom: 4,
                    minWidth: 0,
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {d.topic || d.title || "Unknown Topic"}
                  </h3>
                  <div style={{ fontSize: isMobile ? 10 : 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {d.category || "Technology"}
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </>
  );
}
