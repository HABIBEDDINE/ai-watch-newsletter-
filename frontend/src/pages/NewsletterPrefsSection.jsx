/**
 * NewsletterPrefsSection.jsx
 *
 * Add this component to your ProfilePage.jsx.
 *
 * USAGE — inside ProfilePage render, add:
 *   import NewsletterPrefsSection from './NewsletterPrefsSection';
 *   ...
 *   <NewsletterPrefsSection />
 *
 * It reads/writes localStorage key: 'aiwatch_newsletter_config'
 * The Newsletter page (Newsletter.jsx) reads the same key automatically.
 */

import React, { useState, useEffect } from 'react';

const CONFIG_KEY = 'aiwatch_newsletter_config';

const DEFAULTS = {
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

/* ─── Toggle Switch ──────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
        background: checked ? '#e8450a' : 'var(--bg-secondary, rgba(255,255,255,0.12))',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        userSelect: 'none',
      }}
    >
      <div style={{
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 3,
        left: checked ? 21 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }} />
    </div>
  );
}

/* ─── Section Card wrapper ───────────────────────────── */
function Card({ children }) {
  return (
    <div style={{
      background: 'var(--bg-secondary, rgba(255,255,255,0.03))',
      border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
      borderRadius: 12, overflow: 'hidden', marginBottom: 14,
    }}>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, desc }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '13px 18px',
      borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.06))',
      background: 'var(--bg-secondary, rgba(255,255,255,0.02))',
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary, #f9fafb)' }}>{title}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-secondary, #9ca3af)', marginTop: 1 }}>{desc}</div>}
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange, isLast }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 18px',
      borderBottom: isLast ? 'none' : '1px solid var(--border-color, rgba(255,255,255,0.05))',
    }}>
      <div>
        <div style={{ fontSize: 14, color: 'var(--text-primary, #f9fafb)', fontWeight: 500 }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-secondary, #9ca3af)', marginTop: 1 }}>{desc}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function NewsletterPrefsSection() {
  const [config, setConfig]   = useState(DEFAULTS);
  const [saved, setSaved]     = useState(false);
  const [saveTimer, setSaveTimer] = useState(null);

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (raw) setConfig({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  const set = (key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  // Auto-save with debounce
  useEffect(() => {
    if (saveTimer) clearTimeout(saveTimer);
    const t = setTimeout(() => {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
    setSaveTimer(t);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const inputStyle = {
    width: '100%', padding: '9px 13px', boxSizing: 'border-box',
    background: 'var(--bg-secondary, rgba(255,255,255,0.05))',
    border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
    borderRadius: 8, color: 'var(--text-primary, #f9fafb)',
    fontSize: 14, outline: 'none',
  };

  const labelStyle = {
    display: 'block', marginBottom: 7,
    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.5px', color: 'var(--text-secondary, #9ca3af)',
  };

  return (
    <div style={{ marginTop: 32 }}>
      {/* Section title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary, #f9fafb)' }}>
            Newsletter Preferences
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--text-secondary, #9ca3af)' }}>
            These settings apply automatically when you build a newsletter
          </p>
        </div>
        {saved && (
          <span style={{
            background: 'rgba(16,185,129,0.12)', color: '#10b981',
            border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 20, padding: '4px 12px',
            fontSize: 12, fontWeight: 600,
          }}>
            ✓ Saved
          </span>
        )}
      </div>

      {/* ── Content ── */}
      <Card>
        <CardHeader icon="✉️" title="Default Email Content" desc="Pre-fill these fields in the newsletter builder" />
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Default Subject Line</label>
            <input
              type="text"
              placeholder="DXC AI Watch — Daily Brief"
              value={config.subject || ''}
              onChange={e => set('subject', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>
              Default Executive Summary&nbsp;
              <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                (leave blank to auto-generate)
              </span>
            </label>
            <textarea
              placeholder="Write a standing summary for your newsletters, or leave blank to auto-generate from selected articles…"
              value={config.summary || ''}
              onChange={e => set('summary', e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>
        </div>
      </Card>

      {/* ── Sections ── */}
      <Card>
        <CardHeader icon="📐" title="Sections" desc="Choose which sections appear in every newsletter" />
        {[
          { key: 'include_summary',  label: 'Executive Summary',  desc: 'AI-generated overview of selected articles' },
          { key: 'include_findings', label: 'Key Findings',        desc: 'Bullet points grouped by topic' },
          { key: 'include_funding',  label: 'Funding & Actors',    desc: 'Auto-detected investment & partnership items' },
          { key: 'include_articles', label: 'Articles & Sources',  desc: 'Numbered cards with source links' },
        ].map((sec, i, arr) => (
          <ToggleRow
            key={sec.key}
            label={`${['📋','🔑','💰','📰'][i]} ${sec.label}`}
            desc={sec.desc}
            checked={config[sec.key] !== false}
            onChange={val => set(sec.key, val)}
            isLast={i === arr.length - 1}
          />
        ))}
      </Card>

      {/* ── Style ── */}
      <Card>
        <CardHeader icon="🎨" title="Style" desc="Control what metadata appears on article cards" />
        {[
          { key: 'show_scores',    label: 'Show relevance scores',       desc: 'Score 8/10 badges on each article' },
          { key: 'show_signal',    label: 'Show signal strength',        desc: 'Strong / Weak signal badges' },
          { key: 'show_read_link', label: 'Include "Read Article" links', desc: 'Button linking to original source' },
        ].map((opt, i, arr) => (
          <ToggleRow
            key={opt.key}
            label={opt.label}
            desc={opt.desc}
            checked={config[opt.key] !== false}
            onChange={val => set(opt.key, val)}
            isLast={i === arr.length - 1}
          />
        ))}
      </Card>

      {/* Reset link */}
      <div style={{ textAlign: 'right' }}>
        <button
          onClick={() => { setConfig({ ...DEFAULTS }); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary, #9ca3af)', fontSize: 12,
            textDecoration: 'underline',
          }}
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
