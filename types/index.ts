// ─── Auth ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  company_id: string;
  email: string;
  role: "owner" | "recruiter" | "manager";
  is_verified: boolean;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  created_at: string;
}

// ─── Jobs ────────────────────────────────────────────────────────────────────
export type JobStatus = "draft" | "open" | "closed";
export type WorkMode = "remote" | "hybrid" | "onsite";
export type SalaryPeriod = "hour" | "month" | "year";
export type ContractType = "b2b" | "employment" | "contract" | "internship" | "temporary";
export type Seniority = "junior" | "mid" | "senior" | "lead";

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  department: string | null;
  location: string | null;
  status: JobStatus;
  role_summary: string | null;
  role_purpose: string | null;
  responsibilities: string[];
  must_haves: string[];
  nice_to_haves: string[];
  tech_stack: string[];
  domain_context: string | null;
  seniority: Seniority | null;
  experience_min_years: number | null;
  experience_max_years: number | null;
  work_mode: WorkMode | null;
  remote_constraints: string | null;
  success_profile: string | null;
  team_context: string | null;
  reporting_to: string | null;
  value_proposition: string | null;
  benefits: string[];
  hiring_process: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: SalaryPeriod | null;
  contract_type: ContractType | null;
  template_id: string | null;
  publish_ready: boolean;
  publish_issues: string[];
  created_at: string;
}

export interface JobList {
  items: Job[];
  total: number;
}

export interface PublicJobListItem {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  description: string | null;
  role_summary: string | null;
  work_mode: WorkMode | null;
  remote_constraints: string | null;
  contract_type: ContractType | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: SalaryPeriod | null;
  created_at: string;
}

export interface PublicJobList {
  items: PublicJobListItem[];
  total: number;
}

// ─── Pipeline ────────────────────────────────────────────────────────────────
export interface PipelineStage {
  id: string;
  name: string;
  order_index: number;
}

export interface PipelineStageMutation {
  name: string;
}

// ─── Applications ────────────────────────────────────────────────────────────
export interface ApplicationListItem {
  id: string;
  job_id: string;
  first_name: string;
  last_name: string;
  email: string;
  cv_url: string | null;
  stage: PipelineStage | null;
  created_at: string;
}

export interface ApplicationList {
  items: ApplicationListItem[];
  total: number;
}

export interface AnswerRead {
  id: string;
  field_id: string;
  field_label: string | null;
  field_type: string | null;
  value: unknown;
}

export interface Application extends ApplicationListItem {
  phone: string | null;
  public_token: string;
  answers: AnswerRead[];
  stage_history: StageHistory[];
  scores: CandidateScore[];
}

export interface StageHistory {
  id: string;
  stage: PipelineStage;
  changed_at: string;
  changed_by: string | null;
}

// ─── Notes ───────────────────────────────────────────────────────────────────
export interface Note {
  id: string;
  application_id: string;
  author_id: string | null;
  content: string;
  visible_to_candidate: boolean;
  created_at: string;
}

// ─── Tags ────────────────────────────────────────────────────────────────────
export interface Tag {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
}

// ─── Scores ──────────────────────────────────────────────────────────────────
export interface CandidateScore {
  id: string;
  application_id: string;
  recruiter_id: string | null;
  communication: number | null;
  technical: number | null;
  culture_fit: number | null;
  created_at: string;
}

// ─── Forms ───────────────────────────────────────────────────────────────────
export type FieldType =
  | "text" | "textarea" | "number" | "email" | "phone"
  | "select" | "multiselect" | "checkbox" | "file" | "date";

export interface FormField {
  id: string;
  template_id: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  options: string[] | null;
  validation: Record<string, unknown> | null;
  order_index: number;
}

export interface FormTemplate {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
  fields: FormField[];
}

// ─── Tracking ────────────────────────────────────────────────────────────────
export interface ApplicationTracking {
  id: string;
  first_name: string;
  last_name: string;
  stage: PipelineStage | null;
  stage_history: StageHistory[];
  created_at: string;
  job: {
    id: string;
    title: string;
    department: string | null;
    location: string | null;
  } | null;
}

export interface DuplicateCheckMatch {
  application_id: string;
  job_id: string;
  candidate_name: string;
  email: string;
  phone: string | null;
  stage_name: string | null;
  job_title: string | null;
  public_token: string;
  created_at: string;
  match_reasons: string[];
}

export interface DuplicateCheckResponse {
  has_duplicates: boolean;
  confidence: "none" | "high";
  matches: DuplicateCheckMatch[];
}

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
