#!/usr/bin/env python3
"""
Quick test to verify all 3 reports are in the backend
Run this to verify the API has all reports before opening the browser
"""

import sys
sys.path.insert(0, '.')

from api import MOCK_REPORTS

print("\n" + "="*60)
print("📊 MOCK_REPORTS STATUS CHECK")
print("="*60 + "\n")

print(f"✅ Total Reports Found: {len(MOCK_REPORTS)}\n")

for i, report in enumerate(MOCK_REPORTS, 1):
    articles_count = len(report.get('articles', []))
    print(f"{i}. {report.get('title', 'N/A')}")
    print(f"   ID: {report.get('id')}")
    print(f"   Articles: {articles_count}")
    print(f"   Generated: {report.get('generated_date')}")
    print()

if len(MOCK_REPORTS) == 3:
    print("✅ SUCCESS: All 3 reports are loaded correctly!")
else:
    print(f"⚠️  WARNING: Expected 3 reports, found {len(MOCK_REPORTS)}")

print("="*60 + "\n")
