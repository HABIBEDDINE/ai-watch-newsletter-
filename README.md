# AI Watch — V3

Strategic AI technology intelligence platform. Monitor trends, track competitors, and surface actionable insights — powered by AI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 6, Recharts, jsPDF, Lucide Icons |
| Backend | FastAPI (Python), Uvicorn |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (HS256) + HTTP-only refresh cookies + Google OAuth 2.0 |
| AI | OpenAI GPT-4o (summaries, reports), Anthropic Claude |
| News | NewsAPI, NewsData.io |
| Email | SMTP (Gmail) |

---

## Project Structure

```
ai-watch-V3/
├── backend/
│   ├── api.py            # Core API routes (feed, articles, trends, saved items, …)
│   ├── auth.py           # Auth router (register, login, Google OAuth, JWT, email verify)
│   ├── db.py             # Supabase client
│   ├── ingestion.py      # News ingestion from multiple sources
│   ├── summarizer.py     # OpenAI-powered article summaries
│   ├── newsletter.py     # Newsletter generation & SMTP delivery
│   └── scheduler.py      # Background tasks
├── frontend/
│   └── src/
│       ├── App.js
│       ├── context/
│       │   └── AuthContext.jsx     # JWT + localStorage session management
│       ├── hooks/
│       │   └── useSaved.js         # Shared bookmark state (articles + trends)
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── ProfilePage.jsx     # Edit profile, change role/company
│       │   ├── Explore.jsx         # Article feed with role personalisation
│       │   ├── ArticleDetail.jsx   # Full article view with AI summary
│       │   ├── Trends.jsx          # AI trend tracking with deep-dive
│       │   ├── SavedPage.jsx       # Saved articles & trends collection
│       │   ├── Reports.jsx         # Per-user saved reports (max 30)
│       │   └── Newsletter.jsx
│       ├── services/api.js         # API client (token-aware, retry logic)
│       └── setupProxy.js           # CRA dev proxy → localhost:8000
└── config/
    └── .env              # All secrets (not committed)
```

---

## Features

### Content & Intelligence
- **News Feed** — live AI news from NewsAPI + NewsData.io, filtered by topic and signal strength
- **Role Personalisation** — feed auto-tuned to user role (CTO → AI, Innovation Manager → HealthTech, Strategy Director → Cybersecurity), overridable per-session
- **AI Summaries** — GPT-4o summaries with urgency signals and DXC solution matching
- **Article Detail** — full article view with summary, key info, source link, and bookmark

### Trends
- **Trend Tracking** — categorised AI trends with signal strength scoring
- **Deep-Dive** — AI-generated deep-dive analysis per trend
- **Bookmark Trends** — save trends alongside articles in one unified collection

### Saved Items
- **Unified Bookmarks** — bookmark any article or trend with a single click
- **Saved Page** — filterable collection (All / Articles / Trends), click any card to open full detail
- **Optimistic UI** — instant visual feedback with server-sync and rollback on failure

### Reports & Newsletter
- **Reports** — per-user saved reports (max 30), PDF export via jsPDF
- **Newsletter** — personalised AI briefings sent to the logged-in user's email

### Auth
- **Email/password** with email verification (token link sent via SMTP)
- **Google OAuth 2.0** — one-click sign-in
- **JWT access tokens** (15 min) + **rotating refresh tokens** (7 days, HTTP-only cookie)
- **Password reset** via email link
- **Profile editing** — update name, company, role

### UX
- **Responsive** — mobile (xs/sm), tablet (md), desktop (lg)
- **Persistent session** — localStorage fast-path restore on page reload

---

## Local Development Setup

### 1. Prerequisites

- Python 3.10+
- Node.js 18+
- A Supabase project
- Google Cloud Console project (for OAuth)

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
ANTHROPIC_API_KEY=sk-ant-...

# Auth
JWT_SECRET=your-random-256-bit-hex-secret
FRONTEND_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=you@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=you@gmail.com
```

### 3. Supabase — required tables

Run these in the Supabase SQL editor:

```sql
-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar unique not null,
  full_name varchar not null,
  company varchar,
  role varchar not null default 'other',
  password_hash varchar,
  oauth_provider varchar,
  oauth_id varchar,
  is_verified boolean default false,
  email_verified_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Refresh tokens (rotating)
create table if not exists refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  token_hash varchar unique not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Email verification tokens
create table if not exists email_verification_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  token_hash varchar unique not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

-- Password reset tokens
create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  token_hash varchar unique not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

