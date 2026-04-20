#!/usr/bin/env python3
"""
DXC Newsletter — Upload images to Supabase & link to articles
Run from your local machine inside ONETEAM_Newsletter_Data/
Usage: python upload_and_link.py
"""

import os, re, json, sys
import requests, urllib3
from difflib import SequenceMatcher

urllib3.disable_warnings()

# ── CONFIG ──────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://owxjvosuwkneuioiiplp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93eGp2b3N1d2tuZXVpb2lpcGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDcxNTgzNywiZXhwIjoyMDkwMjkxODM3fQ.ECrtv1reKaVT-EVxR3U3FZ2cHGlmxElvyssvBPqBGiI"
BUCKET      = "newsletters"
IMAGES_DIR  = os.path.join(os.path.dirname(__file__), "images")
TABLE       = "dxc_newsletter_articles"

HEADERS = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "apikey": SUPABASE_KEY,
}

# ── STEP 1: Upload images to Supabase Storage ────────────────────────────────
def upload_images():
    images = sorted(f for f in os.listdir(IMAGES_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png')))
    print(f"\n📤 STEP 1 — Uploading {len(images)} images to Supabase Storage...\n")

    uploaded = {}
    success = failed = 0

    for i, fname in enumerate(images, 1):
        fpath = os.path.join(IMAGES_DIR, fname)
        ext   = fname.split('.')[-1].lower()
        ct    = "image/png" if ext == "png" else "image/jpeg"

        with open(fpath, "rb") as f:
            data = f.read()

        url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{fname}"
        try:
            r = requests.post(
                url,
                headers={**HEADERS, "Content-Type": ct, "x-upsert": "true"},
                data=data, verify=False, timeout=30
            )
            if r.status_code in (200, 201):
                public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{fname}"
                uploaded[fname] = public_url
                success += 1
                if i % 25 == 0 or i <= 3:
                    print(f"  [{i}/{len(images)}] ✓ {fname[:55]}")
            else:
                failed += 1
                print(f"  [{i}/{len(images)}] ✗ {fname[:45]} → {r.status_code}")
        except Exception as e:
            failed += 1
            print(f"  [{i}/{len(images)}] ERROR: {e}")

    print(f"\n  ✅ {success} uploaded  |  ❌ {failed} failed\n")
    return uploaded

# ── STEP 2: Fetch articles from Supabase ────────────────────────────────────
def fetch_articles():
    print("📥 STEP 2 — Fetching articles from Supabase...\n")
    url = f"{SUPABASE_URL}/rest/v1/{TABLE}?select=id,title,image_url&limit=1000"
    r = requests.get(url, headers={**HEADERS, "Content-Type": "application/json"}, verify=False, timeout=30)
    if r.status_code == 200:
        articles = r.json()
        print(f"  Found {len(articles)} articles\n")
        return articles
    else:
        print(f"  ✗ Failed: {r.status_code} — {r.text[:200]}")
        return []

# ── STEP 3: Match images to articles by title similarity ────────────────────
def similarity(a, b):
    a = re.sub(r'[^a-z0-9 ]', ' ', a.lower())
    b = re.sub(r'[^a-z0-9 ]', ' ', b.lower())
    return SequenceMatcher(None, a, b).ratio()

def match_images(articles, uploaded):
    print("🔗 STEP 3 — Matching images to articles by title...\n")

    # Build image title index from filenames
    img_titles = {}
    for fname in uploaded:
        m = re.match(r'page\d+_(.*)\.(jpg|jpeg|png)', fname, re.IGNORECASE)
        if m:
            raw = m.group(1).replace('_', ' ').strip()
            img_titles[fname] = raw

    matches = {}
    unmatched = []

    for art in articles:
        art_id    = art['id']
        art_title = art.get('title', '') or ''
        if not art_title.strip():
            continue

        best_score = 0
        best_fname = None

        for fname, img_title in img_titles.items():
            score = similarity(art_title, img_title)
            if score > best_score:
                best_score = score
                best_fname = fname

        if best_score >= 0.35 and best_fname:
            matches[art_id] = (uploaded[best_fname], best_score, art_title[:50], best_fname[:50])
        else:
            unmatched.append(art_title[:60])

    print(f"  ✅ Matched: {len(matches)} articles")
    print(f"  ⚠️  Unmatched: {len(unmatched)} articles")
    if unmatched[:5]:
        print(f"  Unmatched examples: {unmatched[:5]}")
    print()
    return matches

# ── STEP 4: Update articles in Supabase with image URLs ─────────────────────
def update_articles(matches):
    print(f"💾 STEP 4 — Updating {len(matches)} articles with image URLs...\n")
    success = failed = 0

    for art_id, (img_url, score, title, fname) in matches.items():
        url = f"{SUPABASE_URL}/rest/v1/{TABLE}?id=eq.{art_id}"
        r = requests.patch(
            url,
            headers={**HEADERS, "Content-Type": "application/json", "Prefer": "return=minimal"},
            json={"image_url": img_url},
            verify=False, timeout=20
        )
        if r.status_code in (200, 201, 204):
            success += 1
            if success <= 5 or success % 30 == 0:
                print(f"  [{success}] ✓ ({score:.0%}) {title[:40]}")
        else:
            failed += 1
            print(f"  ✗ id={art_id}: {r.status_code}")

    print(f"\n  ✅ Updated: {success}  |  ❌ Failed: {failed}\n")

# ── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  DXC Newsletter — Image Upload & Link Script")
    print("=" * 60)

    if not os.path.isdir(IMAGES_DIR):
        print(f"❌ Images folder not found: {IMAGES_DIR}")
        sys.exit(1)

    img_count = len([f for f in os.listdir(IMAGES_DIR) if f.lower().endswith(('.jpg','.jpeg','.png'))])
    print(f"\n  📁 Images folder: {IMAGES_DIR}")
    print(f"  🖼  Images found: {img_count}")

    uploaded = upload_images()
    if not uploaded:
        print("❌ No images uploaded. Check network/credentials.")
        sys.exit(1)

    articles = fetch_articles()
    if not articles:
        print("❌ No articles fetched.")
        sys.exit(1)

    matches = match_images(articles, uploaded)
    update_articles(matches)

    print("=" * 60)
    print(f"  🎉 Done! {len(matches)} articles now have images.")
    print("  Refresh your app to see the result.")
    print("=" * 60)
