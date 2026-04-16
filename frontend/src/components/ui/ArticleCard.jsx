// src/components/ui/ArticleCard.jsx
import { Bookmark } from 'lucide-react';

const TOPIC_BG = {
  'AI': '#0d1b2e',
  'LLM': '#0d1b2e',
  'Artificial Intelligence': '#0d1b2e',
  'Infrastructure': '#1a1a1a',
  'FinTech': '#1a0d00',
  'Finance': '#1a0d00',
  'HealthTech': '#0d1a0d',
  'Health': '#0d1a0d',
  'Strategy': '#1a0a1a',
  'Cybersecurity': '#0a0a1a',
  'Robotics': '#0d0d1a',
  'CleanTech': '#0d1a0d',
  'default': '#111111',
};

function getTopicBg(topic) {
  if (!topic) return TOPIC_BG.default;
  for (const [key, value] of Object.entries(TOPIC_BG)) {
    if (key !== 'default' && topic.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return TOPIC_BG.default;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export default function ArticleCard({
  article,
  onBookmark,
  isBookmarked = false,
  onClick,
}) {
  const { title, summary, source, published_at, topic } = article || {};

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: 10,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#185EA5'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
    >
      {/* Thumbnail - 16:9 ratio */}
      <div style={{
        width: '100%',
        paddingBottom: '56.25%',
        background: getTopicBg(topic),
        position: 'relative',
      }}>
        {/* Topic label overlay */}
        {topic && (
          <span style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            fontSize: 11,
            color: 'var(--orange)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 600,
          }}>
            {topic}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {/* Title */}
        <h3
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: 8,
            lineHeight: 1.4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--orange)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
        >
          {title}
        </h3>

        {/* Summary */}
        {summary && (
          <p style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: 14,
          }}>
            <span style={{ fontWeight: 600 }}>PLUS: </span>
            {truncate(summary, 100)}
          </p>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Source & Date */}
          <span style={{
            fontSize: 11,
            color: 'var(--text-muted)',
          }}>
            {source}{source && published_at ? ' · ' : ''}{formatDate(published_at)}
          </span>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            {/* Bookmark */}
            {onBookmark && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(article);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bookmark
                  size={14}
                  fill={isBookmarked ? 'var(--orange)' : 'none'}
                  color={isBookmarked ? 'var(--orange)' : 'var(--text-muted)'}
                />
              </button>
            )}

            {/* Read link */}
            <span style={{
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--orange)',
            }}>
              Read →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
