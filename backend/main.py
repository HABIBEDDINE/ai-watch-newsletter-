"""
AI Watch - Strategic Intelligence Pipeline
V2 MVP: Complete feature set with newsletter, Power BI, and enhanced extraction.
V3: Added Perplexity integration for real-time web search.
"""
import argparse
from ingestion import fetch_sector_news
from summarizer import summarize_articles
from report_generator import generate_markdown_report, print_quick_summary
from newsletter import send_newsletter
from powerbi_export import export_all_for_powerbi


# Preset sector queries for common use cases
PRESET_SECTORS = {
    "AI": "artificial intelligence OR machine learning OR deep learning OR LLM OR GPT OR generative AI",
    "Fintech": "fintech OR digital banking OR cryptocurrency OR blockchain OR payments technology",
    "HealthTech": "digital health OR medtech OR telemedicine OR biotech startup OR healthtech",
    "Cybersecurity": "cybersecurity OR data breach OR zero trust OR threat detection",
    "CleanTech": "renewable energy OR electric vehicle OR cleantech OR sustainability tech",
    "Robotics": "robotics OR automation OR industrial robots OR autonomous systems"
}


def interactive_menu():
    """Show interactive menu for topic selection."""
    print("\n" + "="*60)
    print("🎯 AI WATCH - Topic Selection")
    print("="*60)
    print("\nAvailable preset topics:")
    for i, topic in enumerate(PRESET_SECTORS.keys(), 1):
        print(f"  {i}. {topic}")
    print(f"  {len(PRESET_SECTORS) + 1}. ALL topics")
    print(f"  {len(PRESET_SECTORS) + 2}. Enter custom topic")
    print()
    
    choice = input("Select option (number or topic name): ").strip()
    
    # Handle numeric selection
    topics = list(PRESET_SECTORS.keys())
    if choice.isdigit():
        idx = int(choice)
        if 1 <= idx <= len(topics):
            return [topics[idx - 1]]
        elif idx == len(topics) + 1:
            return topics  # All topics
        elif idx == len(topics) + 2:
            custom = input("Enter custom topic: ").strip()
            return [custom] if custom else ["AI"]
    
    # Handle text selection (topic name)
    for topic in PRESET_SECTORS.keys():
        if choice.lower() == topic.lower():
            return [topic]
    
    # Handle comma-separated topics
    if "," in choice:
        return [t.strip() for t in choice.split(",")]
    
    # Default to AI if nothing matched
    print(f"Using AI as default topic")
    return ["AI"]


def run_pipeline(topics, max_articles=10, send_email=False, export_powerbi=False, use_perplexity=False):
    """
    Run the complete AI Watch pipeline.
    
    Args:
        topics: List of topic names to search
        max_articles: Maximum articles per topic
        send_email: Send newsletter email
        export_powerbi: Export Power BI files
        use_perplexity: Also fetch from Perplexity API for real-time search
    """
    print("\n" + "="*60)
    print("🚀 AI WATCH - Intelligence Pipeline V2")
    print("="*60)
    
    # Build sector queries from topics
    sector_queries = {}
    for topic in topics:
        if topic in PRESET_SECTORS:
            sector_queries[topic] = PRESET_SECTORS[topic]
        else:
            # Custom topic - use it directly
            sector_queries[topic] = topic
    
    print(f"📋 Topics: {', '.join(topics)}")
    print(f"🏭 Industries: 10 categories")
    if use_perplexity:
        print(f"🔍 Perplexity: ENABLED (real-time search)")
    print()
    
    # Step 1: Fetch news
    print("📥 STEP 1: Fetching news articles...")
    raw_news = fetch_sector_news(
        sector_queries, 
        days_back=7, 
        max_per_sector=max_articles,
        use_perplexity=use_perplexity
    )
    total_raw = sum(len(articles) for articles in raw_news.values())
    print(f"✅ Fetched {total_raw} articles total")
    print()
    
    # Step 2: Summarize with AI
    print("🧠 STEP 2: Analyzing and summarizing with AI...")
    summarized_data = {}
    for sector, articles in raw_news.items():
        if articles:
            print(f"  Processing {sector}...")
            summarized = summarize_articles(articles)
            # Filter out noise (relevance < 4)
            summarized_data[sector] = [a for a in summarized if a.get('relevance_score', 0) >= 4]
            print(f"    {len(summarized_data[sector])}/{len(articles)} passed relevance filter")
    
    total_kept = sum(len(articles) for articles in summarized_data.values())
    print(f"✅ {total_kept} articles passed relevance filter")
    print()
    
    # Step 3: Generate report
    print("📝 STEP 3: Generating report...")
    report_path = generate_markdown_report(summarized_data)
    print()
    
    # Step 4: Quick summary to console
    print_quick_summary(summarized_data)
    
    # Step 5: Power BI export (if requested)
    if export_powerbi:
        print()
        print("📊 STEP 5: Exporting data for Power BI...")
        export_all_for_powerbi(summarized_data)
    
    # Step 6: Newsletter (if requested)
    if send_email:
        print()
        print("📧 STEP 6: Sending newsletter...")
        send_newsletter(summarized_data)
    
    print()
    print("="*60)
    print("✅ PIPELINE COMPLETE")
    print("="*60)
    print(f"📄 Report: {report_path}")
    
    return summarized_data


def main():
    """Main entry point with CLI argument parsing."""
    parser = argparse.ArgumentParser(
        description="AI Watch - Strategic Intelligence Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python main.py                          # Interactive mode
  python main.py --topic "AI"             # Single topic
  python main.py --topic "AI,Fintech"     # Multiple topics
  python main.py --topic "AI" --powerbi   # With Power BI export
  python main.py --topic "AI" --newsletter # With email newsletter
  python main.py --topic "AI" --perplexity # With real-time search
        """
    )
    
    parser.add_argument(
        '--topic', '-t',
        type=str,
        help='Topic(s) to search, comma-separated (e.g., "AI,Fintech")'
    )
    
    parser.add_argument(
        '--max', '-m',
        type=int,
        default=10,
        help='Maximum articles per topic (default: 10)'
    )
    
    parser.add_argument(
        '--newsletter', '-n',
        action='store_true',
        help='Send newsletter email'
    )
    
    parser.add_argument(
        '--powerbi', '-p',
        action='store_true',
        help='Export Power BI CSV/JSON files'
    )
    
    parser.add_argument(
        '--perplexity',
        action='store_true',
        help='Enable Perplexity real-time web search (requires PERPLEXITY_API_KEY)'
    )
    
    args = parser.parse_args()
    
    # Determine topics
    if args.topic:
        topics = [t.strip() for t in args.topic.split(',')]
    else:
        topics = interactive_menu()
    
    # Run the pipeline
    run_pipeline(
        topics=topics,
        max_articles=args.max,
        send_email=args.newsletter,
        export_powerbi=args.powerbi,
        use_perplexity=args.perplexity
    )


if __name__ == "__main__":
    main()
