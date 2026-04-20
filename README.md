# AI Watch — V4

Strategic AI technology intelligence platform for DXC Technology. Monitor trends, bookmark articles, compose and deliver intelligence briefs, and receive proactive email alerts — powered by AI and personalised to your role.

---

## What's New in V4

| Sprint | Delivered | Impact |
|---|---|---|
| **Sprint 1** | Server-side summarizer cache (30-day TTL) + client-side API cache (5-min TTL) + `alert_preferences` DB table | ~67% reduction in OpenAI API spend |
| **Sprint 2** | `saved_items` DB table + full bookmark system (articles & trends) + role-based feed personalisation | New retention features, instant content relevance |
| **Sprint 3** | Hourly email alert scanner + `send_alert_digest()` + 3 alert API routes | Proactive re-engagement at $0 extra API cost |
| **Sprint 4** | Multi-source trends pipeline (HN, Reddit, arXiv, GitHub, RSS) + GPT-4o-mini clustering | ~$0.30/month vs ~$9/month with Perplexity |
| **V4.2** | **Verified Sources Upgrade** — 26 tiered primary sources (OFFICIAL, RESEARCH, MEDIA, YOUTUBE) + trust-weighted scoring + role recommendations with AI insights | Higher signal quality, role-specific relevance |
| **V4 UX** | Profile page redesign (hero banner, role card grid) · Newsletter 3-step composer wizard · Live email preview panel · PDF export · File-backed recipients · Synchronous SMTP with real error surfacing | End-to-end email delivery, polished UI |
| **V4.3** | **DXC ONETEAM Newsletter Archive** — 94 newsletter articles (Dec 2024 – Mar 2026) with full-page images, month/category filters, searchable content, and detail view with original formatting | Internal news archive, visual newsletter browsing |
| **V4.4** | **Unified Theme System** — Light/dark mode toggle, single DXC orange accent color, theme-aware sidebar & navbar, fixed header, CSS variable architecture | Brand-consistent UI, improved navigation, user preference persistence |
| **V4.5** | **DXC Newsletter Detail Redesign** — 3-panel layout with AI-generated journal cards (GPT-4o-mini), full-screen article modal, zoomable page images with lightbox | Executive intelligence briefs, immersive reading experience |
| **V4.6** | **Login Page Redesign** — Expanded left panel with larger DXC logo (140px), updated feature bullets (26+ sources, trends, ONETEAM archive), full light/dark mode support via ThemeContext | Polished first impression, brand consistency |
| **V4.6** | **Lightbox Enhancements** — Drag-to-pan for zoomed images, touch support (pinch-to-zoom, single-finger drag), keyboard navigation (arrow keys pan, +/- zoom), zoom control buttons | Mobile-friendly image viewing, accessibility |
| **V4.6** | **Content Quality Fix** — Removed "Summary not available" fallback text, frontend shows "source · topic" instead, backend returns empty string for failed scrapes | Cleaner article cards, no placeholder text |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 6, Recharts, jsPDF 4, Lucide Icons |
| Backend | FastAPI (Python), Uvicorn |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (HS256, 15 min) + HTTP-only rotating refresh cookies (7 days) + Google OAuth 2.0 |
| AI | OpenAI GPT-4o-mini (summaries, solution matching, deep-dives, trend clustering, newsletter journal cards) |
| News | NewsAPI, NewsData.io |
| Trends Sources | 26 verified RSS feeds (OpenAI, Anthropic, DeepMind, Meta AI, etc.) + HackerNews Algolia API + Reddit JSON + arXiv XML + GitHub Trending |
| Email | SMTP (Gmail App Password) — verification, newsletter composer, alert digests |
| Scheduling | APScheduler — daily ingest (00:00 UTC), daily newsletter (07:00 UTC), trends refresh (08:00 UTC), alerts (1 h) |

---

## Project Structure

