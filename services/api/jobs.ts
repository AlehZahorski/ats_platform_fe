import apiClient from "./client";
import type { Job, JobList } from "@/types";

export const jobsApi = {
  list: (params?: { skip?: number; limit?: number; status?: string }) =>
    apiClient.get<JobList>("/jobs", { params }),

  get: (id: string) => apiClient.get<Job>(`/jobs/${id}`),

  create: (data: Partial<Job>) => apiClient.post<Job>("/jobs", data),

  update: (id: string, data: Partial<Job>) =>
    apiClient.patch<Job>(`/jobs/${id}`, data),

  delete: (id: string) => apiClient.delete(`/jobs/${id}`),

  assignTemplate: (id: string, template_id: string | null) =>
    apiClient.put<Job>(`/jobs/${id}/template`, { template_id }),
};