import { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import {
  getArticles,
  getRecipients, addRecipient, removeRecipient,
  getSchedule, saveSchedule, getSentHistory,
} from "../services/api";

// Colors now use CSS variables for dark mode support
// Sector colors are kept as explicit values for badges
const SECTOR_COLORS = {
  AI:            { bg: "var(--blue-light)", color: "var(--blue)" },
  Fintech:       { bg: "var(--orange-light)", color: "var(--orange)" },
  HealthTech:    { bg: "var(--red-light)", color: "var(--red)" },
  Cybersecurity: { bg: "var(--amber-light)", color: "var(--amber)" },
  CleanTech:     { bg: "var(--delta-bg)", color: "var(--delta-color)" },
  Robotics:      { bg: "var(--blue-light)", color: "var(--blue)" },
  General:       { bg: "var(--surface)", color: "var(--text-secondary)" },
};

const TOPICS = ["All", "AI", "Fintech", "HealthTech", "Cybersecurity", "CleanTech", "Robotics"];
const DAYS   = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function fmtDate(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }); }
  catch { return d; }
}
function todayStr() {
  return new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ t }) {
  if (!t) return null;
  const ok = t.kind === "success";
  return (
    <div style={{
      position:"fixed", top:72, right:24, zIndex:9999,
      background:"var(--card-bg)", border:`1px solid ${ok ? "var(--delta-color)" : "var(--orange)"}`,
      borderLeft:`4px solid ${ok ? "var(--delta-color)" : "var(--orange)"}`,
      padding:"10px 16px", borderRadius:8, fontSize:13,
      color: ok ? "var(--delta-color)" : "var(--orange)", boxShadow:"0 4px 20px rgba(0,0,0,0.12)",
      maxWidth:360, display:"flex", alignItems:"center", gap:8,
    }}>
      <span style={{ fontWeight:700 }}>{ok ? "✓" : "!"}</span> {t.msg}
    </div>
  );
}

