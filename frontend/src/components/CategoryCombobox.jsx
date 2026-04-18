import { useState, useRef, useEffect } from "react";

// Default categories for Explore page
const DEFAULT_CATEGORIES = [
  { id: "All Industries", label: "All Industries" },
  { id: "AI", label: "AI" },
  { id: "Fintech", label: "Fintech" },
  { id: "HealthTech", label: "HealthTech" },
  { id: "Cybersecurity", label: "Cybersecurity" },
  { id: "CleanTech", label: "CleanTech" },
  { id: "Robotics", label: "Robotics" },
];

export default function CategoryCombobox({
  onSelect,
  selected: externalSelected,
  categories = DEFAULT_CATEGORIES,
  dropdownAlign = "left",
  placeholder = "Select...",
  isMobile = false,
  fullWidth = false,
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(externalSelected || (categories[0]?.id ?? ""));
  const ref = useRef(null);

  // Normalize categories to always be { id, label } objects
  const normalizedCategories = categories.map(cat =>
    typeof cat === "string" ? { id: cat, label: cat } : cat
  );

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
    setSelected(cat.id);
    setOpen(false);
    if (onSelect) onSelect(cat.id);
  };

  // Find the selected category label
  const selectedCat = normalizedCategories.find(c => c.id === selected);
  const displayLabel = selectedCat?.label || placeholder;
  const isDefault = selected === normalizedCategories[0]?.id;

  return (
    <div ref={ref} style={{
      position: "relative",
      userSelect: "none",
      flexShrink: fullWidth ? 1 : 0,
      width: fullWidth ? "100%" : "auto",
    }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: isMobile ? "12px 14px" : "10px 14px",
          minHeight: isMobile ? 44 : 40,
          border: open ? "1.5px solid var(--accent)" : "1.5px solid var(--border-color)",
          borderRadius: 8,
          background: !isDefault ? "var(--accent-dim)" : "var(--card-bg)",
          color: !isDefault ? "var(--accent)" : "var(--text-primary)",
          fontSize: 13,
          fontWeight: !isDefault ? 700 : 500,
          cursor: "pointer",
          minWidth: fullWidth ? "100%" : 160,
          width: fullWidth ? "100%" : "auto",
          justifyContent: "space-between",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxShadow: open ? "0 0 0 3px rgba(255, 180, 118, 0.15)" : "none",
          outline: "none",
          boxSizing: "border-box",
        }}
      >
        <span style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>{displayLabel}</span>
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
          maxWidth: isMobile ? "calc(100vw - 32px)" : 300,
          maxHeight: 320,
          overflowY: "auto",
          background: "var(--card-bg)",
          border: "1.5px solid var(--border-color)",
          borderRadius: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          zIndex: 200,
          paddingBottom: 8,
        }}>
          {normalizedCategories.map(cat => {
            const active = cat.id === selected;
            return (
              <div
                key={cat.id}
                onClick={() => handleSelect(cat)}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
                style={{
                  padding: isMobile ? "12px 14px" : "10px 14px",
                  minHeight: isMobile ? 44 : 36,
                  fontSize: 13,
                  fontWeight: active ? 700 : 400,
                  color: active ? "var(--accent)" : "var(--text-primary)",
                  background: active ? "var(--accent-dim)" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background 0.1s",
                }}
              >
                {active && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {!active && <span style={{ width: 12, display: "inline-block" }} />}
                {cat.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
