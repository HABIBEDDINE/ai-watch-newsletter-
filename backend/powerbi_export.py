"""
AI Watch - Power BI Export Module
V2: Exports data to CSV/JSON for Power BI dashboard integration.
"""
import os
import csv
import json
from datetime import datetime
from collections import Counter


def ensure_export_dir(export_dir="powerbi_data"):
    """Create export directory if it doesn't exist."""
    os.makedirs(export_dir, exist_ok=True)
    return export_dir


def export_articles_csv(sector_data, export_dir="powerbi_data"):
    """
    Export all articles to a flat CSV file for Power BI.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        export_dir: Directory for export files
    
    Returns:
        Path to exported CSV
    """
    ensure_export_dir(export_dir)
    
    timestamp = datetime.now().strftime('%Y-%m-%d')
    filepath = os.path.join(export_dir, f"articles_{timestamp}.csv")
    
    # Define CSV columns
    fieldnames = [
        'export_date',
        'export_timestamp',
        'search_topic',
        'title',
        'source',
        'source_api',
        'published_date',
        'url',
        'signal_type',
        'relevance_score',
        'industry',
        'market_segment',
        'key_actors',
        'startups',
        'funding',
        'summary',
        'is_weak_signal',
        'is_strong_signal',
        'is_high_relevance',
        'has_startups',
        'has_funding',
        'has_key_actors',
        'patents',
        'publications',
        'has_patents',
        'has_publications'
    ]
    
    rows = []
    export_timestamp = datetime.now().isoformat()
    export_date = datetime.now().strftime('%Y-%m-%d')
    
    for sector, articles in sector_data.items():
        for article in articles:
            signal_type = article.get('signal_type', 'Unknown')
            relevance = article.get('relevance_score', 0)
            key_actors = article.get('key_actors', 'None')
            startups = article.get('startups', 'None')
            funding = article.get('funding', 'None')
            patents = article.get('patents', 'None')
            publications = article.get('publications', 'None')
            
            row = {
                'export_date': export_date,
                'export_timestamp': export_timestamp,
                'search_topic': sector,
                'title': article.get('title', ''),
                'source': article.get('source', ''),
                'source_api': article.get('source_api', 'newsapi'),
                'published_date': article.get('published_at', article.get('publishedAt', '')),
                'url': article.get('url', ''),
                'signal_type': signal_type,
                'relevance_score': relevance,
                'industry': article.get('industry', 'Other'),
                'market_segment': article.get('market_segment', 'General'),
                'key_actors': key_actors,
                'startups': startups,
                'funding': funding,
                'summary': article.get('summary', '').replace('\n', ' | '),
                'is_weak_signal': 1 if 'Weak' in signal_type else 0,
                'is_strong_signal': 1 if 'Strong' in signal_type else 0,
                'is_high_relevance': 1 if relevance >= 8 else 0,
                'has_startups': 1 if startups and startups != 'None' else 0,
                'has_funding': 1 if funding and funding != 'None' else 0,
                'has_key_actors': 1 if key_actors and key_actors != 'None' else 0,
                'patents': patents,
                'publications': publications,
                'has_patents': 1 if patents and patents.lower() != 'none' else 0,
                'has_publications': 1 if publications and publications.lower() != 'none' else 0
            }
            rows.append(row)
    
    # Write CSV
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"📊 Articles CSV exported: {filepath} ({len(rows)} rows)")
    return filepath


