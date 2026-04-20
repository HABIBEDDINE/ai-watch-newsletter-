// Empty base URL — all /api/* requests are proxied to the backend by the
// CRA dev server (see "proxy" in package.json). Same-origin means cookies
// are sent automatically without needing credentials:'include'.
const API_BASE_URL = "";

// ── Auth token (in-memory) ────────────────────────────────────────────────────
let _token = null;
export function setApiToken(t)  { _token = t; }
export function clearApiToken() { _token = null; }

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function request(path, options = {}) {
  const {
    retries = 2,
    retryDelayMs = 700,
    timeoutMs = 25000,
    method = "GET",
    body = null,
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    let timeoutId;
    let isTimeoutAbort = false;

    try {
      const fetchOptions = {
        method,
        signal: controller.signal,
      };

      fetchOptions.headers = {};
      // Use in-memory token first, fall back to localStorage for resilience
      const token = _token || localStorage.getItem('aiwatch_at');
      if (token) {
        fetchOptions.headers["Authorization"] = `Bearer ${token}`;
      }
      if (body) {
        fetchOptions.headers["Content-Type"] = "application/json";
        fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
      }

      timeoutId = setTimeout(() => {
        isTimeoutAbort = true;
        controller.abort();
      }, timeoutMs);

      const response = await fetch(`${API_BASE_URL}${path}`, fetchOptions);

      clearTimeout(timeoutId);

      if (!response.ok) {
        let detail = `API request failed (${response.status})`;
        try { const j = await response.json(); if (j.detail) detail = j.detail; } catch {}
        throw new Error(detail);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error;

      console.warn(`Request attempt ${attempt + 1} failed:`, error.message);

      // Only retry on timeout, not on other AbortErrors (like component unmount)
      if (error.name === "AbortError") {
        if (isTimeoutAbort && attempt < retries) {
          // It was a timeout, retry
          await sleep(retryDelayMs * (attempt + 1));
          continue;
        } else if (!isTimeoutAbort) {
          // It was an abort but not timeout (could be user navigation)
          throw error;
        }
      }

      if (attempt < retries) {
        await sleep(retryDelayMs * (attempt + 1));
      }
    }
  }

  throw lastError || new Error("Unknown API error");
}

export async function getFeed(persona = "cto", maxArticles = 5) {
  const params = new URLSearchParams({
    persona,
    max_articles: String(maxArticles),
  });

  return request(`/api/feed?${params.toString()}`);
}

export async function getRadar(persona = "cto", maxArticles = 8) {
  const params = new URLSearchParams({
    persona,
    max_articles: String(maxArticles),
  });

  return request(`/api/radar?${params.toString()}`);
}

export async function getTrends(category, period) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.append("category", category);
  if (period && period !== "all") params.append("period", period);
  const query = params.toString();
  return request(`/api/trends${query ? `?${query}` : ""}`);
}

export async function getMonthlySummary() {
  return request("/api/trends/monthly-summary");
}

export async function refreshTrends() {
  return request("/api/trends/refresh", { method: "POST" });
}

export async function getDeepDive(trendId, role = null) {
  const params = role ? `?role=${role}` : "";
  return request(`/api/trends/${trendId}/deepdive${params}`, { method: "POST" });
}

export async function getPersonalizedTrends(role, topics = []) {
  const params = new URLSearchParams();
  if (role) params.append("role", role);
  if (topics.length > 0) params.append("topics", topics.join(","));
  const query = params.toString();
  return request(`/api/trends/personalized${query ? `?${query}` : ""}`);
}

export async function completeOnboarding(role, topics = []) {
  return request("/api/users/onboarding", {
    method: "POST",
    body: { role, trend_topics: topics },
    retries: 0,
    timeoutMs: 10000,
  });
}

export async function saveTrend(trendId) {
  return request(`/api/trends/${trendId}/save`, { method: "POST" });
}

export async function unsaveTrend(trendId) {
  return request(`/api/trends/${trendId}/save`, { method: "DELETE" });
}

export async function getSavedTrends() {
  return request("/api/trends/saved");
}

export async function getRecommendations(role = "other") {
  return request(`/api/recommendations?role=${role}`);
}

export async function getJourney(persona = "cto", maxArticles = 6) {
  const params = new URLSearchParams({
    persona,
    max_articles: String(maxArticles),
  });

  return request(`/api/journey?${params.toString()}`);
}

export async function getArticles(options = {}) {
  const {
    topic,
    signal,
    industry,
    search,
    page = 1,
    pageSize = 10,
    dateFrom,
    dateTo,
  } = options;

  const params = new URLSearchParams();
  if (topic) params.append("topic", topic);
  if (signal) params.append("signal", signal);
  if (industry) params.append("industry", industry);
  if (search) params.append("search", search);
  params.append("page", String(page));
  params.append("page_size", String(pageSize));
  if (dateFrom) params.append("date_from", dateFrom);
  if (dateTo) params.append("date_to", dateTo);

  return request(`/api/articles?${params.toString()}`);
}

