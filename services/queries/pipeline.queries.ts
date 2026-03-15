import { useQuery } from "@tanstack/react-query";
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
