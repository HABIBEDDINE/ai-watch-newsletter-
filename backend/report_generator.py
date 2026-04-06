"""
AI Watch - Report Generator
Generates Markdown and PDF reports from summarized news articles.
V2: Added industry classification breakdown
V3: Added PDF export capability
"""
from datetime import datetime
from collections import Counter
import os
import re
from pathlib import Path
from fpdf import FPDF

_REPORTS_DIR = str(Path(__file__).resolve().parent.parent / "data" / "reports")


def generate_markdown_report(sector_data, output_dir=None, topics=None):
    if output_dir is None:
        output_dir = _REPORTS_DIR
    """
    Generate a Markdown report from summarized sector news.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        output_dir: Directory to save reports
        topics: List of topics searched (for filename)
    
    Returns:
        Path to the generated report
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate filename with topic and timestamp
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
    
    # Create topic string for filename (sanitize for filesystem)
    if topics:
        topic_str = "_".join(topics[:3])  # Limit to 3 topics
        topic_str = re.sub(r'[^\w\-]', '', topic_str)  # Remove special chars
        topic_str = topic_str[:30]  # Limit length
    else:
        topic_str = "_".join(list(sector_data.keys())[:3])
        topic_str = re.sub(r'[^\w\-]', '', topic_str)
        topic_str = topic_str[:30]
    
    filename = f"{topic_str}_{timestamp}.md"
    filepath = os.path.join(output_dir, filename)
    
    # Build the report
    report_lines = []
    
    # Header with topics
    topics_display = ", ".join(topics) if topics else ", ".join(sector_data.keys())
    report_lines.append(f"# {topics_display} - Intelligence Report")
    report_lines.append(f"\n**Generated:** {datetime.now().strftime('%B %d, %Y at %H:%M')}")
    report_lines.append("")
    report_lines.append("---")
    report_lines.append("")
    
    # Executive Summary
    total_articles = sum(len(articles) for articles in sector_data.values())
    weak_signals = sum(
        1 for articles in sector_data.values() 
        for a in articles if 'Weak' in a.get('signal_type', '')
    )
    high_relevance = sum(
        1 for articles in sector_data.values() 
        for a in articles if a.get('relevance_score', 0) >= 8
    )
    
    report_lines.append("## 📊 Executive Summary")
    # Count startups mentioned
    startups_found = sum(
        1 for articles in sector_data.values() 
        for a in articles if a.get('startups', 'None') != 'None'
    )
    
    report_lines.append("")
    report_lines.append(f"- **Total Articles Analyzed:** {total_articles}")
    report_lines.append(f"- **Weak Signals Detected:** {weak_signals}")
    report_lines.append(f"- **High Relevance Items (8+):** {high_relevance}")
    report_lines.append(f"- **Articles with Startups/Funding:** {startups_found}")
    report_lines.append("")
    
    # V2: Industry Breakdown
    industry_counts = Counter()
    market_segments = Counter()
    for articles in sector_data.values():
        for a in articles:
            industry = a.get('industry', 'Other')
            industry_counts[industry] += 1
            segment = a.get('market_segment', 'General')
            if segment and segment != 'General':
                market_segments[segment] += 1
    
    if industry_counts:
        report_lines.append("### 🏭 Industry Breakdown")
        report_lines.append("")
        for industry, count in industry_counts.most_common():
            pct = (count / total_articles) * 100 if total_articles > 0 else 0
            report_lines.append(f"- **{industry}:** {count} articles ({pct:.0f}%)")
        report_lines.append("")
    
    if market_segments:
        report_lines.append("### 🎯 Top Market Segments")
        report_lines.append("")
        for segment, count in market_segments.most_common(5):
            report_lines.append(f"- {segment}: {count}")
        report_lines.append("")
    
    # V2: Key Actors Summary
    all_actors = []
    for articles in sector_data.values():
        for a in articles:
            actors = a.get('key_actors', 'None')
            if actors and actors != 'None':
                # Parse actors (format: "Name (Type) - context, Name2 (Type) - context")
                for actor_entry in actors.split(','):
                    actor_entry = actor_entry.strip()
                    if actor_entry and '(' in actor_entry:
                        # Extract actor name (before the parenthesis)
                        actor_name = actor_entry.split('(')[0].strip()
                        if actor_name:
                            all_actors.append(actor_name)
    
    if all_actors:
        actor_counts = Counter(all_actors)
        report_lines.append("### 👥 Key Actors Mentioned")
        report_lines.append("")
        for actor, count in actor_counts.most_common(10):
            mention_str = f"({count}x)" if count > 1 else ""
            report_lines.append(f"- {actor} {mention_str}")
        report_lines.append("")
    
    # V2: Funding Rounds Summary
    funding_entries = []
    for articles in sector_data.values():
        for a in articles:
            funding = a.get('funding', 'None')
            if funding and funding.lower() != 'none':
                # Split multiple entries by semicolon
                for entry in funding.split(';'):
                    entry = entry.strip()
                    if entry and entry.lower() != 'none':
                        # Parse: "Company | $Amount | Round | Investors"
                        parts = [p.strip() for p in entry.split('|')]
                        if len(parts) >= 2:
                            funding_entries.append({
                                'company': parts[0],
                                'amount': parts[1] if len(parts) > 1 else 'Undisclosed',
                                'round': parts[2] if len(parts) > 2 else '',
                                'investors': parts[3] if len(parts) > 3 else ''
                            })
    
    if funding_entries:
        report_lines.append("### 💰 Funding Rounds Detected")
        report_lines.append("")
        report_lines.append("| Company | Amount | Round | Lead Investors |")
        report_lines.append("|---------|--------|-------|----------------|")
        for f in funding_entries[:10]:  # Top 10
            report_lines.append(f"| {f['company']} | {f['amount']} | {f['round']} | {f['investors']} |")
        report_lines.append("")
    
    # V2: Patents & Publications Summary
    patents_list = []
    publications_list = []
    for articles in sector_data.values():
        for a in articles:
            # Collect patents
            patents = a.get('patents', 'None')
            if patents and patents.lower() != 'none':
                for entry in patents.split(';'):
                    entry = entry.strip()
                    if entry and entry.lower() != 'none':
                        parts = [p.strip() for p in entry.split('|')]
                        patents_list.append({
                            'title': parts[0] if len(parts) > 0 else 'Unknown',
                            'company': parts[1] if len(parts) > 1 else '',
                            'status': parts[2] if len(parts) > 2 else ''
                        })
            # Collect publications
            pubs = a.get('publications', 'None')
            if pubs and pubs.lower() != 'none':
                for entry in pubs.split(';'):
                    entry = entry.strip()
                    if entry and entry.lower() != 'none':
                        parts = [p.strip() for p in entry.split('|')]
                        publications_list.append({
                            'title': parts[0] if len(parts) > 0 else 'Unknown',
                            'authors': parts[1] if len(parts) > 1 else '',
                            'journal': parts[2] if len(parts) > 2 else ''
                        })
    
    if patents_list:
        report_lines.append("### 📜 Patents Detected")
        report_lines.append("")
        report_lines.append("| Patent Title | Company | Status |")
        report_lines.append("|--------------|---------|--------|")
        for p in patents_list[:10]:
            report_lines.append(f"| {p['title']} | {p['company']} | {p['status']} |")
        report_lines.append("")
    
    if publications_list:
        report_lines.append("### 📚 Scientific Publications")
        report_lines.append("")
        report_lines.append("| Title | Authors/Institution | Journal/Conference |")
        report_lines.append("|-------|---------------------|-------------------|")
        for pub in publications_list[:10]:
            report_lines.append(f"| {pub['title']} | {pub['authors']} | {pub['journal']} |")
        report_lines.append("")
    
    report_lines.append("---")
    report_lines.append("")
    
    # Sector-by-sector breakdown
    for sector, articles in sector_data.items():
        report_lines.append(f"## 🏷️ {sector}")
        report_lines.append("")
        
        if not articles:
            report_lines.append("*No articles found for this sector.*")
            report_lines.append("")
            continue
        
        # Top signals first
        for i, article in enumerate(articles, 1):
            signal_emoji = get_signal_emoji(article.get('signal_type', ''))
            relevance = article.get('relevance_score', 0)
            industry = article.get('industry', 'Other')
            segment = article.get('market_segment', '')
            
            # Get published date and source API
            published_at = article.get('published_at', article.get('publishedAt', ''))
            if published_at:
                # Format date nicely (handle ISO format)
                try:
                    from datetime import datetime as dt
                    if 'T' in published_at:
                        pub_date = dt.fromisoformat(published_at.replace('Z', '+00:00'))
                        published_str = pub_date.strftime('%Y-%m-%d')
                    else:
                        published_str = published_at[:10]
                except:
                    published_str = published_at[:10] if len(published_at) >= 10 else published_at
            else:
                published_str = 'Unknown'
            
            source_api = article.get('source_api', 'newsapi')
            api_badge = "🌐 Perplexity" if source_api == 'perplexity' else "📰 NewsAPI"
            
            report_lines.append(f"### {i}. {article.get('title', 'Untitled')}")
            report_lines.append("")
            report_lines.append(f"**Source:** {article.get('source', 'Unknown')} | "
                              f"**Published:** {published_str} | "
                              f"**Via:** {api_badge}")
            report_lines.append(f"**Signal:** {signal_emoji} {article.get('signal_type', 'N/A')} | "
                              f"**Relevance:** {relevance}/10")
            # V2: Industry classification
            if industry and industry != 'Other':
                segment_str = f" > {segment}" if segment and segment != 'General' else ""
                report_lines.append(f"**Industry:** 🏭 {industry}{segment_str}")
            
            # V2: Key Actors
            key_actors = article.get('key_actors', 'None')
            if key_actors and key_actors != 'None':
                report_lines.append(f"**Key Actors:** 👥 {key_actors}")
            report_lines.append("")
            
            # Summary bullets
            summary = article.get('summary', 'No summary available')
            report_lines.append("**Key Points:**")
            report_lines.append(summary)
            report_lines.append("")
            
            # Startups mentioned
            startups = article.get('startups', 'None')
            if startups and startups != 'None':
                report_lines.append(f"🚀 **Startups Mentioned:** {startups}")
                report_lines.append("")
            
            # Funding info
            funding = article.get('funding', 'None')
            if funding and funding != 'None':
                report_lines.append(f"💰 **Funding:** {funding}")
                report_lines.append("")
            
            # Patents
            patents = article.get('patents', 'None')
            if patents and patents.lower() != 'none':
                report_lines.append(f"📜 **Patents:** {patents}")
                report_lines.append("")
            
            # Publications
            publications = article.get('publications', 'None')
            if publications and publications.lower() != 'none':
                report_lines.append(f"📚 **Publications:** {publications}")
                report_lines.append("")
            
            # Link
            report_lines.append(f"🔗 [Read Full Article]({article.get('url', '#')})")
            report_lines.append("")
            report_lines.append("---")
            report_lines.append("")
    
    # Footer
    report_lines.append("## 📌 Legend")
    report_lines.append("")
    report_lines.append("- 🟡 **Weak Signal**: Early trend or emerging technology worth monitoring")
    report_lines.append("- 🟢 **Strong Signal**: Established trend with clear market impact")
    report_lines.append("- ⚪ **Noise**: Not significant for strategic planning")
    report_lines.append("")
    report_lines.append("---")
    report_lines.append(f"*Report generated by AI Watch v2.0*")
    
    # Write to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(report_lines))
    
    print(f"✅ Report saved to: {filepath}")
    return filepath


def get_signal_emoji(signal_type):
    """Get emoji for signal type."""
    if 'Weak' in signal_type:
        return '🟡'
    elif 'Strong' in signal_type:
        return '🟢'
    else:
        return '⚪'


def print_quick_summary(sector_data):
    """Print a quick console summary with industry breakdown."""
    print("\n" + "="*60)
    print("📋 QUICK SUMMARY")
    print("="*60)
    
    # V2: Industry breakdown
    industry_counts = Counter()
    for articles in sector_data.values():
        for a in articles:
            industry_counts[a.get('industry', 'Other')] += 1
    
    if industry_counts:
        print("\n🏭 INDUSTRY BREAKDOWN:")
        for industry, count in industry_counts.most_common():
            print(f"  {industry}: {count}")
    
    for sector, articles in sector_data.items():
        print(f"\n🏷️ {sector} ({len(articles)} articles)")
        
        # Show top 3 by relevance
        top_articles = sorted(articles, key=lambda x: x.get('relevance_score', 0), reverse=True)[:3]
        
        for article in top_articles:
            signal = article.get('signal_type', 'N/A')
            score = article.get('relevance_score', 0)
            industry = article.get('industry', '')
            title = article.get('title', 'Untitled')[:50]
            industry_tag = f"[{industry}] " if industry and industry != 'Other' else ""
            print(f"  [{score}/10] {signal}: {industry_tag}{title}...")


def generate_pdf_report(sector_data, output_dir=None, topics=None):
    if output_dir is None:
        output_dir = _REPORTS_DIR
    """
    Generate a PDF report from summarized sector news.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        output_dir: Directory to save reports
        topics: List of topics searched (for filename)
    
    Returns:
        Path to the generated PDF report
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate filename
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
    if topics:
        topic_str = "_".join(topics[:3])
        topic_str = re.sub(r'[^\w\-]', '', topic_str)
        topic_str = topic_str[:30]
    else:
        topic_str = "_".join(list(sector_data.keys())[:3])
        topic_str = re.sub(r'[^\w\-]', '', topic_str)
        topic_str = topic_str[:30]
    
    filename = f"{topic_str}_{timestamp}.pdf"
    filepath = os.path.join(output_dir, filename)
    
    # Create PDF
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    
    # Title
    topics_display = ", ".join(topics) if topics else ", ".join(sector_data.keys())
    pdf.cell(0, 10, f"{topics_display} - Intelligence Report", ln=True, align="C")
    
    # Generated date
    pdf.set_font("Arial", "I", 10)
    pdf.cell(0, 5, f"Generated: {datetime.now().strftime('%B %d, %Y at %H:%M')}", ln=True, align="C")
    pdf.ln(5)
    
    # Executive Summary
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 5, "Executive Summary", ln=True)
    
    total_articles = sum(len(articles) for articles in sector_data.values())
    weak_signals = sum(
        1 for articles in sector_data.values() 
        for a in articles if 'Weak' in a.get('signal_type', '')
    )
    high_relevance = sum(
        1 for articles in sector_data.values() 
        for a in articles if a.get('relevance_score', 0) >= 8
    )
    
    pdf.set_font("Arial", "", 9)
    pdf.cell(0, 4, f"Total Articles Analyzed: {total_articles}", ln=True)
    pdf.cell(0, 4, f"Weak Signals Detected: {weak_signals}", ln=True)
    pdf.cell(0, 4, f"High Relevance Items (8+): {high_relevance}", ln=True)
    pdf.ln(3)
    
    # Industry Breakdown
    industry_counts = Counter()
    for articles in sector_data.values():
        for a in articles:
            industry = a.get('industry', 'Other')
            industry_counts[industry] += 1
    
    if industry_counts:
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 5, "Industry Breakdown", ln=True)
        pdf.set_font("Arial", "", 8)
        for industry, count in industry_counts.most_common(10):
            pct = (count / total_articles * 100) if total_articles > 0 else 0
            pdf.cell(0, 4, f"  {industry}: {count} articles ({pct:.0f}%)", ln=True)
        pdf.ln(2)
    
    # Sector details
    for sector, articles in sector_data.items():
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 5, f"{sector} ({len(articles)} articles)", ln=True)
        
        if not articles:
            pdf.set_font("Arial", "", 9)
            pdf.cell(0, 4, "No articles found for this sector.", ln=True)
            continue
        
        # Show top articles
        for i, article in enumerate(articles[:5], 1):  # Limit to top 5 per sector
            pdf.set_font("Arial", "B", 9)
            title = article.get('title', 'Untitled')[:80]
            pdf.multi_cell(0, 4, f"{i}. {title}")
            
            pdf.set_font("Arial", "", 8)
            relevance = article.get('relevance_score', 0)
            signal = article.get('signal_type', 'N/A')
            source = article.get('source', 'Unknown')
            industry = article.get('industry', '')
            
            pdf.cell(0, 3, f"Source: {source} | Relevance: {relevance}/10 | Signal: {signal}", ln=True)
            if industry:
                pdf.cell(0, 3, f"Industry: {industry}", ln=True)
            
            summary = article.get('summary', 'No summary available')[:200]
            pdf.multi_cell(0, 3, f"Summary: {summary}...")
            pdf.ln(1)
        
        pdf.ln(2)
    
    # Footer
    pdf.set_font("Arial", "I", 8)
    pdf.cell(0, 5, "Report generated by AI Watch v2.0", ln=True, align="C")
    
    # Save
    pdf.output(filepath)
    print(f"✅ PDF Report saved to: {filepath}")
    return filepath


if __name__ == "__main__":
    # Test with sample data
    test_data = {
        "AI & Machine Learning": [
            {
                'title': 'Test Article 1',
                'source': 'TechCrunch',
                'url': 'https://example.com/1',
                'summary': '- Point 1\n- Point 2\n- Point 3',
                'signal_type': 'Weak Signal',
                'relevance_score': 9
            },
            {
                'title': 'Test Article 2',
                'source': 'Wired',
                'url': 'https://example.com/2',
                'summary': '- Insight A\n- Insight B',
                'signal_type': 'Strong Signal',
                'relevance_score': 7
            }
        ]
    }
    
    print_quick_summary(test_data)
    generate_markdown_report(test_data)
    generate_pdf_report(test_data)
