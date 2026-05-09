import type { ContractType, SalaryPeriod, Seniority, WorkMode } from "@/types";

export type WizardStep = 1 | 2 | 3 | 4 | 5;

export interface WizardFormData {
  // Step 1 — Podstawy
  title: string;
  department: string;
  location: string;
  seniority: Seniority | "";
  work_mode: WorkMode | "";
  contract_type: ContractType | "";
  remote_constraints: string;

  // Step 2 — Opis stanowiska
  role_summary: string;
  role_purpose: string;
  responsibilities: string;
  team_context: string;
  reporting_to: string;
  domain_context: string;

  // Step 3 — Wymagania
  must_haves: string;
  nice_to_haves: string;
  tech_stack: string;
  experience_min_years: string;
  experience_max_years: string;
  success_profile: string;

  // Step 4 — Warunki
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  salary_period: SalaryPeriod | "";
  value_proposition: string;
  benefits: string;
  hiring_process: string;
}

export const WIZARD_STEPS: Record<WizardStep, { label: string; description: string }> = {
  1: { label: "Podstawy",          description: "Tytuł, lokalizacja, tryb pracy" },
  2: { label: "Opis stanowiska",   description: "Rola, zakres, kontekst zespołu" },
  3: { label: "Wymagania",         description: "Umiejętności i doświadczenie" },
  4: { label: "Warunki",           description: "Wynagrodzenie i benefity" },
  5: { label: "Analiza AI",        description: "Ocena atrakcyjności oferty" },
};