export async function getArticle(articleId) {
  return request(`/api/articles/${articleId}`);
}

export async function generateSummary(article) {
  return request("/api/summarize", {
    method: "POST",
    body: article,
    timeoutMs: 30000,
    retries: 0,
  });
}

export async function matchSolutions(payload) {
  return request("/api/match-solutions", {
    method: "POST",
    body: payload,
    timeoutMs: 30000,
    retries: 0,
  });
}

export async function getLiveSignals() {
  return request("/api/signals/live");
}

export async function getTopSectors() {
  return request("/api/sectors/top");
}

export async function getReports(page = 1, pageSize = 10) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  return request(`/api/reports?${params.toString()}`);
}

export async function getReport(reportId) {
  return request(`/api/reports/${reportId}`);
}

export async function saveReport(reportData) {
  return request(`/api/reports`, {
    method: "POST",
    body: JSON.stringify(reportData),
  });
}

export async function deleteReport(reportId) {
  return request(`/api/reports/${reportId}`, {
    method: "DELETE",
  });
}

export async function triggerIngest(topic) {
  const params = new URLSearchParams();
  if (topic) params.append("topic", topic);

  // Use longer timeout for ingest since it's a background operation
  return request(`/api/ingest?${params.toString()}`, { 
    method: "POST",
    timeoutMs: 10000,  // 10 second timeout for ingest endpoint
    retries: 1  // Only 1 retry for ingest
  });
}

export async function exportArticlesCSV(topic, signal) {
  const params = new URLSearchParams();
  if (topic) params.append("topic", topic);
  if (signal) params.append("signal", signal);

  const url = `${API_BASE_URL}/api/export/csv?${params.toString()}`;
  window.open(url, "_blank");
}

export async function getFunding(page = 1, pageSize = 25) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  return request(`/api/funding?${params.toString()}`);
}

export async function getActors(page = 1, pageSize = 25) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  return request(`/api/actors?${params.toString()}`);
}

export async function getHealth() {
  return request("/health", { retries: 0, timeoutMs: 10000 });
}

export async function getNewsletterStatus() {
  return request("/api/newsletter/status", { retries: 0, timeoutMs: 5000 });
}

export async function sendNewsletterNow(persona = "cto") {
  const params = new URLSearchParams({ persona });
  return request(`/api/newsletter/send?${params.toString()}`, { method: "POST", timeoutMs: 10000, retries: 0 });
}

export async function sendNewsletterCompose(payload) {
  return request("/api/newsletter/send", { method: "POST", body: payload, timeoutMs: 15000, retries: 0 });
}

export async function sendSingleItem(payload) {
  return request("/api/newsletter/send-single", { method: "POST", body: payload, timeoutMs: 15000, retries: 0 });
}

export async function subscribeEmail(email) {
  return request("/api/newsletter/subscribe", { method: "POST", body: { email } });
}

export async function unsubscribeEmail(email) {
  const params = new URLSearchParams({ email });
  return request(`/api/newsletter/unsubscribe?${params.toString()}`, { method: "DELETE" });
}

export async function getRecipients() {
  return request("/api/newsletter/recipients", { retries: 0, timeoutMs: 5000 });
}

export async function addRecipient(email) {
  return request("/api/newsletter/recipients", { method: "POST", body: { email } });
}

export async function removeRecipient(email) {
  return request(`/api/newsletter/recipients/${encodeURIComponent(email)}`, { method: "DELETE" });
}

export async function getSchedule() {
  return request("/api/newsletter/schedule", { retries: 0, timeoutMs: 5000 });
}

export async function saveSchedule(data) {
  return request("/api/newsletter/schedule", { method: "POST", body: data });
}

export async function getSentHistory() {
  return request("/api/newsletter/sent", { retries: 0, timeoutMs: 5000 });
}

export async function saveMatchingResult(data) {
  return request("/api/matching/save", { method: "POST", body: data, retries: 0, timeoutMs: 10000 });
}

// ── Saved Items ───────────────────────────────────────────────────────────────
export async function getSaved(type) {
  const params = type ? `?type=${type}` : "";
  return request(`/api/saved${params}`, { retries: 0 });
}

export async function saveItem(itemType, itemId, itemData) {
  return request("/api/saved", { method: "POST", body: { item_type: itemType, item_id: String(itemId), item_data: itemData }, retries: 0 });
}

export async function unsaveItem(itemId) {
  return request(`/api/saved/${itemId}`, { method: "DELETE", retries: 0 });
}

export { API_BASE_URL };

// ── V4: Client-side request cache ────────────────────────────────────────────
// Caches GET responses for 5 minutes to reduce redundant API calls.
// POST/PUT/DELETE always bypass the cache.

const REQUEST_CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

/**
 * Like request(), but caches GET responses for CACHE_TTL ms.
 * POST/PUT/DELETE are passed straight through to request() with no caching.
 *
 * @param {string} method  - HTTP method ("GET", "POST", etc.)
 * @param {string} path    - API path e.g. "/api/feed"
 * @param {object} params  - Query params object (appended to path for cache key)
 * @param {*}      body    - Request body (POST/PUT)
 */
