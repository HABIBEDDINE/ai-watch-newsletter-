import os, httpx, json, logging
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path

_ENV_PATH = Path(__file__).resolve().parent.parent / "config" / ".env"
load_dotenv(_ENV_PATH, override=True)

logger = logging.getLogger(__name__)

TREND_QUERIES = [
    {
        "category": "llm_models",
        "label": "LLM Models",
        "icon": "🧠",
        "query": "What new AI language models were released or announced in the last 30 days? Include GPT, Claude, Gemini, Llama, Mistral, DeepSeek. What are developers and enterprises saying about them? Which is winning for enterprise use cases?"
    },
    {
        "category": "dev_tools",
        "label": "Dev & Coding AI",
        "icon": "⌨️",
        "query": "What AI coding and developer tools are trending right now in 2026? What are software engineers switching to? Include Cursor, GitHub Copilot, Claude Code, Aider, Devin, Windsurf. Which tool are enterprise dev teams adopting?"
    },
    {
        "category": "ai_agents",
        "label": "AI Agents",
        "icon": "🤖",
        "query": "What AI agent frameworks and automation tools are trending for enterprise use in 2026? Include LangChain, CrewAI, AutoGPT, n8n, Zapier AI, Microsoft AutoGen. What are companies actually deploying in production?"
    },
    {
        "category": "open_source",
        "label": "Open Source AI",
        "icon": "🔓",
        "query": "What open source AI models and frameworks are gaining the most traction in 2026? What GitHub repositories are blowing up this month? What are compliance-sensitive enterprises (banking, government) using as OpenAI alternatives?"
    },
    {
        "category": "ai_infrastructure",
        "label": "AI Infrastructure",
        "icon": "⚙️",
        "query": "What AI infrastructure tools are trending for enterprise deployment in 2026? Include RAG frameworks, vector databases (Pinecone, Weaviate, Chroma), MLOps platforms, GPU cloud providers. What stack are CTOs choosing?"
    },
    {
        "category": "enterprise_apps",
        "label": "Enterprise AI Apps",
        "icon": "🏢",
        "query": "What enterprise AI applications and SaaS tools are companies adopting right now in 2026? Include Microsoft Copilot, Salesforce Einstein, Notion AI, SAP AI, ServiceNow AI. What are Strategy Directors tracking as competitive moves?"
    },
]

_trends_cache = []
_trends_last_updated = None

_VALID_CATEGORIES = {q["category"] for q in TREND_QUERIES}
_LABEL_TO_ID = {q["label"].lower(): q["category"] for q in TREND_QUERIES}


def _normalize_category(raw: str) -> str:
    if not raw:
        return "llm_models"
    slug = raw.lower().strip().replace(" ", "_").replace("-", "_")
    if slug in _VALID_CATEGORIES:
        return slug
    return _LABEL_TO_ID.get(raw.lower().strip(), "llm_models")


PERPLEXITY_ENABLED = True  # Enabled for daily 8AM refresh


