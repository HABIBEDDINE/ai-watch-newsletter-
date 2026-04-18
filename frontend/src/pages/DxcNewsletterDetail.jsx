import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDxcNewsletterById, getDxcNewsletters, generateDxcJournalCard } from "../services/api";
import { ArrowLeft, Calendar, Tag, FileText, ChevronLeft, ChevronRight, X, ZoomIn, Newspaper, Lightbulb, BookOpen } from "lucide-react";

// Year-based badge colors (theme-aware)
const getYearColor = (month) => {
  if (!month) return { bg: "var(--bg-surface)", color: "var(--text-muted)" };
  if (month.includes("2026")) return { bg: "var(--topic-robotics-bg)", color: "var(--purple)" };
  if (month.includes("2025")) return { bg: "var(--topic-ai-bg)", color: "var(--accent)" };
  return { bg: "var(--bg-surface)", color: "var(--text-secondary)" };
};

// Category badge colors (theme-aware)
const CATEGORY_COLORS = {
  "Business & Clients": { bg: "var(--topic-ai-bg)", color: "var(--accent)" },
  "Quality": { bg: "var(--topic-healthtech-bg)", color: "var(--green)" },
  "Innovation & Tech": { bg: "var(--signal-strong-bg)", color: "var(--accent-orange)" },
  "CSR & Community": { bg: "var(--topic-robotics-bg)", color: "var(--purple)" },
  "DEI & Inclusion": { bg: "var(--topic-ai-bg)", color: "var(--accent)" },
  "Awards & Recognition": { bg: "var(--amber-light)", color: "var(--amber)" },
  "Wellbeing & Health": { bg: "var(--topic-healthtech-bg)", color: "var(--green)" },
  "Events & Upcoming": { bg: "var(--topic-ai-bg)", color: "var(--accent)" },
  "Referral & Jobs": { bg: "var(--topic-robotics-bg)", color: "var(--purple)" },
  "Newsletter Content": { bg: "var(--bg-surface)", color: "var(--text-secondary)" },
};

// Category header colors for journal card
const CATEGORY_HEADER_COLORS = {
  "Quality": "var(--green)",
  "Business & Clients": "var(--accent)",
  "Innovation & Tech": "var(--accent-orange)",
  "CSR & Community": "var(--purple)",
  "DEI & Inclusion": "var(--accent)",
  "Awards & Recognition": "var(--amber)",
  "Wellbeing & Health": "var(--green)",
  "Events & Upcoming": "var(--accent)",
  "Referral & Jobs": "var(--purple)",
  "Newsletter Content": "var(--text-secondary)",
};

// Lightbox component for full-screen image viewing
function ImageLightbox({ imageUrl, title, onClose, onPrev, onNext, hasPrev, hasNext }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3));
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "none",
          background: "rgba(255,255,255,0.1)",
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10001,
        }}
      >
        <X size={24} />
      </button>

      {/* Previous button */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          style={{
            position: "absolute",
            left: 20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
          }}
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          style={{
            position: "absolute",
            right: 20,
            top: "50%",
            transform: "translateY(-50%)",
            width: 48,
            height: 48,
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001,
          }}
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Image container */}
      <div
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            objectFit: "contain",
            transform: `scale(${scale})`,
            transition: "transform 0.1s ease-out",
            cursor: scale > 1 ? "zoom-out" : "zoom-in",
          }}
          onClick={() => setScale(s => s > 1 ? 1 : 1.5)}
        />
      </div>

      {/* Zoom indicator */}
      <div style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: 20,
        fontSize: 12,
      }}>
        {Math.round(scale * 100)}% · Scroll to zoom · Click image to toggle · Esc to close
      </div>
    </div>
  );
}

