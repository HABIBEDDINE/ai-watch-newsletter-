from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).resolve().parent.parent / "config" / ".env", override=True)

from fastapi import FastAPI, Query, BackgroundTasks, Body, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Tuple
import json
import os
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

# Import free sources for test endpoint
try:
    from free_sources import (
        fetch_hackernews_items,
        fetch_reddit_items,
        fetch_arxiv_items,
        fetch_github_trending,
        fetch_extra_rss,
    )
    FREE_SOURCES_AVAILABLE = True
except ImportError:
    FREE_SOURCES_AVAILABLE = False

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

# ── Role → persona mapping for feed personalisation ──────────────────────────
ROLE_PERSONA_MAP = {
    "cto":                "cto",
    "innovation_manager": "innovation",
    "strategy_director":  "strategy",
    "other":              "cto",
}

ROLE_LABELS = {
    "cto":                "CTO / Technical Lead",
    "innovation_manager": "Innovation Manager",
    "strategy_director":  "Strategy Director",
    "other":              None,
}

@app.get("/api/feed")
def get_feed(persona: str = Query("cto"), role: Optional[str] = Query(None), max_articles: int = 5):
    """
    Get the intelligence feed for a specific persona or topic.
    Accepts ?role= to automatically select the right persona preset.
    """
    effective_persona = ROLE_PERSONA_MAP.get(role, persona) if role else persona
    summarized = get_summarized_articles(persona=effective_persona, max_articles=max_articles, days_back=3)
    mapped_feed = [map_article_to_frontend(i, a) for i, a in enumerate(summarized, 1)]
    return {
        "feed": mapped_feed,
        "persona": effective_persona,
        "role": role,
        "personalised": role is not None and role != "other",
    }


# ── Saved Items ───────────────────────────────────────────────────────────────
@app.get("/api/saved")
def get_saved(request: Request, type: Optional[str] = Query(None)):
    user_id = require_user(request)
    query = supabase.table("saved_items").select("*").eq("user_id", user_id).order("saved_at", desc=True)
    if type in ("article", "trend"):
        query = query.eq("item_type", type)
    result = query.execute()
    return result.data or []

@app.post("/api/saved", status_code=201)
def save_item(body: Dict = Body(...), request: Request = None):
    user_id = require_user(request)
    item_type = body.get("item_type")
    item_id   = str(body.get("item_id", "")).strip()
    item_data = body.get("item_data", {})
    if item_type not in ("article", "trend"):
        raise HTTPException(422, "item_type must be 'article' or 'trend'")
    if not item_id:
        raise HTTPException(422, "item_id is required")
    try:
        result = supabase.table("saved_items").insert({
            "user_id": user_id, "item_type": item_type,
            "item_id": item_id, "item_data": item_data,
        }).execute()
        return result.data[0]
    except Exception:
        # unique constraint — already saved, ignore silently
        return {"ok": True}

@app.delete("/api/saved/{item_id}")
def unsave_item(item_id: str, request: Request):
    user_id = require_user(request)
    supabase.table("saved_items").delete().eq("user_id", user_id).eq("item_id", item_id).execute()
    return {"ok": True}


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

# Role-based prompts for personalized trend generation
ROLE_PROMPTS = {
    "cto": "Focus on technical architecture decisions, build vs buy, infrastructure scalability, security implications, and engineering team productivity tools.",
    "innovation_manager": "Focus on emerging technologies for competitive advantage, pilot project opportunities, R&D partnerships, and innovation metrics that matter to the board.",
    "strategy_director": "Focus on market positioning, competitive intelligence, M&A targets, strategic partnerships, and long-term technology bets that affect business model.",
    "other": "Focus on practical enterprise applications, adoption trends, and actionable insights for technology decision-makers.",
}

# Role-based category weights for trend ranking
ROLE_CATEGORY_WEIGHTS = {
    "cto": {
        "ai_infrastructure": 10,
        "enterprise_apps": 9,
        "llm_models": 8,
        "open_source": 6,
        "dev_tools": 5,
        "ai_agents": 7,
    },
    "innovation_manager": {
        "ai_agents": 10,
        "llm_models": 9,
        "dev_tools": 9,
        "open_source": 8,
        "enterprise_apps": 7,
        "ai_infrastructure": 5,
    },
    "strategy_director": {
        "enterprise_apps": 10,
        "llm_models": 8,
        "ai_agents": 7,
        "ai_infrastructure": 6,
        "open_source": 5,
        "dev_tools": 4,
    },
    "other": {
        "llm_models": 8,
        "ai_agents": 8,
        "dev_tools": 7,
        "open_source": 7,
        "enterprise_apps": 6,
        "ai_infrastructure": 5,
    },
}

# Role-specific insight prompts
ROLE_INSIGHT_PROMPTS = {
    "cto": "Write 1 sentence about the technical implementation risk or opportunity this trend creates for a CTO managing enterprise AI infrastructure.",
    "innovation_manager": "Write 1 sentence about the use case opportunity or pilot project potential this trend creates for an Innovation Manager.",
    "strategy_director": "Write 1 sentence about the competitive positioning or market timing implication of this trend for a Strategy Director.",
    "other": "Write 1 sentence about why this trend matters for anyone working in technology.",
}


