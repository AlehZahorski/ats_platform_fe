import apiClient from "./client";

export interface InterviewRecruiter {
  id: string;
  email: string;
}

export interface Interview {
  id: string;
  application_id: string;
  recruiter_id: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  meeting_url: string | null;
  notes: string | null;
  status: "scheduled" | "completed" | "cancelled";
  recruiter: InterviewRecruiter | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewCreate {
  scheduled_at: string;
  duration_minutes?: number;
  meeting_url?: string;
  notes?: string;
  recruiter_id?: string;
  status?: string;
}

export const interviewsApi = {
  list: (applicationId: string) =>
    apiClient.get<Interview[]>(`/interviews/applications/${applicationId}/interviews`),

  create: (applicationId: string, data: InterviewCreate) =>
    apiClient.post<Interview>(`/interviews/applications/${applicationId}/interviews`, data),

  update: (interviewId: string, data: Partial<InterviewCreate>) =>
    apiClient.patch<Interview>(`/interviews/interviews/${interviewId}`, data),

  delete: (interviewId: string) =>
    apiClient.delete(`/interviews/interviews/${interviewId}`),
};
