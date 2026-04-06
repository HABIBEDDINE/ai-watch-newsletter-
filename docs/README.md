# AI Watch – V3

> Strategic technology intelligence platform powered by multi-source news aggregation and AI analysis

**AI Watch** continuously monitors technology trends, startup activity, funding rounds, and market signals. It fetches real news from four live APIs, analyzes each article with LLM-powered summarization, and surfaces actionable intelligence for technology leaders through an interactive React dashboard.

**Built for**: CTOs, Innovation Managers, Strategy Directors

**Branch**: ABDO → main

---

## What's New in V3

### Backend
- **Multi-LLM fallback chain** — OpenAI GPT-4o-mini (primary) → OpenAI backup key → Anthropic Claude Haiku. If the primary key fails or hits quota, the backup key is tried automatically before falling to Anthropic
- **Dual OpenAI key support** — `OPENAI_API_KEY` + `OPENAI_API_KEY_BACKUP` both loaded via `_openai_keys()` helper; both endpoints (`/api/summarize`, `/api/match-solutions`) iterate through all available keys
- **Strategic AI prompts** — Summaries follow a structured 4-point format: WHAT happened, WHY it matters strategically, WHO is affected, WHAT to watch next
- **`POST /api/match-solutions`** — Given any article or trend, returns top 3 most relevant DXC solutions with a one-sentence explanation per match. Results cached in memory (no repeat LLM calls on re-click). All 15 DXC solutions hardcoded in prompt
- **Stateless `/api/summarize` endpoint** — Frontend sends article data directly; no cache lookup required
- **Auto-startup ingestion** — Server pre-populates article cache on startup via background thread
- **Keyword extraction** — Every ingested article gets up to 6 SEO-style keywords extracted from title + description
- **Source API tracking** — Each article records which data source it came from (Perplexity, NewsAPI, NewsData, Google News)
- **Mock data removed** — All hardcoded fake articles, fallback feeds, and placeholder products deleted
- **`/api/test-llm` endpoint** — Diagnoses both OpenAI and Anthropic connectivity and key presence
- **`/api/debug/sources` endpoint** — Returns article counts broken down by source API

### Frontend — Explore Page
- **Article Detail page** (`/article/:id`) — Full detail view with signal badge, industry tag, source badge, Summary section, Key Info table, Key Actors, Funding, Match DXC Solutions, and Read Full Article button
- **Match DXC Solutions button** — Below Key Info table; click-only (never auto-triggers); displays top 3 matched DXC solutions inline with explanations; result cached per session
- **Summary auto-generation** — ArticleDetail auto-calls `/api/summarize` on load when no summary exists
- **Keywords row** — Key Info table shows extracted keyword pills
- **Refresh Intelligence** — Floating FAB button fixed bottom-right; appends fresh articles without losing the current list
- **Category combobox** — Industry filter is now a dropdown combobox
- **Grid / List toggle** — Switch between single-column list and three-column grid layouts

### Frontend — AI Trends Page
- **Live trend intelligence** — Perplexity `sonar-pro` across 6 categories: LLM Models, Dev & Coding AI, AI Agents, Open Source AI, AI Infrastructure, Enterprise AI Apps
- **Match Solutions button** — On each top trend card; click-only; displays top 3 DXC solution matches inline on that card only; other cards unaffected
- **Deep Dive modal** — Full strategic analysis per trend with What It Is / Enterprise Impact / Action Plan sections
- **Watchlist** — Save/unsave trends; watchlist persists across category tabs
- **Client-side category filtering** — All trends fetched once; tabs filter locally with no server round-trip
- **Auto-refresh** — Background scheduler refreshes trends every 6 hours

### Frontend — Reports Page
- **Professional PDF design** — Branded header banner, meta grid, executive summary, key findings pills, table of contents, per-article category colour bar, keywords pills, clickable "Read Full Article" links, page-number footers
- **Shared PDF utility** — `src/utils/generatePDF.js` — single source of truth used by both Reports page and Explore download button
- **Daily Brief modal** — Clean white minimal design with stats cards, topic pills, article list with left-border signal indicator

### Frontend — Data Preview Page
- **Real funding data** — Funding Rounds table fetches from `/api/funding`
- **Real actors data** — News Sources table fetches from `/api/actors`
- **Empty states** — Both tables show a descriptive message when no data is available yet

### Brand & Design
- **Color rebrand** — Primary brand color `#1A4A9E` (deep navy blue), secondary `#C45F00` (burnt orange); applied across all pages and components
- **Mobile-responsive sidebar** — Collapses to a drawer on mobile (≤768px) with hamburger toggle and backdrop overlay

