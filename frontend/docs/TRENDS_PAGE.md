# AI Trends Page — Complete Technical Documentation (V4.1)

## Overview

The Trends page (`/trends`) displays real-time AI trend intelligence using a **cost-optimized pipeline**:
- **Primary**: Free RSS feeds → GPT-4o-mini clustering (~$0.30/month)
- **Fallback**: Perplexity AI (only if RSS fails)
- **Deep Dive**: Perplexity + GPT-4o-mini with DB caching

Provides enterprise-focused insights across 6 AI categories with personalization based on user role.

---

## Architecture Flow (Cost-Optimized)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DAILY REFRESH (8:00 AM UTC)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐                                                           │
│  │  10 RSS Feeds │──────┐                                                   │
│  │  (FREE)       │      │                                                   │
│  └──────────────┘      │                                                   │
│                         ▼                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │  Google News  │   │  GPT-4o-mini │   │   Supabase   │   │  Frontend   │ │
│  │  HackerNews   │──▶│  Clustering  │──▶│   (trends    │──▶│   React     │ │
│  │  arXiv        │   │  (~$0.01/day)│   │    table)    │   │   /trends   │ │
│  │  TechCrunch   │   └──────────────┘   └──────────────┘   └─────────────┘ │
│  │  VentureBeat  │                                                          │
│  │  MIT Tech Rev │         ▲                                                │
│  │  OpenAI Blog  │         │ Fallback only                                  │
│  │  Anthropic    │   ┌─────┴──────┐                                         │
│  │  The Verge    │   │ Perplexity │                                         │
│  │  Ars Technica │   │ (if <10    │                                         │
│  └──────────────┘   │  RSS items) │                                         │
│                      └────────────┘                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEEP DIVE (On-Demand)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User clicks     ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  "Deep Dive" ───▶│  Check DB    │──▶│  If cached   │──▶│  Return      │    │
│                  │  cache       │   │  with sources│   │  immediately │    │
│                  └──────────────┘   └──────────────┘   └──────────────┘    │
│                         │                                                   │
│                         │ Cache miss                                        │
│                         ▼                                                   │
│                  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│                  │  Perplexity  │──▶│  GPT-4o-mini │──▶│  Save to DB  │    │
│                  │  Research    │   │  Structure   │   │  + Return    │    │
│                  │  (~$0.005)   │   │  (~$0.005)   │   │              │    │
│                  └──────────────┘   └──────────────┘   └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Data Sources & APIs

### 1.1 Free RSS Feeds (Primary Source)

**Purpose**: Fetch real-time AI news at zero cost.

**10 RSS Feeds** (defined in `backend/scheduler.py`):

| Source | URL | Focus |
|--------|-----|-------|
| Google News AI | `news.google.com/rss/search?q=artificial+intelligence` | Broad AI news |
| Hacker News | `hnrss.org/newest?q=AI+OR+LLM+OR+GPT` | Developer community |
| arXiv AI | `export.arxiv.org/rss/cs.AI` | Research papers |
| TechCrunch AI | `techcrunch.com/category/artificial-intelligence/feed/` | Startup news |
| VentureBeat AI | `venturebeat.com/category/ai/feed/` | Enterprise AI |
| MIT Tech Review | `technologyreview.com/topic/artificial-intelligence/feed` | Analysis |
| OpenAI Blog | `openai.com/blog/rss/` | OpenAI releases |
| Anthropic News | `anthropic.com/news/rss` | Anthropic releases |
| The Verge AI | `theverge.com/rss/ai-artificial-intelligence/index.xml` | Consumer AI |
| Ars Technica | `feeds.arstechnica.com/arstechnica/technology-lab` | Tech deep dives |

**Fetch Logic** (`fetch_rss_articles()`):
- Timeout: 15 seconds per feed
- Max articles: 5 per feed (50 total)
- Handles both RSS and Atom formats
- Extracts: title, description, url, source

