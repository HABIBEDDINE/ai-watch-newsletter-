# AI Watch — V3

Strategic AI technology intelligence platform. Monitor trends, track competitors, and surface actionable insights — powered by AI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 6, Recharts, jsPDF |
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
├── backend/          # FastAPI app
│   ├── main.py       # App entry point, mounts routers
│   ├── api.py        # Core API routes (feed, reports, newsletter, …)
│   ├── auth.py       # Auth router (register, login, Google OAuth, JWT)
│   ├── db.py         # Supabase client
│   ├── ingestion.py  # News ingestion from multiple sources
│   ├── summarizer.py # OpenAI-powered article summaries
│   ├── newsletter.py # Newsletter generation & SMTP delivery
│   └── scheduler.py  # Background tasks
├── frontend/         # React app (CRA)
│   ├── public/
│   └── src/
│       ├── App.js
│       ├── context/
│       │   └── AuthContext.jsx   # JWT + localStorage session management
│       ├── pages/
│       │   ├── LoginPage.jsx     # Responsive login (xs/sm/md/lg)
│       │   ├── RegisterPage.jsx
│       │   ├── Reports.jsx       # Per-user reports (max 30)
│       │   ├── Newsletter.jsx
│       │   ├── Trends.jsx
│       │   └── …
│       ├── services/api.js       # API client
│       └── setupProxy.js         # CRA dev proxy → localhost:8000
└── config/
    └── .env          # All secrets (not committed)
```

---

## Features

- **News Feed** — live AI news from NewsAPI + NewsData.io, filtered by persona (CTO, Innovation, Strategy)
- **AI Summaries** — GPT-4o summaries with urgency signals and DXC solution matching
- **Trends** — AI trend tracking with category filters and deep-dive analysis
- **Reports** — per-user saved reports (max 30), PDF export via jsPDF
- **Newsletter** — personalised AI briefings sent to the logged-in user's email
- **Auth** — email/password + Google OAuth, JWT access tokens (15 min), rotating refresh tokens (7 days)
- **Responsive UI** — fully responsive across mobile (xs/sm), tablet (md), and desktop (lg)

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
  email text unique not null,
  full_name text,
  password_hash text,
  company text,
  role text default 'other',
  oauth_provider text,
  oauth_id text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

-- Refresh tokens (rotating)
create table if not exists refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- Password reset tokens
create table if not exists password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

-- Reports (per-user, max 30)
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  title text,
  content jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_reports_user_id on reports(user_id);

-- Newsletter subscribers
create table if not exists newsletter_subscribers (
  email text primary key,
  subscribed_at timestamptz default now()
);
```

### 4. Google OAuth — required redirect URI

In [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your OAuth 2.0 Client:

Add `http://localhost:3000/api/auth/google/callback` as an **Authorised redirect URI**.

### 5. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 6. Start the frontend

```bash
cd frontend
npm install
npm start
```

The app runs at **http://localhost:3000**. All `/api/*` requests are proxied to the backend at `localhost:8000` via `setupProxy.js`.

---

## Auth Architecture

```
Login / Register
       │
       ▼
POST /api/auth/login  ──►  Backend issues:
                            • Access token (JWT, 15 min) — returned in body
                            • Refresh token (opaque, 7 days) — HTTP-only cookie
       │
       ▼
AuthContext.applyToken()
  • Decodes JWT payload (base64url → base64 → JSON)
  • Stores access token in localStorage (key: aiwatch_at)
  • Schedules silent refresh 60s before expiry

Page reload (Ctrl+R)
  • Fast path: reads localStorage → token valid → session restored instantly
  • Slow path: calls POST /api/auth/refresh (cookie) → rotates token
  • OAuth path: ?token= in URL → applyToken() → cookie exchange (best-effort)
```

---

## API Reference (key endpoints)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | Create account |
| `POST` | `/api/auth/login` | — | Email/password login |
| `POST` | `/api/auth/logout` | — | Revoke refresh token |
| `POST` | `/api/auth/refresh` | cookie | Rotate refresh token |
| `GET` | `/api/auth/google` | — | Start Google OAuth |
| `GET` | `/api/auth/google/callback` | — | OAuth callback |
| `POST` | `/api/auth/forgot-password` | — | Send reset link |
| `POST` | `/api/auth/reset-password` | — | Confirm new password |
| `GET` | `/api/users/me` | Bearer | Current user profile |
| `GET` | `/api/feed` | — | AI news feed |
| `GET` | `/api/reports` | Bearer | User's saved reports |
| `POST` | `/api/reports` | Bearer | Save report (max 30) |
| `DELETE` | `/api/reports/{id}` | Bearer | Delete own report |
| `POST` | `/api/newsletter/send` | Bearer | Send brief to own email |
| `GET` | `/api/trends` | — | AI trend data |

---

## License

Internal / DXC Technology — not for public distribution.
