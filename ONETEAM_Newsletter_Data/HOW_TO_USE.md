# DXC ONETEAM Newsletter Data — AI Watch Integration Guide

## What's in this folder

```
ONETEAM_Newsletter_Data/
├── images/               ← 174 PNG images (one per newsletter page)
│   ├── page_002.png
│   ├── page_003.png
│   └── ...
├── newsletter_data.json  ← All 174 records as JSON (for your FastAPI backend)
├── supabase_migration.sql ← Run this in Supabase SQL Editor
└── HOW_TO_USE.md         ← This file
```

**174 clean newsletter pages** extracted from the 212-page PDF.  
37 pages were automatically removed (internal email replies, "INSERT LINKS PLEASE" threads, "TEST" drafts).

---

## Step 1 — Run the SQL migration in Supabase

Open your Supabase project → SQL Editor → paste `supabase_migration.sql` → Run.

This creates the `dxc_newsletter_articles` table with indexes on `month_date` and `category`.

---

## Step 2 — Upload images to Supabase Storage

1. In Supabase → Storage → create a **public bucket** named `newsletters`
2. Inside it, create a folder called `images`
3. Upload all 174 PNGs from the `images/` folder
4. Then run this SQL to set all image URLs at once:

```sql
UPDATE dxc_newsletter_articles
SET image_url = 'https://YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/newsletters/images/' || image_path
WHERE image_url IS NULL;
```

---

## Step 3 — Add API routes in `api.py`

```python
# GET /api/newsletter-articles  — list with filters
@app.get("/api/newsletter-articles")
async def get_newsletter_articles(
    month: str = None,
    category: str = None,
    search: str = None,
    page: int = 1,
    limit: int = 20
):
    query = supabase.table("dxc_newsletter_articles").select("*")
    if month:
        query = query.eq("month", month)
    if category:
        query = query.eq("category", category)
    if search:
        query = query.ilike("content", f"%{search}%")
    query = query.order("month_date", desc=True).range((page-1)*limit, page*limit-1)
    result = query.execute()
    return result.data

# GET /api/newsletter-articles/filters — month & category options
@app.get("/api/newsletter-articles/filters")
async def get_newsletter_filters():
    months = supabase.table("dxc_newsletter_articles").select("month, month_date").execute()
    cats   = supabase.table("dxc_newsletter_articles").select("category").execute()
    unique_months = sorted({r["month"]: r["month_date"] for r in months.data}.items(), key=lambda x: x[1], reverse=True)
    unique_cats   = sorted(set(r["category"] for r in cats.data))
    return {"months": unique_months, "categories": unique_cats}

# GET /api/newsletter-articles/{id}  — single article detail
@app.get("/api/newsletter-articles/{article_id}")
async def get_newsletter_article(article_id: str):
    result = supabase.table("dxc_newsletter_articles").select("*").eq("id", article_id).single().execute()
    return result.data
```

---

## Data structure (each record)

| Field | Type | Example |
|---|---|---|
| `id` | UUID | `"3f2a1b..."` |
| `page_number` | int | `2` |
| `title` | text | `"Quality at the Heart of the ADM Seminar"` |
| `content` | text | Full page text (up to 3000 chars) |
| `month` | text | `"March 2026"` |
| `month_date` | date | `2026-03-01` |
| `category` | text | `"Business & Clients"` |
| `image_path` | text | `"page_002.png"` |
| `image_url` | text | Full Supabase Storage URL (set in Step 2) |
| `newsletter_edition` | text | `"ONETEAM Newsletter - March 2026"` |

---

## Available months (12)
April 2025 · August 2025 · December 2024 · December 2025 · February 2025 · February 2026 · January 2025 · March 2026 · November 2024 · November 2025 · October 2025 · September 2025

## Available categories (10)
Awards & Recognition · Business & Clients · CSR & Community · DEI & Inclusion · Events & Upcoming · Innovation & Tech · Newsletter Content · Quality · Referral & Jobs · Wellbeing & Health