async def fetch_perplexity_trend(query: str, category: str) -> dict:
    if not PERPLEXITY_ENABLED:
        print(f"[Perplexity][{category}] ⏸ Perplexity API is disabled (PERPLEXITY_ENABLED=False)")
        return None

    # Re-read .env so a key change takes effect without restarting the server
    load_dotenv(_ENV_PATH, override=True)
    api_key = os.getenv("PERPLEXITY_API_KEY")

    # --- Step 1: key check ---
    if not api_key:
        print(f"[Perplexity][{category}] ❌ PERPLEXITY_API_KEY is not set or empty in environment")
        logger.error("[Perplexity][%s] PERPLEXITY_API_KEY missing", category)
        return None

    key_preview = api_key[:8] + "..." + api_key[-4:]
    print(f"[Perplexity][{category}] 🔑 Key loaded: {key_preview}")

    payload = {
        "model": "sonar-pro",
        "messages": [{"role": "user", "content": query}],
        "max_tokens": 800,
    }
    print(f"[Perplexity][{category}] 📤 Sending request — model: {payload['model']}")

    try:
        async with httpx.AsyncClient(verify=False, timeout=30) as client:
            resp = await client.post(
                "https://api.perplexity.ai/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )

        # --- Step 2: HTTP status ---
        print(f"[Perplexity][{category}] 📥 HTTP status: {resp.status_code}")

        raw_text = resp.text
        print(f"[Perplexity][{category}] 📄 Raw response (first 300 chars): {raw_text[:300]}")

        if resp.status_code != 200:
            print(f"[Perplexity][{category}] ❌ Non-200 status. Full body: {raw_text[:800]}")
            logger.error("[Perplexity][%s] HTTP %s — %s", category, resp.status_code, raw_text[:400])
            return None

        # --- Step 3: parse JSON ---
        try:
            data = json.loads(raw_text)
        except json.JSONDecodeError as je:
            print(f"[Perplexity][{category}] ❌ JSON decode failed: {je} | raw: {raw_text[:400]}")
            logger.error("[Perplexity][%s] JSON decode error: %s", category, je)
            return None

        # --- Step 4: extract choices ---
        if "choices" not in data:
            print(f"[Perplexity][{category}] ❌ 'choices' key missing. Keys present: {list(data.keys())}")
            print(f"[Perplexity][{category}] Full response: {json.dumps(data)[:600]}")
            logger.error("[Perplexity][%s] No 'choices' in response: %s", category, data)
            return None

        content = data["choices"][0]["message"]["content"]
        print(f"[Perplexity][{category}] ✅ Got content ({len(content)} chars)")
        return {"category": category, "raw": content}

    except httpx.TimeoutException as te:
        print(f"[Perplexity][{category}] ❌ Request timed out: {te}")
        logger.error("[Perplexity][%s] Timeout: %s", category, te)
        return None
    except Exception as e:
        print(f"[Perplexity][{category}] ❌ Unexpected error: {type(e).__name__}: {e}")
        logger.error("[Perplexity][%s] Unexpected error: %s", category, e, exc_info=True)
        return None


async def cluster_and_score_trends(raw_results: list) -> list:
    """Use LLM to extract structured trend objects from raw Perplexity responses."""
    import asyncio

    print(f"[Clustering] 🧠 Starting — {len(raw_results)} raw Perplexity results to process")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("[Clustering] ❌ OPENAI_API_KEY is not set — cannot cluster trends")
        logger.error("[Clustering] OPENAI_API_KEY missing")
        return []

    print(f"[Clustering] 🔑 OpenAI key loaded: {api_key[:8]}...{api_key[-4:]}")

    from openai import OpenAI
    client = OpenAI(api_key=api_key)

    combined = "\n\n".join([
        f"CATEGORY: {r['category']}\n{r['raw']}"
        for r in raw_results if r
    ])
    print(f"[Clustering] 📝 Combined input length: {len(combined)} chars (capped at 6000)")

    prompt = f"""You are a strategic AI analyst for enterprise technology leaders (CTOs, Innovation Managers).

From the following raw AI trend intelligence, extract the TOP 12 most important trends.

For each trend return a JSON object with:
- topic: short punchy name (max 6 words)
- category: one of [llm_models, dev_tools, ai_agents, open_source, ai_infrastructure, enterprise_apps]
- score: strategic importance 1-10 for enterprise adoption
- momentum: percentage string like "+45%" or "+12%"
- summary: ONE paragraph, 3-4 sentences. Answer: WHAT is this, WHY it matters for enterprise, WHO should pay attention, WHAT to do next. Never restate the topic name. Write as a strategic analyst, not a journalist.
- tags: array of 2-3 relevant tags
- url: most relevant source URL if mentioned, else null

Return ONLY a JSON object with a "trends" array, no other text.

RAW INTELLIGENCE:
{combined[:6000]}"""

    try:
        print("[Clustering] 📤 Calling gpt-4o-mini for trend extraction...")
        resp = await asyncio.to_thread(
            client.chat.completions.create,
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            max_tokens=2000,
        )
        content = resp.choices[0].message.content
        print(f"[Clustering] 📥 OpenAI response received ({len(content)} chars)")

        data = json.loads(content)
        trends = data.get("trends", data) if isinstance(data, dict) else data

        if not isinstance(trends, list):
            print(f"[Clustering] ❌ Parsed 'trends' is not a list — got: {type(trends)}")
            return []

        print(f"[Clustering] ✅ Extracted {len(trends)} trends from LLM")

        for i, t in enumerate(trends):
            raw_cat = t.get("category", "")
            t["category"] = _normalize_category(raw_cat)
            print(f"[Clustering]   [{i+1}] '{t.get('topic','?')}' — category: '{raw_cat}' → '{t['category']}' | score: {t.get('score','?')}")
            t["id"] = f"trend_{i}_{datetime.now().strftime('%Y%m%d%H%M')}"
            t["detected_at"] = datetime.now(timezone.utc).isoformat()
            t["saved"] = False
            t["deep_dive"] = None

        sorted_trends = sorted(trends, key=lambda x: x.get("score", 0), reverse=True)
        print(f"[Clustering] 🏁 Done — returning {len(sorted_trends)} sorted trends")
        return sorted_trends

    except json.JSONDecodeError as je:
        print(f"[Clustering] ❌ JSON parse error on OpenAI response: {je}")
        logger.error("[Clustering] JSON parse error: %s", je)
        return []
    except Exception as e:
        print(f"[Clustering] ❌ Unexpected error: {type(e).__name__}: {e}")
        logger.error("[Clustering] Unexpected error: %s", e, exc_info=True)
        return []


async def cluster_free_sources(items: list) -> list:
    """
    Use GPT-4o-mini to extract structured trends from multi-source items.
    Supports channel weighting with trust scores: OFFICIAL, RESEARCH, MEDIA, YOUTUBE, HN, RD, AX, GH, NL
    Cost: ~$0.01/day (vs ~$0.30/day with Perplexity)
    """
    import asyncio

    if not items:
        print("[Clustering] ⚠️ No items provided")
        return []

    print(f"[Clustering] 🧠 Processing {len(items)} items from multiple sources")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("[Clustering] ❌ OPENAI_API_KEY is not set")
        return []

    from openai import OpenAI
    client = OpenAI(api_key=api_key)

    # Build prompt with trust-weighted channel signals
    from free_sources import build_clustering_prompt
    prompt = build_clustering_prompt(items)

    # Debug logging
    print(f"[Clustering] 📊 Sending {min(len(items), 120)} items to GPT")
    print(f"[Clustering] 📊 Prompt length: {len(prompt)} chars")

    try:
        print("[Clustering] 📤 Calling gpt-4o-mini with trust-weighted prompt...")
        resp = await asyncio.to_thread(
            client.chat.completions.create,
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a JSON API. Return a JSON object with a 'trends' array containing 12-15 trend items. Always return at least 12 trends."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=4500,
            temperature=0.3,
        )
        content = resp.choices[0].message.content
        print(f"[Clustering] 📥 Response received ({len(content)} chars)")
        print(f"[Clustering] 📥 Response preview: {content[:300]}...")

        data = json.loads(content)
        trends = data.get("trends", data) if isinstance(data, dict) else data

        if not isinstance(trends, list):
            print(f"[Clustering] ❌ 'trends' is not a list")
            return []

        print(f"[Clustering] ✅ Extracted {len(trends)} trends")

        # Retry if too few trends
        if len(trends) < 8:
            print(f"[Clustering] ⚠️ WARNING: only {len(trends)} trends returned, retrying...")
            retry_prompt = prompt + f"\n\nIMPORTANT: You returned only {len(trends)} trends. This is too few. You MUST return at least 12 trends. Look harder for distinct topics in the {min(len(items), 120)} items provided."

            retry_resp = await asyncio.to_thread(
                client.chat.completions.create,
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a JSON API. Return a JSON object with a 'trends' array containing 12-15 items. This is a retry - you must find more trends."},
                    {"role": "user", "content": retry_prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=4500,
                temperature=0.5,
            )
            retry_content = retry_resp.choices[0].message.content
            retry_data = json.loads(retry_content)
            retry_trends = retry_data.get("trends", [])
            if len(retry_trends) > len(trends):
                trends = retry_trends
                print(f"[Clustering] ✅ After retry: {len(trends)} trends")

        for i, t in enumerate(trends):
            raw_cat = t.get("category", "")
            t["category"] = _normalize_category(raw_cat)
            t["id"] = f"trend_{i}_{datetime.now().strftime('%Y%m%d%H%M')}"
            t["detected_at"] = datetime.now(timezone.utc).isoformat()
            t["saved"] = False
            t["deep_dive"] = None

            # Map trend_score to score for backwards compatibility
            if "trend_score" in t and "score" not in t:
                t["score"] = t["trend_score"]
            elif "score" not in t:
                t["score"] = 5

            # Keep channel info for transparency
            if "channels" not in t:
                t["channels"] = ["NL"]

            # Ensure primary_source exists
            if "primary_source" not in t:
                t["primary_source"] = None

            # Ensure why_trending exists
            if "why_trending" not in t:
                t["why_trending"] = ""

            # Ensure trend_trigger exists
            if "trend_trigger" not in t:
                t["trend_trigger"] = None

        # Attach raw sources to each trend
        trends = attach_sources_to_trends(trends, items)

        return sorted(trends, key=lambda x: x.get("score", 0), reverse=True)

    except Exception as e:
        print(f"[Clustering] ❌ Error: {type(e).__name__}: {e}")
        logger.error("[Clustering] Error: %s", e, exc_info=True)
        return []


def attach_sources_to_trends(trends: list, raw_items: list) -> list:
    """
    After clustering, find all raw items that match each trend.
    These become the trend's multiple verified sources.
    Groups by: OFFICIAL first, then RESEARCH, then MEDIA, then community
    """
    for trend in trends:
        topic = trend.get("topic", "").lower()
        tags = [t.lower() for t in trend.get("tags", [])]

        # Keywords to match against
        keywords = set()
        for word in topic.split():
            if len(word) > 3:
                keywords.add(word.lower())
        for tag in tags:
            keywords.add(tag.lower())

        matching = []
        for item in raw_items:
            item_text = (
                item.get("title", "") + " " +
                item.get("summary", "")
            ).lower()

            match_count = sum(
                1 for kw in keywords if kw in item_text
            )

            if match_count >= 2:
                matching.append({
                    "title": item.get("title", ""),
                    "url": item.get("url", ""),
                    "source": item.get("source", ""),
                    "org": item.get("org", ""),
                    "channel": item.get("channel", "NL"),
                    "trust_score": item.get("trust_score", 5),
                    "is_verified": item.get("is_verified", False),
                    "published": item.get("published", ""),
                })

        # Sort: verified first, then by trust score
        matching.sort(
            key=lambda x: (x["is_verified"], x["trust_score"]),
            reverse=True
        )

        trend["all_sources"] = matching[:6]  # max 6 sources
        trend["verified_source_count"] = sum(
            1 for s in matching if s["is_verified"]
        )

    return trends


async def cluster_rss_trends(rss_articles: list) -> list:
    """
    Legacy function for RSS-only clustering.
    Now wraps cluster_free_sources for backwards compatibility.
    """
    # Convert RSS articles to standard item format
    items = []
    for a in rss_articles:
        items.append({
            "title": a.get("title", ""),
            "summary": a.get("description", "")[:300],
            "url": a.get("url", ""),
            "source": a.get("source", "RSS"),
            "channel": "NL",
        })
    return await cluster_free_sources(items)


async def refresh_trends(rss_articles: list = None) -> list:
    """
    Refresh trends using RSS articles (free) or Perplexity (paid fallback).

    Cost optimization:
    - Primary: RSS feeds → GPT-4o-mini clustering (~$0.01/day)
    - Fallback: Perplexity queries (~$0.30/day) — only if RSS fails
    """
    global _trends_cache, _trends_last_updated

    import asyncio

    # Try RSS-based approach first (FREE)
    if rss_articles and len(rss_articles) >= 10:
        print(f"[refresh_trends] 🆓 Using {len(rss_articles)} RSS articles (cost: $0)")
        _trends_cache = await cluster_rss_trends(rss_articles)
        if _trends_cache:
            _trends_last_updated = datetime.now(timezone.utc).isoformat()
            print(f"[refresh_trends] ✅ RSS-based refresh complete — {len(_trends_cache)} trends")
            return _trends_cache
        print("[refresh_trends] ⚠️ RSS clustering failed, falling back to Perplexity")

    # Fallback to Perplexity (PAID)
    print(f"[refresh_trends] 💰 Falling back to Perplexity — {len(TREND_QUERIES)} categories")

    tasks = [fetch_perplexity_trend(q["query"], q["category"]) for q in TREND_QUERIES]
    raw_results = await asyncio.gather(*tasks)

    successful = [r for r in raw_results if r]
    failed = len(raw_results) - len(successful)
    print(f"[refresh_trends] 📊 Perplexity results: {len(successful)} succeeded, {failed} failed")

    if not successful:
        print("[refresh_trends] ❌ All Perplexity fetches failed — cache unchanged")
        logger.error("[refresh_trends] All Perplexity fetches returned None")
        return _trends_cache

    _trends_cache = await cluster_and_score_trends(successful)
    _trends_last_updated = datetime.now(timezone.utc).isoformat()
    print(f"[refresh_trends] ✅ Cache updated — {len(_trends_cache)} trends, timestamp: {_trends_last_updated}")

    return _trends_cache


def get_cached_trends():
    return _trends_cache, _trends_last_updated
