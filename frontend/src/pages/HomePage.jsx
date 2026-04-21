import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './HomePage.css';

// ── Topic → thumbnail bg colour (using CSS variables for theme support) ──────
const TOPIC_COLORS = {
  'ai & llms': 'var(--bg-surface)',
  'llm': 'var(--bg-surface)',
  'artificial intelligence': 'var(--bg-surface)',
  'infrastructure': 'var(--bg-surface)',
  'fintech': 'var(--bg-surface)',
  'finance': 'var(--bg-surface)',
  'healthtech': 'var(--bg-surface)',
  'health': 'var(--bg-surface)',
  'cybersecurity': 'var(--bg-surface)',
  'strategy': 'var(--bg-surface)',
  default: 'var(--bg-surface)',
};

function topicColor(topic) {
  if (!topic) return TOPIC_COLORS.default;
  const t = topic.toLowerCase();
  for (const [key, val] of Object.entries(TOPIC_COLORS)) {
    if (key !== 'default' && t.includes(key)) return val;
  }
  return TOPIC_COLORS.default;
}

const TOPIC_ICONS = {
  'ai & llms': '◈', 'llm': '◈', 'artificial intelligence': '◈',
  'infrastructure': '⬡', 'fintech': '◎', 'healthtech': '⊕',
  'cybersecurity': '◉', 'strategy': '◈', default: '◎',
};

function topicIcon(topic) {
  if (!topic) return TOPIC_ICONS.default;
  const t = topic.toLowerCase();
  for (const [key, val] of Object.entries(TOPIC_ICONS)) {
    if (key !== 'default' && t.includes(key)) return val;
  }
  return TOPIC_ICONS.default;
}

// ── Fallback static articles ─────────────────────────────────────────────────
const FALLBACK_ARTICLES = [
  { id:'f1', title:'Meta Superintelligence Labs ships its first agentic reasoning model', topic:'AI & LLMs', source:'The Rundown AI', published_at:'2026-04-14', summary:'Meta launches its first large-scale agentic reasoning model targeting enterprise automation use cases.' },
  { id:'f2', title:"Anthropic's new AI is too powerful for the world — what it means for strategy", topic:'Strategy', source:'The Rundown AI', published_at:'2026-04-14', summary:'Anthropic releases Claude with enhanced capabilities, raising questions about responsible deployment in enterprise.' },
  { id:'f3', title:'Industrial policy for the intelligence age: keeping people first', topic:'Strategy', source:'Argmin.net', published_at:'2026-04-13', summary:'Policymakers debate how to structure national AI investment while preserving workforce resilience.' },
  { id:'f4', title:"Perplexity's agent pivot is on the money — search meets action", topic:'AI & LLMs', source:'The Rundown AI', published_at:'2026-04-14', summary:'Perplexity shifts from pure search to agentic workflows, gaining Fortune 500 traction.' },
  { id:'f5', title:'EU AI Act Article 22 enforcement deadline confirmed August 2026', topic:'Cybersecurity', source:'EUR-Lex Official', published_at:'2026-04-12', summary:'Public sector AI systems face compliance deadline with enforcement wave beginning Q3 2026.' },
  { id:'f6', title:'HealthTech AI diagnostics company secures €120M Series C', topic:'HealthTech', source:'Les Échos', published_at:'2026-04-11', summary:'European HealthTech firm raises major round to expand AI-powered diagnostic platform across hospitals.' },
  { id:'f7', title:'Quantum computing breakthrough: error-correction milestone at MIT', topic:'Infrastructure', source:'MIT News', published_at:'2026-04-10', summary:'MIT researchers demonstrate a new error-correction technique reducing quantum decoherence by 40%.' },
  { id:'f8', title:'Agentic AI adoption in banking jumps 340% YoY — average ROI 4.2x', topic:'FinTech', source:'Accenture Research', published_at:'2026-04-09', summary:'Banks deploying agentic AI for KYC automation and credit decisioning see strong returns.' },
];

// ── Ticker fallback ───────────────────────────────────────────────────────────
const FALLBACK_TICKER = [
  'OpenAI launches GPT-5 reasoning model',
  'Agentic AI startup raises $340M Series B',
  'Anthropic releases Claude with extended context',
  'Quantum computing breakthrough at MIT',
  'EU AI Act enforcement begins Q2 2026',
  'HealthTech AI diagnostics company secures €120M',
  'Meta Superintelligence Labs ships first model',
  "Perplexity's agent pivot gains Fortune 500 traction",
];