---

## Tech Stack

**Backend**: FastAPI · Python 3.10+ · APScheduler · httpx · OpenAI SDK · Anthropic SDK · python-jose · bcrypt · Supabase (PostgreSQL via REST)

**Data Sources**: NewsAPI · NewsData · Google News RSS · Perplexity API

**Database**: Supabase — `articles`, `solution_matches`, `trends`, `reports`, `newsletter_subscribers`, `dxc_solutions`, `matching_results`, `users`, `refresh_tokens`, `password_reset_tokens`

**Frontend**: React 19 · React Router v6 · Recharts · jsPDF · Lucide React

**Auth**: JWT (HS256) · bcrypt (cost 12) · httpOnly refresh cookies · Google OAuth 2.0

---

## Project Structure

```
ai-watch-V3/
├── backend/
│   ├── api.py                    # FastAPI app — all REST endpoints
│   ├── auth.py                   # Auth router — register, login, logout, refresh, OAuth, password reset
│   ├── db.py                     # Supabase REST client (pure requests, no SDK dependency)
│   ├── ingestion.py              # Multi-source news fetching + keyword extraction
│   ├── summarizer.py             # LLM summarization (OpenAI → Anthropic fallback)
│   ├── trends_service.py         # Perplexity trend fetching + GPT clustering
│   ├── report_generator.py       # Markdown + PDF report generation
│   ├── newsletter.py             # HTML email digest + SMTP delivery
│   ├── powerbi_export.py         # CSV/JSON exports for Power BI
│   ├── scheduler.py              # APScheduler daily ingestion + DB cleanup job
│   ├── test_email.py             # SMTP connection + delivery diagnostic script
│   └── test_ingest.py            # Ingestion diagnostic script
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg           # DXC branded favicon
│   │   └── solutions/            # Product images (17 assets)
│   └── src/
│       ├── pages/
│       │   ├── Explore.jsx           # News feed — filter, search, paginate, grid/list toggle
│       │   ├── ArticleDetail.jsx     # Full article view with AI summary + DXC solution match
│       │   ├── Trends.jsx            # AI trend intelligence with Deep Dive + solution match
│       │   ├── DataPreview.jsx       # Charts, stats, funding rounds, news sources
│       │   ├── Reports.jsx           # Saved reports with PDF/Markdown export
│       │   ├── Solutions.jsx         # DXC AI Accelerator product catalog (14 products)
│       │   ├── Newsletter.jsx        # Weekly digest with SMTP delivery and subscription management
│       │   ├── LoginPage.jsx         # Sign-in form with DXC branding
│       │   ├── RegisterPage.jsx      # 2-step registration (credentials → role selection)
│       │   ├── ForgotPasswordPage.jsx  # Password reset request form
│       │   └── ResetPasswordPage.jsx   # New password form (token from URL)
│       ├── components/
│       │   ├── CategoryCombobox.jsx  # Reusable industry filter dropdown
│       │   ├── ProtectedRoute.jsx    # Redirects unauthenticated users to /login
│       │   └── RightPanel.jsx        # Sidebar right panel
│       ├── utils/
│       │   └── generatePDF.js      # Shared professional PDF builder (jsPDF)
│       ├── context/
│       │   ├── ArticleContext.jsx  # Article state shared across pages
│       │   └── AuthContext.jsx     # Auth state — user, token, login/logout, silent refresh
│       └── services/
│           └── api.js              # All API calls with retry + timeout + Bearer token injection
│
├── config/
│   ├── .env                      # API keys (DO NOT COMMIT)
│   ├── .env.example              # Key template
│   └── requirements.txt
│
├── data/
│   └── reports/                  # Generated PDF and Markdown reports
│
└── docs/
    └── README.md                 # This file
```

---

## API Keys

Copy `.env.example` to `.env` and fill in your keys:

```env
# Supabase (required — persistent database)
SUPABASE_URL=https://owxjvosuwkneuioiiplp.supabase.co
SUPABASE_KEY=<service_role JWT>          # from Project Settings → API → service_role

# Auth (required)
JWT_SECRET=<64-char hex>                 # generate: python -c "import secrets; print(secrets.token_hex(32))"
FRONTEND_URL=http://localhost:3000

# Google OAuth (optional — leave blank to disable)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback

# Required (at least one LLM key)
OPENAI_API_KEY=sk-...
OPENAI_API_KEY_BACKUP=sk-...             # Optional — tried if primary fails
ANTHROPIC_API_KEY=sk-ant-...

# News sources (at least one recommended)
NEWS_API_KEY=...
NEWSDATA_API_KEY=...

# AI Trends (required for Trends page)
PERPLEXITY_API_KEY=pplx-...

# Newsletter email delivery (optional — saves HTML file if not set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your_gmail_app_password    # Gmail App Password (16 chars, no spaces)
SMTP_FROM_EMAIL=your@gmail.com           # Must match SMTP_USERNAME for Gmail
NEWSLETTER_RECIPIENTS=recipient@example.com
```

