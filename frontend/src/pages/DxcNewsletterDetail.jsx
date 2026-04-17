import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDxcNewsletterById } from "../services/api";
import { ArrowLeft, Newspaper, Calendar, Tag, FileText } from "lucide-react";

// Year-based badge colors
const getYearColor = (month) => {
  if (!month) return { bg: "var(--surface)", color: "var(--text-muted)" };
  if (month.includes("2026")) return { bg: "#EDE9FE", color: "#7C3AED" };
  if (month.includes("2025")) return { bg: "var(--blue-light)", color: "var(--blue)" };
  return { bg: "var(--surface)", color: "var(--text-secondary)" };
};

// Category badge colors
const CATEGORY_COLORS = {
  "Business & Clients": { bg: "var(--blue-light)", color: "var(--blue)" },
  "Quality": { bg: "#DCFCE7", color: "#15803D" },
  "Innovation & Tech": { bg: "#FEF3C7", color: "#B45309" },
  "CSR & Community": { bg: "#FCE7F3", color: "#BE185D" },
  "DEI & Inclusion": { bg: "#E0E7FF", color: "#4338CA" },
  "Awards & Recognition": { bg: "#FEF9C3", color: "#A16207" },
  "Wellbeing & Health": { bg: "#D1FAE5", color: "#047857" },
  "Events & Upcoming": { bg: "#DBEAFE", color: "#1D4ED8" },
  "Referral & Jobs": { bg: "#F3E8FF", color: "#7E22CE" },
  "Newsletter Content": { bg: "var(--surface)", color: "var(--text-secondary)" },
};

export default function DxcNewsletterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getDxcNewsletterById(id)
      .then(data => setArticle(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{
        padding: "60px 28px",
        textAlign: "center",
        background: "var(--card-bg)",
        minHeight: "100%",
      }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          width: 36,
          height: 36,
          margin: "0 auto 16px",
          border: "3px solid var(--border-color)",
          borderTop: "3px solid var(--blue)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>Loading article...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{
        padding: "60px 28px",
        textAlign: "center",
        background: "var(--card-bg)",
        minHeight: "100%",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
          {error || "Article not found"}
        </div>
        <button
          onClick={() => navigate("/dxc-newsletter")}
          style={{
            background: "var(--blue)",
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
  const edition = article.newsletter_edition || "";
  const imageUrl = article.image_url;
  const pageNumber = article.page_number;
  const yearColor = getYearColor(month);
  const catColor = CATEGORY_COLORS[category] || { bg: "var(--surface)", color: "var(--text-secondary)" };

  return (
    <div style={{
      background: "var(--card-bg)",
      minHeight: "100%",
      color: "var(--text-primary)",
    }}>
      {/* Back header */}
      <div style={{
        padding: `16px ${isMobile ? 16 : 28}px`,
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <button
          onClick={() => navigate("/dxc-newsletter")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "transparent",
            border: "1px solid var(--border-color)",
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
          {edition}
        </span>
      </div>

      {/* Content: two columns on desktop */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        maxWidth: 1200,
        margin: "0 auto",
        padding: isMobile ? 16 : 32,
        gap: isMobile ? 24 : 32,
      }}>
        {/* Left: Image (60% on desktop) */}
        <div style={{
          flex: isMobile ? "none" : "0 0 60%",
          maxWidth: isMobile ? "100%" : "60%",
        }}>
          <div style={{
            background: "var(--surface)",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div style={{
              display: imageUrl ? "none" : "flex",
              width: "100%",
              minHeight: 400,
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
              color: "var(--text-muted)",
              flexDirection: "column",
              gap: 16,
            }}>
              <Newspaper size={64} strokeWidth={1} />
              <span style={{ fontSize: 14 }}>No image available</span>
            </div>
          </div>
        </div>

        {/* Right: Article info (40% on desktop) */}
        <div style={{
          flex: 1,
          minWidth: 0,
        }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "5px 12px",
              borderRadius: 999,
              background: yearColor.bg,
              color: yearColor.color,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <Calendar size={12} />
              {month}
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: 999,
              background: catColor.bg,
              color: catColor.color,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <Tag size={12} />
              {category}
            </span>
            {pageNumber && (
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "5px 12px",
                borderRadius: 999,
                background: "var(--surface)",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <FileText size={12} />
                Page {pageNumber}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: isMobile ? 22 : 28,
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            marginBottom: 24,
            letterSpacing: -0.5,
          }}>
            {title}
          </h1>

          {/* Content */}
          <div style={{
            background: "var(--bg-active)",
            borderRadius: 8,
            padding: isMobile ? 16 : 24,
            border: "1px solid var(--border-color)",
            borderLeft: "4px solid var(--purple)",
            maxHeight: isMobile ? "none" : 500,
            overflowY: isMobile ? "visible" : "auto",
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              color: "var(--purple)",
              letterSpacing: 1.2,
              textTransform: "uppercase",
              marginBottom: 14,
            }}>
              Article Content
            </div>
            <div style={{
              fontSize: isMobile ? 14 : 15,
              color: "var(--text-primary)",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
            }}>
              {content}
            </div>
          </div>

          {/* Edition info */}
          {edition && (
            <div style={{
              marginTop: 20,
              padding: "12px 16px",
              background: "var(--surface)",
              borderRadius: 6,
              border: "1px solid var(--border-color)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
                Newsletter Edition
              </div>
              <div style={{ fontSize: 13, color: "var(--text-primary)" }}>
                {edition}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