export async function cachedRequest(method, path, params = null, body = null) {
  const upperMethod = (method || "GET").toUpperCase();

  // Only cache GET requests
  if (upperMethod !== "GET") {
    return request(path, { method: upperMethod, body });
  }

  // Build full path with query params for cache key
  let fullPath = path;
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams(params).toString();
    fullPath = `${path}?${qs}`;
  }

  const cacheKey = `${upperMethod}:${fullPath}`;
  const now = Date.now();

  // ── Cache hit ───────────────────────────────────────────────────────────────
  if (REQUEST_CACHE.has(cacheKey)) {
    const entry = REQUEST_CACHE.get(cacheKey);
    if (now - entry.cachedAt < CACHE_TTL) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return entry.data;
    }
    // Expired — remove and fall through to fetch
    REQUEST_CACHE.delete(cacheKey);
  }

  // ── Cache miss — fetch from API ─────────────────────────────────────────────
  console.log(`[Cache MISS] ${cacheKey}`);
  const data = await request(fullPath, { method: upperMethod });

  REQUEST_CACHE.set(cacheKey, { data, cachedAt: now });
  return data;
}

/**
 * Invalidate cache entries.
 * - invalidateCache()        → clears the entire cache
 * - invalidateCache("/api/feed") → clears all entries whose key contains that path
 *
 * @param {string} [path] - Optional path prefix to target
 */
export function invalidateCache(path) {
  if (!path) {
    REQUEST_CACHE.clear();
    console.log("[Cache INVALIDATED] entire cache cleared");
    return;
  }
  let cleared = 0;
  for (const key of REQUEST_CACHE.keys()) {
    if (key.includes(path)) {
      REQUEST_CACHE.delete(key);
      cleared++;
    }
  }
  console.log(`[Cache INVALIDATED] ${cleared} entr${cleared === 1 ? "y" : "ies"} matching "${path}"`);
}

/**
 * Returns current cache stats for monitoring / debugging.
 * @returns {{ entriesCount: number, totalSizeKB: string, ttlMinutes: number }}
 */
export function getCacheStats() {
  const now = Date.now();
  let validCount = 0;
  let totalBytes = 0;

  for (const entry of REQUEST_CACHE.values()) {
    if (now - entry.cachedAt < CACHE_TTL) {
      validCount++;
    }
    try {
      totalBytes += JSON.stringify(entry.data).length * 2; // UTF-16 approximation
    } catch {
      // non-serialisable entry — skip size count
    }
  }

  return {
    entriesCount: validCount,
    totalSizeKB: (totalBytes / 1024).toFixed(1),
    ttlMinutes: CACHE_TTL / 60000,
  };
}

// ── Auth API calls ────────────────────────────────────────────────────────────

export async function apiLogin(body) {
  return request("/api/auth/login", { method: "POST", body, retries: 0, timeoutMs: 10000 });
}

export async function apiRegister(body) {
  return request("/api/auth/register", { method: "POST", body, retries: 0, timeoutMs: 10000 });
}

export async function apiRefreshToken() {
  // Must send cookies — use raw fetch (not the wrapper which has no credentials)
  const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST", credentials: "include",
  });
  if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
  return res.json();
}

export async function apiForgotPassword(body) {
  return request("/api/auth/forgot-password", { method: "POST", body, retries: 0, timeoutMs: 10000 });
}

export async function apiResetPassword(body) {
  return request("/api/auth/reset-password", { method: "POST", body, retries: 0, timeoutMs: 10000 });
}

export async function apiGetMe() {
  return request("/api/users/me", { retries: 0, timeoutMs: 5000 });
}

// ── V4 Sprint 3: Alert preference helpers ─────────────────────────────────────

export async function getAlertPreferences() {
  return cachedRequest("GET", "/api/alerts/preferences");
}

export async function updateAlertPreferences({ keywords, min_signal_score, enabled }) {
  const result = await request("/api/alerts/preferences", {
    method: "PUT",
    body: { keywords, min_signal_score, enabled },
    retries: 0,
    timeoutMs: 10000,
  });
  invalidateCache("/api/alerts/preferences");
  return result;
}

// ── DXC ONETEAM Newsletter API ─────────────────────────────────────────────────

export async function getDxcNewsletters(options = {}) {
  const { month, category, search, page = 1, limit = 20 } = options;
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (category) params.append("category", category);
  if (search) params.append("search", search);
  params.append("page", String(page));
  params.append("limit", String(limit));
  return request(`/api/dxc-newsletters?${params.toString()}`);
}

export async function getDxcNewsletterFilters() {
  return request("/api/dxc-newsletters/filters");
}

export async function getDxcNewsletterById(id) {
  return request(`/api/dxc-newsletters/${id}`);
}

export async function generateDxcJournalCard(articleId) {
  return request(`/api/dxc-newsletters/${articleId}/journal-card`, {
    method: "POST",
  });
}