```
ai-watch-V4/
├── backend/
│   ├── api.py            # All API routes (articles, trends, saved, alerts, newsletter, reports, …)
│   ├── auth.py           # Auth router (register, login, OAuth, JWT, email verify, reset pw)
│   ├── db.py             # Supabase REST client
│   ├── ingestion.py      # News ingestion from NewsAPI + NewsData.io
│   ├── summarizer.py     # OpenAI summaries + 30-day in-memory cache
│   ├── newsletter.py     # Newsletter HTML generation + SMTP delivery + alert digest emails
│   ├── scheduler.py      # Background jobs (ingest, newsletter, trends, alerts)
│   ├── trends_service.py # Trend clustering, refresh, role personalisation
│   └── free_sources.py   # Multi-source fetchers (verified RSS, HN, Reddit, arXiv, GitHub)
├── frontend/
│   └── src/
│       ├── App.js                     # Router + theme provider wrapper
│       ├── index.css                  # CSS variables for light/dark themes
│       ├── context/
│       │   ├── AuthContext.jsx        # JWT + localStorage session + silent refresh
│       │   ├── ThemeContext.jsx       # Light/dark mode state + localStorage persistence
│       │   └── ArticleContext.jsx     # Shared article state
│       ├── hooks/
│       │   └── useSaved.js            # Bookmark state — optimistic UI + rollback
│       ├── components/
│       │   ├── layout/
│       │   │   ├── DashboardLayout.jsx # Main app shell with sidebar + navbar
│       │   │   ├── Navbar.jsx          # Top bar with theme toggle (Sun/Moon)
│       │   │   ├── Sidebar.jsx         # Navigation + user profile section
│       │   │   └── Footer.jsx          # Public page footer
│       │   ├── ui/
│       │   │   ├── ArticleCard.jsx     # Reusable article card component
│       │   │   ├── TrendCard.jsx       # Reusable trend card component
│       │   │   ├── TrendSkeleton.jsx   # Loading skeleton for trends
│       │   │   └── ...                 # Other UI primitives
│       │   ├── CategoryCombobox.jsx   # Dropdown category selector
│       │   ├── TrendsOnboarding.jsx   # First-time trends setup wizard
│       │   └── ProtectedRoute.jsx     # Auth guard wrapper
│       ├── pages/
│       │   ├── HomePage.jsx           # Public landing page
│       │   ├── LoginPage.jsx          # Email/password + Google OAuth
│       │   ├── RegisterPage.jsx       # Account creation
│       │   ├── ForgotPasswordPage.jsx # Password reset request
│       │   ├── ResetPasswordPage.jsx  # Password reset confirmation
│       │   ├── VerifyEmailPage.jsx    # Email verification handler
│       │   ├── ProfilePage.jsx        # Hero banner, role card grid, personal info
│       │   ├── FeedPage.jsx           # Main news feed with filters
│       │   ├── Explore.jsx            # Article browse — role preset + bookmark
│       │   ├── ArticleDetail.jsx      # Full article + AI summary + solution match
│       │   ├── Trends.jsx             # Trend cards + deep-dive + bookmark
│       │   ├── TrendsPage.jsx         # Trends with category filters
│       │   ├── DataPreview.jsx        # Charts + data table view
│       │   ├── SavedPage.jsx          # Bookmarked articles & trends
│       │   ├── Reports.jsx            # Saved intelligence reports + PDF export
│       │   ├── Newsletter.jsx         # 3-step composer wizard + live preview
│       │   ├── DxcNewsletterPage.jsx  # ONETEAM newsletter archive browse
│       │   └── DxcNewsletterDetail.jsx # Newsletter article detail view
│       ├── services/api.js            # API client — token-aware, retry, 5-min cache
│       ├── utils/
│       │   ├── cleanText.js           # Text sanitization utilities
│       │   └── generatePDF.js         # jsPDF report generation
│       └── setupProxy.js              # CRA dev proxy → localhost:8000
├── data/
│   ├── recipients.json   # Newsletter recipient list (file-backed, persists across restarts)
│   └── reports/          # Generated newsletter HTML files
├── ONETEAM_Newsletter_Data/
│   ├── images/           # 174 PNG images (newsletter pages)
│   ├── newsletter_data.json  # 94 cleaned article records
│   ├── supabase_migration.sql # Table creation + data insert
│   └── upload_images.py  # Script to upload images to Supabase Storage
└── config/
    ├── auth_migration.sql  # All DB table definitions (run in Supabase SQL editor)
    └── .env                # All secrets (not committed)
```

