// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { setApiToken, clearApiToken } from '../services/api';

const AuthContext = createContext(null);

// Empty — requests go to the same origin and are proxied to the backend.
const API = '';

const LS_KEY = 'aiwatch_at'; // localStorage key for access token

/** Decode JWT payload without verifying signature (client-side only). */
function decodePayload(token) {
  const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(b64));
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // CRITICAL: start true
  const refreshTimer          = useRef(null);
  const didInit               = useRef(false);

  const applyToken = useCallback((accessToken) => {
    // Set module-level token immediately (synchronous) so api.js requests
    // always have the correct Authorization header regardless of React's
    // effect scheduling order.
    setApiToken(accessToken);
    setToken(accessToken);
    try {
      const payload = decodePayload(accessToken);
      setUser({ user_id: payload.sub, role: payload.role, full_name: payload.full_name, email: payload.email ?? "", is_verified: payload.is_verified ?? false });
      // Persist so Ctrl+R / page reload can restore the session immediately
      localStorage.setItem(LS_KEY, accessToken);
      const msUntilExpiry = (payload.exp * 1000) - Date.now() - 60_000;
      clearTimeout(refreshTimer.current);
      refreshTimer.current = setTimeout(silentRefresh, Math.max(msUntilExpiry, 0));
    } catch {
      clearApiToken();
      setUser(null);
      localStorage.removeItem(LS_KEY);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const silentRefresh = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('refresh failed');
      const data = await res.json();
      applyToken(data.access_token);
    } catch {
      // Cookie-based refresh failed — clear stored state
      clearApiToken();
      localStorage.removeItem(LS_KEY);
      setToken(null);
      setUser(null);
    }
  }, [applyToken]);

  // Restore session on every page load.
  // didInit guard prevents React 18 StrictMode's double-invocation from
  // calling silentRefresh() twice (which would rotate the token twice).
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    // ── Google OAuth callback: ?token=<access_token> in URL ──
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('token');
    if (oauthToken) {
      window.history.replaceState({}, '', window.location.pathname);
      applyToken(oauthToken);   // stores user + localStorage immediately
      setLoading(false);        // show the app right away — don't wait on cookie
      // Best-effort: exchange the :8000 cookie for a :3000 proxy cookie.
      // If this fails we stay logged in via localStorage; no state is cleared.
      fetch(`${API}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.access_token) applyToken(data.access_token); })
        .catch(() => { /* ignore — localStorage session keeps the user in */ });
      return;
    }

    // ── Fast path: valid token in localStorage → restore instantly ──
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
      try {
        const payload = decodePayload(stored);
        if (payload.exp * 1000 > Date.now()) {
          // Token still valid — restore session without a round-trip
          applyToken(stored);
          setLoading(false);
          // Best-effort background refresh to renew the cookie.
          // If it fails we stay logged in (localStorage token is still valid).
          fetch(`${API}/api/auth/refresh`, { method: 'POST', credentials: 'include' })
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.access_token) applyToken(data.access_token); })
            .catch(() => { /* ignore — localStorage session stays active */ });
          return;
        }
      } catch { /* malformed token — fall through */ }
      localStorage.removeItem(LS_KEY);
    }

    // ── Slow path: no localStorage token → rely on refresh cookie ──
    silentRefresh().finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    applyToken(data.access_token);
    return data;
  }, [applyToken]);

  const logout = useCallback(async () => {
    clearTimeout(refreshTimer.current);
    clearApiToken();
    localStorage.removeItem(LS_KEY);
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch { /* ignore */ }
    setToken(null);
    setUser(null);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, silentRefresh, applyToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
