import type { Job } from "@/entities/job";
import type { JobFormState } from "../types/job-form.types";

export function textToList(value: string): string[] {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export function toForm(job: Job): JobFormState {
  return {
    title: job.title,
    department: job.department ?? "",
    location: job.location ?? "",
    status: job.status,
    role_summary: job.role_summary ?? "",
    role_purpose: job.role_purpose ?? "",
    responsibilities: job.responsibilities ?? "",
    must_haves: job.must_haves ?? "",
    nice_to_haves: job.nice_to_haves ?? "",
    tech_stack: job.tech_stack ?? "",
    domain_context: job.domain_context ?? "",
    seniority: job.seniority ?? "",
    experience_min_years: job.experience_min_years?.toString() ?? "",
    experience_max_years: job.experience_max_years?.toString() ?? "",
    work_mode: job.work_mode ?? "",
    remote_constraints: job.remote_constraints ?? "",
    success_profile: job.success_profile ?? "",
    team_context: job.team_context ?? "",
    reporting_to: job.reporting_to ?? "",
    value_proposition: job.value_proposition ?? "",
    benefits: job.benefits ?? "",
    hiring_process: job.hiring_process ?? "",
    salary_min: job.salary_min?.toString() ?? "",
    salary_max: job.salary_max?.toString() ?? "",
    salary_currency: job.salary_currency ?? "PLN",
    salary_period: job.salary_period ?? "",
    contract_type: job.contract_type ?? "",
    description: job.description ?? "",
  };
}

export function fromForm(form: JobFormState): Partial<Job> {
  return {
    title: form.title,
    department: form.department || null,
    location: form.location || null,
    status: form.status,
    role_summary: form.role_summary || null,
    role_purpose: form.role_purpose || null,
    responsibilities: form.responsibilities || null,
    must_haves: form.must_haves || null,
    nice_to_haves: form.nice_to_haves || null,
    tech_stack: form.tech_stack || null,
    domain_context: form.domain_context || null,
    seniority: form.seniority || null,
    experience_min_years: form.experience_min_years ? Number(form.experience_min_years) : null,
    experience_max_years: form.experience_max_years ? Number(form.experience_max_years) : null,
    work_mode: form.work_mode || null,
    remote_constraints: form.remote_constraints || null,
    success_profile: form.success_profile || null,
    team_context: form.team_context || null,
    reporting_to: form.reporting_to || null,
    value_proposition: form.value_proposition || null,
    benefits: form.benefits || null,
    hiring_process: form.hiring_process || null,
    salary_min: form.salary_min ? Number(form.salary_min) : null,
    salary_max: form.salary_max ? Number(form.salary_max) : null,
    salary_currency: form.salary_currency || null,
    salary_period: form.salary_period || null,
    contract_type: form.contract_type || null,
    description: form.description || null,
  };
}
