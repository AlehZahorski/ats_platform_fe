import apiClient from "./client";
import type {
  CompanyEditPayload,
  CompanyPublicDetail,
  CompanyPublicList,
  MyCompany,
  SavedCompany,
} from "@/entities/company";

// ── Public companies ──────────────────────────────────────────────────
export interface PublicCompaniesParams {
  q?: string;
  industry?: string[];
  size?: string[];          // "1-10" | "11-50" | "51-200" | "201-500" | "500+"
  location?: string;
  work_mode?: string[];     // "remote" | "hybrid" | "office"
  verified_only?: boolean;
  sort?: "newest" | "jobs" | "name";
  skip?: number;
  limit?: number;
}

export interface PublicCompanyJob {
  id: string;
  title: string;
  slug: string | null;
  location: string | null;
  work_mode: string | null;
  contract_type: string | null;
  seniority: string | null;
  employment_size: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: string | null;
  tech_stack: string | null;
  created_at: string;
}

export interface PublicCompanyJobsList {
  items: PublicCompanyJob[];
  total: number;
}

export const companiesApi = {
  listPublic: (params: PublicCompaniesParams = {}) =>
    apiClient.get<CompanyPublicList>("/companies/public", { params }),
  detailPublic: (slug: string) =>
    apiClient.get<CompanyPublicDetail>(`/companies/public/${slug}`),
  jobsPublic: (slug: string, params: { skip?: number; limit?: number } = {}) =>
    apiClient.get<PublicCompanyJobsList>(`/companies/public/${slug}/jobs`, { params }),
};

// ── My company (owner dashboard editor) ──────────────────────────────
// All endpoints are authenticated and operate on the caller's own company
// (resolved server-side from the session — never trust a company_id param).
function uploadConfig() {
  return { headers: { "Content-Type": "multipart/form-data" } };
}

export const myCompanyApi = {
  get: () => apiClient.get<MyCompany>("/company"),
  update: (payload: CompanyEditPayload) =>
    apiClient.patch<MyCompany>("/company", payload),

  uploadLogo: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.post<MyCompany>("/company/upload/logo", fd, uploadConfig());
  },
  removeLogo: () => apiClient.delete<MyCompany>("/company/upload/logo"),

  uploadBanner: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.post<MyCompany>("/company/upload/banner", fd, uploadConfig());
  },
  removeBanner: () => apiClient.delete<MyCompany>("/company/upload/banner"),

  uploadGalleryItem: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiClient.post<MyCompany>("/company/upload/gallery", fd, uploadConfig());
  },
  removeGalleryItem: (index: number) =>
    apiClient.delete<MyCompany>(`/company/upload/gallery/${index}`),
};


// ── Saved companies (Obserwuj firmę) ─────────────────────────────────
// Logged-in candidates only. Anonymous follows live in localStorage; the
// useSavedCompaniesSet hook abstracts both behind one interface.
export const savedCompaniesApi = {
  list: () => apiClient.get<SavedCompany[]>("/candidates/me/saved-companies"),
  save: (companyId: string) =>
    apiClient.post<SavedCompany>(`/candidates/me/saved-companies/${companyId}`),
  unsave: (companyId: string) =>
    apiClient.delete(`/candidates/me/saved-companies/${companyId}`),
};