@app.get("/api/trends/test-sources")
async def test_sources():
    """Test each free source independently — use to verify all sources are working."""
    if not FREE_SOURCES_AVAILABLE:
        return {"error": "free_sources module not available", "sources": {}}

    from free_sources import fetch_verified_sources

    results = {}

    try:
        verified = await fetch_verified_sources()
        verified_count = len([v for v in verified if v.get("is_verified")])
        results["verified_sources"] = {
            "status": "ok",
            "count": len(verified),
            "verified_count": verified_count,
            "sample": verified[0]["title"] if verified else None,
            "channels": list(set(v.get("channel") for v in verified))
        }
    except Exception as e:
        results["verified_sources"] = {"status": "error", "error": str(e)}

    try:
        hn = await fetch_hackernews_items()
        results["hackernews"] = {"status": "ok", "count": len(hn), "sample": hn[0]["title"] if hn else None}
    except Exception as e:
        results["hackernews"] = {"status": "error", "error": str(e)}

    try:
        rd = await fetch_reddit_items()
        results["reddit"] = {"status": "ok", "count": len(rd), "sample": rd[0]["title"] if rd else None}
    except Exception as e:
        results["reddit"] = {"status": "error", "error": str(e)}

    try:
        ax = await fetch_arxiv_items()
        results["arxiv"] = {"status": "ok", "count": len(ax), "sample": ax[0]["title"] if ax else None}
    except Exception as e:
        results["arxiv"] = {"status": "error", "error": str(e)}

    try:
        gh = await fetch_github_trending()
        results["github"] = {"status": "ok", "count": len(gh), "sample": gh[0]["title"] if gh else None}
    except Exception as e:
        results["github"] = {"status": "error", "error": str(e)}

    try:
        rss = await fetch_extra_rss()
        results["extra_rss"] = {"status": "ok", "count": len(rss), "sample": rss[0]["title"] if rss else None}
    except Exception as e:
        results["extra_rss"] = {"status": "error", "error": str(e)}

    # Summary
    ok_count = sum(1 for r in results.values() if r.get("status") == "ok")
    total_items = sum(r.get("count", 0) for r in results.values() if r.get("status") == "ok")

    return {
        "summary": f"{ok_count}/6 sources OK, {total_items} total items",
        "sources": results
    }


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

    # Fallback to DB if in-memory cache is empty
    if not trends:
        try:
            rows = supabase.table("trends").select("*").order("created_at", desc=True).limit(50).execute()
            if rows.data:
                from trends_service import _trends_cache as _tc
                loaded = []
                for row in rows.data:
                    # Start with data JSONB if it exists
                    data_json = row.get("data")
                    if isinstance(data_json, str):
                        try:
                            data_json = json.loads(data_json)
                        except:
                            data_json = {}
                    t = dict(data_json or {})

                    # Always overlay the direct columns (they're the source of truth)
                    t["id"] = row.get("id") or t.get("id", "")
                    t["topic"] = row.get("topic") or t.get("topic", "")
                    t["category"] = row.get("category") or t.get("category", "")
                    t["detected_at"] = row.get("detected_at") or t.get("detected_at", "")
                    t["watchlisted"] = row.get("watchlisted", False)
                    t["deepdive_status"] = row.get("deepdive_status", "pending")

                    # Add deep dive if exists
                    if row.get("deepdive"):
                        t["deep_dive"] = row["deepdive"]

                    # Ensure score exists (default to 5 if missing)
                    if "score" not in t:
                        t["score"] = t.get("trend_score", 5)

                    # Skip rows with no topic
                    if not t.get("topic"):
                        continue

                    loaded.append(t)

                # Update in-memory cache for future requests
                _tc.clear()
                _tc.extend(loaded)
                trends = loaded
                last_updated = rows.data[0].get("created_at") if rows.data else None
        except Exception as e:
            print(f"[/api/trends] DB fallback failed: {e}")

    if category:
        trends = [t for t in trends if t.get("category") == category]
    categories = [{"id": q["category"], "label": q["label"], "icon": q["icon"]} for q in TREND_QUERIES]
    return {"trends": trends, "total": len(trends), "last_updated": last_updated, "categories": categories}


@app.get("/api/trends/personalized")
async def get_personalized_trends(
    request: Request,
    role: str = Query(None),
    topics: str = Query(None),
):
    """
    Returns same trends re-ranked by role relevance + adds a role-specific insight per trend.
    Uses category weights for fast re-ranking, only calls LLM for new insights.
    - role: cto, innovation_manager, strategy_director, other
    - topics: comma-separated list of topic interests (optional filter)
    """
    import os as _os
    from openai import OpenAI as _OpenAI

    # Get base trends
    cached_trends, last_updated = get_cached_trends()
    if not cached_trends:
        return {"trends": [], "role": role or "other", "last_updated": last_updated}

    user_role = role or "other"
    weights = ROLE_CATEGORY_WEIGHTS.get(user_role, ROLE_CATEGORY_WEIGHTS["other"])

    # Parse topics filter (optional)
    topic_list = [t.strip().lower() for t in (topics or "").split(",") if t.strip()]

    # Re-score each trend by role weight (NO LLM call needed)
    role_trends = []
    for trend in cached_trends:
        # Optional topic filter
        if topic_list:
            trend_tags = [t.lower() for t in trend.get("tags", [])]
            trend_topic = trend.get("topic", "").lower()
            if not any(t in trend_topic or t in trend_tags for t in topic_list):
                continue

        category = trend.get("category", "llm_models")
        role_weight = weights.get(category, 5)
        base_score = trend.get("score", trend.get("trend_score", 5))

        # Combined score: base score × role relevance
        role_score = (base_score * 0.6) + (role_weight * 0.4)

        role_trend = {**trend, "role_score": round(role_score, 1)}
        role_trends.append(role_trend)

    # Sort by role_score descending
    role_trends.sort(key=lambda x: x["role_score"], reverse=True)

    # Take top 5 most relevant for this role
    top5 = role_trends[:5]

    # Generate role-specific insight for each (cached in DB to avoid repeated API calls)
    api_key = _os.getenv("OPENAI_API_KEY")
    insight_prompt = ROLE_INSIGHT_PROMPTS.get(user_role, ROLE_INSIGHT_PROMPTS["other"])

    if api_key:
        client = _OpenAI(api_key=api_key)

        for trend in top5:
            trend_id = trend.get("id", "")

            # Check DB for cached insight
            try:
                cached = supabase.table("trends").select("data").eq("id", trend_id).execute()

                if cached.data:
                    trend_data = cached.data[0].get("data", {})
                    if isinstance(trend_data, str):
                        trend_data = json.loads(trend_data)

                    role_insights = trend_data.get("role_insights", {})
                    if user_role in role_insights:
                        trend["role_insight"] = role_insights[user_role]
                        continue
            except Exception as e:
                print(f"[PERSONALIZED] Cache check error: {e}")

            # Generate new insight
            try:
                resp = await asyncio.to_thread(
                    client.chat.completions.create,
                    model="gpt-4o-mini",
                    messages=[{
                        "role": "user",
                        "content": f"Trend: {trend.get('topic', '')}\nSummary: {trend.get('summary', '')}\n\n{insight_prompt}"
                    }],
                    max_tokens=80,
                    temperature=0.7,
                )
                insight = resp.choices[0].message.content.strip()
                trend["role_insight"] = insight

                # Cache the insight in trend data
                try:
                    existing_data = {}
                    if cached and cached.data:
                        raw_data = cached.data[0].get("data", "{}")
                        existing_data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data

                    role_insights = existing_data.get("role_insights", {})
                    role_insights[user_role] = insight
                    existing_data["role_insights"] = role_insights

                    supabase.table("trends").update({
                        "data": json.dumps(existing_data) if isinstance(existing_data, dict) else existing_data
                    }).eq("id", trend_id).execute()
                except Exception as cache_e:
                    print(f"[PERSONALIZED] Cache save error: {cache_e}")

            except Exception as e:
                print(f"[PERSONALIZED] Insight generation failed: {e}")
                trend["role_insight"] = ""
    else:
        # No API key - return without insights
        for trend in top5:
            trend["role_insight"] = ""

    return {
        "trends": top5,
        "role": user_role,
        "last_updated": last_updated,
    }