export default function DxcNewsletterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showLightbox, setShowLightbox] = useState(false);
  const [adjacentArticles, setAdjacentArticles] = useState({ prev: null, next: null });
  const [journalCard, setJournalCard] = useState(null);
  const [journalCardLoading, setJournalCardLoading] = useState(true);
  const [showArticleModal, setShowArticleModal] = useState(false);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Fetch article
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getDxcNewsletterById(id)
      .then(data => setArticle(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch adjacent articles for navigation
  const fetchAdjacentArticles = useCallback(async () => {
    if (!article) return;
    try {
      // Fetch articles from the same month to find prev/next
      const response = await getDxcNewsletters({
        month: article.month || undefined,
        limit: 100,
      });
      const items = response.items || [];
      const currentIdx = items.findIndex(a => String(a.id) === String(id));
      if (currentIdx !== -1) {
        setAdjacentArticles({
          prev: currentIdx > 0 ? items[currentIdx - 1] : null,
          next: currentIdx < items.length - 1 ? items[currentIdx + 1] : null,
        });
      }
    } catch (err) {
      console.error("Failed to fetch adjacent articles:", err);
    }
  }, [article, id]);

  useEffect(() => {
    fetchAdjacentArticles();
  }, [fetchAdjacentArticles]);

  // Fetch AI-generated journal card
  useEffect(() => {
    if (!article?.id) return;
    setJournalCardLoading(true);
    setJournalCard(null);
    generateDxcJournalCard(article.id)
      .then(data => {
        if (data && data.headline) {
          setJournalCard(data);
        }
      })
      .catch(() => setJournalCard(null))
      .finally(() => setJournalCardLoading(false));
  }, [article?.id]);

  // Close article modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showArticleModal) {
        setShowArticleModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showArticleModal]);

  const navigateToArticle = (articleId) => {
    navigate(`/dxc-newsletter/${articleId}`);
  };

  if (loading) {
    return (
      <div className="newsletter-detail" style={{
        padding: "60px 28px",
        textAlign: "center",
        background: "var(--bg-primary)",
        minHeight: "100%",
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 36,
          height: 36,
          margin: "0 auto 16px",
          border: "3px solid var(--border)",
          borderTop: "3px solid var(--accent-orange)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Loading article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="newsletter-detail" style={{
        padding: "60px 28px",
        textAlign: "center",
        background: "var(--bg-primary)",
        minHeight: "100%",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
          {error || "Article not found"}
        </div>
        <button
          onClick={() => navigate("/dxc-newsletter")}
          style={{
            background: "var(--accent-orange)",
            color: "#fff",
            border: "none",
            padding: "10px 24px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Back to Newsletters
        </button>
      </div>
    );
  }

  const title = article.title || "Untitled";
  const content = article.content || "";
  const month = article.month || "";
  const category = article.category || "";
  const edition = article.newsletter_edition || `ONETEAM Newsletter - ${month}`;
  const imageUrl = article.image_url;
  const pageNumber = article.page_number;
  const yearColor = getYearColor(month);
  const catColor = CATEGORY_COLORS[category] || { bg: "var(--surface)", color: "var(--text-secondary)" };
  const catHeaderColor = CATEGORY_HEADER_COLORS[category] || "var(--accent)";
  const contentPreview = content.length > 300 ? content.substring(0, 300) + "..." : content;

  return (
    <div className="newsletter-detail" style={{
      background: "var(--bg-primary)",
      minHeight: "100%",
      color: "var(--text-primary)",
    }}>
      {/* Lightbox */}
      {showLightbox && imageUrl && (
        <ImageLightbox
          imageUrl={imageUrl}
          title={title}
          onClose={() => setShowLightbox(false)}
          onPrev={() => adjacentArticles.prev && navigateToArticle(adjacentArticles.prev.id)}
          onNext={() => adjacentArticles.next && navigateToArticle(adjacentArticles.next.id)}
          hasPrev={!!adjacentArticles.prev}
          hasNext={!!adjacentArticles.next}
        />
      )}

      {/* Full-screen Article Modal */}
      {showArticleModal && (
        <div
          onClick={() => setShowArticleModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 800,
              maxHeight: "90vh",
              background: "var(--bg-primary)",
              borderRadius: 16,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal header */}
            <div style={{
              padding: "24px 48px",
              borderBottom: "1px solid var(--border)",
              position: "relative",
            }}>
              {/* Close button */}
              <button
                onClick={() => setShowArticleModal(false)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>

              {/* Badges */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: catColor.bg,
                  color: catColor.color,
                }}>
                  {category}
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: yearColor.bg,
                  color: yearColor.color,
                }}>
                  {month}
                </span>
              </div>

              {/* Title */}
              <h2 style={{
                fontSize: 22,
                fontWeight: 800,
                color: "var(--text-primary)",
                lineHeight: 1.3,
                margin: 0,
                paddingRight: 40,
              }}>
                {title}
              </h2>
            </div>

            {/* Modal content */}
            <div style={{
              padding: 48,
              overflowY: "auto",
              flex: 1,
            }}>
              <div style={{
                fontSize: 15,
                color: "var(--text-primary)",
                lineHeight: 1.8,
                whiteSpace: "pre-wrap",
              }}>
                {content}
              </div>
            </div>

            {/* Modal footer */}
            <div style={{
              padding: "16px 48px",
              borderTop: "1px solid var(--border)",
              background: "var(--bg-surface)",
            }}>
              <div style={{
                fontSize: 12,
                color: "var(--text-muted)",
              }}>
                {edition}{pageNumber ? ` · Page ${pageNumber}` : ""}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb header */}
      <div style={{
        padding: `16px ${isMobile ? 16 : 28}px`,
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <button
          onClick={() => navigate("/dxc-newsletter")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "7px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={14} />
          Back to Newsletters
        </button>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          / {edition}
        </span>
      </div>

      {/* Info bar with title and navigation */}
      <div style={{
        padding: `16px ${isMobile ? 16 : 28}px`,
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{
              fontSize: isMobile ? 18 : 22,
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.3,
              margin: "0 0 10px",
            }}>
              {title}
            </h1>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
                background: catColor.bg,
                color: catColor.color,
              }}>
                {category}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
                background: yearColor.bg,
                color: yearColor.color,
              }}>
                {month}
              </span>
              {pageNumber && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "var(--bg-surface)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}>
                  Page {pageNumber}
                </span>
              )}
            </div>
          </div>

          {/* Navigation buttons */}
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => adjacentArticles.prev && navigateToArticle(adjacentArticles.prev.id)}
              disabled={!adjacentArticles.prev}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "7px 12px",
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--bg-surface)",
                color: adjacentArticles.prev ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: adjacentArticles.prev ? "pointer" : "not-allowed",
                opacity: adjacentArticles.prev ? 1 : 0.5,
              }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => adjacentArticles.next && navigateToArticle(adjacentArticles.next.id)}
              disabled={!adjacentArticles.next}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "7px 12px",
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--bg-surface)",
                color: adjacentArticles.next ? "var(--text-primary)" : "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
                cursor: adjacentArticles.next ? "pointer" : "not-allowed",
                opacity: adjacentArticles.next ? 1 : 0.5,
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div
        className="three-panel-layout"
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          maxWidth: 1400,
          margin: "0 auto",
          padding: isMobile ? 16 : 24,
          gap: isMobile ? 20 : 24,
        }}
      >
        <style>{`
          @media (max-width: 768px) {
            .three-panel-layout { flex-direction: column !important; }
            .panel-1 { order: 3 !important; }
            .panel-2 { order: 2 !important; }
            .panel-3 { order: 1 !important; }
          }
        `}</style>

        {/* PANEL 1 — AI-Generated Journal Card (left, ~30%) */}
        <div
          className="panel-1"
          style={{
            flex: isMobile ? "none" : "0 0 30%",
            maxWidth: isMobile ? "100%" : "30%",
            order: 1,
          }}
        >
          <div style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}>
            {/* Category header bar */}
            <div style={{
              background: catHeaderColor,
              color: "#fff",
              padding: "10px 16px",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}>
              {category || "Newsletter"}
            </div>

            {/* Card content */}
            <div style={{ padding: 20 }}>
              {journalCardLoading ? (
                /* Skeleton loader */
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
                  <div style={{
                    height: 20,
                    background: "linear-gradient(90deg, var(--bg-surface) 25%, var(--border) 50%, var(--bg-surface) 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    borderRadius: 4,
                  }} />
                  <div style={{
                    height: 48,
                    background: "linear-gradient(90deg, var(--bg-surface) 25%, var(--border) 50%, var(--bg-surface) 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    borderRadius: 4,
                  }} />
                  <div style={{
                    height: 80,
                    background: "linear-gradient(90deg, var(--bg-surface) 25%, var(--border) 50%, var(--bg-surface) 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.5s infinite",
                    borderRadius: 4,
                  }} />
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
                    Generating intelligence brief...
                  </div>
                </div>
              ) : journalCard ? (
                /* AI-generated journal card */
                <>
                  {/* Headline */}
                  <h2 style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--accent)",
                    lineHeight: 1.4,
                    marginBottom: 12,
                  }}>
                    {journalCard.headline}
                  </h2>

                  {/* Context */}
                  <p style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}>
                    {journalCard.context}
                  </p>

                  {/* Stats row (if available) */}
                  {journalCard.stats && journalCard.stats.length > 0 && (
                    <>
                      <div style={{
                        display: "flex",
                        gap: 16,
                        marginBottom: 16,
                        flexWrap: "wrap",
                      }}>
                        {journalCard.stats.map((stat, idx) => (
                          <div key={idx} style={{
                            background: "var(--bg-primary)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            padding: "12px 16px",
                            textAlign: "center",
                            minWidth: 70,
                          }}>
                            <div style={{
                              fontSize: 24,
                              fontWeight: 700,
                              color: "var(--accent)",
                              lineHeight: 1.1,
                            }}>
                              {stat.value}
                            </div>
                            <div style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              marginTop: 4,
                            }}>
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />
                    </>
                  )}

                  {/* Key points */}
                  <div style={{ marginBottom: 16 }}>
                    {journalCard.key_points?.map((point, idx) => (
                      <div key={idx} style={{
                        borderLeft: "3px solid var(--accent)",
                        paddingLeft: 12,
                        marginBottom: 10,
                      }}>
                        <div style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          marginBottom: 2,
                        }}>
                          {point.label}
                        </div>
                        <div style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          lineHeight: 1.5,
                        }}>
                          {point.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Takeaway */}
                  <div style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: 12,
                    display: "flex",
                    gap: 10,
                  }}>
                    <Lightbulb size={16} style={{ flexShrink: 0, color: "var(--accent)", marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Takeaway
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-primary)", fontStyle: "italic", lineHeight: 1.5 }}>
                        {journalCard.takeaway}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Fallback: show basic info if no journal card */
                <>
                  <h2 style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--accent)",
                    lineHeight: 1.35,
                    marginBottom: 12,
                  }}>
                    {title}
                  </h2>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                    {edition}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                    {month}{pageNumber ? ` · Page ${pageNumber}` : ""}
                  </div>
                  <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />
                  <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>
                    {contentPreview}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 2 — Article Text (center, ~35%) */}
        <div
          id="article-content"
          className="panel-2"
          style={{
            flex: isMobile ? "none" : "0 0 35%",
            maxWidth: isMobile ? "100%" : "35%",
            order: 2,
          }}
        >
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--text-muted)",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            Article Content
          </div>

          <div style={{
            borderLeft: "3px solid var(--accent)",
            paddingLeft: 20,
          }}>
            {/* Badges at top */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
                background: catColor.bg,
                color: catColor.color,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}>
                <Tag size={10} />
                {category}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 999,
                background: yearColor.bg,
                color: yearColor.color,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}>
                <Calendar size={10} />
                {month}
              </span>
              {pageNumber && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "var(--bg-surface)",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}>
                  <FileText size={10} />
                  Page {pageNumber}
                </span>
              )}
            </div>

            {/* Article text */}
            <div style={{
              fontSize: 14,
              color: "var(--text-primary)",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
            }}>
              {content}
            </div>

            {/* Read Full Article button */}
            <button
              onClick={() => setShowArticleModal(true)}
              style={{
                marginTop: 24,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <BookOpen size={16} />
              Read Full Article →
            </button>
          </div>
        </div>

        {/* PANEL 3 — Page Image (right, ~35%) */}
        <div
          className="panel-3"
          style={{
            flex: isMobile ? "none" : "0 0 35%",
            maxWidth: isMobile ? "100%" : "35%",
            order: 3,
          }}
        >
          <div style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--text-muted)",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            Newsletter Page
          </div>

          <div style={{
            background: "var(--bg-surface)",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--border)",
          }}>
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={title}
                  onClick={() => setShowLightbox(true)}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    cursor: "zoom-in",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div style={{ display: "none" }} />
              </>
            ) : (
              <div style={{
                display: "flex",
                width: "100%",
                minHeight: 300,
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-surface)",
                color: "var(--text-muted)",
                flexDirection: "column",
                gap: 12,
                padding: 40,
              }}>
                <Newspaper size={48} strokeWidth={1} />
                <div style={{ fontSize: 14, fontWeight: 600 }}>Page {pageNumber || "N/A"}</div>
                <div style={{ fontSize: 12 }}>No image available</div>
              </div>
            )}
          </div>

          {/* Zoom controls */}
          {imageUrl && (
            <div style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}>
              <button
                onClick={() => setShowLightbox(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  background: "var(--bg-surface)",
                  color: "var(--text-primary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <ZoomIn size={14} />
                Click to expand
              </button>
            </div>
          )}
          <div style={{
            marginTop: 8,
            fontSize: 11,
            color: "var(--text-muted)",
            textAlign: "center",
          }}>
            Click image to open full view
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: `0 ${isMobile ? 16 : 24}px 24px`,
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "stretch",
          gap: 16,
          flexWrap: "wrap",
        }}>
          {/* Previous article */}
          <button
            onClick={() => adjacentArticles.prev && navigateToArticle(adjacentArticles.prev.id)}
            disabled={!adjacentArticles.prev}
            style={{
              flex: 1,
              minWidth: 200,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-surface)",
              color: adjacentArticles.prev ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: 13,
              textAlign: "left",
              cursor: adjacentArticles.prev ? "pointer" : "not-allowed",
              opacity: adjacentArticles.prev ? 1 : 0.5,
            }}
          >
            <ChevronLeft size={18} style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Previous</div>
              <div style={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {adjacentArticles.prev?.title || "No previous article"}
              </div>
            </div>
          </button>

          {/* Next article */}
          <button
            onClick={() => adjacentArticles.next && navigateToArticle(adjacentArticles.next.id)}
            disabled={!adjacentArticles.next}
            style={{
              flex: 1,
              minWidth: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 12,
              padding: "14px 18px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg-surface)",
              color: adjacentArticles.next ? "var(--text-primary)" : "var(--text-muted)",
              fontSize: 13,
              textAlign: "right",
              cursor: adjacentArticles.next ? "pointer" : "not-allowed",
              opacity: adjacentArticles.next ? 1 : 0.5,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Next</div>
              <div style={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {adjacentArticles.next?.title || "No next article"}
              </div>
            </div>
            <ChevronRight size={18} style={{ flexShrink: 0 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
