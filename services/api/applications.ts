import apiClient from "./client";
import type { Application, ApplicationList, ApplicationTracking, CandidateScore, Note, Tag } from "@/types";

export interface BulkActionPayload {
  application_ids: string[];
  action: "stage_change" | "reject" | "tag";
  payload: Record<string, string>;
}

export interface BulkResult {
  updated: number;
  failed: number;
  action: string;
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

  bulk: (data: BulkActionPayload) =>
    apiClient.post<BulkResult>("/applications/bulk", data),
};