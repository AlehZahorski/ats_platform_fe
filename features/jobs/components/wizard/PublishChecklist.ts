import type { JobEditorState } from "../../types/job-editor.types";
import { getCategoryConfig } from "../../lib/categories";

export interface ChecklistItem {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;        // blocks publish if false
}

/**
 * Builds the list of checks shown in the "Opublikuj ofertę" modal.
 * Required items block publishing — soft warnings are advisory only.
 */
export function buildPublishChecklist(state: JobEditorState): ChecklistItem[] {
  const config = getCategoryConfig(state.category);
  const hasSalary = state.salary_min !== null && state.salary_max !== null;
  const undisclosedSalary = state.salary_min === null && state.salary_max === null;
  const benefitsCount = state.benefits.split(/\n+/).filter((l) => l.trim()).length;

  return [
    {
      id: "title",
      label: "Tytuł stanowiska",
      passed: state.title.trim().length > 0,
      required: true,
    },
    {
      id: "category",
      label: "Kategoria zawodowa",
      passed: !!state.category,
      required: true,
    },
    {
      id: "location",
      label: "Lokalizacja",
      passed: state.location.trim().length > 0,
      required: true,
    },
    {
      id: "work_mode",
      label: "Tryb pracy",
      passed: !!state.work_mode,
      required: (config?.work_modes.length ?? 0) > 1,
    },
    {
      id: "contract_type",
      label: "Rodzaj umowy",
      passed: !!state.contract_type,
      required: true,
    },
    {
      id: "role_summary",
      label: "Opis roli (min. 50 znaków)",
      passed: state.role_summary.trim().length >= 50,
      required: true,
    },
    {
      id: "must_haves",
      label: "Wymagania",
      passed: state.must_haves.trim().length > 0,
      required: true,
    },
    {
      id: "salary",
      label: hasSalary
        ? "Widełki wynagrodzenia"
        : undisclosedSalary
          ? "Status widełek (nieujawnione)"
          : "Widełki wynagrodzenia lub nieujawnione",
      passed: hasSalary || undisclosedSalary,
      required: true,
    },
    {
      id: "benefits",
      label: "Co najmniej 1 benefit (zalecane)",
      passed: benefitsCount >= 1,
      required: false,
    },
  ];
}

export function checklistPasses(items: ChecklistItem[]): boolean {
  return items.filter((i) => i.required).every((i) => i.passed);
}
