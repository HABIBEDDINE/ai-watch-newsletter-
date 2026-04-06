import os
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).resolve().parent.parent / "config" / ".env")

print('📋 Environment Variables:')
news_key = os.getenv('NEWS_API_KEY', 'NOT SET')
newsdata_key = os.getenv('NEWSDATA_API_KEY', 'NOT SET')
print(f'NEWS_API_KEY: {news_key[:20]}...' if news_key != 'NOT SET' else f'NEWS_API_KEY: {news_key}')
print(f'NEWSDATA_API_KEY: {newsdata_key[:20]}...' if newsdata_key != 'NOT SET' else f'NEWSDATA_API_KEY: {newsdata_key}')

print()
print('Testing ingestion...')
from ingestion import run_ingest_fast, PRESET_SECTORS
print(f'Available sectors: {list(PRESET_SECTORS.keys())}')

print()
print('Fetching from AI sector...')
result = run_ingest_fast('AI', limit=5)
print(f'Result count: {len(result)}')
if result:
    for i, article in enumerate(result[:3], 1):
        print(f'  {i}. {article.get("title", "N/A")[:60]}... (source: {article.get("ingestion_source")})')
else:
    print('  ❌ No articles returned')
