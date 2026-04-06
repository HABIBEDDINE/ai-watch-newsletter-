"""
Background scheduler for automated daily data ingestion and newsletter delivery.
- Ingestion: runs every day at 00:00 UTC
- Newsletter: runs every day at 07:00 UTC (after ingestion is complete)
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
        scheduler.start()
        logger.info("📅 Scheduler started — ingestion 00:00 UTC, newsletter 07:00 UTC, trends every 6h")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")


def stop():
    """Stop the background scheduler."""
    try:
        scheduler.shutdown()
        logger.info("🛑 Scheduler stopped")
    except Exception as e:
        logger.error(f"Failed to stop scheduler: {e}")