// ── Sign-in / Register modal ──────────────────────────────────────────────────
function SignInModal({ context, isOpen, onClose, onSuccess }) {
  const { login, applyToken } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');       // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) { setMode('login'); setEmail(''); setPassword(''); setFullName(''); setError(''); setBusy(false); }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const title = mode === 'login'
    ? (context && context !== 'login' && context !== 'register'
        ? `Sign in to access ${context}`
        : 'Welcome back')
    : 'Create your account';

  const desc = mode === 'login'
    ? 'Sign in to access AI Trends, Newsletter, and your saved intelligence.'
    : 'Join DXC AI Watch — free for technology leaders.';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Registration failed');
      }
      const data = await res.json();
      if (data.access_token) {
        applyToken(data.access_token);
        onSuccess();
      } else {
        // Registration succeeded but no token — switch to login
        setMode('login');
        setError('');
        setPassword('');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleOAuth = () => {
    window.location.href = '/api/auth/google';
  };

  const handleForgotPassword = () => {
    onClose();
    navigate('/forgot-password');
  };

  return (
    <div className="hp-modal-bg" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="hp-modal">
        <div className="hp-modal-stripe" />
        <div className="hp-modal-body">
          <div className="hp-modal-header">
            <div className="hp-modal-logo-row">
              <img src="/DXC-logo.png" alt="DXC" style={{ height: 20, width: 'auto' }} />
              <span className="hp-ml-name">AI Watch</span>
            </div>
            <button className="hp-m-close-btn" onClick={onClose} aria-label="Close">✕</button>
          </div>

          <h2>{title}</h2>
          <p className="hp-m-desc">{desc}</p>

          {error && <div className="hp-m-error">{error}</div>}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            {mode === 'register' && (
              <>
                <label className="hp-m-lbl">Full name</label>
                <input
                  className="hp-m-in"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                />
              </>
            )}
            <label className="hp-m-lbl">Work email</label>
            <input
              className="hp-m-in"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus={mode === 'login'}
            />
            <label className="hp-m-lbl">Password</label>
            <input
              className="hp-m-in"
              type="password"
              placeholder={mode === 'register' ? 'Create a password' : 'Your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {mode === 'login' && (
              <div className="hp-m-forgot">
                <button style={{ background:'none', border:'none', padding:0, color:'var(--accent)', cursor:'pointer', fontSize:12, fontFamily:'inherit' }} onClick={handleForgotPassword}>Forgot password?</button>
              </div>
            )}
            <button className="hp-m-sbtn" type="submit" disabled={busy}>
              {busy ? 'Please wait…' : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
          </form>

          <div className="hp-m-or">or</div>
          <button className="hp-m-google" onClick={handleGoogleOAuth}>
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="hp-m-footer-note">
            {mode === 'login' ? (
              <>Don't have an account? <button className="hp-m-footer-note" style={{ background:'none', border:'none', padding:0, color:'var(--accent)', fontWeight:500, cursor:'pointer', fontSize:13, fontFamily:'inherit' }} onClick={() => { setMode('register'); setError(''); }}>Create account</button></>
            ) : (
              <>Already have an account? <button className="hp-m-footer-note" style={{ background:'none', border:'none', padding:0, color:'var(--accent)', fontWeight:500, cursor:'pointer', fontSize:13, fontFamily:'inherit' }} onClick={() => { setMode('login'); setError(''); }}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Article card skeleton ─────────────────────────────────────────────────────
function ArticleSkeleton() {
  return (
    <div style={{ background: 'var(--dxc-surface)', borderRadius: 10, border: '1px solid var(--dxc-border)', overflow: 'hidden' }}>
      <div className="hp-skeleton" style={{ width: '100%', aspectRatio: '16/9' }} />
      <div style={{ padding: 18 }}>
        <div className="hp-skeleton" style={{ height: 10, width: '40%', marginBottom: 10 }} />
        <div className="hp-skeleton" style={{ height: 14, width: '90%', marginBottom: 6 }} />
        <div className="hp-skeleton" style={{ height: 14, width: '70%', marginBottom: 14 }} />
        <div className="hp-skeleton" style={{ height: 10, width: '55%' }} />
      </div>
    </div>
  );
}

// ── Format date ───────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

// ── HomePage ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Modal state ────────────────────────────────────────────────────────────
  const initialModal = searchParams.get('signin');
  const [modalOpen, setModalOpen] = useState(!!initialModal);
  const [modalContext, setModalContext] = useState(initialModal || '');

  const openModal = useCallback((ctx = '') => {
    setModalContext(ctx);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalContext('');
    // clean up ?signin= param
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const handleModalSuccess = useCallback(() => {
    closeModal();
    // Navigate to the page they wanted, or dashboard
    if (modalContext === 'AI Trends') navigate('/trends');
    else if (modalContext === 'Newsletter') navigate('/newsletter');
    else if (modalContext === 'Reports') navigate('/reports');
    else if (modalContext === 'Saved Items') navigate('/saved');
    else if (modalContext === 'Profile') navigate('/profile');
    else if (modalContext === 'Data Table') navigate('/data');
    else navigate('/feed');
  }, [modalContext, closeModal, navigate]);

  // ── Hero subscribe form ────────────────────────────────────────────────────
  const [heroEmail, setHeroEmail] = useState('');

  const handleHeroSubscribe = (e) => {
    e.preventDefault();
    openModal('register');
  };

  // ── API data ──────────────────────────────────────────────────────────────
  const [articles, setArticles] = useState([]);
  const [tickerTitles, setTickerTitles] = useState(FALLBACK_TICKER);
  const [articleCount, setArticleCount] = useState('309');
  const [avgRelevance, setAvgRelevance] = useState('8.4/10');
  const [sourceCount, setSourceCount] = useState('4');
  const [articleOffset, setArticleOffset] = useState(8);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreArticles, setHasMoreArticles] = useState(true);
  const [activeChip, setActiveChip] = useState('All');
  const [newsletterDate, setNewsletterDate] = useState('');
  const [usingCachedData, setUsingCachedData] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const chipRef = useRef('All');

  const CHIPS = ['All', 'AI & LLMs', 'Infrastructure', 'FinTech', 'HealthTech', 'Cybersecurity', 'Strategy'];
  const CHIP_TO_TOPIC = {
    'AI & LLMs': 'AI', 'Infrastructure': 'Infrastructure',
    'FinTech': 'FinTech', 'HealthTech': 'HealthTech',
    'Cybersecurity': 'Cybersecurity', 'Strategy': 'Strategy',
  };

  const fetchArticles = useCallback(async (topic, offset = 0) => {
    try {
      const params = new URLSearchParams({ limit: '8' });
      if (offset > 0) params.set('offset', String(offset));
      if (topic && topic !== 'All' && CHIP_TO_TOPIC[topic]) {
        params.set('topic', CHIP_TO_TOPIC[topic]);
      }
      const res = await fetch(`/api/articles?${params.toString()}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      return Array.isArray(data) ? data : (data.articles || data.items || []);
    } catch {
      return null;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      setLoadingArticles(true);

      // Articles
      const arts = await fetchArticles('All', 0);
      if (!cancelled) {
        if (arts && arts.length > 0) {
          setArticles(arts);
          setUsingCachedData(false);
        } else {
          setArticles(FALLBACK_ARTICLES);
          setUsingCachedData(true);
        }
        setArticleOffset(8);
      }

      // Ticker (reuse first 10 article titles if available)
      if (!cancelled && arts && arts.length > 0) {
        const titles = arts.slice(0, 10).map(a => a.title).filter(Boolean);
        if (titles.length >= 3) setTickerTitles([...titles, ...titles]); // duplicate for seamless loop
      }

      // Stats
      try {
        const statsRes = await fetch('/api/articles?limit=1', { signal: AbortSignal.timeout(5000) });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          const total = statsData.total || statsData.count;
          if (total && !cancelled) setArticleCount(String(total));

          // avg relevance
          const scores = (arts || []).map(a => a.relevance_score).filter(s => typeof s === 'number');
          if (scores.length > 0 && !cancelled) {
            const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
            setAvgRelevance(`${avg}/10`);
          }
        }
      } catch { /* keep defaults */ }

      // Try to get source/sector count
      try {
        const sectorsRes = await fetch('/api/sectors/top', { signal: AbortSignal.timeout(5000) });
        if (sectorsRes.ok) {
          const sectorsData = await sectorsRes.json();
          const count = Array.isArray(sectorsData) ? sectorsData.length : (sectorsData.count || sectorsData.total);
          if (count && !cancelled) setSourceCount(String(count));
        }
      } catch { /* keep default 4 */ }

      if (!cancelled) setLoadingStats(false);

      // Newsletter status
      try {
        const nlRes = await fetch('/api/newsletter/status', { signal: AbortSignal.timeout(5000) });
        if (nlRes.ok) {
          const nlData = await nlRes.json();
          if (nlData.last_sent && !cancelled) {
            setNewsletterDate(fmtDate(nlData.last_sent));
          }
        }
      } catch { /* keep defaults */ }

      if (!cancelled) setLoadingArticles(false);
    }

    loadAll();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter by chip
  const handleChip = async (chip) => {
    if (chip === activeChip) return;
    setActiveChip(chip);
    chipRef.current = chip;
    setLoadingArticles(true);
    setHasMoreArticles(true);
    const arts = await fetchArticles(chip, 0);
    if (chipRef.current === chip) {
      setArticles(arts && arts.length > 0 ? arts : FALLBACK_ARTICLES.filter(a =>
        chip === 'All' || a.topic?.toLowerCase().includes(chip.toLowerCase().split(' ')[0].toLowerCase())
      ));
      setArticleOffset(8);
      setLoadingArticles(false);
      if (arts && arts.length < 8) setHasMoreArticles(false);
    }
  };

  // Show more
  const handleShowMore = async () => {
    setLoadingMore(true);
    const arts = await fetchArticles(activeChip, articleOffset);
    if (arts && arts.length > 0) {
      setArticles(prev => [...prev, ...arts]);
      setArticleOffset(prev => prev + 8);
      if (arts.length < 8) setHasMoreArticles(false);
    } else {
      setHasMoreArticles(false);
    }
    setLoadingMore(false);
  };

  // Note: Logged-in users can still view the landing page
  // They see "Dashboard" button instead of "Sign In"

  const weekNum = Math.ceil((new Date().getDate() + new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()) / 7);
  const todayStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="hp">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      {/* ── SIGN-IN MODAL ─────────────────────────────────────────────── */}
      <SignInModal
        context={modalContext}
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={handleModalSuccess}
      />

      {/* ── NAV ────────────────────────────────────────────────────────── */}
      <nav className="hp-nav">
        <Link to="/" className="hp-nav-logo">
          <img src="/DXC-logo.png" alt="DXC" className="hp-logo-img" />
          <span className="hp-logo-sep" />
          <span className="hp-logo-txt">AI Watch</span>
          <div className="hp-live-badge">
            <span className="hp-live-dot" />
            LIVE
          </div>
        </Link>

        {/* Hamburger (mobile) */}
        <button
          className="hp-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>

        <div className="hp-nav-links">
          <Link to="/feed" className="hp-nav-link hp-active" style={{ textDecoration: 'none' }}>News Feed</Link>
          <button
            className="hp-nav-link"
            onClick={() => user ? navigate('/trends') : openModal('AI Trends')}
          >AI Trends</button>
          <button
            className="hp-nav-link"
            onClick={() => user ? navigate('/newsletter') : openModal('Newsletter')}
          >Newsletter</button>
        </div>

        <div className="hp-nav-right">
          {user ? (
            <>
              <button className="hp-btn-sub" onClick={() => navigate('/feed')}>Dashboard</button>
            </>
          ) : (
            <>
              <button className="hp-btn-login" onClick={() => openModal('login')}>Sign In</button>
              <button className="hp-btn-sub" onClick={() => openModal('register')}>Subscribe</button>
            </>
          )}
        </div>
      </nav>

      {/* ── MOBILE MENU ────────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="hp-mobile-menu">
          <Link to="/feed" className="hp-mm-link" onClick={() => setMobileMenuOpen(false)}>News Feed</Link>
          <button className="hp-mm-link" onClick={() => { setMobileMenuOpen(false); user ? navigate('/trends') : openModal('AI Trends'); }}>AI Trends</button>
          <button className="hp-mm-link" onClick={() => { setMobileMenuOpen(false); user ? navigate('/newsletter') : openModal('Newsletter'); }}>Newsletter</button>
          <hr className="hp-mm-divider" />
          {user ? (
            <button className="hp-mm-link hp-mm-accent" onClick={() => { setMobileMenuOpen(false); navigate('/feed'); }}>Dashboard</button>
          ) : (
            <>
              <button className="hp-mm-link" onClick={() => { setMobileMenuOpen(false); openModal('login'); }}>Sign In</button>
              <button className="hp-mm-link hp-mm-accent" onClick={() => { setMobileMenuOpen(false); openModal('register'); }}>Subscribe</button>
            </>
          )}
        </div>
      )}

      {/* ── ERROR BANNER ───────────────────────────────────────────────── */}
      {usingCachedData && (
        <div className="hp-error-banner">
          Unable to load articles. Using cached data.
        </div>
      )}

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="hp-hero">
        <h1>
          Your AI intelligence<br />
          <span className="hp-accent">command centre.</span>
        </h1>
        <p className="hp-hero-sub">
          Monitor 26+ verified AI sources, discover what matters for DXC, and turn raw news into strategic decisions — automatically.
        </p>

        <form className="hp-hero-form" onSubmit={handleHeroSubscribe}>
          <input
            type="email"
            placeholder="Email Address"
            value={heroEmail}
            onChange={(e) => setHeroEmail(e.target.value)}
          />
          <button type="submit">
            Subscribe
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 7h10M7 2l5 5-5 5" />
            </svg>
          </button>
        </form>

        <div className="hp-trust">
          <div className="hp-trust-label">Join technology leaders from companies like:</div>
          <div className="hp-trust-logos">
            <span className="hp-trust-logo hp-lg">DXC</span>
            <span className="hp-trust-logo">STELLANTIS</span>
            <span className="hp-trust-logo">VOLKSWAGEN</span>
            <span className="hp-trust-logo">CDG</span>
            <span className="hp-trust-logo">SYNGENTA</span>
            <span className="hp-trust-logo">AHOLD</span>
          </div>
        </div>

        <div className="hp-hero-stats">
          <div className="hp-h-stat">
            <div className="hp-h-stat-n">
              {loadingStats ? <span className="hp-skeleton" style={{ display: 'inline-block', width: 60, height: 32, borderRadius: 6 }} /> : articleCount}
            </div>
            <div className="hp-h-stat-l">Articles today</div>
          </div>
          <div className="hp-h-stat">
            <div className="hp-h-stat-n">
              {loadingStats ? <span className="hp-skeleton" style={{ display: 'inline-block', width: 30, height: 32, borderRadius: 6 }} /> : sourceCount}
            </div>
            <div className="hp-h-stat-l">Live data sources</div>
          </div>
          <div className="hp-h-stat">
            <div className="hp-h-stat-n">
              {loadingStats ? <span className="hp-skeleton" style={{ display: 'inline-block', width: 70, height: 32, borderRadius: 6 }} /> : avgRelevance}
            </div>
            <div className="hp-h-stat-l">Avg relevance score</div>
          </div>
          <div className="hp-h-stat">
            <div className="hp-h-stat-n">500+</div>
            <div className="hp-h-stat-l">Technology leaders</div>
          </div>
        </div>
      </section>

      {/* ── TICKER ─────────────────────────────────────────────────────── */}
      <div className="hp-ticker">
        <div className="hp-ticker-track">
          {tickerTitles.map((t, i) => (
            <span key={i} className="hp-t-item">
              <span className="hp-t-dot" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── LATEST ARTICLES ────────────────────────────────────────────── */}
      <section className="hp-articles-section">
        <div className="hp-sect-top">
          <h2>The <em>latest insights</em></h2>
          <Link to="/feed" className="hp-view-all" style={{ textDecoration: 'none' }}>View all articles →</Link>
        </div>

        <div className="hp-chips">
          {CHIPS.map(chip => (
            <button
              key={chip}
              className={`hp-chip${activeChip === chip ? ' hp-chip-on' : ''}`}
              onClick={() => handleChip(chip)}
            >{chip}</button>
          ))}
        </div>

        <div className="hp-art-grid">
          {loadingArticles
            ? Array.from({ length: 8 }).map((_, i) => <ArticleSkeleton key={i} />)
            : articles.map((a) => {
                const topic = a.topic || a.industry || a.category || '';
                const color = topicColor(topic);
                const icon = topicIcon(topic);
                const summaryText = a.summary
                  ? (a.summary.length > 100 ? a.summary.slice(0, 97) + '…' : a.summary)
                  : '';
                return (
                  <Link
                    key={a.id}
                    to={`/article/${a.id}`}
                    className="hp-a-card"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="hp-a-thumb" style={{ background: color }}>
                      <div style={{ fontSize: 38, color: 'var(--accent)', opacity: 0.6 }}>{icon}</div>
                    </div>
                    <div className="hp-a-body">
                      <div className="hp-a-topic">{topic || 'AI & LLMs'}</div>
                      <div className="hp-a-title">{a.title}</div>
                      {summaryText && (
                        <div className="hp-a-plus">PLUS: {summaryText}</div>
                      )}
                      <div className="hp-a-foot">
                        <span className="hp-a-source">{a.source} · {fmtDate(a.published_at)}</span>
                        <span className="hp-a-read">Read →</span>
                      </div>
                    </div>
                  </Link>
                );
              })
          }
        </div>

        {hasMoreArticles && (
          <div className="hp-show-more-wrap">
            <button className="hp-show-more" onClick={handleShowMore} disabled={loadingMore}>
              {loadingMore ? 'Loading…' : 'Show more'}
            </button>
          </div>
        )}
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────── */}
      <section className="hp-features">
        <div className="hp-features-eyebrow">
          <span className="hp-eyebrow-line" />
          <span className="hp-eyebrow-txt">Platform capabilities</span>
          <h2>The power of <em>people and technology.</em></h2>
          <p>Everything you need to turn raw AI news into strategic decisions.</p>
        </div>
        <div className="hp-feat-grid">
          <div className="hp-feat-item">
            <div className="hp-feat-icon-wrap">◎</div>
            <h3>Live news feed</h3>
            <p>309+ articles daily from NewsAPI, NewsData.io, Google News RSS, and Perplexity. Filtered, ranked, and categorized automatically.</p>
            <Link to="/feed" className="hp-feat-link" style={{ textDecoration: 'none' }}>Explore feed →</Link>
          </div>
          <div className="hp-feat-item">
            <div className="hp-feat-icon-wrap">◈</div>
            <h3>AI Trends analysis</h3>
            <p>GPT-4o-mini clusters and scores trending topics 1–10. Track momentum, category, and source signals in real time.</p>
            <button className="hp-feat-link" onClick={() => user ? navigate('/trends') : openModal('AI Trends')}>
              View trends →
            </button>
          </div>
          <div className="hp-feat-item">
            <div className="hp-feat-icon-wrap">✉</div>
            <h3>Weekly newsletter</h3>
            <p>Auto-generated intelligence digest delivered to your team every Monday. Customize by topic, sector, and signal.</p>
            <button className="hp-feat-link" onClick={() => user ? navigate('/newsletter') : openModal('Newsletter')}>
              Subscribe →
            </button>
          </div>
          <div className="hp-feat-item">
            <div className="hp-feat-icon-wrap">⬡</div>
            <h3>Intelligence reports</h3>
            <p>Create, save, and export professional PDF reports from selected articles. COMEX-ready with AI summaries and key findings.</p>
            <button className="hp-feat-link" onClick={() => user ? navigate('/reports') : openModal('Reports')}>
              Create report →
            </button>
          </div>
          <div className="hp-feat-item">
            <div className="hp-feat-icon-wrap">⊕</div>
            <h3>Email alerts</h3>
            <p>Set keyword alerts with a signal threshold. Get hourly digest emails when breaking intelligence matches your criteria.</p>
            <button className="hp-feat-link" onClick={() => user ? navigate('/profile') : openModal('Alerts')}>
              Set alerts →
            </button>
          </div>
          <div className="hp-feat-item">
            <div className="hp-feat-icon-wrap">🗂️</div>
            <h3>DXC ONETEAM Archive</h3>
            <p>Browse 94 internal newsletter pages (Dec 2024 – Mar 2026) with full-page images, month and category filters.</p>
            <button className="hp-feat-link" onClick={() => user ? navigate('/dxc-newsletter') : openModal('DXC Newsletter')}>
              Browse archive →
            </button>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER GATE ────────────────────────────────────────────── */}
      <section className="hp-newsletter-gate">
        <div className="hp-ng-left">
          <div className="hp-ng-eyebrow">
            <span className="hp-ng-eyebrow-line" />
            <span className="hp-ng-eyebrow-txt">Weekly intelligence digest</span>
          </div>
          <h2>Sign in to access<br /><em>Newsletter</em></h2>
          <p>
            Get a curated weekly AI intelligence brief — auto-generated every Monday from the week's
            top articles across 6 sectors.
          </p>
          <form className="hp-ng-form" onSubmit={(e) => { e.preventDefault(); openModal('Newsletter'); }}>
            <input type="email" placeholder="Work email address" />
            <button type="submit">Subscribe →</button>
          </form>
          <div className="hp-ng-note">Free for DXC technology leaders · No spam · Unsubscribe anytime</div>
        </div>

        <div className="hp-ng-right">
          <div className="hp-ng-card">
            <div className="hp-ng-card-head">
              <span className="hp-ng-card-logo">DXC · AI Watch</span>
              <span className="hp-ng-card-date">
                {newsletterDate || todayStr} · Week {weekNum}
              </span>
            </div>
            <div className="hp-ng-card-title">
              This week in AI: Agents take over, EU tightens grip, HealthTech surges
            </div>
            <div className="hp-ng-card-body">
              Your weekly strategic intelligence brief from {articleCount} articles analyzed across 6 sectors.
            </div>
            <div className="hp-ng-card-items">
              <div className="hp-ng-ci"><span className="hp-ng-ci-dot" />Meta Superintelligence Labs ships first agentic model</div>
              <div className="hp-ng-ci"><span className="hp-ng-ci-dot" />EU AI Act enforcement wave hits enterprises in Q2</div>
              <div className="hp-ng-ci"><span className="hp-ng-ci-dot" />HealthTech AI diagnostics company secures €120M</div>
            </div>
            <div className="hp-ng-card-foot">
              <span>3 sectors · 9 strong signals</span>
              <span style={{ color: 'var(--accent)' }}>{avgRelevance} avg relevance</span>
            </div>
          </div>
          <div className="hp-ng-locked" />
          <button
            className="hp-ng-locked-pill"
            onClick={() => user ? navigate('/newsletter') : openModal('Newsletter')}
          >
            Sign in to read full edition →
          </button>
        </div>
      </section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────── */}
      <section className="hp-cta-final">
        <div className="hp-cta-left">
          <h2>Find out how <em>AI Watch</em><br />can help you.</h2>
          <p>
            The strategic intelligence platform built for DXC technology leaders — transforming
            passive news into proactive market advantage.
          </p>
          <div className="hp-cta-btns">
            <button className="hp-cta-btn-p" onClick={() => openModal('register')}>
              Get started free →
            </button>
            <button className="hp-cta-btn-o" onClick={() => navigate('/feed')}>
              Explore feed
            </button>
          </div>
        </div>
        <div className="hp-cta-right">
          {[
            { icon: '◎', title: 'Live news feed', desc: '309+ articles daily from 4 sources, analyzed and ranked by AI' },
            { icon: '◈', title: 'AI Trends & signals', desc: 'GPT-4o-mini clustering with 1–10 momentum scoring' },
            { icon: '✉', title: 'Automated newsletter', desc: 'Weekly AI-generated digest — zero manual effort' },
            { icon: '⬡', title: 'PDF intelligence reports', desc: 'COMEX-ready exports with one click, saved to your account' },
          ].map((f) => (
            <div key={f.title} className="hp-cta-feat">
              <div className="hp-cta-feat-icon">{f.icon}</div>
              <div className="hp-cta-feat-text">
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="hp-footer">
        <div>
          <img src="/DXC-logo.png" alt="DXC" style={{ height: 28, width: 'auto', marginBottom: 4 }} />
          <div className="hp-footer-watch">AI Watch</div>
          <div className="hp-footer-tagline">IMPOSSIBLE. DELIVERED.</div>
        </div>
        <div className="hp-footer-links">
          <span className="hp-footer-link">About</span>
          <span className="hp-footer-link">Privacy</span>
          <span className="hp-footer-link">API docs</span>
          <span className="hp-footer-link">Contact</span>
          <span className="hp-footer-link">LinkedIn</span>
        </div>
        <div className="hp-footer-copy">© 2026 DXC Technology · AI Watch v4.0 · Internal use only</div>
      </footer>
    </div>
  );
}
