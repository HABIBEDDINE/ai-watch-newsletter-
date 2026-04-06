import { jsPDF } from "jspdf";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

export const generatePDF = (report) => {
  const cleanSummary = (text) => {
    if (!text) return "";
    return text
      .replace(/^[-*]\s*/gm, "")
      .replace(/^[•]\s*/gm, "")
      .replace(/\r?\n+/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const PW  = pdf.internal.pageSize.getWidth();
  const PH  = pdf.internal.pageSize.getHeight();
  const M   = 20;
  const CW  = PW - M * 2;

  const C = {
    purple:   [107, 44, 148],
    purpleLt: [243, 240, 255],
    purpleBd: [200, 180, 230],
    grayDim:  [130, 100, 160],
    white:    [255, 255, 255],
    black:    [17,  17,  17],
    gray:     [100, 100, 100],
    grayLt:   [218, 218, 218],
    green:    [22,  163, 74],
    greenLt:  [220, 252, 231],
    amber:    [180, 120, 0],
    amberLt:  [254, 243, 199],
  };

  // Category accent colours for left bar
  const CAT_COLORS = {
    "AI":            [107, 44, 148],
    "Fintech":       [22,  163, 74],
    "HealthTech":    [220, 38,  38],
    "Cybersecurity": [217, 119, 6],
    "CleanTech":     [5,   150, 105],
    "Robotics":      [37,  99,  235],
  };

  const checkPage = (y, needed = 20) => {
    if (y + needed > PH - 18) { pdf.addPage(); return M + 8; }
    return y;
  };

  const addFooters = () => {
    const n = pdf.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      pdf.setPage(i);
      pdf.setDrawColor(...C.grayLt);
      pdf.setLineWidth(0.3);
      pdf.line(M, PH - 14, PW - M, PH - 14);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(...C.gray);
      pdf.text("AI Watch  -  Strategic Intelligence Brief  -  DXC Technology", M, PH - 8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...C.purple);
      pdf.text(`Page ${i} / ${n}`, PW - M, PH - 8, { align: "right" });
    }
  };

  // ── Header banner ────────────────────────────────────────────────────────
  pdf.setFillColor(...C.purple);
  pdf.rect(0, 0, PW, 32, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(...C.white);
  pdf.text("AI Watch", M, 14);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("Strategic Intelligence Brief", M, 23);
  pdf.setTextColor(220, 200, 240);
  pdf.text("DXC Technology", PW - M, 14, { align: "right" });

  // Report title
  let y = 42;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(...C.black);
  const titleLines = pdf.splitTextToSize(report.title || "Intelligence Report", CW);
  pdf.text(titleLines, M, y);
  y += titleLines.length * 6.5 + 3;
  pdf.setDrawColor(...C.purple);
  pdf.setLineWidth(0.4);
  pdf.line(M, y, M + CW, y);
  y += 8;

  // ── Meta box (2x2 grid) ──────────────────────────────────────────────────
  const genDate   = formatDate(report.generated_date || new Date());
  const artCount  = report.articles?.length || report.article_count || 0;
  const strongCnt = (report.articles || []).filter(
    a => (a.signal || "").toUpperCase() === "STRONG"
  ).length;

  pdf.setFillColor(...C.purpleLt);
  pdf.roundedRect(M, y, CW, 30, 2, 2, "F");
  pdf.setDrawColor(...C.purpleBd);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(M, y, CW, 30, 2, 2, "S");

  [
    ["GENERATED",      genDate],
    ["TOPIC",          report.topic || "All"],
    ["ARTICLES",       String(artCount)],
    ["STRONG SIGNALS", `${strongCnt} / ${artCount}`],
  ].forEach(([label, value], i) => {
    const mx = M + (i % 2) * (CW / 2) + 6;
    const my = y + 8 + Math.floor(i / 2) * 13;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(...C.grayDim);
    pdf.text(label, mx, my);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...C.black);
    pdf.text(value, mx, my + 6);
  });
  y += 38;

  // ── Executive Summary ────────────────────────────────────────────────────
  if (report.summary) {
    y = checkPage(y, 30);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...C.purple);
    pdf.text("EXECUTIVE SUMMARY", M, y);
    y += 5;
    pdf.setDrawColor(...C.purple);
    pdf.setLineWidth(0.35);
    pdf.line(M, y, M + CW, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(...C.black);
    const sl = pdf.splitTextToSize(cleanSummary(report.summary), CW);
    pdf.text(sl, M, y);
    y += sl.length * 5 + 10;
  }

  // ── Key Findings (first sentence of each article summary) ────────────────
  const keyFindings = (report.articles || []).slice(0, 5).map(a => {
    const text = cleanSummary(a.summary || a.description || a.title || "");
    return text.split(/[.!?]/)[0].trim() || a.title || "";
  }).filter(Boolean);

  if (keyFindings.length > 0) {
    y = checkPage(y, 30);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...C.purple);
    pdf.text("KEY FINDINGS", M, y);
    y += 5;
    pdf.setDrawColor(...C.purple);
    pdf.setLineWidth(0.35);
    pdf.line(M, y, M + CW, y);
    y += 6;
    keyFindings.forEach((finding) => {
      y = checkPage(y, 14);
      const lines = pdf.splitTextToSize(`- ${finding}`, CW - 8);
      const pillH = lines.length * 5 + 5;
      pdf.setFillColor(...C.purpleLt);
      pdf.roundedRect(M, y - 4, CW, pillH, 2, 2, "F");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(...C.black);
      pdf.text(lines, M + 5, y);
      y += pillH + 3;
    });
    y += 4;
  }

  // ── Table of Contents ────────────────────────────────────────────────────
  const tocArticles = (report.articles || []).slice(0, 10);
  if (tocArticles.length > 0) {
    y = checkPage(y, 30);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...C.purple);
    pdf.text("TABLE OF CONTENTS", M, y);
    y += 5;
    pdf.setDrawColor(...C.purple);
    pdf.setLineWidth(0.35);
    pdf.line(M, y, M + CW, y);
    y += 7;

    tocArticles.forEach((a, idx) => {
      y = checkPage(y, 8);
      const num   = String(idx + 1).padStart(2, "0");
      const title = (a.title || "").length > 68
        ? (a.title || "").slice(0, 68) + "..."
        : (a.title || "");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...C.black);
      pdf.text(`${num}  ${title}`, M, y);

      const tocSig = (a.signal || "").toUpperCase();
      if (tocSig) {
        const isStrong = tocSig === "STRONG";
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(...(isStrong ? C.green : C.amber));
        pdf.text(tocSig, PW - M, y, { align: "right" });
      }
      y += 6;
    });
    y += 6;
  }

  // ── Articles ─────────────────────────────────────────────────────────────
  if (report.articles?.length > 0) {
    y = checkPage(y, 24);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...C.purple);
    pdf.text("ARTICLES", M, y);
    y += 5;
    pdf.setDrawColor(...C.purple);
    pdf.setLineWidth(0.35);
    pdf.line(M, y, M + CW, y);
    y += 8;

    report.articles.forEach((a, idx) => {
      y = checkPage(y, 55);
      const rowY = y;

      // Category colour bar on left edge
      const cat         = a.category || a.industry || "";
      const accentColor = CAT_COLORS[cat] || C.purple;
      pdf.setFillColor(...accentColor);
      pdf.rect(M - 4, rowY - 4, 2.5, 22, "F");

      const sig      = (a.signal || "Moderate").toUpperCase();
      const isStrong = sig === "STRONG";
      const fgColor  = isStrong ? C.green : C.amber;

      // Number (two-digit)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(...C.purple);
      pdf.text(String(idx + 1).padStart(2, "0"), M, rowY);

      // Title — full content width
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      const tLines = pdf.splitTextToSize(a.title || "Untitled", CW - 16);
      pdf.setTextColor(...C.black);
      pdf.text(tLines, M + 8, rowY);
      y += tLines.length * 6 + 3;

      // Meta line — source · date · relevance · SIGNAL appended
      const metaParts = [
        a.source || null,
        a.date   || null,
        a.relevance != null ? `Relevance: ${a.relevance}/10` : null,
      ].filter(Boolean);
      const metaBase = metaParts.join("  |  ");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...C.gray);
      pdf.text(metaBase, M + 8, y);

      const metaBaseW  = pdf.getTextWidth(metaBase);
      const badgeLabel = `  ${sig}`;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(...fgColor);
      pdf.text(badgeLabel, M + 8 + metaBaseW, y);
      y += 7;

      // Thin divider under meta
      pdf.setDrawColor(...C.grayLt);
      pdf.setLineWidth(0.25);
      pdf.line(M + 8, y, M + CW, y);
      y += 5;

      // Summary — one clean paragraph (max 4 lines)
      const summaryClean = cleanSummary(a.summary || "");
      if (summaryClean) {
        y = checkPage(y, 22);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(55, 55, 55);
        const sLines = pdf.splitTextToSize(summaryClean, CW - 11).slice(0, 4);
        pdf.text(sLines, M + 8, y);
        y += sLines.length * 4.8 + 3;
      }

      // Keywords pills
      if (a.keywords?.length > 0) {
        y = checkPage(y, 12);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.setTextColor(...C.gray);
        pdf.text("KEYWORDS", M + 8, y);
        y += 5;
        let kx = M + 8;
        a.keywords.forEach((kw) => {
          const kwW = pdf.getTextWidth(kw) + 6;
          if (kx + kwW > PW - M) { kx = M + 8; y += 7; }
          y = checkPage(y, 8);
          pdf.setFillColor(...C.purpleLt);
          pdf.setDrawColor(...C.purpleBd);
          pdf.setLineWidth(0.3);
          pdf.roundedRect(kx, y - 4, kwW, 6, 1, 1, "FD");
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(7.5);
          pdf.setTextColor(...C.purple);
          pdf.text(kw, kx + 3, y);
          kx += kwW + 3;
        });
        y += 8;
      }

      // Industry tag
      if (cat) {
        y = checkPage(y, 8);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.setTextColor(...accentColor);
        pdf.text(`Industry: ${cat}`, M + 8, y);
        y += 6;
      }

      // "Read Full Article" — visible styled text + clickable PDF link
      if (a.url) {
        y = checkPage(y, 9);
        const linkText = "Read Full Article";
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(...C.purple);
        pdf.text(linkText, M + 8, y);
        const lw = pdf.getTextWidth(linkText);
        pdf.setDrawColor(...C.purple);
        pdf.setLineWidth(0.3);
        pdf.line(M + 8, y + 1, M + 8 + lw, y + 1);
        pdf.link(M + 8, y - 4, lw, 6, { url: a.url });
        y += 8;
      }

      // Bottom separator
      pdf.setDrawColor(...C.grayLt);
      pdf.setLineWidth(0.3);
      pdf.line(M, y, M + CW, y);
      y += 8;
    });
  }

  addFooters();
  pdf.save(`${(report.title || "ai-watch-report").replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`);
};
