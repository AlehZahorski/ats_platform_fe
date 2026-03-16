import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/services/api/jobs";
import type { Job } from "@/types";

export const jobKeys = {
  all: ["jobs"] as const,
  list: (params?: object) => ["jobs", "list", params] as const,
  detail: (id: string) => ["jobs", "detail", id] as const,
};

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

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Job>) => jobsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: jobKeys.all }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Job> }) =>
      jobsApi.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
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