// ── Step bar ──────────────────────────────────────────────────────────────────
function StepBar({ step, selectedCount }) {
  const steps = [
    { n:1, label:"Select Articles", sub: step === 1 ? `${selectedCount} selected` : `${selectedCount} selected` },
    { n:2, label:"Configure Edition", sub:"Content & style" },
    { n:3, label:"Send & Schedule",   sub:"Deliver" },
  ];
  return (
    <div className="wizard-steps" style={{
      display:"flex", alignItems:"center", gap:0,
      background:"var(--card-bg)", borderBottom:"1px solid var(--border-color)",
      padding:"0 16px", flexShrink:0,
      overflowX:"auto", WebkitOverflowScrolling:"touch",
    }}>
      {steps.map((s, i) => {
        const done   = step > s.n;
        const active = step === s.n;
        return (
          <div key={s.n} style={{ display:"flex", alignItems:"center", flex: i < 2 ? 1 : "none" }}>
            <div style={{
              display:"flex", alignItems:"center", gap:12,
              padding:"18px 0", opacity: !active && !done ? 0.5 : 1,
            }}>
              <div style={{
                width:28, height:28, borderRadius:"50%", flexShrink:0,
                background: done ? "var(--delta-color)" : active ? "var(--orange)" : "var(--border-color)",
                color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:800,
              }}>
                {done ? "✓" : s.n}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color: active ? "var(--orange)" : done ? "var(--text-primary)" : "var(--text-muted)" }}>{s.label}</div>
                <div style={{ fontSize:11, color: active ? "var(--orange)" : "var(--text-muted)", marginTop:1 }}>{s.sub}</div>
              </div>
            </div>
            {i < 2 && (
              <div style={{ flex:1, height:1, background:"var(--border-color)", margin:"0 20px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Collapsible section ───────────────────────────────────────────────────────
function Section({ title, defaultOpen=true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom:16 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
          background:"none", border:"none", borderBottom:"1px solid var(--border-color)",
          padding:"10px 0", cursor:"pointer", marginBottom: open ? 16 : 0, color:"var(--text-secondary)",
        }}
      >
        <span style={{ fontSize:11, fontWeight:800, color:"var(--text-secondary)", letterSpacing:1.2, textTransform:"uppercase" }}>{title}</span>
        <span style={{ fontSize:16, color:"var(--text-muted)", lineHeight:1 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, desc, value, onChange }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      gap:12, padding:"10px 0", borderBottom:"1px solid var(--surface)",
    }}>
      <div>
        <div style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{label}</div>
        {desc && <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:2 }}>{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width:44, height:24, borderRadius:999, border:"none",
          background: value ? "var(--orange)" : "var(--border-color)", position:"relative",
          cursor:"pointer", flexShrink:0, transition:"background 0.2s",
        }}
      >
        <span style={{
          position:"absolute", top:3,
          left: value ? 23 : 3, width:18, height:18,
          borderRadius:"50%", background:"#fff",
          transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

// ── Select row ────────────────────────────────────────────────────────────────
function SelectRow({ label, value, options, onChange }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      gap:12, padding:"10px 0", borderBottom:"1px solid var(--surface)",
    }}>
      <div style={{ fontSize:13, fontWeight:600, color:"var(--text-primary)" }}>{label}</div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          fontSize:12, fontWeight:600, color:"var(--text-secondary)",
          border:"1.5px solid var(--border-color)", borderRadius:6,
          padding:"4px 10px", background:"var(--input-bg)", cursor:"pointer", outline:"none",
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Live Preview ──────────────────────────────────────────────────────────────
function LivePreview({ articles, config, selectedIds, recipients, isMobile }) {
  const selected = articles.filter(a => selectedIds.has(a.id || a.title));
  const limit = config.maxArticles === "All" ? 999 : parseInt(config.maxArticles);
  const shown = selected.slice(0, limit);

  const grouped = {};
  for (const a of shown) {
    const key = config.groupBy === "Sector" ? (a.topic || "General")
               : config.groupBy === "Signal strength" ? (a.signal_strength || "Weak")
               : config.groupBy === "Date" ? fmtDate(a.published_at)
               : "All Articles";
    (grouped[key] = grouped[key] || []).push(a);
  }

  return (
    <div style={{
      width: isMobile ? "100%" : 300,
      flexShrink:0,
      display:"flex",
      flexDirection:"column",
      borderLeft: isMobile ? "none" : "1px solid var(--border-color)",
      borderTop: isMobile ? "1px solid var(--border-color)" : "none",
      height: isMobile ? "auto" : "100%",
      maxHeight: isMobile ? "50vh" : "none",
    }}>
      {/* Preview header */}
      <div style={{
        background:"var(--text-primary)", color:"#fff", padding:"12px 16px", flexShrink:0,
      }}>
        <div style={{ fontSize:9, fontWeight:800, letterSpacing:2, opacity:0.6, textTransform:"uppercase" }}>
          AI WATCH · STRATEGIC INTELLIGENCE
        </div>
        <div style={{ fontSize:13, fontWeight:800, marginTop:4, lineHeight:1.3 }}>
          Intelligence Brief
        </div>
        <div style={{ fontSize:10, opacity:0.6, marginTop:3 }}>{todayStr()}</div>
      </div>

      {/* Preview body */}
      <div style={{ flex:1, overflowY:"auto", padding:14, background:"var(--surface)" }}>
        {/* Executive summary */}
        {config.aiSummary && (
          <div style={{
            background:"var(--card-bg)", border:"1px solid var(--border-color)", borderLeft:"3px solid var(--orange)",
            borderRadius:6, padding:"10px 12px", marginBottom:12,
          }}>
            <div style={{ fontSize:9, fontWeight:800, color:"var(--orange)", letterSpacing:1, textTransform:"uppercase", marginBottom:4 }}>
              Executive Summary
            </div>
            <div style={{ fontSize:10, color:"var(--text-secondary)", lineHeight:1.5, fontStyle:"italic" }}>
              {shown.length} articles curated across {Object.keys(grouped).length} sector(s).
              Key signals this period include developments in AI infrastructure, fintech regulation,
              and emerging startup activity.
            </div>
          </div>
        )}

        {/* Articles by group */}
        {Object.entries(grouped).map(([grp, grpArticles]) => {
          const sc = SECTOR_COLORS[grp] || SECTOR_COLORS.General;
          return (
            <div key={grp} style={{ marginBottom:14 }}>
              <div style={{
                fontSize:9, fontWeight:800, letterSpacing:1, textTransform:"uppercase",
                color:sc.color, background:sc.bg, padding:"3px 8px",
                borderRadius:4, marginBottom:8, display:"inline-block",
              }}>{grp}</div>
              {grpArticles.map((a, i) => (
                <div key={i} style={{
                  background:"var(--card-bg)", borderRadius:6, padding:"8px 10px",
                  marginBottom:6, border:"1px solid var(--border-color)",
                }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"var(--text-primary)", lineHeight:1.4, marginBottom:4 }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize:9, color:"var(--text-secondary)", lineHeight:1.4, marginBottom:4 }}>
                    {config.summaryLength === "1"
                      ? (a.summary || "").split(".")[0] + "."
                      : config.summaryLength === "3"
                        ? (a.summary || "").split(".").slice(0,3).join(".") + "."
                        : (a.summary || "").split(".").slice(0,2).join(".") + "."
                    }
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:8, color:"var(--text-muted)" }}>{a.source} · {fmtDate(a.published_at)}</span>
                    {config.signalBadges && a.signal_strength && (
                      <span style={{
                        fontSize:8, fontWeight:700,
                        color: a.signal_strength === "Strong" ? "var(--orange)" : "var(--amber)",
                        background: a.signal_strength === "Strong" ? "var(--orange-light)" : "var(--amber-light)",
                        padding:"1px 5px", borderRadius:3,
                      }}>{a.signal_strength === "Strong" ? "Strong Signal" : "Emerging"}</span>
                    )}
                    {config.showLinks && a.url && (
                      <span style={{ fontSize:8, color:"var(--orange)", fontWeight:700 }}>Read more →</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {shown.length === 0 && (
          <div style={{ textAlign:"center", color:"var(--text-muted)", fontSize:11, marginTop:24 }}>
            Select articles in Step 1 to preview
          </div>
        )}
      </div>

      {/* Preview footer */}
      <div style={{
        background:"var(--text-primary)", padding:"10px 16px", flexShrink:0,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)" }}>
          {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
        </div>
        <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)" }}>
          {shown.length} article{shown.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

// ── PDF Export ────────────────────────────────────────────────────────────────
function generatePDF(articles, config, selectedIds) {
  const selected = articles.filter(a => selectedIds.has(a.id || a.title));
  const limit = config.maxArticles === "All" ? 999 : parseInt(config.maxArticles);
  const shown = selected.slice(0, limit);

  const doc = new jsPDF("p", "mm", "a4");
  const PW = 210, PH = 297, ML = 20, MR = 20, MT = 20, BW = PW - ML - MR;

  const setOrange = () => doc.setTextColor(224, 90, 43);
  const setNavy   = () => doc.setTextColor(26, 26, 46);
  const setGray   = () => doc.setTextColor(100, 100, 100);
  const setBlack  = () => doc.setTextColor(17, 17, 17);

  let pg = 1;
  const addHeader = () => {
    doc.setFillColor(224, 90, 43);
    doc.rect(0, 0, PW, 8, "F");
  };

  const addFooter = (pageNum) => {
    doc.setFontSize(8);
    setGray();
    doc.text(`AI Watch · DXC Technology · Page ${pageNum} · ${todayStr()}`, ML, PH - 8);
  };

  // ── Page 1: Cover ──────────────────────────────────────────────────────────
  addHeader();

  // Orange bar left
  doc.setFillColor(224, 90, 43);
  doc.rect(ML, 30, 3, 40, "F");

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  setNavy();
  doc.text("AI Watch", ML + 10, 48);

  doc.setFontSize(14);
  setGray();
  doc.text("Intelligence Brief", ML + 10, 58);

  doc.setFontSize(11);
  setOrange();
  doc.text(todayStr(), ML + 10, 68);

  doc.setFontSize(18);
  setNavy();
  doc.setFont("helvetica", "normal");
  doc.text("Strategic Technology Intelligence", ML, 90);

  // Thin orange rule
  doc.setDrawColor(224, 90, 43);
  doc.setLineWidth(0.8);
  doc.line(ML, 95, PW - MR, 95);

  // Summary stats
  doc.setFontSize(11);
  setBlack();
  doc.setFont("helvetica", "bold");
  doc.text(`${shown.length} Articles Curated`, ML, 110);
  doc.setFont("helvetica", "normal");
  setGray();
  doc.setFontSize(10);
  doc.text(`Topics: ${[...new Set(shown.map(a => a.topic).filter(Boolean))].join(", ") || "General"}`, ML, 118);
  doc.text(`Language: ${config.language}  ·  Tone: ${config.tone}`, ML, 126);

  addFooter(pg);

  // ── Pages 2+: Articles ─────────────────────────────────────────────────────
  const grouped = {};
  for (const a of shown) {
    const key = config.groupBy === "Sector" ? (a.topic || "General")
               : config.groupBy === "Signal strength" ? (a.signal_strength || "Weak")
               : "All Articles";
    (grouped[key] = grouped[key] || []).push(a);
  }

  for (const [sector, arts] of Object.entries(grouped)) {
    pg++;
    doc.addPage();
    addHeader();

    let y = MT + 16;

    // Executive summary (first sector only)
    if (config.aiSummary && Object.keys(grouped)[0] === sector) {
      doc.setFillColor(245, 245, 248);
      doc.rect(ML, y, BW, 24, "F");
      doc.setFontSize(8);
      setOrange();
      doc.setFont("helvetica", "bold");
      doc.text("EXECUTIVE SUMMARY", ML + 4, y + 7);
      doc.setFontSize(9);
      setGray();
      doc.setFont("helvetica", "italic");
      const summaryText = `${shown.length} articles curated. Key signals include developments in AI infrastructure, fintech regulation, and emerging startup activity this period.`;
      const summaryLines = doc.splitTextToSize(summaryText, BW - 8);
      doc.text(summaryLines, ML + 4, y + 13);
      y += 30;
    }

    // Sector header
    doc.setFontSize(11);
    setOrange();
    doc.setFont("helvetica", "bold");
    doc.text(sector.toUpperCase(), ML, y);
    doc.setDrawColor(224, 90, 43);
    doc.setLineWidth(0.4);
    doc.line(ML, y + 2, PW - MR, y + 2);
    y += 10;

    for (const a of arts) {
      if (y > PH - 40) {
        addFooter(pg);
        pg++;
        doc.addPage();
        addHeader();
        y = MT + 16;
      }

      // Title
      doc.setFontSize(10);
      setNavy();
      doc.setFont("helvetica", "bold");
      const titleLines = doc.splitTextToSize(a.title || "Untitled", BW);
      doc.text(titleLines, ML, y);
      y += titleLines.length * 5 + 2;

      // Summary
      const summaryLines = doc.splitTextToSize(
        config.summaryLength === "1"
          ? (a.summary || "").split(".")[0] + "."
          : (a.summary || "").split(".").slice(0,2).join(".") + ".",
        BW
      );
      doc.setFontSize(9);
      setBlack();
      doc.setFont("helvetica", "normal");
      doc.text(summaryLines, ML, y);
      y += summaryLines.length * 4.5 + 2;

      // Meta
      doc.setFontSize(8);
      setGray();
      doc.text(`${a.source || "Unknown"} · ${fmtDate(a.published_at)}`, ML, y);

      // Link
      if (config.showLinks && a.url) {
        y += 4;
        setOrange();
        const linkText = a.url.length > 60 ? a.url.slice(0, 60) + "…" : a.url;
        doc.text(`Read article: ${linkText}`, ML, y);
      }

      y += 8;

      // Divider
      doc.setDrawColor(232, 232, 232);
      doc.setLineWidth(0.2);
      doc.line(ML, y - 2, PW - MR, y - 2);
    }

    addFooter(pg);
  }

  // ── Last page: Signals summary ─────────────────────────────────────────────
  pg++;
  doc.addPage();
  addHeader();

  let sy = MT + 16;
  doc.setFontSize(14);
  setNavy();
  doc.setFont("helvetica", "bold");
  doc.text("Signals Summary", ML, sy);
  sy += 10;

  // Table headers
  const cols = ["Sector", "Strong Signals", "Emerging Signals", "Top Source"];
  const colW = [50, 40, 40, 60];
  let cx = ML;
  doc.setFontSize(8);
  setOrange();
  for (let i = 0; i < cols.length; i++) {
    doc.text(cols[i], cx + 2, sy);
    cx += colW[i];
  }
  doc.setDrawColor(224, 90, 43);
  doc.setLineWidth(0.3);
  doc.line(ML, sy + 2, PW - MR, sy + 2);
  sy += 6;

  for (const [sector, arts] of Object.entries(grouped)) {
    cx = ML;
    doc.setFontSize(8);
    setBlack();
    doc.setFont("helvetica", "normal");
    const strong   = arts.filter(a => a.signal_strength === "Strong").length;
    const emerging = arts.filter(a => a.signal_strength !== "Strong").length;
    const topSrc   = arts[0]?.source || "—";
    const row = [sector, String(strong), String(emerging), topSrc];
    for (let i = 0; i < row.length; i++) {
      doc.text(row[i], cx + 2, sy);
      cx += colW[i];
    }
    sy += 5;
  }

  addFooter(pg);

  doc.save(`AI_Watch_Brief_${new Date().toISOString().slice(0,10)}.pdf`);
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Newsletter() {
  const [step, setStep]       = useState(1);
  const [toast, setToast]     = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Handle resize
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // ── Step 1 state ──────────────────────────────────────────────────────────
  const [articles, setArticles]         = useState([]);
  const [articlesLoading, setArtLoading] = useState(true);
  const [selectedIds, setSelectedIds]   = useState(new Set());
  const [topicFilter, setTopicFilter]   = useState("All");
  const [dateFilter, setDateFilter]     = useState("all");
  const [signalFilter, setSignalFilter] = useState("All");

  // ── Step 2 config ─────────────────────────────────────────────────────────
  const [config, setConfig] = useState({
    includeImages:    true,
    showLinks:        true,
    aiSummary:        true,
    signalBadges:     false,
    startupSpotlight: false,
    summaryLength:    "2",
    tone:             "Professional",
    language:         "English",
    groupBy:          "Sector",
    linkStyle:        "Read more → button",
    maxArticles:      "8",
  });
  const cfg = (k, v) => setConfig(c => ({ ...c, [k]: v }));

  // ── Step 3 state ──────────────────────────────────────────────────────────
  const [sendTab,    setSendTab]    = useState("now");
  const [recipients, setRecipients] = useState([]);
  const [newEmail,   setNewEmail]   = useState("");
  const [subject,    setSubject]    = useState(`AI Watch Brief · ${todayStr()}`);
  const [sending,    setSending]    = useState(false);
  const [schedule,   setSchedule]   = useState({ days:["Mon","Wed","Fri"], hour:7, minute:0, frequency:"Weekly", enabled:false });
  const [savingSched, setSavingSched] = useState(false);
  const [sentHistory, setSentHistory] = useState([]);
  const [loadingHist, setLoadingHist] = useState(false);

  const showToast = (kind, msg) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Load articles — same call as Explore page
  const loadArticles = useCallback(() => {
    setArtLoading(true);
    getArticles({ pageSize: 50, page: 1 })
      .then(data => {
        // API returns { items: [], total: N }
        const list = data?.items || data?.articles || (Array.isArray(data) ? data : []);
        console.log("[Newsletter] article shape sample:", list[0]); // debug field names
        setArticles(list);
        // Pre-CHECK (checkbox) Strong Signal articles, but show all
        const preSelected = new Set(
          list.filter(a => a.signal_strength === "Strong").map(a => a.id || a.title)
        );
        setSelectedIds(preSelected);
      })
      .catch(() => setArticles([]))
      .finally(() => setArtLoading(false));
  }, []);

  useEffect(() => { loadArticles(); }, [loadArticles]);

  // Load recipients + schedule on mount
  useEffect(() => {
    getRecipients()
      .then(d => setRecipients(d.recipients || []))
      .catch(() => {});
    getSchedule()
      .then(d => setSchedule(s => ({ ...s, ...d })))
      .catch(() => {});
  }, []);

  // Load sent history when step 3 opens
  useEffect(() => {
    if (step !== 3) return;
    setLoadingHist(true);
    getSentHistory()
      .then(d => setSentHistory(d.history || []))
      .catch(() => {})
      .finally(() => setLoadingHist(false));
  }, [step]);

  // ── Filtered articles ─────────────────────────────────────────────────────
  const filtered = articles.filter(a => {
    const aTopic = a.topic || a.search_topic || a.industry || a.category || "General";
    if (topicFilter !== "All" && aTopic !== topicFilter) return false;
    if (signalFilter !== "All" && a.signal_strength !== signalFilter) return false;
    if (dateFilter !== "all") {
      const d = new Date(a.published_at || a.date || a.created_at);
      const now = new Date();
      if (dateFilter === "today" && (now - d) > 86400000) return false;
      if (dateFilter === "week"  && (now - d) > 7*86400000) return false;
      if (dateFilter === "month" && (now - d) > 30*86400000) return false;
    }
    return true;
  });

  const toggleId = (id) => setSelectedIds(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const toggleAll = () => {
    if (filtered.every(a => selectedIds.has(a.id || a.title))) {
      setSelectedIds(s => { const n = new Set(s); filtered.forEach(a => n.delete(a.id || a.title)); return n; });
    } else {
      setSelectedIds(s => { const n = new Set(s); filtered.forEach(a => n.add(a.id || a.title)); return n; });
    }
  };

  // ── Recipients management ─────────────────────────────────────────────────
  const handleAddRecipient = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) { showToast("error", "Enter a valid email address."); return; }
    if (recipients.includes(email)) { showToast("error", "Already in list."); return; }
    try {
      const data = await addRecipient(email);
      // Use the list returned by the server as source of truth
      setRecipients(data.recipients || [...recipients, email]);
      setNewEmail("");
      showToast("success", `${email} added.`);
    } catch (err) {
      showToast("error", err.message || "Failed to add recipient.");
    }
  };

  const handleRemoveRecipient = useCallback(async (email) => {
    try {
      const data = await removeRecipient(email);
      setRecipients(data.recipients || (r => r.filter(e => e !== email)));
    } catch (err) {
      showToast("error", err.message || "Failed to remove recipient.");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send now ──────────────────────────────────────────────────────────────
  const handleSendNow = async () => {
    if (selectedIds.size === 0) { showToast("error", "Select at least one article."); return; }
    if (recipients.length === 0) { showToast("error", "Add at least one recipient."); return; }
    setSending(true);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("aiwatch_at")}`,
        },
        body: JSON.stringify({
          article_ids: [...selectedIds],
          config,
          recipients,
          subject,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Server error ${res.status}`);
      showToast("success", `Sent to ${data.recipient_count} recipient(s) — ${data.article_count} articles.`);
    } catch (err) {
      showToast("error", err.message || "Send failed.");
    } finally {
      setSending(false);
    }
  };

  // ── Save schedule ─────────────────────────────────────────────────────────
  const handleSaveSchedule = async () => {
    setSavingSched(true);
    try {
      await saveSchedule(schedule);
      showToast("success", "Schedule saved.");
    } catch { showToast("error", "Failed to save schedule."); }
    finally { setSavingSched(false); }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const pill = (active) => ({
    fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:999, cursor:"pointer",
    border:`1.5px solid ${active ? "var(--orange)" : "var(--border-color)"}`, background: active ? "var(--orange-light)" : "var(--card-bg)",
    color: active ? "var(--orange)" : "var(--text-secondary)", transition:"all 0.15s",
  });

  const btnOrange = (loading) => ({
    background: loading ? "var(--border-color)" : "var(--orange)", color:"#fff", border:"none", borderRadius:8,
    padding:"10px 24px", fontSize:13, fontWeight:700, cursor: loading ? "default" : "pointer",
    transition:"background 0.2s", letterSpacing:0.3,
  });

  // Only block Next when no articles are selected — don't block just because filters hide results
  const nextDisabled = step === 1 && selectedIds.size === 0;

  return (
    <div style={{
      display:"flex", flexDirection:"column",
      minHeight:"100vh", background:"var(--surface)",
      fontFamily:"'Inter','Segoe UI',Arial,sans-serif", color:"var(--text-primary)",
    }}>

      <Toast t={toast} />

      {/* Step bar */}
      <StepBar step={step} selectedCount={selectedIds.size} />

      {/* Body */}
      <div style={{ flex:1, display:"flex", flexDirection: isMobile ? "column" : "row", overflow: isMobile ? "visible" : "hidden", minHeight:0 }}>

        {/* ── Main panel ── */}
        <div style={{ flex:1, overflowY:"auto", padding: isMobile ? "16px" : "24px 28px" }}>

          {/* ────────────── STEP 1 ────────────── */}
          {step === 1 && (
            <div>
              {/* Filters */}
              <div className="filter-chips-scroll" style={{
                display:"flex", alignItems:"center", gap:8,
                flexWrap: isMobile ? "nowrap" : "wrap",
                overflowX: isMobile ? "auto" : "visible",
                marginBottom:16, padding: isMobile ? "10px 12px" : "12px 16px", background:"var(--card-bg)",
                borderRadius:10, border:"1px solid var(--border-color)",
                WebkitOverflowScrolling: "touch",
              }}>
                <span style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", marginRight:4, flexShrink:0 }}>TOPIC</span>
                {TOPICS.map(t => (
                  <button key={t} style={{...pill(topicFilter === t), flexShrink:0}} onClick={() => setTopicFilter(t)}>{t}</button>
                ))}
                <div style={{ width:1, height:20, background:"var(--border-color)", margin:"0 4px", flexShrink:0 }} />
                <span style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", flexShrink:0 }}>SIGNAL</span>
                {["All","Strong","Weak"].map(s => (
                  <button key={s} style={{...pill(signalFilter === s), flexShrink:0}} onClick={() => setSignalFilter(s)}>{s}</button>
                ))}
                {!isMobile && <>
                  <div style={{ width:1, height:20, background:"var(--border-color)", margin:"0 4px" }} />
                  <span style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)" }}>DATE</span>
                  {[["all","All time"],["today","Today"],["week","This week"],["month","This month"]].map(([v,l]) => (
                    <button key={v} style={pill(dateFilter === v)} onClick={() => setDateFilter(v)}>{l}</button>
                  ))}
                </>}
              </div>
              {/* Date filter row - separate on mobile */}
              {isMobile && (
                <div className="filter-chips-scroll" style={{
                  display:"flex", alignItems:"center", gap:8,
                  overflowX:"auto",
                  marginBottom:16, padding:"10px 12px", background:"var(--card-bg)",
                  borderRadius:10, border:"1px solid var(--border-color)",
                  WebkitOverflowScrolling: "touch",
                }}>
                  <span style={{ fontSize:11, fontWeight:700, color:"var(--text-muted)", flexShrink:0 }}>DATE</span>
                  {[["all","All"],["today","Today"],["week","Week"],["month","Month"]].map(([v,l]) => (
                    <button key={v} style={{...pill(dateFilter === v), flexShrink:0}} onClick={() => setDateFilter(v)}>{l}</button>
                  ))}
                </div>
              )}

              {/* Article list header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ fontSize:13, color:"var(--text-secondary)" }}>
                    <strong style={{ color:"var(--text-primary)" }}>{filtered.length}</strong> articles · <strong style={{ color:"var(--orange)" }}>{selectedIds.size}</strong> selected
                  </div>
                  <button
                    onClick={loadArticles}
                    disabled={articlesLoading}
                    title="Refresh articles"
                    style={{
                      background:"none", border:"1px solid var(--border-color)", borderRadius:6,
                      width:28, height:28, cursor: articlesLoading ? "default" : "pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:14, color:"var(--text-muted)", opacity: articlesLoading ? 0.4 : 1,
                    }}
                  >↻</button>
                </div>
                <button style={{ ...pill(false), background:"var(--surface)" }} onClick={toggleAll}>
                  {filtered.length > 0 && filtered.every(a => selectedIds.has(a.id || a.title)) ? "Deselect All" : "Select All"}
                </button>
              </div>

              {/* Articles */}
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {/* Loading spinner */}
                {articlesLoading && (
                  <div style={{ textAlign:"center", padding:"48px 0" }}>
                    <div style={{
                      width:32, height:32, borderRadius:"50%",
                      border:"3px solid var(--border-color)", borderTopColor:"var(--orange)",
                      animation:"spin 0.8s linear infinite", margin:"0 auto 12px",
                    }} />
                    <div style={{ fontSize:13, color:"var(--text-muted)" }}>Loading articles…</div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                )}

                {/* No data yet */}
                {!articlesLoading && articles.length === 0 && (
                  <div style={{
                    textAlign:"center", padding:"48px 24px",
                    background:"var(--card-bg)", borderRadius:10, border:"1px solid var(--border-color)",
                  }}>
                    <div style={{ fontSize:28, marginBottom:12 }}>📭</div>
                    <div style={{ fontSize:14, fontWeight:700, color:"var(--text-primary)", marginBottom:6 }}>No articles loaded yet</div>
                    <div style={{ fontSize:13, color:"var(--text-muted)", marginBottom:16 }}>
                      Go to News Feed and click "Generate New Data" first, then come back.
                    </div>
                    <a href="/" style={{
                      display:"inline-block", background:"var(--orange)", color:"#fff",
                      padding:"8px 20px", borderRadius:8, fontSize:13, fontWeight:700,
                      textDecoration:"none",
                    }}>Go to News Feed →</a>
                  </div>
                )}

                {/* Filtered but empty */}
                {!articlesLoading && articles.length > 0 && filtered.length === 0 && (
                  <div style={{ textAlign:"center", color:"var(--text-muted)", padding:"32px 0", fontSize:13 }}>
                    No articles match the current filters. Try clearing the filters above.
                  </div>
                )}

                {filtered.map(a => {
                  const id     = a.id || a.title;
                  const sel    = selectedIds.has(id);
                  // Normalise field names — matches Explore.jsx exactly
                  const topic  = a.topic || a.search_topic || a.industry || a.category || "General";
                  const source = a.source || (a.url ? new URL(a.url).hostname.replace("www.","") : "Unknown");
                  const date   = a.published_at || a.date || a.created_at || "";
                  const strong = a.signal_strength === "Strong";
                  const sc     = SECTOR_COLORS[topic] || SECTOR_COLORS.General;
                  return (
                    <div
                      key={id}
                      onClick={() => toggleId(id)}
                      style={{
                        display:"flex", alignItems:"flex-start", gap:12,
                        background:"var(--card-bg)", borderRadius:8,
                        border:`1.5px solid ${sel ? "var(--orange)" : "var(--border-color)"}`,
                        padding:"12px 14px", cursor:"pointer",
                        transition:"border-color 0.15s",
                        boxShadow: sel ? "0 0 0 3px var(--orange-light)" : "none",
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{
                        width:18, height:18, borderRadius:4, flexShrink:0, marginTop:2,
                        border:`2px solid ${sel ? "var(--orange)" : "var(--border-color)"}`, background: sel ? "var(--orange)" : "var(--card-bg)",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        transition:"all 0.15s",
                      }}>
                        {sel && <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>}
                      </div>

                      {/* Content */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)", lineHeight:1.4, marginBottom:6 }}>
                          {a.title}
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
                          {source && (
                            <span style={{ fontSize:10, color:"var(--text-secondary)", fontWeight:600 }}>{source}</span>
                          )}
                          {topic && (
                            <span style={{
                              fontSize:10, fontWeight:700,
                              background:sc.bg, color:sc.color,
                              padding:"2px 8px", borderRadius:999,
                            }}>{topic}</span>
                          )}
                          <span style={{
                            fontSize:10, fontWeight:700,
                            background: strong ? "var(--orange-light)" : "var(--amber-light)",
                            color: strong ? "var(--orange)" : "var(--amber)",
                            padding:"2px 8px", borderRadius:999,
                          }}>
                            {strong ? "Strong Signal" : "Emerging"}
                          </span>
                          {date && (
                            <span style={{ fontSize:10, color:"var(--text-muted)" }}>{fmtDate(date)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ────────────── STEP 2 ────────────── */}
          {step === 2 && (
            <div style={{ maxWidth:580 }}>
              <div style={{ fontSize:15, fontWeight:800, color:"var(--text-primary)", marginBottom:20, letterSpacing:-0.3 }}>
                Configure Edition
              </div>

              <div style={{ background:"var(--card-bg)", borderRadius:12, padding:"20px 24px", border:"1px solid var(--border-color)" }}>
                <Section title="Content">
                  <ToggleRow label="Include article images"       desc="Pull cover image from source URL"              value={config.includeImages}    onChange={v => cfg("includeImages",v)} />
                  <ToggleRow label='Show "Read article" links'    desc="Append source URL below each summary"          value={config.showLinks}        onChange={v => cfg("showLinks",v)} />
                  <ToggleRow label="AI executive summary"         desc="1-paragraph strategic overview at top"         value={config.aiSummary}        onChange={v => cfg("aiSummary",v)} />
                  <ToggleRow label="Signal badges"                desc='Show "Strong / Emerging" labels on articles'   value={config.signalBadges}     onChange={v => cfg("signalBadges",v)} />
                  <ToggleRow label="Startup spotlight section"    desc="Auto-extract featured startups"                value={config.startupSpotlight} onChange={v => cfg("startupSpotlight",v)} />
                </Section>

                <Section title="Style">
                  <SelectRow label="Summary length" value={config.summaryLength} options={["1","2","3"]}                                         onChange={v => cfg("summaryLength",v)} />
                  <SelectRow label="Tone"           value={config.tone}          options={["Professional","Concise","Analytical"]}               onChange={v => cfg("tone",v)} />
                  <SelectRow label="Language"       value={config.language}      options={["English","French","Both"]}                           onChange={v => cfg("language",v)} />
                  <SelectRow label="Group articles by" value={config.groupBy}   options={["Sector","Signal strength","Date","No grouping"]}     onChange={v => cfg("groupBy",v)} />
                </Section>

                <Section title="Layout">
                  <SelectRow label="Article link style" value={config.linkStyle}    options={["Inline text link","Read more → button","No links"]}  onChange={v => cfg("linkStyle",v)} />
                  <SelectRow label="Max articles shown" value={config.maxArticles}  options={["5","8","12","All"]}                                  onChange={v => cfg("maxArticles",v)} />
                </Section>
              </div>
            </div>
          )}

          {/* ────────────── STEP 3 ────────────── */}
          {step === 3 && (
            <div style={{ maxWidth:580 }}>
              <div style={{ fontSize:15, fontWeight:800, color:"var(--text-primary)", marginBottom:20, letterSpacing:-0.3 }}>
                Send & Schedule
              </div>

              {/* Sub-tabs */}
              <div style={{ display:"flex", gap:0, marginBottom:20, borderBottom:"1px solid var(--border-color)" }}>
                {["now","schedule","history"].map(t => (
                  <button key={t} onClick={() => setSendTab(t)} style={{
                    background:"none", border:"none",
                    borderBottom:`2px solid ${sendTab === t ? "var(--orange)" : "transparent"}`,
                    color: sendTab === t ? "var(--orange)" : "var(--text-muted)", fontWeight:700,
                    fontSize:13, padding:"10px 20px", cursor:"pointer",
                    transition:"all 0.15s", textTransform:"capitalize",
                  }}>
                    {t === "now" ? "Send Now" : t === "schedule" ? "Schedule" : "History"}
                  </button>
                ))}
              </div>

              {/* ── Send Now ── */}
              {sendTab === "now" && (
                <div style={{ background:"var(--card-bg)", borderRadius:12, padding:24, border:"1px solid var(--border-color)" }}>
                  <div style={{ marginBottom:20 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:8 }}>
                      Recipients ({recipients.length})
                    </label>
                    <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:12 }}>
                      {recipients.map(email => (
                        <div key={email} style={{
                          display:"flex", alignItems:"center", justifyContent:"space-between",
                          background:"var(--surface)", border:"1px solid var(--border-color)", borderRadius:8,
                          padding:"8px 12px",
                        }}>
                          <span style={{ fontSize:13, color:"var(--text-primary)" }}>{email}</span>
                          <button
                            onClick={() => handleRemoveRecipient(email)}
                            style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-muted)", fontSize:16, lineHeight:1 }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <input
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAddRecipient()}
                        placeholder="email@example.com"
                        style={{
                          flex:1, height:38, padding:"0 12px", border:"1.5px solid var(--border-color)",
                          borderRadius:8, fontSize:13, outline:"none", background:"var(--input-bg)", color:"var(--text-primary)",
                        }}
                        onFocus={e => { e.target.style.borderColor = "var(--orange)"; }}
                        onBlur={e  => { e.target.style.borderColor = "var(--border-color)"; }}
                      />
                      <button onClick={handleAddRecipient} style={{ ...btnOrange(false), padding:"0 20px" }}>
                        + Add
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom:20 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:8 }}>
                      Subject Line
                    </label>
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      style={{
                        width:"100%", height:42, padding:"0 14px",
                        border:"1.5px solid var(--border-color)", borderRadius:8,
                        fontSize:13, outline:"none", boxSizing:"border-box", background:"var(--input-bg)", color:"var(--text-primary)",
                      }}
                      onFocus={e => { e.target.style.borderColor = "var(--orange)"; }}
                      onBlur={e  => { e.target.style.borderColor = "var(--border-color)"; }}
                    />
                    <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:4 }}>
                      Preview: <em>{subject}</em>
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                    <button
                      onClick={handleSendNow}
                      disabled={sending}
                      style={{ ...btnOrange(sending), fontSize:14, padding:"12px 32px" }}
                    >
                      {sending ? "Sending…" : "Send Now"}
                    </button>
                    <button
                      onClick={() => generatePDF(articles, config, selectedIds)}
                      style={{
                        background:"var(--card-bg)", border:"1.5px solid var(--border-color)", borderRadius:8,
                        padding:"12px 20px", fontSize:13, fontWeight:700, color:"var(--text-secondary)",
                        cursor:"pointer",
                      }}
                    >
                      Download PDF
                    </button>
                  </div>

                  {selectedIds.size > 0 && (
                    <div style={{ marginTop:16, fontSize:12, color:"var(--text-muted)" }}>
                      Will include <strong style={{ color:"var(--text-primary)" }}>{selectedIds.size}</strong> selected article(s) to <strong style={{ color:"var(--text-primary)" }}>{recipients.length}</strong> recipient(s).
                    </div>
                  )}
                </div>
              )}

              {/* ── Schedule ── */}
              {sendTab === "schedule" && (
                <div style={{ background:"var(--card-bg)", borderRadius:12, padding:24, border:"1px solid var(--border-color)" }}>
                  <div style={{ marginBottom:20 }}>
                    <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:10 }}>
                      Days
                    </label>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {DAYS.map(d => {
                        const on = schedule.days.includes(d);
                        return (
                          <button key={d} onClick={() => {
                            setSchedule(s => ({
                              ...s, days: on ? s.days.filter(x => x !== d) : [...s.days, d]
                            }));
                          }} style={{
                            width:44, height:44, borderRadius:8, fontWeight:700, fontSize:12,
                            border:`1.5px solid ${on ? "var(--orange)" : "var(--border-color)"}`,
                            background: on ? "var(--orange-light)" : "var(--card-bg)", color: on ? "var(--orange)" : "var(--text-secondary)", cursor:"pointer",
                          }}>{d}</button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:8 }}>Time (UTC)</label>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <select value={schedule.hour} onChange={e => setSchedule(s => ({...s, hour:parseInt(e.target.value)}))}
                          style={{ height:38, padding:"0 8px", border:"1.5px solid var(--border-color)", borderRadius:8, fontSize:13, outline:"none", background:"var(--input-bg)", color:"var(--text-primary)" }}>
                          {Array.from({length:24},(_,i) => <option key={i} value={i}>{String(i).padStart(2,"0")}</option>)}
                        </select>
                        <span style={{ fontWeight:700, color:"var(--text-muted)" }}>:</span>
                        <select value={schedule.minute} onChange={e => setSchedule(s => ({...s, minute:parseInt(e.target.value)}))}
                          style={{ height:38, padding:"0 8px", border:"1.5px solid var(--border-color)", borderRadius:8, fontSize:13, outline:"none", background:"var(--input-bg)", color:"var(--text-primary)" }}>
                          {[0,15,30,45].map(m => <option key={m} value={m}>{String(m).padStart(2,"0")}</option>)}
                        </select>
                        <span style={{ fontSize:12, color:"var(--text-muted)" }}>UTC</span>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize:11, fontWeight:700, color:"var(--text-secondary)", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:8 }}>Frequency</label>
                      <select value={schedule.frequency} onChange={e => setSchedule(s => ({...s, frequency:e.target.value}))}
                        style={{ height:38, padding:"0 12px", border:"1.5px solid var(--border-color)", borderRadius:8, fontSize:13, outline:"none", background:"var(--input-bg)", color:"var(--text-primary)" }}>
                        {["Weekly","Bi-weekly","Daily"].map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Next send preview */}
                  {schedule.days.length > 0 && (
                    <div style={{
                      background:"var(--surface)", border:"1px solid var(--border-color)", borderRadius:8,
                      padding:"10px 14px", marginBottom:20, fontSize:12, color:"var(--text-secondary)",
                    }}>
                      Next send: <strong style={{ color:"var(--text-primary)" }}>
                        {schedule.days[0]} {String(schedule.hour).padStart(2,"0")}:{String(schedule.minute).padStart(2,"0")} UTC
                      </strong>
                    </div>
                  )}

                  <button
                    onClick={handleSaveSchedule}
                    disabled={savingSched}
                    style={btnOrange(savingSched)}
                  >
                    {savingSched ? "Saving…" : "Save Schedule"}
                  </button>
                </div>
              )}

              {/* ── History ── */}
              {sendTab === "history" && (
                <div style={{ background:"var(--card-bg)", borderRadius:12, padding:24, border:"1px solid var(--border-color)" }}>
                  {loadingHist && <div style={{ color:"var(--text-muted)", fontSize:13 }}>Loading…</div>}
                  {!loadingHist && sentHistory.length === 0 && (
                    <div style={{ color:"var(--text-muted)", fontSize:13, textAlign:"center", padding:"24px 0" }}>
                      No sends yet. Use "Send Now" to send your first edition.
                    </div>
                  )}
                  {sentHistory.map(h => (
                    <div key={h.id} style={{
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"12px 0", borderBottom:"1px solid var(--surface)", gap:12, flexWrap:"wrap",
                    }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"var(--text-primary)" }}>{h.subject}</div>
                        <div style={{ fontSize:11, color:"var(--text-muted)", marginTop:3 }}>{fmtDate(h.sent_at)}</div>
                      </div>
                      <div style={{ display:"flex", gap:12 }}>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>{h.recipient_count}</div>
                          <div style={{ fontSize:10, color:"var(--text-muted)" }}>recipients</div>
                        </div>
                        <div style={{ textAlign:"right" }}>
                          <div style={{ fontSize:12, fontWeight:700, color:"var(--text-primary)" }}>{h.article_count}</div>
                          <div style={{ fontSize:10, color:"var(--text-muted)" }}>articles</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation buttons ── */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:28 }}>
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              style={{
                background:"none", border:"1.5px solid var(--border-color)", borderRadius:8,
                padding:"10px 24px", fontSize:13, fontWeight:700, color:"var(--text-secondary)",
                cursor: step === 1 ? "default" : "pointer",
                opacity: step === 1 ? 0.4 : 1,
              }}
            >← Back</button>
            {step < 3 && (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={nextDisabled}
                style={{ ...btnOrange(nextDisabled), opacity: nextDisabled ? 0.4 : 1 }}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* ── Live preview panel ── */}
        <LivePreview
          articles={articles}
          config={config}
          selectedIds={selectedIds}
          recipients={recipients}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
}
