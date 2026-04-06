import requests

response = requests.get('http://localhost:8000/api/articles?page_size=50')
data = response.json()

print('=== 📊 DATA SOURCE BREAKDOWN ===')
print(f'Total articles cached: {data["total"]}')
print()

sources = {}
for article in data['items']:
    source = article['ingestion_source']
    sources[source] = sources.get(source, 0) + 1

print('Articles by source:')
for source in sorted(sources.keys()):
    count = sources[source]
    pct = round(100 * count / len(data['items']), 1)
    print(f'  📄 {source}: {count} ({pct}%)')

print()
print('First 8 articles:')
for i, article in enumerate(data['items'][:8], 1):
    source_short = article['ingestion_source'].replace('Multi-Source (', '').replace(')', '').upper()
    title = article['title'][:50]
    print(f'  {i}. [{source_short:12}] {title}...')
