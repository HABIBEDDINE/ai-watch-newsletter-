import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookmarkX, TrendingUp, FileText, Zap, ExternalLink,
  Download, Mail, X, RefreshCw, AlertCircle, Clock,
  ArrowUpRight, ArrowDownRight, Minus, Search, Filter,
  ChevronDown, ChevronUp, Globe
} from 'lucide-react';

/* ─── API helper ─────────────────────────────────────── */
async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('aiwatch_at');
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

/* ─── Helpers ────────────────────────────────────────── */
const fmt = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const momentumIcon = (m) => {
  if (!m) return null;
  const up = m.toLowerCase() === 'rising';
  const down = m.toLowerCase() === 'declining';
  if (up) return <ArrowUpRight size={14} />;
  if (down) return <ArrowDownRight size={14} />;
  return <Minus size={14} />;
};

const momentumColor = (m) => {
  if (!m) return '#6b7280';
  const val = m.toLowerCase();
  if (val === 'rising') return '#10b981';
  if (val === 'declining') return '#ef4444';
  return '#f59e0b';
};

const scoreColor = (score) => {
  if (score >= 8) return '#ef4444';
  if (score >= 6) return '#f59e0b';
  if (score >= 4) return '#10b981';
  return '#6b7280';
};

const signalColor = (sig) => {
  if (!sig) return '#6b7280';
  return sig.toLowerCase() === 'strong' ? '#10b981' : '#f59e0b';
};

