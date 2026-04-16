// src/pages/ReportsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { getReports, getReport, deleteReport, getArticles, saveReport } from "../services/api";
import { generatePDF } from "../utils/generatePDF";
import DashboardLayout from "../components/layout/DashboardLayout";
import CategoryCombobox from "../components/CategoryCombobox";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

// Generate Report Modal
function GenerateReportModal({ onClose, onSaved }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All");

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getArticles({
        topic: topic === "All" ? undefined : topic,
        search: search || undefined,
        page: 1,
        pageSize: 50,
      });
      setArticles(res.items || []);
    } catch (err) {
      setError("Failed to load articles: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [topic, search]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const toggleAll = () => {
    if (selected.size === articles.length) setSelected(new Set());
    else setSelected(new Set(articles.map(a => a.id)));
  };

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const selectedArticles = articles.filter(a => selected.has(a.id));

  const buildReportData = () => ({
    title: `AI Report - ${new Date().toLocaleDateString()}`,
    summary: `Report with ${selectedArticles.length} articles (topic: ${topic})`,
    key_points: selectedArticles.slice(0, 5).map(a => a.title),
    articles: selectedArticles.map((a, idx) => ({
      number: idx + 1,
      title: a.title,
      source: a.source,
      date: a.published_at ? new Date(a.published_at).toLocaleDateString() : "",
      signal: a.signal_strength?.toLowerCase(),
      relevance: a.relevance,
      url: a.url,
      summary: a.summary,
    })),
    funding_count: 0,
  });

  const handleSave = async () => {
    if (selected.size === 0) { setError("Select at least one article."); return; }
    setSaving(true);
    setError(null);
    try {
      await saveReport(buildReportData());
      onSaved();
      onClose();
    } catch (err) {
      const msg = err.message || "";
      setError(msg.includes("limit") ? "Report limit reached (30 max). Delete a report first." : "Failed to save report: " + msg);
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (selected.size === 0) { setError("Select at least one article."); return; }
    generatePDF({ ...buildReportData(), generated_date: new Date() });
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "var(--card-bg)", borderRadius: 10,
        width: "min(700px, 95vw)", maxHeight: "90vh",
        display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        overflow: "hidden",
      }}>
        {/* Modal header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--border-color)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Generate Report</h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "4px 0 0" }}>
              Select articles to include, then save or download as PDF.
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}>
            ×
          </button>
        </div>

        {/* Filters */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--border-color)", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 140, padding: "8px 12px", border: "1px solid var(--border-color)",
                borderRadius: 6, fontSize: 13, outline: "none", background: "var(--input-bg)", color: "var(--text-primary)",
              }}
            />
            <CategoryCombobox
              dropdownAlign="right"
              selected={topic === "All" ? "All Industries" : topic}
              onSelect={(cat) => setTopic(cat === "All Industries" ? "All" : cat)}
            />
          </div>
        </div>

        {/* Article list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
          {error && (
            <div style={{ margin: "14px 0", padding: "10px 14px", background: "var(--red-light)", color: "var(--red)", borderRadius: 6, fontSize: 12 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>
              Loading articles...
            </div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No articles found. Try a different filter or refresh the News Feed first.
            </div>
          ) : (
            <>
              {/* Select all row */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 0", borderBottom: "1px solid var(--border-color)",
                position: "sticky", top: 0, background: "var(--card-bg)", zIndex: 1,
              }}>
                <input
                  type="checkbox"
                  checked={selected.size === articles.length && articles.length > 0}
                  onChange={toggleAll}
                  style={{ cursor: "pointer", accentColor: "var(--orange)", width: 15, height: 15 }}
                />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {selected.size > 0
                    ? `${selected.size} of ${articles.length} selected`
                    : `Select all (${articles.length} articles)`}
                </span>
              </div>

              {/* Articles */}
              {articles.map(article => {
                const isStrong = article.signal_strength === "Strong";
                const isChecked = selected.has(article.id);
                return (
                  <div
                    key={article.id}
                    onClick={() => toggle(article.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 12,
                      padding: "14px 24px", borderBottom: "1px solid var(--surface)",
                      cursor: "pointer",
                      background: isChecked ? "var(--orange-light)" : "transparent",
                      margin: "0 -24px",
                      transition: "background 0.1s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggle(article.id)}
                      onClick={e => e.stopPropagation()}
                      style={{ cursor: "pointer", accentColor: "var(--orange)", width: 15, height: 15, marginTop: 3, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.4 }}>
                          {article.title}
                        </div>
                        <span style={{
                          flexShrink: 0, fontSize: 10, fontWeight: 700,
                          padding: "3px 8px", borderRadius: 999,
                          ...(isStrong
                            ? { background: "var(--orange)", color: "#fff" }
                            : { background: "transparent", color: "var(--text-muted)", border: "1px solid var(--border-color)" }),
                        }}>
                          {isStrong ? "STRONG" : "WEAK"}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {article.source} · {article.topic || "General"} · {article.published_at ? new Date(article.published_at).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 24px", borderTop: "1px solid var(--border-color)",
          display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, background: "var(--surface)",
        }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {selected.size} article{selected.size !== 1 ? "s" : ""} selected
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleDownloadPDF}
              disabled={selected.size === 0}
              style={{
                padding: "9px 20px", borderRadius: 6,
                border: "1.5px solid var(--orange)",
                background: "transparent", color: "var(--orange)",
                fontSize: 13, fontWeight: 700,
                cursor: selected.size === 0 ? "not-allowed" : "pointer",
                opacity: selected.size === 0 ? 0.4 : 1,
              }}
            >
              Download PDF
            </button>
            <button
              onClick={handleSave}
              disabled={saving || selected.size === 0}
              style={{
                padding: "9px 20px", borderRadius: 6,
                border: "none", background: "var(--orange)", color: "#fff",
                fontSize: 13, fontWeight: 700,
                cursor: saving || selected.size === 0 ? "not-allowed" : "pointer",
                opacity: saving || selected.size === 0 ? 0.5 : 1,
              }}
            >
              {saving ? "Saving..." : "Save Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Daily Report Modal
function DailyReportModal({ onClose, onSaved }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const todayIso = new Date().toISOString().split("T")[0];

  useEffect(() => {
    setLoading(true);
    getArticles({ page: 1, pageSize: 100 })
      .then(res => setArticles(res.items || []))
      .catch(err => setError("Failed to load articles: " + err.message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = articles.reduce((acc, a) => {
    const key = a.topic || a.search_topic || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const uniqueSources = [...new Set(articles.map(a => a.source).filter(Boolean))].length;
  const avgRel = articles.length
    ? (articles.reduce((s, a) => s + (a.relevance || 5), 0) / articles.length).toFixed(1)
    : "—";

  const buildDailyData = () => ({
    title: `Daily Brief — ${todayIso}`,
    summary: `AI Watch daily intelligence summary for ${today}. ${articles.length} articles monitored across ${Object.keys(grouped).length} topics from ${uniqueSources} sources. Average relevance: ${avgRel}/10.`,
    key_points: Object.entries(grouped).slice(0, 8).map(([topic, arts]) =>
      `${topic}: ${arts.length} article${arts.length > 1 ? "s" : ""} — top signal: ${arts[0]?.title?.slice(0, 60)}...`
    ),
    articles: articles.map((a, idx) => ({
      number: idx + 1,
      title: a.title,
      source: a.source,
      date: a.published_at ? new Date(a.published_at).toLocaleDateString() : todayIso,
      signal: a.signal_strength?.toLowerCase(),
      relevance: a.relevance,
      url: a.url,
      summary: a.summary || "",
    })),
    funding_count: 0,
  });

  const handleSave = async () => {
    if (articles.length === 0) { setError("No articles to save."); return; }
    setSaving(true);
    setError(null);
    try {
      await saveReport(buildDailyData());
      onSaved();
      onClose();
    } catch (err) {
      const msg = err.message || "";
      setError(msg.includes("limit") ? "Report limit reached (30 max). Delete a report first." : "Failed to save: " + msg);
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "var(--card-bg)", borderRadius: 10, width: "min(640px, 95vw)", maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ background: "var(--orange)", color: "#fff", padding: "20px 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 4px" }}>Daily Brief</h2>
              <p style={{ fontSize: 12, opacity: 0.85, margin: 0 }}>{today}</p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
          </div>
          {!loading && (
            <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
              {[
                { label: "Articles", value: articles.length },
                { label: "Sources", value: uniqueSources },
                { label: "Topics", value: Object.keys(grouped).length },
                { label: "Avg Relevance", value: `${avgRel}/10` },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{s.value}</div>
                  <div style={{ fontSize: 10, opacity: 0.75 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {error && (
            <div style={{ background: "var(--red-light)", color: "var(--red)", border: "1px solid var(--red)", padding: "10px 14px", borderRadius: 6, fontSize: 12, marginBottom: 14 }}>{error}</div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>Gathering today's intelligence...</div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>
              No articles found. Refresh the News Feed first to populate data.
            </div>
          ) : (
            Object.entries(grouped).map(([topic, arts]) => (
              <div key={topic} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--orange)", background: "var(--orange-light)", padding: "3px 10px", borderRadius: 999 }}>
                    {topic}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{arts.length} article{arts.length > 1 ? "s" : ""}</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 4 }}>
                  {arts.map((a, i) => (
                    <div key={i} style={{ borderLeft: "3px solid var(--orange)", paddingLeft: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3, lineHeight: 1.4 }}>{a.title}</div>
                      {a.summary && a.summary !== a.title && (
                        <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {a.summary}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {a.source} · {a.published_at ? new Date(a.published_at).toLocaleDateString() : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border-color)", display: "flex", gap: 10, justifyContent: "flex-end", background: "var(--surface)", flexShrink: 0 }}>
          <button
            onClick={() => generatePDF(buildDailyData())}
            disabled={loading || articles.length === 0}
            style={{
              padding: "9px 20px", borderRadius: 6,
              border: "1.5px solid var(--orange)", background: "transparent", color: "var(--orange)",
              fontSize: 13, fontWeight: 700,
              cursor: loading || articles.length === 0 ? "not-allowed" : "pointer",
              opacity: loading || articles.length === 0 ? 0.4 : 1,
            }}
          >
            Download PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || articles.length === 0}
            style={{
              padding: "9px 20px", borderRadius: 6,
              border: "none", background: "var(--orange)", color: "#fff",
              fontSize: 13, fontWeight: 700,
              cursor: saving || loading || articles.length === 0 ? "not-allowed" : "pointer",
              opacity: saving || loading || articles.length === 0 ? 0.5 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Daily Report"}
          </button>
        </div>
      </div>
    </div>
  );
}

const MAX_REPORTS = 30;

// Reports List
function ReportsList({ onSelectReport, refreshKey, onCountChange }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getReports(1, MAX_REPORTS)
      .then(r => {
        const items = r.items || [];
        setReports(items);
        onCountChange?.(items.length);
      })
      .catch(err => { setError(err.message); setReports([]); onCountChange?.(0); })
      .finally(() => setLoading(false));
  }, [refreshKey, onCountChange]);

  const handleDownloadPDF = async (e, reportId) => {
    e.stopPropagation();
    setDownloading(reportId);
    try {
      const report = await getReport(reportId);
      generatePDF(report);
    } catch (err) {
      setError("Failed to generate PDF: " + err.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div>
      {error && (
        <div style={{ background: "var(--red-light)", border: "1px solid var(--red)", color: "var(--red)", padding: "12px 16px", marginBottom: 16, borderRadius: 6, fontSize: 12 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div style={{ padding: "60px 40px", textAlign: "center", background: "var(--surface)", border: "1px solid var(--border-color)", borderRadius: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>No reports yet</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Click "Generate Report" above to create your first report.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reports.map(report => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report.id)}
              style={{
                background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 6,
                padding: "16px 20px", cursor: "pointer",
                transition: "border-color 0.2s, box-shadow 0.2s",
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {report.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {report.summary || "No summary"}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 11, background: "var(--orange-light)", color: "var(--orange)", padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>
                    {report.article_count || 0} articles
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {formatDate(report.generated_date || new Date())}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => handleDownloadPDF(e, report.id)}
                disabled={downloading === report.id}
                style={{
                  flexShrink: 0, padding: "8px 16px",
                  background: "var(--orange-light)", color: "var(--orange)",
                  border: "1.5px solid var(--orange)", borderRadius: 6,
                  fontSize: 12, fontWeight: 700,
                  cursor: downloading === report.id ? "not-allowed" : "pointer",
                  opacity: downloading === report.id ? 0.6 : 1,
                  transition: "background 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {downloading === report.id ? "Generating..." : "Download PDF"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Report Detail
function ReportDetail({ reportId, onClose, onDelete }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getReport(reportId)
      .then(r => setReport(r))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [reportId]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${report?.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteReport(reportId);
      onDelete(reportId);
    } catch (err) {
      setError("Failed to delete: " + err.message);
      setDeleting(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13, border: "1px solid var(--border-color)", borderRadius: 6 }}>
      Loading report...
    </div>
  );

  if (error || !report) return (
    <div style={{ padding: 24, border: "1px solid var(--border-color)", borderRadius: 6 }}>
      <div style={{ color: "var(--amber)", fontSize: 13, marginBottom: 16 }}>{error || "Report not found."}</div>
      <button onClick={onClose} style={{ padding: "8px 16px", background: "var(--orange)", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
        Back
      </button>
    </div>
  );

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 6, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ background: "var(--orange)", color: "#fff", padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", padding: "6px 14px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            Back
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => generatePDF(report)}
              style={{ background: "#fff", color: "var(--orange)", border: "none", padding: "7px 16px", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700 }}
            >
              Download PDF
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", padding: "7px 14px", borderRadius: 4, cursor: deleting ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 600, opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{report.title}</h1>
        <p style={{ fontSize: 11, opacity: 0.85, marginBottom: 10 }}>Generated on {formatDate(report.generated_date || new Date())}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 11, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 4 }}>{report.article_count || 0} articles</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px" }}>
        {report.summary && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Summary</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>{report.summary}</p>
          </div>
        )}

        {report.key_points?.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Key Findings</h2>
            <ul style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.8, paddingLeft: 20 }}>
              {report.key_points.map((pt, i) => <li key={i} style={{ marginBottom: 6 }}>{pt}</li>)}
            </ul>
          </div>
        )}

        <div>
          <h2 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Articles & Sources</h2>
          {report.articles?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {report.articles.map((a, i) => (
                <div key={i}
                  style={{ background: "var(--surface)", border: "1px solid var(--border-color)", borderRadius: 6, padding: "14px 16px", transition: "border-color 0.2s" }}
                >
                  <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--orange)", background: "var(--orange-light)", padding: "3px 8px", borderRadius: 4 }}>#{a.number || i + 1}</span>
                  </div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.4 }}>{a.title}</h4>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>{a.source} · {a.date} · {a.relevance || 0}/10</div>
                  {a.summary && <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8, lineHeight: 1.6 }}>{a.summary}</p>}
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: "var(--orange)", fontWeight: 600, textDecoration: "none" }}
                    >
                      Read article
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No articles in this report.</p>
          )}
        </div>

        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 16, marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Report ID</p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", fontFamily: "monospace" }}>{report.id}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Generated</p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>{formatDate(report.generated_date || new Date())}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main
export default function ReportsPage() {
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [reportCount, setReportCount] = useState(0);

  const atLimit = reportCount >= MAX_REPORTS;

  const handleReportDeleted = () => {
    setSelectedReportId(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleReportSaved = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: -0.5 }}>
          My Reports
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
          Generate, save, and download intelligence reports as PDF.
          {" "}
          <span style={{ fontWeight: 700, color: atLimit ? "var(--red)" : "var(--text-muted)" }}>
            {reportCount}/{MAX_REPORTS} reports used
          </span>
        </p>
        {atLimit && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--red)", background: "var(--red-light)", border: "1px solid var(--red)", borderRadius: 6, padding: "8px 12px", display: "inline-block" }}>
            Report limit reached — delete a report to create a new one.
          </div>
        )}
      </div>

      {!selectedReportId && (
        <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          <button
            onClick={() => !atLimit && setShowDailyModal(true)}
            disabled={atLimit}
            style={{
              padding: "10px 20px", background: "transparent",
              color: atLimit ? "var(--text-muted)" : "var(--orange)",
              border: `1.5px solid ${atLimit ? "var(--border-color)" : "var(--orange)"}`, borderRadius: 6,
              fontSize: 13, fontWeight: 700,
              cursor: atLimit ? "not-allowed" : "pointer",
              opacity: atLimit ? 0.6 : 1,
            }}
          >
            Daily Brief
          </button>
          <button
            onClick={() => !atLimit && setShowGenerateModal(true)}
            disabled={atLimit}
            style={{
              padding: "10px 20px", background: atLimit ? "var(--border-color)" : "var(--orange)", color: "#fff",
              border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700,
              cursor: atLimit ? "not-allowed" : "pointer",
            }}
          >
            Generate Report
          </button>
        </div>
      )}

      {selectedReportId ? (
        <ReportDetail
          reportId={selectedReportId}
          onClose={() => setSelectedReportId(null)}
          onDelete={handleReportDeleted}
        />
      ) : (
        <ReportsList onSelectReport={setSelectedReportId} refreshKey={refreshKey} onCountChange={setReportCount} />
      )}

      {showGenerateModal && (
        <GenerateReportModal
          onClose={() => setShowGenerateModal(false)}
          onSaved={handleReportSaved}
        />
      )}

      {showDailyModal && (
        <DailyReportModal
          onClose={() => setShowDailyModal(false)}
          onSaved={handleReportSaved}
        />
      )}
    </DashboardLayout>
  );
}