### 1.2 GPT-4o-mini (Clustering)

**Purpose**: Extract and score trends from RSS articles.

**Configuration**:
```bash
# config/.env
OPENAI_API_KEY=sk-xxxxxxxx
```

**Processing** (`cluster_rss_trends()`):
1. Combines up to 50 RSS articles (8000 char limit)
2. Extracts TOP 12 most important trends
3. Scores each 1-10 for enterprise relevance
4. Generates: topic, category, score, momentum, summary, tags, url

**Cost**: ~$0.01/day (1 API call with ~2K input tokens)

### 1.3 Perplexity AI (Fallback + Deep Dive)

**Purpose**:
- Fallback if RSS returns <10 articles
- Research source for deep dive generation

**Configuration**:
```bash
# config/.env
PERPLEXITY_API_KEY=pplx-xxxxxxxx
```

**API Details**:
- Endpoint: `https://api.perplexity.ai/chat/completions`
- Model: `sonar-pro`
- Timeout: 30 seconds
- Max tokens: 800 per query

**6 Category Queries** (defined in `backend/trends_service.py`):

| Category | Query Focus |
|----------|-------------|
| `llm_models` | GPT, Claude, Gemini, Llama, Mistral releases |
| `dev_tools` | Cursor, GitHub Copilot, Claude Code, Aider |
| `ai_agents` | LangChain, CrewAI, AutoGPT, Microsoft AutoGen |
| `open_source` | Open source models, GitHub trending repos |
| `ai_infrastructure` | RAG, vector DBs, MLOps, GPU cloud |
| `enterprise_apps` | Microsoft Copilot, Salesforce Einstein, SAP AI |

---

## 2. Cost Comparison

### Before Optimization
| Operation | Frequency | Cost |
|-----------|-----------|------|
| Perplexity (6 queries) | Daily | $0.30/day |
| Deep dive (no caching) | Per click | $0.01/click |
| **Monthly Total** | | **~$9-15/month** |

### After Optimization (V4.1)
| Operation | Frequency | Cost |
|-----------|-----------|------|
| RSS feeds | Daily | $0.00 |
| GPT-4o-mini clustering | Daily (1 call) | ~$0.01 |
| Perplexity fallback | Rare | ~$0.00 |
| Deep dive (cached) | First click only | ~$0.01 |
| **Monthly Total** | | **~$0.30-0.50/month** |

**Savings: ~97%**

---

## 3. Database Schema

### 3.1 Supabase `trends` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | text (PK) | Format: `trend_{index}_{YYYYMMDDHHMM}` |
| `category` | text | One of 6 category slugs |
| `topic` | text | Short trend name (max 6 words) |
| `data` | jsonb | Full trend object (see below) |
| `deepdive` | text | JSON string of deep dive content |
| `watchlisted` | boolean | User saved this trend |
| `user_role` | text | Role used for deep dive generation |
| `generated_date` | date | Date trends were generated |
| `detected_at` | timestamp | When trend was first detected |
| `created_at` | timestamp | Auto-generated |

### 3.2 Trend Data Object Structure

```json
{
  "id": "trend_0_202604161030",
  "topic": "Claude 4 Opus Enterprise Release",
  "category": "llm_models",
  "score": 9,
  "momentum": "+45%",
  "summary": "Anthropic's latest model offers 200K context...",
  "tags": ["anthropic", "enterprise", "context-window"],
  "url": "https://example.com/article",
  "detected_at": "2026-04-16T10:30:00Z",
  "saved": false,
  "deep_dive": null
}
```

### 3.3 Deep Dive Object Structure

```json
{
  "what_it_is": "Claude 4 Opus is Anthropic's flagship model...",
  "enterprise_impact": "For CTOs, this means reduced latency...",
  "action_plan": "1. Evaluate against current GPT-4 deployment...",
  "sources": [
    {
      "number": 1,
      "title": "Anthropic Announces Claude 4",
      "url": "https://anthropic.com/news/claude-4",
      "publisher": "Anthropic Blog",
      "snippet": "Today we're announcing..."
    }
  ]
}
```

