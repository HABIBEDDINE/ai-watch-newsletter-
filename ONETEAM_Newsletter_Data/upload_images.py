#!/usr/bin/env python3
"""
Upload newsletter images to Supabase Storage using REST API.
"""
import os
import requests
import urllib3

# Disable SSL warnings (corporate network issue)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

SUPABASE_URL = "https://owxjvosuwkneuioiiplp.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93eGp2b3N1d2tuZXVpb2lpcGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDcxNTgzNywiZXhwIjoyMDkwMjkxODM3fQ.ECrtv1reKaVT-EVxR3U3FZ2cHGlmxElvyssvBPqBGiI"
BUCKET = "newsletters"

images_dir = os.path.join(os.path.dirname(__file__), "images")
image_files = sorted(f for f in os.listdir(images_dir) if f.endswith(".png"))

print(f"Uploading {len(image_files)} images to Supabase Storage...")

headers = {
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "apikey": SUPABASE_KEY,
}

success = 0
failed = 0

for i, fname in enumerate(image_files, 1):
    filepath = os.path.join(images_dir, fname)

    with open(filepath, "rb") as f:
        file_data = f.read()

    # Upload endpoint
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{fname}"

    try:
        resp = requests.post(
            url,
            headers={
                **headers,
                "Content-Type": "image/png",
                "x-upsert": "true",
            },
            data=file_data,
            verify=False,  # Skip SSL verification
            timeout=30,
        )

        if resp.status_code in (200, 201):
            success += 1
            print(f"  [{i}/{len(image_files)}] OK {fname}")
        else:
            failed += 1
            print(f"  [{i}/{len(image_files)}] FAIL {fname}: {resp.status_code} - {resp.text[:100]}")
    except Exception as e:
        failed += 1
        print(f"  [{i}/{len(image_files)}] ERROR {fname}: {e}")

print(f"\nDone! {success} uploaded, {failed} failed.")
print("""
Now run this SQL in Supabase to set image URLs:

UPDATE dxc_newsletter_articles
SET image_url = 'https://owxjvosuwkneuioiiplp.supabase.co/storage/v1/object/public/newsletters/' || image_path;
""")