def export_articles_cumulative(sector_data, export_dir="powerbi_data"):
    """
    Append articles to a cumulative CSV (for historical tracking).
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        export_dir: Directory for export files
    
    Returns:
        Path to cumulative CSV
    """
    ensure_export_dir(export_dir)
    filepath = os.path.join(export_dir, "articles_history.csv")
    
    # Define CSV columns
    fieldnames = [
        'export_date',
        'export_timestamp',
        'search_topic',
        'title',
        'source',
        'source_api',
        'published_date',
        'url',
        'signal_type',
        'relevance_score',
        'industry',
        'market_segment',
        'key_actors',
        'startups',
        'funding',
        'is_weak_signal',
        'is_strong_signal',
        'is_high_relevance',
        'has_startups',
        'has_funding',
        'has_key_actors',
        'patents',
        'publications',
        'has_patents',
        'has_publications'
    ]
    
    # Check if file exists to decide on header
    file_exists = os.path.exists(filepath)
    
    export_timestamp = datetime.now().isoformat()
    export_date = datetime.now().strftime('%Y-%m-%d')
    
    with open(filepath, 'a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        
        if not file_exists:
            writer.writeheader()
        
        for sector, articles in sector_data.items():
            for article in articles:
                signal_type = article.get('signal_type', 'Unknown')
                relevance = article.get('relevance_score', 0)
                key_actors = article.get('key_actors', 'None')
                startups = article.get('startups', 'None')
                funding = article.get('funding', 'None')
                patents = article.get('patents', 'None')
                publications = article.get('publications', 'None')
                
                row = {
                    'export_date': export_date,
                    'export_timestamp': export_timestamp,
                    'search_topic': sector,
                    'title': article.get('title', ''),
                    'source': article.get('source', ''),
                    'source_api': article.get('source_api', 'newsapi'),
                    'published_date': article.get('published_at', article.get('publishedAt', '')),
                    'url': article.get('url', ''),
                    'signal_type': signal_type,
                    'relevance_score': relevance,
                    'industry': article.get('industry', 'Other'),
                    'market_segment': article.get('market_segment', 'General'),
                    'key_actors': key_actors,
                    'startups': startups,
                    'funding': funding,
                    'is_weak_signal': 1 if 'Weak' in signal_type else 0,
                    'is_strong_signal': 1 if 'Strong' in signal_type else 0,
                    'is_high_relevance': 1 if relevance >= 8 else 0,
                    'has_startups': 1 if startups and startups != 'None' else 0,
                    'has_funding': 1 if funding and funding != 'None' else 0,
                    'has_key_actors': 1 if key_actors and key_actors != 'None' else 0,
                    'patents': patents,
                    'publications': publications,
                    'has_patents': 1 if patents and patents.lower() != 'none' else 0,
                    'has_publications': 1 if publications and publications.lower() != 'none' else 0
                }
                writer.writerow(row)
    
    print(f"📊 Articles appended to history: {filepath}")
    return filepath


def export_industry_breakdown(sector_data, export_dir="powerbi_data"):
    """
    Export industry breakdown to CSV for pie/bar charts.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        export_dir: Directory for export files
    
    Returns:
        Path to exported CSV
    """
    ensure_export_dir(export_dir)
    
    timestamp = datetime.now().strftime('%Y-%m-%d')
    filepath = os.path.join(export_dir, f"industry_breakdown_{timestamp}.csv")
    
    # Count by industry
    industry_counts = Counter()
    industry_relevance = {}
    industry_signals = {}
    
    for articles in sector_data.values():
        for a in articles:
            industry = a.get('industry', 'Other')
            industry_counts[industry] += 1
            
            # Track average relevance
            if industry not in industry_relevance:
                industry_relevance[industry] = []
            industry_relevance[industry].append(a.get('relevance_score', 0))
            
            # Track signals
            if industry not in industry_signals:
                industry_signals[industry] = {'weak': 0, 'strong': 0}
            if 'Weak' in a.get('signal_type', ''):
                industry_signals[industry]['weak'] += 1
            elif 'Strong' in a.get('signal_type', ''):
                industry_signals[industry]['strong'] += 1
    
    # Build rows
    rows = []
    total = sum(industry_counts.values())
    
    for industry, count in industry_counts.items():
        avg_relevance = sum(industry_relevance[industry]) / len(industry_relevance[industry]) if industry_relevance[industry] else 0
        rows.append({
            'export_date': datetime.now().strftime('%Y-%m-%d'),
            'industry': industry,
            'article_count': count,
            'percentage': round((count / total) * 100, 1) if total > 0 else 0,
            'avg_relevance': round(avg_relevance, 1),
            'weak_signals': industry_signals.get(industry, {}).get('weak', 0),
            'strong_signals': industry_signals.get(industry, {}).get('strong', 0)
        })
    
    # Sort by count
    rows.sort(key=lambda x: x['article_count'], reverse=True)
    
    # Write CSV
    fieldnames = ['export_date', 'industry', 'article_count', 'percentage', 'avg_relevance', 'weak_signals', 'strong_signals']
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"📊 Industry breakdown exported: {filepath}")
    return filepath


