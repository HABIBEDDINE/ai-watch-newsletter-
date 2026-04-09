import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSaved } from "../services/api";
import { useSaved } from "../hooks/useSaved";
import { Bookmark, FileText, TrendingUp, Trash2 } from "lucide-react";

const ACCENT    = "#1A4A9E";
const ACCENT_BG = "#e8eef8";
const TEAL      = "#0d7377";
const TEAL_BG   = "#e0f5f5";

const B = {
  white:  "#ffffff",
  gray50: "#fafafa",
  gray100:"#f4f4f4",
  gray200:"#e8e8e8",
  gray400:"#999999",
  gray500:"#666666",
  gray600:"#444444",
  gray900:"#111111",
};

export default function SavedPage() {
  const navigate = useNavigate();
  const { toggleSave } = useSaved();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all"); // all | article | trend

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
  const trendCount   = items.filter(i => i.item_type === "trend").length;

  return (
    <div style={{ padding: "24px 28px", maxWidth: 800, fontFamily: "'Open Sans','Segoe UI',Arial,sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: B.gray900, letterSpacing: -0.3, margin: "0 0 4px" }}>
          Saved Items
        </h1>
        <p style={{ fontSize: 13, color: B.gray400, margin: 0 }}>
          {items.length} saved — {articleCount} article{articleCount !== 1 ? "s" : ""}, {trendCount} trend{trendCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { id: "all",     label: `All (${items.length})` },
          { id: "article", label: `Articles (${articleCount})` },
          { id: "trend",   label: `Trends (${trendCount})` },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: "7px 16px", borderRadius: 999,
              border: `1.5px solid ${filter === f.id ? ACCENT : B.gray200}`,
              background: filter === f.id ? ACCENT : B.white,
              color: filter === f.id ? "#fff" : B.gray500,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.15s",
            }}
          >{f.label}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: B.gray400, fontSize: 13 }}>
          <div style={{
            width: 32, height: 32, margin: "0 auto 12px",
            border: `3px solid ${B.gray200}`, borderTop: `3px solid ${ACCENT}`,
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          Loading saved items…
        </div>
      )}

      {/* Empty state */}
      {!loading && displayed.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px 20px",
          background: B.gray50, borderRadius: 10,
          border: `1px solid ${B.gray200}`,
        }}>
          <Bookmark size={36} strokeWidth={1.5} style={{ color: B.gray300, marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: B.gray600, marginBottom: 8 }}>
            Nothing saved yet
          </div>
          <div style={{ fontSize: 13, color: B.gray400, marginBottom: 24, lineHeight: 1.6 }}>
            Click the bookmark icon on any article or trend to save it here.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={() => navigate("/explore")}
              style={{
                padding: "9px 20px", borderRadius: 7, border: `1.5px solid ${ACCENT}`,
                background: ACCENT, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >Browse Articles</button>
            <button
              onClick={() => navigate("/trends")}
              style={{
                padding: "9px 20px", borderRadius: 7, border: `1.5px solid ${B.gray200}`,
                background: B.white, color: B.gray600, fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >Browse Trends</button>
          </div>
        </div>
      )}

      {/* Items list */}
      {!loading && displayed.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {displayed.map(item => {
            const isArticle = item.item_type === "article";
            const d = item.item_data || {};
            const handleCardClick = () => {
              if (isArticle) {
                navigate(`/article/${item.item_id}`, {
                  state: {
                    article: {
                      id: item.item_id,
                      title: d.title,
                      topic: d.category,
                      signal_strength: d.signal,
                      source: d.source,
                      url: d.url,
                    },
                  },
                });
              } else if (d.url) {
                window.open(d.url, "_blank", "noreferrer");
              }
            };

            return (
              <div
                key={item.item_id}
                onClick={handleCardClick}
                style={{
                  background: B.white, border: `1px solid ${B.gray200}`,
                  borderRadius: 8, padding: "16px 18px",
                  display: "flex", alignItems: "flex-start", gap: 14,
                  transition: "box-shadow 0.15s, border-color 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.07)"; e.currentTarget.style.borderColor = isArticle ? ACCENT : TEAL; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = B.gray200; }}
              >
                {/* Type icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: isArticle ? ACCENT_BG : TEAL_BG,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {isArticle
                    ? <FileText  size={16} strokeWidth={2} color={ACCENT} />
                    : <TrendingUp size={16} strokeWidth={2} color={TEAL}  />}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                      background: isArticle ? ACCENT_BG : TEAL_BG,
                      color: isArticle ? ACCENT : TEAL,
                      letterSpacing: 0.4, textTransform: "uppercase",
                    }}>
                      {isArticle ? "Article" : "Trend"}
                    </span>
                    {d.category && (
                      <span style={{ fontSize: 11, color: B.gray400 }}>{d.category}</span>
                    )}
                    {d.signal && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                        background: d.signal === "Strong" ? "#C45F0015" : "transparent",
                        color: d.signal === "Strong" ? "#C45F00" : B.gray400,
                        border: d.signal === "Strong" ? "none" : `1px solid ${B.gray200}`,
                      }}>{d.signal}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: B.gray900, lineHeight: 1.4, marginBottom: 4 }}>
                    {d.title || d.topic || item.item_id}
                  </div>
                  {(d.source || d.trend_score) && (
                    <div style={{ fontSize: 12, color: B.gray400 }}>
                      {d.source && <span>{d.source}</span>}
                      {d.trend_score && <span>Score: {d.trend_score}/10</span>}
                      {item.saved_at && (
                        <span> · Saved {new Date(item.saved_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions — only the remove button */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove(item); }}
                    title="Remove from saved"
                    style={{
                      width: 32, height: 32, borderRadius: 6, border: `1px solid ${B.gray200}`,
                      background: B.white, color: B.gray400, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#c0392b"; e.currentTarget.style.color = "#c0392b"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = B.gray200;  e.currentTarget.style.color = B.gray400;  }}
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