/* ─── Trend Card ─────────────────────────────────────── */
function TrendCard({ item, rank, onRemove, onDownloadPDF, onSendEmail }) {
  const [expanded, setExpanded] = useState(false);
  const d = item.item_data || {};
  const data = d.data || d; // handle both flat and nested

  const score    = data.score ?? d.score ?? 0;
  const momentum = data.momentum ?? d.momentum ?? 'stable';
  const changePct = data.change_pct ?? d.change_pct ?? 0;
  const title    = d.topic ?? data.topic ?? data.title ?? 'Untitled Trend';
  const category = d.category ?? data.category ?? '';
  const desc     = data.description ?? d.description ?? '';
  const insight  = data.insight ?? d.insight ?? '';
  const sources  = data.sources ?? d.sources ?? [];
  const tags     = data.tags ?? d.tags ?? [];
  const triggers = data.triggers ?? d.triggers ?? [];
  const detectedAt = d.detected_at ?? data.detected_at ?? item.saved_at;

  const momColor = momentumColor(momentum);
  const sColor   = scoreColor(score);

  // Format category label
  const catLabel = category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={{
      background: 'var(--bg-card, #1e2028)',
      border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
      borderRadius: 16,
      padding: '20px 24px',
      position: 'relative',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* TOP ROW: rank + date + badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {/* Score circle */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: `3px solid ${sColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          color: sColor, fontWeight: 700, fontSize: 18,
        }}>
          {score}
        </div>

        {/* Date */}
        <span style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: 13 }}>
          <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          {fmt(detectedAt)}
        </span>

        {/* Momentum badge */}
        <span style={{
          background: `${momColor}20`,
          color: momColor,
          border: `1px solid ${momColor}40`,
          borderRadius: 20, padding: '3px 10px',
          fontSize: 12, fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: 4,
          textTransform: 'uppercase',
        }}>
          {momentumIcon(momentum)}
          {momentum}
        </span>

        {/* Change % */}
        {changePct !== 0 && (
          <span style={{ color: momColor, fontSize: 13, fontWeight: 600 }}>
            {changePct > 0 ? '+' : ''}{changePct}%
          </span>
        )}

        {/* Triggers */}
        {triggers.slice(0, 2).map((t, i) => (
          <span key={i} style={{
            background: 'rgba(99,102,241,0.15)',
            color: '#a5b4fc',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20, padding: '3px 10px',
            fontSize: 11, fontWeight: 600,
          }}>
            {t}
          </span>
        ))}

        {/* Remove bookmark */}
        <button
          onClick={() => onRemove(item.id)}
          title="Remove from saved"
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--text-secondary, #9ca3af)',
            padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary, #9ca3af)'; e.currentTarget.style.background = 'none'; }}
        >
          <BookmarkX size={18} />
        </button>
      </div>

      {/* Category label */}
      {catLabel && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary, #9ca3af)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          {catLabel}
        </div>
      )}

      {/* Title */}
      <h3 style={{
        margin: '0 0 10px', fontSize: 18, fontWeight: 700,
        color: 'var(--text-primary, #f9fafb)', lineHeight: 1.3,
      }}>
        {title}
      </h3>

      {/* Description */}
      {desc && (
        <p style={{
          margin: '0 0 10px', fontSize: 14,
          color: 'var(--text-secondary, #9ca3af)',
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {desc}
        </p>
      )}

      {/* Insight quote */}
      {insight && (
        <p style={{
          margin: '0 0 12px', fontSize: 13,
          color: 'var(--text-secondary, #9ca3af)',
          fontStyle: 'italic',
          borderLeft: '3px solid var(--accent, #6366f1)',
          paddingLeft: 10,
        }}>
          {insight}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {tags.map((tag, i) => (
            <span key={i} style={{
              background: 'rgba(99,102,241,0.1)',
              color: '#818cf8',
              borderRadius: 6, padding: '3px 8px',
              fontSize: 11, fontWeight: 500,
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {sources.slice(0, 4).map((src, i) => (
            <span key={i} style={{
              background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
              color: 'var(--text-secondary, #9ca3af)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              borderRadius: 6, padding: '3px 8px',
              fontSize: 11,
            }}>
              <Globe size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              {typeof src === 'string' ? src : src.name || src.title || 'Source'}
            </span>
          ))}
          {sources.length > 4 && (
            <span style={{
              background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
              color: 'var(--text-secondary, #9ca3af)',
              borderRadius: 6, padding: '3px 8px',
              fontSize: 11,
            }}>
              +{sources.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* BOTTOM ROW: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'var(--accent, #6366f1)',
            color: '#fff',
            border: 'none', cursor: 'pointer',
            borderRadius: 8, padding: '8px 14px',
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <Zap size={14} />
          Deep Dive
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <button
          onClick={() => onDownloadPDF(item)}
          style={{
            background: 'none', border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            color: 'var(--text-secondary, #9ca3af)',
            cursor: 'pointer', borderRadius: 8, padding: '8px 12px',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color, rgba(255,255,255,0.08))'}
        >
          <Download size={14} /> PDF
        </button>

        <button
          onClick={() => onSendEmail(item)}
          style={{
            background: 'none', border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            color: 'var(--text-secondary, #9ca3af)',
            cursor: 'pointer', borderRadius: 8, padding: '8px 12px',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color, rgba(255,255,255,0.08))'}
        >
          <Mail size={14} /> Send
        </button>
      </div>

      {/* Expanded deep dive panel */}
      {expanded && d.deepdive && (
        <div style={{
          marginTop: 16, padding: 16,
          background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
          borderRadius: 10, border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        }}>
          <h4 style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--text-primary, #f9fafb)' }}>
            🔍 Deep Dive Analysis
          </h4>
          <div style={{ fontSize: 13, color: 'var(--text-secondary, #9ca3af)', lineHeight: 1.7 }}>
            {(() => {
              try {
                const dd = typeof d.deepdive === 'string' ? JSON.parse(d.deepdive) : d.deepdive;
                return (
                  <>
                    {dd.summary && <p style={{ margin: '0 0 8px' }}>{dd.summary}</p>}
                    {dd.key_points && (
                      <ul style={{ margin: '0 0 8px', paddingLeft: 16 }}>
                        {dd.key_points.map((pt, i) => <li key={i} style={{ marginBottom: 4 }}>{pt}</li>)}
                      </ul>
                    )}
                    {dd.recommendations && (
                      <>
                        <p style={{ margin: '8px 0 4px', fontWeight: 600, color: 'var(--text-primary, #f9fafb)' }}>
                          Recommendations:
                        </p>
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                          {dd.recommendations.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r}</li>)}
                        </ul>
                      </>
                    )}
                    {typeof d.deepdive === 'string' && !dd.summary && !dd.key_points && (
                      <p style={{ margin: 0 }}>{d.deepdive}</p>
                    )}
                  </>
                );
              } catch {
                return <p style={{ margin: 0 }}>{String(d.deepdive)}</p>;
              }
            })()}
          </div>
        </div>
      )}
      {expanded && !d.deepdive && (
        <div style={{
          marginTop: 16, padding: 16,
          background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
          borderRadius: 10, textAlign: 'center',
          color: 'var(--text-secondary, #9ca3af)', fontSize: 13,
        }}>
          No deep dive analysis available for this trend yet.
        </div>
      )}
    </div>
  );
}

/* ─── Article Card ───────────────────────────────────── */
function ArticleCard({ item, onRemove, onDownloadPDF, onSendEmail }) {
  const d = item.item_data || {};
  const score     = d.relevance ?? 0;
  const signal    = d.signal_strength ?? 'Weak';
  const title     = d.title ?? 'Untitled Article';
  const source    = d.source ?? d.publisher ?? '';
  const desc      = d.description ?? d.summary ?? '';
  const topic     = d.topic ?? '';
  const industry  = d.industry ?? '';
  const url       = d.url ?? '';
  const dateVal   = d.ingestion_date ?? d.published_at ?? item.saved_at;

  const sColor = signalColor(signal);
  const scColor = scoreColor(score);

  return (
    <div style={{
      background: 'var(--bg-card, #1e2028)',
      border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
      borderRadius: 16,
      padding: '20px 24px',
      position: 'relative',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {/* TOP ROW */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        {/* Score */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: `3px solid ${scColor}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          color: scColor, fontWeight: 700, fontSize: 18,
        }}>
          {score}
        </div>

        {/* Date */}
        <span style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: 13 }}>
          <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          {fmt(dateVal)}
        </span>

        {/* Signal badge */}
        <span style={{
          background: `${sColor}20`,
          color: sColor,
          border: `1px solid ${sColor}40`,
          borderRadius: 20, padding: '3px 10px',
          fontSize: 12, fontWeight: 700,
          textTransform: 'uppercase',
        }}>
          {signal} Signal
        </span>

        {/* Remove */}
        <button
          onClick={() => onRemove(item.id)}
          title="Remove from saved"
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--text-secondary, #9ca3af)',
            padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary, #9ca3af)'; e.currentTarget.style.background = 'none'; }}
        >
          <BookmarkX size={18} />
        </button>
      </div>

      {/* Topic label */}
      {topic && (
        <div style={{ fontSize: 11, color: 'var(--text-secondary, #9ca3af)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          {topic}{industry ? ` · ${industry}` : ''}
        </div>
      )}

      {/* Title */}
      <h3 style={{
        margin: '0 0 10px', fontSize: 18, fontWeight: 700,
        color: 'var(--text-primary, #f9fafb)', lineHeight: 1.3,
      }}>
        {title}
      </h3>

      {/* Description */}
      {desc && (
        <p style={{
          margin: '0 0 14px', fontSize: 14,
          color: 'var(--text-secondary, #9ca3af)',
          lineHeight: 1.6,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {desc}
        </p>
      )}

      {/* Source badge */}
      {source && (
        <div style={{ marginBottom: 16 }}>
          <span style={{
            background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
            color: 'var(--text-secondary, #9ca3af)',
            border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            borderRadius: 6, padding: '3px 10px',
            fontSize: 11,
          }}>
            <Globe size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            {source}
          </span>
        </div>
      )}

      {/* BOTTOM ROW: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'var(--accent, #6366f1)',
              color: '#fff',
              border: 'none', cursor: 'pointer',
              borderRadius: 8, padding: '8px 14px',
              fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 6,
              textDecoration: 'none',
            }}
          >
            <ExternalLink size={14} />
            Read Article
          </a>
        )}

        <button
          onClick={() => onDownloadPDF(item)}
          style={{
            background: 'none', border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            color: 'var(--text-secondary, #9ca3af)',
            cursor: 'pointer', borderRadius: 8, padding: '8px 12px',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color, rgba(255,255,255,0.08))'}
        >
          <Download size={14} /> PDF
        </button>

        <button
          onClick={() => onSendEmail(item)}
          style={{
            background: 'none', border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
            color: 'var(--text-secondary, #9ca3af)',
            cursor: 'pointer', borderRadius: 8, padding: '8px 12px',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color, rgba(255,255,255,0.08))'}
        >
          <Mail size={14} /> Send
        </button>
      </div>
    </div>
  );
}

/* ─── Send Email Modal ───────────────────────────────── */
function SendEmailModal({ item, onClose }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError('');
    try {
      await apiFetch('/api/newsletter/send-single', {
        method: 'POST',
        body: JSON.stringify({
          recipient_email: email.trim(),
          item_id: item.item_id,
          item_type: item.item_type,
          item_data: item.item_data,
        }),
      });
      setSent(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const d = item.item_data || {};
  const title = d.topic ?? d.title ?? 'Item';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card, #1e2028)',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        borderRadius: 16, padding: 28,
        width: '100%', maxWidth: 440,
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary, #f9fafb)' }}>
            Send via Email
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary, #9ca3af)', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary, #9ca3af)' }}>
          Sending: <strong style={{ color: 'var(--text-primary, #f9fafb)' }}>{title}</strong>
        </p>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ color: '#10b981', fontWeight: 600 }}>Email sent successfully!</p>
          </div>
        ) : (
          <>
            <input
              type="email"
              placeholder="Recipient email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
                border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                borderRadius: 8, color: 'var(--text-primary, #f9fafb)',
                fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
            />
            {error && (
              <p style={{ margin: '8px 0 0', color: '#ef4444', fontSize: 13 }}>{error}</p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '10px',
                background: 'none', border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                borderRadius: 8, color: 'var(--text-secondary, #9ca3af)',
                cursor: 'pointer', fontSize: 14,
              }}>
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !email.trim()}
                style={{
                  flex: 1, padding: '10px',
                  background: 'var(--accent, #6366f1)', color: '#fff',
                  border: 'none', borderRadius: 8,
                  cursor: sending ? 'wait' : 'pointer',
                  fontSize: 14, fontWeight: 600,
                  opacity: sending || !email.trim() ? 0.6 : 1,
                }}
              >
                {sending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── PDF download helper ────────────────────────────── */
function downloadPDF(item) {
  const d = item.item_data || {};
  const data = d.data || d;
  const title = d.topic ?? data.topic ?? d.title ?? 'Saved Item';
  const type = item.item_type === 'trend' ? 'Trend' : 'Article';
  const desc = data.description ?? d.description ?? d.summary ?? '';
  const score = data.score ?? d.relevance ?? 0;
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #111; }
  .header { background: #e8450a; color: #fff; padding: 28px 32px; border-radius: 8px; margin-bottom: 28px; }
  .logo { font-size: 28px; font-weight: 900; letter-spacing: 2px; }
  .sub { font-size: 14px; opacity: 0.85; margin-top: 4px; }
  h1 { font-size: 22px; margin: 0 0 16px; }
  .meta { color: #666; font-size: 13px; margin-bottom: 16px; }
  .score-box { display: inline-block; background: #6366f1; color: #fff; border-radius: 8px; padding: 6px 14px; font-weight: 700; font-size: 18px; margin-right: 12px; }
  p { line-height: 1.7; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
</style>
</head>
<body>
<div class="header">
  <div class="logo">DXC AI Watch</div>
  <div class="sub">Saved ${type} — ${date}</div>
</div>
<h1>${title}</h1>
<div class="meta">
  <span class="score-box">${score}</span>
  Score · ${type} · ${date}
</div>
${desc ? `<p>${desc}</p>` : ''}
<div class="footer">Generated by DXC AI Watch V4 · ${date}</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aiwatch-${type.toLowerCase()}-${Date.now()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Main Page ──────────────────────────────────────── */
export default function SavedPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all | articles | trends
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendModalItem, setSendModalItem] = useState(null);
  const [search, setSearch] = useState('');
  const [removing, setRemoving] = useState(new Set());

  /* Fetch saved items */
  const fetchSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== 'all' ? `?type=${filter === 'articles' ? 'article' : 'trend'}` : '';
      const data = await apiFetch(`/api/saved${params}`);
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  /* Remove bookmark */
  const handleRemove = async (savedId) => {
    setRemoving(prev => new Set([...prev, savedId]));
    // Optimistic removal
    setItems(prev => prev.filter(it => it.id !== savedId));
    try {
      await apiFetch(`/api/saved/${savedId}`, { method: 'DELETE' });
    } catch (e) {
      // Rollback on failure
      fetchSaved();
    } finally {
      setRemoving(prev => { const n = new Set(prev); n.delete(savedId); return n; });
    }
  };

  /* Filter + search */
  const filtered = items.filter(item => {
    if (!search.trim()) return true;
    const d = item.item_data || {};
    const data = d.data || d;
    const title = (d.topic ?? data.topic ?? d.title ?? '').toLowerCase();
    const desc = (data.description ?? d.description ?? d.summary ?? '').toLowerCase();
    const src = (d.source ?? '').toLowerCase();
    const q = search.toLowerCase();
    return title.includes(q) || desc.includes(q) || src.includes(q);
  });

  const articles = filtered.filter(i => i.item_type === 'article');
  const trends = filtered.filter(i => i.item_type === 'trend');

  const displayed = filter === 'all' ? filtered : filter === 'articles' ? articles : trends;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--text-primary, #f9fafb)' }}>
            Saved Items
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #9ca3af)', fontSize: 14 }}>
            {items.length} item{items.length !== 1 ? 's' : ''} bookmarked
          </p>
        </div>
        <button
          onClick={fetchSaved}
          style={{
            background: 'none', border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
            color: 'var(--text-secondary, #9ca3af)',
            cursor: 'pointer', borderRadius: 8, padding: '8px 14px',
            fontSize: 13, display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Search + filter tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary, #9ca3af)',
          }} />
          <input
            type="text"
            placeholder="Search saved items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              background: 'var(--bg-card, #1e2028)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              borderRadius: 8, color: 'var(--text-primary, #f9fafb)',
              fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filter tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: 'var(--bg-card, #1e2028)',
          border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          borderRadius: 10, padding: 4,
        }}>
          {[
            { key: 'all', label: `All (${items.length})` },
            { key: 'articles', label: `Articles (${items.filter(i => i.item_type === 'article').length})` },
            { key: 'trends', label: `Trends (${items.filter(i => i.item_type === 'trend').length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: '7px 14px',
                background: filter === tab.key ? 'var(--accent, #6366f1)' : 'none',
                color: filter === tab.key ? '#fff' : 'var(--text-secondary, #9ca3af)',
                border: 'none', cursor: 'pointer',
                borderRadius: 7, fontSize: 13, fontWeight: 500,
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary, #9ca3af)' }}>
          <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <p>Loading saved items...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!loading && error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12, padding: '20px 24px', textAlign: 'center',
        }}>
          <AlertCircle size={24} style={{ color: '#ef4444', marginBottom: 8 }} />
          <p style={{ color: '#ef4444', margin: 0 }}>{error}</p>
          <button onClick={fetchSaved} style={{
            marginTop: 12, padding: '8px 16px',
            background: '#ef4444', color: '#fff', border: 'none',
            borderRadius: 8, cursor: 'pointer',
          }}>Retry</button>
        </div>
      )}

      {!loading && !error && displayed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔖</div>
          <h3 style={{ color: 'var(--text-primary, #f9fafb)', marginBottom: 8 }}>
            {search ? 'No results found' : 'No saved items yet'}
          </h3>
          <p style={{ color: 'var(--text-secondary, #9ca3af)', marginBottom: 24 }}>
            {search
              ? 'Try a different search term.'
              : 'Bookmark articles and trends from the News Feed and Trends pages.'}
          </p>
          {!search && (
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/feed')}
                style={{
                  padding: '10px 20px',
                  background: 'var(--accent, #6366f1)', color: '#fff',
                  border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <FileText size={16} /> Browse News Feed
              </button>
              <button
                onClick={() => navigate('/trends')}
                style={{
                  padding: '10px 20px',
                  background: 'none',
                  border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
                  color: 'var(--text-secondary, #9ca3af)',
                  borderRadius: 8, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <TrendingUp size={16} /> Explore Trends
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cards grid */}
      {!loading && !error && displayed.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayed.map((item, idx) => (
            item.item_type === 'trend'
              ? <TrendCard
                  key={item.id}
                  item={item}
                  rank={idx + 1}
                  onRemove={handleRemove}
                  onDownloadPDF={downloadPDF}
                  onSendEmail={setSendModalItem}
                />
              : <ArticleCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemove}
                  onDownloadPDF={downloadPDF}
                  onSendEmail={setSendModalItem}
                />
          ))}
        </div>
      )}

      {/* Send Email Modal */}
      {sendModalItem && (
        <SendEmailModal item={sendModalItem} onClose={() => setSendModalItem(null)} />
      )}
    </div>
  );
}
