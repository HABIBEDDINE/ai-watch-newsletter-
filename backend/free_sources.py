"""
Free data sources for AI trend intelligence.
All APIs are free, no authentication required.

Sources:
- TIER 1: Official Company Blogs (RSS, trust 10/10)
- TIER 2: Verified Research Publications (trust 8/10)
- TIER 3: Verified Tech Media (trust 7/10)
- YouTube Verified Channels (RSS)
- HackerNews (Algolia API) - AI posts with >10 points
- Reddit (public JSON) - Top AI subreddits
- arXiv (XML API) - Latest AI/ML/NLP papers
- GitHub Trending - AI repositories

Total cost: $0.00/month
"""

import asyncio
import httpx
import feedparser
import logging
import re
from datetime import datetime, timedelta
from xml.etree import ElementTree as ET

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# TIER 1 — Official Company Blogs (RSS, free)
# Trust score: 10/10
# ═══════════════════════════════════════════════════════════════════════════════
TIER1_OFFICIAL_BLOGS = [
    {
        "name": "OpenAI Blog",
        "url": "https://openai.com/blog/rss.xml",
        "trust": 10,
        "channel": "OFFICIAL",
        "org": "OpenAI",
    },
    {
        "name": "Anthropic News",
        "url": "https://www.anthropic.com/news/rss",
        "trust": 10,
        "channel": "OFFICIAL",
        "org": "Anthropic",
    },
    {
        "name": "Google DeepMind",
        "url": "https://deepmind.google/blog/rss.xml",
        "trust": 10,
        "channel": "OFFICIAL",
        "org": "Google DeepMind",
    },
    {
        "name": "Meta AI Blog",
        "url": "https://ai.meta.com/blog/rss/",
        "trust": 10,
        "channel": "OFFICIAL",
        "org": "Meta AI",
    },
    {
        "name": "Mistral AI News",
        "url": "https://mistral.ai/news/rss",
        "trust": 10,
        "channel": "OFFICIAL",
        "org": "Mistral AI",
    },
    {
        "name": "Hugging Face Blog",
        "url": "https://huggingface.co/blog/feed.xml",
        "trust": 10,
        "channel": "OFFICIAL",
        "org": "Hugging Face",
    },
    {
        "name": "Google AI Blog",
        "url": "https://blog.research.google/feeds/posts/default/-/AI?alt=rss",
        "trust": 10,
        "channel": "OFFICIAL",
        "org": "Google Research",
    },
    {
        "name": "Microsoft AI Blog",
        "url": "https://blogs.microsoft.com/ai/feed/",
        "trust": 9,
        "channel": "OFFICIAL",
        "org": "Microsoft",
    },
    {
        "name": "AWS Machine Learning",
        "url": "https://aws.amazon.com/blogs/machine-learning/feed/",
        "trust": 9,
        "channel": "OFFICIAL",
        "org": "Amazon AWS",
    },
    {
        "name": "IBM Research AI",
        "url": "https://research.ibm.com/blog/rss",
        "trust": 9,
        "channel": "OFFICIAL",
        "org": "IBM Research",
    },
    {
        "name": "NVIDIA AI Blog",
        "url": "https://blogs.nvidia.com/blog/category/deep-learning/feed/",
        "trust": 9,
        "channel": "OFFICIAL",
        "org": "NVIDIA",
    },
    {
        "name": "Cohere Blog",
        "url": "https://cohere.com/blog/rss",
        "trust": 8,
        "channel": "OFFICIAL",
        "org": "Cohere",
    },
]

# ═══════════════════════════════════════════════════════════════════════════════
# TIER 2 — Verified Research Publications
# Trust score: 8/10
# ═══════════════════════════════════════════════════════════════════════════════
TIER2_RESEARCH = [
    {
        "name": "MIT Technology Review AI",
        "url": "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
        "trust": 8,
        "channel": "RESEARCH",
        "org": "MIT",
    },
    {
        "name": "Nature Machine Intelligence",
        "url": "https://www.nature.com/natmachintell.rss",
        "trust": 8,
        "channel": "RESEARCH",
        "org": "Nature",
    },
    {
        "name": "Papers With Code",
        "url": "https://paperswithcode.com/latest/rss",
        "trust": 8,
        "channel": "RESEARCH",
        "org": "Papers With Code",
    },
    {
        "name": "The Gradient",
        "url": "https://thegradient.pub/rss/",
        "trust": 7,
        "channel": "RESEARCH",
        "org": "The Gradient",
    },
]

