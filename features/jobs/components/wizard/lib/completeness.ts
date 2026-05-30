import type { JobEditorState } from "../../../types/job-editor.types";

export type SectionStatus = "empty" | "needs-attention" | "complete";

// Section status is derived directly from per-section progress so the stepper
// badge ("Kompletne"/"Wymaga uwagi") can never disagree with the publish
// checklist — a section is only "complete" when every required field it owns
// is filled.
function statusFromProgress(progress: number): SectionStatus {
  if (progress >= 100) return "complete";
  if (progress <= 0) return "empty";
  return "needs-attention";
}

export function podstawyStatus(state: JobEditorState): SectionStatus {
  return statusFromProgress(podstawyProgress(state).progress);
}

export function zakresRoliStatus(state: JobEditorState): SectionStatus {
  return statusFromProgress(zakresRoliProgress(state).progress);
}

export function wymaganiaStatus(state: JobEditorState): SectionStatus {
  return statusFromProgress(wymaganiaProgress(state).progress);
}

export function widelkiStatus(state: JobEditorState): SectionStatus {
  return statusFromProgress(widelkiProgress(state).progress);
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
    { ok: !!state.seniority,                      label: "Poziom stanowiska" },
  ];
  const passed = checks.filter((c) => c.ok).length;
  return { progress: ratio(passed, checks.length), missing: checks.filter((c) => !c.ok).map((c) => c.label) };
}

export function zakresRoliProgress(state: JobEditorState): ProgressResult {
  const missing: string[] = [];
  if (state.role_summary.trim().length < 50) missing.push("Opis roli (min. 50 znaków)");
  if (state.role_purpose.trim().length === 0) missing.push("Cel roli");
  if (state.responsibilities.trim().length < 30) missing.push("Obowiązki");
  if (state.team_context.trim().length === 0) missing.push("Kontekst zespołu");
  const total = 4;
  const passed = total - missing.length;
  return { progress: ratio(passed, total), missing };
}

export function wymaganiaProgress(state: JobEditorState): ProgressResult {
  const missing: string[] = [];
  if (state.must_haves.trim().length < 5) missing.push("Wymagane umiejętności");
  if (state.nice_to_haves.trim().length === 0) missing.push("Mile widziane");
  if (state.tech_stack.trim().length === 0) missing.push("Stack / narzędzia");
  const total = 3;
  const passed = total - missing.length;
  return { progress: ratio(passed, total), missing };
}

export function widelkiProgress(state: JobEditorState): ProgressResult {
  const missing: string[] = [];
  const hasFullSalary =
    state.salary_min !== null &&
    state.salary_max !== null &&
    state.salary_currency.trim().length > 0 &&
    !!state.salary_period;
  const undisclosed = state.salary_min === null && state.salary_max === null;
  if (!hasFullSalary && !undisclosed) missing.push("Widełki lub status nieujawnione");
  if (state.benefits.trim().length === 0) missing.push("Benefity");
  if (state.value_proposition.trim().length === 0) missing.push("Propozycja wartości");
  if (state.hiring_process.trim().length === 0) missing.push("Proces rekrutacji");
  const total = 4;
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
