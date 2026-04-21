/**
 * Rich Chronologie Timeline Component
 * – Auto-plays through all 12 months (4 s each)
 * – Progress bar shows time remaining per slide
 * – Pause / Resume button
 * – Clicking a node pauses auto-play and jumps to that month
 * – Timeline track auto-scrolls to keep active dot visible
 * – Typewriter animation on quote
 * – Enhanced image: zoom-on-hover, rich gradient overlay, premium badges
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ALL_MONTHS } from "../pages/newsletterSharedData";
import { rv } from "../pages/useBreakpoint";

const NODE_COLORS = { 2024: "#8B91B5", 2025: "#E84E0F", 2026: "#7C3AED" };
const INTERVAL_MS = 4000; // ms per slide

const TIMELINE_IMGS = {
  "nov-2024":  "/newsletter-images/page116_gen_ai_summit_2024_-_insights_on_ai___digital_transformation.jpg",
  "dec-2024":  "/newsletter-images/page110_ben_m_sik_forum___casablanca.jpg",
  "jan-2025":  "/newsletter-images/page002_quality_at_the_heart_of_the_adm_seminar.jpg",
  "fev-2025":  "/newsletter-images/page097_a_look_back_at_our_recent_town_hall_with_leadership.jpg",
  "avr-2025":  "/newsletter-images/page187_inside_gitex_africa_2025_dxc.jpg",
  "aout-2025": "/newsletter-images/page184_colleagues_from_across_dxc_cdg_took_on_the.jpg",
  "sep-2025":  "/newsletter-images/page144_brandon_hall_group_excellence_gold.jpg",
  "oct-2025":  "/newsletter-images/page117_fy25_s1_review_strengthened_partnership_and_shared_trust.jpg",
  "nov-2025":  "/newsletter-images/page086_dxc_cdg_earns_cgem_csr_label_.jpg",
  "dec-2025":  "/newsletter-images/page144_brandon_hall_group_excellence_gold.jpg",
  "fev-2026":  "/newsletter-images/page010_new_contracts_strengthening_our.jpg",
  "mars-2026": "/newsletter-images/page023_fy26_vow_preparations_are_underway_.jpg",
};

// ── Typewriter hook ────────────────────────────────────────────────────────────
function useTypewriter(text, speed = 22, trigger = 0) {
  const [displayed, setDisplayed] = useState("");
  const idxRef = useRef(0);
  const tmrRef = useRef(null);

  useEffect(() => {
    if (!text) return;
    setDisplayed("");
    idxRef.current = 0;
    clearInterval(tmrRef.current);
    const startDelay = setTimeout(() => {
      tmrRef.current = setInterval(() => {
        idxRef.current += 1;
        setDisplayed(text.slice(0, idxRef.current));
        if (idxRef.current >= text.length) clearInterval(tmrRef.current);
      }, speed);
    }, 260);
    return () => { clearTimeout(startDelay); clearInterval(tmrRef.current); };
  }, [text, trigger]); // eslint-disable-line

  return displayed;
}

export default function ChronologieTimelineRich({ bp, h2Size = 20 }) {
  const allKeys      = ALL_MONTHS.map(m => m.key);
  const [idx, setIdx]           = useState(0);          // current month index
  const [playing, setPlaying]   = useState(true);        // auto-play state
  const [progress, setProgress] = useState(0);           // 0-100 progress bar
  const [typingKey, setTypingKey] = useState(0);
  const [imgHovered, setImgHovered] = useState(false);

  const trackRef    = useRef(null);  // ref to the scrollable track div
  const nodeRefs    = useRef({});    // ref map: key → DOM node
  const intervalRef = useRef(null);
  const progressRef = useRef(null);
  const startRef    = useRef(null);

  const selectedKey = allKeys[idx];
  const nodeData    = ALL_MONTHS[idx];
  const nc          = NODE_COLORS[nodeData?.year] || "var(--accent-orange)";
  const quoteText   = nodeData ? `« ${nodeData.quote} »` : "";
  const typed       = useTypewriter(quoteText, 22, typingKey);
  const gridCard    = rv(bp, "1fr", "1fr 1fr", "1fr 1fr");

  // ── Auto-scroll the track to keep active dot in view ──────────────────────
  const scrollToActive = useCallback((key) => {
    const track = trackRef.current;
    const node  = nodeRefs.current[key];
    if (!track || !node) return;
    const trackRect = track.getBoundingClientRect();
    const nodeRect  = node.getBoundingClientRect();
    const center    = nodeRect.left - trackRect.left + nodeRect.width / 2;
    const target    = track.scrollLeft + center - trackRect.width / 2;
    track.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  // ── Advance to next month ──────────────────────────────────────────────────
  const goTo = useCallback((newIdx, resetProgress = true) => {
    setIdx(newIdx);
    setTypingKey(k => k + 1);
    if (resetProgress) setProgress(0);
    scrollToActive(allKeys[newIdx]);
  }, [allKeys, scrollToActive]);

  // ── Progress bar animation ─────────────────────────────────────────────────
  const startProgress = useCallback(() => {
    cancelAnimationFrame(progressRef.current);
    startRef.current = null;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const pct = Math.min((elapsed / INTERVAL_MS) * 100, 100);
      setProgress(pct);
      if (pct < 100) progressRef.current = requestAnimationFrame(step);
    };
    progressRef.current = requestAnimationFrame(step);
  }, []);

  // ── Auto-play interval ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) {
      clearInterval(intervalRef.current);
      cancelAnimationFrame(progressRef.current);
      return;
    }
    setProgress(0);
    startProgress();
    intervalRef.current = setInterval(() => {
      setIdx(prev => {
        const next = (prev + 1) % allKeys.length;
        setTypingKey(k => k + 1);
        setProgress(0);
        scrollToActive(allKeys[next]);
        return next;
      });
      startProgress();
    }, INTERVAL_MS);
    return () => { clearInterval(intervalRef.current); cancelAnimationFrame(progressRef.current); };
  }, [playing, startProgress, scrollToActive, allKeys]);

  // ── Scroll to active on mount ──────────────────────────────────────────────
  useEffect(() => {
    scrollToActive(selectedKey);
  }, []); // eslint-disable-line

  function handleNodeClick(key) {
    const newIdx = allKeys.indexOf(key);
    setPlaying(false);           // pause auto-play on manual click
    goTo(newIdx, true);
  }

  return (
    <>
      <style>{`
        .tl-rich-scroll::-webkit-scrollbar { height: 4px; }
        .tl-rich-scroll::-webkit-scrollbar-track { background: var(--bg-surface); border-radius: 3px; }
        .tl-rich-scroll::-webkit-scrollbar-thumb { background: var(--accent-orange); border-radius: 3px; }
        .tl-rich-node { transition: transform 0.18s; cursor: pointer; }
        .tl-rich-node:hover { transform: scale(1.12); }
        @keyframes tlFadeIn  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tlImgIn   { from{opacity:0;transform:scale(1.05)} to{opacity:1;transform:scale(1)} }
        @keyframes tlCursor  { 0%,100%{opacity:1} 50%{opacity:0} }
        .tl-hero-img {
          width:100%; height:100%; object-fit:cover; object-position:center;
          display:block;
          transition: transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94);
          animation: tlImgIn 0.55s ease forwards;
        }
        .tl-hero-img.zoomed { transform: scale(1.06); }
        .tl-quote-cursor {
          display:inline-block; width:2px; height:1em;
          background:currentColor; margin-left:3px; vertical-align:-0.1em;
          animation: tlCursor 0.85s step-end infinite;
        }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <h2 style={{ fontSize: h2Size, fontWeight: 800, margin: "0 0 2px" }}>
        Chronologie des 12 Éditions
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 4px" }}>
        Cliquez sur un mois pour afficher les détails
      </p>

      {/* ── Progress bar ─────────────────────────────────────────────────────── */}
      <div style={{ height:3, background:"var(--border)", borderRadius:2, marginBottom:20, overflow:"hidden" }}>
        <div style={{
          height:"100%", width:`${progress}%`,
          background:`linear-gradient(90deg,${nc},${nc}cc)`,
          borderRadius:2,
          transition: playing ? "none" : "width 0.2s",
        }} />
      </div>

      {/* ── Timeline track ────────────────────────────────────────────────────── */}
      <div ref={trackRef} className="tl-rich-scroll" style={{
        overflowX:"auto", paddingBottom:12, WebkitOverflowScrolling:"touch",
      }}>
        <div style={{ display:"flex", alignItems:"center", width:"max-content", padding:"8px 4px", minWidth:"100%" }}>
          {ALL_MONTHS.map((m, i) => {
            const color  = NODE_COLORS[m.year] || "var(--accent-orange)";
            const active = selectedKey === m.key;
            return (
              <React.Fragment key={m.key}>
                {i > 0 && (
                  <div style={{
                    width: rv(bp, 16, 22, 28), height:2, flexShrink:0,
                    background:`linear-gradient(90deg,${NODE_COLORS[ALL_MONTHS[i-1].year]},${color})`,
                  }} />
                )}
                <div
                  ref={el => { nodeRefs.current[m.key] = el; }}
                  className="tl-rich-node"
                  onClick={() => handleNodeClick(m.key)}
                  style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, minWidth: rv(bp,44,50,56), padding:"4px 2px" }}
                >
                  <div style={{ width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{
                      width: active ? 16 : 10, height: active ? 16 : 10,
                      borderRadius:"50%",
                      background: active ? color : "transparent",
                      border:`2.5px solid ${color}`,
                      boxShadow: active ? `0 0 14px ${color}99` : "none",
                      transition:"all 0.22s",
                    }} />
                  </div>
                  <div style={{ fontSize: rv(bp,9,10,11), fontWeight: active ? 700 : 500, color: active ? color : "var(--text-secondary)", textAlign:"center", lineHeight:1.2 }}>
                    {m.short}
                  </div>
                  <div style={{ fontSize:9, color:"var(--text-muted)" }}>{m.year}</div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Year legend */}
      <div style={{ display:"flex", gap:16, marginTop:4, flexWrap:"wrap" }}>
        {Object.entries(NODE_COLORS).map(([yr, c]) => (
          <div key={yr} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:c }} />
            <span style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:500 }}>{yr}</span>
          </div>
        ))}
      </div>

      {/* ── Node detail card ──────────────────────────────────────────────────── */}
      {nodeData && (
        <div key={selectedKey} style={{
          marginTop:20, background:"var(--bg-card)",
          border:"1px solid var(--border)",
          borderLeft:`4px solid ${nc}`,
          borderRadius:14, overflow:"hidden",
          animation:"tlFadeIn 0.28s ease",
          boxShadow:"0 8px 32px rgba(0,0,0,0.10)",
        }}>

          {/* ── Hero image ─────────────────────────────────────────────────── */}
          <div
            style={{ height: rv(bp,220,300,400), overflow:"hidden", background:"linear-gradient(135deg,var(--bg-surface),var(--bg-card))", position:"relative", cursor:"default" }}
            onMouseEnter={() => setImgHovered(true)}
            onMouseLeave={() => setImgHovered(false)}
          >
            <img
              key={selectedKey}
              src={TIMELINE_IMGS[nodeData.key] || "/newsletter-images/page187_inside_gitex_africa_2025_dxc.jpg"}
              alt={nodeData.label}
              className={`tl-hero-img${imgHovered ? " zoomed" : ""}`}
              onError={e => { e.target.style.display="none"; e.target.parentElement.style.background="linear-gradient(135deg,var(--bg-surface),var(--bg-card))"; }}
            />
            {/* Deep gradient bottom */}
            <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"linear-gradient(to top,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.28) 42%,rgba(0,0,0,0.04) 75%,transparent 100%)" }} />
            {/* Edge vignette */}
            <div style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse at center,transparent 52%,rgba(0,0,0,0.22) 100%)" }} />

            {/* Bottom-left: edition label */}
            <div style={{ position:"absolute", bottom:"1.4rem", left:"1.6rem", color:"#fff", maxWidth:"72%" }}>
              <div style={{ fontSize: rv(bp,18,22,26), fontWeight:900, textShadow:"0 2px 8px rgba(0,0,0,0.5)", letterSpacing:"-0.01em", marginBottom:4 }}>
                {nodeData.label}
              </div>
              <div style={{ fontSize: rv(bp,12,13,14), opacity:0.92, textShadow:"0 1px 3px rgba(0,0,0,0.45)", lineHeight:1.4 }}>
                {nodeData.highlight}
              </div>
            </div>

            {/* Top-right: article count */}
            <div style={{ position:"absolute", top:"1rem", right:"1rem", background:"rgba(255,255,255,0.96)", color:"#111", borderRadius:9, padding:"6px 13px", fontSize:13, fontWeight:800, boxShadow:"0 2px 12px rgba(0,0,0,0.20)" }}>
              {nodeData.articleCount} art.
            </div>

            {/* Top-left: year pill */}
            <div style={{ position:"absolute", top:"1rem", left:"1.1rem", background:nc, color:"#fff", borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:700, boxShadow:`0 2px 8px ${nc}66` }}>
              {nodeData.year}
            </div>

            {/* Bottom-right: slide counter */}
            <div style={{ position:"absolute", bottom:"1rem", right:"1.1rem", background:"rgba(0,0,0,0.50)", color:"#fff", borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:600 }}>
              {idx + 1} / {allKeys.length}
            </div>
          </div>

          {/* ── Content ────────────────────────────────────────────────────── */}
          <div style={{ padding: rv(bp,"16px","20px","26px") }}>
            <div style={{ display:"grid", gridTemplateColumns:gridCard, gap: rv(bp,16,20,28), marginBottom:18 }}>
              {/* KPIs */}
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>KPIs</div>
                {nodeData.kpis.map((k, i) => (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:nc, marginTop:6, flexShrink:0 }} />
                    <span style={{ fontSize: rv(bp,12,13,14), color:"var(--text-primary)", lineHeight:1.5 }}>{k}</span>
                  </div>
                ))}
              </div>
              {/* Events */}
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Événements</div>
                {nodeData.events.map((e, i) => (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ width:20, height:20, borderRadius:5, flexShrink:0, background:nc+"18", color:nc, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: rv(bp,12,13,14), color:"var(--text-primary)", lineHeight:1.5 }}>{e}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Typewriter quote ───────────────────────────────────────── */}
            <div style={{ paddingTop:14, borderTop:"1px solid var(--border)" }}>
              <div style={{ fontSize: rv(bp,13,14,15), color:"var(--text-secondary)", fontStyle:"italic", lineHeight:1.7, minHeight: rv(bp,44,48,52) }}>
                {typed}
                {typed.length < quoteText.length && (
                  <span className="tl-quote-cursor" style={{ color:nc }} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