# ═══════════════════════════════════════════════════════════════════════════════
# TIER 3 — Verified Tech Media
# Trust score: 7/10
# ═══════════════════════════════════════════════════════════════════════════════
TIER3_MEDIA = [
    {
        "name": "TechCrunch AI",
        "url": "https://techcrunch.com/category/artificial-intelligence/feed/",
        "trust": 7,
        "channel": "MEDIA",
        "org": "TechCrunch",
    },
    {
        "name": "VentureBeat AI",
        "url": "https://venturebeat.com/category/ai/feed/",
        "trust": 7,
        "channel": "MEDIA",
        "org": "VentureBeat",
    },
    {
        "name": "Wired AI",
        "url": "https://www.wired.com/feed/tag/artificial-intelligence/latest/rss",
        "trust": 7,
        "channel": "MEDIA",
        "org": "Wired",
    },
    {
        "name": "The Verge AI",
        "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
        "trust": 7,
        "channel": "MEDIA",
        "org": "The Verge",
    },
    {
        "name": "Ars Technica AI",
        "url": "https://feeds.arstechnica.com/arstechnica/technology-lab",
        "trust": 6,
        "channel": "MEDIA",
        "org": "Ars Technica",
    },
]

# ═══════════════════════════════════════════════════════════════════════════════
# YOUTUBE verified channels (via RSS, free)
# YouTube has official RSS for every channel
# ═══════════════════════════════════════════════════════════════════════════════
YOUTUBE_CHANNELS = [
    {
        "name": "Google DeepMind YouTube",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCP7jMXSY2xbc3KCAE0MHQ-A",
        "trust": 9,
        "channel": "YOUTUBE",
        "org": "Google DeepMind",
    },
    {
        "name": "OpenAI YouTube",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCXZCJLdBC09xxGZ6gcdrc6A",
        "trust": 9,
        "channel": "YOUTUBE",
        "org": "OpenAI",
    },
    {
        "name": "Andrej Karpathy",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCXUPKJO5MZQN67mSJgfCCTn7xBfew",
        "trust": 8,
        "channel": "YOUTUBE",
        "org": "Andrej Karpathy",
    },
    {
        "name": "Two Minute Papers",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCbfYPyITQ-7l4upoX8nvctg",
        "trust": 7,
        "channel": "YOUTUBE",
        "org": "Two Minute Papers",
    },
    {
        "name": "Yannic Kilcher",
        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCZHmQk67mSJgfCCTn7xBfew",
        "trust": 7,
        "channel": "YOUTUBE",
        "org": "Yannic Kilcher",
    },
]

# ═══════════════════════════════════════════════════════════════════════════════
# Trust score weights for trend scoring
# ═══════════════════════════════════════════════════════════════════════════════
CHANNEL_TRUST_WEIGHTS = {
    "OFFICIAL": 10,   # Company official blog
    "RESEARCH": 8,    # Peer-reviewed / academic
    "YOUTUBE":  7,    # Verified YouTube channel
    "MEDIA":    7,    # Established tech media
    "HN":       5,    # HackerNews community
    "RD":       4,    # Reddit community
    "AX":       8,    # arXiv preprint
    "GH":       6,    # GitHub trending
    "NL":       5,    # Newsletter
}


# ═══════════════════════════════════════════════════════════════════════════════
# VERIFIED SOURCES — Fetch from ALL tiered verified primary sources
# ═══════════════════════════════════════════════════════════════════════════════

async def fetch_verified_sources() -> list:
    """
    Fetch from ALL verified primary sources.
    Returns items with trust scores attached.
    """
    all_sources = (
        TIER1_OFFICIAL_BLOGS +
        TIER2_RESEARCH +
        TIER3_MEDIA +
        YOUTUBE_CHANNELS
    )

    items = []

    for source in all_sources:
        try:
            feed = await asyncio.to_thread(feedparser.parse, source["url"])

            for entry in feed.entries[:5]:
                summary = re.sub(
                    r'<[^>]+>', '',
                    entry.get("summary", entry.get("description", ""))
                )[:400]

                items.append({
                    "title": entry.get("title", ""),
                    "summary": summary,
                    "url": entry.get("link", ""),
                    "published": entry.get("published", entry.get("updated", "")),
                    "source": source["name"],
                    "org": source["org"],
                    "channel": source["channel"],
                    "trust_score": source["trust"],
                    "is_verified": True,
                })

            await asyncio.sleep(0.3)

        except Exception as e:
            logger.warning(f"[VERIFIED] {source['name']} failed: {e}")

    logger.info(f"[VERIFIED] Fetched {len(items)} items from verified sources")
    return items


