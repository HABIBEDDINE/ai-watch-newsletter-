import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getDxcNewsletters, getDxcNewsletterFilters } from "../services/api";
import { Search, ChevronRight, Newspaper } from "lucide-react";

// Year-based badge colors
const getYearColor = (month) => {
  if (!month) return { bg: "var(--surface)", color: "var(--text-muted)" };
  if (month.includes("2026")) return { bg: "#EDE9FE", color: "#7C3AED" }; // Purple
  if (month.includes("2025")) return { bg: "var(--blue-light)", color: "var(--blue)" }; // Blue
  return { bg: "var(--surface)", color: "var(--text-secondary)" }; // Grey for 2024
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

function NewsletterCard({ article, onClick, isMobile }) {
  const title = article.title || "Untitled";
  const content = article.content || "";
  const preview = content.length > 100 ? content.substring(0, 100) + "..." : content;
  const month = article.month || "";
  const category = article.category || "";
  const imageUrl = article.image_url;
  const yearColor = getYearColor(month);
  const catColor = CATEGORY_COLORS[category] || { bg: "var(--surface)", color: "var(--text-secondary)" };

  return (
    <div
      className="newsletter-card"
      onClick={onClick}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = "var(--blue)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border-color)";
      }}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border-color)",
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      {/* Image */}
      <div style={{
        position: "relative",
        width: "100%",
        height: isMobile ? 160 : 200,
        background: "var(--surface)",
        overflow: "hidden",
      }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
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
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
          color: "var(--text-muted)",
          position: "absolute",
          top: 0,
          left: 0,
        }}>
          <Newspaper size={48} strokeWidth={1} />
        </div>

        {/* Month badge */}
        <span style={{
          position: "absolute",
          top: 12,
          left: 12,
          fontSize: 10,
          fontWeight: 700,
          padding: "4px 10px",
          borderRadius: 999,
          background: yearColor.bg,
          color: yearColor.color,
          letterSpacing: 0.3,
        }}>
          {month}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? 14 : 16 }}>
        {/* Title */}
        <h3 style={{
          fontSize: isMobile ? 14 : 15,
          fontWeight: 700,
          color: "var(--text-primary)",
          lineHeight: 1.4,
          marginBottom: 8,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {title}
        </h3>

        {/* Preview */}
        <p style={{
          fontSize: isMobile ? 12 : 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          marginBottom: 12,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {preview}
        </p>

        {/* Footer: category + arrow */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
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
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
}

export default function DxcNewsletterPage() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({ months: [], categories: [] });
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Fetch filter options
  useEffect(() => {
    getDxcNewsletterFilters()
      .then(data => setFilters(data))
      .catch(err => console.error("Failed to load filters:", err));
  }, []);

  // Fetch articles
  const fetchArticles = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDxcNewsletters({
        month: selectedMonth || undefined,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        page,
        limit: itemsPerPage,
      });
      setArticles(response.items || []);
      setTotalCount(response.total || 0);
      setTotalPages(response.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedCategory, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
    fetchArticles(1);
  }, [fetchArticles]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchArticles(1);
    }, 400);
    setSearchTimeout(timeout);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchArticles(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page-container" style={{
      background: "var(--card-bg)",
      padding: isMobile ? "16px" : "24px 28px",
      minHeight: "100%",
      maxWidth: "100vw",
      overflowX: "hidden",
      boxSizing: "border-box",
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .newsletter-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 1024px) {
          .newsletter-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .newsletter-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <Newspaper size={isMobile ? 20 : 24} color="var(--purple)" strokeWidth={2} />
          <h1 style={{
            fontSize: isMobile ? 20 : 24,
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: -0.3,
            margin: 0,
          }}>
            DXC Newsletter
          </h1>
        </div>
        <p style={{
          fontSize: isMobile ? 13 : 14,
          color: "var(--text-secondary)",
          margin: 0,
        }}>
          Internal news and updates from DXC Technology Morocco — ONETEAM Newsletter archive
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        marginBottom: 20,
        flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{ position: "relative", width: isMobile ? "100%" : 260 }}>
          <Search
            size={14}
            strokeWidth={1.8}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              border: "1px solid var(--border-color)",
              borderRadius: 6,
              fontSize: 13,
              outline: "none",
              background: "var(--input-bg)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Month filter */}
        <select
          value={selectedMonth}
          onChange={(e) => { setSelectedMonth(e.target.value); setCurrentPage(1); }}
          style={{
            padding: "9px 12px",
            border: "1px solid var(--border-color)",
            borderRadius: 6,
            fontSize: 13,
            background: "var(--input-bg)",
            color: "var(--text-primary)",
            cursor: "pointer",
            minWidth: 140,
          }}
        >
          <option value="">All Months</option>
          {filters.months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          style={{
            padding: "9px 12px",
            border: "1px solid var(--border-color)",
            borderRadius: 6,
            fontSize: 13,
            background: "var(--input-bg)",
            color: "var(--text-primary)",
            cursor: "pointer",
            minWidth: 160,
          }}
        >
          <option value="">All Categories</option>
          {filters.categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Count */}
        <span style={{
          fontSize: 12,
          color: "var(--text-muted)",
          marginLeft: "auto",
        }}>
          {totalCount} article{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Error */}
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

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 40px" }}>
          <div style={{
            width: 36,
            height: 36,
            margin: "0 auto 16px",
            border: "3px solid var(--border-color)",
            borderTop: "3px solid var(--blue)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
            Loading newsletters...
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && articles.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 40px",
          background: "var(--surface)",
          border: "1px solid var(--border-color)",
          borderRadius: 8,
        }}>
          <Newspaper size={48} color="var(--text-muted)" strokeWidth={1} style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
            No newsletters found
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Try adjusting your filters or search query
          </div>
        </div>
      )}

      {/* Grid */}
      {!loading && articles.length > 0 && (
        <div className="newsletter-grid">
          {articles.map(article => (
            <NewsletterCard
              key={article.id}
              article={article}
              onClick={() => navigate(`/dxc-newsletter/${article.id}`)}
              isMobile={isMobile}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && articles.length > 0 && totalPages > 1 && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid var(--border-color)",
          borderRadius: 6,
          padding: isMobile ? "12px 16px" : "14px 20px",
          background: "var(--card-bg)",
        }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Page {currentPage} of {totalPages}
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
              disabled={currentPage === totalPages}
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
      )}
    </div>
  );
}
