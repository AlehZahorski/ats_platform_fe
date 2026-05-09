import apiClient from "./client";
import type { ContractType, Job, JobList, JobOfferAnalysis, JobSuggest, JobStatus, PublicJobList, SalaryPeriod, Seniority, WorkMode } from "@/types";

export interface JobPayload {
  title: string;
  description?: string | null;
  department?: string | null;
  location?: string | null;
  status?: JobStatus;
  role_summary?: string | null;
  role_purpose?: string | null;
  responsibilities?: string | null;
  must_haves?: string | null;
  nice_to_haves?: string | null;
  tech_stack?: string | null;
  domain_context?: string | null;
  seniority?: Seniority | null;
  experience_min_years?: number | null;
  experience_max_years?: number | null;
  work_mode?: WorkMode | null;
  remote_constraints?: string | null;
  success_profile?: string | null;
  team_context?: string | null;
  reporting_to?: string | null;
  value_proposition?: string | null;
  benefits?: string | null;
  hiring_process?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_period?: SalaryPeriod | null;
  contract_type?: ContractType | null;
  template_id?: string | null;
}

export const jobsApi = {
  list: (params?: { skip?: number; limit?: number; status?: string }) =>
    apiClient.get<JobList>("/jobs", { params }),

  listPublic: (params?: { skip?: number; limit?: number; q?: string }) =>
    apiClient.get<PublicJobList>("/jobs/public", { params }),

  get: (id: string) => apiClient.get<Job>(`/jobs/${id}`),

  create: (data: JobPayload) => apiClient.post<Job>("/jobs", data),

  update: (id: string, data: Partial<JobPayload>) =>
    apiClient.patch<Job>(`/jobs/${id}`, data),

  delete: (id: string) => apiClient.delete(`/jobs/${id}`),

  assignTemplate: (id: string, template_id: string | null) =>
    apiClient.put<Job>(`/jobs/${id}/template`, { template_id }),

  analyze: (id: string) =>
    apiClient.post<JobOfferAnalysis>(`/jobs/${id}/analyze`),

  suggest: (id: string) =>
    apiClient.post<JobSuggest>(`/jobs/${id}/suggest`),
};