---

## Features

### Authentication & Identity
- **Email/password registration** with bcrypt (rounds=12) password hashing
- **Email verification** — 24h single-use token link, resend rate-limited (1/5 min)
- **Google OAuth 2.0** — one-click sign-in, auto-verified
- **JWT access tokens** (15 min) + **rotating refresh tokens** (7 days, HTTP-only cookie)
- **Password reset** — 15-min single-use token via email
- **Rate limiting** — 5 login attempts per email per 15 min (HTTP 429)
- **Role system** — `cto`, `innovation_manager`, `strategy_director`, `other`
- **Profile editing** — update name, company, role (re-issues JWT with new claims)

### Profile Page
- **Hero banner** — gradient header with floating identity card
- **Role card grid** — 2×2 visual role selector with active state
- **Verification badge** — inline status chip + resend button

### Content & Intelligence
- **News Feed** — daily-ingested articles from NewsAPI + NewsData.io, 6 topics
- **Role Personalisation** — feed auto-presets to role on first visit, overridable with 1-click reset
- **AI Summaries** — GPT-4o-mini summaries with urgency signals and DXC solution matching, cached 30 days
- **Article Detail** — full article view with summary, key info, source link, and bookmark

### Trends (V4.2 Upgrade)
- **Multi-Source Pipeline** — aggregates from 6 source types in parallel:
  - **Verified Sources** — 26 official blogs (OpenAI, Anthropic, DeepMind, Meta AI, Mistral, HuggingFace, Google, Microsoft, AWS, IBM, NVIDIA, Cohere) + research publications (MIT Tech Review, Nature, Papers With Code) + tech media (TechCrunch, VentureBeat, Wired, The Verge) + YouTube channels
  - **Community Sources** — HackerNews (Algolia API), Reddit (public JSON), arXiv (XML API), GitHub Trending
- **Trust-Weighted Scoring** — OFFICIAL sources (10/10), RESEARCH (8/10), MEDIA (7/10), community (4-6/10)
- **Rich Trend Data** — each trend includes:
  - `primary_source` — verified org, URL, publication date
  - `all_sources` — up to 6 cross-referenced sources per trend
  - `why_trending` — explanation of timing (e.g., "Released 6 hours ago, 847 HN points")
  - `trend_trigger` — NEW_RELEASE, BENCHMARK, FUNDING, REGULATION, RESEARCH, or VIRAL
  - `channels` — source channels that detected this trend (OFFICIAL, MEDIA, HN, RD, etc.)
- **Role Personalisation** — `/api/trends/personalized` re-ranks trends by role category weights and generates cached AI insights
- **Deep-Dive** — AI-generated analysis with race condition protection (DB lock mechanism)
- **Bookmark Trends** — save trends alongside articles in one unified collection

### Saved Items
- **Unified Bookmarks** — bookmark any article or trend with one click
- **Saved Page** — filterable collection (All / Articles / Trends)
- **Optimistic UI** — instant visual feedback with server-sync and automatic rollback on failure

### Newsletter Composer (V4 UX)
- **3-step wizard** — Select Articles → Configure Edition → Send & Schedule
- **Step 1** — filterable article pool (topic / signal / date), checkbox select, Strong Signal pre-selected
- **Step 2** — 3 collapsible config sections: Content (5 toggles), Style (4 selects), Layout (2 selects)
- **Step 3** — Send Now tab (recipients, subject, send button) + Schedule tab (days/time/frequency) + History tab
- **Live preview panel** — 300px right-side email preview that reacts to every Step 2 change
- **PDF export** — A4 newsletter via jsPDF: cover page, articles grouped by sector, signals summary table
- **File-backed recipients** — stored in `data/recipients.json`, persists across backend restarts
- **Synchronous SMTP** — real errors returned to the UI (no silent failures), Gmail App Password auth

### Email Alerts
- **Keyword alerts** — configure keywords and a signal score threshold in your profile
- **Hourly digest** — scanner runs every hour, sends email when new articles match your keywords
- **Zero AI cost** — pure string matching, $0 per scan
- **One-click unsubscribe** — 64-char hex token embedded in every alert email

