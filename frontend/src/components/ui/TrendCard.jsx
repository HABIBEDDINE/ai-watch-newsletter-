// src/components/ui/TrendCard.jsx
import { Bookmark } from 'lucide-react';

export default function TrendCard({ trend, onClick, isBookmarked, onBookmark }) {
  const { topic, trend_score, category, momentum_delta } = trend || {};

  // Format delta with + sign for positive
  const formattedDelta = momentum_delta > 0
    ? `+${momentum_delta}%`
    : momentum_delta < 0
      ? `${momentum_delta}%`
      : '0%';

  const handleBookmarkClick = (e) => {
    e.stopPropagation();
    onBookmark?.();
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 10,
        padding: 18,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease',
        position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      {/* Bookmark button */}
      {onBookmark && (
        <button
          onClick={handleBookmarkClick}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: 6,
            border: 'none',
            background: isBookmarked ? 'var(--orange)' : 'var(--surface)',
            color: isBookmarked ? '#fff' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          <Bookmark size={14} fill={isBookmarked ? '#fff' : 'none'} />
        </button>
      )}

      {/* Score */}
      <div style={{
        fontSize: 28,
        fontWeight: 500,
        color: 'var(--accent)',
      }}>
        {trend_score ?? 0}
      </div>

      {/* Topic */}
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--text-primary)',
        marginTop: 4,
      }}>
        {topic}
      </div>

      {/* Category */}
      {category && (
        <div style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginTop: 4,
        }}>
          {category}
        </div>
      )}

      {/* Delta pill */}
      {momentum_delta !== undefined && (
        <span style={{
          display: 'inline-block',
          background: 'var(--green-light)',
          color: 'var(--green)',
          fontSize: 11,
          fontWeight: 500,
          padding: '2px 8px',
          borderRadius: 20,
          marginTop: 10,
        }}>
          {formattedDelta}
        </span>
      )}
    </div>
  );
}
