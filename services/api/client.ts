import axios from "axios";

// Use relative URL so requests go through Next.js proxy (same origin = cookies work)
const API_URL = "/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Track if we're already refreshing to prevent loops
let isRefreshing = false;

// Endpoints that should never trigger a redirect to login on 401
const PUBLIC_ENDPOINTS = ["/auth/", "/applications/apply/", "/applications/track/"];

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
        // Only redirect if we're in the browser and not already on login page
        if (
          typeof window !== "undefined" &&
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