def export_market_segments(sector_data, export_dir="powerbi_data"):
    """
    Export market segment breakdown to CSV.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        export_dir: Directory for export files
    
    Returns:
        Path to exported CSV
    """
    ensure_export_dir(export_dir)
    
    timestamp = datetime.now().strftime('%Y-%m-%d')
    filepath = os.path.join(export_dir, f"market_segments_{timestamp}.csv")
    
    # Count by segment with industry
    segment_data = {}
    
    for articles in sector_data.values():
        for a in articles:
            industry = a.get('industry', 'Other')
            segment = a.get('market_segment', 'General')
            key = (industry, segment)
            
            if key not in segment_data:
                segment_data[key] = {'count': 0, 'relevance': [], 'weak': 0, 'strong': 0}
            
            segment_data[key]['count'] += 1
            segment_data[key]['relevance'].append(a.get('relevance_score', 0))
            
            if 'Weak' in a.get('signal_type', ''):
                segment_data[key]['weak'] += 1
            elif 'Strong' in a.get('signal_type', ''):
                segment_data[key]['strong'] += 1
    
    # Build rows
    rows = []
    for (industry, segment), data in segment_data.items():
        avg_relevance = sum(data['relevance']) / len(data['relevance']) if data['relevance'] else 0
        rows.append({
            'export_date': datetime.now().strftime('%Y-%m-%d'),
            'industry': industry,
            'market_segment': segment,
            'article_count': data['count'],
            'avg_relevance': round(avg_relevance, 1),
            'weak_signals': data['weak'],
            'strong_signals': data['strong']
        })
    
    # Sort by count
    rows.sort(key=lambda x: x['article_count'], reverse=True)
    
    # Write CSV
    fieldnames = ['export_date', 'industry', 'market_segment', 'article_count', 'avg_relevance', 'weak_signals', 'strong_signals']
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"📊 Market segments exported: {filepath}")
    return filepath


def export_sources(sector_data, export_dir="powerbi_data"):
    """
    Export source breakdown for credibility analysis.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        export_dir: Directory for export files
    
    Returns:
        Path to exported CSV
    """
    ensure_export_dir(export_dir)
    
    timestamp = datetime.now().strftime('%Y-%m-%d')
    filepath = os.path.join(export_dir, f"sources_{timestamp}.csv")
    
    source_counts = Counter()
    source_relevance = {}
    
    for articles in sector_data.values():
        for a in articles:
            source = a.get('source', 'Unknown')
            source_counts[source] += 1
            
            if source not in source_relevance:
                source_relevance[source] = []
            source_relevance[source].append(a.get('relevance_score', 0))
    
    rows = []
    for source, count in source_counts.most_common():
        avg_relevance = sum(source_relevance[source]) / len(source_relevance[source]) if source_relevance[source] else 0
        rows.append({
            'export_date': datetime.now().strftime('%Y-%m-%d'),
            'source': source,
            'article_count': count,
            'avg_relevance': round(avg_relevance, 1)
        })
    
    fieldnames = ['export_date', 'source', 'article_count', 'avg_relevance']
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"📊 Sources exported: {filepath}")
    return filepath


