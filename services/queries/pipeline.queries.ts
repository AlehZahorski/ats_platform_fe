import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pipelineApi } from "@/services/api/pipeline";

export const pipelineKeys = {
  stages: ["pipeline", "stages"] as const,
};

export function usePipelineStages() {
  return useQuery({
    queryKey: pipelineKeys.stages,
    queryFn: () => pipelineApi.getStages().then((r) => r.data),
    staleTime: Infinity,
  });
}

export function useCreatePipelineStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => pipelineApi.createStage({ name }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pipelineKeys.stages }),
  });
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      pipelineApi.updateStage(id, { name }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pipelineKeys.stages }),
  });
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pipelineApi.deleteStage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pipelineKeys.stages }),
  });
}

export function useReorderPipelineStages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stages: import("@/types").PipelineStage[]) =>
      pipelineApi.reorderStages(stages).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pipelineKeys.stages }),
  });
}
