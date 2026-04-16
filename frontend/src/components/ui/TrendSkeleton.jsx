// src/components/ui/TrendSkeleton.jsx

const pulseKeyframes = `
@keyframes skeletonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
`;

export default function TrendSkeleton() {
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
        padding: 18,
      }}>
        {/* Score */}
        <div style={{
          ...skeletonBlock,
          width: 48,
          height: 32,
          marginBottom: 10,
        }} />

        {/* Topic */}
        <div style={{
          ...skeletonBlock,
          width: '80%',
          height: 14,
          marginBottom: 8,
        }} />

        {/* Category */}
        <div style={{
          ...skeletonBlock,
          width: 60,
          height: 10,
          marginBottom: 12,
        }} />

        {/* Delta pill */}
        <div style={{
          ...skeletonBlock,
          width: 50,
          height: 18,
          borderRadius: 20,
        }} />
      </div>
    </>
  );
}
