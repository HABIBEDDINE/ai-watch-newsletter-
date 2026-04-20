# AI Watch V4 — Architecture Documentation

Strategic AI technology intelligence platform for DXC Technology. This document provides a complete technical reference for developers maintaining or extending the codebase.

---

## Table of Contents

1. [High-Level Overview](#1-high-level-overview)
2. [Authentication Flow](#2-authentication-flow)
3. [Page-by-Page Guide](#3-page-by-page-guide)
4. [Backend API Reference](#4-backend-api-reference)
5. [Database Schema](#5-database-schema)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Background Jobs](#7-background-jobs)
8. [AI Features](#8-ai-features)
9. [Data Flows](#9-data-flows)
10. [Configuration & Environment](#10-configuration--environment)
11. [Known Issues & Limitations](#11-known-issues--limitations)
12. [Common Development Tasks](#12-common-development-tasks)

---

## 1. High-Level Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React 19)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  AuthContext │  │ ThemeContext │  │ArticleContext│  │  useSaved    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                              ↓ services/api.js                              │
│                     (Bearer token, 5-min cache, retry)                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                        CRA Proxy (localhost:3000 → :8000)
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI + Uvicorn)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   api.py     │  │   auth.py    │  │ scheduler.py │  │ newsletter.py│    │
│  │ (all routes) │  │ (JWT, OAuth) │  │ (APScheduler)│  │ (SMTP email) │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │ ingestion.py │  │summarizer.py │  │trends_service│                      │
│  │ (NewsAPI)    │  │ (GPT cache)  │  │ (clustering) │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Supabase    │  │   OpenAI     │  │   NewsAPI    │  │    Gmail     │    │
│  │ (PostgreSQL) │  │ (GPT-4o-mini)│  │ (articles)   │  │   (SMTP)     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router 6, Recharts, jsPDF, Lucide Icons |
| Backend | FastAPI (Python 3.10+), Uvicorn |
| Database | Supabase (PostgreSQL) |
| Auth | JWT (HS256, 15 min) + HTTP-only refresh cookies (7 days) + Google OAuth 2.0 |
| AI | OpenAI GPT-4o-mini |
| Email | SMTP (Gmail App Password) |
| Scheduling | APScheduler (BackgroundScheduler) |

---

## 2. Authentication Flow

### 2.1 Registration

```
┌─────────────┐     POST /api/auth/register     ┌─────────────┐
│   Browser   │ ──────────────────────────────► │   Backend   │
│             │   {email, password, full_name}  │             │
└─────────────┘                                 └──────┬──────┘
                                                       │
                   1. Validate password (≥8 chars, 1 uppercase, 1 digit)
                   2. Check email not already registered
                   3. Hash password with bcrypt (rounds=12)
                   4. INSERT into `users` table (is_verified=false)
                   5. Auto-subscribe to newsletter_subscribers
                   6. Generate email verification token (24h TTL)
                   7. INSERT into `email_verification_tokens`
                   8. Send verification email via SMTP
                   9. Generate refresh token, store hash in `refresh_tokens`
                  10. Set HTTP-only cookie `refresh_token`
                  11. Return { access_token, user_id, email, role }
```

### 2.2 Login

```
┌─────────────┐      POST /api/auth/login       ┌─────────────┐
│   Browser   │ ──────────────────────────────► │   Backend   │
│             │      {email, password}          │             │
└─────────────┘                                 └──────┬──────┘
                                                       │
                   1. Rate limit check (5 attempts per email per 15 min)
                   2. Lookup user by email in `users` table
                   3. Verify password with bcrypt
                   4. Generate refresh token, store in `refresh_tokens`
                   5. Set HTTP-only cookie `refresh_token` (7 days)
                   6. Generate JWT access token (15 min TTL)
                   7. Return { access_token, expires_in, user }
                                                       │
                                                       ▼
                   Frontend: AuthContext.applyToken()
                   - setApiToken() for api.js requests
                   - Decode JWT payload → set user state
                   - Store in localStorage (key: aiwatch_at)
                   - Schedule silent refresh 60s before expiry
```

### 2.3 Silent Token Refresh

**Trigger conditions:**
1. Timer fires 60s before access token expiry
2. Page reload with valid localStorage token (background refresh)
3. OAuth callback (cookie exchange)

```
┌─────────────┐     POST /api/auth/refresh      ┌─────────────┐
│   Browser   │ ──────────────────────────────► │   Backend   │
│             │   (HTTP-only cookie sent)       │             │
└─────────────┘                                 └──────┬──────┘
                                                       │
                   1. Read `refresh_token` from cookie
                   2. Lookup token_hash in `refresh_tokens`
                   3. Verify not expired
                   4. Delete old token (rotation)
                   5. Generate new refresh token
                   6. Set new HTTP-only cookie
                   7. Return new { access_token }
```

### 2.4 Google OAuth

```
1. User clicks "Continue with Google" button
   ↓
2. GET /api/auth/google → Redirect to Google accounts.google.com
   ↓
3. User authorizes on Google
   ↓
4. Google redirects to GET /api/auth/google/callback?code=...
   ↓
5. Backend exchanges code for tokens, fetches user profile
   ↓
6. Upsert user in `users` table (is_verified=true for OAuth)
   ↓
7. Generate tokens, redirect to frontend: /?token=<access_token>
   ↓
8. AuthContext detects ?token= in URL, calls applyToken()
   ↓
9. Best-effort cookie exchange via POST /api/auth/refresh
```

### 2.5 Route Protection

**Frontend (`ProtectedRoute.jsx`):**
```jsx
if (loading) → Show spinner
if (!user) → Navigate to /login (saves return path)
else → Render children
```

**Protected routes** (require login):
- `/trends`
- `/dxc-newsletter`
- `/dxc-newsletter/:id`
- `/newsletter`
- `/reports`
- `/saved`
- `/profile`
- `/data`

**Public routes** (no auth required):
- `/` (landing)
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password/:token`
- `/verify-email`
- `/feed`
- `/article/:id`

### 2.6 Token Expiry Mid-Session

When a 401 response is received:
1. api.js throws an error
2. Component catches error, may redirect to login
3. AuthContext does NOT auto-retry (user must re-authenticate)

### 2.7 Logout

```javascript
// AuthContext.logout()
1. clearTimeout(refreshTimer)
2. clearApiToken() — removes Bearer header
3. localStorage.removeItem('aiwatch_at')
4. POST /api/auth/logout — revokes refresh token on server
5. Delete refresh_token cookie
6. setToken(null), setUser(null)
```

---

## 3. Page-by-Page Guide

### HomePage — `frontend/src/pages/HomePage.jsx`
**Route:** `/`
**Access:** Public
**Purpose:** Marketing landing page with feature showcase

**Data flow:**
- No API calls on mount
- Static content

**Key features:**
- Hero section with CTA buttons (Login/Get Started)
- Feature cards for AI intelligence, trends, newsletters
- Theme toggle (Sun/Moon icon)
- Footer with links

**Connected to:**
- `/login` — Login button
- `/register` — Get Started button

---

### LoginPage — `frontend/src/pages/LoginPage.jsx`
**Route:** `/login`
**Access:** Public
**Purpose:** Email/password login + Google OAuth

**Data flow:**
- On submit: `AuthContext.login(email, password)`
- On success: redirect to `/feed` or saved return path

**Key features:**
- Split-panel layout: left branding + right form
- Left panel (desktop/tablet):
  - DXC logo (140px width)
  - "AI Watch" title (42px, 800 weight)
  - Feature bullets: 26+ sources, trends, ONETEAM archive
  - Decorative gradient circles
- Right panel:
  - Email/password form with validation
  - "Continue with Google" button → GET /api/auth/google
  - Forgot password link
- **Full light/dark mode support** via `useTheme()`:
  - Theme-aware color palette (`COLORS.dark`, `COLORS.light`)
  - Dynamic backgrounds, text, borders, shadows
  - Form inputs adapt to current theme

**Connected to:**
- `/register` — Create account link
- `/forgot-password` — Forgot password link
- `/feed` — After successful login

---

### RegisterPage — `frontend/src/pages/RegisterPage.jsx`
**Route:** `/register`
**Access:** Public
**Purpose:** Create new account

**Data flow:**
- POST /api/auth/register with form data
- On success: auto-login and redirect

**Key features:**
- Full name, email, password, company fields
- Password requirements validation (client-side)
- Role selector (CTO, Innovation Manager, Strategy Director, Other)

---

### ForgotPasswordPage — `frontend/src/pages/ForgotPasswordPage.jsx`
**Route:** `/forgot-password`
**Access:** Public
**Purpose:** Request password reset email

**Data flow:**
- POST /api/auth/forgot-password
- Backend sends reset link via SMTP

---

### ResetPasswordPage — `frontend/src/pages/ResetPasswordPage.jsx`
**Route:** `/reset-password/:token`
**Access:** Public
**Purpose:** Set new password using reset token

**Data flow:**
- POST /api/auth/reset-password with token + new password

---

### VerifyEmailPage — `frontend/src/pages/VerifyEmailPage.jsx`
**Route:** `/verify-email`
**Access:** Public
**Purpose:** Handle email verification link

**Data flow:**
- GET /api/auth/verify-email?token=...
- On success: show confirmation message

---

### Explore (News Feed) — `frontend/src/pages/Explore.jsx`
**Route:** `/feed`
**Access:** Public (DashboardLayout)
**Purpose:** Browse AI news articles with filters

**Data flow:**
- On mount: `getArticles({ page, topic, signal, ... })`
- On filter change: re-fetch with new params
- Uses `useSaved()` hook for bookmark state

**Key features:**
- Topic filter (AI, Fintech, HealthTech, etc.)
- Signal filter (Strong/Weak)
- Search box
- Pagination
- Bookmark toggle per article
- Grid/List view toggle

**Connected to:**
- `/article/:id` — Click article card

---

### ArticleDetail — `frontend/src/pages/ArticleDetail.jsx`
**Route:** `/article/:id`
**Access:** Public (DashboardLayout)
**Purpose:** Full article view with AI summary

**Data flow:**
- On mount: `getArticle(id)` for base data
- If no summary: `generateSummary(article)` to get AI summary
- `matchSolutions(article)` for DXC solution recommendations

**Key features:**
- AI-generated summary (cached 30 days)
- Key insights extraction
- DXC solution matching with fit scores
- Bookmark button
- Source link

---

### Trends — `frontend/src/pages/Trends.jsx`
**Route:** `/trends`
**Access:** Protected
**Purpose:** AI trend monitoring with deep-dive analysis

**Data flow:**
- On mount: `getTrends(category)` or `getPersonalizedTrends(role)`
- Deep dive: `getDeepDive(trendId, role)` on button click
- Uses `useSaved()` for trend bookmarks

**Key features:**
- Category filter (LLM Models, AI Agents, Dev Tools, etc.)
- Grid/List view toggle with localStorage persistence
- Recommendations section (role-based, horizontal scroll)
- Deep dive modal with AI analysis
- Trend cards with score, momentum, sources
- Bookmark toggle

**Connected to:**
- ProfilePage (for onboarding if not completed)

---

### DxcNewsletterPage — `frontend/src/pages/DxcNewsletterPage.jsx`
**Route:** `/dxc-newsletter`
**Access:** Protected
**Purpose:** Browse DXC ONETEAM newsletter archive

**Data flow:**
- On mount: `getDxcNewsletterFilters()` for filter options
- On mount/filter change: `getDxcNewsletters({ month, category, search })`

**Key features:**
- Month filter dropdown
- Category filter dropdown
- Search box
- 3-column card grid
- Year-based badges (purple 2026, blue 2025)
- Category badges (color-coded)

**Connected to:**
- `/dxc-newsletter/:id` — Click article card

---

### DxcNewsletterDetail — `frontend/src/pages/DxcNewsletterDetail.jsx`
**Route:** `/dxc-newsletter/:id`
**Access:** Protected
**Purpose:** Newsletter article detail with AI journal card

**Data flow:**
- On mount: `getDxcNewsletterById(id)`
- On mount: `getDxcNewsletters({ month })` for adjacent articles
- On mount: `generateDxcJournalCard(id)` for AI-generated summary

**Key features:**
- 3-panel layout:
  - Panel 1 (left): AI journal card (headline, context, key points, stats, takeaway)
  - Panel 2 (center): Full article text + "Read Full Article" modal
  - Panel 3 (right): Zoomable newsletter page image + lightbox
- Previous/Next article navigation
- Skeleton loader while AI generates
- **ImageLightbox component** with:
  - Mouse wheel zoom (1x–5x scale)
  - Drag-to-pan when zoomed (mouse and touch)
  - Pinch-to-zoom on mobile (two-finger gesture)
  - Keyboard controls: arrow keys pan, +/- zoom, 0 reset, Esc close
  - Visual zoom controls: −, percentage, +, reset buttons
  - Hint text when zoomed ("Drag to pan · Scroll to zoom · ↺ to reset")
  - Cursor changes: grab/grabbing based on drag state
  - Previous/Next hidden when zoomed to avoid conflicts

---

### SavedPage — `frontend/src/pages/SavedPage.jsx`
**Route:** `/saved`
**Access:** Protected
**Purpose:** View bookmarked articles and trends

**Data flow:**
- On mount: `getSaved()` or `getSaved(type)` with filter

**Key features:**
- Filter tabs: All / Articles / Trends
- Unified card display
- Remove bookmark button

---

### Reports — `frontend/src/pages/Reports.jsx`
**Route:** `/reports`
**Access:** Protected
**Purpose:** Saved intelligence reports with PDF export

**Data flow:**
- On mount: `getReports(page)`

**Key features:**
- Report list with pagination
- PDF export via jsPDF
- Delete report

---

### Newsletter (Email Builder) — `frontend/src/pages/Newsletter.jsx`
**Route:** `/newsletter`
**Access:** Protected
**Purpose:** 3-step wizard to compose and send email newsletters

**Data flow:**
- Step 1: `getArticles()` for article selection
- Step 2: Local state for config options
- Step 3: `getRecipients()`, `sendNewsletterCompose(payload)`

**Key features:**
- Step 1: Article selector with checkboxes
- Step 2: Config panels (Content, Style, Layout)
- Step 3: Send Now / Schedule / History tabs
- Live email preview panel (300px right side)
- File-backed recipients (`data/recipients.json`)

---

### ProfilePage — `frontend/src/pages/ProfilePage.jsx`
**Route:** `/profile`
**Access:** Protected
**Purpose:** User profile editing and preferences

**Data flow:**
- On mount: uses AuthContext user data
- On save: PUT /api/users/me

**Key features:**
- Hero banner with identity card
- Role selector (2×2 card grid)
- Edit name, company
- Email verification status badge
- Alert preferences (keywords, threshold, enabled)

---

### DataPreview — `frontend/src/pages/DataPreview.jsx`
**Route:** `/data`
**Access:** Protected
**Purpose:** Charts and data tables

**Data flow:**
- Various chart data endpoints

**Key features:**
- Recharts visualizations
- Data tables

---

## 4. Backend API Reference

### Auth (`/api/auth/...`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account, send verification email |
| POST | `/api/auth/login` | No | Email/password login (rate-limited 5/15min) |
| POST | `/api/auth/logout` | No | Revoke refresh token, clear cookie |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token, issue new access token |
| GET | `/api/auth/google` | No | Start Google OAuth flow |
| GET | `/api/auth/google/callback` | No | OAuth callback, creates user if new |
| GET | `/api/auth/verify-email` | No | Verify email via 24h token |
| POST | `/api/auth/resend-verification` | No | Resend verification email (5min cooldown) |
| POST | `/api/auth/forgot-password` | No | Send 15-min reset link |
| POST | `/api/auth/reset-password` | No | Set new password via token |

### Users (`/api/users/...`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/users/me` | Bearer | Get current user profile |
| PUT | `/api/users/me` | Bearer | Update name, company, role (re-issues JWT) |
| POST | `/api/users/onboarding` | Bearer | Save trend preferences, mark onboarding complete |

### Articles (`/api/articles`, `/api/feed`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/feed` | No | Role-personalised article feed |
| GET | `/api/articles` | No | Paginated articles with filters |
| GET | `/api/articles/{id}` | No | Single article + AI summary |
| POST | `/api/summarize` | No | Generate AI summary for article |
| POST | `/api/match-solutions` | No | Match DXC solutions to article |

**Query params for `/api/articles`:**
- `topic` — AI, Fintech, HealthTech, etc.
- `signal` — Strong, Weak
- `industry` — filter by industry
- `search` — text search
- `page`, `page_size` — pagination
- `date_from`, `date_to` — date range

### Trends (`/api/trends/...`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/trends` | No | All trends with category filter |
| GET | `/api/trends/personalized` | No | Role-ranked trends with insights |
| GET | `/api/trends/top` | No | Top 3 trends |
| GET | `/api/trends/saved` | No | Watchlisted trends |
| POST | `/api/trends/refresh` | No | Refresh from all sources |
| GET | `/api/trends/test-sources` | No | Test each source independently |
| POST | `/api/trends/{id}/deepdive` | No | Generate AI deep-dive |
| POST | `/api/trends/{id}/save` | Bearer | Bookmark trend |
| DELETE | `/api/trends/{id}/save` | Bearer | Remove bookmark |
| POST | `/api/trends/generate-all-deepdives` | No | Batch generate deep dives |

**Tables touched:** `trends`, `role_recommendations`

### DXC Newsletter (`/api/dxc-newsletters/...`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/dxc-newsletters` | No | Paginated articles with filters |
| GET | `/api/dxc-newsletters/filters` | No | Available months and categories |
| GET | `/api/dxc-newsletters/{id}` | No | Single article with image URL |
| POST | `/api/dxc-newsletters/{id}/journal-card` | No | Generate AI journal card (cached) |

**Tables touched:** `dxc_newsletter_articles`

### Saved Items (`/api/saved/...`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/saved` | Bearer | List bookmarked items |
| POST | `/api/saved` | Bearer | Bookmark article or trend |
| DELETE | `/api/saved/{item_id}` | Bearer | Remove bookmark |

**Query params:** `?type=article` or `?type=trend`

**Tables touched:** `saved_items`

### Reports (`/api/reports/...`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/reports` | Bearer | Paginated user reports |
| GET | `/api/reports/{id}` | Bearer | Single report |
| POST | `/api/reports` | Bearer | Save new report (max 30 per user) |
| DELETE | `/api/reports/{id}` | Bearer | Delete own report |

**Tables touched:** `reports`

### Newsletter/Email (`/api/newsletter/...`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/newsletter/send` | Bearer | Send newsletter to recipients |
| GET | `/api/newsletter/status` | No | SMTP config status |
| GET | `/api/newsletter/recipients` | No | List from data/recipients.json |
| POST | `/api/newsletter/recipients` | No | Add recipient |
| DELETE | `/api/newsletter/recipients/{email}` | No | Remove recipient |
| GET | `/api/newsletter/schedule` | No | Get saved schedule |
| POST | `/api/newsletter/schedule` | No | Save schedule |
| GET | `/api/newsletter/sent` | No | Send history (in-memory) |
| POST | `/api/newsletter/subscribe` | No | Legacy subscribe |
| DELETE | `/api/newsletter/unsubscribe` | No | Legacy unsubscribe |

### Alerts (`/api/alerts/...`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/alerts/preferences` | Bearer | Get alert config (auto-creates) |
| PUT | `/api/alerts/preferences` | Bearer | Update keywords, threshold, enabled |
| GET | `/api/alerts/unsubscribe/{token}` | No | One-click unsubscribe |

**Tables touched:** `alert_preferences`

### Other Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/recommendations` | No | Role-based trend recommendations |
| GET | `/api/signals/live` | No | Live signal indicators |
| GET | `/api/sectors/top` | No | Top sectors by volume |
| GET | `/api/funding` | No | Paginated funding data |
| GET | `/api/actors` | No | Paginated key actors |
| GET | `/health` | No | Backend liveness check |
| POST | `/api/ingest` | Bearer | Manually trigger ingestion |
| GET | `/api/export/csv` | No | Export articles as CSV |

---

## 5. Database Schema

### `users`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| email | VARCHAR(255) | Unique, lowercase |
| full_name | VARCHAR(255) | Display name |
| company | VARCHAR(255) | Company name |
| role | VARCHAR(50) | cto, innovation_manager, strategy_director, other |
| password_hash | VARCHAR(255) | bcrypt hash (null for OAuth) |
| oauth_provider | VARCHAR(50) | google (or null) |
| oauth_id | VARCHAR(255) | Google user ID |
| is_verified | BOOLEAN | Email verified |
| email_verified_at | TIMESTAMPTZ | When verified |
| trend_topics | TEXT[] | Selected trend topics |
| onboarding_completed | BOOLEAN | Trend onboarding done |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

### `refresh_tokens`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References users.id |
| token_hash | VARCHAR(255) | SHA256 hash of token |
| expires_at | TIMESTAMPTZ | 7 days from creation |
| created_at | TIMESTAMPTZ | Auto |

### `email_verification_tokens`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References users.id |
| token_hash | VARCHAR(255) | SHA256 hash |
| expires_at | TIMESTAMPTZ | 24 hours TTL |
| used_at | TIMESTAMPTZ | When used (null if unused) |
| created_at | TIMESTAMPTZ | Auto |

### `password_reset_tokens`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References users.id |
| token_hash | VARCHAR(255) | SHA256 hash |
| expires_at | TIMESTAMPTZ | 15 minutes TTL |
| used_at | TIMESTAMPTZ | When used |
| created_at | TIMESTAMPTZ | Auto |

### `articles`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID/SERIAL | Primary key |
| url | TEXT | Unique source URL |
| title | TEXT | Article title |
| source | TEXT | Publisher name |
| description | TEXT | Article excerpt |
| summary | TEXT | AI-generated summary (cached) |
| signal_strength | VARCHAR | Strong/Weak |
| relevance | INTEGER | 1-10 score |
| industry | TEXT | Detected industry |
| topic | TEXT | AI, Fintech, etc. |
| ingestion_date | TIMESTAMPTZ | When ingested |

### `trends`

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | Trend identifier |
| topic | TEXT | Trend title |
| category | TEXT | llm_models, ai_agents, etc. |
| data | JSONB | Full trend data blob |
| deepdive | TEXT | JSON string of deep dive |
| deepdive_status | TEXT | null, generating, done, error |
| user_role | TEXT | Role used for generation |
| watchlisted | BOOLEAN | User bookmarked |
| generated_date | DATE | When generated |
| detected_at | TIMESTAMPTZ | When trend detected |
| created_at | TIMESTAMPTZ | Auto |

### `saved_items`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References users.id |
| item_type | VARCHAR(20) | article or trend |
| item_id | TEXT | Article ID or trend ID |
| item_data | JSONB | Snapshot of display fields |
| saved_at | TIMESTAMPTZ | When bookmarked |
| UNIQUE | | (user_id, item_id) |

### `alert_preferences`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References users.id |
| keywords | TEXT[] | Alert keywords |
| min_signal_score | INTEGER | 1-10 threshold |
| enabled | BOOLEAN | Alerts active |
| last_sent_at | TIMESTAMPTZ | Last digest sent |
| unsubscribe_token | TEXT | 64-char hex (auto-generated) |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto |

### `reports`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References users.id |
| title | TEXT | Report title |
| content | JSONB | Report data |
| created_at | TIMESTAMPTZ | Auto |

### `dxc_newsletter_articles`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| page_number | INTEGER | Newsletter page |
| title | TEXT | Article title |
| content | TEXT | Full article text |
| month | TEXT | "March 2026" format |
| month_date | DATE | For sorting |
| category | TEXT | Quality, Business, etc. |
| image_path | TEXT | Filename |
| image_url | TEXT | Supabase Storage URL |
| newsletter_edition | TEXT | Edition name |
| journal_card | TEXT | JSON cache of AI card |
| created_at | TIMESTAMPTZ | Auto |

### `role_recommendations`

| Column | Type | Description |
|--------|------|-------------|
| role | TEXT (PK) | cto, innovation_manager, etc. |
| recommendations | JSONB | Cached recommendations |
| updated_at | TIMESTAMPTZ | Cache timestamp |

### `newsletter_subscribers`

| Column | Type | Description |
|--------|------|-------------|
| email | TEXT (PK) | Subscriber email |
| subscribed_at | TIMESTAMPTZ | Auto |

### `dxc_solutions`

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL (PK) | Auto |
| number | INTEGER | Solution number (1-15) |
| name | TEXT | Solution name |
| description | TEXT | Solution description |

### `solution_matches`

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT (PK) | MD5 hash key |
| matches | JSONB | Cached solution matches |
| created_at | TIMESTAMPTZ | Auto |

---

## 6. Frontend Architecture

### 6.1 Routing Structure

```
App.js (ThemeProvider → AuthProvider → ArticleProvider)
│
├── PUBLIC ROUTES (no auth required)
│   ├── /                    → HomePage
│   ├── /login               → LoginPage
│   ├── /register            → RegisterPage
│   ├── /forgot-password     → ForgotPasswordPage
│   ├── /reset-password/:token → ResetPasswordPage
│   ├── /verify-email        → VerifyEmailPage
│   ├── /feed                → DashboardLayout → Explore
│   └── /article/:id         → DashboardLayout → ArticleDetail
│
└── PROTECTED ROUTES (ProtectedRoute wrapper)
    ├── /trends              → DashboardLayout → Trends
    ├── /dxc-newsletter      → DashboardLayout → DxcNewsletterPage
    ├── /dxc-newsletter/:id  → DashboardLayout → DxcNewsletterDetail
    ├── /newsletter          → DashboardLayout → Newsletter
    ├── /reports             → DashboardLayout → Reports
    ├── /saved               → DashboardLayout → SavedPage
    ├── /profile             → DashboardLayout → ProfilePage
    └── /data                → DashboardLayout → DataPreview
```

### 6.2 State Management

#### AuthContext (`context/AuthContext.jsx`)

**State:**
- `user` — { user_id, role, full_name, email, is_verified, trend_topics, onboarding_completed }
- `token` — JWT access token string
- `loading` — true while checking session

**Methods exposed:**
- `login(email, password)` — POST /api/auth/login
- `logout()` — Clear all auth state
- `silentRefresh()` — POST /api/auth/refresh
- `applyToken(accessToken)` — Set token and decode user
- `updateUser(updates)` — Merge updates into user state

**localStorage key:** `aiwatch_at`

#### ThemeContext (`context/ThemeContext.jsx`)

**State:**
- `theme` — "dark" or "light"

**Methods exposed:**
- `toggleTheme()` — Switch between dark/light
- `setLightTheme()` — Force light
- `setDarkTheme()` — Force dark

**localStorage key:** `aiwatch_theme`

**DOM attribute:** `<html data-theme="dark">`

#### useSaved Hook (`hooks/useSaved.js`)

**State:**
- `saved` — Set of saved item IDs
- `loading` — true while fetching

**Methods:**
- `toggleSave(type, id, data)` — Optimistic add/remove with rollback

**Flow:**
1. On user login: fetch saved items from DB
2. On toggle: optimistic UI update
3. API call in background
4. On error: rollback UI state

### 6.3 API Client (`services/api.js`)

**Base URL:** Empty string (CRA proxy handles /api/*)

**Token handling:**
```javascript
let _token = null;
setApiToken(t) → _token = t
clearApiToken() → _token = null
// All requests include: Authorization: Bearer ${_token}
```

**Request wrapper:**
- Timeout: 25 seconds default
- Retries: 2 (only on timeout)
- Retry delay: 700ms * (attempt + 1)

**5-minute cache (`cachedRequest`):**
- Only caches GET requests
- Cache key: `GET:/api/path?params`
- TTL: 5 minutes
- `invalidateCache(path)` to clear

### 6.4 Theme System

**CSS Variables (index.css):**

| Variable | Dark Mode | Light Mode |
|----------|-----------|------------|
| --bg-primary | #0E1020 | #FFFFFF |
| --bg-surface | #141728 | #F8F9FC |
| --text-primary | #F0F2FF | #0E1020 |
| --text-secondary | #8B91B5 | #4A5068 |
| --accent | #FFB476 | #E84E0F |
| --accent-hover | #F2805E | #C43A00 |
| --border | #1E2340 | #E2E4EE |
| --sidebar-bg | #080A14 | #FFFFFF |

**Theme switching:**
1. ThemeContext.toggleTheme() called
2. Sets `data-theme` attribute on `<html>`
3. CSS variables update automatically
4. Saved to localStorage

**LoginPage theme support (V4.6):**

LoginPage uses inline theme-aware colors via `useTheme()`:

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| bg | #0E1020 | #F8F9FC |
| bgAlt | #080A14 | #FFFFFF |
| text | #F0F2FF | #1A1D2E |
| orange | #FFB476 | #E07830 |
| gradient | #FFB476 → #F2805E | #E07830 → #D65A3A |

---

## 7. Background Jobs

| Job | Schedule | Function | Description |
|-----|----------|----------|-------------|
| Daily Ingest | 00:00 UTC | `scheduled_daily_ingest()` | Fetches 20 articles per topic from NewsAPI |
| Daily Newsletter | 07:00 UTC | `scheduled_daily_newsletter()` | Generates and sends newsletter digest |
| Daily Trends | 08:00 UTC | `scheduled_daily_trends()` | Multi-source fetch + GPT clustering |
| Batch Deep Dives | 09:00 UTC | `scheduled_batch_deepdives()` | Pre-generates deep dives for all trends |
| Alert Scanner | Every hour :00 | `scan_and_send_alerts()` | Checks keywords, sends digest emails |

**Scheduler:** APScheduler BackgroundScheduler (timezone: UTC)

**Startup:** `scheduler.start()` in api.py on_event("startup")

---

## 8. AI Features

### 8.1 Article Summaries

**Trigger:** First view of article detail (if no cached summary)

**Model:** GPT-4o-mini

**Prompt summary:** Extracts key insights, urgency level, industry, market segment, key actors

**Caching:** 30-day in-memory cache (`_SUMMARY_CACHE` in summarizer.py) + persisted to `articles.summary` column

**Cost:** ~$0.001 per summary

### 8.2 Trend Clustering

**Pipeline:**
1. Fetch from 6 sources in parallel:
   - Verified RSS (26 feeds: OpenAI, Anthropic, DeepMind, etc.)
   - HackerNews (Algolia API)
   - Reddit (public JSON)
   - arXiv (XML API)
   - GitHub Trending
   - Extra RSS feeds
2. Deduplicate by title similarity
3. GPT-4o-mini clusters into 8-12 trends
4. Trust-weighted scoring (OFFICIAL 10/10, RESEARCH 8/10, MEDIA 7/10)
5. Save to `trends` table

**Model:** GPT-4o-mini with `response_format={"type": "json_object"}`

**Cost:** ~$0.01/day (~$0.30/month)

### 8.3 Deep Dive Generation

**Trigger:** Manual click on "Deep Dive" button OR nightly batch job

**Model:** GPT-4o-mini

**Prompt structure:**
```
You are a strategic enterprise technology analyst writing for a {role}.
Topic: {topic}
Summary: {summary}
Return JSON: {what_it_is, enterprise_impact, action_plan, sources[]}
```

**Concurrency lock:** `deepdive_status` column prevents duplicate generation
- null → generating (claimed)
- generating → done (complete)
- generating → error (failed)

**Caching:** Stored in `trends.deepdive` column, served instantly on repeat

### 8.4 DXC Newsletter Journal Card

**Trigger:** First visit to newsletter article detail

**Model:** GPT-4o-mini with `response_format={"type": "json_object"}`

**JSON structure returned:**
```json
{
  "headline": "One powerful sentence (max 15 words)",
  "context": "2-3 sentences of business context",
  "key_points": [
    { "label": "Short label", "text": "1-2 sentence explanation" }
  ],
  "stats": [
    { "value": "37M MAD", "label": "Revenue" }
  ],
  "takeaway": "One actionable conclusion sentence"
}
```

**Caching:** Stored in `dxc_newsletter_articles.journal_card` column

### 8.5 Role Recommendations

**Trigger:** GET /api/recommendations?role={role}

**Scoring formula:**
1. Base trend score (from clustering)
2. Multiply by role category weight (ROLE_CATEGORY_WEIGHTS)
3. Generate role-specific insight via GPT (optional)

**Cache:** 6-hour TTL in `role_recommendations` table

---

## 9. Data Flows

### 9.1 User Reads an Article

```
1. User navigates to /article/:id
2. ArticleDetail.jsx mounts
3. getArticle(id) → GET /api/articles/{id}
4. Backend checks if summary exists in DB
5. If no summary:
   a. generateSummary() → POST /api/summarize
   b. GPT-4o-mini generates summary
   c. Saved to articles.summary column
6. matchSolutions() → POST /api/match-solutions
7. Frontend renders full article + summary + solutions
```

### 9.2 User Bookmarks a Trend

```
1. User clicks bookmark icon on TrendCard
2. useSaved.toggleSave("trend", trendId, trendData)
3. Optimistic UI: savedIds.add(trendId) immediately
4. POST /api/saved with item_type="trend"
5. Backend INSERT into saved_items (ON CONFLICT do nothing)
6. On error: rollback UI (remove from savedIds)
```

### 9.3 User Requests a Deep Dive

```
1. User clicks "Deep Dive" button
2. getDeepDive(trendId, role) → POST /api/trends/{id}/deepdive
3. Backend checks deepdive_status:
   a. If "done": return cached deepdive
   b. If null: claim lock (set to "generating")
4. GPT-4o-mini generates analysis
5. Save to trends.deepdive, set status="done"
6. Return JSON to frontend
7. Modal displays formatted deep dive
```

### 9.4 User Sends a Newsletter

```
1. User completes 3-step wizard in Newsletter.jsx
2. Step 1: Select articles
3. Step 2: Configure options
4. Step 3: Click "Send Now"
5. sendNewsletterCompose(payload) → POST /api/newsletter/send
6. Backend:
   a. Read recipients from data/recipients.json
   b. Generate HTML from template
   c. Send via SMTP (Gmail)
7. Return { sent: true, count: N }
```

### 9.5 Alert Digest is Sent

```
1. APScheduler triggers scan_and_send_alerts() every hour
2. Fetch all alert_preferences WHERE enabled=true
3. For each user:
   a. Skip if last_sent_at < 1 hour ago
   b. Fetch new articles since last_sent_at
   c. Filter by min_signal_score
   d. Match keywords (string matching, no AI)
   e. If matches: send_alert_digest() via SMTP
   f. Update last_sent_at
```

### 9.6 New Trends are Generated

```
1. APScheduler triggers scheduled_daily_trends() at 08:00 UTC
2. fetch_all_free_sources() in parallel:
   - Verified RSS, HN, Reddit, arXiv, GitHub
3. Deduplicate by title similarity
4. cluster_free_sources() with GPT-4o-mini
5. UPSERT each trend to trends table
6. Delete trends older than 30 days
7. pre_generate_all_deepdives() for new trends
```

---

## 10. Configuration & Environment

### 10.1 Required Environment Variables (`config/.env`)

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key

# News APIs
NEWS_API_KEY=your-newsapi-key
NEWSDATA_API_KEY=your-newsdata-key

# AI
OPENAI_API_KEY=sk-...
OPENAI_API_KEY_BACKUP=sk-...  # Optional fallback

# Auth
JWT_SECRET=your-random-256-bit-hex-secret
FRONTEND_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=you@gmail.com
SMTP_PASSWORD=abcdabcdabcdabcd  # Gmail App Password (16 chars, no spaces)
SMTP_FROM_EMAIL=you@gmail.com
NEWSLETTER_RECIPIENTS=you@gmail.com
```

### 10.2 Frontend Environment

**API Base URL:** Empty string (all `/api/*` requests proxied)

**Dev proxy (`frontend/src/setupProxy.js`):**
```javascript
// Proxies /api/* and /health to localhost:8000
```

**CRA package.json:**
```json
"proxy": "http://localhost:8000"
```

---

## 11. Known Issues & Limitations

### TODOs in Code

1. **auth.py:422** — `# TODO: send actual email` for password reset (currently just logs URL)

### Hardcoded Values

1. **VALID_ROLES** in auth.py — ["cto", "innovation_manager", "strategy_director", "other"]
2. **TOPICS** in scheduler.py — ["AI", "Fintech", "HealthTech", "Cybersecurity", "CleanTech", "Robotics"]
3. **RSS_FEEDS** in scheduler.py — 10 hardcoded feed URLs

### Deprecated Patterns

1. **on_event** in api.py — FastAPI warns to use lifespan handlers instead
2. **In-memory caches** — `_SUMMARY_CACHE`, `_trends_cache` lost on restart

### Limitations

1. **Send history** — In-memory only, lost on restart
2. **Rate limiting** — In-memory, not distributed
3. **Refresh tokens** — No device tracking
4. **Newsletter schedule** — Saved to file, not DB

---

## 12. Common Development Tasks

### Add a New Page

1. Create `frontend/src/pages/NewPage.jsx`
2. Add route in `frontend/src/App.js`:
   ```jsx
   <Route path="/new-page" element={<ProtectedRoute><DashboardLayout><NewPage /></DashboardLayout></ProtectedRoute>} />
   ```
3. Add sidebar link in `frontend/src/components/layout/Sidebar.jsx`
4. Import the page in App.js

### Add a New API Route

1. Add route in `backend/api.py`:
   ```python
   @app.get("/api/new-endpoint")
   def new_endpoint(request: Request):
       user_id = require_user(request)  # if auth required
       return {"data": "..."}
   ```
2. Add function in `frontend/src/services/api.js`:
   ```javascript
   export async function getNewEndpoint() {
     return request("/api/new-endpoint");
   }
   ```
3. Call from component

### Add a New Supabase Table

1. Write SQL in Supabase SQL Editor:
   ```sql
   CREATE TABLE IF NOT EXISTS new_table (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     ...
   );
   ```
2. Run: `NOTIFY pgrst, 'reload schema';`
3. Use in api.py: `supabase.table("new_table").select("*").execute()`

### Change Theme Accent Color

1. Edit `frontend/src/index.css`:
   ```css
   :root, [data-theme="dark"] {
     --accent: #NEW_COLOR;
   }
   [data-theme="light"] {
     --accent: #NEW_LIGHT_COLOR;
   }
   ```

### Add a New Scheduled Job

1. Add function in `backend/scheduler.py`:
   ```python
   def new_job():
       logger.info("Running new job")
       # ... job logic
   ```
2. Register in `start()`:
   ```python
   scheduler.add_job(
       new_job,
       trigger=CronTrigger(hour=10, minute=0),
       id="new_job",
       replace_existing=True,
   )
   ```

### Deploy

⚠️ No deployment configuration found in codebase. Manual deployment required:

1. Build frontend: `cd frontend && npm run build`
2. Serve backend: `cd backend && uvicorn api:app --host 0.0.0.0 --port 8000`
3. Serve static files from `frontend/build/`
4. Configure reverse proxy (nginx, Cloudflare, etc.)
5. Set production environment variables

---

*Document generated for AI Watch V4.6. Last updated: April 2026.*
