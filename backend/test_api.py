#!/usr/bin/env python3
"""
Diagnostic script to test AI Watch API endpoints
"""
import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

def print_header(text):
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def test_endpoint(method, path, params=None, data=None, timeout=10):
    """Test a single endpoint"""
    url = f"{BASE_URL}{path}"
    try:
        if method.upper() == "GET":
            resp = requests.get(url, params=params, timeout=timeout)
        elif method.upper() == "POST":
            resp = requests.post(url, params=params, json=data, timeout=timeout)
        
        status = "✓" if resp.status_code < 400 else "✗"
        print(f"{status} {method.upper()} {path}")
        print(f"   Status: {resp.status_code}")
        
        try:
            resp_json = resp.json()
            print(f"   Response: {json.dumps(resp_json, indent=4)[:500]}")
        except:
            print(f"   Response: {resp.text[:500]}")
        
        return resp
    except Exception as e:
        print(f"✗ {method.upper()} {path}")
        print(f"   Error: {type(e).__name__}: {str(e)}")
        return None

# Test all endpoints
print_header("AI WATCH API DIAGNOSTIC TEST")
print(f"Base URL: {BASE_URL}")
print(f"Time: {datetime.now().isoformat()}\n")

# Test 1: Health check
print_header("1. HEALTH CHECK")
test_endpoint("GET", "/health")

# Test 2: Articles endpoint
print_header("2. ARTICLES ENDPOINT")
test_endpoint("GET", "/api/articles", params={"page": 1, "page_size": 5})

# Test 3: Feed endpoint
print_header("3. FEED ENDPOINT")
test_endpoint("GET", "/api/feed", params={"persona": "cto"})

# Test 4: Radar endpoint
print_header("4. RADAR ENDPOINT")
test_endpoint("GET", "/api/radar", params={"persona": "cto"})

# Test 5: Trends endpoint
print_header("5. TRENDS ENDPOINT")
test_endpoint("GET", "/api/trends", params={"persona": "cto"})

# Test 6: Ingest endpoint (POST) - no background
print_header("6. INGEST ENDPOINT (START BACKGROUND)")
resp = test_endpoint("POST", "/api/ingest", timeout=15)

if resp and resp.status_code == 200:
    print("\n✓ Ingest started successfully!")
    print("✓ Check /api/articles in a few seconds to see loaded articles")
else:
    print("\n✗ Ingest endpoint failed")

# Test 7: Check articles after a delay
print_header("7. WAITING 10 SECONDS FOR ARTICLES TO LOAD...")
for i in range(10, 0, -1):
    print(f"   {i}...", end="", flush=True)
    time.sleep(1)
print("\n")

print_header("8. CHECK ARTICLES AGAIN")
test_endpoint("GET", "/api/articles", params={"page": 1, "page_size": 5})

print_header("DIAGNOSTIC TEST COMPLETE")
