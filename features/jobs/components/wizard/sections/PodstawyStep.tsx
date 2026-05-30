"use client";

import { useTranslations } from "next-intl";
import { Building2, Home, MapPin, Plane, Users } from "lucide-react";
import type { JobEditorState } from "../../../types/job-editor.types";
import type { ContractType, Seniority, WorkMode } from "@/types";
import { ChipGroup } from "../ChipGroup";
import { CategoryCombobox } from "../CategoryCombobox";
import { getCategoryConfig, type SeniorityKey, type WorkMode as WorkModeKey } from "../../../lib/categories";
import { pulseIfEmpty } from "../lib/fieldHighlight";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40";

interface Props {
  state: JobEditorState;
  patch: (changes: Partial<JobEditorState>) => void;
}

const WORK_MODE_ICONS: Record<WorkModeKey, typeof Building2> = {
  office: Building2,
  hybrid: Users,
  remote: Home,
  mobile: MapPin,
  field: Plane,
};

const SHIFT_OPTIONS: { value: string; label_key: string }[] = [
  { value: "one_shift",   label_key: "one_shift" },
  { value: "two_shift",   label_key: "two_shift" },
  { value: "three_shift", label_key: "three_shift" },
  { value: "weekend",     label_key: "weekend" },
  { value: "equivalent",  label_key: "equivalent" },
];

const EMPLOYMENT_SIZE_OPTIONS: { value: string; label_key: string }[] = [
  { value: "full",            label_key: "full" },
  { value: "part_75",         label_key: "part_75" },
  { value: "part_50",         label_key: "part_50" },
  { value: "temporary",       label_key: "temporary" },
  { value: "internship",      label_key: "internship" },
  { value: "apprenticeship",  label_key: "apprenticeship" },
];

const CONTRACTS: { value: ContractType; label: string }[] = [
  { value: "employment", label: "Umowa o pracę" },
  { value: "b2b", label: "B2B" },
  { value: "contract", label: "Umowa zlecenie" },
  { value: "internship", label: "Staż" },
  { value: "temporary", label: "Tymczasowa" },
];