# ═══════════════════════════════════════════════════════════════════════════════
# SOURCE 1 — HackerNews via Algolia API (free, no auth, no rate limit)
# ═══════════════════════════════════════════════════════════════════════════════

async def fetch_hackernews_items() -> list:
    """
    Uses Algolia HN Search API — completely free, no key needed.
    Returns AI-related posts from last 7 days with >10 points.
    """
    items = []
    two_weeks_ago = int((datetime.now() - timedelta(days=14)).timestamp())

    SEARCHES = [
        "LLM GPT Claude Gemini Llama",
        "AI agent autonomous workflow",
        "open source model mistral hugging",
        "RAG vector database embedding retrieval",
        "AI coding cursor copilot claude code",
        "machine learning deep learning neural",
        "AI startup funding enterprise",
    ]

    async with httpx.AsyncClient(timeout=15, verify=False) as client:
        for query in SEARCHES:
            try:
                resp = await client.get(
                    "https://hn.algolia.com/api/v1/search",
                    params={
                        "query": query,
                        "tags": "story",
                        "numericFilters": f"created_at_i>{two_weeks_ago},points>5",
                        "hitsPerPage": 15,
                    }
                )
                data = resp.json()

                for hit in data.get("hits", []):
                    title = hit.get("title", "")
                    if not title:
                        continue
                    items.append({
                        "title": title,
                        "summary": f"{hit.get('points', 0)} points · {hit.get('num_comments', 0)} comments",
                        "url": hit.get("url") or f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                        "published": hit.get("created_at", ""),
                        "source": "Hacker News",
                        "org": "Hacker News",
                        "channel": "HN",
                        "score": hit.get("points", 0),
                        "trust_score": CHANNEL_TRUST_WEIGHTS["HN"],
                        "is_verified": False,
                    })

                await asyncio.sleep(0.3)

            except Exception as e:
                logger.warning(f"[HN] Query '{query}' failed: {e}")

    # Deduplicate by URL
    seen = set()
    unique = []
    for item in items:
        if item["url"] not in seen:
            seen.add(item["url"])
            unique.append(item)

    logger.info(f"[HN] Fetched {len(unique)} unique items")
    return unique


# ═══════════════════════════════════════════════════════════════════════════════
# SOURCE 2 — Reddit public JSON API (free, no auth for public subreddits)
# ═══════════════════════════════════════════════════════════════════════════════

async def fetch_reddit_items() -> list:
    """
    Uses Reddit's public JSON API — no OAuth needed for public subs.
    Returns top AI posts from last week.
    """
    SUBREDDITS = [
        "MachineLearning",
        "LocalLLaMA",
        "artificial",
        "singularity",
        "ChatGPT",
        "OpenAI",
        "Bard",
        "StableDiffusion",
    ]

    items = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    async with httpx.AsyncClient(timeout=15, headers=headers, verify=False) as client:
        for subreddit in SUBREDDITS:
            try:
                resp = await client.get(
                    f"https://www.reddit.com/r/{subreddit}/top.json",
                    params={"t": "week", "limit": 15},
                )

                if resp.status_code != 200:
                    logger.warning(f"[Reddit] r/{subreddit} returned {resp.status_code}")
                    continue

                data = resp.json()
                posts = data.get("data", {}).get("children", [])

                for post in posts:
                    p = post.get("data", {})
                    score = p.get("score", 0)

                    # Only posts with significant engagement
                    if score < 50:
                        continue

                    title = p.get("title", "")
                    if not title:
                        continue

                    # Get URL — prefer external link over reddit
                    url = p.get("url", "")
                    if "reddit.com" in url or not url:
                        url = f"https://reddit.com{p.get('permalink', '')}"

                    items.append({
                        "title": title,
                        "summary": p.get("selftext", "")[:200] or f"r/{subreddit} · {score} upvotes",
                        "url": url,
                        "published": datetime.fromtimestamp(
                            p.get("created_utc", 0)
                        ).isoformat() if p.get("created_utc") else "",
                        "source": f"Reddit r/{subreddit}",
                        "org": f"r/{subreddit}",
                        "channel": "RD",
                        "score": score,
                        "trust_score": CHANNEL_TRUST_WEIGHTS["RD"],
                        "is_verified": False,
                    })

                await asyncio.sleep(2)  # Reddit rate limit: 2s between requests

            except Exception as e:
                logger.warning(f"[Reddit] r/{subreddit} failed: {e}")

    logger.info(f"[Reddit] Fetched {len(items)} items")
    return items


