# AI Trends Page — Complete Technical Documentation (V4.2)

## Overview

The Trends page (`/trends`) displays real-time AI trend intelligence using a **multi-source free pipeline**:

| Source | API | Cost |
|--------|-----|------|
| HackerNews | Algolia Search API | FREE |
| Reddit | Public JSON API | FREE |
| arXiv | XML/Atom API | FREE |
| GitHub | Trending RSS + Topics API | FREE |
| RSS Feeds | 10+ newsletters | FREE |
| GPT-4o-mini | Clustering only | ~$0.01/day |
| Perplexity | Deep-dive only | ~$0.005/click |

**Total: ~$0.30-0.50/month** (was ~$9-15/month)

---

## Architecture Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DAILY REFRESH (8:00 AM UTC)                              │
│                                                                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │ HackerNews  │  │   Reddit    │  │   arXiv     │  │   GitHub    │            │
│   │ Algolia API │  │ Public JSON │  │  XML API    │  │  Trending   │            │
│   │    (HN)     │  │    (RD)     │  │    (AX)     │  │    (GH)     │            │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│          │                │                │                │                    │
│          └────────────────┼────────────────┼────────────────┘                    │
│                           │                │                                     │
│                           ▼                ▼                                     │
│                    ┌─────────────┐  ┌─────────────┐                             │
│                    │  Extra RSS  │  │  Scheduler  │                             │
│                    │ Newsletters │  │  RSS Feeds  │                             │
│                    │    (NL)     │  │    (NL)     │                             │
│                    └──────┬──────┘  └──────┬──────┘                             │
│                           │                │                                     │
│                           └────────┬───────┘                                     │
│                                    ▼                                             │
│                         ┌──────────────────┐                                    │
│                         │  fetch_all_free  │                                    │
│                         │    _sources()    │                                    │
│                         │  ~76 items/day   │                                    │
│                         └────────┬─────────┘                                    │
│                                  ▼                                               │
│                         ┌──────────────────┐                                    │
│                         │   GPT-4o-mini    │                                    │
│                         │   Clustering     │                                    │
│                         │  (~$0.01/day)    │                                    │
│                         └────────┬─────────┘                                    │
│                                  ▼                                               │
│                         ┌──────────────────┐      ┌──────────────────┐          │
│                         │    Supabase      │      │    Frontend      │          │
│                         │  trends table    │─────▶│   /trends page   │          │
│                         └──────────────────┘      └──────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                         DEEP DIVE (On-Demand)                                    │
│                                                                                  │
│  User clicks     ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│  "Deep Dive" ───▶│  Check DB    │──▶│  If cached   │──▶│  Return      │         │
│                  │  cache       │   │  with sources│   │  immediately │         │
│                  └──────────────┘   └──────────────┘   └──────────────┘         │
│                         │                                                        │
│                         │ Cache miss                                             │
│                         ▼                                                        │
│                  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│                  │  Perplexity  │──▶│  GPT-4o-mini │──▶│  Save to DB  │         │
│                  │  Research    │   │  Structure   │   │  + Return    │         │
│                  │  (~$0.005)   │   │  (~$0.005)   │   │              │         │
│                  └──────────────┘   └──────────────┘   └──────────────┘         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Data Sources (All FREE)

### 1.1 HackerNews — Algolia API

**File**: `backend/free_sources.py` → `fetch_hackernews_items()`

**Endpoint**: `https://hn.algolia.com/api/v1/search`

**Queries**:
```python
SEARCHES = [
    "LLM GPT Claude Gemini",
    "AI agent autonomous",
    "open source model llama mistral",
    "RAG vector database embedding",
    "AI coding cursor copilot",
]
```

**Filters**:
- Last 7 days
- Points > 10
- 8 results per query

**Output**: `{ title, summary, url, source: "Hacker News", channel: "HN", score }`

---

### 1.2 Reddit — Public JSON API

**File**: `backend/free_sources.py` → `fetch_reddit_items()`

**Endpoint**: `https://www.reddit.com/r/{subreddit}/top.json`

**Subreddits**:
```python
SUBREDDITS = [
    "MachineLearning",
    "LocalLLaMA",
    "artificial",
    "singularity",
    "ChatGPT",
]
```

