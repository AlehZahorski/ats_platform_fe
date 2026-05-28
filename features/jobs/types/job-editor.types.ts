import type {
  ContractType,
  JobStatus,
  SalaryPeriod,
  Seniority,
  WorkMode,
} from "@/types";

export type EditorMode = "create" | "edit";

/**
 * Flat form-state shape used by JobEditor.
 *
 * All string fields use empty strings (not null) so that inputs stay
 * controlled. The conversion to the API payload happens in
 * `stateToPayload()`, which converts blanks back to null.
 */
export interface JobEditorState {
  title: string;
  slug: string;            // public URL slug; auto-generated, user can override
  department: string;
  location: string;
  status: JobStatus;

  // Classification (multi-industry, multi-country)
  category: string;            // empty string = not chosen (controlled input)
  shift_system: string;        // "" | "one_shift" | "two_shift" | ...
  employment_size: string;     // "" | "full" | "part_50" | ...
  required_qualifications: string[];

  // Role content
  role_summary: string;
  role_purpose: string;
  role_scope: string;
  role_deliverables: string;
  responsibilities: string;
  must_haves: string;
  nice_to_haves: string;
  tech_stack: string;
  domain_context: string;

  // Experience & work conditions
  seniority: Seniority | null;
  experience_min_years: number | null;
  experience_max_years: number | null;
  work_mode: WorkMode | null;
  remote_constraints: string;
  contract_type: ContractType | null;

  // Compensation
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  salary_period: SalaryPeriod | null;

  // Culture & team
  success_profile: string;
  team_context: string;
  reporting_to: string;
  value_proposition: string;
  benefits: string;
  hiring_process: string;
}
