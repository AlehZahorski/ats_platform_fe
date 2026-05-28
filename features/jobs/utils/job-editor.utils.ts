import type { Job } from "@/types";
import type { JobPayload } from "@/services/api/jobs";
import type { JobEditorState } from "../types/job-editor.types";

/** Returns a fresh, blank editor state (used in create mode). */
export function emptyState(): JobEditorState {
  return {
    title: "",
    slug: "",
    department: "",
    location: "",
    status: "draft",
    category: "",
    shift_system: "",
    employment_size: "",
    required_qualifications: [],
    role_summary: "",
    role_purpose: "",
    role_scope: "",
    role_deliverables: "",
    responsibilities: "",
    must_haves: "",
    nice_to_haves: "",
    tech_stack: "",
    domain_context: "",
    seniority: null,
    experience_min_years: null,
    experience_max_years: null,
    work_mode: null,
    remote_constraints: "",
    contract_type: null,
    salary_min: null,
    salary_max: null,
    salary_currency: "",
    salary_period: null,
    success_profile: "",
    team_context: "",
    reporting_to: "",
    value_proposition: "",
    benefits: "",
    hiring_process: "",
  };
}

/** Converts a loaded Job (with possible null strings) into editor state. */
export function jobToState(job: Job): JobEditorState {
  return {
    title: job.title ?? "",
    slug: (job as { slug?: string | null }).slug ?? "",
    department: job.department ?? "",
    location: job.location ?? "",
    status: job.status,
    category: (job as { category?: string | null }).category ?? "",
    shift_system: (job as { shift_system?: string | null }).shift_system ?? "",
    employment_size: (job as { employment_size?: string | null }).employment_size ?? "",
    required_qualifications: (job as { required_qualifications?: string[] }).required_qualifications ?? [],
    role_summary: job.role_summary ?? "",
    role_purpose: job.role_purpose ?? "",
    role_scope: job.role_scope ?? "",
    role_deliverables: job.role_deliverables ?? "",
    responsibilities: job.responsibilities ?? "",
    must_haves: job.must_haves ?? "",
    nice_to_haves: job.nice_to_haves ?? "",
    tech_stack: job.tech_stack ?? "",
    domain_context: job.domain_context ?? "",
    seniority: job.seniority,
    experience_min_years: job.experience_min_years,
    experience_max_years: job.experience_max_years,
    work_mode: job.work_mode,
    remote_constraints: job.remote_constraints ?? "",
    contract_type: job.contract_type,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_currency: job.salary_currency ?? "",
    salary_period: job.salary_period,
    success_profile: job.success_profile ?? "",
    team_context: job.team_context ?? "",
    reporting_to: job.reporting_to ?? "",
    value_proposition: job.value_proposition ?? "",
    benefits: job.benefits ?? "",
    hiring_process: job.hiring_process ?? "",
  };
}

// ── HTML list <-> tags conversion ────────────────────────────────────────
// Backend stores must_haves / nice_to_haves / tech_stack as HTML <ul><li>.
// The editor displays them as chips, so we round-trip through these helpers.

const HTML_ESCAPE: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

export function htmlListToTags(html: string | null | undefined): string[] {
  if (!html) return [];
  const matches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (!matches) {
    // Fallback: split plain text by newlines (legacy / hand-edited content)
    return html
      .split(/\r?\n/)
      .map((s) => s.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean);
  }
  return matches
    .map((li) =>
      li
        .replace(/<li[^>]*>|<\/li>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim(),
    )
    .filter(Boolean);
}

export function tagsToHtmlList(tags: string[]): string {
  if (tags.length === 0) return "";
  const items = tags
    .map((t) => `<li>${t.replace(/[&<>]/g, (c) => HTML_ESCAPE[c])}</li>`)
    .join("");
  return `<ul>${items}</ul>`;
}

/** Converts editor state to an API payload — empty strings become null. */
export function stateToPayload(state: JobEditorState): JobPayload {
  const orNull = (v: string) => (v.trim() ? v : null);
  return {
    title: state.title,
    slug: orNull(state.slug),
    department: orNull(state.department),
    location: orNull(state.location),
    status: state.status,
    category: orNull(state.category),
    shift_system: orNull(state.shift_system),
    employment_size: orNull(state.employment_size),
    required_qualifications: state.required_qualifications,
    role_summary: orNull(state.role_summary),
    role_purpose: orNull(state.role_purpose),
    role_scope: orNull(state.role_scope),
    role_deliverables: orNull(state.role_deliverables),
    responsibilities: orNull(state.responsibilities),
    must_haves: orNull(state.must_haves),
    nice_to_haves: orNull(state.nice_to_haves),
    tech_stack: orNull(state.tech_stack),
    domain_context: orNull(state.domain_context),
    seniority: state.seniority,
    experience_min_years: state.experience_min_years,
    experience_max_years: state.experience_max_years,
    work_mode: state.work_mode,
    remote_constraints: orNull(state.remote_constraints),
    contract_type: state.contract_type,
    salary_min: state.salary_min,
    salary_max: state.salary_max,
    salary_currency: orNull(state.salary_currency),
    salary_period: state.salary_period,
    success_profile: orNull(state.success_profile),
    team_context: orNull(state.team_context),
    reporting_to: orNull(state.reporting_to),
    value_proposition: orNull(state.value_proposition),
    benefits: orNull(state.benefits),
    hiring_process: orNull(state.hiring_process),
  };
}
