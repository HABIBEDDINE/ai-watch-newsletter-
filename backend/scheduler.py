"""
Background scheduler for automated daily data ingestion and newsletter delivery.
- Ingestion:  runs every day at 00:00 UTC
- Newsletter: runs every day at 07:00 UTC (after ingestion is complete)
- Trends:     runs every day at 08:00 UTC (V4 Sprint 4)
- Alerts:     runs every hour at :00 (V4 Sprint 3)
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from ingestion import run_ingestion
from trends_service import refresh_trends, cluster_free_sources
from db import supabase
from datetime import datetime, timedelta
import asyncio
import logging
import httpx
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)

# Import free sources module
try:
    from free_sources import fetch_all_free_sources
    FREE_SOURCES_AVAILABLE = True
except ImportError:
    FREE_SOURCES_AVAILABLE = False
    logger.warning("free_sources module not found — using RSS-only mode")

TOPICS = ["AI", "Fintech", "HealthTech", "Cybersecurity", "CleanTech", "Robotics"]

# Free RSS feeds for AI trends (cost: $0/month)
RSS_FEEDS = [
    # Original feeds
    {"name": "MIT Tech Review AI", "url": "https://www.technologyreview.com/topic/artificial-intelligence/feed"},
    {"name": "VentureBeat AI", "url": "https://venturebeat.com/category/ai/feed/"},
    {"name": "The Verge AI", "url": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"},
    {"name": "Ars Technica AI", "url": "https://feeds.arstechnica.com/arstechnica/technology-lab"},
    {"name": "Hacker News", "url": "https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT"},
    # New feeds for better coverage
    {"name": "Google News AI", "url": "https://news.google.com/rss/search?q=artificial+intelligence+OR+LLM+OR+GPT&hl=en-US&gl=US&ceid=US:en"},
    {"name": "TechCrunch AI", "url": "https://techcrunch.com/category/artificial-intelligence/feed/"},
    {"name": "arXiv AI", "url": "http://export.arxiv.org/rss/cs.AI"},
    {"name": "OpenAI Blog", "url": "https://openai.com/blog/rss/"},
    {"name": "Anthropic News", "url": "https://www.anthropic.com/news/rss"},
]


async def fetch_rss_articles() -> list:
    """Fetch articles from free RSS feeds for trend context."""
    articles = []
    async with httpx.AsyncClient(timeout=15, verify=False) as client:
        for feed in RSS_FEEDS:
            try:
                resp = await client.get(feed["url"])
                if resp.status_code == 200:
                    root = ET.fromstring(resp.text)
                    # Handle both RSS and Atom formats
                    items = root.findall(".//item") or root.findall(".//{http://www.w3.org/2005/Atom}entry")
                    for item in items[:5]:  # Top 5 per feed
                        title = item.findtext("title") or item.findtext("{http://www.w3.org/2005/Atom}title") or ""
                        desc = item.findtext("description") or item.findtext("{http://www.w3.org/2005/Atom}summary") or ""
                        link = item.findtext("link") or ""
                        if not link:
                            link_elem = item.find("{http://www.w3.org/2005/Atom}link")
                            link = link_elem.get("href", "") if link_elem is not None else ""
                        articles.append({
                            "source": feed["name"],
                            "title": title,
                            "description": desc[:500],
                            "url": link,
                        })
                    logger.info(f"[RSS] {feed['name']}: {len(items[:5])} articles")
            except Exception as e:
                logger.warning(f"[RSS] {feed['name']} failed: {e}")
    return articles


def _db_cleanup():
    """Delete articles older than 7 days and trends older than 30 days."""
    try:
        cutoff_articles = (datetime.utcnow() - timedelta(days=7)).isoformat()
        supabase.table("articles").delete().lt("ingestion_date", cutoff_articles).execute()
        logger.info("🗑️  Deleted articles older than 7 days")
    except Exception as e:
        logger.error(f"❌ Article cleanup failed: {e}")
    try:
        cutoff_trends = (datetime.utcnow() - timedelta(days=30)).isoformat()
        supabase.table("trends").delete().lt("created_at", cutoff_trends).execute()
        logger.info("🗑️  Deleted trends older than 30 days")
    except Exception as e:
        logger.error(f"❌ Trend cleanup failed: {e}")


def scheduled_daily_ingest():
    """Runs every day at 00:00 UTC. Fetches 20 trending articles per topic, then cleans up DB."""
    logger.info("⏰ Scheduled ingestion starting — 00:00 UTC")
    for topic in TOPICS:
        try:
            run_ingestion(topic=topic, limit=20)
            logger.info(f"✅ Ingested topic: {topic}")
        except Exception as e:
            logger.error(f"❌ Failed topic {topic}: {e}")
    _db_cleanup()
    logger.info("✅ Daily ingestion complete")


def scheduled_daily_newsletter():
    """Runs every day at 07:00 UTC. Generates and sends the daily newsletter."""
    logger.info("📧 Scheduled newsletter starting — 07:00 UTC")
    try:
        import newsletter as newsletter_module
        from ingestion import fetch_sector_news
        from summarizer import summarize_articles
        from main import PRESET_SECTORS
        from datetime import datetime

        sector_data = {}
        for topic in ["AI", "Fintech", "Cybersecurity"]:
            raw = fetch_sector_news(
                {topic: PRESET_SECTORS.get(topic, topic)},
                days_back=1,
                max_per_sector=8,
                use_perplexity=False,
            )
            articles = raw.get(topic, [])
            summarized = summarize_articles(articles) if articles else []
            filtered = [a for a in summarized if a.get("relevance_score", 0) >= 4]
            if filtered:
                sector_data[topic] = filtered

        if not sector_data:
            logger.warning("No articles available for newsletter — skipping send.")
            return

        today = datetime.now().strftime("%B %d, %Y")
        success = newsletter_module.send_newsletter(
            sector_data,
            subject=f"AI Watch Daily Intelligence — {today}",
        )
        if success:
            logger.info("✅ Daily newsletter sent successfully")
        else:
            logger.info("📄 Daily newsletter saved to file (SMTP not configured)")
    except Exception as e:
        logger.error(f"❌ Newsletter job failed: {e}")


# ── V4 Sprint 3: Hourly alert scanner ────────────────────────────────────────

def _matches_keywords(article: dict, keywords: list) -> bool:
    """
    Return True if any keyword appears (case-insensitive) in the article's
    title or summary.  No AI calls — pure string matching.
    """
    text = (
        (article.get("title") or "") + " " +
        (article.get("summary") or "") + " " +
        (article.get("description") or "")
    ).lower()
    return any(kw.lower().strip() in text for kw in keywords if kw.strip())


def scan_and_send_alerts():
    """
    Hourly job — scans new articles against every user's alert preferences
    and sends a digest email when keywords match.

    Flow:
      1. Fetch all enabled alert_preferences rows
      2. For each preference, query articles ingested since last_sent_at
      3. Match keywords (string matching, zero API calls)
      4. Send digest email if matches found (rate-limited: 1 per hour per user)
      5. Update last_sent_at
    """
    logger.info("━━━ Alert scan started ━━━")
    try:
        prefs_resp = supabase.table("alert_preferences").select("*").eq("enabled", True).execute()
        active_prefs = prefs_resp.data or []
    except Exception as e:
        logger.error(f"[Alerts] Failed to fetch preferences: {e}")
        return

    if not active_prefs:
        logger.info("[Alerts] No active alert preferences — skipping")
        return

    now = datetime.utcnow()
    scan_summary = {"users": len(active_prefs), "emails_sent": 0, "errors": 0}

    for pref in active_prefs:
        try:
            user_id           = pref["user_id"]
            keywords          = pref.get("keywords") or []
            min_score         = pref.get("min_signal_score", 7)
            last_sent_raw     = pref.get("last_sent_at")
            unsubscribe_token = pref.get("unsubscribe_token", "")

            if not keywords:
                continue

            # ── Rate limit: skip if sent within last hour ──────────────────
            if last_sent_raw:
                try:
                    last_sent = datetime.fromisoformat(last_sent_raw.replace("Z", ""))
                    if (now - last_sent).total_seconds() < 3600:
                        logger.debug(f"[Alerts] Skipping {user_id} — sent {int((now - last_sent).total_seconds() // 60)}m ago")
                        continue
                except Exception:
                    pass  # malformed timestamp — proceed with scan

            # ── Fetch user details ─────────────────────────────────────────
            user_resp = supabase.table("users").select(
                "email,full_name,is_verified"
            ).eq("id", user_id).execute()
            if not user_resp.data:
                continue
            user = user_resp.data[0]
            if not user.get("is_verified"):
                continue  # never send to unverified emails

            # ── Fetch new articles since last_sent_at ──────────────────────
            cutoff = last_sent_raw or (now - timedelta(hours=1)).isoformat()
            articles_resp = (
                supabase.table("articles")
                .select("title,url,summary,description,source,signal_strength,relevance,ingestion_date")
                .gte("ingestion_date", cutoff)
                .execute()
            )
            new_articles = articles_resp.data or []

            if not new_articles:
                continue

            # ── Filter by min signal score ─────────────────────────────────
            # signal_strength in DB is "Strong" / "Weak" — map to numeric
            def _score(a):
                s = str(a.get("signal_strength", "")).lower()
                r = a.get("relevance", 5) or 5
                if "strong" in s:
                    return max(7, int(r))
                return int(r)

            scored = [a for a in new_articles if _score(a) >= min_score]

            # ── Keyword matching ───────────────────────────────────────────
            matching = [a for a in scored if _matches_keywords(a, keywords)]

            if not matching:
                continue

            # ── Send digest ────────────────────────────────────────────────
            from newsletter import send_alert_digest
            sent = send_alert_digest(
                user_email=user["email"],
                user_name=user.get("full_name", ""),
                articles=matching,
                unsubscribe_token=unsubscribe_token,
            )

            if sent:
                # Update last_sent_at
                supabase.table("alert_preferences").update(
                    {"last_sent_at": now.isoformat()}
                ).eq("user_id", user_id).execute()
                scan_summary["emails_sent"] += 1
                logger.info(
                    f"[Alerts] ✓ {user['email']} — {len(matching)} match(es) from {len(new_articles)} articles"
                )

        except Exception as e:
            scan_summary["errors"] += 1
            logger.error(f"[Alerts] Error processing user {pref.get('user_id')}: {e}")

    logger.info(
        f"━━━ Alert scan done — "
        f"{scan_summary['users']} users checked, "
        f"{scan_summary['emails_sent']} emails sent, "
        f"{scan_summary['errors']} errors ━━━"
    )


# ── V4 Sprint 4: Daily trends refresh at 8AM UTC ─────────────────────────────

async def pre_generate_all_deepdives():
    """
    Pre-generate deep dives for all today's trends.
    Called after trend refresh to avoid race conditions and improve UX.
    """
    import os as _os
    from openai import OpenAI as _OpenAI

    api_key = _os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.warning("[PreGen] No OPENAI_API_KEY — skipping deep dive pre-generation")
        return

    client = _OpenAI(api_key=api_key)
    today = datetime.utcnow().date().isoformat()

    # Fetch today's trends that need deep dives
    try:
        resp = supabase.table("trends").select("id,topic,summary,category,data,deepdive_status").eq("generated_date", today).execute()
        trends = resp.data or []
    except Exception as e:
        logger.error(f"[PreGen] Failed to fetch trends: {e}")
        return

    pending = [t for t in trends if t.get("deepdive_status") != "done"]
    logger.info(f"[PreGen] Generating deep dives for {len(pending)}/{len(trends)} trends")

    for t in pending:
        trend_id = t.get("id")
        topic = t.get("topic", "")
        summary = t.get("data", {}).get("summary", "") or t.get("summary", "")

        # Claim lock
        try:
            supabase.table("trends").update({"deepdive_status": "generating"}).eq("id", trend_id).eq("deepdive_status", "pending").execute()
        except Exception:
            continue

        prompt = f"""You are a strategic enterprise technology analyst.

