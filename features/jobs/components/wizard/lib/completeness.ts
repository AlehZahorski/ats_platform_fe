import type { JobEditorState } from "../../../types/job-editor.types";

export type SectionStatus = "empty" | "needs-attention" | "complete";

// Deterministic length thresholds for now. Will be swapped to LLM analysis later.
const WEAK = 5;
const OK = 30;

function textScore(value: string): SectionStatus {
  const len = value.trim().length;
  if (len < WEAK) return "empty";
  if (len < OK) return "needs-attention";
  return "complete";
}

function allPresent(...values: Array<string | number | null | undefined>): boolean {
  return values.every((v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return v.trim().length > 0;
    return true;
  });
}

export function podstawyStatus(state: JobEditorState): SectionStatus {
  // All required dropdowns/strings present → complete; some missing → needs-attention; none → empty.
  const filled = [
    state.title,
    state.location,
    state.work_mode,
    state.contract_type,
    state.seniority,
  ].filter((v) => (typeof v === "string" ? v.trim().length > 0 : v !== null)).length;

  if (filled === 0) return "empty";
  if (filled < 5) return "needs-attention";
  return "complete";
}

export function zakresRoliStatus(state: JobEditorState): SectionStatus {
  const combined = `${state.role_summary} ${state.responsibilities}`.trim();
  return textScore(combined);
}

export function wymaganiaStatus(state: JobEditorState): SectionStatus {
  const combined = `${state.must_haves} ${state.tech_stack}`.trim();
  return textScore(combined);
}

export function widelkiStatus(state: JobEditorState): SectionStatus {
  const hasSalary = state.salary_min !== null && state.salary_max !== null;
  const hasBenefits = state.benefits.trim().length >= WEAK;
  if (!hasSalary && !hasBenefits) return "empty";
  if (hasSalary && hasBenefits) return "complete";
  return "needs-attention";
}

export function publikacjaStatus(state: JobEditorState): SectionStatus {
  // Will pull data from outside (form template link). For now use status field as proxy.
  if (state.status === "open") return "complete";
  if (state.status === "draft") return "needs-attention";
  return "empty";
}

export function statusLabel(status: SectionStatus): string {
  if (status === "complete") return "Kompletne";
  if (status === "needs-attention") return "Wymaga uwagi";
  return "Nie uzupełniono";
}

export function statusBadgeClasses(status: SectionStatus): string {
  if (status === "complete") return "bg-emerald-500/15 text-emerald-500";
  if (status === "needs-attention") return "bg-amber-500/15 text-amber-500";
  return "bg-muted text-muted-foreground";
}

// ─────────────────────────────────────────────────────────────────────
// Per-section progress (0-100) and missing-field list for tooltips.
// Each section tracks a fixed set of required signals; progress is the
// fraction satisfied. Missing-list drives the hover tooltip in stepper.
// ─────────────────────────────────────────────────────────────────────

interface ProgressResult {
  progress: number;
  missing: string[];
}

const ratio = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

export function podstawyProgress(state: JobEditorState): ProgressResult {
  const checks: { ok: boolean; label: string }[] = [
    { ok: state.title.trim().length > 0,        label: "Tytuł stanowiska" },
    { ok: !!state.category,                      label: "Kategoria" },
    { ok: state.location.trim().length > 0,     label: "Lokalizacja" },
    { ok: !!state.work_mode,                     label: "Tryb pracy" },
    { ok: !!state.contract_type,                 label: "Rodzaj umowy" },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return { progress: ratio(passed, checks.length), missing: checks.filter((c) => !c.ok).map((c) => c.label) };
}

export function zakresRoliProgress(state: JobEditorState): ProgressResult {
  const missing: string[] = [];
  const summaryLen = state.role_summary.trim().length;
  const respLen = state.responsibilities.trim().length;
  if (summaryLen < 50) missing.push("Opis roli (min. 50 znaków)");
  if (respLen < 30) missing.push("Obowiązki");
  const total = 2;
  const passed = total - missing.length;
  return { progress: ratio(passed, total), missing };
}

export function wymaganiaProgress(state: JobEditorState): ProgressResult {
  const missing: string[] = [];
  if (state.must_haves.trim().length < 5) missing.push("Wymagania");
  // tech_stack is soft / optional depending on category — don't penalize
  const total = 1;
  const passed = total - missing.length;
  return { progress: ratio(passed, total), missing };
}

export function widelkiProgress(state: JobEditorState): ProgressResult {
  const missing: string[] = [];
  const hasSalary = state.salary_min !== null && state.salary_max !== null;
  const undisclosed = state.salary_min === null && state.salary_max === null;
  const hasBenefits = state.benefits.trim().length > 0;
  if (!hasSalary && !undisclosed) missing.push("Widełki lub status nieujawnione");
  if (!hasBenefits) missing.push("Benefity (zalecane)");
  const total = 2;
  const passed = total - missing.length;
  return { progress: ratio(passed, total), missing };
}

export function publikacjaProgress(state: JobEditorState): ProgressResult {
  const missing: string[] = [];
  if (!state.slug || state.slug.length < 3) missing.push("Adres URL (slug)");
  // status is always set (defaults to draft) — don't penalize
  const total = 1;
  const passed = total - missing.length;
  return { progress: ratio(passed, total), missing };
}
