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

const ACCENT   = "#1A4A9E";
const ACCENT_BG = "#e8eef8";

const B = {
  purple:    ACCENT,
  purplePale: ACCENT_BG,
  white:     "#ffffff",
  gray50:    "#fafafa",
  gray100:   "#f4f4f4",
  gray200:   "#e8e8e8",
  gray300:   "#d0d0d0",
  gray400:   "#999999",
  gray500:   "#666666",
  gray600:   "#444444",
  gray700:   "#222222",
  gray900:   "#111111",
  green:     "#C45F00",
  greenLight:"#fdf0e6",
  amber:     "#b45309",
  amberLight:"#fef3e2",
  blue:      "#1a5fa8",
};

const SIGNALS = ["All", "Strong", "Weak"];

function StatCard({ label, value }) {
  return (
    <div style={{
      background: B.white,
      border: `1px solid ${B.gray200}`,
      borderRadius: 6,
      padding: "18px 20px",
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: ACCENT, marginBottom: 4, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 13, color: B.gray500, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function ArticleCard({ article, onOpen, isSaved, onToggleSave }) {
  const isStrong = article.signal_strength === "Strong";
  const title    = cleanText(article.title);
  const rawSum   = cleanText(article.summary || article.description || "")
    .replace(/^[-•]\s*/gm, "").replace(/\n+/g, " ").trim();
  const summary  = rawSum && rawSum !== title && rawSum.length > 20 ? rawSum : null;
  const industry = article.topic || article.search_topic || article.industry || "General";
  const date     = article.published_at
    ? new Date(article.published_at).toLocaleDateString()
    : "";

  return (
    <div
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = B.gray300;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = B.gray200;
      }}
      style={{
        background: B.white,
        border: `1px solid ${B.gray200}`,
        borderRadius: 6,
        padding: "20px",
        cursor: "pointer",
        transition: "box-shadow 0.2s, border-color 0.2s",
        position: "relative",
      }}
    >
      {/* Bookmark button */}
      {onToggleSave && (
        <button
          onClick={e => { e.stopPropagation(); onToggleSave("article", article.id, { title: article.title, category: industry, signal: article.signal_strength, source: article.source, url: article.url }); }}
          title={isSaved ? "Remove from saved" : "Save article"}
          style={{
            position: "absolute", top: 14, right: 14,
            background: "none", border: "none", cursor: "pointer", padding: 4,
            color: isSaved ? ACCENT : B.gray300,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Bookmark size={16} strokeWidth={2} fill={isSaved ? ACCENT : "none"} />
        </button>
      )}

      {/* Clickable area */}
      <div onClick={() => onOpen(article)}>
        {/* Title + Signal badge */}
        <div className="article-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 10, paddingRight: onToggleSave ? 28 : 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: B.gray900, lineHeight: 1.4, flex: 1 }}>
            {title}
          </div>
          <span className="signal-badge" style={{
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 999,
            letterSpacing: 0.5,
            marginTop: 2,
            ...(isStrong
              ? { background: B.green, color: "#fff" }
              : { background: "transparent", color: B.gray400, border: `1px solid ${B.gray300}` }),
          }}>
            {isStrong ? "STRONG" : "WEAK"}
          </span>
        </div>

        {/* Summary */}
        <div style={{
          fontSize: 15,
          color: summary ? B.gray500 : B.gray300,
          lineHeight: 1.65,
          marginBottom: 14,
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          fontStyle: summary ? "normal" : "italic",
        }}>
          {summary || "No summary — click to read full article."}
        </div>

        {/* Metadata footer */}
        <div style={{ fontSize: 13, color: B.gray400 }}>
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

  const { saved, toggleSave } = useSaved();

  const fetchArticles = useCallback(async (page = 1, pageSize = itemsPerPage, isRetry = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getArticles({
        topic:    selectedTopic === "All Industries" ? undefined : selectedTopic,
        signal:   selectedSignal === "All" ? undefined : selectedSignal,
        search:   searchQuery || undefined,
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
  }, [selectedTopic, selectedSignal, searchQuery, itemsPerPage]);

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
      markdownContent += `${article.summary || "Summary not available"}\n\n---\n\n`;
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
    <div className="pad-mobile" style={{ background: B.white, padding: "24px 28px", minHeight: "100%" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: B.gray900, letterSpacing: -0.3, margin: "0 0 4px" }}>
          Explore Intelligence
        </h1>
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
        <StatCard label="Articles Today"  value={totalCount} />
        <StatCard label="Strong Signals"  value={strongCount} />
        <StatCard label="Avg Relevance"   value={articles.length ? `${avgRelevance}/10` : "—"} />
      </div>

      {/* ── TOOLBAR: search + category combobox + view toggle ── */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <div className="full-mobile" style={{ position: "relative", flexShrink: 0, width: 260 }}>
          <Search
            size={14}
            strokeWidth={1.8}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: B.gray400, pointerEvents: "none" }}
          />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px ${ACCENT}20`; }}
            onBlur={e => { e.target.style.borderColor = B.gray200; e.target.style.boxShadow = "none"; }}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              border: `1px solid ${B.gray200}`,
              borderRadius: 6,
              fontSize: 13,
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
              background: B.white,
            }}
          />
        </div>
        <CategoryCombobox
          selected={selectedTopic}
          onSelect={handleTopicChange}
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
                width: 34, height: 34, borderRadius: 6, border: `1.5px solid`,
                borderColor: viewMode === mode ? ACCENT : B.gray200,
                background:  viewMode === mode ? ACCENT_BG : B.white,
                color:       viewMode === mode ? ACCENT : B.gray400,
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              <Icon size={15} strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div style={{
          background: B.amberLight,
          border: `1px solid ${B.amber}`,
          color: B.amber,
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
        <div style={{ textAlign: "center", padding: "60px 40px", fontSize: 12, color: B.gray500 }}>
          <div style={{
            width: 36, height: 36,
            margin: "0 auto 16px",
            border: `3px solid ${B.gray200}`,
            borderTop: `3px solid ${ACCENT}`,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: B.gray900, marginBottom: 6 }}>
            Loading articles...
          </div>
          <div style={{ fontSize: 12, color: B.gray400, lineHeight: 1.6 }}>
            Fetching intelligence from NewsAPI, Google News and Perplexity
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && articles.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 40px",
          background: B.gray50,
          border: `1px solid ${B.gray200}`,
          borderRadius: 6,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: B.gray900, marginBottom: 8 }}>
            No articles yet
          </div>
          <div style={{ fontSize: 13, color: B.gray500, marginBottom: 24, lineHeight: 1.6 }}>
            Click "Refresh Intelligence" above to fetch the latest tech news across all sectors.
          </div>
          <button
            onClick={handleIngest}
            disabled={loading}
            style={{
              background: ACCENT,
              color: B.white,
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
              />
            ))}
          </div>
        </>
      )}

      {/* ── PAGINATION ── */}
      {!loading && articles.length > 0 && (
        <div className="pagination-bar" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: `1px solid ${B.gray200}`,
          borderRadius: 6,
          padding: "14px 20px",
          background: B.white,
        }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: B.gray500, marginRight: 4 }}>Show:</span>
            {[10, 25, 50, 100].map(count => (
              <button
                key={count}
                onClick={() => { setItemsPerPage(count); handlePageChange(1); }}
                style={{
                  padding: "4px 10px",
                  border: itemsPerPage === count ? `2px solid ${ACCENT}` : `1px solid ${B.gray200}`,
                  background: itemsPerPage === count ? ACCENT_BG : B.white,
                  color: itemsPerPage === count ? ACCENT : B.gray600,
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

          <span className="pagination-page-info" style={{ fontSize: 12, color: B.gray500 }}>
            Page {currentPage} of {totalPages}
          </span>

          <div className="pagination-nav" style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "6px 14px",
                border: `1px solid ${B.gray200}`,
                background: B.white,
                borderRadius: 4,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.4 : 1,
                fontSize: 12,
                color: B.gray600,
              }}
            >
              Prev
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "6px 14px",
                border: `1px solid ${B.gray200}`,
                background: B.white,
                borderRadius: 4,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                opacity: currentPage === totalPages ? 0.4 : 1,
                fontSize: 12,
                color: B.gray600,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── FLOATING REFRESH BUTTON (FAB) ── */}
      <button
        onClick={handleIngest}
        disabled={loading}
        title="Refresh Intelligence"
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: loading ? "14px 20px" : "14px 22px",
          borderRadius: 999,
          border: "none",
          background: loading ? ACCENT_BG : ACCENT,
          color: loading ? ACCENT : "#fff",
          fontSize: 13,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 4px 20px rgba(26,74,158,0.35)",
          transition: "background 0.15s, box-shadow 0.15s",
          letterSpacing: 0.2,
        }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 6px 28px rgba(26,74,158,0.5)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,74,158,0.35)"; }}
      >
        {loading ? (
          <span style={{
            width: 14, height: 14,
            border: `2px solid ${ACCENT}40`,
            borderTop: `2px solid ${ACCENT}`,
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
        {loading ? "Refreshing..." : "Refresh Intelligence"}
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
            background: B.white,
            borderRadius: 8,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            maxWidth: 560,
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
          }}>
            <div style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${B.gray200}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: B.gray900, margin: 0 }}>Generate Report</h2>
              <button
                onClick={() => { setShowReportModal(false); setSelectedArticles(new Set()); }}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: B.gray400 }}
              >
                x
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ fontSize: 13, color: B.gray600, marginBottom: 16 }}>
                {selectedArticles.size} article{selectedArticles.size !== 1 ? "s" : ""} selected
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {["md", "pdf"].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setReportFormat(fmt)}
                    style={{
                      padding: "8px 20px",
                      border: reportFormat === fmt ? `2px solid ${ACCENT}` : `1px solid ${B.gray200}`,
                      background: reportFormat === fmt ? ACCENT_BG : B.white,
                      color: reportFormat === fmt ? ACCENT : B.gray600,
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
                    background: ACCENT, color: B.white, border: "none",
                    padding: "10px 20px", borderRadius: 4, fontSize: 13,
                    fontWeight: 700, cursor: "pointer", flex: 1,
                  }}
                >
                  Save to My Reports
                </button>
                <button
                  onClick={handleDownloadReport}
                  style={{
                    background: B.white, color: ACCENT,
                    border: `1.5px solid ${ACCENT}`,
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
