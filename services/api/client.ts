import axios from "axios";

// Use relative URL so requests go through Next.js proxy (same origin = cookies work)
const API_URL = "/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  // Serialize arrays as repeated `key=v1&key=v2` (matches FastAPI's
  // `list[str] | None = Query(None)` expectation). Default axios serializer
  // emits `key[]=v1&key[]=v2` which FastAPI ignores → filters silently failed.
  paramsSerializer: {
    serialize: (params: Record<string, unknown>) => {
      const sp = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const v of value) {
            if (v !== undefined && v !== null && v !== "") sp.append(key, String(v));
          }
        } else if (typeof value === "boolean") {
          // Send booleans as `?key=1` / `?key=0` so FastAPI's bool parser accepts them.
          sp.append(key, value ? "1" : "0");
        } else if (value !== "") {
          sp.append(key, String(value));
        }
      }
      return sp.toString();
    },
  },
});

// Track if we're already refreshing to prevent loops
let isRefreshing = false;

// Endpoints that should never trigger a redirect to /login (HR side) on 401.
// /candidates/* — candidate side has its own /konto/zaloguj page, never redirect HR /login here.
// /admin/*     — admin side has its own /admin/login page; AdminAuthGuard handles the redirect.
// /jobs/public/*, /companies/public/*, /articles/public/* — public endpoints, 401 shouldn't happen.
const PUBLIC_ENDPOINTS = [
  "/auth/",
  "/applications/apply/",
  "/applications/track/",
  "/candidates/",
  "/admin/",
  "/jobs/public",
  "/companies/public",
  "/articles/public",
  "/articles/newsletter",
];

// Routes (browser pathnames) where we must NEVER redirect to the HR /login on 401.
// Covers the candidate-facing public site plus the separate /admin panel — both
// have their own login flows and own redirect guards.
const PUBLIC_PATH_PREFIXES = ["/jobs", "/firmy", "/poradnik", "/firmy-pisza", "/o-nas", "/konto", "/apply", "/track", "/admin"];

function isOnPublicSite(): boolean {
  if (typeof window === "undefined") return false;
  const p = window.location.pathname;
  return p === "/" || PUBLIC_PATH_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest.url ?? "";

    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((e) => url.includes(e));

    // For public endpoints or already retried — just reject, don't redirect
    if (isPublicEndpoint || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      if (isRefreshing) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/auth/refresh");
        isRefreshing = false;
        return apiClient.request(originalRequest);
      } catch {
        isRefreshing = false;
        // Only redirect if we're in the browser, NOT on a public/candidate page,
        // and not already on a login/signup page.
        if (
          typeof window !== "undefined" &&
          !isOnPublicSite() &&
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/signup")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;