---

## 4. Backend API Endpoints

### 4.1 GET `/api/trends`

**Purpose**: Returns all cached trends, optionally filtered by category.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter by category slug (optional) |

**Response**:
```json
{
  "trends": [...],
  "total": 12,
  "last_updated": "2026-04-16T08:00:00Z",
  "categories": [
    {"id": "llm_models", "label": "LLM Models", "icon": "🧠"},
    ...
  ]
}
```

### 4.2 GET `/api/trends/personalized`

**Purpose**: Returns trends tailored to user's role with role-specific insights.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `role` | string | `cto`, `innovation_manager`, `strategy_director`, `other` |
| `topics` | string | Comma-separated topic IDs |

**Response**: Same as `/api/trends` but trends include `role_insight` field.

**Role Prompts** (defined in `api.py`):
- **CTO**: Focus on technical feasibility, integration complexity, security
- **Innovation Manager**: Focus on use cases, pilot opportunities, competitive advantage
- **Strategy Director**: Focus on market positioning, ROI, transformation roadmaps

### 4.3 POST `/api/trends/refresh`

**Purpose**: Triggers a trend refresh with cost optimization.

**Logic** (V4.1):
1. Checks if DB has trends < 6 hours old → returns cached
2. Fetches RSS articles from 10 free feeds
3. If ≥10 RSS articles → clusters with GPT-4o-mini (FREE path)
4. If <10 RSS articles → falls back to Perplexity (PAID path)
5. Saves to Supabase
6. Deletes trends > 30 days old

**Response**:
```json
{
  "trends": [...],
  "total": 12,
  "message": "Refreshed 12 trends"
}
```

### 4.4 POST `/api/trends/{trend_id}/deepdive`

**Purpose**: Generates or returns cached deep dive analysis.

**Query Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `role` | string | User role for tailored content |

**Caching Logic**:
1. Checks DB for existing deep dive (same role)
2. If found with `sources` array → returns cached immediately
3. If old markdown format or missing → regenerates
4. Calls Perplexity for research
5. Calls GPT-4o-mini to structure into 3 sections + sources
6. Saves JSON to DB `deepdive` column
7. Returns structured deep dive

**Response**:
```json
{
  "deep_dive": {
    "what_it_is": "...",
    "enterprise_impact": "...",
    "action_plan": "...",
    "sources": [...]
  }
}
```

### 4.5 POST/DELETE `/api/trends/{trend_id}/save`

**Purpose**: Toggle watchlist status for a trend.

**POST**: Sets `watchlisted=true` in DB
**DELETE**: Sets `watchlisted=false` in DB

### 4.6 GET `/api/trends/saved`

**Purpose**: Returns all watchlisted trends.

---

## 5. Backend Services

### 5.1 trends_service.py

**Key Functions**:

| Function | Purpose |
|----------|---------|
| `cluster_rss_trends(articles)` | NEW: Extract trends from RSS using GPT-4o-mini |
| `refresh_trends(rss_articles)` | Main refresh — RSS-first, Perplexity fallback |
| `fetch_perplexity_trend(query, cat)` | Single Perplexity API call |
| `cluster_and_score_trends(raw)` | Cluster Perplexity responses |
| `get_cached_trends()` | Return in-memory cache |

**In-Memory Cache**:
```python
_trends_cache = []           # List of trend objects
_trends_last_updated = None  # ISO timestamp
```

### 5.2 scheduler.py

**Scheduled Jobs**:

| Job | Trigger | Function |
|-----|---------|----------|
| Daily Ingestion | 00:00 UTC | `scheduled_daily_ingest()` |
| Daily Newsletter | 07:00 UTC | `scheduled_daily_newsletter()` |
| **Daily Trends** | **08:00 UTC** | `scheduled_daily_trends()` |
| Hourly Alerts | Every :00 | `scan_and_send_alerts()` |

