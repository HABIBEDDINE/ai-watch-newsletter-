from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).resolve().parent.parent / "config" / ".env")

from fastapi import FastAPI, Query, BackgroundTasks, Body, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Tuple
import time
import random
import csv
import io
import asyncio
from datetime import datetime, timedelta

from db import supabase

from ingestion import fetch_sector_news
from summarizer import summarize_articles
from main import PRESET_SECTORS
import newsletter as newsletter_module
import scheduler
from trends_service import refresh_trends, get_cached_trends, TREND_QUERIES

app = FastAPI(title="AI Watch API")

from auth import auth_router, users_router, JWT_SECRET, JWT_ALGORITHM
from jose import jwt as _jwt, JWTError
app.include_router(auth_router)
app.include_router(users_router)

def _get_user_id(request: Request) -> Optional[str]:
    """Extract user_id from Bearer token; returns None if missing/invalid."""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        payload = _jwt.decode(auth[7:], JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

def require_user(request: Request) -> str:
    uid = _get_user_id(request)
    if not uid:
        raise HTTPException(401, "Authentication required")
    return uid

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React development server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mock DXC solutions mapping for the frontend 
# (Since the backend summarizer doesn't natively generate these yet)
DXC_SOLUTIONS = [
    {"name": "AI Readiness Assessment", "fit": 94, "timeline": "1–3 weeks", "cta": "Run Assessment"},
    {"name": "Agentic AI Accelerator", "fit": 88, "timeline": "1–2 months", "cta": "Book Assessment"},
    {"name": "AI Use Case Radar", "fit": 76, "timeline": "2–3 weeks", "cta": "Explore"},
    {"name": "Gen AI MVP", "fit": 85, "timeline": "6–10 weeks", "cta": "Schedule Workshop"},
    {"name": "Intelligent Analytics", "fit": 79, "timeline": "1–2 weeks", "cta": "Request Demo"},
    {"name": "Data Framework", "fit": 82, "timeline": "3–6 months", "cta": "Compliance Audit"},
    {"name": "ROI Simulator", "fit": 90, "timeline": "1–2 months", "cta": "Model ROI"},
]

PERSONA_TOPIC_MAP = {
    "cto": "AI",
    "innovation": "Fintech",
    "strategy": "Cybersecurity"
}

DEFAULT_PRODUCT_LIBRARY = {
    "cto": [
        {"name": "AI Readiness Assessment", "score": 94, "fit": "Critical", "desc": "Full AI maturity evaluation across data, infra & governance", "time": "1-3 weeks", "tag": "Quick Start"},
        {"name": "Agentic AI Accelerator", "score": 88, "fit": "High", "desc": "Deploy autonomous workflows for supply chain operations", "time": "1-2 months", "tag": "Competitive Edge"},
        {"name": "AI Use Case Radar", "score": 76, "fit": "Strategic", "desc": "Continuous sector-specific AI trend scanning and alerting", "time": "2-3 weeks", "tag": "Ongoing"},
    ],
    "innovation": [
        {"name": "AI Use Case Radar", "score": 97, "fit": "Critical", "desc": "Sector intelligence for competitive benchmarking", "time": "2-3 weeks", "tag": "Top Match"},
        {"name": "Gen AI MVP", "score": 85, "fit": "High", "desc": "Scalable Generative AI deployment framework with guardrails", "time": "6-10 weeks", "tag": "High Impact"},
        {"name": "Intelligent Analytics", "score": 79, "fit": "Strategic", "desc": "ML and NLP pipeline for market insights", "time": "1-2 weeks", "tag": "Quick Win"},
    ],
    "strategy": [
        {"name": "ROI Simulator", "score": 96, "fit": "Critical", "desc": "Quantify AI investment value with financial modeling", "time": "1-2 months", "tag": "Decision Ready"},
        {"name": "Data Framework", "score": 91, "fit": "Critical", "desc": "Unified governance and EU AI Act compliance architecture", "time": "3-6 months", "tag": "Foundation"},
        {"name": "AI Readiness Assessment", "score": 82, "fit": "High", "desc": "AI maturity benchmark and strategic roadmap", "time": "1-3 weeks", "tag": "Quick Start"},
    ],
}

CACHE_TTL_SECONDS = 180
_summary_cache: Dict[Tuple[str, int, int], dict] = {}
_match_solutions_cache: Dict[str, dict] = {}   # keyed by md5(title|industry)

DXC_SOLUTIONS_CATALOG = [
    "1. Assessment Advisor — Comprehensive evaluation of data & AI landscape with strategy, prioritization & alignment to standards.",
    "2. Data Health — End-to-end platform for data quality with automated validation, monitoring & compliance reporting.",
    "3. Intelligent Analytics — Transform raw data into actionable insights using ML, NLP & advanced statistical models.",
    "4. ROI Simulator — Measure & communicate business value of data & AI investments with proven financial models.",
    "5. Marketing Agents — AI agents orchestration that automates marketing tasks like segmentation & personalized content generation.",
    "6. Incidents Management — Detect, manage & resolve technical incidents with AI anomaly detection & root cause analysis.",
    "7. AI Watch — Strategic intelligence platform analyzing tech trends, startups & innovations for actionable insights.",
    "8. AI Use Case Radar — Cross-industry intelligence tool that scans & prioritizes emerging AI trends and use cases.",
    "9. AI Implementation Framework — Scalable, responsible & business-aligned approach to developing & deploying AI/ML solutions.",
    "10. AI Workbench — Modular architecture to build, manage & scale agent-based AI systems powered by LLMs.",
    "11. AO Handler — Intelligent solution discovering tenders, evaluating eligibility & auto-generating winning proposals.",
    "12. Sandbox AI — Controlled environment to test AI models safely with limited access, risk analysis & audit trails.",
    "13. StartUp Connect AI — AI-powered engine that discovers startups & matches them to business needs with fit scoring.",
    "14. POC Workflow Tool — AI platform that structures & manages the innovation cycle from needs identification to POC decisions.",
    "15. HR Assistant — Conversational AI assistant that manages HR inquiries & integrates seamlessly with ERP/CRM systems.",
]


def get_topic_from_persona(persona: str) -> str:
    return PERSONA_TOPIC_MAP.get(persona, "AI")


def _get_cache_key(persona: str, max_articles: int, days_back: int) -> Tuple[str, int, int]:
    return (persona, max_articles, days_back)


def _get_cached_summary(persona: str, max_articles: int, days_back: int) -> Optional[List[dict]]:
    key = _get_cache_key(persona, max_articles, days_back)
    entry = _summary_cache.get(key)
    if not entry:
        return None

    if (time.time() - entry["ts"]) > CACHE_TTL_SECONDS:
        _summary_cache.pop(key, None)
        return None

    # Return shallow copies so callers do not mutate cache entries.
    return [dict(item) for item in entry["data"]]


def _set_cached_summary(persona: str, max_articles: int, days_back: int, data: List[dict]) -> None:
    key = _get_cache_key(persona, max_articles, days_back)
    _summary_cache[key] = {
        "ts": time.time(),
        "data": [dict(item) for item in data],
    }


def _openai_keys() -> List[str]:
    """Return all configured OpenAI keys in priority order (primary first, backup second)."""
    import os as _os
    keys = []
    for var in ("OPENAI_API_KEY", "OPENAI_API_KEY_BACKUP"):
        k = _os.getenv(var, "").strip()
        if k:
            keys.append(k)
    return keys


def get_summarized_articles(persona: str, max_articles: int, days_back: int = 3) -> List[dict]:
    """Fetch and summarize articles for a persona topic."""
    cached = _get_cached_summary(persona, max_articles, days_back)
    if cached is not None:
        return cached

    topic = get_topic_from_persona(persona)
    sector_queries = {topic: PRESET_SECTORS.get(topic, topic)}

    raw_news = fetch_sector_news(
        sector_queries,
        days_back=days_back,
        max_per_sector=max_articles,
        use_perplexity=False
    )

    articles = raw_news.get(topic, [])
    summarized = summarize_articles(articles) if articles else []
    filtered = [a for a in summarized if a.get('relevance_score', 0) >= 4]
    _set_cached_summary(persona, max_articles, days_back, filtered)
    return filtered


def get_trend_series(articles: List[dict]) -> List[int]:
    """Create a simple 7-day trend line from article relevance and recency."""
    if not articles:
        return [0, 0, 0, 0, 0, 0, 0]

    base = [max(1, len(articles) // 3)] * 7
    for i, a in enumerate(articles[:14]):
        idx = i % 7
        base[idx] += max(1, int(a.get('relevance_score', 5) / 2))
    return base


def get_top_topics(articles: List[dict]) -> List[dict]:
    """Build top topics from article metadata with enriched fields."""
    # Group articles by their primary label
    label_articles: Dict[str, List[dict]] = {}
    for a in articles:
        labels = [
            a.get('industry', ''),
            a.get('market_segment', ''),
        ]
        for label in labels:
            if not label or label in ["Other", "General", "No clear segment", "Unknown", "Signal", ""]:
                continue
            label_articles.setdefault(label, []).append(a)

    if not label_articles:
        # Fallback using signal_type
        for a in articles:
            sig = a.get('signal_type', '')
            if sig and sig not in ["Unknown", "Noise", ""]:
                label_articles.setdefault(sig, []).append(a)

    ranked = sorted(label_articles.items(), key=lambda x: len(x[1]), reverse=True)[:6]
    if not ranked:
        return [
            {"topic": "AI Intelligence", "pct": 72, "delta": "+8%", "source_count": 0,
             "trend_score": 7, "category": "Research", "summary": "No articles available yet.", "key_actors": []},
        ]

    max_count = len(ranked[0][1]) if ranked else 1
    topics = []
    for name, arts in ranked:
        count = len(arts)
        pct = min(99, 40 + int((count / max_count) * 59))
        delta_val = max(1, count * 2)
        # Average relevance → trend score (1–10)
        avg_rel = sum(a.get('relevance_score', 5) for a in arts) / count
        trend_score = min(10, max(1, round(avg_rel)))
        # Category from most common signal type
        sig_counts: Dict[str, int] = {}
        for a in arts:
            s = a.get('signal_type', 'Signal')
            if s not in ["Unknown", "Noise"]:
                sig_counts[s] = sig_counts.get(s, 0) + 1
        category = max(sig_counts, key=sig_counts.get) if sig_counts else "Signal"
        # Best summary (highest relevance article)
        best = max(arts, key=lambda a: a.get('relevance_score', 0))
        raw_summary = best.get('summary', '') or best.get('description', '') or ''
        # Clean up bullet-point summaries from the summarizer
        summary_lines = [l.lstrip('- •').strip() for l in raw_summary.splitlines() if l.strip().startswith('-')]
        summary = summary_lines[0] if summary_lines else raw_summary[:140]
        # Key actors
        actors_raw = best.get('key_actors', '') or ''
        key_actors = [a.strip() for a in actors_raw.replace(';', ',').split(',') if a.strip() and a.strip().lower() != 'none'][:3]

        topics.append({
            "topic": name,
            "pct": pct,
            "delta": f"+{delta_val}%",
            "source_count": count,
            "trend_score": trend_score,
            "category": category,
            "summary": summary,
            "key_actors": key_actors,
        })
    return topics


def get_journey(feed: List[dict], products: List[dict], sector_name: str) -> List[dict]:
    """Generate a lightweight journey timeline."""
    top_signal = feed[0]["title"][:55] + "..." if feed else "No signal opened yet"
    top_product = products[0] if products else {"name": "AI Readiness Assessment", "fit": "High", "score": 80}

    return [
        {"done": True, "title": "Platform Connected", "desc": f"Sector configured: {sector_name}", "time": "Today"},
        {"done": True, "title": "Intelligence Feed Active", "desc": f"{len(feed)} signals detected and filtered", "time": "Today"},
        {"done": len(feed) > 0, "title": "Signal Explored", "desc": top_signal, "time": "Today" if feed else "Pending"},
        {"done": len(products) > 0, "title": "DXC Solution Matched", "desc": f"{top_product['name']} - {top_product['fit']} fit ({top_product['score']}%)", "time": "Today" if products else "Pending"},
        {"done": False, "title": "Schedule Discovery Call", "desc": "30-min session with DXC Data and AI team", "time": "Pending"},
        {"done": False, "title": "Download Sector Brief", "desc": f"Full AI landscape report for {sector_name}", "time": "Pending"},
    ]

def map_article_to_frontend(article_id: int, a: dict) -> dict:
    """Map python backend article format to the React frontend format."""
    
    # Determine urgency based on relevance
    relevance = a.get('relevance_score', 5)
    urgency = "LOW"
    if relevance >= 8:
        urgency = "HIGH"
    elif relevance >= 6:
        urgency = "MEDIUM"
        
    # Generate mock DXC mapping based on the text (random selection for POC)
    random.seed(article_id) # Consistent per article
    dxc = random.choice(DXC_SOLUTIONS).copy()
    dxc['fit'] = min(99, relevance * 10 + random.randint(-5, 5))
    
    # Extract tags
    signals = []
    ind = a.get('industry')
    if ind and ind != "Other":
        signals.append(str(ind))
    
    seg = a.get('market_segment')
    if seg and seg != "General":
        signals.append(str(seg))
        
    sig = a.get('signal_type')
    if sig in ["Weak Signal", "Strong Signal"]:
        signals.append(str(sig))
        
    if not signals:
        signals = ["Tech News"]

    return {
        "id": article_id,
        "urgency": urgency,
        "tag": "Alert",
        "source": a.get("source", "Unknown"),
        "time": "Recent",
        "title": a.get("title", "No Title"),
        "summary": a.get("summary", ""),
        "signals": signals[:3],  # Limit to 3 tags
        "dxc": dxc
    }

@app.get("/api/feed")
def get_feed(persona: str = Query("cto"), max_articles: int = 5):
    """
    Get the intelligence feed for a specific persona or topic.
    Maps to the python backend's existing summarization pipeline.
    """
    
    summarized = get_summarized_articles(persona=persona, max_articles=max_articles, days_back=3)

    mapped_feed = []
    for i, a in enumerate(summarized, 1):
        mapped_feed.append(map_article_to_frontend(i, a))
            
    return {"feed": mapped_feed}


@app.get("/api/radar")
def get_radar(persona: str = Query("cto"), max_articles: int = 8):
    """Get recommended DXC solutions for the persona."""
    summarized = get_summarized_articles(persona=persona, max_articles=max_articles, days_back=5)
    base_products = DEFAULT_PRODUCT_LIBRARY.get(persona, DEFAULT_PRODUCT_LIBRARY["cto"])

    avg_relevance = int(sum(a.get('relevance_score', 5) for a in summarized) / max(1, len(summarized)))
    boost = max(-5, min(8, avg_relevance - 6))

    products = []
    for p in base_products:
        updated = p.copy()
        updated["score"] = max(50, min(99, int(p["score"]) + boost))
        products.append(updated)

    return {"products": products}


_saved_trends: list = []  # kept for in-memory fallback; DB is source of truth


@app.get("/api/trends/top")
def get_top_trends():
    trends, _ = get_cached_trends()
    return {"trends": trends[:3]}


@app.get("/api/trends/saved")
def get_saved_trends():
    """Return watchlisted trends from DB."""
    try:
        resp = supabase.table("trends").select("*").eq("watchlisted", True).execute()
        saved = []
        for row in (resp.data or []):
            t = dict(row.get("data") or {})
            t["watchlisted"] = True
            if row.get("deepdive"):
                t["deep_dive"] = row["deepdive"]
            saved.append(t)
        return {"trends": saved}
    except Exception as e:
        print(f"[DB] get_saved_trends error: {e}")
        return {"trends": []}


@app.get("/api/trends")
def get_trends(category: str = Query(None)):
    trends, last_updated = get_cached_trends()
    if category:
        trends = [t for t in trends if t.get("category") == category]
    categories = [{"id": q["category"], "label": q["label"], "icon": q["icon"]} for q in TREND_QUERIES]
    return {"trends": trends, "total": len(trends), "last_updated": last_updated, "categories": categories}


@app.post("/api/trends/refresh")
async def trigger_trends_refresh():
    """Refresh trends — returns DB cache if < 6h old, else calls Perplexity + saves to DB."""
    # ── 1. Check DB freshness ─────────────────────────────────────────────
    try:
        cutoff_6h = (datetime.utcnow() - timedelta(hours=6)).isoformat()
        fresh = supabase.table("trends").select("*").gte("created_at", cutoff_6h).execute()
        if fresh.data:
            trends_from_db = []
            for row in fresh.data:
                t = dict(row.get("data") or {})
                t["watchlisted"] = row.get("watchlisted", False)
                if row.get("deepdive"):
                    t["deep_dive"] = row["deepdive"]
                trends_from_db.append(t)
            # Populate in-memory cache so deep-dive lookups work
            from trends_service import _trends_cache as _tc
            _tc.clear()
            _tc.extend(trends_from_db)
            return {"trends": trends_from_db, "total": len(trends_from_db), "message": "Returned from DB cache (< 6h old)"}
    except Exception as e:
        print(f"[DB] trends freshness check failed: {e}")

    # ── 2. Fetch fresh trends from Perplexity + GPT ───────────────────────
    trends = await refresh_trends()

    # ── 3. Save to DB + delete trends > 30 days ───────────────────────────
    try:
        for t in trends:
            supabase.table("trends").upsert({
                "id":       t.get("id", ""),
                "category": t.get("category", ""),
                "topic":    t.get("topic", ""),
                "data":     t,
            }).execute()
        cutoff_30d = (datetime.utcnow() - timedelta(days=30)).isoformat()
        supabase.table("trends").delete().lt("created_at", cutoff_30d).execute()
        print(f"[DB] Saved {len(trends)} trends, deleted trends > 30 days")
    except Exception as e:
        print(f"[DB] trends save failed: {e}")

    return {"trends": trends, "total": len(trends), "message": f"Refreshed {len(trends)} trends"}


@app.post("/api/trends/{trend_id}/deepdive")
async def get_trend_deepdive(trend_id: str):
    """Generate or return cached deep-dive from DB."""
    import os as _os

    # ── 1. Check DB for existing deepdive ────────────────────────────────
    db_trend = None
    try:
        row = supabase.table("trends").select("deepdive,data").eq("id", trend_id).limit(1).execute()
        if row.data:
            db_row = row.data[0]
            if db_row.get("deepdive"):
                trend = dict(db_row.get("data") or {})
                trend["deep_dive"] = db_row["deepdive"]
                return trend
            # Trend exists in DB but no deepdive yet — use it to generate one
            db_trend = dict(db_row.get("data") or {})
    except Exception as e:
        print(f"[DB] deepdive check failed: {e}")

    # ── 2. Get trend from in-memory cache (fallback to DB trend) ─────────
    trends, _ = get_cached_trends()
    trend = next((t for t in trends if t.get("id") == trend_id), None)
    if not trend:
        trend = db_trend  # use DB data if not in memory cache
    if not trend:
        raise HTTPException(status_code=404, detail="Trend not found")
    if trend.get("deep_dive"):
        return trend

    api_key = _os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="No OPENAI_API_KEY configured")

    from openai import OpenAI as _OpenAI
    client = _OpenAI(api_key=api_key)
    prompt = (
        f"You are a strategic enterprise technology analyst.\n"
        f"Topic: {trend['topic']}\nSummary: {trend.get('summary','')}\n\n"
        f"Write a deep-dive analysis with three clearly labelled sections:\n"
        f"1. What It Is\n2. Enterprise Impact\n3. Action Plan\n"
        f"Each section: 2-3 sentences. Write as a senior analyst briefing a CTO."
    )
    resp = await asyncio.to_thread(
        client.chat.completions.create,
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400,
    )
    deep_dive_text = resp.choices[0].message.content.strip()
    trend["deep_dive"] = deep_dive_text

    # ── 3. Save deepdive to DB ────────────────────────────────────────────
    try:
        supabase.table("trends").upsert({
            "id":       trend_id,
            "category": trend.get("category", ""),
            "topic":    trend.get("topic", ""),
            "deepdive": deep_dive_text,
            "data":     trend,
        }).execute()
    except Exception as e:
        print(f"[DB] deepdive save failed: {e}")

    return trend


@app.post("/api/trends/{trend_id}/save")
def save_trend(trend_id: str):
    """Toggle watchlisted=True for a trend in DB."""
    trends, _ = get_cached_trends()
    trend = next((t for t in trends if t.get("id") == trend_id), None)
    try:
        supabase.table("trends").upsert({
            "id":          trend_id,
            "category":    (trend or {}).get("category", ""),
            "topic":       (trend or {}).get("topic", ""),
            "watchlisted": True,
            "data":        trend or {},
        }).execute()
    except Exception as e:
        print(f"[DB] save_trend error: {e}")
    if trend:
        trend["saved"] = True
    return {"saved": True}


@app.delete("/api/trends/{trend_id}/save")
def unsave_trend(trend_id: str):
    """Toggle watchlisted=False for a trend in DB."""
    try:
        supabase.table("trends").update({"watchlisted": False}).eq("id", trend_id).execute()
    except Exception as e:
        print(f"[DB] unsave_trend error: {e}")
    trends, _ = get_cached_trends()
    for t in trends:
        if t.get("id") == trend_id:
            t["saved"] = False
    return {"saved": False}


@app.get("/test-perplexity")
async def test_perplexity():
    """Debug endpoint — calls Perplexity directly and returns the raw response."""
    import os as _os, httpx as _httpx, json as _json

    api_key = _os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        return {
            "ok": False,
            "error": "PERPLEXITY_API_KEY is not set in environment",
            "env_keys_present": [k for k in _os.environ if "PERPLEXITY" in k.upper()],
        }

    key_preview = api_key[:8] + "..." + api_key[-4:]
    payload = {
        "model": "sonar-pro",
        "messages": [{"role": "user", "content": "What are the top 3 AI trends right now? One sentence each."}],
        "max_tokens": 200,
    }

    try:
        async with _httpx.AsyncClient(verify=False, timeout=20) as client:
            resp = await client.post(
                "https://api.perplexity.ai/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )

        raw_text = resp.text
        status = resp.status_code

        if status != 200:
            return {
                "ok": False,
                "http_status": status,
                "key_preview": key_preview,
                "model": payload["model"],
                "raw_response": raw_text[:1000],
            }

        try:
            data = _json.loads(raw_text)
        except Exception as je:
            return {
                "ok": False,
                "http_status": status,
                "error": f"JSON decode failed: {je}",
                "raw_response": raw_text[:500],
            }

        if "choices" not in data:
            return {
                "ok": False,
                "http_status": status,
                "error": "'choices' key missing in response",
                "keys_present": list(data.keys()),
                "raw_response": raw_text[:800],
            }

        content = data["choices"][0]["message"]["content"]
        return {
            "ok": True,
            "http_status": status,
            "key_preview": key_preview,
            "model": payload["model"],
            "content": content,
            "usage": data.get("usage"),
        }

    except _httpx.TimeoutException:
        return {"ok": False, "error": "Request timed out (20s)", "key_preview": key_preview}
    except Exception as e:
        return {"ok": False, "error": f"{type(e).__name__}: {e}", "key_preview": key_preview}


@app.get("/api/journey")
def get_journey_data(persona: str = Query("cto"), max_articles: int = 6):
    """Get timeline milestones for journey tab."""
    topic = get_topic_from_persona(persona)
    sector_name = {
        "cto": "Automotive and Manufacturing",
        "innovation": "Banking and Finance",
        "strategy": "Public Sector"
    }.get(persona, topic)

    summarized = get_summarized_articles(persona=persona, max_articles=max_articles, days_back=4)
    feed = [map_article_to_frontend(i, a) for i, a in enumerate(summarized, 1)]

    radar_products = get_radar(persona=persona, max_articles=max_articles).get("products", [])
    journey = get_journey(feed=feed, products=radar_products, sector_name=sector_name)
    return {"steps": journey}


@app.get("/health")
def health_check():
    """Simple backend health endpoint for frontend status indicator."""
    try:
        resp = supabase.table("articles").select("id", count="exact").limit(1).execute()
        article_count = resp.count if resp.count is not None else len(resp.data)
    except Exception:
        article_count = 0
    return {
        "status": "ok",
        "service": "ai-watch-api",
        "article_count": article_count,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


# ==================== NEW ENDPOINTS FOR FRONTEND ====================

_last_ingest_time = None


def _fetch_all_articles(topic=None, signal=None, industry=None, date_from=None, date_to=None):
    """Query articles from Supabase with optional server-side filters."""
    try:
        query = supabase.table("articles").select("*").order("ingestion_date", desc=True)
        if topic:
            query = query.ilike("topic", topic)
        if signal and signal != "All":
            query = query.eq("signal_strength", signal)
        if industry:
            query = query.ilike("industry", f"%{industry}%")
        if date_from:
            query = query.gte("published_at", date_from)
        if date_to:
            query = query.lte("published_at", date_to)
        return query.execute().data or []
    except Exception as e:
        print(f"[DB] _fetch_all_articles error: {e}")
        return []


@app.get("/api/articles")
def get_articles(
    topic: Optional[str] = Query(None),
    signal: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=500),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
):
    """Get articles from DB with filtering and pagination."""
    filtered = _fetch_all_articles(topic=topic, signal=signal, industry=industry,
                                   date_from=date_from, date_to=date_to)
    if search:
        sl = search.lower()
        filtered = [a for a in filtered
                    if sl in a.get("title", "").lower() or sl in a.get("summary", "").lower()]
    total = len(filtered)
    start = (page - 1) * page_size
    return {
        "items": filtered[start:start + page_size],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, (total + page_size - 1) // page_size),
    }


@app.get("/api/articles/{article_id}")
def get_article_detail(article_id: str):
    """Get a single article from DB."""
    try:
        resp = supabase.table("articles").select("*").eq("id", article_id).limit(1).execute()
        if resp.data:
            return resp.data[0]
    except Exception as e:
        print(f"[DB] get_article_detail error: {e}")
    raise HTTPException(status_code=404, detail="Article not found")


@app.post("/api/summarize")
async def summarize_article_endpoint(article: dict):
    """Generate an AI summary — checks DB first, generates + saves if missing."""
    import os as _os
    article_id = article.get("id")

    # ── 1. DB check — return cached summary if it exists ────────────────────
    if article_id:
        try:
            row = supabase.table("articles").select("summary").eq("id", article_id).limit(1).execute()
            if row.data and row.data[0].get("summary"):
                return {"summary": row.data[0]["summary"]}
        except Exception as e:
            print(f"[summarize] DB check failed: {e}")

    # ── 2. Generate summary ─────────────────────────────────────────────────
    title       = article.get("title", "")
    description = article.get("description", "") or ""
    content     = article.get("content", "")
    text        = f"Title: {title}\n\n{description}\n\n{content}"[:4000]

    system_msg = (
        "You are a strategic AI analyst. "
        "You ALWAYS respond in English only, no matter what language the article is written in."
    )
    prompt = (
        "Summarise the following article in 3–4 sentences.\n"
        "Structure: WHAT happened, WHY it matters strategically, WHO is affected, WHAT to watch next.\n"
        "Write in plain English prose — no bullet points, no French, no other language.\n\n"
        f"{text}"
    )

    generated_summary = None

    for openai_key in _openai_keys():
        try:
            from openai import OpenAI as _OpenAI
            client = _OpenAI(api_key=openai_key)
            resp = await asyncio.to_thread(
                client.chat.completions.create,
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user",   "content": prompt},
                ],
                max_tokens=300,
            )
            generated_summary = resp.choices[0].message.content.strip()
            break
        except Exception as e:
            print(f"[summarize] OpenAI key ...{openai_key[-6:]} failed: {e}")

    if not generated_summary:
        anthropic_key = _os.getenv("ANTHROPIC_API_KEY")
        if anthropic_key:
            try:
                import anthropic as _anthropic
                client = _anthropic.Anthropic(api_key=anthropic_key)
                resp = await asyncio.to_thread(
                    client.messages.create,
                    model="claude-haiku-4-5-20251001",
                    max_tokens=300,
                    system=system_msg,
                    messages=[{"role": "user", "content": prompt}],
                )
                generated_summary = resp.content[0].text.strip()
            except Exception:
                pass

    if not generated_summary:
        raise HTTPException(status_code=503, detail="No LLM key configured. Add OPENAI_API_KEY or ANTHROPIC_API_KEY to .env")

    # ── 3. Persist summary to DB ─────────────────────────────────────────────
    if article_id:
        try:
            supabase.table("articles").update({"summary": generated_summary}).eq("id", article_id).execute()
        except Exception as e:
            print(f"[summarize] DB update failed: {e}")

    return {"summary": generated_summary}


@app.post("/api/match-solutions")
async def match_solutions_endpoint(payload: dict):
    """Match an article or trend to top 3 DXC solutions.
    Checks solution_matches table first — LLM only called on first request."""
    print("✅ match-solutions endpoint hit")
    import os as _os, hashlib as _hashlib, json as _json

    title    = payload.get("title", "")
    summary  = payload.get("summary", "")
    industry = payload.get("industry", "")
    signal   = payload.get("signal", "")
    article_id = payload.get("id", "")

    # ── 1. DB check — return cached matches if they exist ───────────────────
    cache_key = _hashlib.md5(f"{title}|{industry}".encode()).hexdigest()
    if article_id:
        try:
            row = supabase.table("solution_matches").select("matches").eq("id", cache_key).limit(1).execute()
            if row.data:
                return {"matches": row.data[0]["matches"]}
        except Exception as e:
            print(f"[match-solutions] DB check failed: {e}")

    # ── 2. Build prompt (fetch solutions from DB if available) ───────────────
    try:
        sol_rows = supabase.table("dxc_solutions").select("number,name,description").order("number").execute()
        if sol_rows.data:
            solutions_text = "\n".join(
                f"{r['number']}. {r['name']} — {r['description']}" for r in sol_rows.data
            )
        else:
            solutions_text = "\n".join(DXC_SOLUTIONS_CATALOG)
    except Exception:
        solutions_text = "\n".join(DXC_SOLUTIONS_CATALOG)

    system_msg = (
        "You are a DXC Technology solutions advisor. "
        "You match technology news and trends to specific DXC solutions and explain why each is relevant. "
        "Always respond in English only."
    )
    prompt = (
        f"A technology article/trend has been identified:\n"
        f"Title: {title}\n"
        f"Industry: {industry}\n"
        f"Signal strength: {signal}\n"
        f"Summary: {summary[:1500]}\n\n"
        f"DXC Solutions available:\n{solutions_text}\n\n"
        f"Identify the TOP 3 most relevant DXC solutions for this article/trend.\n"
        f"For each match provide exactly one sentence explaining why it is relevant to this specific context.\n"
        f'Respond ONLY as valid JSON in this exact format: {{"matches": [{{"solution": "Name", "explanation": "One sentence."}}]}}\n'
        f"Return exactly 3 items. No markdown, no extra text outside the JSON."
    )

    result = None

    for openai_key in _openai_keys():
        try:
            from openai import OpenAI as _OpenAI
            client = _OpenAI(api_key=openai_key)
            resp = await asyncio.to_thread(
                client.chat.completions.create,
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user",   "content": prompt},
                ],
                max_tokens=500,
                response_format={"type": "json_object"},
            )
            parsed = _json.loads(resp.choices[0].message.content.strip())
            if isinstance(parsed.get("matches"), list):
                result = parsed["matches"]
                break
        except Exception as e:
            print(f"[match-solutions] OpenAI key ...{openai_key[-6:]} failed: {e}")

    if not result:
        anthropic_key = _os.getenv("ANTHROPIC_API_KEY")
        if anthropic_key:
            try:
                import anthropic as _anthropic
                client = _anthropic.Anthropic(api_key=anthropic_key)
                resp = await asyncio.to_thread(
                    client.messages.create,
                    model="claude-haiku-4-5-20251001",
                    max_tokens=500,
                    system=system_msg,
                    messages=[{"role": "user", "content": prompt}],
                )
                raw = resp.content[0].text.strip()
                if raw.startswith("```"):
                    raw = "\n".join(raw.split("\n")[1:])
                    raw = raw.rsplit("```", 1)[0].strip()
                parsed = _json.loads(raw)
                if isinstance(parsed.get("matches"), list):
                    result = parsed["matches"]
            except Exception as e:
                print(f"[match-solutions] Anthropic error: {e}")

    if not result:
        raise HTTPException(status_code=503, detail="No LLM available. Check OPENAI_API_KEY or ANTHROPIC_API_KEY in .env")

    matches = [
        {"solution": m.get("solution", ""), "explanation": m.get("explanation", "")}
        for m in result[:3]
    ]
    response_data = {"matches": matches}

    # ── 3. Persist to solution_matches table ─────────────────────────────────
    try:
        supabase.table("solution_matches").upsert({
            "id": cache_key,
            "article_id": article_id or cache_key,
            "matches": matches,
        }).execute()
    except Exception as e:
        print(f"[match-solutions] DB save failed: {e}")

    return response_data


@app.get("/api/signals/live")
def get_live_signals():
    """Get current live signals metrics from DB."""
    articles = _fetch_all_articles()
    strong_count = sum(1 for a in articles if a.get("signal_strength") == "Strong")
    weak_count   = sum(1 for a in articles if a.get("signal_strength") == "Weak")
    return {
        "agentic_ai": strong_count,
        "patent_filings": strong_count // 2,
        "funding_rounds": weak_count // 3,
        "regulatory_updates": (strong_count + weak_count) // 4,
    }


@app.get("/api/sectors/top")
def get_top_sectors():
    """Get top performing sectors based on article activity from DB."""
    articles = _fetch_all_articles()
    sector_scores: Dict[str, int] = {}
    for a in articles:
        industry = a.get("industry", "General")
        sector_scores[industry] = sector_scores.get(industry, 0) + a.get("relevance", 5)
    sorted_sectors = sorted(sector_scores.items(), key=lambda x: x[1], reverse=True)
    total = len(articles) or 1
    return [
        {"name": name, "score": min(100, int(score / total * 10))}
        for name, score in sorted_sectors[:10]
    ]


@app.get("/api/reports")
def get_reports(request: Request, page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100)):
    """Get reports for the current user."""
    user_id = _get_user_id(request)
    try:
        q = supabase.table("reports").select("*").order("generated_date", desc=True)
        if user_id:
            q = q.eq("user_id", user_id)
        resp = q.execute()
        all_reports = resp.data or []
    except Exception as e:
        print(f"[DB] get_reports error: {e}")
        all_reports = []
    total = len(all_reports)
    start = (page - 1) * page_size
    return {
        "items": all_reports[start:start + page_size],
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": max(1, (total + page_size - 1) // page_size),
    }