@app.post("/api/trends/refresh")
async def trigger_trends_refresh(force: bool = Query(False)):
    """Refresh trends — returns DB cache if < 6h old, else fetches from free sources.

    Query params:
    - force=true: Skip cache and force fresh fetch from all sources
    """
    # ── 1. Check DB freshness (unless force=true) ─────────────────────────
    if not force:
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

    # ── 2. Fetch from ALL free sources (verified + community) ─────────────
    from free_sources import fetch_all_free_sources
    from trends_service import cluster_free_sources

    print("[Refresh] Fetching from all free sources...")
    all_items = await fetch_all_free_sources()
    print(f"[Refresh] Got {len(all_items)} items, clustering with trust-weighted prompt...")
    trends = await cluster_free_sources(all_items)

    # ── 3. Save to DB + delete trends > 30 days ───────────────────────────
    today = datetime.utcnow().date().isoformat()
    try:
        for t in trends:
            # Use only columns that exist in DB schema
            supabase.table("trends").upsert({
                "id":              t.get("id", ""),
                "category":        t.get("category", ""),
                "topic":           t.get("topic", ""),
                "data":            t,
                "generated_date":  today,
                "detected_at":     t.get("detected_at") or datetime.utcnow().isoformat(),
            }).execute()
        cutoff_30d = (datetime.utcnow() - timedelta(days=30)).isoformat()
        supabase.table("trends").delete().lt("created_at", cutoff_30d).execute()
        print(f"[DB] Saved {len(trends)} trends, deleted trends > 30 days")
    except Exception as e:
        print(f"[DB] trends save failed: {e}")

    # Populate in-memory cache
    from trends_service import _trends_cache as _tc
    _tc.clear()
    _tc.extend(trends)

    return {"trends": trends, "total": len(trends), "message": f"Refreshed {len(trends)} trends from free sources"}