**Trends Job Flow**:
```python
def scheduled_daily_trends():
    # 1. Fetch RSS (FREE)
    rss_articles = fetch_rss_articles()  # 10 sources, 50 articles

    # 2. Cluster with GPT-4o-mini (~$0.01)
    trends = refresh_trends(rss_articles)  # RSS-first, Perplexity fallback

    # 3. Save to Supabase
    for t in trends:
        supabase.table("trends").upsert({...}).execute()

    # 4. Cleanup old (>30 days)
    supabase.table("trends").delete().lt("created_at", cutoff).execute()
```

---

## 6. Frontend Components

### 6.1 File Structure

```
src/
├── pages/
│   └── Trends.jsx              # Main trends page
├── components/
│   ├── TrendsOnboarding.jsx    # Role/topic selection wizard
│   └── CategoryCombobox.jsx    # Category filter dropdown
├── services/
│   └── api.js                  # API calls
├── hooks/
│   └── useSaved.js             # Save/unsave functionality
└── context/
    └── AuthContext.jsx         # User state (role, topics)
```

### 6.2 Main Page Component (`Trends.jsx`)

**State Variables**:
```javascript
const [allTrends, setAllTrends] = useState([]);           // All trends from API
const [personalizedTrends, setPersonalizedTrends] = useState([]); // Role-filtered
const [loading, setLoading] = useState(true);
const [category, setCategory] = useState("all");          // Filter selection
const [diveModal, setDiveModal] = useState(null);         // Deep dive modal state
const [loadingDive, setLoadingDive] = useState(null);     // Loading indicator
const [showOnboarding, setShowOnboarding] = useState(false);
const [lastUpdated, setLastUpdated] = useState(null);     // Last refresh time
```

**Key Functions**:

| Function | Purpose |
|----------|---------|
| `loadTrends()` | Fetches trends from `/api/trends` on mount |
| `loadPersonalizedTrends()` | Fetches role-specific trends if onboarded |
| `handleDeepDive(trend)` | Opens modal and fetches deep dive content |
| `handleSave(trend)` | Toggles watchlist via `useSaved` hook |
| `handleOnboardingComplete()` | Closes onboarding and reloads |

### 6.3 UI Components

| Component | Description |
|-----------|-------------|
| `TopCard` | Large card for top 3 trends with full details |
| `RankedRow` | Compact row for trends 4+ |
| `RankCircle` | Numbered circle (1-12) |
| `CategoryPill` | Colored badge showing trend category |
| `MomentumBadge` | Shows EXPLOSIVE/RISING/GROWING based on score |
| `TagPill` | Small tag badge |
| `DeepDiveModal` | Full-screen modal with structured analysis |
| `SkeletonCard` | Loading placeholder |

### 6.4 Status Indicator

Shows in page header:
```jsx
<div style={{ fontSize: 13, color: "var(--text-muted)" }}>
  Updated daily at 8:00 AM UTC
  {lastUpdated && (
    <span>• Last refresh: {new Date(lastUpdated).toLocaleTimeString()}</span>
  )}
</div>
```

---

## 7. Onboarding Component (`TrendsOnboarding.jsx`)

### 7.1 Two-Step Wizard

**Step 1 - Role Selection**:
| Role ID | Title | Default Topics |
|---------|-------|----------------|
| `cto` | CTO / Tech Leader | llm_models, ai_infrastructure, enterprise_apps |
| `innovation_manager` | Innovation Manager | ai_agents, llm_models, dev_tools |
| `strategy_director` | Strategy Director | enterprise_apps, llm_models, ai_agents |
| `other` | Other / General | llm_models, ai_agents |

**Step 2 - Topic Selection**:
User can customize which of the 6 categories to follow.

