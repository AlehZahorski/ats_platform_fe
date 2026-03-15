import apiClient from "./client";
import type { FormTemplate } from "@/types";

export const formsApi = {
  list: () => apiClient.get<FormTemplate[]>("/forms/templates"),
  get: (id: string) => apiClient.get<FormTemplate>(`/forms/templates/${id}`),
  create: (data: { name: string; fields?: unknown[] }) =>
    apiClient.post<FormTemplate>("/forms/templates", data),
  update: (id: string, data: { name?: string }) =>
    apiClient.patch<FormTemplate>(`/forms/templates/${id}`, data),
  addField: (templateId: string, data: unknown) =>
    apiClient.post(`/forms/templates/${templateId}/fields`, data),
  deleteField: (templateId: string, fieldId: string) =>
    apiClient.delete(`/forms/templates/${templateId}/fields/${fieldId}`),
};
