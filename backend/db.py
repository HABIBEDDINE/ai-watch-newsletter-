"""
Supabase REST client for AI Watch.
Uses requests (already installed) to call the Supabase PostgREST API directly —
no supabase-py dependency, works on any Python version.

API mirrors supabase-py:  supabase.table("name").select("*").eq("col","val").execute()
"""
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).resolve().parent.parent / "config" / ".env")

import os, json
import requests

_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
_KEY = os.getenv("SUPABASE_KEY", "")

if not _URL or not _KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in .env")

_BASE_HEADERS = {
    "apikey":        _KEY,
    "Authorization": f"Bearer {_KEY}",
    "Content-Type":  "application/json",
}


class _Response:
    def __init__(self, data, count=None):
        self.data  = data if isinstance(data, list) else []
        self.count = count


# ── Read query builder ───────────────────────────────────────────────────────

class _SelectQuery:
    def __init__(self, url):
        self._url     = url
        self._params  = {}
        self._headers = dict(_BASE_HEADERS)

    def _clone(self):
        q = _SelectQuery.__new__(_SelectQuery)
        q._url     = self._url
        q._params  = dict(self._params)
        q._headers = dict(self._headers)
        return q

    def select(self, cols="*", count=None):
        q = self._clone()
        q._params["select"] = cols
        if count:
            q._headers["Prefer"] = f"count={count}"
        return q

    def eq(self, col, val):
        q = self._clone(); q._params[col] = f"eq.{val}"; return q

    def neq(self, col, val):
        q = self._clone(); q._params[col] = f"neq.{val}"; return q

    def lt(self, col, val):
        q = self._clone(); q._params[col] = f"lt.{val}"; return q

    def lte(self, col, val):
        q = self._clone(); q._params[col] = f"lte.{val}"; return q

    def gte(self, col, val):
        q = self._clone(); q._params[col] = f"gte.{val}"; return q

    def ilike(self, col, pattern):
        q = self._clone(); q._params[col] = f"ilike.{pattern}"; return q

    def order(self, col, desc=False):
        q = self._clone()
        q._params["order"] = f"{col}.{'desc' if desc else 'asc'}"
        return q

    def limit(self, n):
        q = self._clone(); q._params["limit"] = str(n); return q

    def range(self, start, end):
        q = self._clone()
        q._headers["Range"] = f"{start}-{end}"
        q._headers["Range-Unit"] = "items"
        return q

    def execute(self) -> _Response:
        resp = requests.get(self._url, headers=self._headers,
                            params=self._params, verify=False, timeout=15)
        if resp.status_code >= 400:
            raise Exception(f"[Supabase GET {resp.status_code}] {resp.text[:300]}")
        return _Response(resp.json())


# ── Write query builders ─────────────────────────────────────────────────────

class _WriteQuery:
    """INSERT / UPSERT"""
    def __init__(self, url, data, headers):
        self._url     = url
        self._data    = data
        self._headers = headers

    def execute(self) -> _Response:
        resp = requests.post(self._url, headers=self._headers,
                             data=json.dumps(self._data, default=str),
                             verify=False, timeout=15)
        if resp.status_code >= 400:
            raise Exception(f"[Supabase POST {resp.status_code}] {resp.text[:300]}")
        try:
            return _Response(resp.json())
        except Exception:
            return _Response([])


class _FilteredWriteQuery:
    """UPDATE / DELETE with filter chain"""
    def __init__(self, url, method, data=None):
        self._url     = url
        self._method  = method
        self._data    = data
        self._params  = {}
        self._headers = {
            **_BASE_HEADERS,
            "Prefer": "return=representation",
        }

    def _clone(self):
        q = _FilteredWriteQuery.__new__(_FilteredWriteQuery)
        q._url     = self._url
        q._method  = self._method
        q._data    = self._data
        q._params  = dict(self._params)
        q._headers = dict(self._headers)
        return q

    def eq(self, col, val):
        q = self._clone(); q._params[col] = f"eq.{val}"; return q

    def lt(self, col, val):
        q = self._clone(); q._params[col] = f"lt.{val}"; return q

    def lte(self, col, val):
        q = self._clone(); q._params[col] = f"lte.{val}"; return q

    def execute(self) -> _Response:
        resp = requests.request(
            self._method, self._url,
            headers=self._headers,
            params=self._params,
            data=json.dumps(self._data, default=str) if self._data is not None else None,
            verify=False, timeout=15,
        )
        if resp.status_code >= 400:
            raise Exception(f"[Supabase {self._method} {resp.status_code}] {resp.text[:300]}")
        try:
            return _Response(resp.json())
        except Exception:
            return _Response([])


