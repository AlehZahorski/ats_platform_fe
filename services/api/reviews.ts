import apiClient from "./client";
import type { ReviewAssignment, ReviewSummary, ScorecardTemplate } from "@/types";

export interface ScorecardTemplateCreatePayload {
  name: string;
  description?: string;
  criteria: Array<{
    label: string;
    description?: string;
    order_index: number;
    max_score: number;
  }>;
}

export interface ReviewAssignmentCreatePayload {
  reviewer_id: string;
  template_id: string;
  due_at?: string;
}

export interface ReviewAssignmentSubmitPayload {
  responses: Array<{
    criterion_id: string;
    score: number;
    comment?: string;
  }>;
  overall_comment?: string;
  recommendation?: string;
}

export const reviewsApi = {
  listTemplates: () => apiClient.get<ScorecardTemplate[]>("/reviews/templates"),
  createTemplate: (data: ScorecardTemplateCreatePayload) => apiClient.post<ScorecardTemplate>("/reviews/templates", data),
  listAssignments: (applicationId: string) =>
    apiClient.get<ReviewAssignment[]>(`/reviews/applications/${applicationId}/assignments`),
  createAssignment: (applicationId: string, data: ReviewAssignmentCreatePayload) =>
    apiClient.post<ReviewAssignment>(`/reviews/applications/${applicationId}/assignments`, data),
  getSummary: (applicationId: string) =>
    apiClient.get<ReviewSummary>(`/reviews/applications/${applicationId}/summary`),
  submitAssignment: (assignmentId: string, data: ReviewAssignmentSubmitPayload) =>
    apiClient.post<ReviewAssignment>(`/reviews/assignments/${assignmentId}/submit`, data),
};
