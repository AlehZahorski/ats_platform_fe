import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi, TaskCreate } from "@/services/api/tasks";
import { reportsApi } from "@/services/api/reports";

// ─── Tasks ────────────────────────────────────────────────────────────────────
export const taskKeys = {
  all: ["tasks"] as const,
  list: (params?: object) => ["tasks", "list", params] as const,
};

export function useTasks(params?: { assigned_to_me?: boolean; completed?: boolean; application_id?: string }) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => tasksApi.list(params).then((r) => r.data),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskCreate) => tasksApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaskCreate> & { completed?: boolean } }) =>
      tasksApi.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  });
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportKeys = {
  timeToHire: (days: number) => ["reports", "time-to-hire", days] as const,
  pipeline: (days: number) => ["reports", "pipeline", days] as const,
  sources: (days: number) => ["reports", "sources", days] as const,
};

export function useTimeToHireReport(days: number) {
  return useQuery({
    queryKey: reportKeys.timeToHire(days),
    queryFn: () => reportsApi.timeToHire(days).then((r) => r.data),
  });
}

export function usePipelineReport(days: number) {
  return useQuery({
    queryKey: reportKeys.pipeline(days),
    queryFn: () => reportsApi.pipeline(days).then((r) => r.data),
  });
}

export function useSourcesReport(days: number) {
  return useQuery({
    queryKey: reportKeys.sources(days),
    queryFn: () => reportsApi.sources(days).then((r) => r.data),
  });
}