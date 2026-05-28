import apiClient from "./client";
import type { Candidate, SavedJob, SavedSearch } from "@/entities/candidate";

// ── Public jobs ────────────────────────────────────────────────────────
export interface PublicCompany {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  is_verified: boolean;
}

export interface PublicJobSummary {
  id: string;
  title: string;
  slug: string | null;
  department: string | null;
  location: string | null;
  role_summary: string | null;
  work_mode: string | null;
  remote_constraints: string | null;
  contract_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: string | null;
  category: string | null;
  shift_system: string | null;
  employment_size: string | null;
  required_qualifications: string[];
  seniority: string | null;
  tech_stack: string | null;
  created_at: string;
  company: PublicCompany | null;
}

export interface PublicJobDetail extends PublicJobSummary {
  responsibilities: string | null;
  must_haves: string | null;
  nice_to_haves: string | null;
  domain_context: string | null;
  experience_min_years: number | null;
  experience_max_years: number | null;
  success_profile: string | null;
  team_context: string | null;
  reporting_to: string | null;
  value_proposition: string | null;
  benefits: string | null;
  hiring_process: string | null;
  template: unknown | null;
}

export interface PublicJobList {
  items: PublicJobSummary[];
  total: number;
}

export interface PublicStats {
  total_jobs: number;
  total_companies: number;
}

export interface PopularCategory {
  category: string;
  hits: number;
}

export interface PublicJobsParams {
  q?: string;
  category?: string[];
  work_mode?: string[];
  contract_type?: string[];
  seniority?: string[];
  employment_size?: string[];
  shift_system?: string[];
  qualification?: string[];
  /** Whitelist of job IDs. Powers the "Obserwowane" tab — backend
   *  returns only those jobs in a single round-trip; empty list =
   *  empty results, no extra requests. */
  job_ids?: string[];
  verified_only?: boolean;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  sort?: "newest" | "salary_high" | "salary_low";
  skip?: number;
  limit?: number;
}

export const jobBoardApi = {
  listPublic: (params: PublicJobsParams = {}) =>
    apiClient.get<PublicJobList>("/jobs/public", { params }),
  detailPublic: (id: string) =>
    apiClient.get<PublicJobDetail>(`/jobs/public/${id}`),
  stats: () =>
    apiClient.get<PublicStats>("/jobs/public/stats"),
  popular: (limit = 8) =>
    apiClient.get<{ items: PopularCategory[] }>("/jobs/public/popular", { params: { limit } }),
  logSearch: (data: { query_text?: string; category?: string; location?: string }) =>
    apiClient.post("/candidates/search-log", data),
};

// ── Candidate auth & profile ──────────────────────────────────────────
export const candidatesApi = {
  signup: (data: { email: string; password: string; full_name?: string }) =>
    apiClient.post<Candidate>("/candidates/signup", data),
  login: (data: { email: string; password: string }) =>
    apiClient.post<Candidate>("/candidates/login", data),
  logout: () =>
    apiClient.post("/candidates/logout"),
  me: () =>
    apiClient.get<Candidate>("/candidates/me"),
  updateMe: (data: Partial<Pick<Candidate, "full_name" | "avatar_key" | "phone" | "location" | "headline" | "language">>) =>
    apiClient.patch<Candidate>("/candidates/me", data),

  listSavedJobs: () =>
    apiClient.get<SavedJob[]>("/candidates/me/saved-jobs"),
  saveJob: (jobId: string) =>
    apiClient.post<SavedJob>(`/candidates/me/saved-jobs/${jobId}`),
  unsaveJob: (jobId: string) =>
    apiClient.delete(`/candidates/me/saved-jobs/${jobId}`),

  listSavedSearches: () =>
    apiClient.get<SavedSearch[]>("/candidates/me/saved-searches"),
  createSavedSearch: (data: { name: string; query: Record<string, unknown>; notify_email?: boolean }) =>
    apiClient.post<SavedSearch>("/candidates/me/saved-searches", data),
  deleteSavedSearch: (id: string) =>
    apiClient.delete(`/candidates/me/saved-searches/${id}`),
};
