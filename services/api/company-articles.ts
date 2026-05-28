import apiClient from "./client";
import type { AdminArticle, AdminArticleList } from "@/entities/admin";
import type {
  AdminArticleCreatePayload,
  AdminArticleUpdatePayload,
} from "@/services/api/admin";

// Reuses the admin response shape (AdminArticle / AdminArticleList) on
// purpose — the company-side editor needs the same fields (is_published,
// timestamps, type, company block).
export interface CompanyArticlesParams {
  q?:      string;
  status?: "draft" | "published";
  sort?:   "newest" | "oldest" | "title";
  skip?:   number;
  limit?:  number;
}

// Company create payload is a narrower view of the admin one — companies
// can't set is_featured or type (server forces type='company').
export type CompanyArticleCreatePayload = Omit<AdminArticleCreatePayload, "is_featured">;
export type CompanyArticleUpdatePayload = Omit<AdminArticleUpdatePayload, "is_featured">;

function uploadConfig() {
  return { headers: { "Content-Type": "multipart/form-data" } };
}

export const companyArticlesApi = {
  list: (params: CompanyArticlesParams = {}) =>
    apiClient.get<AdminArticleList>("/company/articles", { params }),
  get: (id: string) => apiClient.get<AdminArticle>(`/company/articles/${id}`),
  create: (data: CompanyArticleCreatePayload) =>
    apiClient.post<AdminArticle>("/company/articles", data),
  update: (id: string, data: CompanyArticleUpdatePayload) =>
    apiClient.patch<AdminArticle>(`/company/articles/${id}`, data),
  delete: (id: string) => apiClient.delete(`/company/articles/${id}`),
  togglePublish: (id: string) =>
    apiClient.post<AdminArticle>(`/company/articles/${id}/publish`),
  uploadCover: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.post<AdminArticle>(`/company/articles/${id}/cover`, fd, uploadConfig());
  },
  removeCover: (id: string) =>
    apiClient.delete<AdminArticle>(`/company/articles/${id}/cover`),
};