@app.get("/api/reports/{report_id}")
def get_report_detail(report_id: str):
    """Get a single report from DB."""
    try:
        resp = supabase.table("reports").select("*").eq("id", report_id).limit(1).execute()
        if resp.data:
            return resp.data[0]
    except Exception as e:
        print(f"[DB] get_report_detail error: {e}")
    raise HTTPException(status_code=404, detail="Report not found")


@app.post("/api/matching/save")
def save_matching_result(payload: dict):
    """Save quiz answers and matched solutions to matching_results table."""
    import uuid as _uuid
    row = {
        "id": str(_uuid.uuid4()),
        "answers": payload.get("answers", {}),
        "matched_solutions": payload.get("matched_solutions", []),
    }
    try:
        supabase.table("matching_results").insert(row).execute()
        return {"status": "saved", "id": row["id"]}
    except Exception as e:
        print(f"[DB] save_matching_result error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


MAX_REPORTS_PER_USER = 30

@app.post("/api/reports")
def save_report(request: Request, report_data: dict):
    """Save a new report to DB, scoped to the current user (max 30)."""
    import uuid
    user_id = _get_user_id(request)
    # Enforce per-user 30-report cap
    if user_id:
        try:
            existing = supabase.table("reports").select("id", count="exact").eq("user_id", user_id).execute()
            count = existing.count if existing.count is not None else len(existing.data or [])
            if count >= MAX_REPORTS_PER_USER:
                raise HTTPException(
                    status_code=400,
                    detail=f"Report limit reached. You can save a maximum of {MAX_REPORTS_PER_USER} reports. Delete some reports to make room."
                )
        except HTTPException:
            raise
        except Exception as e:
            print(f"[DB] save_report count error: {e}")
    report_id = str(uuid.uuid4())
    report = {
        "id": report_id,
        "user_id": user_id,
        "title": report_data.get("title", "Untitled Report"),
        "generated_date": datetime.now().isoformat(),
        "article_count": len(report_data.get("articles", [])),
        "funding_count": report_data.get("funding_count", 0),
        "summary": report_data.get("summary", ""),
        "key_points": report_data.get("key_points", []),
        "articles": report_data.get("articles", []),
    }
    try:
        supabase.table("reports").insert(report).execute()
    except Exception as e:
        print(f"[DB] save_report error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save report")
    return {"status": "success", "report_id": report_id, "message": "Report saved successfully."}


@app.delete("/api/reports/{report_id}")
def delete_report(request: Request, report_id: str):
    """Delete a report — only the owner can delete."""
    user_id = _get_user_id(request)
    try:
        q = supabase.table("reports").delete().eq("id", report_id)
        if user_id:
            q = q.eq("user_id", user_id)
        q.execute()
        return {"status": "success", "message": "Report deleted"}
    except Exception as e:
        print(f"[DB] delete_report error: {e}")
        raise HTTPException(status_code=404, detail="Report not found")


def _perform_ingestion(topic: Optional[str] = None):
    """Background task: fetch articles, dedup by URL against DB, insert new, delete >7 days."""
    from ingestion import run_ingestion, PRESET_SECTORS
    from concurrent.futures import ThreadPoolExecutor, as_completed
    import logging, traceback

    logger = logging.getLogger(__name__)
    global _last_ingest_time

    try:
        logger.info(f"🚀 Starting ingestion for topic: {topic or 'ALL'}")

        def fetch_topic(t):
            try:
                arts = run_ingestion(topic=t, limit=15)
                logger.info(f"  ✓ {t}: {len(arts)} articles fetched")
                return arts
            except Exception as e:
                logger.warning(f"  ⚠ {t}: {e}")
                return []

        if topic:
            if topic not in PRESET_SECTORS:
                logger.error(f"❌ Unknown topic: {topic}")
                return
            results = fetch_topic(topic)
        else:
            topics = list(PRESET_SECTORS.keys())
            results = []
            with ThreadPoolExecutor(max_workers=len(topics)) as executor:
                futures = {executor.submit(fetch_topic, t): t for t in topics}
                for fut in as_completed(futures):
                    results.extend(fut.result())

        # ── Dedup by URL: only insert articles whose URL is not yet in DB ────
        inserted = 0
        skipped  = 0
        for art in results:
            url = art.get("url", "").strip()
            if not url:
                continue  # skip articles with no URL
            try:
                existing = supabase.table("articles").select("id").eq("url", url).limit(1).execute()
                if existing.data:
                    skipped += 1
                    continue  # already in DB — skip
                # Prepare row (only known columns)
                row = {
                    "id":             art.get("id", ""),
                    "title":          art.get("title", "")[:500],
                    "description":    (art.get("description") or "")[:1000],
                    "summary":        (art.get("summary") or "")[:2000],
                    "url":            url,
                    "source":         art.get("source", ""),
                    "published_at":   art.get("published_at", ""),
                    "topic":          art.get("topic", ""),
                    "signal_strength": art.get("signal_strength", "Weak"),
                    "relevance":      art.get("relevance", 5),
                    "industry":       art.get("industry", ""),
                    "market_segment": art.get("market_segment", ""),
                    "image_url":      art.get("image_url", ""),
                    "source_api":     art.get("source_api", ""),
                    "keywords":       art.get("keywords", []),
                }
                supabase.table("articles").insert(row).execute()
                inserted += 1
            except Exception as e:
                logger.warning(f"  ⚠ insert failed for '{art.get('title','')[:50]}': {e}")

        # ── Delete articles older than 7 days ────────────────────────────────
        cutoff = (datetime.utcnow() - timedelta(days=7)).isoformat()
        try:
            supabase.table("articles").delete().lt("ingestion_date", cutoff).execute()
            logger.info("🗑️  Deleted articles older than 7 days")
        except Exception as e:
            logger.warning(f"  ⚠ cleanup failed: {e}")

        _last_ingest_time = datetime.now().isoformat()
        logger.info(f"✅ Ingestion complete — inserted: {inserted}, skipped (dup): {skipped}")

    except Exception as e:
        logger.error(f"❌ Ingestion error: {e}")
        logger.error(traceback.format_exc())


@app.post("/api/ingest")
def trigger_ingest(background_tasks: BackgroundTasks, topic: Optional[str] = Query(None)):
    """
    Manually trigger data ingestion from NEWS_API and/or PERPLEXITY.
    
    Returns immediately with status, while actual ingestion happens in background.
    
    Query params:
        - topic: Specific topic to ingest (AI, Fintech, etc.)
                 If not specified, ingests all 6 topics
    
    Behavior:
        1. Returns success immediately
        2. Fetches fresh data from NEWS_API for specified topic(s) in background
        3. Processes articles through summarizer
        4. Updates cache when complete
    """
    
    # Add background task
    background_tasks.add_task(_perform_ingestion, topic)
    
    return {
        "status": "started",
        "message": "Starting article ingestion in background. This may take 30-60 seconds.",
        "timestamp": datetime.now().isoformat(),
        "tip": "The articles will appear automatically once loaded. Keep the page open.",
    }


@app.get("/api/funding")
def get_funding_rounds(page: int = Query(1, ge=1), page_size: int = Query(25, ge=1, le=100)):
    """Get detected funding rounds from DB articles."""
    articles = _fetch_all_articles()
    funding_rounds = []
    for a in articles:
        if "funding_rounds" in a:
            funding_rounds.extend(a["funding_rounds"])
    total = len(funding_rounds)
    start = (page - 1) * page_size
    return {"items": funding_rounds[start:start + page_size], "total": total, "page": page, "page_size": page_size}


@app.get("/api/actors")
def get_key_actors(page: int = Query(1, ge=1), page_size: int = Query(25, ge=1, le=100)):
    """Get key actors from DB articles."""
    articles = _fetch_all_articles()
    actors_map: Dict[str, dict] = {}
    for a in articles:
        if "key_actors" in a and isinstance(a["key_actors"], list):
            for actor in a["key_actors"]:
                if not isinstance(actor, dict):
                    continue
                key = f"{actor.get('name','')}_{actor.get('type','')}"
                if key not in actors_map:
                    actors_map[key] = {**actor, "mentions": 0}
                actors_map[key]["mentions"] += 1
    actors_list = sorted(actors_map.values(), key=lambda x: x["mentions"], reverse=True)
    total = len(actors_list)
    start = (page - 1) * page_size
    return {"items": actors_list[start:start + page_size], "total": total, "page": page, "page_size": page_size}


@app.get("/api/export/csv")
def export_articles_csv(topic: Optional[str] = Query(None), signal: Optional[str] = Query(None)):
    """Export articles from DB as CSV file download."""
    filtered = _fetch_all_articles(topic=topic, signal=signal)
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["title", "source", "published_at", "signal_strength", "relevance", "industry", "url"])
    writer.writeheader()
    for a in filtered:
        writer.writerow({
            "title": a.get("title", ""), "source": a.get("source", ""),
            "published_at": a.get("published_at", ""), "signal_strength": a.get("signal_strength", ""),
            "relevance": a.get("relevance", ""), "industry": a.get("industry", ""), "url": a.get("url", ""),
        })
    output.seek(0)
    return StreamingResponse(iter([output.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": "attachment; filename=articles_export.csv"})


# Mock article data for initial cache population
MOCK_ARTICLES_DATA = [
    {
        "id": "1",
        "title": "Toyota deploys Agentic AI for autonomous supply chain — 23% cost reduction",
        "source": "TechCrunch",
        "published_at": "2026-03-15",
        "signal_strength": "Strong",
        "relevance": 9,
        "industry": "Automotive",
        "topic": "AI",
        "summary": "Toyota's new AI agent network autonomously manages 340+ suppliers, reducing costs by 23%.",
        "url": "https://techcrunch.com/example"
    },
    {
        "id": "2",
        "title": "HSBC launches real-time AI fraud detection — 99.2% accuracy",
        "source": "Financial Times",
        "published_at": "2026-03-14",
        "signal_strength": "Strong",
        "relevance": 8,
        "industry": "Banking",
        "topic": "Fintech",
        "summary": "HSBC deploys AI-native fraud detection processing 2.3M transactions/second.",
        "url": "https://ft.com/example"
    },
    {
        "id": "3",
        "title": "EU AI Act enforcement begins — first fines expected by Q2",
        "source": "EUR-Lex",
        "published_at": "2026-03-13",
        "signal_strength": "Weak",
        "relevance": 7,
        "industry": "Legal & Compliance",
        "topic": "Regulation",
        "summary": "European Commission announces enforcement framework with first fines in Q2.",
        "url": "https://eur-lex.europa.eu/example"
    },
    {
        "id": "4",
        "title": "Synthesia raises €40M for AI video generation platform",
        "source": "Dealroom",
        "published_at": "2026-03-12",
        "signal_strength": "Strong",
        "relevance": 8,
        "industry": "Media & Entertainment",
        "topic": "AI",
        "summary": "London-based Synthesia closes €40M Series C for AI video synthesis.",
        "url": "https://dealroom.co/example"
    },
    {
        "id": "5",
        "title": "Moderna partners with Genentech on AI-designed therapeutics",
        "source": "BiopharmGuy",
        "published_at": "2026-03-11",
        "signal_strength": "Strong",
        "relevance": 8,
        "industry": "Healthcare",
        "topic": "HealthTech",
        "summary": "Collaboration aims to accelerate drug development cycles by 30%.",
        "url": "https://biopharmaguy.com/example"
    }
]


def initialize_mock_cache():
    """Initialize cache with mock articles at startup."""
    # DISABLED: Now using real data from NEWS_API instead of mock data
    # global _articles_cache
    # _articles_cache.extend(MOCK_ARTICLES_DATA)
    pass


# Startup event to initialize scheduler
@app.on_event("startup")
async def startup():
    """Initialize scheduler, seed DXC solutions, load subscribers from DB."""
    # ── Seed dxc_solutions table (idempotent — skips if already seeded) ──
    try:
        existing = supabase.table("dxc_solutions").select("id").limit(1).execute()
        if not existing.data:
            rows = []
            for item in DXC_SOLUTIONS_CATALOG:
                # Parse "N. Name — Description"
                try:
                    num_rest = item.split(". ", 1)
                    num = int(num_rest[0].strip())
                    name_desc = num_rest[1].split(" — ", 1)
                    name = name_desc[0].strip()
                    desc = name_desc[1].strip() if len(name_desc) > 1 else ""
                    rows.append({"number": num, "name": name, "description": desc})
                except Exception:
                    pass
            if rows:
                supabase.table("dxc_solutions").insert(rows).execute()
                print(f"✅ Seeded {len(rows)} DXC solutions into DB")
        else:
            print("✅ DXC solutions already seeded")
    except Exception as e:
        print(f"⚠️  DXC seed failed: {e}")

    # ── Load newsletter subscribers from DB into in-memory state ──────────
    try:
        subs = supabase.table("newsletter_subscribers").select("email").execute()
        db_emails = [r["email"] for r in (subs.data or [])]
        cfg = newsletter_module.get_smtp_config()
        env_emails = [r for r in cfg.get("to_emails", []) if r.strip()]
        all_emails = list(dict.fromkeys(env_emails + db_emails))  # dedup, preserve order
        _newsletter_state["recipients"] = all_emails
        print(f"✅ Loaded {len(db_emails)} subscriber(s) from DB")
    except Exception as e:
        print(f"⚠️  Subscriber load failed: {e}")

    scheduler.start()


# Shutdown event to stop scheduler
@app.on_event("shutdown")
async def shutdown():
    """Stop background scheduler on app shutdown."""
    scheduler.stop()


# ==================== NEWSLETTER ENDPOINTS ====================

_newsletter_state = {
    "last_sent": None,
    "last_status": None,
    "sending": False,
    "recipients": None,  # None = loaded from env
}


def _get_recipients() -> List[str]:
    """Return recipients from state override or env variable."""
    if _newsletter_state["recipients"] is not None:
        return _newsletter_state["recipients"]
    cfg = newsletter_module.get_smtp_config()
    return [r for r in cfg.get("to_emails", []) if r.strip()]


def _build_sector_data_for_newsletter(persona: str = "cto", max_articles: int = 10) -> dict:
    """Build sector_data dict from DB articles."""
    articles = _fetch_all_articles()[:max_articles]

    # Group by topic/industry
    sector_map: dict = {}
    for a in articles:
        sector = a.get("topic") or a.get("industry") or "General"
        sector_map.setdefault(sector, []).append({
            "title":          a.get("title", "Untitled"),
            "url":            a.get("url") or a.get("link", "#"),
            "source":         a.get("source", "Unknown"),
            "summary":        a.get("summary") or a.get("description") or "No summary available.",
            "signal_type":    a.get("signal_strength", "Weak"),
            "relevance_score": a.get("relevance") or a.get("relevance_score", 5),
            "industry":       a.get("industry", "General"),
            "market_segment": a.get("market_segment", "General"),
            "key_actors":     a.get("key_actors", "None"),
            "startups":       a.get("startups", "None"),
            "funding":        a.get("funding", "None"),
            "patents":        a.get("patents", "None"),
            "publications":   a.get("publications", "None"),
        })

    return sector_map if sector_map else {}


async def _perform_newsletter_send(persona: str = "cto", user_email: Optional[str] = None):
    """Background task: generate and send newsletter.
    If user_email is provided, send only to that address; otherwise send to all subscribers."""
    _newsletter_state["sending"] = True
    try:
        sector_data = _build_sector_data_for_newsletter(persona=persona)
        if not sector_data or all(len(v) == 0 for v in sector_data.values()):
            sector_data = {"General": [{"title": "No articles available yet.",
                                        "url": "#", "source": "AI Watch",
                                        "summary": "Run 'Generate New Data' in the Explore page to ingest the latest intelligence.",
                                        "signal_type": "Weak", "relevance_score": 5,
                                        "industry": "General", "market_segment": "General",
                                        "key_actors": "None", "startups": "None",
                                        "funding": "None", "patents": "None",
                                        "publications": "None"}]}

        import os
        # Send to the requesting user's email, or fall back to all subscribers
        if user_email:
            os.environ["NEWSLETTER_RECIPIENTS"] = user_email
        else:
            recipients = _get_recipients()
            if recipients:
                os.environ["NEWSLETTER_RECIPIENTS"] = ",".join(recipients)

        today = datetime.now().strftime("%B %d, %Y")
        newsletter_module.send_newsletter(
            sector_data,
            subject=f"AI Watch Daily Intelligence — {today}"
        )
        _newsletter_state["last_sent"] = datetime.now().isoformat()
        _newsletter_state["last_status"] = "sent"
    except Exception as e:
        print(f"[Newsletter] send error ({type(e).__name__}): {e}")
        _newsletter_state["last_status"] = f"error: {type(e).__name__}: {e}"
    finally:
        _newsletter_state["sending"] = False


@app.get("/api/newsletter/status")
def get_newsletter_status():
    """Return newsletter configuration and last-send status."""
    cfg = newsletter_module.get_smtp_config()
    smtp_ready = bool(cfg.get("username") and cfg.get("password"))
    recipients = _get_recipients()
    return {
        "smtp_configured": smtp_ready,
        "smtp_host": cfg.get("host", "smtp.gmail.com"),
        "smtp_port": cfg.get("port", 587),
        "recipients": recipients,
        "recipient_count": len(recipients),
        "last_sent": _newsletter_state["last_sent"],
        "last_status": _newsletter_state["last_status"],
        "sending": _newsletter_state["sending"],
        "schedule": "Daily at 07:00 UTC",
    }


@app.post("/api/newsletter/send")
async def send_newsletter_now(
    request: Request,
    background_tasks: BackgroundTasks,
    persona: str = Query("cto"),
):
    """Manually trigger newsletter — sends to the requesting user's email."""
    if _newsletter_state["sending"]:
        return {"status": "already_sending", "message": "Newsletter is already being sent."}
    # Resolve the requesting user's email from JWT
    user_email: Optional[str] = None
    uid = _get_user_id(request)
    if uid:
        try:
            row = supabase.table("users").select("email").eq("id", uid).limit(1).execute()
            if row.data:
                user_email = row.data[0]["email"]
        except Exception:
            pass
    background_tasks.add_task(_perform_newsletter_send, persona, user_email)
    return {
        "status": "started",
        "message": f"Newsletter will be sent to {user_email or 'all subscribers'}.",
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/newsletter/subscribe")
def subscribe_email(email: str = Body(..., embed=True)):
    """Add email to newsletter_subscribers in DB."""
    email = email.strip().lower()
    if not email or "@" not in email:
        return {"status": "error", "message": "Invalid email address."}
    try:
        supabase.table("newsletter_subscribers").upsert({"email": email}).execute()
    except Exception as e:
        print(f"[DB] subscribe error: {e}")
    # Also keep in-memory list in sync
    recipients = _get_recipients()
    if _newsletter_state["recipients"] is None:
        _newsletter_state["recipients"] = recipients
    if email not in _newsletter_state["recipients"]:
        _newsletter_state["recipients"].append(email)
    return {"status": "subscribed", "recipients": _newsletter_state["recipients"]}


@app.delete("/api/newsletter/unsubscribe")
def unsubscribe_email(email: str = Query(...)):
    """Remove email from newsletter_subscribers in DB."""
    email = email.strip().lower()
    try:
        supabase.table("newsletter_subscribers").delete().eq("email", email).execute()
    except Exception as e:
        print(f"[DB] unsubscribe error: {e}")
    recipients = _get_recipients()
    if _newsletter_state["recipients"] is None:
        _newsletter_state["recipients"] = recipients
    _newsletter_state["recipients"] = [r for r in _newsletter_state["recipients"] if r != email]
    return {"status": "unsubscribed", "recipients": _newsletter_state["recipients"]}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
