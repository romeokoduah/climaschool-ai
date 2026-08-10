// Client for the ClimaSchool AI API.
//
// The base URL is injected at build time. On the Contabo host the API sits behind
// the same nginx vhost as the site, so a relative "/api/v1" is correct and needs no
// CORS. On Vercel and GitHub Pages there is no backend on the same origin, so
// VITE_API_BASE must point at the server for the live endpoints to work.

const RAW_BASE = import.meta.env.VITE_API_BASE ?? "/api/v1";
export const API_BASE = RAW_BASE.replace(/\/+$/, "");

// Only builds that were told where the API lives may offer live features. The
// Vercel and GitHub Pages builds have no backend on their origin, and they are
// served over HTTPS, so they cannot call the plain-HTTP Contabo API either —
// the browser blocks it as mixed content. Rather than show a form that always
// fails there, components check this and fall back to email.
export const hasBackend = Boolean(import.meta.env.VITE_API_BASE);

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, { method = "GET", body, token, signal } = {}) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal
    });
  } catch (cause) {
    // Network-level failure: offline, DNS, CORS rejection, server down.
    throw new ApiError("Could not reach the ClimaSchool service.", 0, cause?.message);
  }

  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    // FastAPI puts the useful part in `detail`, which may be a string or a
    // list of validation errors.
    const detail = payload?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg ?? String(d)).join("; ")
          : `Request failed (${res.status})`;
    throw new ApiError(message, res.status, detail);
  }

  return payload;
}

export const api = {
  health: () => request("/../health"),

  // Public
  classify: (reading) => request("/readings/classify", { method: "POST", body: reading }),
  submitEnquiry: (enquiry) => request("/enquiries", { method: "POST", body: enquiry }),
  subscribe: (subscriber) => request("/subscribers", { method: "POST", body: subscriber }),
  optOut: (phone) => request("/subscribers/opt-out", { method: "POST", body: { phone } }),
  listSchools: (params = {}) => request(`/schools${qs(params)}`),
  getSchool: (id) => request(`/schools/${id}`),
  listFacilities: (params = {}) => request(`/facilities${qs(params)}`),

  // ── authenticated ──────────────────────────────────────────────────────────
  me: (token) => request("/auth/me", { token }),

  // alerts + the safety gate
  listAlerts: (params, token) => request(`/alerts${qs(params)}`, { token }),
  getAlert: (id, token) => request(`/alerts/${id}`, { token }),
  createAlert: (body, token) => request("/alerts", { method: "POST", body, token }),
  reviewAlert: (id, body, token) => request(`/alerts/${id}/review`, { method: "POST", body, token }),
  issueAlert: (id, token) => request(`/alerts/${id}/issue`, { method: "POST", body: {}, token }),
  advanceAlert: (id, stage, body, token) =>
    request(`/alerts/${id}/${stage}`, { method: "POST", body: body ?? {}, token }),
  minutesOfProtection: (token) => request("/alerts/stats/minutes-of-protection", { token }),

  // field intelligence
  listReports: (params, token) => request(`/reports${qs(params)}`, { token }),
  signals: (token) => request("/reports/signals", { token }),
  triageReport: (id, token) => request(`/reports/${id}/triage`, { method: "POST", body: {}, token }),

  // observatory
  observatory: (token) => request("/observatory/overview", { token }),
  observatorySchools: (token) => request("/observatory/schools", { token }),
  observatoryFacilities: (token) => request("/observatory/facilities", { token }),
  observatoryMap: (token) => request("/observatory/map", { token }),

  // registry writes
  createSchool: (body, token) => request("/schools", { method: "POST", body, token }),
  updateSchool: (id, body, token) => request(`/schools/${id}`, { method: "PATCH", body, token }),
  scoreSchool: (id, body, token) => request(`/schools/${id}/resilience`, { method: "POST", body, token }),
  createFacility: (body, token) => request("/facilities", { method: "POST", body, token }),
  updateFacility: (id, body, token) => request(`/facilities/${id}`, { method: "PATCH", body, token }),
  scoreFacility: (id, body, token) => request(`/facilities/${id}/resilience`, { method: "POST", body, token }),

  // readings
  submitReading: (body, token) => request("/readings", { method: "POST", body, token }),
  listReadings: (params, token) => request(`/readings${qs(params)}`, { token }),

  // inbox + audience
  listEnquiries: (params, token) => request(`/enquiries${qs(params)}`, { token }),
  markEnquiryHandled: (id, token) => request(`/enquiries/${id}/handled`, { method: "POST", body: {}, token }),
  listSubscribers: (params, token) => request(`/subscribers${qs(params)}`, { token }),
  subscriberStats: (token) => request("/subscribers/stats", { token }),

  // people
  listUsers: (token) => request("/auth/users", { token }),
  createUser: (body, token) => request("/auth/users", { method: "POST", body, token }),
  updateUser: (id, body, token) => request(`/auth/users/${id}`, { method: "PATCH", body, token }),
  changePassword: (body, token) => request("/auth/change-password", { method: "POST", body, token }),

  async login(email, password) {
    // The token endpoint is OAuth2 password flow, so it takes form encoding.
    const form = new URLSearchParams({ username: email, password });
    const res = await fetch(`${API_BASE}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form
    });
    const payload = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(payload?.detail ?? "Sign-in failed", res.status, payload?.detail);
    return payload;
  }
};

function qs(params) {
  const entries = Object.entries(params ?? {}).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  return entries.length ? `?${new URLSearchParams(entries)}` : "";
}