### Reports
- **Per-user saved reports** (max 30), PDF export via jsPDF
- **AI-powered** — report content built from article summaries and solution matching

### DXC ONETEAM Newsletter Archive (V4.3 + V4.5)
- **94 newsletter articles** from December 2024 to March 2026 — deduplicated and cleaned
- **Full-page images** — original newsletter pages with photos and formatted text stored in Supabase Storage
- **Browse page** — 3-column card grid with month/category filters and search
- **Year-based badges** — purple (2026), blue (2025), grey (2024)
- **Category badges** — 10 categories: Business & Clients, Quality, Innovation & Tech, CSR & Community, DEI & Inclusion, Awards & Recognition, Wellbeing & Health, Events & Upcoming, Referral & Jobs, Newsletter Content
- **Detail view (V4.5)** — 3-panel layout:
  - **Panel 1 (left)** — AI-generated journal card with headline, context, key points, stats, and takeaway (GPT-4o-mini, cached in DB)
  - **Panel 2 (center)** — Full article text with "Read Full Article" button opening a full-screen modal
  - **Panel 3 (right)** — Zoomable newsletter page image with click-to-expand lightbox
- **Lightbox features (V4.6)**:
  - Mouse wheel zoom (1x–5x)
  - Drag-to-pan when zoomed in
  - Touch support: pinch-to-zoom, single-finger drag
  - Keyboard: arrow keys pan, +/- zoom, 0 reset, Esc close
  - Visual zoom controls with percentage display
  - Hint text shown when zoomed
- **Data source** — extracted from the 212-page ONETEAM PDF, email threads automatically removed

### Caching
- **Server cache** — article summaries cached in-memory for 30 days (`_SUMMARY_CACHE`)
- **Client cache** — all GET API responses cached in browser for 5 minutes (`REQUEST_CACHE`)

