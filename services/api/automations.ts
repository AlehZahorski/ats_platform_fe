import apiClient from "./client";

export interface AutomationRule {
  id: string;
  company_id: string;
  name: string;
  trigger_type: string;
  trigger_value: string | null;
  template_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomationRuleCreate {
  name: string;
  trigger_type: string;
  trigger_value?: string | null;
  template_id?: string | null;
  is_active?: boolean;
}

export const automationsApi = {
  list: () =>
    apiClient.get<AutomationRule[]>("/automations"),

  get: (id: string) =>
    apiClient.get<AutomationRule>(`/automations/${id}`),

  create: (data: AutomationRuleCreate) =>
    apiClient.post<AutomationRule>("/automations", data),

  update: (id: string, data: Partial<AutomationRuleCreate>) =>
    apiClient.patch<AutomationRule>(`/automations/${id}`, data),

  toggle: (id: string) =>
    apiClient.post<AutomationRule>(`/automations/${id}/toggle`),

  delete: (id: string) =>
    apiClient.delete(`/automations/${id}`),
};