def export_summary_stats(sector_data, export_dir="powerbi_data"):
    """
    Export summary statistics as JSON for KPI cards.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        export_dir: Directory for export files
    
    Returns:
        Path to exported JSON
    """
    ensure_export_dir(export_dir)
    
    timestamp = datetime.now().strftime('%Y-%m-%d')
    filepath = os.path.join(export_dir, f"summary_stats_{timestamp}.json")
    
    # Calculate stats
    total_articles = sum(len(articles) for articles in sector_data.values())
    
    all_articles = [a for articles in sector_data.values() for a in articles]
    
    weak_signals = sum(1 for a in all_articles if 'Weak' in a.get('signal_type', ''))
    strong_signals = sum(1 for a in all_articles if 'Strong' in a.get('signal_type', ''))
    high_relevance = sum(1 for a in all_articles if a.get('relevance_score', 0) >= 8)
    
    avg_relevance = sum(a.get('relevance_score', 0) for a in all_articles) / total_articles if total_articles > 0 else 0
    
    startups_found = sum(1 for a in all_articles if a.get('startups', 'None') != 'None')
    funding_mentioned = sum(1 for a in all_articles if a.get('funding', 'None') != 'None')
    articles_with_actors = sum(1 for a in all_articles if a.get('key_actors', 'None') != 'None')
    
    # Count unique actors
    all_actors = []
    for a in all_articles:
        actors = a.get('key_actors', 'None')
        if actors and actors != 'None':
            for actor_entry in actors.split(','):
                actor_entry = actor_entry.strip()
                if actor_entry and '(' in actor_entry:
                    actor_name = actor_entry.split('(')[0].strip()
                    if actor_name:
                        all_actors.append(actor_name)
    unique_actors = len(set(all_actors))
    
    # Industry distribution
    industry_counts = Counter(a.get('industry', 'Other') for a in all_articles)
    top_industry = industry_counts.most_common(1)[0] if industry_counts else ('N/A', 0)
    
    # Source distribution
    source_counts = Counter(a.get('source', 'Unknown') for a in all_articles)
    top_source = source_counts.most_common(1)[0] if source_counts else ('N/A', 0)
    
    # Top actor
    actor_counts = Counter(all_actors)
    top_actor = actor_counts.most_common(1)[0] if actor_counts else ('N/A', 0)
    
    stats = {
        'export_date': datetime.now().strftime('%Y-%m-%d'),
        'export_timestamp': datetime.now().isoformat(),
        'kpi': {
            'total_articles': total_articles,
            'weak_signals': weak_signals,
            'strong_signals': strong_signals,
            'high_relevance_count': high_relevance,
            'avg_relevance': round(avg_relevance, 2),
            'startups_found': startups_found,
            'funding_mentions': funding_mentioned,
            'unique_industries': len(industry_counts),
            'unique_sources': len(source_counts),
            'articles_with_actors': articles_with_actors,
            'unique_actors': unique_actors
        },
        'top_metrics': {
            'top_industry': top_industry[0],
            'top_industry_count': top_industry[1],
            'top_source': top_source[0],
            'top_source_count': top_source[1],
            'top_actor': top_actor[0],
            'top_actor_mentions': top_actor[1]
        },
        'topics_analyzed': list(sector_data.keys()),
        'industry_distribution': dict(industry_counts)
    }
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2)
    
    print(f"📊 Summary stats exported: {filepath}")
    return filepath


