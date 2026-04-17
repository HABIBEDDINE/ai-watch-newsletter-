"""
Load DXC Newsletter data into Supabase
"""
import json
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from db import supabase

DATA_FILE = Path(__file__).parent.parent / "ONETEAM_Newsletter_Data" / "newsletter_data.json"

def create_table():
    """Create the table if it doesn't exist (run via SQL Editor instead)"""
    print("Note: Table creation should be done via Supabase SQL Editor")
    print("The table schema is in ONETEAM_Newsletter_Data/supabase_migration.sql")

def load_data():
    """Load newsletter data from JSON into Supabase"""
    print(f"Loading data from {DATA_FILE}")

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        articles = json.load(f)

    print(f"Found {len(articles)} articles")

    # Transform data to match table schema
    records = []
    for article in articles:
        record = {
            "id": article["id"],
            "page_number": article["page_number"],
            "title": article["title"],
            "content": article["content"],
            "month": article["month"],
            "month_date": article["month_date"],
            "category": article["category"],
            "image_path": article.get("image_filename", ""),
            "newsletter_edition": article["newsletter_edition"],
        }
        records.append(record)

    # Insert in batches of 50
    batch_size = 50
    inserted = 0

    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        try:
            result = supabase.table("dxc_newsletter_articles").upsert(batch).execute()
            inserted += len(batch)
            print(f"Inserted {inserted}/{len(records)} records...")
        except Exception as e:
            print(f"Error inserting batch {i//batch_size + 1}: {e}")
            # Try individual inserts for failed batch
            for record in batch:
                try:
                    supabase.table("dxc_newsletter_articles").upsert([record]).execute()
                    inserted += 1
                except Exception as e2:
                    print(f"  Failed to insert {record['id']}: {e2}")

    print(f"\nDone! Inserted {inserted} articles.")
    return inserted

if __name__ == "__main__":
    load_data()
