import apiClient from "./client";

export interface Consent {
  id: string;
  company_id: string;
  name: string;
  content: string;
  language: string;
  required: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ApplicationConsent {
  application_id: string;
  consent_id: string;
  accepted: boolean;
  accepted_at: string;
  consent: Consent | null;
}

export interface AnonymizeResult {
  application_id: string;
  anonymized: boolean;
  message: string;
}

export const gdprApi = {
  // Consent definitions
  listConsents: (params?: { active_only?: boolean; language?: string }) =>
    apiClient.get<Consent[]>("/gdpr", { params }),

  createConsent: (data: { name: string; content: string; language: string; required: boolean }) =>
    apiClient.post<Consent>("/gdpr", data),

  updateConsent: (id: string, data: Partial<{ name: string; content: string; is_active: boolean }>) =>
    apiClient.patch<Consent>(`/gdpr/${id}`, data),

  deleteConsent: (id: string) =>
    apiClient.delete(`/gdpr/${id}`),

  // Application consents
  getApplicationConsents: (applicationId: string) =>
    apiClient.get<ApplicationConsent[]>(`/gdpr/applications/${applicationId}/consents`),

  recordConsent: (applicationId: string, data: { consent_id: string; accepted: boolean }) =>
    apiClient.post(`/gdpr/applications/${applicationId}/consents`, data),

  // GDPR operations
  setRetention: (applicationId: string, date: string | null) =>
    apiClient.patch(`/gdpr/applications/${applicationId}/retention`, {
      data_retention_until: date,
    }),

  anonymize: (applicationId: string) =>
    apiClient.post<AnonymizeResult>(`/gdpr/applications/${applicationId}/anonymize`),

  deleteData: (applicationId: string) =>
    apiClient.delete(`/gdpr/applications/${applicationId}/data`),

  cleanupExpired: () =>
    apiClient.post<{ anonymized: number }>("/gdpr/cleanup"),
};