import apiClient from "./client";

export interface TimeToHireReport {
  avg_days: number;
  min_days: number;
  max_days: number;
  total_hired: number;
}

export interface PipelineStageReport {
  stage_name: string;
  count: number;
  percentage: number;
}

export interface PipelineReport {
  stages: PipelineStageReport[];
  total: number;
}

export interface SourceReport {
  source: string;
  count: number;
  percentage: number;
}

export interface SourcesReport {
  sources: SourceReport[];
  total: number;
}

export const reportsApi = {
  timeToHire: (days = 30) =>
    apiClient.get<TimeToHireReport>("/reports/time-to-hire", { params: { days } }),
  pipeline: (days = 30) =>
    apiClient.get<PipelineReport>("/reports/pipeline", { params: { days } }),
  sources: (days = 30) =>
    apiClient.get<SourcesReport>("/reports/sources", { params: { days } }),
};