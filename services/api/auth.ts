import apiClient from "./client";
import type { User } from "@/types";

export const authApi = {
  signupCompany: (data: { company_name: string; email: string; password: string }) =>
    apiClient.post("/auth/signup-company", data),

  login: (data: { email: string; password: string }) =>
    apiClient.post("/auth/login", data),

  logout: () => apiClient.post("/auth/logout"),

  refresh: () => apiClient.post("/auth/refresh"),

  me: () => apiClient.get<User>("/auth/me"),

  googleLogin: () => apiClient.get<{ url: string; state: string }>("/auth/google"),
};
