import apiClient from "./client";
import type { Admin, AdminArticle, AdminArticleList } from "@/entities/admin";


// ── Auth ─────────────────────────────────────────────────────────────
export const adminAuthApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post<Admin>("/admin/auth/login", data),
  logout: () => apiClient.post("/admin/auth/logout"),
  refresh: () => apiClient.post<Admin>("/admin/auth/refresh"),
  me: () => apiClient.get<Admin>("/admin/auth/me"),
};


// ── Articles CRUD ────────────────────────────────────────────────────
export interface AdminArticlesParams {
  q?:        string;
  category?: string;
  /** Filter by article flavour. Admin can see both flavours in one place,
   *  so type is optional here unlike the public side. */
  type?:     "editorial" | "company";
  status?:   "draft" | "published";
  sort?:     "newest" | "oldest" | "title";
  skip?:     number;
  limit?:    number;
}

export interface AdminArticleCreatePayload {
  slug:              string;
  title:             string;
  excerpt?:          string | null;
  content?:          string;
  category:          string;
  is_featured?:      boolean;
  is_published?:     boolean;
  author_name:       string;
  author_role?:      string | null;
  author_avatar_url?: string | null;
  read_time_minutes?: number | null;
  published_at?:     string | null;
}

export type AdminArticleUpdatePayload = Partial<AdminArticleCreatePayload>;

function uploadConfig() {
  return { headers: { "Content-Type": "multipart/form-data" } };
}

export const adminArticlesApi = {
  list: (params: AdminArticlesParams = {}) =>
    apiClient.get<AdminArticleList>("/admin/articles", { params }),
  get: (id: string) => apiClient.get<AdminArticle>(`/admin/articles/${id}`),
  create: (data: AdminArticleCreatePayload) =>
    apiClient.post<AdminArticle>("/admin/articles", data),
  update: (id: string, data: AdminArticleUpdatePayload) =>
    apiClient.patch<AdminArticle>(`/admin/articles/${id}`, data),
  delete: (id: string) => apiClient.delete(`/admin/articles/${id}`),
  togglePublish: (id: string) =>
    apiClient.post<AdminArticle>(`/admin/articles/${id}/publish`),
  toggleFeature: (id: string) =>
    apiClient.post<AdminArticle>(`/admin/articles/${id}/feature`),
  /** Promote a company article for N days, or pass null to unpromote. */
  promote: (id: string, days: number | null) =>
    apiClient.post<AdminArticle>(`/admin/articles/${id}/promote`, undefined, {
      params: days !== null ? { days } : {},
    }),
  uploadCover: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.post<AdminArticle>(`/admin/articles/${id}/cover`, fd, uploadConfig());
  },
  removeCover: (id: string) =>
    apiClient.delete<AdminArticle>(`/admin/articles/${id}/cover`),
};