**Filters**:
- Time: `week`
- Score > 100 upvotes
- 10 posts per subreddit

**Output**: `{ title, summary, url, source: "Reddit r/...", channel: "RD", score }`

---

### 1.3 arXiv — XML API

**File**: `backend/free_sources.py` → `fetch_arxiv_items()`

**Endpoint**: `https://export.arxiv.org/api/query`

**Categories**:
```python
SEARCHES = [
    ("cat:cs.AI", "AI"),
    ("cat:cs.LG", "Machine Learning"),
    ("cat:cs.CL", "NLP/LLMs"),
    ("ti:LLM+OR+ti:agent+OR+ti:transformer", "LLM Research"),
]
```

**Params**:
- sortBy: `submittedDate`
- max_results: 8 per category
- 3 second delay between requests (arXiv requirement)

**Output**: `{ title: "[Research] ...", summary, url, source: "arXiv (...)", channel: "AX" }`

---

### 1.4 GitHub — Trending RSS + Topics API

**File**: `backend/free_sources.py` → `fetch_github_trending()`

**Method 1 — RSS**:
```python
RSS_URLS = [
    "https://github-trending-rss.vercel.app/daily/python",
    "https://github-trending-rss.vercel.app/daily",
]
```

**Method 2 — Topics API**:
```python
AI_TOPICS = ["llm", "ai-agents", "rag", "large-language-models"]
# Endpoint: https://api.github.com/search/repositories
```

**AI Keywords Filter**:
```python
AI_KEYWORDS = [
    'llm', 'ai', 'gpt', 'claude', 'llama', 'model',
    'agent', 'rag', 'vector', 'embedding', 'transformer',
    'neural', 'diffusion', 'stable', 'openai', 'hugging',
    'langchain', 'copilot', 'cursor', 'ollama', 'mistral',
]
```

**Output**: `{ title: "[GitHub] ...", summary, url, source: "GitHub", channel: "GH" }`

---

### 1.5 Extra RSS Feeds

**File**: `backend/free_sources.py` → `fetch_extra_rss()`

**Feeds**:
```python
EXTRA_RSS_FEEDS = [
    ("https://www.artificialintelligence-news.com/feed/", "AI News"),
    ("https://feeds.feedburner.com/AIWeekly", "AI Weekly"),
    ("https://news.google.com/rss/search?q=LLM+language+model", "Google News LLM"),
    ("https://news.google.com/rss/search?q=AI+agent+enterprise", "Google News Agents"),
    ("https://news.google.com/rss/search?q=open+source+AI+model", "Google News OSS"),
]
```

**Output**: `{ title, summary, url, source, channel: "NL" }`

---

### 1.6 Scheduler RSS Feeds

**File**: `backend/scheduler.py` → `fetch_rss_articles()`

**Feeds**:
```python
RSS_FEEDS = [
    {"name": "MIT Tech Review AI", "url": "..."},
    {"name": "VentureBeat AI", "url": "..."},
    {"name": "The Verge AI", "url": "..."},
    {"name": "Ars Technica AI", "url": "..."},
    {"name": "Hacker News", "url": "hnrss.org/..."},
    {"name": "Google News AI", "url": "..."},
    {"name": "TechCrunch AI", "url": "..."},
    {"name": "arXiv AI", "url": "..."},
    {"name": "OpenAI Blog", "url": "..."},
    {"name": "Anthropic News", "url": "..."},
]
```

---

## 2. Aggregation & Clustering

### 2.1 Main Aggregation Function

**File**: `backend/free_sources.py` → `fetch_all_free_sources()`

```python
async def fetch_all_free_sources() -> list:
    results = await asyncio.gather(
        fetch_hackernews_items(),   # HN Algolia
        fetch_reddit_items(),       # Reddit JSON
        fetch_arxiv_items(),        # arXiv XML
        fetch_github_trending(),    # GitHub
        fetch_extra_rss(),          # Extra RSS
        return_exceptions=True
    )
    # Deduplicate by URL and title
    # Returns ~70-100 items
```

### 2.2 GPT-4o-mini Clustering

**File**: `backend/trends_service.py` → `cluster_free_sources()`

