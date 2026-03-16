import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formsApi } from "@/services/api/forms";
import type { FormTemplate, FormField } from "@/types";

export const formKeys = {
  all: ["forms"] as const,
  list: () => ["forms", "list"] as const,
  detail: (id: string) => ["forms", "detail", id] as const,
};

export function useFormTemplates() {
  return useQuery({
    queryKey: formKeys.list(),
    queryFn: () => formsApi.list().then((r) => r.data),
  });
}

export function useFormTemplate(id: string) {
  return useQuery({
    queryKey: formKeys.detail(id),
    queryFn: () => formsApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => formsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.all }),
  });
}

export function useUpdateTemplate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => formsApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: formKeys.all });
      qc.invalidateQueries({ queryKey: formKeys.detail(id) });
    },
  });
}

export function useAddField(templateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => formsApi.addField(templateId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.detail(templateId) }),
  });
}

export function useDeleteField(templateId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fieldId: string) => formsApi.deleteField(templateId, fieldId),
    onSuccess: () => qc.invalidateQueries({ queryKey: formKeys.detail(templateId) }),
  });
}