### 7.2 Data Persistence

1. Calls `POST /api/users/onboarding` to save to backend
2. Falls back to localStorage if API fails:
   - `trends_onboarding_{userId}`: "completed" or "skipped"
   - `user_role_{userId}`: role ID
   - `user_topics_{userId}`: JSON array of topic IDs

---

## 8. API Service Layer (`api.js`)

### 8.1 Trend-Related Functions

```javascript
// Fetch all trends (optionally filtered)
export async function getTrends(category) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.append("category", category);
  return request(`/api/trends?${params}`);
}

// Fetch personalized trends
export async function getPersonalizedTrends(role, topics = []) {
  const params = new URLSearchParams();
  if (role) params.append("role", role);
  if (topics.length > 0) params.append("topics", topics.join(","));
  return request(`/api/trends/personalized?${params}`);
}

// Generate deep dive (uses DB cache)
export async function getDeepDive(trendId, role = null) {
  const params = role ? `?role=${role}` : "";
  return request(`/api/trends/${trendId}/deepdive${params}`, { method: "POST" });
}

// Save/unsave trend
export async function saveTrend(trendId) {
  return request(`/api/trends/${trendId}/save`, { method: "POST" });
}

export async function unsaveTrend(trendId) {
  return request(`/api/trends/${trendId}/save`, { method: "DELETE" });
}
```

### 8.2 Request Configuration

- **Retries**: 2 attempts with 700ms delay
- **Timeout**: 25 seconds default
- **Auth**: Bearer token from `_token` variable

---

## 9. Caching Strategy

### 9.1 Three-Layer Cache

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  React State: allTrends, personalizedTrends        │
│  Deep dives: trend.deep_dive object                │
│  TTL: Session (until page refresh)                 │
├─────────────────────────────────────────────────────┤
│                    BACKEND                          │
│  In-Memory: _trends_cache, _trends_last_updated    │
│  TTL: Until next refresh or server restart         │
├─────────────────────────────────────────────────────┤
│                    DATABASE                         │
│  Supabase: trends table, deepdive column           │
│  Trends TTL: 6 hours (freshness check)             │
│  Deep Dives TTL: Indefinite (role-specific)        │
│  Cleanup: 30 days                                  │
└─────────────────────────────────────────────────────┘
```

### 9.2 Deep Dive Caching

**Key insight**: Deep dives are expensive (~$0.01 each). Cached indefinitely per role.

```python
# api.py - Deep dive cache check
row = supabase.table("trends").select("deepdive,user_role").eq("id", trend_id).execute()
if cached_dd and (not role or cached_role == user_role):
    parsed = json.loads(cached_dd)
    if "sources" in parsed:  # New JSON format with sources
        return cached  # Hit! No API call needed
```

---

## 10. Categories Reference

| ID | Label | Icon | Color |
|----|-------|------|-------|
| `llm_models` | LLM Models | 🧠 | Blue |
| `dev_tools` | Dev & Coding AI | ⌨️ | Sky Blue |
| `ai_agents` | AI Agents | 🤖 | Purple |
| `open_source` | Open Source AI | 🔓 | Green |
| `ai_infrastructure` | AI Infrastructure | ⚙️ | Amber |
| `enterprise_apps` | Enterprise AI Apps | 🏢 | Pink |

---

## 11. Scoring & Momentum

### 11.1 Score (1-10)

Generated by GPT-4o-mini based on:
- Strategic importance for enterprise adoption
- Market impact and urgency
- Technical maturity

### 11.2 Momentum Labels

| Score | Label | Color |
|-------|-------|-------|
| 9-10 | EXPLOSIVE | Green |
| 7-8 | RISING | Amber |
| 1-6 | GROWING | Blue |

### 11.3 Momentum Percentage

Format: `+XX%` (e.g., "+45%")
Generated by GPT-4o-mini to indicate growth velocity.

---

## 12. Environment Variables

```bash
# Required for trends functionality
OPENAI_API_KEY=sk-xxxxx          # GPT-4o-mini (clustering + deep dive)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxxxx

