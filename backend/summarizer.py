"""
AI Watch - Summarizer Module
Uses OpenAI GPT to summarize news articles into actionable insights.
V2: Added industry/market classification
"""
import os
from openai import OpenAI
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent.parent / "config" / ".env")

# V2: Industry Classification Taxonomy
INDUSTRY_TAXONOMY = {
    "Software & Cloud": ["SaaS", "cloud computing", "enterprise software", "developer tools", "DevOps"],
    "AI & Machine Learning": ["artificial intelligence", "machine learning", "deep learning", "LLM", "generative AI", "NLP"],
    "Fintech": ["digital banking", "payments", "cryptocurrency", "blockchain", "insurtech", "regtech"],
    "HealthTech & BioTech": ["digital health", "medtech", "telemedicine", "biotech", "pharma", "genomics"],
    "CleanTech & Energy": ["renewable energy", "solar", "EV", "battery", "hydrogen", "sustainability"],
    "Cybersecurity": ["security", "data protection", "threat detection", "identity", "zero trust"],
    "Hardware & Semiconductors": ["chips", "semiconductors", "IoT", "robotics", "edge computing"],
    "E-commerce & Retail": ["e-commerce", "marketplace", "retail tech", "logistics", "supply chain"],
    "Media & Entertainment": ["streaming", "gaming", "content", "creator economy", "metaverse"],
    "Other": []
}

INDUSTRY_LIST = list(INDUSTRY_TAXONOMY.keys())


def get_openai_client():
    """Initialize OpenAI client."""
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
    return OpenAI(api_key=api_key)


