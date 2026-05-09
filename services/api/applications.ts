import apiClient from "./client";
import type {
  Application,
  CandidateJobMatch,
  CVParseJob,
  ApplicationList,
  ApplicationTracking,
  CandidateScore,
  ParsedEducation,
  ParsedExperience,
  ParsedSkill,
  DuplicateCheckResponse,
  Note,
  Tag,
} from "@/types";

export interface BulkActionPayload {
  application_ids: string[];
  action: "stage_change" | "reject" | "tag";
  payload: Record<string, string | boolean>;
}

export interface BulkResult {
  updated: number;
  failed: number;
  action: string;
}

export interface DuplicateCheckPayload {
  job_id: string;
  email: string;
  phone?: string;
}

export interface CVParseConfirmPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  headline?: string | null;
  summary?: string | null;
  skills: ParsedSkill[];
  experience: ParsedExperience[];
  education: ParsedEducation[];
}

export const applicationsApi = {
  list: (params?: { job_id?: string; stage_id?: string; search?: string; skip?: number; limit?: number }) =>
    apiClient.get<ApplicationList>("/applications", { params }),

  get: (id: string) => apiClient.get<Application>(`/applications/${id}`),

  track: (token: string) =>
    apiClient.get<ApplicationTracking>(`/applications/track/${token}`),

  apply: (jobId: string, data: FormData) =>
    apiClient.post<Application>(`/applications/apply/${jobId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  duplicateCheck: (data: DuplicateCheckPayload) =>
    apiClient.post<DuplicateCheckResponse>("/applications/duplicate-check", data),

  getCvParseStatus: (id: string) =>
    apiClient.get<CVParseJob | null>(`/applications/${id}/cv-parse`),

  retryCvParse: (id: string) =>
    apiClient.post<CVParseJob>(`/applications/${id}/cv-parse/retry`),

  confirmCvParse: (id: string, data: CVParseConfirmPayload) =>
    apiClient.post<Application>(`/applications/${id}/cv-parse/confirm`, data),

  updateStage: (id: string, data: { stage_id: string; notify_candidate?: boolean }) =>
    apiClient.patch(`/pipeline/applications/${id}/stage`, data),

  score: (id: string, data: { communication: number; technical: number; culture_fit: number }) =>
    apiClient.post<CandidateScore>(`/applications/${id}/score`, data),

  getNotes: (id: string) =>
    apiClient.get<Note[]>(`/notes/applications/${id}/notes`),

  addNote: (id: string, data: { content: string; visible_to_candidate: boolean }) =>
    apiClient.post<Note>(`/notes/applications/${id}/notes`, data),

  getTags: (id: string) =>
    apiClient.get<Tag[]>(`/tags/applications/${id}/tags`),

  assignTag: (id: string, tag_id: string) =>
    apiClient.post(`/tags/applications/${id}/tags`, { tag_id }),

  removeTag: (id: string, tag_id: string) =>
    apiClient.delete(`/tags/applications/${id}/tags/${tag_id}`),

  getJobMatches: (id: string) =>
    apiClient.get<CandidateJobMatch[]>(`/applications/${id}/matches`),

  bulk: (data: BulkActionPayload) =>
    apiClient.post<BulkResult>("/applications/bulk", data),
};
