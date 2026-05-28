export type JobStatus = "draft" | "open" | "closed";
export type WorkMode = "remote" | "hybrid" | "onsite";
export type SalaryPeriod = "hour" | "month" | "year";
export type ContractType = "b2b" | "employment" | "contract" | "internship" | "temporary";
export type Seniority = "junior" | "mid" | "senior" | "lead";

export type RiskSeverity = "low" | "medium" | "high";
export type RiskLevel = "low" | "medium" | "high";
export type MarketPosition = "above_market" | "at_market" | "below_market";

// ── AI-generated, persisted (1:1 with Job) ───────────────────────────────

export interface RiskFactor {
  name: string;
  severity: RiskSeverity;
}

export interface JobAnalysis {
  score: number | null;
  market_position: MarketPosition | null;
  summary: string | null;
  strengths: string[];
  improvements: string[];
  candidate_impact: string | null;
  urgency_message: string | null;
  analyzed_at: string | null;
}

export interface JobRiskAssessment {
  score: number | null;
  level: RiskLevel | null;
  factors: RiskFactor[];
  recommendations: string[];
  assessed_at: string | null;
}

// ── User-entered (1:N with Job) ──────────────────────────────────────────

export interface RiskItem {
  id: string;
  description: string;
  severity: RiskSeverity;
  order: number;
  created_at: string;
}

export interface MitigationAction {
  id: string;
  description: string;
  order: number;
  created_at: string;
}

// ── Job ──────────────────────────────────────────────────────────────────

export interface Job {
  id: string;
  company_id: string;
  title: string;
  department: string | null;
  location: string | null;
  status: JobStatus;

  // Role content
  role_summary: string | null;
  role_purpose: string | null;
  role_scope: string | null;
  role_deliverables: string | null;
  responsibilities: string | null;
  must_haves: string | null;
  nice_to_haves: string | null;
  tech_stack: string | null;
  domain_context: string | null;

  // Experience & work conditions
  seniority: Seniority | null;
  experience_min_years: number | null;
  experience_max_years: number | null;
  work_mode: WorkMode | null;
  remote_constraints: string | null;
  contract_type: ContractType | null;

  // Compensation
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: SalaryPeriod | null;

  // Culture & team
  success_profile: string | null;
  team_context: string | null;
  reporting_to: string | null;
  value_proposition: string | null;
  benefits: string | null;
  hiring_process: string | null;

  // Meta
  created_at: string;
  updated_at: string;
  template_id: string | null;
  publish_ready: boolean;
  publish_issues: string[];
  suggest_used_at: string | null;

  // Nested AI + user-entered
  analysis: JobAnalysis | null;
  risk_assessment: JobRiskAssessment | null;
  risk_items: RiskItem[];
  mitigation_actions: MitigationAction[];
}

export interface JobList {
  items: Job[];
  total: number;
}

// Legacy LLM analyze endpoint response shape (different naming than persisted JobAnalysis).
export interface JobOfferAnalysis {
  attractiveness_score: number;
  market_position: MarketPosition;
  summary: string;
  strengths: string[];
  improvements: string[];
  candidate_impact: string;
  urgency_message: string;
}

export interface JobSuggest {
  role_summary: string | null;
  role_purpose: string | null;
  responsibilities: string | null;
  must_haves: string | null;
  nice_to_haves: string | null;
  tech_stack: string | null;
  team_context: string | null;
  success_profile: string | null;
  value_proposition: string | null;
  benefits: string | null;
  hiring_process: string | null;
}

// ── Public-facing (unauthenticated) ──────────────────────────────────────

export interface PublicJobListItem {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
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

export interface PublicJobDetail {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  role_summary: string | null;
  responsibilities: string | null;
  must_haves: string | null;
  nice_to_haves: string | null;
  tech_stack: string | null;
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
  benefits: string | null;
  hiring_process: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: SalaryPeriod | null;
  contract_type: ContractType | null;
  created_at: string;
  template: import("./forms").FormTemplate | null;
}
