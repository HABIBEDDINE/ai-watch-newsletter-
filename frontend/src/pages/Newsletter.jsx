import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, Check, ChevronRight, ChevronLeft, Search,
  Eye, Plus, X, RefreshCw, Calendar,
  BarChart2, Settings, ExternalLink
} from 'lucide-react';

/* ─── Config key (shared with Profile page) ──────────── */
const CONFIG_KEY = 'aiwatch_newsletter_config';

const DEFAULT_CONFIG = {
  subject: '',
  summary: '',
  include_summary: true,
  include_findings: true,
  include_funding: true,
  include_articles: true,
  show_scores: true,
  show_signal: true,
  show_read_link: true,
};

function loadConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CONFIG };
  } catch { return { ...DEFAULT_CONFIG }; }
}

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
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || 'Request failed');
  }
  return res.json();
}

/* ─── Period helper ──────────────────────────────────── */
const PERIODS = [
  { key: 'today', label: 'Today' },
  { key: 'week',  label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all',   label: 'All Time' },
];

function periodToDateFrom(period) {
  if (period === 'all') return null;
  const now = new Date();
  if (period === 'today')  { now.setHours(0, 0, 0, 0); return now.toISOString(); }
  if (period === 'week')   { now.setDate(now.getDate() - 7); return now.toISOString(); }
  if (period === 'month')  { now.setDate(now.getDate() - 30); return now.toISOString(); }
  return null;
}

/* ─── Newsletter HTML generator ──────────────────────── */
function generateNewsletterHTML({ articles, config, date }) {
  const today = date || new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Topic map for Key Findings
  const topicMap = {};
  articles.forEach(a => {
    const topic = a.topic || a.industry || 'General AI';
    if (!topicMap[topic]) topicMap[topic] = [];
    topicMap[topic].push(a.title);
  });

  // Executive summary
  const execSummary = cfg.summary ||
    `This AI Watch Daily Brief covers ${articles.length} key developments across the AI landscape. ` +
    `Our intelligence platform has identified the following high-priority signals for DXC Technology leadership. ` +
    `Topics span ${Object.keys(topicMap).slice(0, 3).join(', ')}.`;

  // Funding articles
  const fundingArticles = articles.filter(a =>
    /fund|invest|acqui|partner|deal|billion|million|raise/i.test(
      (a.title || '') + ' ' + (a.description || '')
    )
  );

  const findingsList = Object.entries(topicMap).map(([topic, titles]) => `
    <tr>
      <td style="padding: 6px 0 10px 16px; border-left: 3px solid #e8450a;">
        <strong style="color: #111; font-size: 13px;">${topic}</strong>
        <ul style="margin: 5px 0 0; padding-left: 16px;">
          ${titles.map(t => `<li style="font-size: 13px; color: #444; margin-bottom: 3px; line-height: 1.5;">${t}</li>`).join('')}
        </ul>
      </td>
    </tr>
  `).join('');

  const fundingSection = cfg.include_funding && fundingArticles.length > 0 ? `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px; background: #fff8f0; border: 1px solid #fcd9b3; border-radius: 10px;">
    <tr><td style="padding: 18px 20px;">
      <h2 style="margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #92400e;">💰 Funding &amp; Key Actors</h2>
      <ul style="margin: 0; padding-left: 18px;">
        ${fundingArticles.slice(0, 4).map(a => `
          <li style="font-size: 13px; color: #555; margin-bottom: 6px; line-height: 1.55;">
            <strong style="color: #111;">${a.source || 'Unknown'}</strong> — ${a.title}
          </li>`).join('')}
      </ul>
    </td></tr>
  </table>` : '';

  const articleCards = articles.map((art, idx) => {
    const signal = art.signal_strength || 'Weak';
    const score = art.relevance || 0;
    const isStrong = signal.toLowerCase() === 'strong';
    const signalColor = isStrong ? '#10b981' : '#f59e0b';
    const source = art.source || '';
    const dateStr = art.ingestion_date
      ? new Date(art.ingestion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : today;
    const desc = art.description || art.summary || '';
    const url = art.url || '#';

    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 14px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; background: #fff; border-collapse: separate; border-spacing: 0;">
      <tr><td style="padding: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f8f9fa; border-bottom: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 10px 16px;">
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="padding-right: 10px; vertical-align: middle;">
                  <span style="display: inline-block; width: 26px; height: 26px; background: #e8450a; color: white; border-radius: 50%; text-align: center; line-height: 26px; font-size: 12px; font-weight: 700;">${idx + 1}</span>
                </td>
                ${cfg.show_signal ? `<td style="padding-right: 8px; vertical-align: middle;">
                  <span style="display: inline-block; background: ${signalColor}22; color: ${signalColor}; border: 1px solid ${signalColor}44; border-radius: 20px; padding: 2px 9px; font-size: 11px; font-weight: 700; text-transform: uppercase;">${signal}</span>
                </td>` : ''}
                ${score && cfg.show_scores ? `<td style="vertical-align: middle;">
                  <span style="display: inline-block; background: #6366f122; color: #6366f1; border: 1px solid #6366f144; border-radius: 20px; padding: 2px 9px; font-size: 11px; font-weight: 700;">Score ${score}/10</span>
                </td>` : ''}
              </tr></table>
            </td>
            <td style="padding: 10px 16px; text-align: right; color: #6b7280; font-size: 12px; white-space: nowrap;">${source}${source && dateStr ? ' · ' : ''}${dateStr}</td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="padding: 16px 20px;">
        <h3 style="margin: 0 0 10px; font-size: 15px; font-weight: 700; color: #111; line-height: 1.4;">${art.title || 'Untitled'}</h3>
        ${desc ? `<p style="margin: 0 0 14px; font-size: 13px; color: #555; line-height: 1.65;">${desc.slice(0, 280)}${desc.length > 280 ? '…' : ''}</p>` : ''}
        ${url && url !== '#' && cfg.show_read_link ? `<a href="${url}" target="_blank" style="display: inline-block; padding: 7px 14px; background: #e8450a; color: white; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 600;">Read Article →</a>` : ''}
      </td></tr>
    </table>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DXC AI Watch — Daily Brief</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
<tr><td align="center">
<table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;">

  <!-- ORANGE HEADER -->
  <tr><td style="background:#e8450a;border-radius:12px 12px 0 0;padding:22px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle;">
        <div style="color:#fff;font-size:30px;font-weight:900;letter-spacing:2px;line-height:1;">DXC</div>
        <div style="color:rgba(255,255,255,0.7);font-size:8px;letter-spacing:4px;text-transform:uppercase;margin-top:2px;">TECHNOLOGY</div>
      </td>
      <td style="text-align:right;vertical-align:middle;">
        <div style="color:#fff;font-size:17px;font-weight:700;">AI Watch</div>
        <div style="color:rgba(255,255,255,0.7);font-size:11px;margin-top:2px;">Daily Brief</div>
      </td>
    </tr></table>
  </td></tr>

  <!-- DATE BAR -->
  <tr><td style="background:#c73d09;padding:9px 28px;">
    <span style="color:rgba(255,255,255,0.9);font-size:12px;font-weight:500;">${today} &nbsp;·&nbsp; ${articles.length} articles</span>
  </td></tr>

  <!-- BODY -->
  <tr><td style="background:#fff;padding:26px 28px;border-radius:0 0 12px 12px;">

    ${cfg.include_summary ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;background:#f8f9fa;border-left:4px solid #e8450a;border-radius:0 8px 8px 0;">
      <tr><td style="padding:14px 18px;">
        <h2 style="margin:0 0 8px;font-size:13px;font-weight:700;color:#e8450a;text-transform:uppercase;letter-spacing:1px;">Executive Summary</h2>
        <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">${execSummary}</p>
      </td></tr>
    </table>` : ''}

    ${cfg.include_findings ? `
    <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#111;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">🔑 Key Findings</h2>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">${findingsList}</table>` : ''}

    ${fundingSection}

    ${cfg.include_articles ? `
    <h2 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#111;border-bottom:2px solid #e5e7eb;padding-bottom:8px;">📰 Articles &amp; Sources</h2>
    ${articleCards}` : ''}

  </td></tr>

  <!-- FOOTER -->
  <tr><td style="padding:18px 28px;text-align:center;background:#1f2937;border-radius:0 0 12px 12px;margin-top:4px;">
    <p style="margin:0 0 4px;color:rgba(255,255,255,0.9);font-size:13px;font-weight:700;">DXC AI Watch V4</p>
    <p style="margin:0;color:rgba(255,255,255,0.45);font-size:11px;">Strategic AI Intelligence · ${today} · © 2026 DXC Technology</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
}

/* ─── Step 1: Article Selector ───────────────────────── */
const TOPICS = ['AI', 'Fintech', 'HealthTech', 'CloudTech', 'Cybersecurity', 'Automation'];

function StepArticles({ selected, onToggle, onSelectAll, onClearAll, onNext }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [topic, setTopic]     = useState('');
  const [period, setPeriod]   = useState('month');

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page_size: 60 });
        if (topic) params.set('topic', topic);
        if (search.trim()) params.set('search', search.trim());
        const df = periodToDateFrom(period);
        if (df) params.set('date_from', df);
        const data = await apiFetch(`/api/articles?${params}`, { signal: ctrl.signal });
        setArticles(Array.isArray(data) ? data : data.articles || data.items || []);
      } catch (e) { if (e.name !== 'AbortError') setArticles([]); }
      finally { setLoading(false); }
    })();
    return () => ctrl.abort();
  }, [search, topic, period]);

  const allSelected = articles.length > 0 && articles.every(a => selected.some(s => s.id === a.id));

  return (
    <div>
      {/* Search + Topic */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary, #9ca3af)', pointerEvents: 'none' }} />
          <input placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 34 }} />
        </div>
        <select value={topic} onChange={e => setTopic(e.target.value)} style={{ ...selectStyle, minWidth: 130 }}>
          <option value="">All Topics</option>
          {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Period pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary, #9ca3af)', fontWeight: 500 }}>Period:</span>
        {PERIODS.map(p => (
          <button key={p.key} onClick={() => setPeriod(p.key)} style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500,
            border: period === p.key ? 'none' : '1px solid var(--border-color, rgba(255,255,255,0.12))',
            background: period === p.key ? '#e8450a' : 'transparent',
            color: period === p.key ? '#fff' : 'var(--text-secondary, #9ca3af)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Select all row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary, #9ca3af)' }}>
          <strong style={{ color: 'var(--text-primary, #f9fafb)' }}>{selected.length}</strong> selected
          &nbsp;·&nbsp; {articles.length} found
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => allSelected ? onClearAll(articles) : onSelectAll(articles)}
            style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: allSelected ? 'rgba(239,68,68,0.1)' : 'rgba(232,69,10,0.1)',
              color: allSelected ? '#ef4444' : '#e8450a',
              border: `1px solid ${allSelected ? 'rgba(239,68,68,0.2)' : 'rgba(232,69,10,0.2)'}`,
              cursor: 'pointer',
            }}
          >
            {allSelected ? '✕ Deselect All' : '✓ Select All'}
          </button>
          {selected.length > 0 && (
            <button onClick={() => onClearAll(articles)} style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 12,
              background: 'none', color: 'var(--text-secondary, #9ca3af)',
              border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              cursor: 'pointer',
            }}>
              Clear ({selected.length})
            </button>
          )}
        </div>
      </div>

      {/* Article list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary, #9ca3af)' }}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
          <p style={{ margin: 0 }}>Loading articles...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
          {articles.map(art => {
            const isSel = selected.some(s => s.id === art.id);
            const isStrong = (art.signal_strength || '').toLowerCase() === 'strong';
            return (
              <div key={art.id} onClick={() => onToggle(art)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 14px',
                background: isSel ? 'rgba(232,69,10,0.07)' : 'var(--bg-secondary, rgba(255,255,255,0.03))',
                border: `1px solid ${isSel ? 'rgba(232,69,10,0.4)' : 'var(--border-color, rgba(255,255,255,0.07))'}`,
                borderRadius: 9, cursor: 'pointer', transition: 'all 0.12s',
              }}>
                {/* Checkbox */}
                <div style={{
                  width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                  background: isSel ? '#e8450a' : 'transparent',
                  border: `2px solid ${isSel ? '#e8450a' : 'var(--text-secondary, #9ca3af)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isSel && <Check size={10} color="white" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #f9fafb)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {art.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary, #9ca3af)', marginTop: 2 }}>
                    {art.source} · {art.topic} · Score {art.relevance ?? '—'}
                  </div>
                </div>
                {art.signal_strength && (
                  <span style={{
                    flexShrink: 0,
                    background: isStrong ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                    color: isStrong ? '#10b981' : '#f59e0b',
                    border: `1px solid ${isStrong ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                  }}>
                    {art.signal_strength}
                  </span>
                )}
              </div>
            );
          })}
          {!loading && articles.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary, #9ca3af)' }}>No articles found</div>
          )}
        </div>
      )}

      {/* Next */}
      <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onNext} disabled={selected.length === 0} style={{
          padding: '10px 22px',
          background: selected.length > 0 ? '#e8450a' : 'var(--bg-secondary, #444)',
          color: '#fff', border: 'none', borderRadius: 8,
          cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
          fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', gap: 6,
          opacity: selected.length === 0 ? 0.5 : 1,
        }}>
          Preview &amp; Send <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2: Preview & Send ─────────────────────────── */
