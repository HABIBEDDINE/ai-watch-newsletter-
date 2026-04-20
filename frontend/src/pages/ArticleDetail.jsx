import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getArticle, generateSummary } from "../services/api";
import { cleanText } from "../utils/cleanText";
import { useSaved } from "../hooks/useSaved";
import { Bookmark, BookmarkCheck } from "lucide-react";

// Colors now use CSS variables for dark mode support

// Patterns that indicate the summary is a placeholder, not real content
const BAD_PATTERNS = [
  "summary not available",
  "no summary available",
  "error generating",
  "not available",
  "no content",
  "no description",
];

const SOURCE_API_LABELS = {
  perplexity:      "Perplexity AI",
  newsapi:         "NewsAPI",
  newsdata:        "NewsData",
  google_news_rss: "Google News",
};

// Check if a summary is a real value (not a placeholder or bad pattern)
function isValidSummary(text) {
  if (!text) return false;
  const trimmed = text.trim();
  if (trimmed.length < 20) return false;
  const lower = trimmed.toLowerCase();
  if (BAD_PATTERNS.some(p => lower.includes(p))) return false;
  return true;
}

function bestSummary(article) {
  for (const raw of [article.summary, article.description, article.content]) {
    if (isValidSummary(raw)) return raw.trim();
  }
  return null;
}

