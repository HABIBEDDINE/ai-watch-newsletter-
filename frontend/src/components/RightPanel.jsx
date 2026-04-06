const B = {
  purple: "#1A4A9E",
  purpleDeep: "#102d6a",
  purplePale: "#e8eef8",
  white: "#ffffff",
  gray200: "#e8e8e8",
  gray400: "#999999",
  darkBg: "#0a0a0a",
};

export default function RightPanel() {
  return (
    <div
      style={{
        width: 220,
        background: B.white,
        borderLeft: `1px solid ${B.gray200}`,
        padding: "20px 0",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      {/* Talk to DXC */}
      <div style={{ padding: "0 16px" }}>
        <div
          style={{
            background: B.darkBg,
            padding: 14,
            borderLeft: `4px solid ${B.purple}`,
            borderRadius: 2,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: B.white, marginBottom: 4 }}>
            Talk to DXC
          </div>
          <div style={{ fontSize: 10, color: B.gray400, marginBottom: 12, lineHeight: 1.5 }}>
            Free 30-min AI strategy session
          </div>
          <button
            style={{
              width: "100%",
              padding: "8px 0",
              background: B.purple,
              color: B.white,
              border: `2px solid ${B.purple}`,
              borderRadius: 0,
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 0.5,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.target.style.background = B.purpleDeep;
              e.target.style.borderColor = B.purpleDeep;
            }}
            onMouseLeave={e => {
              e.target.style.background = B.purple;
              e.target.style.borderColor = B.purple;
            }}
          >
            Contact Us →
          </button>
        </div>
      </div>

    </div>
  );
}
