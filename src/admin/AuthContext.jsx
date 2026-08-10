import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const STORAGE_KEY = "climaschool.session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  // Starts true only when there is a stored token to validate; otherwise there is
  // nothing to check and the sign-in screen can render immediately.
  const [checking, setChecking] = useState(() => Boolean(session?.token));

  // A stored token proves nothing — it may be expired or the account disabled.
  // Validate against /auth/me before letting the console render as signed in.
  useEffect(() => {
    let cancelled = false;
    if (!session?.token) return; // `checking` already initialised to false
    api
      .me(session.token)
      .then((user) => {
        if (!cancelled) setSession((s) => (s ? { ...s, user } : s));
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(STORAGE_KEY);
          setSession(null);
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
    // Deliberately only on mount: re-validating on every session change would
    // loop, since the success path writes back into session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    const next = {
      token: res.access_token,
      user: { email, full_name: res.full_name, role: res.role }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      role: session?.user?.role ?? null,
      isAuthenticated: Boolean(session?.token),
      checking,
      login,
      logout
    }),
    [session, checking, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/**
 * Data-fetching hook for console pages.
 * `fn` receives the bearer token. Returns { data, error, loading, reload }.
 */
export function useApi(fn, deps = []) {
  const { token, logout } = useAuth();
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // The loading flag is raised in a microtask rather than synchronously: setting
    // state directly inside an effect body triggers a cascading render.
    Promise.resolve()
      .then(() => {
        if (!cancelled) setState((s) => ({ ...s, loading: true, error: null }));
        return fn(token);
      })
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false });
      })
      .catch((err) => {
        // An expired token should drop you at the sign-in screen, not leave the
        // page showing a permission error it cannot explain.
        if (err?.status === 401) {
          logout();
          return;
        }
        if (!cancelled) setState({ data: null, error: err, loading: false });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, nonce, ...deps]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}