**Prompt Features**:
- Multi-channel weighting (HN+RD = strong signal)
- Requires specific tool/model names in topics
- arXiv = research signal, GitHub = developer adoption

**Scoring**:
| Score | Criteria |
|-------|----------|
| 9-10 | 3+ channels confirm, breaking development |
| 7-8 | 2+ channels, strong community interest |
| 5-6 | Single channel, emerging signal |
| 3-4 | Research only (arXiv), not mainstream |

**Output**: 15-20 trends with:
```json
{
  "topic": "Llama 4 Multimodal Release",
  "summary": "...",
  "category": "llm_models",
  "score": 9,
  "momentum": "+45%",
  "channels": ["HN", "RD", "NL"],
  "tags": ["meta", "multimodal", "open-source"],
  "url": "...",
  "detected_at": "2026-04-16T08:00:00Z"
}
```

---

## 3. Database Schema

### 3.1 Supabase `trends` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | text (PK) | Format: `trend_{index}_{YYYYMMDDHHMM}` |
| `category` | text | One of 6 category slugs |
| `topic` | text | Short trend name |
| `data` | jsonb | Full trend object |
| `deepdive` | text | JSON string of deep dive |
| `watchlisted` | boolean | User saved this trend |
| `user_role` | text | Role for deep dive |
| `generated_date` | date | Date generated |
| `detected_at` | timestamp | When detected |
| `created_at` | timestamp | Auto-generated |

### 3.2 Trend Data Object

```json
{
  "id": "trend_0_202604161030",
  "topic": "Claude 4 Opus Enterprise Release",
  "category": "llm_models",
  "score": 9,
  "momentum": "+45%",
  "summary": "...",
  "tags": ["anthropic", "enterprise"],
  "url": "https://...",
  "channels": ["HN", "NL", "RD"],
  "detected_at": "2026-04-16T10:30:00Z",
  "saved": false,
  "deep_dive": null
}
```

### 3.3 Deep Dive Object

```json
{
  "what_it_is": "...",
  "enterprise_impact": "...",
  "action_plan": "...",
  "sources": [
    {
      "number": 1,
      "title": "Article Title",
      "url": "https://...",
      "publisher": "TechCrunch",
      "snippet": "..."
    }
  ]
}
```

---

## 4. Backend API Endpoints

### 4.1 GET `/api/trends`

Returns all cached trends.

**Query Params**: `?category=llm_models`

**Response**:
```json
{
  "trends": [...],
  "total": 15,
  "last_updated": "2026-04-16T08:00:00Z",
  "categories": [
    {"id": "llm_models", "label": "LLM Models", "icon": "🧠"}
  ]
}
```

### 4.2 GET `/api/trends/personalized`

Returns role-tailored trends.

**Query Params**: `?role=cto&topics=llm_models,ai_agents`

**Role Prompts**:
| Role | Focus |
|------|-------|
| `cto` | Technical feasibility, integration, security |
| `innovation_manager` | Use cases, pilots, competitive advantage |
| `strategy_director` | Market positioning, ROI, roadmaps |

### 4.3 POST `/api/trends/refresh`

Triggers manual refresh.

**Logic**:
1. Check DB freshness (< 6 hours → return cached)
2. Fetch from all free sources
3. Cluster with GPT-4o-mini
4. Save to Supabase
5. Cleanup trends > 30 days

### 4.4 POST `/api/trends/{trend_id}/deepdive`

Generate or return cached deep dive.

**Query Params**: `?role=cto`

**Caching**:
- Checks DB for existing deep dive (same role)
- If found with `sources` array → return cached
- If cache miss → Perplexity + GPT-4o-mini → save to DB

### 4.5 POST/DELETE `/api/trends/{trend_id}/save`

Toggle watchlist.

### 4.6 GET `/api/trends/saved`

Return all watchlisted trends.

### 4.7 GET `/api/trends/test-sources`

Test each source independently.

**Response**:
```json
{
  "summary": "5/5 sources OK, 76 total items",
  "sources": {
    "hackernews": {"status": "ok", "count": 5},
    "reddit": {"status": "ok", "count": 5},
    "arxiv": {"status": "ok", "count": 24},
    "github": {"status": "ok", "count": 18},
    "extra_rss": {"status": "ok", "count": 24}
  }
}
```

