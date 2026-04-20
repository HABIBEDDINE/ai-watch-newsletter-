import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getArticles, triggerIngest, saveReport } from "../services/api";
import { useArticles } from "../context/ArticleContext";
import { useAuth } from "../context/AuthContext";
import { useSaved } from "../hooks/useSaved";
import { generatePDF } from "../utils/generatePDF";
import { Search, LayoutGrid, List, Bookmark } from "lucide-react";
import { cleanText } from "../utils/cleanText";
import CategoryCombobox from "../components/CategoryCombobox";

// Role → default category preset
const ROLE_PRESETS = {
  cto:                "AI",
  innovation_manager: "HealthTech",
  strategy_director:  "Cybersecurity",
  other:              "All Industries",
};

const ROLE_LABELS = {
  cto:                "CTO / Technical Lead",
  innovation_manager: "Innovation Manager",
  strategy_director:  "Strategy Director",
};

const LS_TOPIC_KEY = "aiwatch_explore_topic";

// Colors use DXC brand CSS variables
const ACCENT   = "var(--dxc-orange)";
const ACCENT_BG = "rgba(255, 180, 118, 0.1)";

const SIGNALS = ["All", "Strong", "Weak"];

function StatCard({ label, value, isMobile }) {
  return (
    <div style={{
      background: "var(--dxc-surface)",
      border: "1px solid var(--dxc-border)",
      borderRadius: 10,
      padding: isMobile ? "14px 16px" : "18px 20px",
    }}>
      <div style={{
        fontSize: isMobile ? 22 : 26,
        fontWeight: 700,
        background: "linear-gradient(135deg, #FFB476, #F2805E)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        marginBottom: 4,
        letterSpacing: -0.5
      }}>{value}</div>
      <div style={{ fontSize: isMobile ? 12 : 13, color: "var(--dxc-muted)", fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function ArticleCard({ article, onOpen, isSaved, onToggleSave, isMobile }) {
  const isStrong = article.signal_strength === "Strong";
  const title    = cleanText(article.title);
  // Try multiple fields for summary content, explicitly filter out "Summary not available"
  const rawSum   = cleanText(article.summary || article.description || article.content || "")
    .replace(/^[-•]\s*/gm, "").replace(/\n+/g, " ").trim();
  const hasSummary = rawSum && rawSum !== title && rawSum.length > 20
    && !rawSum.toLowerCase().includes("summary not available");
  const summary  = hasSummary ? rawSum : null;
  const industry = article.topic || article.search_topic || article.industry || "General";
  const date     = article.published_at
    ? new Date(article.published_at).toLocaleDateString()
    : "";

  return (
    <div
      className="article-card"
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 0 30px rgba(255, 180, 118, 0.1)";
        e.currentTarget.style.borderColor = "var(--dxc-orange)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--dxc-border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      style={{
        background: "var(--dxc-surface)",
        border: "1px solid var(--dxc-border)",
        borderRadius: 12,
        padding: isMobile ? "16px" : "20px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* Bookmark button */}
      {onToggleSave && (
        <button
          onClick={e => { e.stopPropagation(); onToggleSave("article", article.id, { title: article.title, category: industry, signal: article.signal_strength, source: article.source, url: article.url }); }}
          title={isSaved ? "Remove from saved" : "Save article"}
          style={{
            position: "absolute", top: isMobile ? 12 : 14, right: isMobile ? 12 : 14,
            background: "none", border: "none", cursor: "pointer", padding: 4,
            color: isSaved ? "var(--dxc-orange)" : "var(--dxc-muted)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "color 0.15s",
          }}
        >
          <Bookmark size={16} strokeWidth={2} fill={isSaved ? "var(--dxc-orange)" : "none"} />
        </button>
      )}

      {/* Clickable area */}
      <div onClick={() => onOpen(article)} style={{ minWidth: 0 }}>
        {/* Title + Signal badge */}
        <div className="article-card-header" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: isMobile ? 10 : 14,
          marginBottom: 10,
          paddingRight: onToggleSave ? 28 : 0,
          minWidth: 0,
        }}>
          <div style={{
            fontSize: isMobile ? 15 : 18,
            fontWeight: 700,
            color: "var(--dxc-white)",
            lineHeight: 1.4,
            flex: 1,
            minWidth: 0,
            wordWrap: "break-word",
            overflowWrap: "break-word",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {title}
          </div>
          <span className="signal-badge" style={{
            flexShrink: 0,
            fontSize: isMobile ? 9 : 10,
            fontWeight: 700,
            padding: isMobile ? "4px 10px" : "5px 12px",
            borderRadius: 999,
            letterSpacing: 0.5,
            marginTop: 2,
            ...(isStrong
              ? { background: "linear-gradient(135deg, #FFB476, #F2805E)", color: "var(--dxc-darker)" }
              : { background: "rgba(139, 145, 181, 0.15)", color: "var(--dxc-muted)", border: "1px solid var(--dxc-border)" }),
          }}>
            {isStrong ? "STRONG" : "WEAK"}
          </span>
        </div>

        {/* Summary */}
        <div style={{
          fontSize: isMobile ? 13 : 15,
          color: summary ? "var(--text-secondary)" : "var(--text-muted)",
          lineHeight: 1.65,
          marginBottom: 14,
          display: "-webkit-box",
          WebkitLineClamp: isMobile ? 2 : 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          fontStyle: summary ? "normal" : "italic",
        }}>
          {summary || `${article.source || "Source"} · ${industry}`}
        </div>

        {/* Metadata footer */}
        <div style={{
          fontSize: isMobile ? 11 : 13,
          color: "var(--text-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {industry} · {article.source} · {date}
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Context is used by DataPreview — Explore manages its own local paginated state only
  useArticles(); // keep provider mounted

  // Role-based default topic: use localStorage override if set, otherwise role preset
  const rolePreset = user?.role ? (ROLE_PRESETS[user.role] || "All Industries") : "All Industries";
  const initialTopic = localStorage.getItem(LS_TOPIC_KEY) || rolePreset;

  const [articles, setArticles]             = useState([]);
  const [loading,  setLoading]              = useState(true);
  const [error,    setError]                = useState(null);
  const [selectedTopic, setSelectedTopic]   = useState(initialTopic);
  const [selectedSignal]                    = useState("All");
  const [searchQuery, setSearchQuery]       = useState("");
  const [currentPage, setCurrentPage]       = useState(1);
  const [itemsPerPage, setItemsPerPage]     = useState(10);
  const [totalCount, setTotalCount]         = useState(0);
  const [viewMode, setViewMode]               = useState("list");
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState(new Set());
  const [reportFormat, setReportFormat]     = useState("md");
  const [searchTimeout, setSearchTimeout]   = useState(null);
  const [dateFilter, setDateFilter]         = useState("Today");

  const { saved, toggleSave } = useSaved();

  // Helper to get date string based on filter
  const getDateParam = (filter) => {
    const now = new Date();
    if (filter === "Today") {
      return now.toISOString().split("T")[0];
    }
    if (filter === "This Week") {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      return weekAgo.toISOString().split("T")[0];
    }
    if (filter === "This Month") {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      return monthAgo.toISOString().split("T")[0];
    }
    return undefined; // All Time = no date filter
  };

  const fetchArticles = useCallback(async (page = 1, pageSize = itemsPerPage, isRetry = false) => {
    setLoading(true);
    setError(null);
    try {
      const dateFrom = getDateParam(dateFilter);
      const response = await getArticles({
        topic:    selectedTopic === "All Industries" ? undefined : selectedTopic,
        signal:   selectedSignal === "All" ? undefined : selectedSignal,
        search:   searchQuery || undefined,
        dateFrom,
        page,
        pageSize,
      });
      const items = response.items || [];
      const total = response.total || 0;
      setArticles(items);
      setTotalCount(total);
      setCurrentPage(page);
      // Retry once after 2 s if DB returned 0 items on first attempt (startup race)
      if (total === 0 && !isRetry) {
        setTimeout(() => fetchArticles(page, pageSize, true), 2000);
        return;
      }
    } catch (err) {
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTopic, selectedSignal, searchQuery, itemsPerPage, dateFilter]);

  // On mount and filter/search change: fetch articles and mirror into context.
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
    setCurrentPage(1);
    fetchArticles(1, itemsPerPage);
  }, [fetchArticles, itemsPerPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchArticles(1, itemsPerPage);
    }, 400);
    setSearchTimeout(timeout);
  };

  const handleTopicChange = (cat) => {
    setSelectedTopic(cat);
    localStorage.setItem(LS_TOPIC_KEY, cat);
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
    } catch (err) {
      setError("Ingestion failed: " + err.message);
      setLoading(false);
    }
  };

  const toggleArticleSelection = (articleId) => {
    const newSet = new Set(selectedArticles);
    if (newSet.has(articleId)) newSet.delete(articleId);
    else newSet.add(articleId);
    setSelectedArticles(newSet);
  };

  const toggleAllArticles = () => {
    if (selectedArticles.size === articles.length) setSelectedArticles(new Set());
    else setSelectedArticles(new Set(articles.map(a => a.id)));
  };

  const handleGenerateReport = async () => {
    if (selectedArticles.size === 0) { setError("Please select at least one article"); return; }
    const selected = articles.filter(a => selectedArticles.has(a.id));
    try {
      const reportData = {
        title:       `AI Report - ${new Date().toLocaleDateString()}`,
        summary:     `Report with ${selected.length} selected articles about ${selectedTopic}`,
        key_points:  selected.slice(0, 5).map(a => a.title),
        articles:    selected.map((a, idx) => ({
          number: idx + 1, title: a.title, source: a.source,
          date: new Date(a.published_at).toLocaleDateString(),
          signal: a.signal_strength?.toLowerCase(), relevance: a.relevance,
          url: a.url, summary: a.summary,
        })),
        funding_count: 0,
      };
      await saveReport(reportData);
      setShowReportModal(false);
      setSelectedArticles(new Set());
      setReportFormat("md");
    } catch (err) {
      setError(`Failed to save report: ${err.message}`);
    }
  };

  const handleDownloadReport = async () => {
    if (selectedArticles.size === 0) { setError("Please select at least one article"); return; }
    const selected = articles.filter(a => selectedArticles.has(a.id));
    let markdownContent = `# AI Watch Report\n\nGenerated: ${new Date().toLocaleString()}\n\n`;
    selected.forEach((article, idx) => {
      markdownContent += `## ${idx + 1}. ${article.title}\n\n`;
      markdownContent += `**Source:** ${article.source}\n**Signal:** ${article.signal_strength}\n**Relevance:** ${article.relevance}/10\n`;
      markdownContent += `**Published:** ${new Date(article.published_at).toLocaleDateString()}\n**URL:** ${article.url || "No URL available"}\n\n`;
      markdownContent += `${article.summary || article.description || ""}\n\n---\n\n`;
    });
    try {
      if (reportFormat === "pdf") {
        const avgRel = selected.length > 0
          ? Math.round(selected.reduce((s, a) => s + (a.relevance || 0), 0) / selected.length * 10) / 10
          : null;
        const cats       = [...new Set(selected.map(a => a.industry || a.category).filter(Boolean))];
        const strongArts = selected.filter(a => (a.signal_strength || "").toLowerCase() === "strong");
        const autoSummary = `This intelligence report covers ${selected.length} article${selected.length !== 1 ? "s" : ""} across ${cats.length > 0 ? cats.slice(0, 4).join(", ") : "multiple sectors"}, with ${strongArts.length} strong signal${strongArts.length !== 1 ? "s" : ""} detected. The analysis highlights key market movements, emerging technologies, and strategic opportunities relevant to technology leadership.`;
        const report = {
          title:        `AI Watch Report - ${new Date().toLocaleDateString()}`,
          topic:        selectedTopic || "All Industries",
          summary:      autoSummary,
          avgRelevance: avgRel,
          articles:     selected.map(a => ({
            title:    a.title,
            source:   a.source || "Unknown",
            date:     new Date(a.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            signal:   a.signal_strength || "Moderate",
            relevance: a.relevance,
            url:      a.url,
            summary:  a.summary,
            keywords: a.keywords || [],
            industry: a.industry || a.category || null,
          })),
        };
        generatePDF(report);
      } else {
        const el = document.createElement("a");
        el.setAttribute("href", "data:text/markdown;charset=utf-8," + encodeURIComponent(markdownContent));
        el.setAttribute("download", `ai-watch-report-${new Date().toISOString().split("T")[0]}.md`);
        el.style.display = "none";
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
      }
    } catch (err) {
      setError(`Failed to download report: ${err.message}`);
    }
  };

  const strongCount  = articles.filter(a => a.signal_strength === "Strong").length;
  const avgRelevance = articles.length
    ? (articles.reduce((a, b) => a + (b.relevance || 5), 0) / articles.length).toFixed(1)
    : "—";

  return (
    <div className="page-container" style={{
      background: "var(--card-bg)",
      padding: isMobile ? "16px" : "24px 28px",
      paddingBottom: isMobile ? "max(24px, env(safe-area-inset-bottom))" : "24px",
      minHeight: "100%",
      maxWidth: "100vw",
      overflowX: "hidden",
      boxSizing: "border-box",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: -0.3, margin: "0 0 4px" }}>
          Explore Intelligence
        </h1>
        <p style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          margin: "0 0 12px 0",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#22c55e",
            display: "inline-block",
            boxShadow: "0 0 6px #22c55e",
          }}/>
          Updated daily at 8:00 AM UTC · {loading ? "—" : `${totalCount} articles indexed`}
        </p>
        {user?.role && ROLE_LABELS[user.role] && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <a
              href="/profile"
              onClick={e => { e.preventDefault(); navigate("/profile"); }}
              style={{ textDecoration: "none" }}
            >
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 11, fontWeight: 700, color: ACCENT,
                background: ACCENT_BG, padding: "3px 10px", borderRadius: 999,
                letterSpacing: 0.3,
              }}>
                Personalised for {ROLE_LABELS[user.role]}
              </span>
            </a>
            {/* Show reset button only when user has manually diverged from their role preset */}
            {rolePreset !== "All Industries" && selectedTopic !== rolePreset && (
              <button
                onClick={() => handleTopicChange(rolePreset)}
                title={`Reset feed to ${rolePreset} (your role default)`}
                style={{
                  fontSize: 11, fontWeight: 600, color: ACCENT,
                  background: "none", border: `1px solid ${ACCENT}50`,
                  borderRadius: 999, padding: "3px 10px", cursor: "pointer",
                  letterSpacing: 0.2,
                }}
              >
                Reset to {rolePreset} ↩
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── KPI STRIP (3 cards) ── */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard label="Articles" value={totalCount} isMobile={isMobile} />
        <StatCard label="Strong Signals" value={strongCount} isMobile={isMobile} />
        <StatCard label="Avg Relevance" value={articles.length ? `${avgRelevance}/10` : "—"} isMobile={isMobile} />
      </div>

      {/* ── TOOLBAR: search + category combobox + view toggle ── */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <div className="full-mobile" style={{ position: "relative", flexShrink: 0, width: 260 }}>
          <Search
            size={14}
            strokeWidth={1.8}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}
          />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px rgba(255, 180, 118,0.2)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--border-color)"; e.target.style.boxShadow = "none"; }}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              border: "1px solid var(--border-color)",
              borderRadius: 6,
              fontSize: 13,
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
              background: "var(--input-bg)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <CategoryCombobox
          selected={selectedTopic}
          onSelect={handleTopicChange}
          isMobile={isMobile}
        />

        {/* Grid / List toggle */}
        <div style={{ display: "flex", gap: 4, marginLeft: "auto" }}>
          {[
            { mode: "list", Icon: List,        title: "List view" },
            { mode: "grid", Icon: LayoutGrid,  title: "Grid view" },
          ].map(({ mode, Icon, title }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              title={title}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 34, height: 34, borderRadius: 6, border: "1.5px solid",
                borderColor: viewMode === mode ? "var(--accent)" : "var(--border-color)",
                background:  viewMode === mode ? "var(--accent-dim)" : "var(--card-bg)",
                color:       viewMode === mode ? "var(--accent)" : "var(--text-muted)",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <Icon size={15} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      {/* ── DATE FILTER ROW ── */}
      <div className="filter-chips-scroll" style={{
        display: "flex",
        gap: 8,
        marginBottom: 20,
        alignItems: "center",
        overflowX: isMobile ? "auto" : "visible",
        paddingBottom: isMobile ? 4 : 0,
      }}>
        <span style={{ fontSize: isMobile ? 12 : 13, color: "var(--text-muted)", marginRight: 4, flexShrink: 0 }}>Period:</span>
        {["Today", "This Week", "This Month", "All Time"].map((period) => (
          <button
            key={period}
            onClick={() => setDateFilter(period)}
            style={{
              fontSize: isMobile ? 11 : 12,
              padding: isMobile ? "5px 12px" : "6px 16px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: dateFilter === period ? "var(--accent)" : "var(--border-color)",
              background: dateFilter === period ? "var(--accent)" : "var(--card-bg)",
              color: dateFilter === period ? "#fff" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.15s",
              fontWeight: dateFilter === period ? 600 : 400,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {period}
          </button>
        ))}
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div style={{
          background: "var(--amber-light)",
          border: "1px solid var(--amber)",
          color: "var(--amber)",
          padding: "12px 16px",
          marginBottom: 16,
          borderRadius: 6,
          fontSize: 12,
        }}>
          {error}
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 40px", fontSize: 12, color: "var(--text-secondary)" }}>
          <div style={{
            width: 36, height: 36,
            margin: "0 auto 16px",
            border: "3px solid var(--border-color)",
            borderTop: "3px solid var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
            Loading articles...
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Fetching intelligence from NewsAPI, Google News and Perplexity
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && articles.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 40px",
          background: "var(--surface)",
          border: "1px solid var(--border-color)",
          borderRadius: 6,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            No articles yet
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24, lineHeight: 1.6 }}>
            Click "Refresh Intelligence" above to fetch the latest tech news across all sectors.
          </div>
          <button
            onClick={handleIngest}
            disabled={loading}
            style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              padding: "10px 24px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}>
            Refresh Intelligence
          </button>
        </div>
      )}

      {/* ── ARTICLE LIST / GRID ── */}
      {!loading && articles.length > 0 && (
        <>
          <style>{`
            .articles-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 16px;
              margin-bottom: 24px;
            }
            @media (max-width: 1024px) {
              .articles-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 640px) {
              .articles-grid { grid-template-columns: 1fr; }
            }
            .articles-list {
              display: flex;
              flex-direction: column;
              gap: 16px;
              margin-bottom: 24px;
            }
          `}</style>
          <div className={viewMode === "grid" ? "articles-grid" : "articles-list"}>
            {articles.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onOpen={(a) => navigate(`/article/${a.id}`, { state: { article: a } })}
                isSaved={saved.has(String(article.id))}
                onToggleSave={toggleSave}
                isMobile={isMobile}
              />
            ))}
          </div>
        </>
      )}

      {/* ── PAGINATION ── */}
      {!loading && articles.length > 0 && (
        <div className="pagination-bar" style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? 12 : 0,
          border: "1px solid var(--border-color)",
          borderRadius: 6,
          padding: isMobile ? "12px 16px" : "14px 20px",
          background: "var(--card-bg)",
        }}>
          {/* Show count selector - hidden on mobile */}
          {!isMobile && (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", marginRight: 4 }}>Show:</span>
              {[10, 25, 50, 100].map(count => (
                <button
                  key={count}
                  onClick={() => { setItemsPerPage(count); handlePageChange(1); }}
                  style={{
                    padding: "4px 10px",
                    border: itemsPerPage === count ? "2px solid var(--accent)" : "1px solid var(--border-color)",
                    background: itemsPerPage === count ? "var(--accent-dim)" : "var(--card-bg)",
                    color: itemsPerPage === count ? "var(--accent)" : "var(--text-secondary)",
                    fontSize: 11,
                    fontWeight: itemsPerPage === count ? 700 : 500,
                    cursor: "pointer",
                    borderRadius: 4,
                  }}
                >
                  {count}
                </button>
              ))}
            </div>
          )}

          {/* Page info and nav row */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: isMobile ? "100%" : "auto",
          }}>
            <span className="pagination-page-info" style={{ fontSize: isMobile ? 11 : 12, color: "var(--text-muted)" }}>
              Page {currentPage} of {totalPages}
            </span>

            <div className="pagination-nav" style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: isMobile ? "6px 12px" : "6px 14px",
                  border: "1px solid var(--border-color)",
                  background: "var(--card-bg)",
                  borderRadius: 4,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  opacity: currentPage === 1 ? 0.4 : 1,
                  fontSize: isMobile ? 11 : 12,
                  color: "var(--text-secondary)",
                }}
              >
                Prev
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: isMobile ? "6px 12px" : "6px 14px",
                  border: "1px solid var(--border-color)",
                  background: "var(--card-bg)",
                  borderRadius: 4,
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  opacity: currentPage === totalPages ? 0.4 : 1,
                  fontSize: isMobile ? 11 : 12,
                  color: "var(--text-secondary)",
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FLOATING REFRESH BUTTON (FAB) ── */}
      <button
        className="floating-action-btn"
        onClick={handleIngest}
        disabled={loading}
        title="Refresh Intelligence"
        style={{
          position: "fixed",
          bottom: isMobile ? "calc(20px + env(safe-area-inset-bottom, 0px))" : 28,
          right: isMobile ? 16 : 28,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: loading ? (isMobile ? "12px 16px" : "14px 20px") : (isMobile ? "12px 18px" : "14px 22px"),
          borderRadius: 999,
          border: "none",
          background: loading ? "var(--accent-dim)" : "var(--accent)",
          color: loading ? "var(--accent)" : "#fff",
          fontSize: isMobile ? 12 : 13,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 20px rgba(255, 180, 118,0.35)",
          transition: "background 0.15s, box-shadow 0.15s",
          letterSpacing: 0.2,
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 6px 28px rgba(255, 180, 118,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(255, 180, 118,0.35)"; }}
      >
        {loading ? (
          <span style={{
            width: 14, height: 14,
            border: "2px solid rgba(255, 180, 118,0.4)",
            borderTop: "2px solid var(--accent)",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.8s linear infinite",
            flexShrink: 0,
          }} />
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        )}
        {isMobile ? (loading ? "..." : "Refresh") : (loading ? "Refreshing..." : "Refresh Intelligence")}
      </button>

      {/* ── REPORT MODAL ── */}
      {showReportModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "var(--card-bg)",
            borderRadius: 8,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            maxWidth: 560,
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
          }}>
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--border-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Generate Report</h2>
              <button
                onClick={() => { setShowReportModal(false); setSelectedArticles(new Set()); }}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)" }}
              >
                x
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
                {selectedArticles.size} article{selectedArticles.size !== 1 ? "s" : ""} selected
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {["md", "pdf"].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setReportFormat(fmt)}
                    style={{
                      padding: "8px 20px",
                      border: reportFormat === fmt ? "2px solid var(--accent)" : "1px solid var(--border-color)",
                      background: reportFormat === fmt ? "var(--accent-dim)" : "var(--card-bg)",
                      color: reportFormat === fmt ? "var(--accent)" : "var(--text-secondary)",
                      fontWeight: reportFormat === fmt ? 700 : 400,
                      fontSize: 12, cursor: "pointer", borderRadius: 4,
                    }}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleGenerateReport}
                  style={{
                    background: "var(--accent)", color: "#fff", border: "none",
                    padding: "10px 20px", borderRadius: 4, fontSize: 13,
                    fontWeight: 700, cursor: "pointer", flex: 1,
                  }}
                >
                  Save to My Reports
                </button>
                <button
                  onClick={handleDownloadReport}
                  style={{
                    background: "var(--card-bg)", color: "var(--accent)",
                    border: "1.5px solid var(--accent)",
                    padding: "10px 20px", borderRadius: 4, fontSize: 13,
                    fontWeight: 700, cursor: "pointer", flex: 1,
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
