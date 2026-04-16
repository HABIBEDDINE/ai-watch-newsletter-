// src/components/ui/StatsSkeleton.jsx

const pulseKeyframes = `
@keyframes skeletonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`;

export default function StatsSkeleton({ count = 4 }) {
  const skeletonBlock = {
    background: 'var(--border-color)',
    borderRadius: 4,
    animation: 'skeletonPulse 1.5s ease-in-out infinite',
  };

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: 16,
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: '18px 20px',
            }}
          >
            {/* Value */}
            <div style={{
              ...skeletonBlock,
              width: 60,
              height: 28,
              marginBottom: 8,
            }} />
            {/* Label */}
            <div style={{
              ...skeletonBlock,
              width: 80,
              height: 12,
            }} />
          </div>
        ))}
      </div>
    </>
  );
}