@app.post("/api/trends/{trend_id}/deepdive")
async def get_trend_deepdive(trend_id: str, role: str = Query(None)):
    """Generate or return cached deep-dive from DB. Role-aware if role param provided.

    Uses database lock to prevent race conditions when multiple users request same trend.
    Status: 'pending' | 'generating' | 'done' | 'error'
    """
    import os as _os

    user_role = role or "other"
    role_context = ROLE_PROMPTS.get(user_role, ROLE_PROMPTS["other"])

    # ── 1. Check DB for existing deepdive + status ───────────────────────────
    db_trend = None
    try:
        row = supabase.table("trends").select("deepdive,deepdive_status,data,user_role,topic").eq("id", trend_id).limit(1).execute()

        if not row.data:
            raise HTTPException(status_code=404, detail="Trend not found")

        db_row = row.data[0]
        deepdive_status = db_row.get("deepdive_status", "pending")
        cached_dd = db_row.get("deepdive")

        # Already generated — return immediately
        if deepdive_status == "done" and cached_dd:
            try:
                parsed = json.loads(cached_dd) if isinstance(cached_dd, str) else cached_dd
                if isinstance(parsed, dict) and "sources" in parsed and parsed["sources"]:
                    print(f"[DeepDive] Using cached (status=done) with {len(parsed['sources'])} sources")
                    trend = dict(db_row.get("data") or {})
                    trend["deep_dive"] = parsed
                    return trend
            except (json.JSONDecodeError, TypeError):
                print(f"[DeepDive] Cache parse error, will regenerate")

        # Currently generating by another request — tell client to wait
        if deepdive_status == "generating":
            print(f"[DeepDive] Already generating, telling client to wait")
            return {
                "status": "generating",
                "message": "Deep dive is being generated, retry in 15 seconds",
                "retry_in": 15,
                "trend_id": trend_id
            }

        # Get trend data for regeneration
        db_trend = dict(db_row.get("data") or {})

    except HTTPException:
        raise
    except Exception as e:
        print(f"[DB] deepdive check failed: {e}")

    # ── 2. Claim the generation lock ─────────────────────────────────────────
    try:
        # Only ONE request can claim the lock (atomic update with condition)
        supabase.table("trends").update({
            "deepdive_status": "generating"
        }).eq("id", trend_id).is_("deepdive_status", "null").execute()
        print(f"[DeepDive] Claimed generation lock for {trend_id}")
    except Exception as e:
        print(f"[DeepDive] Lock claim error (may already be generating): {e}")

    # ── 3. Get trend from in-memory cache (fallback to DB trend) ─────────────
    trends, _ = get_cached_trends()
    trend = next((t for t in trends if t.get("id") == trend_id), None)
    if not trend:
        trend = db_trend
    if not trend:
        raise HTTPException(status_code=404, detail="Trend not found")

    api_key = _os.getenv("OPENAI_API_KEY")
    if not api_key:
        # Release lock on error
        supabase.table("trends").update({"deepdive_status": None}).eq("id", trend_id).execute()
        raise HTTPException(status_code=503, detail="No OPENAI_API_KEY configured")

    # ── 4. Generate deepdive (wrapped in try/except to release lock on error) ──
    try:
        from openai import OpenAI as _OpenAI
        client = _OpenAI(api_key=api_key)

        prompt = f"""You are a strategic enterprise technology analyst writing for a {user_role.replace('_', ' ')}.

Topic: {trend['topic']}
Summary: {trend.get('summary', '')}

Role Focus: {role_context}

Return ONLY valid JSON with this exact structure:
{{
  "what_it_is": "2-3 paragraph explanation of what this trend is and why it matters",
  "enterprise_impact": "2-3 paragraphs on business and enterprise impact, tailored to the reader's role",
  "action_plan": "3 concrete next steps the reader should take, as a numbered list",
  "sources": [
    {{
      "number": 1,
      "title": "Relevant article or publication title",
      "publisher": "Publisher name (e.g. TechCrunch, MIT Technology Review, arXiv)",
      "snippet": "1-2 sentence relevant quote or summary from this source"
    }},
    {{
      "number": 2,
      "title": "Second source title",
      "publisher": "Publisher name",
      "snippet": "Brief relevant summary"
    }},
    {{
      "number": 3,
      "title": "Third source title",
      "publisher": "Publisher name",
      "snippet": "Brief relevant summary"
    }}
  ]
}}

IMPORTANT: Do NOT include any "url" field in sources. URLs are handled separately.
Use real authoritative publishers: MIT Technology Review, Harvard Business Review, TechCrunch, VentureBeat, arXiv, Wired, Forbes, etc.

Write as a senior analyst. Be specific and actionable.
Return ONLY the JSON object, no markdown, no extra text."""

        resp = await asyncio.to_thread(
            client.chat.completions.create,
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a JSON API. Return only valid JSON with all required fields including a sources array with at least 3 items."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=1000,
        )
        deep_dive_raw = resp.choices[0].message.content.strip()
        print(f"[DeepDive] Raw response: {deep_dive_raw[:300]}...")

        # Parse JSON response and ensure sources exist
        try:
            deep_dive_json = json.loads(deep_dive_raw)

            # Ensure sources array exists with fallback (no URLs)
            if "sources" not in deep_dive_json or not deep_dive_json["sources"]:
                topic = trend.get('topic', 'AI Trends')
                deep_dive_json["sources"] = [
                    {
                        "number": 1,
                        "title": f"Understanding {topic}",
                        "publisher": "Industry Analysis",
                        "snippet": "Expert analysis of enterprise AI applications and emerging trends."
                    },
                    {
                        "number": 2,
                        "title": f"Enterprise Impact: {topic}",
                        "publisher": "Business Review",
                        "snippet": "Analysis of AI adoption and business impact across industries."
                    },
                    {
                        "number": 3,
                        "title": "Implementation Guide",
                        "publisher": "Tech Guide",
                        "snippet": "Practical steps and best practices for implementation."
                    }
                ]
                print(f"[DeepDive] Added fallback sources")
            else:
                print(f"[DeepDive] Sources from API: {len(deep_dive_json['sources'])} items")

            trend["deep_dive"] = deep_dive_json
        except json.JSONDecodeError as e:
            print(f"[DeepDive] JSON parse error: {e}")
            # Fallback structure with sources (no URLs)
            trend["deep_dive"] = {
                "what_it_is": deep_dive_raw,
                "enterprise_impact": "",
                "action_plan": "",
                "sources": [
                    {
                        "number": 1,
                        "title": f"Understanding {trend.get('topic', 'AI Trends')}",
                        "publisher": "Industry Analysis",
                        "snippet": "Expert analysis of enterprise AI applications."
                    },
                    {
                        "number": 2,
                        "title": "Enterprise Impact Analysis",
                        "publisher": "Business Review",
                        "snippet": "Analysis of AI adoption and business impact."
                    },
                    {
                        "number": 3,
                        "title": "Implementation Guide",
                        "publisher": "Tech Guide",
                        "snippet": "Practical implementation steps and best practices."
                    }
                ]
            }

        # ── 5. Save deepdive to DB with role and status='done' ──────────────────
        try:
            # Save the JSON string (with sources) to DB
            deepdive_to_save = json.dumps(trend["deep_dive"]) if isinstance(trend["deep_dive"], dict) else str(trend["deep_dive"])
            supabase.table("trends").update({
                "deepdive":        deepdive_to_save,
                "deepdive_status": "done",
                "user_role":       user_role,
                "generated_data":  datetime.utcnow().isoformat(),
            }).eq("id", trend_id).execute()
            print(f"[DeepDive] Saved to DB with status=done, {len(trend['deep_dive'].get('sources', []))} sources")
        except Exception as e:
            print(f"[DB] deepdive save failed: {e}")
            # Release lock on save error
            supabase.table("trends").update({"deepdive_status": None}).eq("id", trend_id).execute()

        return trend

    except Exception as e:
        # ── Release lock on any generation error ──────────────────────────────
        print(f"[DeepDive] Generation failed, releasing lock: {e}")
        try:
            supabase.table("trends").update({"deepdive_status": "error"}).eq("id", trend_id).execute()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Deep dive generation failed: {str(e)}")


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


# ═══════════════════════════════════════════════════════════════════════════════
# BATCH DEEP DIVE GENERATION
# ═══════════════════════════════════════════════════════════════════════════════