The system works with any combination — if the primary OpenAI key hits quota, the backup is tried automatically. If both OpenAI keys fail, Anthropic handles all LLM calls. If a news API key is missing, the other sources fill in. Without `PERPLEXITY_API_KEY` the Trends page will not load data. Without SMTP vars the newsletter is saved as an HTML file in `data/reports/`.

> **Gmail App Password**: Go to myaccount.google.com → Security → 2-Step Verification → App passwords. Generate one for "Mail". Use the 16-char code (no spaces) as `SMTP_PASSWORD`. Your regular Gmail password will not work. Run `python test_email.py` to verify delivery before using the UI.

---

## Get Started

### 1. Backend

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux

pip install -r config/requirements.txt
cp config/.env.example config/.env   # add your API keys

cd backend
python api.py
# → http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health + cache stats |
| GET | `/api/articles` | Paginated article list with filters |
| GET | `/api/articles/{id}` | Single article by ID |
| POST | `/api/summarize` | Generate AI summary for any article (English-only, caches result) |
| POST | `/api/match-solutions` | Match article/trend to top 3 DXC solutions with explanations (cached) |
| POST | `/api/ingest` | Trigger fresh news ingestion |
| GET | `/api/trends` | Get cached trends (all or filtered by category) |
| POST | `/api/trends/refresh` | Fetch fresh trends from Perplexity + re-cluster with GPT |
| GET | `/api/trends/saved` | Get watchlisted trends |
| GET | `/api/trends/top` | Top 3 trends by score |
| POST | `/api/trends/{id}/deepdive` | Generate deep-dive analysis for a trend |
| POST | `/api/trends/{id}/save` | Save trend to watchlist |
| DELETE | `/api/trends/{id}/save` | Remove trend from watchlist |
| GET | `/test-perplexity` | Debug: raw Perplexity API connection test |
| GET | `/api/funding` | Extracted funding rounds |
| GET | `/api/actors` | Key actors mentioned in articles |
| GET | `/api/reports` | Saved reports |
| POST | `/api/reports` | Save a new report |
| DELETE | `/api/reports/{id}` | Delete a saved report |
| GET | `/api/export/csv` | Download articles as CSV |
| GET | `/api/signals/live` | Live signal breakdown |
| GET | `/api/newsletter/status` | SMTP config + last send status |
| POST | `/api/newsletter/send` | Trigger manual newsletter send |
| POST | `/api/newsletter/subscribe` | Add email subscriber |
| DELETE | `/api/newsletter/unsubscribe` | Remove email subscriber |
| POST | `/api/matching/save` | Save quiz answers + matched solutions to DB |
| GET | `/api/debug/sources` | Articles count per source API |
| GET | `/api/test-llm` | Test OpenAI + Anthropic connectivity |
| **Auth** | | |
| POST | `/api/auth/register` | Create account — returns access token + sets refresh cookie |
| POST | `/api/auth/login` | Sign in — returns access token + sets refresh cookie |
| POST | `/api/auth/logout` | Revoke refresh token + clear cookie |
| POST | `/api/auth/refresh` | Issue new access token using httpOnly refresh cookie |
| GET | `/api/auth/google` | Redirect to Google OAuth consent screen |
| GET | `/api/auth/google/callback` | Exchange OAuth code → tokens; redirect to frontend |
| POST | `/api/auth/forgot-password` | Request password reset link (printed to console in dev) |
| POST | `/api/auth/reset-password` | Consume reset token + set new password |
| GET | `/api/users/me` | Return current user profile (Bearer token required) |

---

## Data Sources

| Source | Type | Cost | Key Required |
|--------|------|------|-------------|
| **Google News RSS** | RSS Feed | Free | No |
| **NewsAPI** | REST API | Free tier | `NEWS_API_KEY` |
| **NewsData** | REST API | Free tier | `NEWSDATA_API_KEY` |
| **Perplexity** | AI Search | Paid | `PERPLEXITY_API_KEY` |

---

## Dashboard Pages

### Auth Pages (public)

| Page | Route | Description |
|------|-------|-------------|
| **Login** | `/login` | Sign in with email + password or Google OAuth |
| **Register** | `/register` | 2-step account creation: credentials → role selection |
| **Forgot Password** | `/forgot-password` | Request a password reset link |
| **Reset Password** | `/reset-password/:token` | Set a new password using the emailed token |

