"""
Background scheduler for automated daily data ingestion and newsletter delivery.
- Ingestion:  runs every day at 00:00 UTC
- Newsletter: runs every day at 07:00 UTC (after ingestion is complete)
- Alerts:     runs every hour at :00 (V4 Sprint 3)
"""

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from ingestion import run_ingestion
from trends_service import refresh_trends
from db import supabase
from datetime import datetime, timedelta
import asyncio
import logging

logger = logging.getLogger(__name__)

TOPICS = ["AI", "Fintech", "HealthTech", "Cybersecurity", "CleanTech", "Robotics"]


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
            lambda: asyncio.run(refresh_trends()),
            "interval",
            hours=6,
            id="trends_refresh",
            replace_existing=True,
        )
        scheduler.add_job(
            scan_and_send_alerts,
            trigger=CronTrigger(minute=0),   # every hour at :00
            id="hourly_alerts",
            replace_existing=True,
        )
        scheduler.start()
        logger.info("📅 Scheduler started — ingestion 00:00 UTC, newsletter 07:00 UTC, trends every 6h, alerts every hour")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")


def stop():
    """Stop the background scheduler."""
    try:
        scheduler.shutdown()
        logger.info("🛑 Scheduler stopped")
    except Exception as e:
        logger.error(f"Failed to stop scheduler: {e}")