Topic: {topic}
Summary: {summary}

Return ONLY valid JSON with this exact structure:
{{
  "what_it_is": "2-3 paragraph explanation of what this trend is and why it matters",
  "enterprise_impact": "2-3 paragraphs on business and enterprise impact",
  "action_plan": "3 concrete next steps as a numbered list",
  "sources": [
    {{"number": 1, "title": "Article title", "publisher": "Publisher", "url": "https://example.com", "snippet": "Description"}},
    {{"number": 2, "title": "Article title", "publisher": "Publisher", "url": "https://example.com", "snippet": "Description"}},
    {{"number": 3, "title": "Article title", "publisher": "Publisher", "url": "https://example.com", "snippet": "Description"}}
  ]
}}

Use REAL authoritative publishers (IBM Research, McKinsey, MIT Technology Review, etc.).
Return ONLY the JSON object."""

        try:
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
            deep_dive_json = __import__("json").loads(deep_dive_raw)

            # Ensure sources exist
            if "sources" not in deep_dive_json or not deep_dive_json["sources"]:
                deep_dive_json["sources"] = [
                    {"number": 1, "title": f"Understanding {topic}", "publisher": "IBM Research", "url": "https://research.ibm.com/ai", "snippet": "AI research overview"},
                    {"number": 2, "title": f"State of AI", "publisher": "McKinsey", "url": "https://mckinsey.com/ai", "snippet": "AI business impact"},
                    {"number": 3, "title": "AI Trends", "publisher": "MIT Tech Review", "url": "https://technologyreview.com/ai", "snippet": "Latest AI developments"},
                ]

            # Save with status=done
            supabase.table("trends").update({
                "deepdive": __import__("json").dumps(deep_dive_json),
                "deepdive_status": "done"
            }).eq("id", trend_id).execute()
            logger.info(f"[PreGen] ✓ {topic[:40]}")

        except Exception as e:
            logger.error(f"[PreGen] ✗ {topic[:40]}: {e}")
            # Release lock
            supabase.table("trends").update({"deepdive_status": "pending"}).eq("id", trend_id).execute()

        # Small delay to avoid rate limits
        await asyncio.sleep(1)

    logger.info(f"[PreGen] Deep dive pre-generation complete")


def scheduled_daily_trends():
    """
    Runs every day at 08:00 UTC.

    Multi-source pipeline (V4.2):
    1. Fetches from 5 FREE sources in parallel:
       - HackerNews (Algolia API)
       - Reddit (public JSON)
       - arXiv (XML API)
       - GitHub Trending
       - RSS feeds (10+ sources)
    2. Clusters with GPT-4o-mini (~$0.01/day)
    3. Falls back to Perplexity only if all sources fail
    4. Saves to DB with generated_date and detected_at

    Cost: ~$0.30/month (was ~$9/month with Perplexity-only)
    """
    logger.info("📊 Scheduled trends refresh starting — 08:00 UTC")
    try:
        # Try multi-source pipeline first (FREE)
        if FREE_SOURCES_AVAILABLE:
            logger.info("[Trends] 🆓 Using multi-source pipeline (HN + Reddit + arXiv + GitHub + RSS)")
            all_items = asyncio.run(fetch_all_free_sources())
            logger.info(f"[Trends] Fetched {len(all_items)} items from all free sources")

            if len(all_items) >= 20:
                # Cluster with multi-channel prompt
                trends = asyncio.run(cluster_free_sources(all_items))
                if trends:
                    logger.info(f"[Trends] Generated {len(trends)} trends from multi-source pipeline")
                else:
                    logger.warning("[Trends] Multi-source clustering failed, falling back to RSS")
                    rss_articles = asyncio.run(fetch_rss_articles())
                    trends = asyncio.run(refresh_trends(rss_articles))
            else:
                logger.warning(f"[Trends] Only {len(all_items)} items, falling back to RSS + Perplexity")
                rss_articles = asyncio.run(fetch_rss_articles())
                trends = asyncio.run(refresh_trends(rss_articles))
        else:
            # Fallback: RSS-only mode
            logger.info("[Trends] Using RSS-only mode (free_sources not available)")
            rss_articles = asyncio.run(fetch_rss_articles())
            logger.info(f"[Trends] Fetched {len(rss_articles)} RSS articles (FREE)")
            trends = asyncio.run(refresh_trends(rss_articles))

        logger.info(f"[Trends] Generated {len(trends)} trends")

        # Save to DB with generated_date
        today = datetime.utcnow().date().isoformat()
        for t in trends:
            try:
                supabase.table("trends").upsert({
                    "id":             t.get("id", ""),
                    "category":       t.get("category", ""),
                    "topic":          t.get("topic", ""),
                    "data":           t,
                    "generated_date": today,
                    "detected_at":    t.get("detected_at") or datetime.utcnow().isoformat(),
                }).execute()
            except Exception as e:
                logger.error(f"[Trends] Failed to save trend {t.get('topic')}: {e}")

        # Cleanup old trends (> 30 days)
        cutoff_30d = (datetime.utcnow() - timedelta(days=30)).isoformat()
        supabase.table("trends").delete().lt("created_at", cutoff_30d).execute()

        logger.info(f"✅ Daily trends refresh complete — {len(trends)} trends saved")

        # Pre-generate all deep dives (avoids race conditions, improves UX)
        logger.info("[Trends] Starting deep dive pre-generation...")
        asyncio.run(pre_generate_all_deepdives())
    except Exception as e:
        logger.error(f"❌ Trends job failed: {e}")


# Create scheduler instance
scheduler = BackgroundScheduler(timezone="UTC")


def start():
    """Start the background scheduler."""
    try:
        scheduler.add_job(
            scheduled_daily_ingest,
            trigger=CronTrigger(hour=0, minute=0),
            id="daily_ingest",
            replace_existing=True,
        )
        scheduler.add_job(
            scheduled_daily_newsletter,
            trigger=CronTrigger(hour=7, minute=0),
            id="daily_newsletter",
            replace_existing=True,
        )
        scheduler.add_job(
            scheduled_daily_trends,
            trigger=CronTrigger(hour=8, minute=0),
            id="daily_trends",
            replace_existing=True,
        )
        scheduler.add_job(
            scan_and_send_alerts,
            trigger=CronTrigger(minute=0),   # every hour at :00
            id="hourly_alerts",
            replace_existing=True,
        )
        scheduler.start()
        logger.info("📅 Scheduler started — ingestion 00:00, newsletter 07:00, trends 08:00, alerts hourly (all UTC)")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")


def stop():
    """Stop the background scheduler."""
    try:
        scheduler.shutdown()
        logger.info("🛑 Scheduler stopped")
    except Exception as e:
        logger.error(f"Failed to stop scheduler: {e}")
