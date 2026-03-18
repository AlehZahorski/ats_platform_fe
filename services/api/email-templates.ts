import apiClient from "./client";

export interface EmailTemplate {
  id: string;
  company_id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  language: string;
  variables: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateCreate {
  name: string;
  type: string;
  subject: string;
  body: string;
  language: string;
}

export interface EmailTemplatePreview {
  subject: string;
  body: string;
}

export const emailTemplatesApi = {
  list: (params?: { language?: string; type?: string }) =>
    apiClient.get<EmailTemplate[]>("/email-templates", { params }),

  get: (id: string) =>
    apiClient.get<EmailTemplate>(`/email-templates/${id}`),

  create: (data: EmailTemplateCreate) =>
    apiClient.post<EmailTemplate>("/email-templates", data),

  update: (id: string, data: Partial<EmailTemplateCreate>) =>
    apiClient.patch<EmailTemplate>(`/email-templates/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/email-templates/${id}`),

  preview: (id: string, variables?: Record<string, string>) =>
    apiClient.post<EmailTemplatePreview>(`/email-templates/${id}/preview`, { variables }),
};