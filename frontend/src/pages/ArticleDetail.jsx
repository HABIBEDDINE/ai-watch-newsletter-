import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getArticle, generateSummary, matchSolutions } from "../services/api";
import { cleanText } from "../utils/cleanText";

const ACCENT = "#1A4A9E";
const B = {
  purple:     ACCENT,
  purplePale: "#e8eef8",
  white:      "#ffffff",
  gray50:     "#fafafa",
  gray100:    "#f4f4f4",
  gray200:    "#e8e8e8",
  gray300:    "#d0d0d0",
  gray400:    "#999999",
  gray500:    "#666666",
  gray600:    "#444444",
  gray700:    "#222222",
  gray900:    "#111111",
  green:      "#C45F00",
  greenLight: "#fdf0e6",
  amber:      "#b45309",
  amberLight: "#fef3e2",
  darkBg:     "#0a0a0a",
  darkBorder: "#2a2a2a",
};

const BAD_PATTERNS = [
  "summary not available",
  "no summary available",
  "error generating",
];

const SOURCE_API_LABELS = {
  perplexity:      "Perplexity AI",
  newsapi:         "NewsAPI",
  newsdata:        "NewsData",
  google_news_rss: "Google News",
};

function bestSummary(article) {
  for (const raw of [article.summary, article.description, article.content]) {
    if (!raw) continue;
    const text = raw.trim();
    if (text.length < 20) continue;
    const lower = text.toLowerCase();
    if (BAD_PATTERNS.some(p => lower.includes(p))) continue;
    return text;
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
  const [matchResult, setMatchResult] = useState(null);   // array of {solution, explanation}
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError]   = useState(null);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768);

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
    console.log(`[ArticleDetail] FETCHING SUMMARY CHECK for ${article.id} — stored summary: "${found ? found.slice(0, 60) + "..." : "none"}"`);
    if (found) {
      setSummary(found);
      return;
    }
    // No usable summary in cache — call AI once
    setAiLoading(true);
    setAiError(null);
    console.log(`[ArticleDetail] CALLING /api/summarize for article ${article.id}`);
    generateSummary(article)
      .then(result => {
        const text = (result.summary || "").trim();
        if (text && text.length > 20) {
          setSummary(text);
          setArticle(prev => prev ? { ...prev, summary: text } : prev);
        }
      })
      .catch(err => {
        const msg = err.message || "";
        if (msg.includes("404")) {
          setAiError("Backend not ready — restart the Python server then refresh.");
        } else if (msg.includes("503")) {
          setAiError("No LLM key configured — check .env for OPENAI_API_KEY or ANTHROPIC_API_KEY.");
        } else {
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
      const result = await generateSummary(article);
      const text = (result.summary || "").trim();
      if (text && text.length > 20) {
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

  const handleMatchSolutions = async () => {
    if (matchResult) return;   // already cached — show existing result
    setMatchLoading(true);
    setMatchError(null);
    try {
      const res = await matchSolutions({
        title:    article.title || "",
        summary:  summary || article.description || "",
        industry: article.topic || article.industry || "General",
        signal:   article.signal_strength || "",
      });
      setMatchResult(res.matches || []);
    } catch (err) {
      setMatchError(err.message || "Failed to match solutions.");
    } finally {
      setMatchLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "60px 28px", textAlign: "center", fontFamily: "'Open Sans',sans-serif" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 36, height: 36, margin: "0 auto 16px", border: `3px solid ${B.gray200}`, borderTop: `3px solid ${ACCENT}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ fontSize: 14, color: B.gray500 }}>Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: "60px 28px", textAlign: "center", fontFamily: "'Open Sans',sans-serif" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: B.gray900, marginBottom: 8 }}>Article not found</div>
        <button
          onClick={() => navigate(-1)}
          style={{ background: ACCENT, color: B.white, border: "none", padding: "10px 24px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Back
        </button>
      </div>
    );
  }

  const title      = cleanText(article.title || "");
  const isStrong   = article.signal_strength === "Strong";
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
    <div style={{ background: B.white, minHeight: "100%", fontFamily: "'Open Sans',sans-serif", color: B.gray900 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── BACK HEADER ── */}
      <div style={{ padding: `16px ${isMobile ? 16 : 28}px`, borderBottom: `1px solid ${B.gray200}`, display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          onMouseEnter={e => { e.currentTarget.style.background = B.gray100; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${B.gray200}`, borderRadius: 6, padding: "7px 14px", fontSize: 12, fontWeight: 700, color: B.gray600, cursor: "pointer", transition: "background 0.15s" }}
        >
          Back
        </button>
        <span style={{ fontSize: 12, color: B.gray400 }}>Article Detail</span>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: `32px ${isMobile ? 16 : 28}px` }}>

        {/* Badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 999, letterSpacing: 0.5,
            ...(isStrong
              ? { background: B.green, color: "#fff" }
              : { background: "transparent", color: B.gray400, border: `1px solid ${B.gray300}` }),
          }}>
            {isStrong ? "STRONG SIGNAL" : "WEAK SIGNAL"}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 999, background: B.purplePale, color: ACCENT, border: `1px solid ${ACCENT}40` }}>
            {industry}
          </span>
          {article.market_segment && article.market_segment !== "General" && article.market_segment !== industry && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: B.gray100, color: B.gray500, border: `1px solid ${B.gray200}` }}>
              {article.market_segment}
            </span>
          )}
          {sourceLabel && (
            <span style={{ fontSize: 10, fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: B.amberLight, color: B.amber, border: `1px solid ${B.amber}40` }}>
              via {sourceLabel}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, color: B.gray900, lineHeight: 1.35, marginBottom: 16, letterSpacing: -0.4 }}>
          {title}
        </h1>

        {/* Meta */}
        <div style={{ fontSize: 12, color: B.gray400, marginBottom: 28 }}>
          {article.source && <span>{article.source}</span>}
          {date && <span> · {date}</span>}
          <span> · Relevance: <strong style={{ color: ACCENT }}>{relevance}/10</strong></span>
        </div>

        {/* ── SUMMARY SECTION ── */}
        <div style={{ marginBottom: 32, padding: "24px", background: B.gray50, borderRadius: 8, border: `1px solid ${B.gray200}`, borderLeft: `4px solid ${ACCENT}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: ACCENT, letterSpacing: 1.2, textTransform: "uppercase" }}>
              Summary
            </div>
            {!summary && !aiLoading && (
              <button
                onClick={handleGenerateSummary}
                onMouseEnter={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = B.white; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = ACCENT; }}
                style={{ fontSize: 11, fontWeight: 700, padding: "5px 14px", border: `1.5px solid ${ACCENT}`, borderRadius: 4, background: "transparent", color: ACCENT, cursor: "pointer", transition: "all 0.15s", letterSpacing: 0.3 }}
              >
                Generate Summary
              </button>
            )}
          </div>

          {aiLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
              <div style={{ width: 18, height: 18, border: `2px solid ${B.gray200}`, borderTop: `2px solid ${ACCENT}`, borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: B.gray500 }}>Generating AI summary (OpenAI → Anthropic)...</span>
            </div>
          ) : summary ? (
            <p style={{ fontSize: 15, color: B.gray600, lineHeight: 1.8, margin: 0 }}>
              {cleanSummary(summary)}
            </p>
          ) : (
            <div>
              <div style={{ fontSize: 14, color: B.gray400, marginBottom: aiError ? 10 : 0 }}>
                No summary available for this article.
                {url && <span> Click <strong>Read Full Article</strong> below to view the source, or use the button above to generate one with AI.</span>}
              </div>
              {aiError && (
                <div style={{ fontSize: 12, color: B.amber, background: B.amberLight, border: `1px solid ${B.amber}40`, padding: "8px 12px", borderRadius: 4, marginTop: 8 }}>
                  {aiError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Key Info */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: B.gray900, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>
            Key Info
          </div>
          <div style={{ border: `1px solid ${B.gray200}`, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
              {[
                ["Signal",     isStrong ? "Strong" : "Weak"],
                ["Industry",   industry],
                ["Source",     article.source || "—"],
                ["Published",  date || "—"],
                ["Relevance",  `${relevance}/10`],
                ["Segment",    article.market_segment || "General"],
                ["Data API",   sourceLabel || "—"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", gap: 12, padding: "12px 16px", background: B.white, borderBottom: `1px solid ${B.gray200}` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: B.gray400, minWidth: 80 }}>{label}</span>
                  <span style={{ fontSize: 12, color: B.gray700 }}>{value}</span>
                </div>
              ))}
            </div>
            {article.keywords && article.keywords.length > 0 && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: B.white, borderBottom: `1px solid ${B.gray200}` }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: B.gray400, minWidth: 80, paddingTop: 3 }}>Keywords</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {article.keywords.map(kw => (
                    <span key={kw} style={{ background: "#e8eef8", color: ACCENT, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: "1px solid #b8ccee" }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MATCH DXC SOLUTIONS ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: B.gray900, letterSpacing: 1.2, textTransform: "uppercase" }}>
              DXC Solution Match
            </div>
            {!matchResult && (
              <button
                onClick={handleMatchSolutions}
                disabled={matchLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 16px", borderRadius: 6,
                  border: `1.5px solid ${ACCENT}`,
                  background: matchLoading ? B.purplePale : ACCENT,
                  color: matchLoading ? ACCENT : "#fff",
                  fontSize: 12, fontWeight: 700, cursor: matchLoading ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                {matchLoading ? (
                  <>
                    <span style={{ width: 12, height: 12, border: `2px solid ${ACCENT}40`, borderTop: `2px solid ${ACCENT}`, borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    Matching...
                  </>
                ) : (
                  "Match DXC Solutions"
                )}
              </button>
            )}
          </div>

          {matchError && (
            <div style={{ fontSize: 12, color: B.amber, background: B.amberLight, border: `1px solid ${B.amber}40`, padding: "8px 12px", borderRadius: 6, marginBottom: 10 }}>
              {matchError}
            </div>
          )}

          {matchResult && matchResult.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {matchResult.map((m, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, alignItems: "flex-start",
                  padding: "14px 16px", background: B.white,
                  border: `1px solid ${B.gray200}`, borderLeft: `3px solid ${ACCENT}`,
                  borderRadius: 6,
                }}>
                  <span style={{
                    flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                    background: ACCENT, color: "#fff",
                    fontSize: 11, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {i + 1}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.gray900, marginBottom: 3 }}>
                      {m.solution}
                    </div>
                    <div style={{ fontSize: 12, color: B.gray500, lineHeight: 1.6 }}>
                      {m.explanation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!matchResult && !matchLoading && !matchError && (
            <div style={{ fontSize: 13, color: B.gray400, fontStyle: "italic" }}>
              Click the button to find the most relevant DXC solutions for this article.
            </div>
          )}
        </div>

        {/* Key Actors */}
        {article.key_actors && article.key_actors !== "None" && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: B.gray900, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>
              Key Actors
            </div>
            <div style={{ fontSize: 13, color: B.gray600, lineHeight: 1.7, background: B.gray50, padding: "16px", borderRadius: 6, border: `1px solid ${B.gray200}` }}>
              {article.key_actors}
            </div>
          </div>
        )}

        {/* Funding */}
        {article.funding && article.funding !== "None" && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: B.gray900, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14 }}>
              Funding
            </div>
            <div style={{ fontSize: 13, color: B.gray600, lineHeight: 1.7, background: B.greenLight, padding: "16px", borderRadius: 6, border: `1px solid ${B.green}40` }}>
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
              style={{ display: "inline-block", background: ACCENT, color: B.white, padding: "13px 32px", borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: "none", letterSpacing: 0.3 }}
            >
              Read Full Article
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
