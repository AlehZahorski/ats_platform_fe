import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  jobsApi,
  type JobPayload,
  type MitigationActionPatch,
  type MitigationActionPayload,
  type RiskItemPatch,
  type RiskItemPayload,
} from "@/services/api/jobs";

export const jobKeys = {
  all: ["jobs"] as const,
  list: (params?: object) => ["jobs", "list", params] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
  publicList: (params?: object) => ["jobs", "public-list", params] as const,
};

// ── Queries ────────────────────────────────────────────────────────────

export function useJobs(params?: { status?: string }) {
  return useQuery({
    queryKey: jobKeys.list(params),
    queryFn: () => jobsApi.list(params).then((r) => r.data),
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: () => jobsApi.get(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function usePublicJobs(params?: { q?: string }) {
  return useQuery({
    queryKey: jobKeys.publicList(params),
    queryFn: () => jobsApi.listPublic(params).then((r) => r.data),
  });
}

// ── Job CRUD mutations ─────────────────────────────────────────────────

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: JobPayload) => jobsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
}

export function useCloneJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.clone(id).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobPayload> }) =>
      jobsApi.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: jobKeys.all });
      qc.invalidateQueries({ queryKey: jobKeys.detail(id) });
    },
  });
}

export function usePublishJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.publish(id).then((r) => r.data),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: jobKeys.all });
      qc.invalidateQueries({ queryKey: jobKeys.detail(id) });
    },
  });
}

export function useDeleteJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
}

export function useAssignTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, template_id }: { id: string; template_id: string | null }) =>
      jobsApi.assignTemplate(id, template_id).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: jobKeys.all });
      qc.invalidateQueries({ queryKey: jobKeys.detail(id) });
    },
  });
}

// ── LLM mutations ──────────────────────────────────────────────────────

export function useAnalyzeJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.analyze(id).then((r) => r.data),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: jobKeys.detail(id) }),
  });
}

export function useAssessRisk() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.assessRisk(id).then((r) => r.data),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: jobKeys.detail(id) }),
  });
}

export function useJobSuggest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobsApi.suggest(id).then((r) => r.data),
    // Refresh job detail so `suggest_used_at` propagates and the CTA hides.
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: jobKeys.detail(id) }),
  });
}

// ── Risk items CRUD ────────────────────────────────────────────────────

export function useAddRiskItem(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RiskItemPayload) => jobsApi.addRiskItem(jobId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.detail(jobId) }),
  });
}

export function useUpdateRiskItem(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ riskId, data }: { riskId: string; data: RiskItemPatch }) =>
      jobsApi.updateRiskItem(jobId, riskId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.detail(jobId) }),
  });
}

export function useDeleteRiskItem(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (riskId: string) => jobsApi.deleteRiskItem(jobId, riskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.detail(jobId) }),
  });
}

// ── Mitigation actions CRUD ────────────────────────────────────────────

export function useAddMitigation(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MitigationActionPayload) =>
      jobsApi.addMitigation(jobId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.detail(jobId) }),
  });
}

export function useUpdateMitigation(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ actionId, data }: { actionId: string; data: MitigationActionPatch }) =>
      jobsApi.updateMitigation(jobId, actionId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.detail(jobId) }),
  });
}

export function useDeleteMitigation(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (actionId: string) => jobsApi.deleteMitigation(jobId, actionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.detail(jobId) }),
  });
}
