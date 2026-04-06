import { useState, useRef, useEffect } from "react";

const ACCENT     = "#1A4A9E";
const ACCENT_BG  = "#e8eef8";
const CATEGORIES = [
  "All Industries",
  "AI",
  "Fintech",
  "HealthTech",
  "Cybersecurity",
  "CleanTech",
  "Robotics",
];

export default function CategoryCombobox({ onSelect, selected: externalSelected, dropdownAlign = "left" }) {
  const [open, setOpen]       = useState(false);
  const [selected, setSelected] = useState(externalSelected || "All Industries");
  const ref = useRef(null);

  // Sync when parent changes the selected value
  useEffect(() => {
    if (externalSelected !== undefined) setSelected(externalSelected);
  }, [externalSelected]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (cat) => {
    setSelected(cat);
    setOpen(false);
    if (onSelect) onSelect(cat);
  };

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none", flexShrink: 0 }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px",
          border: open ? `1.5px solid ${ACCENT}` : "1.5px solid #e2e0ea",
          borderRadius: 8,
          background: selected !== "All Industries" ? ACCENT_BG : "#fff",
          color: selected !== "All Industries" ? ACCENT : "#444",
          fontSize: 13,
          fontWeight: selected !== "All Industries" ? 700 : 500,
          cursor: "pointer",
          minWidth: 160,
          justifyContent: "space-between",
          transition: "border-color 0.15s",
          boxShadow: open ? `0 0 0 3px ${ACCENT}18` : "none",
          outline: "none",
        }}
      >
        <span>{selected}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          ...(dropdownAlign === "right" ? { right: 0 } : { left: 0 }),
          minWidth: "100%",
          background: "#fff",
          border: "1.5px solid #e2e0ea",
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          zIndex: 200,
          overflow: "hidden",
        }}>
          {CATEGORIES.map(cat => {
            const active = cat === selected;
            return (
              <div
                key={cat}
                onClick={() => handleSelect(cat)}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#e8eef8"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                style={{
                  padding: "9px 14px",
                  fontSize: 13,
                  fontWeight: active ? 700 : 400,
                  color: active ? ACCENT : "#333",
                  background: active ? ACCENT_BG : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background 0.1s",
                }}
              >
                {active && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke={ACCENT} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {!active && <span style={{ width: 12, display: "inline-block" }} />}
                {cat}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