-- Articles
create table if not exists articles (
  id text primary key,
  title text not null default '',
  description text default '',
  summary text default '',
  url text unique,
  source text default '',
  published_at text default '',
  topic text default '',
  signal_strength text default 'Weak',
  relevance integer default 5,
  industry text default '',
  market_segment text default '',
  image_url text default '',
  source_api text default '',
  ingestion_date timestamptz default now(),
  keywords jsonb default '[]'
);

-- Trends
create table if not exists trends (
  id text primary key,
  category text default '',
  topic text default '',
  deepdive text,
  data jsonb default '{}',
  created_at timestamptz default now()
);

-- Saved items (articles + trends bookmarks)
create table if not exists saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  item_type text not null check (item_type in ('article', 'trend')),
  item_id text not null,
  item_data jsonb not null default '{}',
  saved_at timestamptz not null default now()
);
create index if not exists idx_saved_items_user_id on saved_items(user_id);

-- Reports (per-user, max 30)
create table if not exists reports (
  id text primary key,
  user_id uuid references users(id) on delete set null,
  title text not null default '',
  generated_date text default '',
  article_count integer default 0,
  funding_count integer default 0,
  summary text default '',
  key_points jsonb default '[]',
  articles jsonb default '[]'
);
create index if not exists idx_reports_user_id on reports(user_id);

-- Newsletter subscribers
create table if not exists newsletter_subscribers (
  id serial primary key,
  email text unique not null,
  subscribed_at timestamptz default now()
);

-- DXC solutions library
create table if not exists dxc_solutions (
  id serial primary key,
  number integer not null,
  name text not null,
  description text not null
);
```

### 4. Google OAuth — required redirect URI

In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your OAuth 2.0 Client:

Add `http://localhost:3000/api/auth/google/callback` as an **Authorised redirect URI**.

### 5. Start the backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn api:app --port 8000 --reload
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
  • Calls setApiToken() immediately (sync) — all api.js requests get the header
  • Decodes JWT payload → sets user { user_id, role, full_name, email, is_verified }
  • Persists token to localStorage (key: aiwatch_at)
  • Schedules silent refresh 60s before expiry

Page reload (Ctrl+R)
  • Fast path: reads localStorage → token valid → session restored instantly
  • Slow path: POST /api/auth/refresh (cookie) → rotates token
  • OAuth path: ?token= in URL → applyToken() → cookie exchange (best-effort)

Email verification
  • Register → SMTP link sent → GET /api/auth/verify-email?token=...
  • Resend available from the banner shown to unverified users
```

---

## API Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account, sends verification email |
| `POST` | `/api/auth/login` | — | Email/password login |
| `POST` | `/api/auth/logout` | — | Revoke refresh token |
| `POST` | `/api/auth/refresh` | cookie | Rotate refresh token, issue new access token |
| `GET` | `/api/auth/google` | — | Start Google OAuth flow |
| `GET` | `/api/auth/google/callback` | — | OAuth callback |
| `GET` | `/api/auth/verify-email` | — | Verify email via token link |
| `POST` | `/api/auth/resend-verification` | — | Resend verification email |
| `POST` | `/api/auth/forgot-password` | — | Send password reset link |
| `POST` | `/api/auth/reset-password` | — | Confirm new password |

### User
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Bearer | Current user profile |
| `PUT` | `/api/users/me` | Bearer | Update name, company, role |

### Content
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/feed` | — | Role-personalised AI news feed |
| `GET` | `/api/articles` | — | Paginated article list with filters |
| `GET` | `/api/articles/{id}` | — | Single article detail |
| `POST` | `/api/summarize` | — | Generate AI summary for an article |
| `GET` | `/api/trends` | — | AI trend data with category filter |
| `POST` | `/api/trends/{id}/deepdive` | — | Generate deep-dive for a trend |

### Saved Items
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/saved` | Bearer | List saved articles & trends |
| `POST` | `/api/saved` | Bearer | Bookmark an article or trend |
| `DELETE` | `/api/saved/{item_id}` | Bearer | Remove a bookmark |

### Reports & Newsletter
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/reports` | Bearer | User's saved reports |
| `POST` | `/api/reports` | Bearer | Save a report (max 30) |
| `DELETE` | `/api/reports/{id}` | Bearer | Delete own report |
| `POST` | `/api/newsletter/send` | Bearer | Send personalised brief to own email |

---

## License

Internal / DXC Technology — not for public distribution.