async def batch_generate_deepdives(role: str = "cto", force: bool = False):
    """Background task: Generate deep dives for trends.

    Args:
        role: User role for personalized content (cto, innovation_manager, etc.)
        force: If True, re-generate ALL trends (including done ones with bad URLs)
    """
    import os as _os

    api_key = _os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("[BatchDeepDive] No OPENAI_API_KEY configured, skipping")
        return {"processed": 0, "succeeded": 0, "failed": 0, "error": "No API key"}

    from openai import OpenAI as _OpenAI
    client = _OpenAI(api_key=api_key)

    role_context = ROLE_PROMPTS.get(role, ROLE_PROMPTS["other"])

    # Fetch trends
    try:
        result = supabase.table("trends").select("id,topic,category,data,deepdive_status,deepdive").order("created_at", desc=True).limit(200).execute()
        all_trends = result.data or []

        if force:
            # Re-generate ALL trends (cleanup mode)
            trends_to_process = all_trends
            print(f"[BatchDeepDive] FORCE MODE: Re-generating ALL {len(trends_to_process)} trends", flush=True)
        else:
            # Only process trends without deep dives
            trends_to_process = [t for t in all_trends if t.get("deepdive_status") is None or t.get("deepdive_status") == "error"]
            print(f"[BatchDeepDive] Found {len(trends_to_process)} trends needing deep dives (of {len(all_trends)} total)", flush=True)
    except Exception as e:
        print(f"[BatchDeepDive] DB query failed: {e}")
        return {"processed": 0, "succeeded": 0, "failed": 0, "error": str(e)}

    if not trends_to_process:
        print("[BatchDeepDive] No trends need deep dives")
        return {"processed": 0, "succeeded": 0, "failed": 0}

    processed = 0
    succeeded = 0
    failed = 0

    for row in trends_to_process:
        trend_id = row.get("id")
        topic = row.get("topic") or ""
        data = row.get("data") or {}
        summary = data.get("summary", "") if isinstance(data, dict) else ""

        if not topic:
            print(f"[BatchDeepDive] Skipping {trend_id} - no topic")
            continue

        processed += 1
        print(f"[BatchDeepDive] Processing {processed}/{len(trends_to_process)}: {topic[:50]}...")

        # Mark as generating
        try:
            supabase.table("trends").update({"deepdive_status": "generating"}).eq("id", trend_id).execute()
        except Exception as e:
            print(f"[BatchDeepDive] Failed to set generating status: {e}")

        # Generate deep dive (NO URLs in sources - GPT cannot generate valid URLs)
        try:
            prompt = f"""You are a strategic enterprise technology analyst writing for a {role.replace('_', ' ')}.

Topic: {topic}
Summary: {summary}

Role Focus: {role_context}

Return ONLY valid JSON with this exact structure:
{{
  "what_it_is": "2-3 paragraph explanation of what this trend is and why it matters",
  "enterprise_impact": "2-3 paragraphs on business and enterprise impact, tailored to the reader's role",
  "action_plan": "3 concrete next steps the reader should take, as a numbered list",
  "sources": [
    {{"number": 1, "title": "Relevant article or publication title", "publisher": "Publisher name", "snippet": "1-2 sentence summary"}},
    {{"number": 2, "title": "Second source title", "publisher": "Publisher name", "snippet": "Brief summary"}},
    {{"number": 3, "title": "Third source title", "publisher": "Publisher name", "snippet": "Brief summary"}}
  ]
}}

IMPORTANT: Do NOT include any "url" field in sources. URLs are handled separately.
Use real authoritative publishers: MIT Technology Review, Harvard Business Review, TechCrunch, VentureBeat, arXiv, Wired, Forbes, etc.

Write as a senior analyst. Be specific and actionable.
Return ONLY the JSON object, no markdown."""

            resp = await asyncio.to_thread(
                client.chat.completions.create,
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a JSON API. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=1000,
            )
            deep_dive_raw = resp.choices[0].message.content.strip()
            deep_dive_json = json.loads(deep_dive_raw)

            # Ensure sources exist (no URLs)
            if "sources" not in deep_dive_json or not deep_dive_json["sources"]:
                deep_dive_json["sources"] = [
                    {"number": 1, "title": f"Understanding {topic}", "publisher": "Industry Analysis", "snippet": "Expert analysis."},
                    {"number": 2, "title": "Enterprise Impact", "publisher": "Business Review", "snippet": "Business implications."},
                    {"number": 3, "title": "Implementation Guide", "publisher": "Tech Guide", "snippet": "Practical steps."}
                ]

            # Save to DB
            supabase.table("trends").update({
                "deepdive": json.dumps(deep_dive_json),
                "deepdive_status": "done",
                "user_role": role,
                "generated_data": datetime.utcnow().isoformat(),
            }).eq("id", trend_id).execute()

            succeeded += 1
            print(f"[BatchDeepDive] ✓ Saved deep dive for: {topic[:40]}")

        except Exception as e:
            failed += 1
            print(f"[BatchDeepDive] ✗ Failed for {topic[:40]}: {e}")
            try:
                supabase.table("trends").update({"deepdive_status": "error"}).eq("id", trend_id).execute()
            except:
                pass

        # Rate limit delay
        await asyncio.sleep(2)

    print(f"[BatchDeepDive] Complete: {processed} processed, {succeeded} succeeded, {failed} failed")
    return {"processed": processed, "succeeded": succeeded, "failed": failed}


