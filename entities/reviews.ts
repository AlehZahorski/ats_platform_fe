import type { User } from "./user";

export interface ScorecardCriterion {
  id: string;
  label: string;
  description: string | null;
  order_index: number;
  max_score: number;
}

export interface ScorecardTemplate {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  criteria: ScorecardCriterion[];
  created_at: string;
}

export interface ReviewResponse {
  id: string;
  criterion_id: string;
  score: number;
  comment: string | null;
}

export interface ReviewAssignment {
  id: string;
  application_id: string;
  reviewer_id: string;
  assigned_by: string | null;
  template_id: string;
  status: "pending" | "submitted";
  due_at: string | null;
  submitted_at: string | null;
  overall_comment: string | null;
  recommendation: string | null;
  reviewer: User | null;
  assigner: User | null;
  template: ScorecardTemplate;
  responses: ReviewResponse[];
  created_at: string;
}

export interface ReviewSummary {
  total_assignments: number;
  pending_count: number;
  submitted_count: number;
  average_score: number | null;
}