function StepSend({ selected, config, onPrev }) {
  const navigate = useNavigate();
  const [recipientInput, setRecipientInput] = useState('');
  const [recipients, setRecipients]         = useState([]);
  const [sending, setSending]               = useState(false);
  const [sent, setSent]                     = useState(false);
  const [error, setError]                   = useState('');
  const [showPreview, setShowPreview]       = useState(false);
  const [activeTab, setActiveTab]           = useState('send');

  const html = useMemo(() => generateNewsletterHTML({
    articles: selected, config,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  }), [selected, config]);

  const addRecipient = () => {
    const e = recipientInput.trim();
    if (e && e.includes('@') && !recipients.includes(e)) {
      setRecipients(p => [...p, e]);
      setRecipientInput('');
    }
  };

  const handleSend = async () => {
    if (recipients.length === 0) { setError('Add at least one recipient.'); return; }
    setSending(true); setError('');
    try {
      await apiFetch('/api/newsletter/send', {
        method: 'POST',
        body: JSON.stringify({
          recipients,
          subject: config.subject || 'DXC AI Watch — Daily Brief',
          html_content: html,
          article_ids: selected.map(a => a.id),
        }),
      });
      setSent(true);
    } catch (e) { setError(e.message); }
    finally { setSending(false); }
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `dxc-aiwatch-brief-${new Date().toISOString().split('T')[0]}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  // Summary of active sections from config
  const activeSections = [
    config.include_summary  !== false && 'Summary',
    config.include_findings !== false && 'Key Findings',
    config.include_funding  !== false && 'Funding',
    config.include_articles !== false && 'Articles',
  ].filter(Boolean);

  return (
    <div>
      {/* Config summary banner */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
        border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        borderRadius: 10, padding: '10px 14px', marginBottom: 20, flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary, #9ca3af)' }}>
          <strong style={{ color: 'var(--text-primary, #f9fafb)' }}>{selected.length} articles</strong>
          &nbsp;·&nbsp; {activeSections.join(' · ')}
        </div>
        <button onClick={() => navigate('/profile')} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'none', border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
          color: 'var(--text-secondary, #9ca3af)',
          borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12,
        }}>
          <Settings size={12} /> Edit Preferences
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18, background: 'var(--bg-card, #1e2028)', border: '1px solid var(--border-color, rgba(255,255,255,0.08))', borderRadius: 10, padding: 4 }}>
        {[
          { key: 'send',     label: '✉️ Send Now' },
          { key: 'schedule', label: '🕐 Schedule' },
          { key: 'history',  label: '📋 History' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '8px 16px', flex: 1,
            background: activeTab === tab.key ? '#e8450a' : 'none',
            color: activeTab === tab.key ? '#fff' : 'var(--text-secondary, #9ca3af)',
            border: 'none', cursor: 'pointer', borderRadius: 7,
            fontSize: 13, fontWeight: 500,
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {sent ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 60, marginBottom: 14 }}>✅</div>
          <h3 style={{ color: 'var(--text-primary, #f9fafb)', marginBottom: 8 }}>Newsletter Sent!</h3>
          <p style={{ color: 'var(--text-secondary, #9ca3af)' }}>
            Delivered to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}.
          </p>
        </div>
      ) : activeTab === 'send' ? (
        <div>
          {/* Recipients */}
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Recipients</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="email" placeholder="email@company.com"
                value={recipientInput}
                onChange={e => setRecipientInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRecipient()}
                style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addRecipient} style={{ ...primaryBtnStyle, padding: '10px 14px', flexShrink: 0 }}>
                <Plus size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {recipients.map(r => (
                <span key={r} style={{
                  background: 'rgba(232,69,10,0.1)', color: '#e8450a',
                  border: '1px solid rgba(232,69,10,0.2)',
                  borderRadius: 20, padding: '4px 10px',
                  fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  {r}
                  <button onClick={() => setRecipients(p => p.filter(x => x !== r))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preview toggle */}
          <button onClick={() => setShowPreview(v => !v)} style={{ ...secondaryBtnStyle, marginBottom: 14 }}>
            <Eye size={13} /> {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>

          {showPreview && (
            <div style={{ border: '1px solid var(--border-color, rgba(255,255,255,0.08))', borderRadius: 10, overflow: 'hidden', marginBottom: 14, height: 380, background: '#fff' }}>
              <iframe srcDoc={html} title="Newsletter Preview" style={{ width: '100%', height: '100%', border: 'none' }} />
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: '#ef4444', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleSend} disabled={sending} style={{ ...primaryBtnStyle, flex: 1 }}>
              {sending ? 'Sending…' : <><Send size={14} /> Send Newsletter</>}
            </button>
            <button onClick={handleDownload} style={secondaryBtnStyle}>
              <ExternalLink size={13} /> Download HTML
            </button>
          </div>
        </div>
      ) : activeTab === 'schedule' ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary, #9ca3af)' }}>
          <Calendar size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
          <p>Scheduling coming soon.</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary, #9ca3af)' }}>
          <BarChart2 size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
          <p>Send history will appear here.</p>
        </div>
      )}

      <div style={{ marginTop: 18 }}>
        <button onClick={onPrev} style={secondaryBtnStyle}>
          <ChevronLeft size={16} /> Back
        </button>
      </div>
    </div>
  );
}

/* ─── Shared styles ──────────────────────────────────── */
const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
  border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
  borderRadius: 8, color: 'var(--text-primary, #f9fafb)',
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
};
const selectStyle = {
  padding: '10px 14px',
  background: 'var(--bg-card, #1e2028)',
  border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
  borderRadius: 8, color: 'var(--text-primary, #f9fafb)',
  fontSize: 14, outline: 'none', cursor: 'pointer',
};
const labelStyle = {
  display: 'block', marginBottom: 7,
  fontSize: 12, fontWeight: 600,
  color: 'var(--text-secondary, #9ca3af)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
};
const primaryBtnStyle = {
  padding: '10px 20px',
  background: '#e8450a', color: '#fff',
  border: 'none', borderRadius: 8,
  cursor: 'pointer', fontWeight: 600, fontSize: 14,
  display: 'inline-flex', alignItems: 'center', gap: 6,
};
const secondaryBtnStyle = {
  padding: '10px 14px',
  background: 'none',
  border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
  color: 'var(--text-secondary, #9ca3af)',
  borderRadius: 8, cursor: 'pointer', fontSize: 13,
  display: 'inline-flex', alignItems: 'center', gap: 6,
};

/* ─── Main Page ──────────────────────────────────────── */
const STEPS = ['Select Articles', 'Preview & Send'];

export default function Newsletter() {
  const [step, setStep]       = useState(0);
  const [selected, setSelected] = useState([]);
  const [config]              = useState(() => loadConfig()); // loaded from Profile prefs

  const toggleArticle = useCallback((art) => {
    setSelected(prev =>
      prev.some(a => a.id === art.id) ? prev.filter(a => a.id !== art.id) : [...prev, art]
    );
  }, []);

  const selectAll = useCallback((articles) => {
    setSelected(prev => {
      const ids = new Set(prev.map(a => a.id));
      const toAdd = articles.filter(a => !ids.has(a.id));
      return [...prev, ...toAdd];
    });
  }, []);

  const clearAll = useCallback((articles) => {
    const ids = new Set(articles.map(a => a.id));
    setSelected(prev => prev.filter(a => !ids.has(a.id)));
  }, []);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--text-primary, #f9fafb)' }}>
          AI Newsletter Builder
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary, #9ca3af)', fontSize: 14 }}>
          Compose and send DXC-branded AI intelligence briefings
        </p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        {STEPS.map((label, idx) => (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: idx < step ? '#10b981' : idx === step ? '#e8450a' : 'var(--bg-card, #1e2028)',
                border: `2px solid ${idx < step ? '#10b981' : idx === step ? '#e8450a' : 'var(--border-color, rgba(255,255,255,0.15))'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: idx <= step ? '#fff' : 'var(--text-secondary, #9ca3af)',
                fontSize: 12, fontWeight: 700, flexShrink: 0, transition: 'all 0.2s',
              }}>
                {idx < step ? <Check size={13} /> : idx + 1}
              </div>
              <span style={{
                fontSize: 13, fontWeight: idx === step ? 600 : 400,
                color: idx === step ? 'var(--text-primary, #f9fafb)' : 'var(--text-secondary, #9ca3af)',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2,
                background: idx < step ? '#10b981' : 'var(--border-color, rgba(255,255,255,0.08))',
                margin: '0 12px', transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step card */}
      <div style={{
        background: 'var(--bg-card, #1e2028)',
        border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        borderRadius: 14, padding: '22px 26px',
      }}>
        {step === 0 && (
          <StepArticles
            selected={selected}
            onToggle={toggleArticle}
            onSelectAll={selectAll}
            onClearAll={clearAll}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && (
          <StepSend
            selected={selected}
            config={config}
            onPrev={() => setStep(0)}
          />
        )}
      </div>
    </div>
  );
}
