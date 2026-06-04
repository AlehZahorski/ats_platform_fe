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

export interface OverviewReport {
  total_applications: number;
  total_hired: number;
  hire_rate: number;
  avg_time_to_hire_days: number;
  active_jobs: number;
}

export interface TimeSeriesPoint {
  date: string;
  count: number;
}

export interface ApplicationsOverTimeReport {
  points: TimeSeriesPoint[];
  total: number;
}

export interface JobApplicationsRow {
  job_id: string;
  job_title: string;
  count: number;
  percentage: number;
}

export interface JobApplicationsReport {
  jobs: JobApplicationsRow[];
  total: number;
}

export const reportsApi = {
  timeToHire: (days = 30) =>
    apiClient.get<TimeToHireReport>("/reports/time-to-hire", { params: { days } }),
  pipeline: (days = 30) =>
    apiClient.get<PipelineReport>("/reports/pipeline", { params: { days } }),
  sources: (days = 30) =>
    apiClient.get<SourcesReport>("/reports/sources", { params: { days } }),
  overview: (days = 30) =>
    apiClient.get<OverviewReport>("/reports/overview", { params: { days } }),
  applicationsOverTime: (days = 30) =>
    apiClient.get<ApplicationsOverTimeReport>("/reports/applications-over-time", { params: { days } }),
  byJob: (days = 30) =>
    apiClient.get<JobApplicationsReport>("/reports/by-job", { params: { days } }),
};