def summarize_article(article, client=None):
    """
    Summarize a single article using GPT.
    
    Args:
        article: Dict with title, description, content
        client: OpenAI client (creates one if not provided)
    
    Returns:
        Dict with original article data + summary and signals
    """
    if client is None:
        client = get_openai_client()
    
    # Combine available text
    full_text = f"""
    Title: {article.get('title', '')}
    Description: {article.get('description', '')}
    Content: {article.get('content', '')}
    """
    
    # V2: Industry list for classification
    industries_str = ", ".join(INDUSTRY_LIST[:-1])  # Exclude "Other"
    
    prompt = f"""Analyze this tech news article and provide:
1. A concise 2-3 bullet point summary (key facts only)
2. Signal Type: Is this a "Weak Signal" (early trend/emerging tech), "Strong Signal" (established trend), or "Noise" (not significant)?
3. Relevance Score: 1-10 (10 = highly relevant for strategic decision-making)
4. Industry: Classify into ONE primary industry from: {industries_str}, or "Other"
5. Market Segment: Specific sub-segment within the industry (e.g., "Enterprise AI", "Digital Payments", "Oncology")
6. Key Actors: List ALL companies, organizations, and key people mentioned. Format: "Name (Type: Company/Person/Org) - Role/Context". Write "None" if no actors identified.
7. Startups Mentioned: List any startups or emerging companies mentioned (name and brief description). Write "None" if no startups.
8. Funding Info: Extract ALL funding rounds, investments, or valuations mentioned. For EACH funding event use this exact format: "Company | $Amount | Round_Type | Investors". Round types: Seed, Series A/B/C/D+, IPO, Acquisition, Undisclosed. Separate multiple events with semicolons. Write "None" if not applicable.
9. Patents: Any patents filed, granted, or mentioned. Format: "Patent_Title | Company | Status (Filed/Granted/Pending)". Separate multiple with semicolons. Write "None" if not applicable.
10. Publications: Any scientific papers, research studies, or academic publications mentioned. Format: "Title | Authors/Institution | Journal/Conference". Separate multiple with semicolons. Write "None" if not applicable.

IMPORTANT: Respond in English only. The summary and all fields must be in English regardless of the article's original language.

Article:
{full_text}

Respond in this exact format:
SUMMARY:
- [bullet 1]
- [bullet 2]
- [bullet 3]

SIGNAL: [Weak Signal/Strong Signal/Noise]
RELEVANCE: [1-10]
INDUSTRY: [industry name]
MARKET_SEGMENT: [specific segment]
KEY_ACTORS: [Actor1 (Type) - context, Actor2 (Type) - context] or None
STARTUPS: [startup1: description, startup2: description] or None
FUNDING: [Company | $Amount | Round | Investors; Company2 | $Amount | Round | Investors] or None
PATENTS: [Patent_Title | Company | Status; ...] or None
PUBLICATIONS: [Title | Authors | Journal; ...] or None
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Cost-effective for summarization
            messages=[
                {"role": "system", "content": "You are a strategic intelligence analyst specializing in technology trends, emerging startups, and key market players. Be concise and actionable. Pay special attention to identifying companies, organizations, and key people. Always respond in English only, regardless of the article's original language."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.3
        )
        
        result = response.choices[0].message.content
        
        # Parse the response
        summary_data = parse_summary_response(result)
        
        return {
            **article,
            'summary': summary_data['summary'],
            'signal_type': summary_data['signal_type'],
            'relevance_score': summary_data['relevance_score'],
            'industry': summary_data.get('industry', 'Other'),
            'market_segment': summary_data.get('market_segment', 'General'),
            'key_actors': summary_data.get('key_actors', 'None'),
            'startups': summary_data.get('startups', 'None'),
            'funding': summary_data.get('funding', 'None'),
            'patents': summary_data.get('patents', 'None'),
            'publications': summary_data.get('publications', 'None')
        }
        
    except Exception as e:
        print(f"Error summarizing article '{article.get('title', 'Unknown')}': {e}")
        return {
            **article,
            'summary': 'Error generating summary',
            'signal_type': 'Unknown',
            'relevance_score': 0,
            'industry': 'Other',
            'market_segment': 'Unknown',
            'key_actors': 'None',
            'startups': 'None',
            'funding': 'None',
            'patents': 'None',
            'publications': 'None'
        }


def parse_summary_response(response_text):
    """Parse the structured GPT response including industry classification, startups and funding."""
    lines = response_text.strip().split('\n')
    
    summary_lines = []
    signal_type = "Unknown"
    relevance_score = 5
    industry = "Other"
    market_segment = "General"
    key_actors = "None"
    startups = "None"
    funding = "None"
    patents = "None"
    publications = "None"
    
    in_summary = False
    for line in lines:
        line = line.strip()
        if line.startswith('SUMMARY:'):
            in_summary = True
            continue
        elif line.startswith('SIGNAL:'):
            in_summary = False
            signal_type = line.replace('SIGNAL:', '').strip()
        elif line.startswith('RELEVANCE:'):
            try:
                relevance_score = int(line.replace('RELEVANCE:', '').strip().split('/')[0])
            except:
                relevance_score = 5
        elif line.startswith('INDUSTRY:'):
            industry = line.replace('INDUSTRY:', '').strip()
            # Validate against taxonomy
            if industry not in INDUSTRY_LIST:
                industry = "Other"
        elif line.startswith('MARKET_SEGMENT:'):
            market_segment = line.replace('MARKET_SEGMENT:', '').strip()
        elif line.startswith('KEY_ACTORS:'):
            key_actors = line.replace('KEY_ACTORS:', '').strip()
        elif line.startswith('STARTUPS:'):
            startups = line.replace('STARTUPS:', '').strip()
        elif line.startswith('FUNDING:'):
            funding = line.replace('FUNDING:', '').strip()
        elif line.startswith('PATENTS:'):
            patents = line.replace('PATENTS:', '').strip()
        elif line.startswith('PUBLICATIONS:'):
            publications = line.replace('PUBLICATIONS:', '').strip()
        elif in_summary and line.startswith('-'):
            summary_lines.append(line)
    
    return {
        'summary': '\n'.join(summary_lines) if summary_lines else response_text,
        'signal_type': signal_type,
        'relevance_score': relevance_score,
        'industry': industry,
        'market_segment': market_segment,
        'key_actors': key_actors,
        'startups': startups,
        'funding': funding,
        'patents': patents,
        'publications': publications
    }


def summarize_articles(articles, min_relevance=0):
    """
    Summarize multiple articles.
    
    Args:
        articles: List of article dicts
        min_relevance: Only return articles with relevance >= this score
    
    Returns:
        List of summarized articles, sorted by relevance
    """
    client = get_openai_client()
    summarized = []
    
    for i, article in enumerate(articles):
        print(f"  Summarizing {i+1}/{len(articles)}: {article.get('title', 'Unknown')[:50]}...")
        result = summarize_article(article, client)
        
        if result['relevance_score'] >= min_relevance:
            summarized.append(result)
    
    # Sort by relevance score (highest first)
    summarized.sort(key=lambda x: x['relevance_score'], reverse=True)
    
    return summarized


if __name__ == "__main__":
    # Test with a sample article
    test_article = {
        'title': 'OpenAI Releases GPT-5 with Revolutionary Reasoning Capabilities',
        'description': 'The new model shows 10x improvement in complex reasoning tasks.',
        'content': 'OpenAI announced today the release of GPT-5, featuring breakthrough advances in reasoning and problem-solving.',
        'url': 'https://example.com/test',
        'source': 'Test Source'
    }
    
    result = summarize_article(test_article)
    print(f"\nTitle: {result['title']}")
    print(f"Summary:\n{result['summary']}")
    print(f"Signal: {result['signal_type']}")
    print(f"Relevance: {result['relevance_score']}/10")