def export_key_actors(sector_data, export_dir="powerbi_data"):
    """
    Export key actors breakdown for mapping/network analysis.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        export_dir: Directory for export files
    
    Returns:
        Path to exported CSV
    """
    ensure_export_dir(export_dir)
    
    timestamp = datetime.now().strftime('%Y-%m-%d')
    filepath = os.path.join(export_dir, f"key_actors_{timestamp}.csv")
    
    # Parse all actors from articles
    actor_data = {}
    
    for sector, articles in sector_data.items():
        for article in articles:
            actors_str = article.get('key_actors', 'None')
            if actors_str and actors_str != 'None':
                # Parse actors (format: "Name (Type) - context, Name2 (Type) - context")
                for actor_entry in actors_str.split(','):
                    actor_entry = actor_entry.strip()
                    if not actor_entry:
                        continue
                    
                    # Extract components
                    actor_name = ""
                    actor_type = "Unknown"
                    actor_context = ""
                    
                    if '(' in actor_entry and ')' in actor_entry:
                        # Has type info
                        parts = actor_entry.split('(')
                        actor_name = parts[0].strip()
                        rest = '('.join(parts[1:])  # In case of multiple parentheses
                        if ')' in rest:
                            type_and_context = rest.split(')')
                            actor_type = type_and_context[0].strip()
                            if len(type_and_context) > 1:
                                context_part = ')'.join(type_and_context[1:])
                                if '-' in context_part:
                                    actor_context = context_part.split('-', 1)[1].strip()
                    else:
                        actor_name = actor_entry.split('-')[0].strip() if '-' in actor_entry else actor_entry
                        if '-' in actor_entry:
                            actor_context = actor_entry.split('-', 1)[1].strip()
                    
                    if not actor_name:
                        continue
                        
                    key = actor_name
                    if key not in actor_data:
                        actor_data[key] = {
                            'name': actor_name,
                            'type': actor_type,
                            'contexts': [],
                            'industries': [],
                            'mention_count': 0
                        }
                    
                    actor_data[key]['mention_count'] += 1
                    if actor_context:
                        actor_data[key]['contexts'].append(actor_context)
                    industry = article.get('industry', 'Other')
                    if industry not in actor_data[key]['industries']:
                        actor_data[key]['industries'].append(industry)
    
    # Build rows
    rows = []
    for actor_name, data in actor_data.items():
        rows.append({
            'export_date': datetime.now().strftime('%Y-%m-%d'),
            'actor_name': data['name'],
            'actor_type': data['type'],
            'mention_count': data['mention_count'],
            'industries': ' | '.join(data['industries']),
            'sample_context': data['contexts'][0] if data['contexts'] else ''
        })
    
    # Sort by mention count
    rows.sort(key=lambda x: x['mention_count'], reverse=True)
    
    # Write CSV
    fieldnames = ['export_date', 'actor_name', 'actor_type', 'mention_count', 'industries', 'sample_context']
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"📊 Key actors exported: {filepath} ({len(rows)} actors)")
    return filepath


def parse_funding_entry(entry_str):
    """
    Parse a single funding entry from the LLM format.
    Format: "Company | $Amount | Round | Investors"
    
    Returns:
        Dict with company, amount, round_type, investors, amount_numeric
    """
    parts = [p.strip() for p in entry_str.split('|')]
    
    result = {
        'company': parts[0] if len(parts) > 0 else 'Unknown',
        'amount': parts[1] if len(parts) > 1 else 'Undisclosed',
        'round_type': parts[2] if len(parts) > 2 else 'Unknown',
        'investors': parts[3] if len(parts) > 3 else '',
        'amount_numeric': 0
    }
    
    # Parse numeric amount (e.g., "$50M" -> 50000000)
    amount_str = result['amount'].upper().replace('$', '').replace(',', '').strip()
    try:
        if 'B' in amount_str:
            result['amount_numeric'] = float(amount_str.replace('B', '')) * 1_000_000_000
        elif 'M' in amount_str:
            result['amount_numeric'] = float(amount_str.replace('M', '')) * 1_000_000
        elif 'K' in amount_str:
            result['amount_numeric'] = float(amount_str.replace('K', '')) * 1_000
        else:
            result['amount_numeric'] = float(amount_str) if amount_str.replace('.', '').isdigit() else 0
    except:
        result['amount_numeric'] = 0
    
    return result


