import apiClient from "./client";
import type { PipelineStage } from "@/types";

export const pipelineApi = {
  getStages: () => apiClient.get<PipelineStage[]>("/pipeline"),
};
