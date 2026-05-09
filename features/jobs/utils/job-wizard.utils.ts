import type { JobPayload } from "@/services/api/jobs";
import type { WizardFormData } from "../types/job-wizard.types";

export function emptyWizardForm(): WizardFormData {
  return {
    title: "",
    department: "",
    location: "",
    seniority: "",
    work_mode: "",
    contract_type: "",
    remote_constraints: "",
    role_summary: "",
    role_purpose: "",
    responsibilities: "",
    team_context: "",
    reporting_to: "",
    domain_context: "",
    must_haves: "",
    nice_to_haves: "",
    tech_stack: "",
    experience_min_years: "",
    experience_max_years: "",
    success_profile: "",
    salary_min: "",
    salary_max: "",
    salary_currency: "PLN",
    salary_period: "",
    value_proposition: "",
    benefits: "",
    hiring_process: "",
  };
}

export function wizardFormToPayload(form: WizardFormData): JobPayload {
  return {
    title: form.title,
    department: form.department || null,
    location: form.location || null,
    seniority: form.seniority || null,
    work_mode: form.work_mode || null,
    contract_type: form.contract_type || null,
    remote_constraints: form.remote_constraints || null,
    role_summary: form.role_summary || null,
    role_purpose: form.role_purpose || null,
    responsibilities: form.responsibilities || null,
    team_context: form.team_context || null,
    reporting_to: form.reporting_to || null,
    domain_context: form.domain_context || null,
    must_haves: form.must_haves || null,
    nice_to_haves: form.nice_to_haves || null,
    tech_stack: form.tech_stack || null,
    experience_min_years: form.experience_min_years ? Number(form.experience_min_years) : null,
    experience_max_years: form.experience_max_years ? Number(form.experience_max_years) : null,
    success_profile: form.success_profile || null,
    salary_min: form.salary_min ? Number(form.salary_min) : null,
    salary_max: form.salary_max ? Number(form.salary_max) : null,
    salary_currency: form.salary_currency || null,
    salary_period: form.salary_period || null,
    value_proposition: form.value_proposition || null,
    benefits: form.benefits || null,
    hiring_process: form.hiring_process || null,
  };
}
