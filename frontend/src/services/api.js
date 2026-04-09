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
      if (_token) fetchOptions.headers["Authorization"] = `Bearer ${_token}`;
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

export async function getTrends(category) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.append("category", category);
  const query = params.toString();
  return request(`/api/trends${query ? `?${query}` : ""}`);
}

export async function refreshTrends() {
  return request("/api/trends/refresh", { method: "POST" });
}

export async function getDeepDive(trendId) {
  return request(`/api/trends/${trendId}/deepdive`, { method: "POST" });
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

export async function subscribeEmail(email) {
  return request("/api/newsletter/subscribe", { method: "POST", body: { email } });
}

export async function unsubscribeEmail(email) {
  const params = new URLSearchParams({ email });
  return request(`/api/newsletter/unsubscribe?${params.toString()}`, { method: "DELETE" });
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