### App Pages (protected — require login)

| Page | Route | Description |
|------|-------|-------------|
| **Explore** | `/` | Browse articles, filter by industry, search, grid/list toggle, floating FAB |
| **Article Detail** | `/article/:id` | Full article with AI summary, key actors, funding, DXC solution match |
| **AI Trends** | `/trends` | Live Perplexity trend intelligence, Deep Dive, watchlist, solution match per card |
| **Data Preview** | `/data-preview` | Charts, stats, data table, funding rounds, news sources |
| **Reports** | `/reports` | Saved intelligence reports with PDF/Markdown download |
| **Solutions** | `/solutions` | DXC AI Accelerator product catalog — 14 products across Consulting, Delivery & Innovation |
| **Newsletter** | `/newsletter` | Weekly digest with SMTP delivery and subscription management |

---

## Roadmap

### V1 — POC (done)
- News collection from NewsAPI
- AI article summarization
- Industry categorization + weak signal detection
- Startup extraction + newsletter digest

### V2 — MVP (done)
- Industry & market classification taxonomy
- Key actors and funding round extraction
- Auto-generated weekly newsletter
- Real-time BI dashboard with charts
- PDF report export

### V3 — MVP+ (current — branch: ABDO / main)
- Multi-source ingestion (4 APIs in parallel)
- OpenAI → backup OpenAI → Anthropic fallback chain
- Strategic AI prompts (WHAT / WHY / WHO / WHAT NEXT)
- Article Detail page with full context
- Keyword extraction per article
- Category combobox filter
- Floating Refresh FAB — always visible while scrolling
- Grid / List view toggle (3-col desktop → 2-col tablet → 1-col mobile)
- Mock data fully removed — 100% real API data
- Shared PDF utility (`generatePDF.js`) — one design, used everywhere
- Professional PDF: branded header, meta grid, TOC, category colour bars, keyword pills, clickable links
- Mobile-responsive sidebar drawer with hamburger toggle
- **Match DXC Solutions** — click-to-match on Article Detail and Trends cards; top 3 solutions with AI explanations; cached in DB
- **Brand rebrand** — deep navy `#1A4A9E` primary, burnt orange `#C45F00` secondary
- **Supabase persistent DB** — all data stored in PostgreSQL; no more in-memory caches lost on restart
- **Quiz state persistence** — Matching page saves progress to localStorage; survives navigation; "Start Over" button
- **Quiz results saved to DB** — `matching_results` table records every completed quiz
- **Email delivery fixed** — proper SMTP handshake (`ehlo` + `starttls`); errors surfaced in API status; `test_email.py` diagnostic tool

#### Latest updates (April 2026)

**User Authentication** (April 6, 2026)
- **`backend/auth.py`** — full auth router: register, login, logout, token refresh, Google OAuth, forgot/reset password, `/api/users/me`
- **JWT security** — access tokens (HS256, 15 min TTL) in memory; refresh tokens (7 day TTL) in httpOnly `SameSite=Lax` cookies; tokens stored hashed (SHA-256) in Supabase
- **bcrypt passwords** — cost factor 12; password strength enforced client + server (≥8 chars, 1 uppercase, 1 number)
- **Rate limiting** — 5 failed login attempts per email per 15 min (in-memory bucket)
- **3 new Supabase tables** — `users`, `refresh_tokens`, `password_reset_tokens` (migration: `config/auth_migration.sql`)
- **Google OAuth** — server-side code exchange; users upserted by email; disabled gracefully if `GOOGLE_CLIENT_ID` not set
- **`AuthContext.jsx`** — React context; restores session from refresh cookie on page load; schedules silent token refresh 60 s before expiry
- **`ProtectedRoute.jsx`** — all app routes protected; unauthenticated users redirected to `/login` with return path saved
- **4 auth pages** — `LoginPage`, `RegisterPage` (2-step with role cards), `ForgotPasswordPage`, `ResetPasswordPage`
- **`api.js`** — injects `Authorization: Bearer` header on every request automatically
- **Collapsible sidebar** — desktop toggle button (PanelLeftClose/Open icons); collapses to 52 px icon-only strip; smooth 0.28 s transition; hidden on mobile



**Project reorganization** (April 6, 2026)
- Flat file structure replaced with clean `backend/` · `frontend/` · `config/` · `data/` · `docs/` layout
- All `load_dotenv()` calls updated to explicit `config/.env` path using `Path(__file__).resolve()`
- Report output paths updated to `data/reports/` in `report_generator.py` and `newsletter.py`
- `frontend/aiwatch-frontend/` flattened to `frontend/` directly