### Theme System (V4.4 + V4.6)
- **Dark mode** — default, dark navy (#0E1020) background with orange (#FFB476) accents
- **Light mode** — white background, DXC red-orange (#E84E0F) accents matching dxc.com
- **Persistent** — preference saved to `localStorage` key `aiwatch_theme`
- **Sidebar** — theme-aware, adapts to light/dark mode via `var(--sidebar-bg)`
- **Fixed header** — navbar stays fixed at top when scrolling, uses `var(--bg-primary)` for theme support
- **Single accent color** — all interactive elements use one unified DXC orange variable
- **Toggle** — Sun/Moon button in top bar (and landing page), switches instantly via CSS variables on `<html data-theme>`
- **Login page (V4.6)** — Full light/dark mode support with theme-aware colors for left panel, form inputs, buttons, and decorative elements

---

## Local Development Setup

### 1. Prerequisites

- Python 3.10+
- Node.js 18+
- A Supabase project
- Gmail account with **2-Step Verification** enabled + an **App Password** (for SMTP)
- Google Cloud Console project (for OAuth — optional)

### 2. Environment variables

Create `config/.env`:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# News APIs
NEWS_API_KEY=your-newsapi-key
NEWSDATA_API_KEY=your-newsdata-key

# AI
OPENAI_API_KEY=sk-...

# Auth
JWT_SECRET=your-random-256-bit-hex-secret
FRONTEND_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Email (SMTP) — required for verification, newsletter & alerts
# Gmail: enable 2FA → myaccount.google.com → Security → App passwords
# Enter the 16-char code WITHOUT spaces
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=you@gmail.com
SMTP_PASSWORD=abcdabcdabcdabcd
SMTP_FROM_EMAIL=you@gmail.com
NEWSLETTER_RECIPIENTS=you@gmail.com
```

### 3. Database setup

Run `config/auth_migration.sql` in the Supabase SQL editor. This creates all required tables:

| Table | Purpose |
|---|---|
| `users` | User accounts (email, role, is_verified, …) |
| `refresh_tokens` | Active refresh sessions (rotated on use) |
| `email_verification_tokens` | 24h single-use email verify tokens |
| `password_reset_tokens` | 15-min single-use reset tokens |
| `articles` | Ingested news articles |
| `trends` | Aggregated trend data |
| `saved_items` | User bookmarks — articles & trends |
| `alert_preferences` | Per-user keyword alerts config |
| `reports` | Saved intelligence reports |
| `newsletter_subscribers` | Legacy email opt-in list (Supabase) |
| `dxc_newsletter_articles` | ONETEAM newsletter archive (94 articles, images in Supabase Storage, `journal_card` JSON cache) |

> Recipients managed via the Newsletter wizard are stored locally in `data/recipients.json`.

### 4. Google OAuth — redirect URI

In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your OAuth 2.0 Client:

Add `http://localhost:3000/api/auth/google/callback` as an **Authorised redirect URI**.

### 5. Start the backend

```bash
cd backend
pip install -r requirements.txt
python api.py
```

### 6. Start the frontend

```bash
cd frontend
npm install
npm start
```

The app runs at **http://localhost:3000**. All `/api/*` and `/health` requests are proxied to the backend at `localhost:8000` via `setupProxy.js`.

---

## Auth Architecture

```
Login / Register / Google OAuth
         │
         ▼
POST /api/auth/login  ──►  Backend issues:
                            • Access token (JWT, 15 min) — returned in body
                            • Refresh token (opaque, 7 days) — HTTP-only cookie
         │
         ▼
AuthContext.applyToken()
  • Calls setApiToken() — all api.js requests get Bearer header
  • Decodes JWT payload → sets user { user_id, role, full_name, email, is_verified }
  • Persists token to localStorage (key: aiwatch_at)
  • Schedules silent refresh 60s before expiry

Page reload
  • Fast path: localStorage token valid → session restored instantly
  • Slow path: POST /api/auth/refresh (cookie) → rotates token
  • OAuth path: ?token= in URL → applyToken() → cookie exchange

Email verification
  • Register → SMTP link sent → GET /api/auth/verify-email?token=...
  • Resend available from the banner shown to unverified users
  • is_verified gate: email alerts cannot be enabled until verified
```

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account, sends verification email |
| `POST` | `/api/auth/login` | — | Email/password login, rate-limited 5/15 min |
| `POST` | `/api/auth/logout` | — | Revoke refresh token |
| `POST` | `/api/auth/refresh` | cookie | Rotate refresh token, issue new access token |
| `GET` | `/api/auth/google` | — | Start Google OAuth flow |
| `GET` | `/api/auth/google/callback` | — | OAuth callback — creates user if new |
| `GET` | `/api/auth/verify-email` | — | Verify email via 24h token link |
| `POST` | `/api/auth/resend-verification` | — | Resend verification email (rate-limited) |
| `POST` | `/api/auth/forgot-password` | — | Send 15-min password reset link |
| `POST` | `/api/auth/reset-password` | — | Confirm new password via token |

### User
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Bearer | Current user profile |
| `PUT` | `/api/users/me` | Bearer | Update name, company, role — re-issues JWT |

### Content
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/feed` | — | Role-personalised article feed |
| `GET` | `/api/articles` | — | Paginated articles with filters (topic, signal, industry, search, date) |
| `GET` | `/api/articles/{id}` | — | Single article + AI summary (cached 30 days) |
| `POST` | `/api/summarize` | — | Generate AI summary for an article dict |
| `GET` | `/api/trends` | — | Trends with category filter, includes new fields (primary_source, all_sources, why_trending, trend_trigger) |
| `GET` | `/api/trends/personalized` | — | Role-ranked trends with `role_score` and `role_insight` (query: `?role=cto`) |
| `POST` | `/api/trends/refresh` | — | Refresh trends from all sources (query: `?force=true` to skip cache) |
| `GET` | `/api/trends/test-sources` | — | Test each source independently, returns status and sample |
| `POST` | `/api/trends/{id}/deepdive` | — | AI deep-dive for a trend (with DB lock for race condition protection) |
| `GET` | `/api/signals/live` | — | Live signal indicators |
| `GET` | `/api/sectors/top` | — | Top sectors by volume |
| `GET` | `/api/funding` | — | Paginated funding round data |
| `GET` | `/api/actors` | — | Paginated key actors / companies |

### Saved Items
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/saved` | Bearer | List bookmarked articles & trends |
| `POST` | `/api/saved` | Bearer | Bookmark an article or trend |
| `DELETE` | `/api/saved/{item_id}` | Bearer | Remove a bookmark |

### Alerts
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/alerts/preferences` | Bearer | Get alert config (auto-creates default row) |
| `PUT` | `/api/alerts/preferences` | Bearer | Update keywords, threshold, enabled flag |
| `GET` | `/api/alerts/unsubscribe/{token}` | — | One-click unsubscribe from alert emails |

### Newsletter
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/newsletter/send` | Bearer | Send newsletter — uses wizard recipients, subject, article selection |
| `GET` | `/api/newsletter/status` | — | SMTP config status + last send info |
| `GET` | `/api/newsletter/recipients` | — | List recipients from `data/recipients.json` |
| `POST` | `/api/newsletter/recipients` | — | Add recipient |
| `DELETE` | `/api/newsletter/recipients/{email}` | — | Remove recipient |
| `GET` | `/api/newsletter/schedule` | — | Get saved send schedule |
| `POST` | `/api/newsletter/schedule` | — | Save send schedule |
| `GET` | `/api/newsletter/sent` | — | List past sends (in-memory, resets on restart) |
| `POST` | `/api/newsletter/subscribe` | — | Legacy subscribe endpoint |
| `DELETE` | `/api/newsletter/unsubscribe` | — | Legacy unsubscribe endpoint |

### Reports
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reports` | Bearer | Paginated list of user's saved reports |
| `POST` | `/api/reports` | Bearer | Save a report |
| `DELETE` | `/api/reports/{id}` | Bearer | Delete own report |

### DXC ONETEAM Newsletter
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dxc-newsletters` | — | Paginated newsletter articles with filters (month, category, search) |
| `GET` | `/api/dxc-newsletters/filters` | — | Available months and categories for filter dropdowns |
| `GET` | `/api/dxc-newsletters/{id}` | — | Single newsletter article with full content and image URL |
| `POST` | `/api/dxc-newsletters/{id}/journal-card` | — | Generate AI journal card (headline, context, key_points, stats, takeaway) — cached in DB |

### System
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | — | Backend liveness check |
| `POST` | `/api/ingest` | Bearer | Manually trigger article ingestion for a topic |

---

## Verified Sources (V4.2)

The trends pipeline fetches from 26+ verified primary sources across 4 tiers:

| Tier | Trust | Sources |
|---|---|---|
| **OFFICIAL** | 10/10 | OpenAI Blog, Anthropic News, Google DeepMind, Meta AI, Mistral AI, Hugging Face, Google AI, Microsoft AI, AWS ML, IBM Research, NVIDIA AI, Cohere |
| **RESEARCH** | 8/10 | MIT Technology Review AI, Nature Machine Intelligence, Papers With Code, The Gradient |
| **MEDIA** | 7/10 | TechCrunch AI, VentureBeat AI, Wired AI, The Verge AI, Ars Technica |
| **YOUTUBE** | 7/10 | Google DeepMind, OpenAI, Andrej Karpathy, Two Minute Papers, Yannic Kilcher |

Community sources (HackerNews, Reddit, arXiv, GitHub) are also fetched but scored lower (4-6/10).

### Trust-Weighted Clustering

The GPT clustering prompt weights sources by trust score:
- **OFFICIAL alone** = include as trend (score 7+)
- **OFFICIAL + MEDIA** = very strong signal (score 8+)
- **OFFICIAL + MEDIA + HN** = explosive signal (score 9-10)
- **Community-only** = include if 3+ sources (score 5-6)

### Role Category Weights

The `/api/trends/personalized` endpoint re-ranks trends using role-specific category weights:

| Category | CTO | Innovation Manager | Strategy Director |
|---|---|---|---|
| ai_infrastructure | 10 | 5 | 6 |
| enterprise_apps | 9 | 7 | 10 |
| llm_models | 8 | 9 | 8 |
| ai_agents | 7 | 10 | 7 |
| open_source | 6 | 8 | 5 |
| dev_tools | 5 | 9 | 4 |

---

## License

Internal / DXC Technology — not for public distribution.
