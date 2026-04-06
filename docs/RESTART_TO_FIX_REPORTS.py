#!/usr/bin/env python3
"""
COMPLETE RESTART SCRIPT - Run this to fix the 3rd report issue

This script will:
1. Verify all 3 reports are in code ✅
2. Clear any cached data
3. Show you how to restart both backend and frontend
"""

import sys
import os
sys.path.insert(0, '.')

from api import MOCK_REPORTS

print("\n" + "="*70)
print(" 🔧 AI WATCH - COMPLETE RESTART GUIDE")
print("="*70 + "\n")

# Step 1: Verify reports
print("📋 STEP 1: Verify All Reports Are In Code")
print("-" * 70)
print(f"✅ Total Reports Found: {len(MOCK_REPORTS)}\n")

for i, report in enumerate(MOCK_REPORTS, 1):
    articles_count = len(report.get('articles', []))
    print(f"   {i}. {report.get('title')}")
    print(f"      Articles: {articles_count} | ID: {report.get('id')}\n")

if len(MOCK_REPORTS) != 3:
    print("❌ ERROR: Reports not complete. Check api.py\n")
    sys.exit(1)

print("✅ All 3 reports verified in code!\n")

# Step 2: Instructions
print("🚀 STEP 2: RESTART BACKEND")
print("-" * 70)
print("""
👉 DO THIS IN A TERMINAL/POWERSHELL:

1. Stop the Python backend (if running):
   Press Ctrl + C  in the terminal where 'python api.py' is running

2. Clear Python cache:
   del api.pyc
   rmdir __pycache__

3. Start Python backend again:
   python api.py  

   Or with virtual environment:
   .venv\\Scripts\\Activate.ps1
   python api.py

You should see:
   'Uvicorn running on http://127.0.0.1:8000'

""")

print("🌐 STEP 3: CLEAR BROWSER CACHE & REFRESH")
print("-" * 70)
print("""
👉 IN YOUR WEB BROWSER:

1. Hard refresh to clear cache:
   Windows/Linux:  Ctrl + Shift + Delete  (choose Clear All)
   Mac:            Cmd + Shift + Delete   (choose Clear All)

2. Then hard refresh the page:
   Windows/Linux:  Ctrl + Shift + R
   Mac:            Cmd + Shift + R

3. Go to: http://localhost:3000
   Click on: Reports

You should now see:
   ✅ "3 reports available"
   - AI Intelligence Report - Week of Mar 10, 2026
   - Strategic Intelligence Brief - Fintech & Payments
   - Market Deep Dive - Enterprise AI Adoption 2026  (NEW!)

""")

print("✅ Need help? Check FIX_MISSING_REPORT.md")
print("="*70 + "\n")