# ═══════════════════════════════════════════════════════════════════════════════
# SOURCE 3 — arXiv XML API (official free API, no key needed)
# ═══════════════════════════════════════════════════════════════════════════════

async def fetch_arxiv_items() -> list:
    """
    Uses arXiv's official Atom/XML API.
    Fetches latest AI/ML/NLP papers from last 7 days.
    """
    SEARCHES = [
        ("cat:cs.AI", "AI"),
        ("cat:cs.LG", "Machine Learning"),
        ("cat:cs.CL", "NLP/LLMs"),
        ("ti:LLM+OR+ti:agent+OR+ti:transformer", "LLM Research"),
    ]

    items = []

    async with httpx.AsyncClient(timeout=20, verify=False) as client:
        for query, label in SEARCHES:
            try:
                resp = await client.get(
                    "https://export.arxiv.org/api/query",
                    params={
                        "search_query": query,
                        "sortBy": "submittedDate",
                        "sortOrder": "descending",
                        "max_results": 8,
                    }
                )

                # Parse XML response
                root = ET.fromstring(resp.text)
                ns = {"atom": "http://www.w3.org/2005/Atom"}

                entries = root.findall("atom:entry", ns)

                for entry in entries:
                    title_el = entry.find("atom:title", ns)
                    summary_el = entry.find("atom:summary", ns)
                    id_el = entry.find("atom:id", ns)
                    published_el = entry.find("atom:published", ns)

                    title = (title_el.text or "").strip().replace("\n", " ")
                    summary = (summary_el.text or "").strip()[:300].replace("\n", " ")
                    url = (id_el.text or "").strip()
                    published = (published_el.text or "").strip()

                    if not title:
                        continue

                    items.append({
                        "title": f"[Research] {title}",
                        "summary": summary,
                        "url": url,
                        "published": published,
                        "source": f"arXiv ({label})",
                        "org": "arXiv",
                        "channel": "AX",
                        "trust_score": CHANNEL_TRUST_WEIGHTS["AX"],
                        "is_verified": True,  # arXiv is verified research
                    })

                await asyncio.sleep(3)  # arXiv asks for 3s delay

            except Exception as e:
                logger.warning(f"[arXiv] Query '{query}' failed: {e}")

    logger.info(f"[arXiv] Fetched {len(items)} papers")
    return items


# ═══════════════════════════════════════════════════════════════════════════════
# SOURCE 4 — GitHub Trending AI repos (RSS + Topics API, free)
# ═══════════════════════════════════════════════════════════════════════════════