# ── Table handle ─────────────────────────────────────────────────────────────

class _Table:
    def __init__(self, table_name: str):
        self._url = f"{_URL}/rest/v1/{table_name}"

    def select(self, cols="*", count=None) -> _SelectQuery:
        return _SelectQuery(self._url).select(cols, count)

    def insert(self, data) -> _WriteQuery:
        headers = {
            **_BASE_HEADERS,
            "Prefer": "return=representation",
        }
        return _WriteQuery(self._url, data, headers)

    def upsert(self, data) -> _WriteQuery:
        headers = {
            **_BASE_HEADERS,
            "Prefer": "return=representation,resolution=merge-duplicates",
        }
        return _WriteQuery(self._url, data, headers)

    def update(self, data) -> _FilteredWriteQuery:
        return _FilteredWriteQuery(self._url, "PATCH", data)

    def delete(self) -> _FilteredWriteQuery:
        return _FilteredWriteQuery(self._url, "DELETE", None)


# ── Client singleton ─────────────────────────────────────────────────────────

class _Client:
    def table(self, name: str) -> _Table:
        return _Table(name)


supabase = _Client()


# ── Run these ONCE in Supabase Dashboard → SQL Editor ────────────────────────
#
# CREATE TABLE IF NOT EXISTS articles (
#     id TEXT PRIMARY KEY,
#     title TEXT NOT NULL DEFAULT '',
#     description TEXT DEFAULT '',
#     summary TEXT DEFAULT '',
#     url TEXT UNIQUE,
#     source TEXT DEFAULT '',
#     published_at TEXT DEFAULT '',
#     topic TEXT DEFAULT '',
#     signal_strength TEXT DEFAULT 'Weak',
#     relevance INTEGER DEFAULT 5,
#     industry TEXT DEFAULT '',
#     market_segment TEXT DEFAULT '',
#     image_url TEXT DEFAULT '',
#     source_api TEXT DEFAULT '',
#     ingestion_date TIMESTAMPTZ DEFAULT NOW(),
#     keywords JSONB DEFAULT '[]'
# );
#
# CREATE TABLE IF NOT EXISTS solution_matches (
#     id TEXT PRIMARY KEY,
#     article_id TEXT NOT NULL,
#     matches JSONB NOT NULL DEFAULT '[]',
#     created_at TIMESTAMPTZ DEFAULT NOW()
# );
#
# CREATE TABLE IF NOT EXISTS trends (
#     id TEXT PRIMARY KEY,
#     category TEXT DEFAULT '',
#     topic TEXT DEFAULT '',
#     watchlisted BOOLEAN DEFAULT FALSE,
#     deepdive TEXT,
#     data JSONB DEFAULT '{}',
#     created_at TIMESTAMPTZ DEFAULT NOW()
# );
#
# CREATE TABLE IF NOT EXISTS reports (
#     id TEXT PRIMARY KEY,
#     title TEXT NOT NULL DEFAULT '',
#     generated_date TEXT DEFAULT '',
#     article_count INTEGER DEFAULT 0,
#     funding_count INTEGER DEFAULT 0,
#     summary TEXT DEFAULT '',
#     key_points JSONB DEFAULT '[]',
#     articles JSONB DEFAULT '[]'
# );
#
# CREATE TABLE IF NOT EXISTS newsletter_subscribers (
#     id SERIAL PRIMARY KEY,
#     email TEXT UNIQUE NOT NULL,
#     subscribed_at TIMESTAMPTZ DEFAULT NOW()
# );
#
# CREATE TABLE IF NOT EXISTS dxc_solutions (
#     id SERIAL PRIMARY KEY,
#     number INTEGER NOT NULL,
#     name TEXT NOT NULL,
#     description TEXT NOT NULL
# );
