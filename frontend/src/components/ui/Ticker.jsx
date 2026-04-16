// src/components/ui/Ticker.jsx

const tickerKeyframes = `
@keyframes tickerScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`;

export default function Ticker({ items = [] }) {
  if (!items.length) return null;

  // Duplicate items for seamless loop
  const duplicatedItems = [...items, ...items];

  return (
    <>
      <style>{tickerKeyframes}</style>
      <div style={{
        background: '#0a0a0a',
        padding: '10px 0',
        overflow: 'hidden',
        width: '100%',
      }}>
        <div style={{
          display: 'flex',
          animation: 'tickerScroll 40s linear infinite',
          width: 'fit-content',
        }}>
          {duplicatedItems.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginRight: 48,
                whiteSpace: 'nowrap',
              }}
            >
              {/* Orange dot */}
              <span style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#E35B1A',
                flexShrink: 0,
              }} />
              {/* Text */}
              <span style={{
                fontSize: 12,
                color: '#666666',
              }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
