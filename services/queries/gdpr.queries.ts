import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { gdprApi } from "@/services/api/gdpr";

export const gdprKeys = {
  all: ["gdpr"] as const,
  consents: () => ["gdpr", "consents"] as const,
  applicationConsents: (id: string) => ["gdpr", "application-consents", id] as const,
};

export function useConsents(params?: { active_only?: boolean; language?: string }) {
  return useQuery({
    queryKey: gdprKeys.consents(),
    queryFn: () => gdprApi.listConsents(params).then((r) => r.data),
  });
}

export function useApplicationConsents(applicationId: string) {
  return useQuery({
    queryKey: gdprKeys.applicationConsents(applicationId),
    queryFn: () => gdprApi.getApplicationConsents(applicationId).then((r) => r.data),
    enabled: !!applicationId,
  });
}

export function useCreateConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; content: string; language: string; required: boolean }) =>
      gdprApi.createConsent(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: gdprKeys.all }),
  });
}

export function useUpdateConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; content: string; is_active: boolean }> }) =>
      gdprApi.updateConsent(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: gdprKeys.all }),
  });
}

export function useDeleteConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => gdprApi.deleteConsent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: gdprKeys.all }),
  });
}

export function useAnonymize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) =>
      gdprApi.anonymize(applicationId).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export function useDeleteApplicationData() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (applicationId: string) => gdprApi.deleteData(applicationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export function useCleanupExpired() {
  return useMutation({
    mutationFn: () => gdprApi.cleanupExpired().then((r) => r.data),
  });
}