def export_funding_rounds(sector_data, export_dir="powerbi_data"):
    """
    Export funding rounds data for investment analysis.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        export_dir: Directory for export files
    
    Returns:
        Path to exported CSV
    """
    ensure_export_dir(export_dir)
    
    timestamp = datetime.now().strftime('%Y-%m-%d')
    filepath = os.path.join(export_dir, f"funding_rounds_{timestamp}.csv")
    
    rows = []
    export_date = datetime.now().strftime('%Y-%m-%d')
    
    for sector, articles in sector_data.items():
        for article in articles:
            funding_str = article.get('funding', 'None')
            if funding_str and funding_str.lower() != 'none':
                # Split multiple funding entries by semicolon
                entries = funding_str.split(';')
                for entry in entries:
                    entry = entry.strip()
                    if not entry or entry.lower() == 'none':
                        continue
                    
                    parsed = parse_funding_entry(entry)
                    
                    rows.append({
                        'export_date': export_date,
                        'company': parsed['company'],
                        'amount': parsed['amount'],
                        'amount_numeric': parsed['amount_numeric'],
                        'round_type': parsed['round_type'],
                        'investors': parsed['investors'],
                        'industry': article.get('industry', 'Other'),
                        'market_segment': article.get('market_segment', 'General'),
                        'article_title': article.get('title', ''),
                        'source': article.get('source', ''),
                        'article_url': article.get('url', '')
                    })
    
    # Sort by amount (largest first)
    rows.sort(key=lambda x: x['amount_numeric'], reverse=True)
    
    # Write CSV
    fieldnames = [
        'export_date', 'company', 'amount', 'amount_numeric', 'round_type',
        'investors', 'industry', 'market_segment', 'article_title', 'source', 'article_url'
    ]
    
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    # Calculate summary stats
    total_amount = sum(r['amount_numeric'] for r in rows)
    amount_str = f"${total_amount/1_000_000:.1f}M" if total_amount >= 1_000_000 else f"${total_amount:,.0f}"
    
    print(f"📊 Funding rounds exported: {filepath} ({len(rows)} rounds, {amount_str} total)")
    return filepath


