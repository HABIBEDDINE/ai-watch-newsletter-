// src/pages/FeedPage.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getArticles, triggerIngest } from "../services/api";
import { useArticles } from "../context/ArticleContext";
import { useAuth } from "../context/AuthContext";
import { useSaved } from "../hooks/useSaved";
import { Search, LayoutGrid, List, RefreshCw, Bookmark } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";

const ROLE_PRESETS = {
  cto: "AI",
  innovation_manager: "HealthTech",
  strategy_director: "Cybersecurity",
  other: "All Industries",
};

const TOPICS = [
  "All Industries",
  "AI",
  "FinTech",
  "HealthTech",
  "Cybersecurity",
  "CleanTech",
  "Robotics",
];

const LS_TOPIC_KEY = "aiwatch_explore_topic";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function truncate(str, len) {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "..." : str;
}

function StatCard({ label, value, color = "#6B5CE7", isMobile }) {
  return (
    <div className="stats-card" style={{
      background: "var(--card-bg)",
      border: "1px solid var(--border-color)",
      borderRadius: 8,
      padding: isMobile ? "12px 16px" : "16px 20px",
      textAlign: "center",
      width: "100%",
    }}>
      <div style={{ fontSize: isMobile ? 24 : 28, fontWeight: 700, color, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

function FeedArticleCard({ article, isBookmarked, onBookmark, onClick }) {
  const signal = article.signal_strength || article.signal_type || "MEDIUM";
  const signalLower = signal.toLowerCase();
  const isStrong = signalLower === "strong";
  const isWeak = signalLower === "weak";

  return (
    <div
      className="article-card"
      onClick={onClick}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        padding: 16,
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s",
        width: "100%",
        overflow: "hidden",
        minWidth: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--orange)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border-color)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header: Title + Signal Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 10 }}>
        <h3 className="article-title" style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text-primary)",
          lineHeight: 1.4,
          margin: 0,
          flex: 1,
          minWidth: 0,
          wordWrap: "break-word",
          overflowWrap: "break-word",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {article.title}
        </h3>
        <span className="signal-badge" style={{
          fontSize: 10,
          fontWeight: 700,
          padding: "3px 8px",
          borderRadius: 4,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          flexShrink: 0,
          whiteSpace: "nowrap",
          background: isStrong ? "#dcfce7" : isWeak ? "#f3f4f6" : "#fef3c7",
          color: isStrong ? "#166534" : isWeak ? "#6b7280" : "#92400e",
        }}>
          {signal}
        </span>
      </div>

      {/* Summary */}
      {article.summary && (
        <p className="article-description" style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          margin: "0 0 12px",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {truncate(article.summary, 180)}
        </p>
      )}

      {/* Footer: Meta + Bookmark */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{
          fontSize: 11,
          color: "var(--text-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
          flex: 1,
        }}>
          {article.topic || article.search_topic || "General"}
          {article.source && ` · ${article.source}`}
          {article.published_at && ` · ${formatDate(article.published_at)}`}
        </span>
        {onBookmark && (
          <button
            onClick={(e) => { e.stopPropagation(); onBookmark(); }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Bookmark
              size={16}
              fill={isBookmarked ? "var(--orange)" : "none"}
              color={isBookmarked ? "var(--orange)" : "var(--text-muted)"}
            />
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: "var(--card-bg)",
      border: "1px solid var(--border-color)",
      borderRadius: 8,
      padding: 16,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: "70%", height: 18, background: "var(--border-color)", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
        <div style={{ width: 60, height: 18, background: "var(--border-color)", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
      </div>
      <div style={{ width: "100%", height: 14, background: "var(--border-color)", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s infinite" }} />
      <div style={{ width: "85%", height: 14, background: "var(--border-color)", borderRadius: 4, marginBottom: 12, animation: "pulse 1.5s infinite" }} />
      <div style={{ width: "50%", height: 12, background: "var(--border-color)", borderRadius: 4, animation: "pulse 1.5s infinite" }} />
    </div>
  );
}

export default function FeedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saved, toggleSave } = useSaved();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useArticles();

  // Track window resize for responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rolePreset = user?.role ? (ROLE_PRESETS[user.role] || "All Industries") : "All Industries";
  const initialTopic = localStorage.getItem(LS_TOPIC_KEY) || rolePreset;

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchArticles = useCallback(async (page = 1, pageSize = itemsPerPage, isRetry = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getArticles({
        topic: selectedTopic === "All Industries" ? undefined : selectedTopic,
        search: searchQuery || undefined,
        page,
        pageSize,
      });
      const items = response.items || [];
      const total = response.total || 0;
      setArticles(items);
      setTotalCount(total);
      setCurrentPage(page);
      if (total === 0 && !isRetry) {
        setTimeout(() => fetchArticles(page, pageSize, true), 2000);
        return;
      }
    } catch {
      setError("Unable to load articles. Please try again.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTopic, searchQuery, itemsPerPage]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    setCurrentPage(1);
    fetchArticles(1, itemsPerPage);
  }, [fetchArticles, itemsPerPage]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchArticles(1, itemsPerPage);
    }, 400);
    setSearchTimeout(timeout);
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    localStorage.setItem(LS_TOPIC_KEY, topic);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchArticles(page, itemsPerPage);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleIngest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await triggerIngest();
      if (response.status === "started") {
        let attempts = 0;
        const maxAttempts = 60;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const articlesResponse = await getArticles({ page: 1, pageSize: 50 });
            if (articlesResponse.items && articlesResponse.items.length > 0) {
              setArticles(articlesResponse.items);
              setTotalCount(articlesResponse.total || 0);
              setCurrentPage(1);
              clearInterval(pollInterval);
              setLoading(false);
            }
          } catch (err) {
            console.warn("Poll attempt failed:", err);
          }
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setLoading(false);
          }
        }, 2000);
      } else {
        await fetchArticles(1, itemsPerPage);
        setLoading(false);
      }
    } catch {
      setError("Unable to refresh articles. Please try again later.");
      setLoading(false);
    }
  };

  const handleBookmark = (article) => {
    toggleSave("article", article.id, {
      title: article.title,
      category: article.topic,
      signal: article.signal_strength,
      source: article.source,
      url: article.url,
    });
  };

  const strongCount = articles.filter(a => (a.signal_strength || "").toLowerCase() === "strong").length;
  const avgRelevance = articles.length
    ? (articles.reduce((a, b) => a + (b.relevance || b.relevance_score || 5), 0) / articles.length).toFixed(1)
    : "—";

  return (
    <DashboardLayout>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .filter-chips-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Page Header */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "stretch" : "flex-start",
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>
            Explore Intelligence
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            Real-time AI news from NewsAPI, Google News, and Perplexity
          </p>
        </div>
        <button
          onClick={handleIngest}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: isMobile ? "10px 16px" : "10px 18px",
            border: "1.5px solid var(--border-color)",
            borderRadius: 6,
            background: "var(--card-bg)",
            color: "var(--text-primary)",
            fontSize: 13,
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            width: isMobile ? "100%" : "auto",
          }}
        >
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh Intelligence
        </button>
      </div>

      {/* Stats Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: isMobile ? 12 : 16,
        marginBottom: 24
      }}>
        <StatCard label="Articles Today" value={totalCount} isMobile={isMobile} />
        <StatCard label="Strong Signals" value={strongCount} isMobile={isMobile} />
        <StatCard label="Avg Relevance" value={articles.length ? `${avgRelevance}/10` : "—"} isMobile={isMobile} />
      </div>

      {/* Search + Filters Row */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        gap: 12,
        alignItems: isMobile ? "stretch" : "center",
        marginBottom: 16,
      }}>
        <div style={{ position: "relative", width: isMobile ? "100%" : "auto", minWidth: isMobile ? "unset" : 200, maxWidth: isMobile ? "100%" : 280 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 38px",
              border: "1px solid var(--border-color)",
              borderRadius: 6,
              fontSize: 13,
              background: "var(--input-bg)",
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
        </div>

        {/* Topic Chips - horizontal scroll on mobile */}
        <div
          className="filter-chips-scroll"
          style={{
            display: "flex",
            gap: 6,
            flex: 1,
            overflowX: isMobile ? "auto" : "visible",
            flexWrap: isMobile ? "nowrap" : "wrap",
            paddingBottom: isMobile ? 8 : 0,
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {TOPICS.map(topic => (
            <button
              key={topic}
              className="filter-chip"
              onClick={() => handleTopicChange(topic)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: selectedTopic === topic ? "1.5px solid var(--orange)" : "1px solid var(--border-color)",
                background: selectedTopic === topic ? "var(--orange)" : "var(--card-bg)",
                color: selectedTopic === topic ? "#fff" : "var(--text-secondary)",
                fontSize: 12,
                fontWeight: selectedTopic === topic ? 600 : 400,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Pagination + View Toggle Row */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "stretch" : "center",
        gap: isMobile ? 12 : 8,
        marginBottom: 16
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: isMobile ? "space-between" : "flex-start" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Show:</span>
          <div style={{ display: "flex", gap: 4 }}>
            {[10, 25, 50, 100].map(count => (
              <button
                key={count}
                onClick={() => { setItemsPerPage(count); handlePageChange(1); }}
                style={{
                  padding: "4px 10px",
                  border: itemsPerPage === count ? "2px solid var(--orange)" : "1px solid var(--border-color)",
                  borderRadius: 4,
                  background: "var(--card-bg)",
                  color: itemsPerPage === count ? "var(--orange)" : "var(--text-secondary)",
                  fontSize: 11,
                  fontWeight: itemsPerPage === count ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, justifyContent: isMobile ? "flex-end" : "flex-start" }}>
          {[
            { mode: "list", Icon: List },
            { mode: "grid", Icon: LayoutGrid },
          ].map(({ mode, Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 6,
                border: viewMode === mode ? "1.5px solid var(--orange)" : "1px solid var(--border-color)",
                background: viewMode === mode ? "var(--orange-light)" : "var(--card-bg)",
                color: viewMode === mode ? "var(--orange)" : "var(--text-muted)",
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

      {/* Error */}
      {error && (
        <div style={{
          background: "var(--amber-light)",
          border: "1px solid var(--amber)",
          color: "var(--amber)",
          padding: "12px 16px",
          marginBottom: 16,
          borderRadius: 8,
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div style={{
          display: "grid",
          gridTemplateColumns: (viewMode === "grid" && !isMobile) ? "repeat(2, 1fr)" : "1fr",
          gap: 16,
          marginBottom: 24,
        }}>
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty State */}
      {!loading && articles.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 40px",
          background: "var(--surface)",
          border: "1px solid var(--border-color)",
          borderRadius: 10,
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
            No articles yet
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>
            Click "Refresh Intelligence" to fetch the latest news.
          </div>
          <button
            onClick={handleIngest}
            style={{
              background: "var(--orange)",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Refresh Intelligence
          </button>
        </div>
      )}

      {/* Article Cards */}
      {!loading && articles.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: (viewMode === "grid" && !isMobile) ? "repeat(2, 1fr)" : "1fr",
          gap: 16,
          marginBottom: 24,
        }}>
          {articles.map(article => (
            <FeedArticleCard
              key={article.id}
              article={article}
              isBookmarked={saved.has(String(article.id))}
              onBookmark={() => handleBookmark(article)}
              onClick={() => navigate(`/article/${article.id}`, { state: { article } })}
            />
          ))}
        </div>
      )}

      {/* Bottom Pagination */}
      {!loading && articles.length > 0 && (
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          background: "var(--card-bg)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
          padding: isMobile ? "12px 16px" : "14px 20px",
          gap: 12,
        }}>
          {/* Show count - hidden on mobile to save space */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Show:</span>
              {[10, 25, 50, 100].map(count => (
                <button
                  key={count}
                  onClick={() => { setItemsPerPage(count); handlePageChange(1); }}
                  style={{
                    padding: "4px 10px",
                    border: itemsPerPage === count ? "2px solid var(--orange)" : "1px solid var(--border-color)",
                    borderRadius: 4,
                    background: "var(--card-bg)",
                    color: itemsPerPage === count ? "var(--orange)" : "var(--text-secondary)",
                    fontSize: 11,
                    fontWeight: itemsPerPage === count ? 600 : 400,
                    cursor: "pointer",
                  }}
                >
                  {count}
                </button>
              ))}
            </div>
          )}

          {/* Page info + navigation */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: isMobile ? "100%" : "auto",
            gap: 12,
          }}>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Page {currentPage} of {totalPages || 1}
            </span>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 14px",
                  border: "1px solid var(--border-color)",
                  background: "var(--card-bg)",
                  borderRadius: 4,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.4 : 1,
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                Prev
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{
                  padding: "6px 14px",
                  border: "1px solid var(--border-color)",
                  background: "var(--card-bg)",
                  borderRadius: 4,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
