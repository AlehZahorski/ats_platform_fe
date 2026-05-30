import type { JobEditorState } from "../../types/job-editor.types";

export interface ChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;        // blocks publish if false
}

/**
 * Builds the list of checks shown in the "Opublikuj ofertę" modal.
 *
 * IMPORTANT: this list mirrors the backend `PublishValidator`
 * (backend/app/modules/jobs/validators.py) one-to-one. The backend is the
 * source of truth — it rejects a publish with a 422 + issue list — but this
 * preview must agree with it, otherwise the modal shows all-green and then
 * the publish silently fails (the original bug). Keep the two in sync.
 */
export function buildPublishChecklist(state: JobEditorState): ChecklistItem[] {
  const hasText = (v: string) => v.trim().length > 0;
  const hasFullSalary =
    state.salary_min !== null &&
    state.salary_max !== null &&
    hasText(state.salary_currency) &&
    !!state.salary_period;
  // Both bounds null = explicitly undisclosed → valid (matches backend).
  const undisclosedSalary = state.salary_min === null && state.salary_max === null;
  const benefitsCount = state.benefits.split(/\n+/).filter((l) => l.trim()).length;

  return [
    { id: "title", label: "Tytuł stanowiska", passed: hasText(state.title), required: true },
    { id: "category", label: "Kategoria zawodowa", passed: !!state.category, required: true },
    {
      id: "location",
      label: "Lokalizacja lub praca zdalna",
      passed: hasText(state.location) || hasText(state.remote_constraints),
      required: true,
    },
    { id: "work_mode", label: "Tryb pracy", passed: !!state.work_mode, required: true },
    { id: "contract_type", label: "Rodzaj umowy", passed: !!state.contract_type, required: true },
    { id: "seniority", label: "Poziom stanowiska", passed: !!state.seniority, required: true },
    {
      id: "role_summary",
      label: "Opis roli (min. 50 znaków)",
      passed: state.role_summary.trim().length >= 50,
      required: true,
    },
    { id: "role_purpose", label: "Cel roli", passed: hasText(state.role_purpose), required: true },
    {
      id: "responsibilities",
      label: "Obowiązki",
      passed: hasText(state.responsibilities),
      required: true,
    },
    {
      id: "team_context",
      label: "Kontekst zespołu",
      passed: hasText(state.team_context),
      required: true,
    },
    {
      id: "must_haves",
      label: "Wymagane umiejętności",
      passed: hasText(state.must_haves),
      required: true,
    },
    {
      id: "nice_to_haves",
      label: "Mile widziane",
      passed: hasText(state.nice_to_haves),
      required: true,
    },
    {
      id: "tech_stack",
      label: "Stack / narzędzia",
      passed: hasText(state.tech_stack),
      required: true,
    },
    {
      id: "salary",
      label: undisclosedSalary ? "Widełki (nieujawnione)" : "Widełki wynagrodzenia",
      passed: hasFullSalary || undisclosedSalary,
      required: true,
    },
    { id: "benefits", label: "Benefity (min. 1)", passed: benefitsCount >= 1, required: true },
    {
      id: "value_proposition",
      label: "Propozycja wartości",
      passed: hasText(state.value_proposition),
      required: true,
    },
    {
      id: "hiring_process",
      label: "Proces rekrutacji",
      passed: hasText(state.hiring_process),
      required: true,
    },
  ];
}

export function checklistPasses(items: ChecklistItem[]): boolean {
  return items.filter((i) => i.required).every((i) => i.passed);
}