**Solutions page rebuild** (April 2026)
- Solutions page fully rebuilt to match DXC AI Accelerator Products catalog design
- 14 products across Consulting, Delivery, and Innovation categories
- Features: category filter tabs, rank + category badges, image lightbox, Learn More modal with keyboard/swipe navigation, CTA banner
- 17 product images served from `frontend/public/solutions/`
- Removed: Solutions2, Matching pages and all associated routes/nav items

**DXC branding** (April 2026)
- DXC logo (`/solutions/DXC.png`) added to top navbar
- DXC favicon (`favicon.svg`) — navy `#1A1A2E` background, orange `#FF6200` "DXC" text
- Browser tab title updated to "AI Watch | DXC Technology"

#### Previous updates (March 2026)

**Supabase persistent database** (March 28, 2026)
- **`db.py`** — pure `requests`-based Supabase REST client; mirrors the supabase-py chain API with zero extra dependencies; works on Python 3.14
- **7 Supabase tables** — `articles`, `solution_matches`, `trends`, `reports`, `newsletter_subscribers`, `dxc_solutions`, `matching_results`
- **DB-first everywhere** — all endpoints check the database before calling any LLM or external API; summaries, solution matches, and trend deep-dives are never regenerated if already stored
- **Dedup on ingest** — articles deduplicated by URL; existing records skipped cleanly
- **TTL cleanup** — articles older than 30 days auto-deleted on each ingest run; trends older than 7 days purged by the daily scheduler
- **15 DXC solutions seeded** — `dxc_solutions` table populated on server startup (idempotent)
- **`matching_results` table** — quiz answers and top 3 matched solutions saved to DB after each quiz completion via `POST /api/matching/save`

**Bug fixes** (March 28, 2026)
- **Explore page — 0-article flash** — `loading` initialised to `true`; duplicate `useEffect` merged into one; auto-retry after 2 s if server returns 0 results
- **Matching quiz — state lost on navigation** — full quiz state (step, answers, phase, matches) persisted to `localStorage`; restored on return; "Start Over" button clears saved state
- **Matching quiz — results saved to DB** — `saveMatchingResult()` added to `api.js`; `POST /api/matching/save` endpoint inserts into `matching_results`

**Email delivery fixed** (March 28, 2026)
- **Root cause** — expired Gmail App Password caused silent `535: Username and Password not accepted` auth failures; errors were swallowed by a bare `except` clause so the UI showed "Send started" with no delivery
- **`newsletter.py`** — added `ehlo()` before and after `starttls()`; `From` header forced to `SMTP_USERNAME` (Gmail requirement); bare `except` replaced with typed `except` + `raise` so errors propagate
- **`api.py`** — background task now stores the full `type(e).__name__: message` in `last_status` instead of a generic string; visible via `GET /api/newsletter/status`
- **`test_email.py`** — standalone SMTP diagnostic script; prints config (masked password), runs full TLS handshake, sends a real test email, and prints the exact auth or connection error if it fails

**Earlier V3 updates**
- **`POST /api/match-solutions`** — LLM matches any article or trend to top 3 DXC solutions; results cached in DB so repeat clicks cost zero API credits
- **Dual OpenAI key fallback** — `OPENAI_API_KEY_BACKUP` env var; loops through all keys before falling to Anthropic
- **Color rebrand** — all pages updated from legacy purple/green to `#1A4A9E` / `#C45F00`
- **AI Trends page** — live intelligence via Perplexity `sonar-pro` across 6 categories; Deep Dive modal; watchlist; client-side category filtering
- **Summary language enforcement** — `system` message role forces English-only output
- **`asyncio.to_thread()`** — all synchronous OpenAI/Anthropic SDK calls wrapped to prevent blocking the uvicorn event loop
- **Health check debounce** — frontend flips to "API DOWN" only after 2 consecutive failures

### V4 — Planned
- Role-based feed personalisation (CTO / Innovation Manager / Strategy Director default filters)
- User profile page — edit name, company, role
- Microsoft SSO (DXC Active Directory integration)
- Email verification (send confirmation on register)
- Admin panel — user management, usage stats
- Competitive radar (interactive map of market players)
- Technology maturity scoring per sector
- Trend prediction (6–12 month horizon)
- Investment opportunity scoring
- Saved filters and personalised watchlists
- Email alerts for high-relevance articles
- Multi-language support

---

**Version**: 3.5.0 | **Branch**: ABDO → main | **Status**: Active Development | **Last Updated**: April 6, 2026