async def fetch_github_trending() -> list:
    """
    Fetches trending GitHub repos in AI/ML topics.
    Uses multiple free methods — RSS first, API as backup.
    """
    items = []

    AI_KEYWORDS = [
        'llm', 'ai', 'gpt', 'claude', 'llama', 'model',
        'agent', 'rag', 'vector', 'embedding', 'transformer',
        'neural', 'diffusion', 'stable', 'openai', 'hugging',
        'langchain', 'copilot', 'cursor', 'ollama', 'mistral',
    ]

    # Method 1: GitHub Trending RSS (unofficial but works)
    RSS_URLS = [
        "https://github-trending-rss.vercel.app/daily/python",
        "https://github-trending-rss.vercel.app/daily",
    ]

    for rss_url in RSS_URLS:
        try:
            feed = await asyncio.to_thread(feedparser.parse, rss_url)
            for entry in feed.entries[:20]:
                title = entry.get("title", "")
                summary = entry.get("summary", "")
                combined = (title + " " + summary).lower()

                # Only AI-related repos
                if any(kw in combined for kw in AI_KEYWORDS):
                    items.append({
                        "title": f"[GitHub] {title}",
                        "summary": summary[:200] if summary else "Trending GitHub repository",
                        "url": entry.get("link", ""),
                        "published": entry.get("published", datetime.now().isoformat()),
                        "source": "GitHub Trending",
                        "org": "GitHub",
                        "channel": "GH",
                        "trust_score": CHANNEL_TRUST_WEIGHTS["GH"],
                        "is_verified": False,
                    })
        except Exception as e:
            logger.warning(f"[GitHub] RSS failed: {e}")

    # Method 2: GitHub Topics API (official, no auth for public)
    AI_TOPICS = ["llm", "ai-agents", "rag", "large-language-models"]

    async with httpx.AsyncClient(timeout=15, verify=False) as client:
        for topic in AI_TOPICS:
            try:
                week_ago = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
                resp = await client.get(
                    "https://api.github.com/search/repositories",
                    params={
                        "q": f"topic:{topic} pushed:>{week_ago}",
                        "sort": "stars",
                        "order": "desc",
                        "per_page": 5,
                    },
                    headers={"Accept": "application/vnd.github.v3+json"}
                )

                if resp.status_code == 200:
                    repos = resp.json().get("items", [])
                    for repo in repos:
                        desc = repo.get("description", "") or ""
                        items.append({
                            "title": f"[GitHub] {repo['full_name']} — {desc[:80]}",
                            "summary": f"⭐ {repo.get('stargazers_count', 0)} stars · {repo.get('language', '')} · {desc}",
                            "url": repo.get("html_url", ""),
                            "published": repo.get("pushed_at", ""),
                            "source": "GitHub",
                            "org": "GitHub",
                            "channel": "GH",
                            "trust_score": CHANNEL_TRUST_WEIGHTS["GH"],
                            "is_verified": False,
                        })

                await asyncio.sleep(1)

            except Exception as e:
                logger.warning(f"[GitHub] Topic '{topic}' failed: {e}")

    # Deduplicate
    seen = set()
    unique = []
    for item in items:
        key = item["url"]
        if key and key not in seen:
            seen.add(key)
            unique.append(item)

    logger.info(f"[GitHub] Fetched {len(unique)} repos")
    return unique


# ═══════════════════════════════════════════════════════════════════════════════
# SOURCE 5 — Extra RSS feeds (newsletters, Google News queries)
# ═══════════════════════════════════════════════════════════════════════════════

EXTRA_RSS_FEEDS = [
    # AI News sources
    ("https://www.artificialintelligence-news.com/feed/", "AI News"),
    ("https://feeds.feedburner.com/AIWeekly", "AI Weekly"),
    # Google News for specific queries (free)
    ("https://news.google.com/rss/search?q=LLM+language+model&hl=en-US&gl=US", "Google News LLM"),
    ("https://news.google.com/rss/search?q=AI+agent+enterprise&hl=en-US&gl=US", "Google News Agents"),
    ("https://news.google.com/rss/search?q=open+source+AI+model&hl=en-US&gl=US", "Google News OSS"),
]


async def fetch_extra_rss(feeds=EXTRA_RSS_FEEDS) -> list:
    """Fetch from additional free RSS sources"""
    items = []

    for feed_url, source_name in feeds:
        try:
            feed = await asyncio.to_thread(feedparser.parse, feed_url)
            for entry in feed.entries[:6]:
                summary = re.sub(r'<[^>]+>', '', entry.get("summary", ""))[:300]

                items.append({
                    "title": entry.get("title", ""),
                    "summary": summary,
                    "url": entry.get("link", ""),
                    "published": entry.get("published", ""),
                    "source": source_name,
                    "org": source_name,
                    "channel": "NL",
                    "trust_score": CHANNEL_TRUST_WEIGHTS["NL"],
                    "is_verified": False,
                })

            await asyncio.sleep(0.5)

        except Exception as e:
            logger.warning(f"[RSS] {source_name} failed: {e}")

    logger.info(f"[RSS] Extra feeds: {len(items)} items")
    return items


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN AGGREGATION — Fetch from ALL sources in parallel
# ═══════════════════════════════════════════════════════════════════════════════