def export_patents_publications(sector_data, export_dir="powerbi_data"):
    """
    Export patents and publications data for R&D tracking.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        export_dir: Directory for export files
    
    Returns:
        Path to exported CSV
    """
    ensure_export_dir(export_dir)
    
    timestamp = datetime.now().strftime('%Y-%m-%d')
    filepath = os.path.join(export_dir, f"patents_publications_{timestamp}.csv")
    
    rows = []
    export_date = datetime.now().strftime('%Y-%m-%d')
    
    for sector, articles in sector_data.items():
        for article in articles:
            # Process patents
            patents_str = article.get('patents', 'None')
            if patents_str and patents_str.lower() != 'none':
                for entry in patents_str.split(';'):
                    entry = entry.strip()
                    if not entry or entry.lower() == 'none':
                        continue
                    parts = [p.strip() for p in entry.split('|')]
                    rows.append({
                        'export_date': export_date,
                        'type': 'Patent',
                        'title': parts[0] if len(parts) > 0 else 'Unknown',
                        'company_or_authors': parts[1] if len(parts) > 1 else '',
                        'status_or_journal': parts[2] if len(parts) > 2 else '',
                        'industry': article.get('industry', 'Other'),
                        'market_segment': article.get('market_segment', 'General'),
                        'article_title': article.get('title', ''),
                        'source': article.get('source', ''),
                        'article_url': article.get('url', '')
                    })
            
            # Process publications
            publications_str = article.get('publications', 'None')
            if publications_str and publications_str.lower() != 'none':
                for entry in publications_str.split(';'):
                    entry = entry.strip()
                    if not entry or entry.lower() == 'none':
                        continue
                    parts = [p.strip() for p in entry.split('|')]
                    rows.append({
                        'export_date': export_date,
                        'type': 'Publication',
                        'title': parts[0] if len(parts) > 0 else 'Unknown',
                        'company_or_authors': parts[1] if len(parts) > 1 else '',
                        'status_or_journal': parts[2] if len(parts) > 2 else '',
                        'industry': article.get('industry', 'Other'),
                        'market_segment': article.get('market_segment', 'General'),
                        'article_title': article.get('title', ''),
                        'source': article.get('source', ''),
                        'article_url': article.get('url', '')
                    })
    
    # Write CSV
    fieldnames = [
        'export_date', 'type', 'title', 'company_or_authors', 'status_or_journal',
        'industry', 'market_segment', 'article_title', 'source', 'article_url'
    ]
    
    with open(filepath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    
    patent_count = sum(1 for r in rows if r['type'] == 'Patent')
    pub_count = sum(1 for r in rows if r['type'] == 'Publication')
    
    print(f"📊 Patents & publications exported: {filepath} ({patent_count} patents, {pub_count} publications)")
    return filepath


def export_all_for_powerbi(sector_data, export_dir="powerbi_data"):
    """
    Export all data files for Power BI dashboard.
    
    Args:
        sector_data: Dict of {sector_name: [summarized_articles]}
        export_dir: Directory for export files
    
    Returns:
        List of exported file paths
    """
    print("\n📊 Exporting data for Power BI...")
    
    exported_files = []
    
    # Daily snapshot
    exported_files.append(export_articles_csv(sector_data, export_dir))
    
    # Cumulative history
    exported_files.append(export_articles_cumulative(sector_data, export_dir))
    
    # Breakdowns
    exported_files.append(export_industry_breakdown(sector_data, export_dir))
    exported_files.append(export_market_segments(sector_data, export_dir))
    exported_files.append(export_sources(sector_data, export_dir))
    exported_files.append(export_key_actors(sector_data, export_dir))
    exported_files.append(export_funding_rounds(sector_data, export_dir))
    exported_files.append(export_patents_publications(sector_data, export_dir))
    
    # Summary stats
    exported_files.append(export_summary_stats(sector_data, export_dir))
    
    print(f"\n✅ Power BI export complete: {len(exported_files)} files in {export_dir}/")
    
    return exported_files


if __name__ == "__main__":
    # Test with sample data
    test_data = {
        "AI & Machine Learning": [
            {
                'title': 'OpenAI Launches GPT-5',
                'source': 'TechCrunch',
                'url': 'https://example.com/1',
                'publishedAt': '2026-02-27',
                'summary': '- GPT-5 features breakthrough\n- 10x improvement',
                'signal_type': 'Strong Signal',
                'relevance_score': 9,
                'industry': 'AI & Machine Learning',
                'market_segment': 'Foundation Models',
                'startups': 'None',
                'funding': 'None'
            },
            {
                'title': 'AI Startup Raises $50M',
                'source': 'VentureBeat',
                'url': 'https://example.com/2',
                'publishedAt': '2026-02-26',
                'summary': '- Series B funding\n- Enterprise focus',
                'signal_type': 'Weak Signal',
                'relevance_score': 8,
                'industry': 'AI & Machine Learning',
                'market_segment': 'AI Agents',
                'startups': 'AgentCorp',
                'funding': '$50M Series B'
            }
        ],
        "Fintech": [
            {
                'title': 'Neobank Expansion in Europe',
                'source': 'Financial Times',
                'url': 'https://example.com/3',
                'publishedAt': '2026-02-25',
                'summary': '- European market entry\n- 2M new users expected',
                'signal_type': 'Strong Signal',
                'relevance_score': 7,
                'industry': 'Fintech',
                'market_segment': 'Digital Banking',
                'startups': 'None',
                'funding': 'None'
            }
        ]
    }
    
    # Export all files
    export_all_for_powerbi(test_data)
    print("\n✅ Test export complete!")
