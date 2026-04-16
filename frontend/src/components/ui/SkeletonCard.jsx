// src/components/ui/SkeletonCard.jsx

const pulseKeyframes = `
@keyframes skeletonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`;

export default function SkeletonCard() {
  const skeletonBlock = {
    background: 'var(--border-color)',
    borderRadius: 4,
    animation: 'skeletonPulse 1.5s ease-in-out infinite',
  };

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        {/* Thumbnail area - 16:9 ratio */}
        <div style={{
          ...skeletonBlock,
          width: '100%',
          paddingBottom: '56.25%',
          borderRadius: 0,
        }} />

        {/* Content area */}
        <div style={{ padding: 16 }}>
          {/* Line 1 - Topic */}
          <div style={{
            ...skeletonBlock,
            width: 60,
            height: 12,
            marginBottom: 10,
          }} />

          {/* Line 2 - Title */}
          <div style={{
            ...skeletonBlock,
            width: '90%',
            height: 16,
            marginBottom: 8,
          }} />

          {/* Line 3 - Summary */}
          <div style={{
            ...skeletonBlock,
            width: '70%',
            height: 12,
            marginBottom: 16,
          }} />

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{
              ...skeletonBlock,
              width: 100,
              height: 10,
            }} />
            <div style={{
              ...skeletonBlock,
              width: 50,
              height: 10,
            }} />
          </div>
        </div>
      </div>
    </>
  );
}