export default function ArticleDetail() {
  const { id }       = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();

  const [article, setArticle]         = useState(location.state?.article || null);
  const [summary, setSummary]         = useState(null);
  const [loading, setLoading]         = useState(!location.state?.article);
  const [aiLoading, setAiLoading]     = useState(false);
  const [aiError, setAiError]         = useState(null);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);
  const { saved, toggleSave }         = useSaved();

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Always fetch fresh from API on mount so we pick up any cached summary
  // that was written back by a previous /api/summarize call.
  // We use the navstate article only as an instant initial render value.
  useEffect(() => {
    if (!id) return;
    getArticle(id)
      .then(data => {
        // Debug: uncomment to inspect what fields the API actually returns
        // console.log("[ArticleDetail] API article:", data);
        // console.log("[ArticleDetail] summary field:", data?.summary);
        // console.log("[ArticleDetail] description field:", data?.description);
        setArticle(data);
      })
      .catch(() => { /* keep navstate article if fetch fails */ })
      .finally(() => setLoading(false));
  // Run only once on mount — id never changes within a mounted component
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive best summary once article is available; auto-generate only if none found.
  // Keyed on article?.id so mutations to article object don't re-trigger this.
  useEffect(() => {
    if (!article) return;
    const found = bestSummary(article);
    // Get a valid fallback (not "Summary not available." etc)
    const fallback = isValidSummary(article.description) ? article.description
                   : isValidSummary(article.content) ? article.content
                   : null;

    if (found) {
      setSummary(found);
      return;
    }

    // If no content to summarize at all (not even title), return
    if (!fallback && !article.title) {
      return;
    }

    // No usable summary in cache — call AI once
    setAiLoading(true);
    setAiError(null);
    // Pass clean payload with article_id for caching
    const payload = {
      id: article.id,
      title: article.title || '',
      description: isValidSummary(article.description) ? article.description : '',
      content: article.content || '',
      url: article.url || '',
      source: article.source || '',
    };
    generateSummary(payload)
      .then(result => {
        const text = (result.summary || "").trim();
        // Validate that the returned summary is actually useful (not a bad pattern)
        if (isValidSummary(text)) {
          setSummary(text);
          setArticle(prev => prev ? { ...prev, summary: text } : prev);
        } else if (fallback) {
          // AI returned empty or bad — use raw description as fallback
          setSummary(fallback);
        }
      })
      .catch(err => {
        const msg = err.message || "";
        // Use fallback content on any error
        if (fallback) {
          setSummary(fallback);
        }
        if (msg.includes("404")) {
          setAiError("Backend not ready — restart the Python server then refresh.");
        } else if (msg.includes("503")) {
          setAiError("No LLM key configured — check .env for OPENAI_API_KEY or ANTHROPIC_API_KEY.");
        } else if (!fallback) {
          setAiError(msg || "Auto-summary failed.");
        }
      })
      .finally(() => setAiLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id]);

  const handleGenerateSummary = async () => {
    if (!article) return;
    setAiLoading(true);
    setAiError(null);
    try {
      // Pass clean payload with article_id for caching
      const payload = {
        id: article.id,
        title: article.title || '',
        description: isValidSummary(article.description) ? article.description : '',
        content: article.content || '',
        url: article.url || '',
        source: article.source || '',
      };
      const result = await generateSummary(payload);
      const text = (result.summary || "").trim();
      // Validate that the returned summary is actually useful (not a bad pattern)
      if (isValidSummary(text)) {
        setSummary(text);
        setArticle(prev => ({ ...prev, summary: text, description: text }));
      } else {
        setAiError("AI returned an empty summary. Please try again.");
      }
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("404")) {
        setAiError("Backend endpoint not found — restart the Python server (python api.py) then try again.");
      } else if (msg.includes("503")) {
        setAiError("No LLM API key configured — check OPENAI_API_KEY and ANTHROPIC_API_KEY in .env");
      } else if (msg.includes("500")) {
        setAiError("LLM call failed — check server logs. Both OpenAI and Anthropic may be unreachable.");
      } else {
        setAiError(msg || "Could not generate summary. Please try again.");
      }
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 28px", textAlign: "center", fontFamily: "'Open Sans',sans-serif" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 36, height: 36, margin: "0 auto 16px", border: "3px solid var(--border-color)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: "60px 28px", textAlign: "center", fontFamily: "'Open Sans',sans-serif" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Article not found</div>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "var(--accent)", color: "#fff", border: "none", padding: "10px 24px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Back
        </button>
      </div>
    );
  }

  const title      = cleanText(article.title || "");
  const industry   = article.topic || article.search_topic || article.industry || "General";
  const date       = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";
  const url        = article.url || article.link;
  const relevance  = article.relevance || article.relevance_score || 5;
  const sourceApi  = article.source_api || "";
  const sourceLabel = SOURCE_API_LABELS[sourceApi] || sourceApi || "Unknown";

  const cleanSummary = (text) =>
    text
      .replace(/^[-•]\s*/gm, "")
      .replace(/\n+/g, " ")
      .trim();

  return (
    <div style={{ background: "var(--card-bg)", minHeight: "100%", fontFamily: "'Open Sans',sans-serif", color: "var(--text-primary)" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── BACK HEADER ── */}
      <div style={{ padding: `16px ${isMobile ? 16 : 28}px`, borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-hover)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "1px solid var(--border-color)", borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", cursor: "pointer", transition: "background 0.15s" }}
        >
          Back
        </button>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Article Detail</span>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: `32px ${isMobile ? 16 : 28}px` }}>

        {/* Badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent)" }}>
            {industry}
          </span>
          {article.market_segment && article.market_segment !== "General" && article.market_segment !== industry && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}>
              {article.market_segment}
            </span>
          )}
          {sourceLabel && sourceLabel !== "Unknown" && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: "var(--amber-light)", color: "var(--amber)", border: "1px solid var(--amber)" }}>
              via {sourceLabel}
            </span>
          )}
        </div>

        {/* Title + bookmark */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.35, margin: 0, letterSpacing: -0.4, flex: 1 }}>
            {title}
          </h1>
          <button
            onClick={() => toggleSave("article", article.id, {
              title: article.title,
              category: industry,
              signal: article.signal_strength,
              source: article.source,
              url,
            })}
            title={saved.has(String(article.id)) ? "Remove from saved" : "Save article"}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700,
              cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
              ...(saved.has(String(article.id))
                ? { background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent)" }
                : { background: "var(--card-bg)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }),
            }}
          >
            {saved.has(String(article.id))
              ? <><BookmarkCheck size={14} strokeWidth={2} /> Saved</>
              : <><Bookmark size={14} strokeWidth={2} /> Save</>}
          </button>
        </div>

        {/* Meta */}
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 28 }}>
          {article.source && <span>{article.source}</span>}
          {date && <span> · {date}</span>}
          <span> · Relevance: <strong style={{ color: "var(--accent)" }}>{relevance}/10</strong></span>
        </div>

        {/* ── SUMMARY SECTION ── */}
        <div style={{ marginBottom: 32, padding: "24px", background: "var(--bg-active)", borderRadius: 8, border: "1px solid var(--border-color)", borderLeft: "4px solid var(--accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--accent)", letterSpacing: 1.2, textTransform: "uppercase" }}>
              Summary
            </div>
            {!isValidSummary(summary) && !aiLoading && (
              <button
                onClick={handleGenerateSummary}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--accent)"; }}
                style={{ fontSize: 11, fontWeight: 700, padding: "5px 14px", border: "1.5px solid var(--accent)", borderRadius: 4, background: "transparent", color: "var(--accent)", cursor: "pointer", transition: "all 0.15s", letterSpacing: 0.3 }}
              >
                Generate Summary
              </button>
            )}
          </div>

          {aiLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
              <div style={{ width: 18, height: 18, border: "2px solid var(--border-color)", borderTop: "2px solid var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>🤖 Generating AI summary...</span>
            </div>
          ) : isValidSummary(summary) ? (
            <p style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.8, margin: 0 }}>
              {cleanSummary(summary)}
            </p>
          ) : (
            <div>
              <div style={{ fontSize: 14, color: "var(--text-muted)", fontStyle: "italic", marginBottom: aiError ? 10 : 0 }}>
                No content available for this article.
                {url && (
                  <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", marginLeft: 6, fontStyle: "normal", fontWeight: 600 }}>
                    Read original →
                  </a>
                )}
              </div>
              {aiError && (
                <div style={{ fontSize: 12, color: "var(--amber)", background: "var(--amber-light)", border: "1px solid var(--amber)", padding: "8px 12px", borderRadius: 4, marginTop: 8 }}>
                  {aiError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Key Info */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-primary)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>
            Key Info
          </div>
          <div style={{ border: "1px solid var(--border-color)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
              {[
                ["Industry",   industry],
                ["Source",     article.source || "—"],
                ["Published",  date || "—"],
                ["Relevance",  `${relevance}/10`],
                ["Segment",    article.market_segment || "General"],
                ["Signal",     article.signal_strength || "—"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", gap: 12, padding: "12px 16px", background: "var(--card-bg)", borderBottom: "1px solid var(--border-color)" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", minWidth: 80 }}>{label}</span>
                  <span style={{ fontSize: 12, color: "var(--text-primary)" }}>{value}</span>
                </div>
              ))}
            </div>
            {article.keywords && article.keywords.length > 0 && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: "var(--card-bg)", borderBottom: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", minWidth: 80, paddingTop: 3 }}>Keywords</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {article.keywords.map(kw => (
                    <span key={kw} style={{ background: "var(--accent-dim)", color: "var(--accent)", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: "1px solid var(--accent)" }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Actors */}
        {article.key_actors && article.key_actors !== "None" && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-primary)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>
              Key Actors
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, background: "var(--surface)", padding: "16px", borderRadius: 6, border: "1px solid var(--border-color)" }}>
              {article.key_actors}
            </div>
          </div>
        )}

        {/* Funding */}
        {article.funding && article.funding !== "None" && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "var(--text-primary)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>
              Funding
            </div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, background: "var(--delta-bg)", padding: "16px", borderRadius: 6, border: "1px solid var(--delta-color)" }}>
              {article.funding}
            </div>
          </div>
        )}

        {/* Read Full Article */}
        {url && (
          <div style={{ textAlign: "center" }}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", background: "var(--accent)", color: "#fff", padding: "13px 32px", borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: 0.3 }}
            >
              Read Full Article
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