---

## 5. Scheduled Jobs

**File**: `backend/scheduler.py`

| Job | Time (UTC) | Function |
|-----|------------|----------|
| Daily Ingestion | 00:00 | `scheduled_daily_ingest()` |
| Daily Newsletter | 07:00 | `scheduled_daily_newsletter()` |
| **Daily Trends** | **08:00** | `scheduled_daily_trends()` |
| Hourly Alerts | Every :00 | `scan_and_send_alerts()` |

### 5.1 Trends Job Flow

```python
def scheduled_daily_trends():
    # 1. Fetch from all 5 free sources (~15-20 seconds)
    all_items = fetch_all_free_sources()  # ~76 items

    # 2. Cluster with GPT-4o-mini (~$0.01)
    trends = cluster_free_sources(all_items)  # 15-20 trends

    # 3. Save to Supabase
    for t in trends:
        supabase.table("trends").upsert({...})

    # 4. Cleanup old (> 30 days)
    supabase.table("trends").delete().lt("created_at", cutoff)
```

---

## 6. Frontend Components

### 6.1 File Structure

```
frontend/src/
├── pages/
│   └── Trends.jsx              # Main page
├── components/
│   ├── TrendsOnboarding.jsx    # Role/topic wizard
│   └── CategoryCombobox.jsx    # Filter dropdown
├── services/
│   └── api.js                  # API calls
├── hooks/
│   └── useSaved.js             # Save/unsave
└── context/
    └── AuthContext.jsx         # User state
```

### 6.2 UI Components

| Component | Description |
|-----------|-------------|
| `TopCard` | Large card for top 3 trends |
| `RankedRow` | Compact row for trends 4+ |
| `SignalBadge` | Channel badge (HN, RD, AX, GH, NL) |
| `CategoryPill` | Category badge |
| `MomentumBadge` | EXPLOSIVE / RISING / GROWING |
| `DeepDiveModal` | Full analysis modal |

### 6.3 SignalBadge Component

```jsx
const CHANNEL_CONFIG = {
  NL: { label: "Newsletter", color: "#185EA5", emoji: "📰" },
  HN: { label: "HackerNews", color: "#E35B1A", emoji: "🔶" },
  RD: { label: "Reddit", color: "#FF4500", emoji: "👥" },
  AX: { label: "arXiv", color: "#B31B1B", emoji: "🔬" },
  GH: { label: "GitHub", color: "#238636", emoji: "⭐" },
};

// Usage:
{(trend.channels || []).map(ch => (
  <SignalBadge key={ch} channel={ch} />
))}
```

---

## 7. Onboarding Flow

### 7.1 Two-Step Wizard

**Step 1 — Role Selection**:
| Role | Default Topics |
|------|----------------|
| CTO | llm_models, ai_infrastructure, enterprise_apps |
| Innovation Manager | ai_agents, llm_models, dev_tools |
| Strategy Director | enterprise_apps, llm_models, ai_agents |
| Other | llm_models, ai_agents |

**Step 2 — Topic Selection**:
User customizes which categories to follow.

### 7.2 Persistence

1. `POST /api/users/onboarding` → save to backend
2. Fallback to localStorage:
   - `trends_onboarding_{userId}`
   - `user_role_{userId}`
   - `user_topics_{userId}`

---

## 8. Categories Reference

| ID | Label | Icon | Color |
|----|-------|------|-------|
| `llm_models` | LLM Models | 🧠 | Blue |
| `dev_tools` | Dev & Coding AI | ⌨️ | Sky Blue |
| `ai_agents` | AI Agents | 🤖 | Purple |
| `open_source` | Open Source AI | 🔓 | Green |
| `ai_infrastructure` | AI Infrastructure | ⚙️ | Amber |
| `enterprise_apps` | Enterprise AI Apps | 🏢 | Pink |

---

## 9. Caching Strategy