async def fetch_all_free_sources() -> list:
    """
    Fetch from ALL free sources in parallel.
    Total time: ~15-20s (parallel, not sequential)
    Total cost: $0.00 (all free APIs)

    Sources include:
    - TIER 1/2/3 verified sources (Official, Research, Media, YouTube)
    - HackerNews, Reddit, arXiv, GitHub community sources
    """
    logger.info("[PIPELINE] Starting parallel fetch from all free sources...")

    results = await asyncio.gather(
        fetch_verified_sources(),   # NEW — tier 1/2/3 + YouTube
        fetch_hackernews_items(),   # HN Algolia API
        fetch_reddit_items(),       # Reddit public JSON
        fetch_arxiv_items(),        # arXiv XML API
        fetch_github_trending(),    # GitHub Trending
        fetch_extra_rss(),          # Extra RSS feeds
        return_exceptions=True
    )

    all_items = []
    source_labels = [
        "Verified Sources", "HackerNews", "Reddit", "arXiv", "GitHub", "Extra RSS"
    ]

    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f"[PIPELINE] {source_labels[i]} failed: {result}")
        elif isinstance(result, list):
            all_items.extend(result)
            logger.info(f"[PIPELINE] {source_labels[i]}: {len(result)} items")
        else:
            logger.warning(f"[PIPELINE] {source_labels[i]}: unexpected result type")

    # Global deduplication by URL and title
    seen_urls = set()
    seen_titles = set()
    deduped = []

    for item in all_items:
        url_key = item.get("url", "")
        title_key = item.get("title", "").lower()[:60]

        if url_key and url_key in seen_urls:
            continue
        if title_key and title_key in seen_titles:
            continue

        if url_key:
            seen_urls.add(url_key)
        if title_key:
            seen_titles.add(title_key)
        deduped.append(item)

    logger.info(f"[PIPELINE] Total after dedup: {len(deduped)} items from {len(all_items)} raw")
    return deduped


# ═══════════════════════════════════════════════════════════════════════════════
# IMPROVED CLUSTERING PROMPT — Multi-channel signal weighting
# ═══════════════════════════════════════════════════════════════════════════════

def build_clustering_prompt(items: list, batch_label: str = "") -> str:
    """Build improved prompt that weights cross-channel signals with trust scores"""

    # Process up to 120 items (balance between coverage and token limits)
    items_text = ""
    for i, item in enumerate(items[:120]):
        trust = item.get("trust_score", 5)
        channel = item.get("channel", "NL")
        org = item.get("org", item.get("source", "Unknown"))
        verified = "✓" if item.get("is_verified") else ""
        title = item.get("title", "")
        summary = item.get("summary", "")[:100]  # Shorter summaries to fit more items
        url = item.get("url", "")

        items_text += f"{i+1}. [{channel}{verified}][{org}] (trust:{trust}/10) {title}\n"
        if summary:
            items_text += f"   {summary}\n"
        if url:
            items_text += f"   url: {url}\n"

    batch_note = f" ({batch_label})" if batch_label else ""
    item_count = min(len(items), 120)

    return f"""You are an AI trend analyst. Analyze {item_count} items{batch_note} from verified and community sources.

CRITICAL: You MUST return EXACTLY 12 to 15 distinct trend topics.
With {item_count} items you should find at least 12 different trends.
Do NOT merge topics aggressively — keep related but distinct topics separate.
Include topics with 2+ sources. Official verified sources count double.

Source trust scores:
- OFFICIAL✓ = 10/10 (company official blogs)
- RESEARCH✓ = 8/10 (academic/peer-reviewed)
- MEDIA✓    = 7/10 (established tech media)
- AX✓       = 8/10 (arXiv preprint)
- HN/RD/GH  = 4-6/10 (community signals)

{items_text}

Rules:
- OFFICIAL source alone = include as trend (score 7+)
- OFFICIAL + MEDIA = very strong signal (score 8+)
- Community-only = include if 3+ sources (score 5-6)
- Newer publication date = higher score

Return a JSON object with a "trends" array of 12-15 items. Each trend:
{{
  "topic": "Specific name with tool/model (e.g. Claude 3.5 Sonnet Update)",
  "summary": "2 sentences. What happened and why it matters.",
  "category": "llm_models|dev_tools|ai_agents|open_source|ai_infrastructure|enterprise_apps",
  "trend_score": <1-10>,
  "momentum": "+N%",
  "source_count": <number>,
  "channels": ["OFFICIAL", "MEDIA"],
  "primary_source": {{"org": "Company", "url": "https://...", "published": "2026-04-16", "is_verified": true}},
  "why_trending": "One sentence why NOW",
  "trend_trigger": "NEW_RELEASE|BENCHMARK|FUNDING|REGULATION|RESEARCH|VIRAL",
  "tags": ["tag1", "tag2"],
  "url": "primary URL",
  "detected_at": "{datetime.now().isoformat()}"
}}

Scoring:
- 9-10: OFFICIAL + 2+ channels, breaking news
- 7-8: OFFICIAL or RESEARCH + community
- 5-6: MEDIA + community only
- 3-4: Community only, emerging

REMEMBER: Return 12-15 trends minimum. JSON only."""
