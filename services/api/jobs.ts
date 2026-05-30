import apiClient from "./client";
import type {
  ContractType,
  Job,
  JobList,
  JobOfferAnalysis,
  JobRiskAssessment,
  JobStatus,
  JobSuggest,
  MitigationAction,
  PublicJobList,
  RiskItem,
  RiskSeverity,
  SalaryPeriod,
  Seniority,
  WorkMode,
} from "@/types";

export interface JobParseResult {
  title?: string | null;
  department?: string | null;
  location?: string | null;
  role_summary?: string | null;
  team_context?: string | null;
  value_proposition?: string | null;
  remote_constraints?: string | null;
  responsibilities?: string | null;
  must_haves?: string | null;
  nice_to_haves?: string | null;
  tech_stack?: string | null;
  benefits?: string | null;
  hiring_process?: string | null;
  work_mode?: string | null;
  contract_type?: string | null;
  seniority?: string | null;
  shift_system?: string | null;
  employment_size?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_period?: string | null;
  experience_min_years?: number | null;
  experience_max_years?: number | null;
}

export interface JobPayload {
  title: string;
  slug?: string | null;
  department?: string | null;
  location?: string | null;
  status?: JobStatus;
  role_summary?: string | null;
  role_purpose?: string | null;
  role_scope?: string | null;
  role_deliverables?: string | null;
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
  // Classification (multi-industry, multi-country)
  category?: string | null;
  shift_system?: string | null;
  employment_size?: string | null;
  required_qualifications?: string[];
}

export interface RiskItemPayload {
  description: string;
  severity?: RiskSeverity;
  order?: number;
}

export interface RiskItemPatch {
  description?: string;
  severity?: RiskSeverity;
  order?: number;
}

export interface MitigationActionPayload {
  description: string;
  order?: number;
}

export interface MitigationActionPatch {
  description?: string;
  order?: number;
}

export const jobsApi = {
  // ── Core CRUD ─────────────────────────────────────────────────────────
  list: (params?: { skip?: number; limit?: number; status?: string }) =>
    apiClient.get<JobList>("/jobs", { params }),

  listPublic: (params?: { skip?: number; limit?: number; q?: string }) =>
    apiClient.get<PublicJobList>("/jobs/public", { params }),

  get: (id: string) => apiClient.get<Job>(`/jobs/${id}`),

  create: (data: JobPayload) => apiClient.post<Job>("/jobs", data),
  clone: (id: string) => apiClient.post<Job>(`/jobs/${id}/clone`),
  parse: (text: string) => apiClient.post<JobParseResult>("/jobs/parse", { text }),

  update: (id: string, data: Partial<JobPayload>) =>
    apiClient.patch<Job>(`/jobs/${id}`, data),

  // Explicit publish — strict server-side gate. Returns 422 with
  // `{ detail: { message, issues } }` when the offer is not ready.
  publish: (id: string) => apiClient.post<Job>(`/jobs/${id}/publish`),

  delete: (id: string) => apiClient.delete(`/jobs/${id}`),

  assignTemplate: (id: string, template_id: string | null) =>
    apiClient.put<Job>(`/jobs/${id}/template`, { template_id }),

  // ── LLM endpoints ─────────────────────────────────────────────────────
  analyze: (id: string) =>
    apiClient.post<JobOfferAnalysis>(`/jobs/${id}/analyze`),

  assessRisk: (id: string) =>
    apiClient.post<JobRiskAssessment>(`/jobs/${id}/risk-analysis`),

  suggest: (id: string) =>
    apiClient.post<JobSuggest>(`/jobs/${id}/suggest`),

  // ── Risk items CRUD ──────────────────────────────────────────────────
  addRiskItem: (jobId: string, data: RiskItemPayload) =>
    apiClient.post<RiskItem>(`/jobs/${jobId}/risks`, data),

  updateRiskItem: (jobId: string, riskId: string, data: RiskItemPatch) =>
    apiClient.patch<RiskItem>(`/jobs/${jobId}/risks/${riskId}`, data),

  deleteRiskItem: (jobId: string, riskId: string) =>
    apiClient.delete(`/jobs/${jobId}/risks/${riskId}`),

  // ── Mitigation actions CRUD ──────────────────────────────────────────
  addMitigation: (jobId: string, data: MitigationActionPayload) =>
    apiClient.post<MitigationAction>(`/jobs/${jobId}/mitigations`, data),

  updateMitigation: (jobId: string, actionId: string, data: MitigationActionPatch) =>
    apiClient.patch<MitigationAction>(`/jobs/${jobId}/mitigations/${actionId}`, data),

  deleteMitigation: (jobId: string, actionId: string) =>
    apiClient.delete(`/jobs/${jobId}/mitigations/${actionId}`),
};
