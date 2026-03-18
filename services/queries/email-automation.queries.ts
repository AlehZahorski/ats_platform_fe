import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emailTemplatesApi, EmailTemplateCreate } from "@/services/api/email-templates";
import { automationsApi, AutomationRuleCreate } from "@/services/api/automations";

// ─── Email Templates ──────────────────────────────────────────────────────────
export const emailTemplateKeys = {
  all: ["email-templates"] as const,
  list: (params?: object) => ["email-templates", "list", params] as const,
  detail: (id: string) => ["email-templates", "detail", id] as const,
};

export function useEmailTemplates(params?: { language?: string; type?: string }) {
  return useQuery({
    queryKey: emailTemplateKeys.list(params),
    queryFn: () => emailTemplatesApi.list(params).then((r) => r.data),
  });
}

export function useEmailTemplate(id: string) {
  return useQuery({
    queryKey: emailTemplateKeys.detail(id),
    queryFn: () => emailTemplatesApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmailTemplateCreate) =>
      emailTemplatesApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailTemplateKeys.all }),
  });
}

export function useUpdateEmailTemplate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<EmailTemplateCreate>) =>
      emailTemplatesApi.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailTemplateKeys.all }),
  });
}

export function useDeleteEmailTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailTemplatesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: emailTemplateKeys.all }),
  });
}

export function usePreviewEmailTemplate(id: string) {
  return useMutation({
    mutationFn: (variables?: Record<string, string>) =>
      emailTemplatesApi.preview(id, variables).then((r) => r.data),
  });
}

// ─── Automations ──────────────────────────────────────────────────────────────
export const automationKeys = {
  all: ["automations"] as const,
  list: () => ["automations", "list"] as const,
};

export function useAutomations() {
  return useQuery({
    queryKey: automationKeys.list(),
    queryFn: () => automationsApi.list().then((r) => r.data),
  });
}

export function useCreateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AutomationRuleCreate) =>
      automationsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: automationKeys.all }),
  });
}

export function useUpdateAutomation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AutomationRuleCreate>) =>
      automationsApi.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: automationKeys.all }),
  });
}

export function useToggleAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => automationsApi.toggle(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: automationKeys.all }),
  });
}

export function useDeleteAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => automationsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: automationKeys.all }),
  });
}