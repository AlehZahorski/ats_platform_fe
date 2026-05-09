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
  template_id: string | null;
  publish_ready: boolean;
  publish_issues: string[];
  created_at: string;
}

export interface JobList {
  items: Job[];
  total: number;
}

export interface JobOfferAnalysis {
  attractiveness_score: number;
  market_position: "above_market" | "at_market" | "below_market";
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

export interface PublicJobDetail {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  description: string | null;
  role_summary: string | null;
  role_purpose: string | null;
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
