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

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  department: string | null;
  location: string | null;
  status: JobStatus;
  template_id: string | null;
  created_at: string;
}

export interface JobList {
  items: Job[];
  total: number;
}

// ─── Pipeline ────────────────────────────────────────────────────────────────
export interface PipelineStage {
  id: string;
  name: string;
  order_index: number;
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
}