### 9.1 Three-Layer Cache

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  React State: allTrends, personalizedTrends        │
│  TTL: Session                                       │
├─────────────────────────────────────────────────────┤
│                    BACKEND                          │
│  In-Memory: _trends_cache, _trends_last_updated    │
│  TTL: Until restart or refresh                     │
├─────────────────────────────────────────────────────┤
│                    DATABASE                         │
│  Supabase: trends table, deepdive column           │
│  Trends: 6-hour freshness, 30-day cleanup          │
│  Deep Dives: Indefinite (role-specific)            │
└─────────────────────────────────────────────────────┘
```

---

## 10. Cost Summary

### 10.1 Daily Operations

| Operation | Cost |
|-----------|------|
| HackerNews Algolia | $0.00 |
| Reddit Public JSON | $0.00 |
| arXiv XML API | $0.00 |
| GitHub Trending | $0.00 |
| RSS Feeds (15+) | $0.00 |
| GPT-4o-mini Clustering | ~$0.01 |
| **Daily Total** | **~$0.01** |

### 10.2 On-Demand (Deep Dive)

| Operation | Cost |
|-----------|------|
| Perplexity Research | ~$0.005 |
| GPT-4o-mini Structure | ~$0.005 |
| **Per Deep Dive** | **~$0.01** |
| Cached Deep Dive | $0.00 |

### 10.3 Monthly Estimate

| Scenario | Cost |
|----------|------|
| Daily refresh only | ~$0.30 |
| + 10 deep dives/day | ~$3.30 |
| + 50 deep dives/day | ~$15.30 |
| **Typical usage** | **~$0.50-2.00** |

---

## 11. Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-xxxxx        # GPT-4o-mini
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJxxxxx

# Optional (for deep dives)
PERPLEXITY_API_KEY=pplx-xxxxx

# Feature flags
PERPLEXITY_ENABLED=true
```

---

## 12. Dependencies

```txt
# config/requirements.txt
feedparser==6.0.11
httpx>=0.24.0,<0.25.0
openai>=1.0.0
APScheduler>=3.10.4
supabase>=2.0.0
```

---

## 13. Testing

### 13.1 Test All Sources

```bash
curl http://localhost:8000/api/trends/test-sources
```

Expected:
```json
{
  "summary": "5/5 sources OK, 76 total items",
  "sources": {
    "hackernews": {"status": "ok", "count": 5},
    "reddit": {"status": "ok", "count": 5},
    "arxiv": {"status": "ok", "count": 24},
    "github": {"status": "ok", "count": 18},
    "extra_rss": {"status": "ok", "count": 24}
  }
}
```

### 13.2 Test Endpoints

```bash
# Get trends
curl http://localhost:8000/api/trends

# Get personalized
curl "http://localhost:8000/api/trends/personalized?role=cto"

# Get deep dive
curl -X POST "http://localhost:8000/api/trends/{id}/deepdive?role=cto"

# Save trend
curl -X POST http://localhost:8000/api/trends/{id}/save

# Get saved
curl http://localhost:8000/api/trends/saved
```

---

## 14. Troubleshooting

### 14.1 Sources Returning 0 Items

1. Check SSL: All httpx clients need `verify=False`
2. Check rate limits: Reddit (1s delay), arXiv (3s delay)
3. Check logs: `[HN]`, `[Reddit]`, `[arXiv]`, `[GitHub]` prefixes

### 14.2 Clustering Fails

1. Verify `OPENAI_API_KEY` is set
2. Check item count (need ≥20 items)
3. Check logs: `[Clustering]` prefix

### 14.3 Deep Dive Not Loading

1. Verify `PERPLEXITY_API_KEY` is set
2. Check if cached (old markdown format won't have sources)
3. Check logs: `[DeepDive]` prefix

### 14.4 Personalization Not Working

1. Verify onboarding completed
2. Check `user.role` in AuthContext
3. Check localStorage: `user_role_{userId}`

---

## 15. File Reference

| File | Purpose |
|------|---------|
| `backend/free_sources.py` | 5 free source fetchers |
| `backend/trends_service.py` | Clustering logic |
| `backend/scheduler.py` | Daily 8AM job, RSS feeds |
| `backend/api.py` | API endpoints |
| `frontend/src/pages/Trends.jsx` | Main page + components |
| `frontend/src/components/TrendsOnboarding.jsx` | Role wizard |
| `config/requirements.txt` | Dependencies |
| `config/.env` | API keys |