export function PodstawyStep({ state, patch }: Props) {
  const tWork = useTranslations("jobs.workMode");
  const tSen = useTranslations("jobs.seniority");
  const tShift = useTranslations("jobs.shiftSystem");
  const tEmp = useTranslations("jobs.employmentSize");
  const tQual = useTranslations("jobs.qualifications");

  const config = getCategoryConfig(state.category);

  // When category changes, clear values that no longer fit the new config.
  const onCategoryChange = (code: string) => {
    const next = getCategoryConfig(code);
    const changes: Partial<JobEditorState> = { category: code };
    if (next) {
      if (state.work_mode && !next.work_modes.includes(state.work_mode as WorkModeKey)) {
        changes.work_mode = null;
      }
      if (state.seniority && !next.seniority_set.includes(state.seniority as SeniorityKey)) {
        changes.seniority = null;
      }
      if (!next.shows_shift && state.shift_system) {
        changes.shift_system = "";
      }
      // Drop qualifications that are not in the new config
      if (state.required_qualifications.length > 0) {
        changes.required_qualifications = state.required_qualifications.filter((q) =>
          next.qualifications.includes(q as never),
        );
      }
    }
    patch(changes);
  };

  const workModeOptions = (config?.work_modes ?? []).map((m) => ({
    value: m,
    label: tWork(m as never),
    icon: WORK_MODE_ICONS[m],
  }));

  // Seniority is a hard publish requirement, so it must be fillable for EVERY
  // category — including those whose config defines no ladder (e.g. school
  // teachers). Fall back to a generic junior→lead ladder in that case.
  const DEFAULT_SENIORITY: SeniorityKey[] = ["junior", "mid", "senior", "lead"];
  const seniorityLadder = config?.seniority_set?.length ? config.seniority_set : DEFAULT_SENIORITY;
  const seniorityOptions = seniorityLadder.map((s) => ({
    value: s,
    label: tSen(s as never),
  }));

  const qualificationOptions = config?.qualifications ?? [];

  const toggleQual = (q: string) => {
    const has = state.required_qualifications.includes(q);
    patch({
      required_qualifications: has
        ? state.required_qualifications.filter((x) => x !== q)
        : [...state.required_qualifications, q],
    });
  };

  return (
    <div className="space-y-5">
      {/* Row 1: title + category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Stanowisko *</label>
          <input
            value={state.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder="np. Starszy Backend Developer / Pracownik produkcji / Nauczyciel"
            className={`${inputClass}${pulseIfEmpty(!state.title.trim())}`}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Kategoria *</label>
          <CategoryCombobox value={state.category} onChange={onCategoryChange} highlight={!state.category} />
        </div>
      </div>

      {/* Row 2: department + location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Dział</label>
          <input
            value={state.department}
            onChange={(e) => patch({ department: e.target.value })}
            placeholder="np. Dział IT, Linia produkcyjna 3"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Lokalizacja</label>
          <input
            value={state.location}
            onChange={(e) => patch({ location: e.target.value })}
            placeholder="np. Wrocław, Polska"
            className={`${inputClass}${pulseIfEmpty(!state.location.trim() && !state.remote_constraints.trim())}`}
          />
        </div>
      </div>

      {/* If no category yet — show prompt to pick one and bail out */}
      {!config && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Wybierz kategorię, aby zobaczyć właściwe pola dla tego stanowiska.
        </div>
      )}

      {config && (
        <>
          {/* Tryb pracy — chips based on category */}
          {workModeOptions.length > 0 && (
            <div>
              <label className="block text-xs font-semibold mb-1.5">Tryb pracy</label>
              <ChipGroup
                value={state.work_mode}
                options={workModeOptions}
                onChange={(v) => patch({ work_mode: v as WorkMode | null })}
                highlight={!state.work_mode}
              />
            </div>
          )}

          {/* Row 3: contract + employment size */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Rodzaj umowy</label>
              <select
                value={state.contract_type ?? ""}
                onChange={(e) =>
                  patch({ contract_type: (e.target.value || null) as ContractType | null })
                }
                className={`${inputClass}${pulseIfEmpty(!state.contract_type)}`}
              >
                <option value="">Wybierz…</option>
                {CONTRACTS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Wymiar etatu</label>
              <select
                value={state.employment_size}
                onChange={(e) => patch({ employment_size: e.target.value })}
                className={inputClass}
              >
                <option value="">Wybierz…</option>
                {EMPLOYMENT_SIZE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {tEmp(o.label_key as never)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seniority — required for publication; always rendered */}
          {seniorityOptions.length > 0 && (
            <div>
              <label className="block text-xs font-semibold mb-1.5">Poziom stanowiska *</label>
              <ChipGroup
                value={state.seniority}
                options={seniorityOptions}
                onChange={(v) => patch({ seniority: v as Seniority | null })}
                highlight={!state.seniority}
              />
            </div>
          )}

          {/* Shift system — only for relevant categories */}
          {config.shows_shift && (
            <div>
              <label className="block text-xs font-semibold mb-1.5">System pracy</label>
              <ChipGroup
                value={state.shift_system || null}
                options={SHIFT_OPTIONS.map((s) => ({ value: s.value, label: tShift(s.label_key as never) }))}
                onChange={(v) => patch({ shift_system: (v as string) ?? "" })}
              />
            </div>
          )}

          {/* Required qualifications — checkboxes filtered by category config */}
          {qualificationOptions.length > 0 && (
            <div>
              <label className="block text-xs font-semibold mb-2">
                Wymagane uprawnienia i certyfikaty
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {qualificationOptions.map((q) => {
                  const checked = state.required_qualifications.includes(q);
                  return (
                    <label
                      key={q}
                      className="flex items-center gap-2 p-2.5 rounded-md border border-border hover:bg-accent/40 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleQual(q)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span>{tQual(q as never)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function podstawySummary(state: JobEditorState): string {
  const config = getCategoryConfig(state.category);
  const parts = [
    state.title,
    state.location,
    config && `kategoria wybrana`,
    state.contract_type,
    state.employment_size,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Brak danych";
}