@app.post("/api/trends/generate-all-deepdives")
async def generate_all_deepdives_endpoint(role: str = Query("cto"), force: bool = Query(False)):
    """Trigger batch deep dive generation.

    Args:
        role: User role for personalized content
        force: If true, re-generate ALL trends (cleanup mode for bad URLs)
    """
    asyncio.create_task(batch_generate_deepdives(role, force))
    return {
        "message": f"Batch deep dive generation started in background{' (FORCE MODE)' if force else ''}",
        "role": role,
        "force": force,
        "status": "started"
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ROLE-BASED RECOMMENDATIONS
# Supabase table migration (run once):
# CREATE TABLE IF NOT EXISTS role_recommendations (
#   role TEXT PRIMARY KEY,
#   trends JSONB,
#   updated_at TIMESTAMPTZ DEFAULT NOW()
# );
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/api/recommendations")
def get_recommendations(role: str = Query("other")):
    """
    Returns top 5 role-specific trend recommendations.
    Cached per-role for 6 hours in role_recommendations table.
    All users with same role see the same recommendations.
    """
    user_role = role if role in ROLE_CATEGORY_WEIGHTS else "other"

    # ── 1. Check cache (< 6h old) ────────────────────────────────────────────
    try:
        cutoff_6h = (datetime.utcnow() - timedelta(hours=6)).isoformat()
        cached = supabase.table("role_recommendations").select("*").eq("role", user_role).gte("updated_at", cutoff_6h).limit(1).execute()
        if cached.data and cached.data[0].get("trends"):
            cached_trends = cached.data[0]["trends"]
            if isinstance(cached_trends, str):
                cached_trends = json.loads(cached_trends)
            print(f"[Recommendations] Cache hit for role={user_role}, {len(cached_trends)} trends")
            return {"trends": cached_trends, "role": user_role, "cached": True}
    except Exception as e:
        print(f"[Recommendations] Cache check error: {e}")

    # ── 2. Get all trends from DB or in-memory cache ─────────────────────────
    all_trends, _ = get_cached_trends()
    if not all_trends:
        try:
            rows = supabase.table("trends").select("*").order("created_at", desc=True).limit(50).execute()
            if rows.data:
                all_trends = [dict(row.get("data") or {}) for row in rows.data if row.get("data")]
        except Exception as e:
            print(f"[Recommendations] DB fallback error: {e}")

    if not all_trends:
        return {"trends": [], "role": user_role, "cached": False}

    # ── 3. Apply role weights and score ──────────────────────────────────────
    weights = ROLE_CATEGORY_WEIGHTS.get(user_role, ROLE_CATEGORY_WEIGHTS["other"])
    scored_trends = []
    for trend in all_trends:
        category = trend.get("category", "llm_models")
        role_weight = weights.get(category, 5)
        base_score = trend.get("score", trend.get("trend_score", 5))
        if isinstance(base_score, str):
            try:
                base_score = float(base_score)
            except:
                base_score = 5
        # Combined score: base score × role relevance
        role_score = round((base_score * 0.6) + (role_weight * 0.4), 1)
        scored_trends.append({**trend, "role_score": role_score})

    # ── 4. Sort and take top 5 ───────────────────────────────────────────────
    scored_trends.sort(key=lambda x: x.get("role_score", 0), reverse=True)
    top5 = scored_trends[:5]

    # ── 5. Save to cache ─────────────────────────────────────────────────────
    try:
        supabase.table("role_recommendations").upsert({
            "role": user_role,
            "trends": top5,
            "updated_at": datetime.utcnow().isoformat(),
        }).execute()
        print(f"[Recommendations] Cached {len(top5)} trends for role={user_role}")
    except Exception as e:
        print(f"[Recommendations] Cache save error: {e}")

    return {"trends": top5, "role": user_role, "cached": False}


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


# ── V4 Sprint 3: Alert preference routes ─────────────────────────────────────

from pydantic import BaseModel as _BaseModel

class AlertPreferencesRequest(_BaseModel):
    keywords:         list  = []
    min_signal_score: int   = 7
    enabled:          bool  = False


@app.get("/api/alerts/preferences")
def get_alert_preferences(request: Request):
    """Get the current user's alert preferences. Creates a default row if none exists."""
    user_id = require_user(request)
    try:
        resp = supabase.table("alert_preferences").select("*").eq("user_id", user_id).execute()
        if resp.data:
            return resp.data[0]
        # No row yet — insert defaults and return
        created = supabase.table("alert_preferences").insert({
            "user_id": user_id,
            "keywords": [],
            "min_signal_score": 7,
            "enabled": False,
        }).execute()
        return created.data[0] if created.data else {
            "user_id": user_id, "keywords": [], "min_signal_score": 7,
            "enabled": False, "last_sent_at": None, "unsubscribe_token": None,
        }
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch alert preferences: {e}")


@app.put("/api/alerts/preferences")
def update_alert_preferences(body: AlertPreferencesRequest, request: Request):
    """Update the current user's alert preferences."""
    user_id = require_user(request)

    # Validate signal score range
    if not (1 <= body.min_signal_score <= 10):
        raise HTTPException(422, "min_signal_score must be between 1 and 10")

    # Only allow enabling if email is verified
    if body.enabled:
        user_resp = supabase.table("users").select("is_verified").eq("id", user_id).execute()
        if not user_resp.data or not user_resp.data[0].get("is_verified"):
            raise HTTPException(403, "Email must be verified before enabling alerts")

    # Clean keywords: strip whitespace, remove blanks, max 20
    clean_keywords = [k.strip() for k in (body.keywords or []) if k.strip()][:20]

    try:
        # Upsert — create row if missing, update if present
        existing = supabase.table("alert_preferences").select("id").eq("user_id", user_id).execute()
        if existing.data:
            result = supabase.table("alert_preferences").update({
                "keywords":         clean_keywords,
                "min_signal_score": body.min_signal_score,
                "enabled":          body.enabled,
                "updated_at":       datetime.utcnow().isoformat(),
            }).eq("user_id", user_id).execute()
        else:
            result = supabase.table("alert_preferences").insert({
                "user_id":          user_id,
                "keywords":         clean_keywords,
                "min_signal_score": body.min_signal_score,
                "enabled":          body.enabled,
            }).execute()
        return result.data[0] if result.data else {"ok": True}
    except Exception as e:
        raise HTTPException(500, f"Failed to update alert preferences: {e}")


@app.get("/api/alerts/unsubscribe/{token}")
def unsubscribe_alerts(token: str):
    """
    One-click unsubscribe — no auth required (linked from email footer).
    Disables alerts for the user matching the token.
    """
    try:
        resp = supabase.table("alert_preferences").select("user_id,enabled").eq(
            "unsubscribe_token", token
        ).execute()
        if not resp.data:
            raise HTTPException(404, "Invalid or expired unsubscribe link")
        pref = resp.data[0]
        if not pref.get("enabled"):
            return {"ok": True, "message": "Alerts already disabled"}
        supabase.table("alert_preferences").update({"enabled": False}).eq(
            "unsubscribe_token", token
        ).execute()
        return {"ok": True, "message": "Unsubscribed — alerts have been disabled"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Unsubscribe failed: {e}")


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

    # ── Load cached trends from DB into in-memory cache ───────────────────
    try:
        from trends_service import _trends_cache as _tc, _trends_last_updated
        rows = supabase.table("trends").select("*").order("created_at", desc=True).limit(50).execute()
        if rows.data:
            loaded = []
            for row in rows.data:
                t = dict(row.get("data") or {})
                t["watchlisted"] = row.get("watchlisted", False)
                if row.get("deepdive"):
                    t["deep_dive"] = row["deepdive"]
                loaded.append(t)
            _tc.clear()
            _tc.extend(loaded)
            import trends_service as _ts
            _ts._trends_last_updated = rows.data[0].get("created_at") if rows.data else None
            print(f"✅ Loaded {len(loaded)} trend(s) from DB into memory cache")
        else:
            print("ℹ️  No trends in DB — cache empty (use /api/trends/refresh to fetch)")
    except Exception as e:
        print(f"⚠️  Trends DB load failed: {e}")

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

_newsletter_schedule = {
    "days": ["Mon", "Wed", "Fri"],
    "hour": 7,
    "minute": 0,
    "frequency": "Weekly",
    "enabled": False,
}

_newsletter_sent_history: list = []


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


def _do_send_newsletter(recipients: list, subject: str, sector_data: dict) -> dict:
    """
    Synchronous SMTP send — raises on failure so callers get real errors.
    Uses the recipients list directly instead of env var.
    """
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart

    cfg = newsletter_module.get_smtp_config()

    if not cfg.get("username") or not cfg.get("password"):
        raise ValueError("SMTP not configured — set SMTP_USERNAME and SMTP_PASSWORD in config/.env")

    if not recipients:
        raise ValueError("No recipients — add at least one email in Step 3")

    # Flatten sector_data → article list for HTML generation
    articles_list = [a for arts in sector_data.values() for a in arts]
    html = newsletter_module.generate_newsletter_html(articles_list)
    newsletter_module.save_newsletter_html(html)

    plain = f"AI Watch Intelligence Brief\n{datetime.now().strftime('%B %d, %Y')}\nView this email in HTML for the best experience."

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = cfg["username"]
    msg["To"]      = ", ".join(recipients)
    msg.attach(MIMEText(plain, "plain", "utf-8"))
    msg.attach(MIMEText(html,  "html",  "utf-8"))

    host = cfg.get("host", "smtp.gmail.com")
    port = int(cfg.get("port", 587))
    print(f"[Newsletter] Connecting to {host}:{port} as {cfg['username']} → {recipients}")

    with smtplib.SMTP(host, port, timeout=30) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(cfg["username"], cfg["password"])
        server.sendmail(cfg["username"], recipients, msg.as_string())

    print(f"[Newsletter] ✅ Sent to {recipients}")
    return {"sent_to": recipients, "article_count": len(articles_list)}


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
async def send_newsletter_now(request: Request):
    """
    Send newsletter immediately.
    Accepts optional JSON body: { recipients, subject, article_ids, config }
    Falls back to file recipients + DB articles if body fields are absent.
    Runs synchronously and returns the real success/error — no silent failures.
    """
    if _newsletter_state["sending"]:
        raise HTTPException(status_code=409, detail="A send is already in progress.")

    # ── Parse optional request body ──────────────────────────────────────────
    body: dict = {}
    try:
        body = await request.json()
    except Exception:
        pass  # body is optional — plain send with no customisation is fine

    wizard_recipients = body.get("recipients") or []
    wizard_subject    = body.get("subject")    or f"AI Watch Intelligence Brief · {datetime.now().strftime('%B %d, %Y')}"
    article_ids       = body.get("article_ids") or []

    # ── Resolve recipients ────────────────────────────────────────────────────
    recipients = wizard_recipients or _load_recipients_file()
    if not recipients:
        raise HTTPException(status_code=400, detail="No recipients configured. Add recipients in Step 3.")

    # ── Build article content ─────────────────────────────────────────────────
    _newsletter_state["sending"] = True
    try:
        if article_ids:
            # Use the specific articles selected in the wizard
            all_arts = _fetch_all_articles()
            id_set   = set(str(i) for i in article_ids)
            selected = [a for a in all_arts if str(a.get("id", a.get("title", ""))) in id_set]
            sector_data: dict = {}
            for a in selected:
                sector = a.get("topic") or a.get("industry") or "General"
                sector_data.setdefault(sector, []).append(a)
            if not sector_data:
                sector_data = _build_sector_data_for_newsletter()
        else:
            sector_data = _build_sector_data_for_newsletter()

        result = _do_send_newsletter(recipients, wizard_subject, sector_data)

        # Record in history
        _newsletter_state["last_sent"]   = datetime.now().isoformat()
        _newsletter_state["last_status"] = "sent"
        _newsletter_sent_history.append({
            "id":              len(_newsletter_sent_history) + 1,
            "sent_at":         _newsletter_state["last_sent"],
            "subject":         wizard_subject,
            "recipient_count": len(recipients),
            "article_count":   result["article_count"],
        })

        return {
            "status":          "sent",
            "recipients":      recipients,
            "recipient_count": len(recipients),
            "article_count":   result["article_count"],
            "subject":         wizard_subject,
        }

    except HTTPException:
        raise
    except Exception as e:
        _newsletter_state["last_status"] = f"error: {type(e).__name__}: {e}"
        print(f"[Newsletter] ❌ Send failed: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=f"SMTP error: {e}")
    finally:
        _newsletter_state["sending"] = False


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


# ── Recipients file helpers (persists across restarts) ─────────────────────
_RECIPIENTS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "recipients.json")

def _load_recipients_file() -> list:
    try:
        if os.path.exists(_RECIPIENTS_FILE):
            with open(_RECIPIENTS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[Recipients] load error: {e}")
    return []

def _save_recipients_file(recipients: list):
    try:
        os.makedirs(os.path.dirname(_RECIPIENTS_FILE), exist_ok=True)
        with open(_RECIPIENTS_FILE, "w", encoding="utf-8") as f:
            json.dump(recipients, f, indent=2)
    except Exception as e:
        print(f"[Recipients] save error: {e}")


@app.get("/api/newsletter/recipients")
def get_newsletter_recipients():
    """List all newsletter recipients from file."""
    recs = _load_recipients_file()
    return {"recipients": recs, "count": len(recs)}


@app.post("/api/newsletter/recipients")
def add_newsletter_recipient(body: dict = Body(...)):
    """Add a recipient to the file-backed list."""
    email = (body.get("email") or "").strip().lower()
    print(f"[Recipients] POST body received: {body}, resolved email: '{email}'")
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Invalid email address")
    recipients = _load_recipients_file()
    if email in recipients:
        raise HTTPException(status_code=409, detail="Email already in list")
    recipients.append(email)
    _save_recipients_file(recipients)
    return {"recipients": recipients}


@app.delete("/api/newsletter/recipients/{email}")
def remove_newsletter_recipient(email: str):
    """Remove a recipient from the file-backed list."""
    email = email.strip().lower()
    recipients = _load_recipients_file()
    if email not in recipients:
        raise HTTPException(status_code=404, detail="Email not found")
    recipients.remove(email)
    _save_recipients_file(recipients)
    return {"recipients": recipients}


@app.get("/api/newsletter/schedule")
def get_newsletter_schedule():
    return _newsletter_schedule


@app.post("/api/newsletter/schedule")
def save_newsletter_schedule(data: dict = Body(...)):
    _newsletter_schedule.update(data)
    return {"status": "saved", "schedule": _newsletter_schedule}


@app.get("/api/newsletter/sent")
def get_sent_history():
    return {"history": list(reversed(_newsletter_sent_history))}


# ────────────────────────────────────────────────────────────────────────────────
# DXC ONETEAM Newsletter Articles API
# ────────────────────────────────────────────────────────────────────────────────

@app.get("/api/dxc-newsletters")
def get_dxc_newsletters(
    month: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """Get paginated list of DXC newsletter articles with optional filters."""
    try:
        query = supabase.table("dxc_newsletter_articles").select("*")

        if month:
            query = query.eq("month", month)
        if category:
            query = query.eq("category", category)
        if search:
            # Search in title and content
            query = query.ilike("content", f"%{search}%")

        # Order by month_date descending, then page_number
        query = query.order("month_date", desc=True).order("page_number", desc=False)

        # Pagination
        start = (page - 1) * limit
        end = start + limit - 1
        query = query.range(start, end)

        result = query.execute()
        items = result.data if result.data else []

        # Get total count for pagination
        count_query = supabase.table("dxc_newsletter_articles").select("id")
        if month:
            count_query = count_query.eq("month", month)
        if category:
            count_query = count_query.eq("category", category)
        if search:
            count_query = count_query.ilike("content", f"%{search}%")
        count_result = count_query.execute()
        total = len(count_result.data) if count_result.data else 0

        return {
            "items": items,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit if total > 0 else 1,
        }
    except Exception as e:
        print(f"[DXC Newsletter] Error fetching articles: {e}")
        return {"items": [], "total": 0, "page": 1, "pages": 1}


@app.get("/api/dxc-newsletters/filters")
def get_dxc_newsletter_filters():
    """Get available filter options for DXC newsletters."""
    try:
        # Get unique months with dates
        months_result = supabase.table("dxc_newsletter_articles").select("month, month_date").execute()
        months_data = months_result.data if months_result.data else []

        # Deduplicate and sort by date descending
        month_map = {}
        for row in months_data:
            m = row.get("month")
            d = row.get("month_date")
            if m and m not in month_map:
                month_map[m] = d

        sorted_months = sorted(
            [{"label": m, "value": m, "date": d} for m, d in month_map.items()],
            key=lambda x: x["date"] or "",
            reverse=True
        )

        # Get unique categories
        cats_result = supabase.table("dxc_newsletter_articles").select("category").execute()
        cats_data = cats_result.data if cats_result.data else []
        unique_cats = sorted(set(row.get("category") for row in cats_data if row.get("category")))

        return {
            "months": sorted_months,
            "categories": unique_cats,
        }
    except Exception as e:
        print(f"[DXC Newsletter] Error fetching filters: {e}")
        return {"months": [], "categories": []}


@app.get("/api/dxc-newsletters/{article_id}")
def get_dxc_newsletter_article(article_id: str):
    """Get a single DXC newsletter article by ID."""
    try:
        result = supabase.table("dxc_newsletter_articles").select("*").eq("id", article_id).execute()
        if result.data and len(result.data) > 0:
            return result.data[0]
        raise HTTPException(status_code=404, detail="Article not found")
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DXC Newsletter] Error fetching article {article_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch article")


# -- Run in Supabase SQL Editor:
# ALTER TABLE dxc_newsletter_articles ADD COLUMN IF NOT EXISTS journal_card TEXT;
# NOTIFY pgrst, 'reload schema';

@app.post("/api/dxc-newsletters/{article_id}/journal-card")
async def generate_dxc_journal_card(article_id: str):
    """Generate or retrieve an AI-generated journal card for a DXC newsletter article."""
    try:
        # 1. Fetch the article
        result = supabase.table("dxc_newsletter_articles").select("*").eq("id", article_id).execute()
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Article not found")

        article = result.data[0]

        # 2. Check if journal_card already exists (cached)
        existing_card = article.get("journal_card")
        if existing_card:
            try:
                return json.loads(existing_card)
            except json.JSONDecodeError:
                pass  # Re-generate if invalid JSON

        # 3. Generate with GPT-4o-mini
        import openai

        title = article.get("title", "Untitled")
        category = article.get("category", "General")
        month = article.get("month", "")
        content = article.get("content", "")[:2000]  # Truncate to 2000 chars

        prompt = f"""You are a DXC Technology internal communications analyst.
Analyze this newsletter article and return ONLY valid JSON with this exact structure:
{{
  "headline": "One powerful sentence summarizing the key message (max 15 words)",
  "context": "2-3 sentences of business context explaining why this matters",
  "key_points": [
    {{ "label": "Short label", "text": "1-2 sentence explanation" }},
    {{ "label": "Short label", "text": "1-2 sentence explanation" }},
    {{ "label": "Short label", "text": "1-2 sentence explanation" }}
  ],
  "stats": [],
  "takeaway": "One actionable conclusion sentence"
}}

Rules:
- stats: only include if real numbers/metrics exist in the content, format: {{"value": "37M MAD", "label": "Revenue"}}
- key_points: 2 to 4 points maximum
- All text in the SAME language as the article (French or English)
- Professional DXC executive style — concise and factual

Article title: {title}
Category: {category}
Month: {month}
Content: {content}"""

        keys = _openai_keys()
        if not keys:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")

        client = openai.OpenAI(api_key=keys[0])
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800,
            response_format={"type": "json_object"},
        )

        raw_response = response.choices[0].message.content.strip()
        journal_card = json.loads(raw_response)

        # 4. Save to Supabase (non-fatal if column doesn't exist)
        try:
            supabase.table("dxc_newsletter_articles").update({
                "journal_card": json.dumps(journal_card)
            }).eq("id", article_id).execute()
        except Exception:
            pass  # Still return the generated card even if save fails

        return journal_card

    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        print(f"[DXC Journal Card] JSON parse error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse AI response")
    except Exception as e:
        print(f"[DXC Journal Card] Error generating card for {article_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate journal card: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