# Optional (fallback + deep dive research)
PERPLEXITY_API_KEY=pplx-xxxxx    # Only needed for deep dives

# Feature flags
PERPLEXITY_ENABLED=true          # Set to false to disable Perplexity entirely
```

---

## 13. Error Handling

### 13.1 RSS Feed Errors

- Timeout (15s) → Log warning, continue with other feeds
- Parse error → Skip feed, continue with others
- All feeds fail → Fall back to Perplexity

### 13.2 OpenAI Clustering Errors

- Missing API key → Return empty trends array
- JSON parse error → Return empty array
- Unexpected error → Log with stack trace

### 13.3 Perplexity API Errors

- Missing API key → Log error, skip (for deep dives: return "Analysis unavailable")
- Timeout (30s) → Log warning
- Non-200 response → Log full response body

### 13.4 Frontend Error States

- Loading failed → Show error message
- No trends → Show "No trends available" with "refreshed daily at 8:00 AM UTC"
- Deep dive failed → Show "Analysis unavailable" in modal

---

## 14. Troubleshooting

### 14.1 No Trends Showing

1. Check backend logs for `[RSS]` and `[refresh_trends]` entries
2. Verify `OPENAI_API_KEY` is set and valid
3. Check Supabase connection
4. Check if RSS feeds are accessible (network/firewall)
5. Try manual refresh: `POST /api/trends/refresh`

### 14.2 Deep Dive Not Loading

1. Check console for `[DeepDive]` logs
2. Verify `PERPLEXITY_API_KEY` is set (required for deep dives)
3. Verify trend ID exists in database
4. Check if deep dive is cached (may be old markdown format)
5. Force refresh by clicking Deep Dive again

### 14.3 Personalization Not Working

1. Verify user completed onboarding
2. Check `user.role` and `user.trend_topics` in AuthContext
3. Check localStorage for `user_role_{userId}`
4. Verify `/api/trends/personalized` endpoint is working

### 14.4 High API Costs

1. Verify RSS feeds are working (check `[RSS]` logs)
2. Deep dives should be cached — check `deepdive` column in DB
3. If Perplexity fallback is triggering often, add more RSS feeds

---

## 15. Testing Endpoints

```bash
# Get current trends
GET /api/trends

# Get personalized trends
GET /api/trends/personalized?role=cto&topics=llm_models,ai_agents

# Force refresh (will use RSS if available)
POST /api/trends/refresh

# Get deep dive (uses cache if available)
POST /api/trends/trend_0_202604161030/deepdive?role=cto

# Save trend
POST /api/trends/trend_0_202604161030/save

# Get saved trends
GET /api/trends/saved

# Test Perplexity connection (optional)
GET /test-perplexity
```

---

## 16. Dependencies

```txt
# config/requirements.txt
feedparser==6.0.11      # RSS parsing
httpx==0.27.0           # Async HTTP client
openai>=1.0.0           # GPT-4o-mini
APScheduler>=3.10.4     # Scheduled jobs
supabase>=2.0.0         # Database
```

---

## 17. File Reference

| File | Purpose |
|------|---------|
| `backend/scheduler.py` | RSS feeds, scheduled jobs |
| `backend/trends_service.py` | Clustering logic, Perplexity calls |
| `backend/api.py` | API endpoints, deep dive generation |
| `frontend/src/pages/Trends.jsx` | Main page component |
| `frontend/src/components/TrendsOnboarding.jsx` | Role/topic wizard |
| `frontend/src/components/CategoryCombobox.jsx` | Filter dropdown |
| `frontend/src/services/api.js` | API client functions |
| `config/.env` | API keys |
| `config/requirements.txt` | Python dependencies |
