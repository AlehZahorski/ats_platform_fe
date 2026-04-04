import apiClient from "./client";
import type { PipelineStage, PipelineStageMutation } from "@/types";

export const pipelineApi = {
  getStages: () => apiClient.get<PipelineStage[]>("/pipeline"),
  createStage: (data: PipelineStageMutation) => apiClient.post<PipelineStage>("/pipeline", data),
  updateStage: (id: string, data: PipelineStageMutation) => apiClient.patch<PipelineStage>(`/pipeline/${id}`, data),
  deleteStage: (id: string) => apiClient.delete(`/pipeline/${id}`),
  reorderStages: (stages: PipelineStage[]) =>
    apiClient.post<PipelineStage[]>("/pipeline/reorder", {
      stages: stages.map((stage, index) => ({ id: stage.id, order_index: index })),
    }),
};
