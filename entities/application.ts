import type { PipelineStage } from "./pipeline";

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

export interface StageHistory {
  id: string;
  stage: PipelineStage;
  changed_at: string;
  changed_by: string | null;
}

export interface Application extends ApplicationListItem {
  phone: string | null;
  public_token: string;
  answers: AnswerRead[];
  stage_history: StageHistory[];
  scores: CandidateScore[];
  candidate_profile: CandidateProfile | null;
  latest_cv_parse_job: CVParseJob | null;
}

export interface Note {
  id: string;
  application_id: string;
  author_id: string | null;
  content: string;
  visible_to_candidate: boolean;
  created_at: string;
}

export interface Tag {
  id: string;
  company_id: string;
  name: string;
  created_at: string;
}

export interface CandidateScore {
  id: string;
  application_id: string;
  recruiter_id: string | null;
  communication: number | null;
  technical: number | null;
  culture_fit: number | null;
  created_at: string;
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

export interface ParsedSkill {
  name: string;
}

export interface ParsedExperience {
  title: string | null;
  company: string | null;
  date_range: string | null;
  description: string | null;
}

export interface ParsedEducation {
  school: string | null;
  degree: string | null;
  date_range: string | null;
  description: string | null;
}

export interface TechnicalSkill {
  name: string;
  level: string | null;
}

export interface LanguageSkill {
  name: string;
  level: string | null;
}

export interface Certification {
  name: string;
  issuer: string | null;
  year: number | null;
}

export interface PersonalitySignals {
  team_player: boolean | null;
  team_player_reason: string | null;
  leadership_indicators: string | null;
  growth_mindset: string | null;
  communication_style: string | null;
}

export interface CandidateProfile {
  id: string;
  application_id: string;
  parser_version: string;
  // v1 fields
  headline: string | null;
  summary: string | null;
  skills: ParsedSkill[];
  experience: ParsedExperience[];
  education: ParsedEducation[];
  parsing_status: string;
  parsing_error: string | null;
  last_parsed_at: string | null;
  // v2 LLM enrichment fields
  personal_summary: string | null;
  executive_summary: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  technical_skills: TechnicalSkill[] | null;
  soft_skills: ParsedSkill[] | null;
  languages: LanguageSkill[] | null;
  certifications: Certification[] | null;
  hobbies: string[] | null;
  volunteering: string[] | null;
  total_experience_years: number | null;
  seniority_estimate: string | null;
  strengths: string[] | null;
  red_flags: string[] | null;
  personality_signals: PersonalitySignals | null;
  culture_fit_notes: string | null;
}

export interface CandidateJobMatch {
  id: string;
  application_id: string;
  job_id: string;
  match_score: number | null;
  fit_score: number | null;
  reasoning: string | null;
  strengths_match: string[] | null;
  gaps: string[] | null;
  recommendation: "top_candidate" | "consider" | "not_a_match" | null;
  llm_model: string | null;
  created_at: string;
}

export interface CVParseJob {
  id: string;
  application_id: string;
  cv_url: string | null;
  status: "queued" | "extracting" | "parsing" | "review_required" | "completed" | "failed";
  error_message: string | null;
  raw_result: Record<string, unknown> | null;
  normalized_result: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string | null;
    headline?: string | null;
    summary?: string | null;
    skills?: ParsedSkill[];
    experience?: ParsedExperience[];
    education?: ParsedEducation[];
  } | null;
  parser_version: string;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

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
