"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bookmark, Filter, Search, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JobBoardFilters } from "./lib/filters";
import { toggleArr, isFilterActive } from "./lib/filters";
import { useCandidateMe, candidateKeys } from "@/services/queries/jobBoard.queries";
import { candidatesApi } from "@/services/api/jobBoard";
import { ROUTES } from "@/config/routes";
import { CategoryFilter } from "./CategoryFilter";

interface Props {
  filters: JobBoardFilters;
  onChange: (next: JobBoardFilters) => void;
}

// All option lists — kept in one place so the sidebar order matches the
// per-category config used in the job wizard.
const WORK_MODES = ["office", "hybrid", "remote", "mobile", "field"];

const CONTRACT_TYPES = ["employment", "b2b", "contract", "internship", "temporary"];

const EMPLOYMENT_SIZES = [
  { value: "full", label: "Pełny etat" },
  { value: "part_75", label: "3/4 etatu" },
  { value: "part_50", label: "1/2 etatu" },
  { value: "temporary", label: "Praca dorywcza" },
  { value: "internship", label: "Praktyki" },
  { value: "apprenticeship", label: "Staż" },
];

const SHIFT_SYSTEMS = [
  { value: "one_shift", label: "Jednozmianowy" },
  { value: "two_shift", label: "Dwuzmianowy" },
  { value: "three_shift", label: "Trzyzmianowy" },
  { value: "weekend", label: "Weekendowy" },
  { value: "equivalent", label: "Równoważny" },
];

// Seniority is split into ladders that match real industries — IT lists
// differ from corporate which differ from production. Showing them grouped
// helps candidates pick the right scale for their target sector.
const SENIORITY_LADDERS: { label: string; values: string[] }[] = [
  { label: "IT / Tech",          values: ["intern", "junior", "mid", "senior", "expert", "lead"] },
  { label: "Korporacja / Biuro", values: ["specialist", "senior_specialist", "coordinator", "manager", "director", "executive"] },
  { label: "Produkcja",          values: ["operator", "team_leader", "foreman", "production_manager"] },
  { label: "Medycyna",           values: ["resident", "attending", "consultant", "head_of_department"] },
  { label: "Edukacja akademicka", values: ["assistant", "lecturer", "professor"] },
  { label: "Praca fizyczna",     values: ["helper", "worker"] },
];

// Most-used qualifications across our 290 categories. Shown as a flat checkbox
// list — small enough that an accordion would be over-engineered.
const POPULAR_QUALIFICATIONS: { value: string; label: string }[] = [
  { value: "forklift_udt", label: "Wózki widłowe (UDT)" },
  { value: "sep_g1", label: "SEP G1 (elektryczne)" },
  { value: "sep_g2", label: "SEP G2 (cieplne)" },
  { value: "sep_g3", label: "SEP G3 (gazowe)" },
  { value: "driving_b", label: "Prawo jazdy B" },
  { value: "driving_c", label: "Prawo jazdy C" },
  { value: "driving_ce", label: "Prawo jazdy C+E" },
  { value: "driving_d", label: "Prawo jazdy D" },
  { value: "health_card", label: "Książeczka sanepidowska" },
  { value: "haccp", label: "HACCP" },
  { value: "bhp", label: "Szkolenie BHP" },
  { value: "first_aid", label: "Pierwsza pomoc" },
  { value: "security_license", label: "Licencja ochrony" },
  { value: "construction_license", label: "Uprawnienia budowlane" },
  { value: "medical_license", label: "PWZ (medyczne)" },
  { value: "teaching_credential", label: "Kwalifikacje pedagogiczne" },
  { value: "language_cert", label: "Certyfikat językowy" },
  { value: "aws_cert", label: "AWS certification" },
  { value: "azure_cert", label: "Microsoft Azure" },
  { value: "gcp_cert", label: "Google Cloud" },
  { value: "scrum_cert", label: "Scrum (PSM/CSM)" },
  { value: "pmp", label: "PMP / Prince2" },
];

export function FilterSidebar({ filters, onChange }: Props) {
  const tWork = useTranslations("jobs.workMode");
  const tSen = useTranslations("jobs.seniority");
  const tContract = useTranslations("apply.jobBoard.values.contractType");
  const { data: candidate } = useCandidateMe();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [showAllQuals, setShowAllQuals] = useState(false);

  const handleSaveSearch = async () => {
    if (!isFilterActive(filters)) {
      toast.info("Najpierw zastosuj filtry, żeby zapisać wyszukiwanie");
      return;
    }
    const name = window.prompt("Nazwa wyszukiwania", buildDefaultName(filters));
    if (!name) return;
    setSaving(true);
    try {
      await candidatesApi.createSavedSearch({
        name,
        query: filters as unknown as Record<string, unknown>,
        notify_email: true,
      });
      qc.invalidateQueries({ queryKey: candidateKeys.savedSearches });
      toast.success("Wyszukiwanie zapisane");
    } catch {
      toast.error("Nie udało się zapisać wyszukiwania");
    } finally {
      setSaving(false);
    }
  };

  const visibleQuals = showAllQuals ? POPULAR_QUALIFICATIONS : POPULAR_QUALIFICATIONS.slice(0, 8);

  return (
    <aside className="space-y-5 pr-2">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filtry
        </h2>
        {isFilterActive(filters) && (
          <button
            type="button"
            onClick={() => onChange({ sort: filters.sort, tab: filters.tab })}
            className="text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            Wyczyść wszystko
          </button>
        )}
      </div>

      {/* Keywords */}
      <div>
        <label className="block text-xs font-semibold mb-1.5">Słowa kluczowe / stanowisko</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={filters.q ?? ""}
            onChange={(e) => onChange({ ...filters, q: e.target.value || undefined })}
            placeholder="np. Backend, Pielęgniarka, Spawacz…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>
      </div>

      {/* Category — groups accordion + specialization checkboxes */}
      <CategoryFilter
        selected={filters.category}
        onChange={(next) => onChange({ ...filters, category: next })}
      />

      {/* Location with popular-city quick chips */}
      <div>
        <label className="block text-xs font-semibold mb-1.5">Lokalizacja</label>
        <input
          value={filters.location ?? ""}
          onChange={(e) => onChange({ ...filters, location: e.target.value || undefined })}
          placeholder="Miasto, kraj lub region"
          className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
        />
        <div className="flex flex-wrap gap-1 mt-2">
          {["Warszawa", "Kraków", "Wrocław", "Poznań", "Remote"].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onChange({ ...filters, location: city })}
              className={cn(
                "px-2 py-0.5 rounded-full border text-xs",
                filters.location === city
                  ? "border-amber-400 bg-amber-400/10 text-amber-400"
                  : "border-border text-muted-foreground hover:bg-accent/40"
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Work mode */}
      <ChipGroup
        label="Tryb pracy"
        options={WORK_MODES.map((v) => ({ value: v, label: tWork(v as never) }))}
        selected={filters.work_mode}
        onToggle={(value) => onChange({ ...filters, work_mode: toggleArr(filters.work_mode, value) })}
      />

      {/* Contract type */}
      <ChipGroup
        label="Typ współpracy"
        options={CONTRACT_TYPES.map((v) => ({ value: v, label: tContract(v as never) }))}
        selected={filters.contract_type}
        onToggle={(value) => onChange({ ...filters, contract_type: toggleArr(filters.contract_type, value) })}
      />

      {/* Employment size */}
      <ChipGroup
        label="Wymiar etatu"
        options={EMPLOYMENT_SIZES}
        selected={filters.employment_size}
        onToggle={(value) => onChange({ ...filters, employment_size: toggleArr(filters.employment_size, value) })}
      />

      {/* Seniority — grouped */}
      <div>
        <div className="text-xs font-semibold mb-2">Poziom stanowiska</div>
        <div className="space-y-2.5">
          {SENIORITY_LADDERS.map((ladder) => (
            <div key={ladder.label}>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                {ladder.label}
              </div>
              <div className="flex flex-wrap gap-1">
                {ladder.values.map((v) => {
                  const checked = filters.seniority?.includes(v) ?? false;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => onChange({ ...filters, seniority: toggleArr(filters.seniority, v) })}
                      className={cn(
                        "px-2 py-1 rounded-full border text-xs transition-colors",
                        checked
                          ? "border-amber-400 bg-amber-400/10 text-amber-400"
                          : "border-border text-muted-foreground hover:bg-accent/40"
                      )}
                    >
                      {tSen(v as never)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift system */}
      <ChipGroup
        label="System pracy zmianowej"
        options={SHIFT_SYSTEMS}
        selected={filters.shift_system}
        onToggle={(value) => onChange({ ...filters, shift_system: toggleArr(filters.shift_system, value) })}
      />

      {/* Qualifications */}
      <div>
        <div className="text-xs font-semibold mb-2">Uprawnienia i certyfikaty</div>
        <div className="space-y-1">
          {visibleQuals.map((q) => {
            const checked = filters.qualification?.includes(q.value) ?? false;
            return (
              <label
                key={q.value}
                className={cn(
                  "flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm",
                  checked ? "bg-amber-400/10 text-foreground" : "hover:bg-accent/40"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onChange({ ...filters, qualification: toggleArr(filters.qualification, q.value) })}
                  className="w-3.5 h-3.5 rounded border-border accent-amber-400"
                />
                <span>{q.label}</span>
              </label>
            );
          })}
        </div>
        {POPULAR_QUALIFICATIONS.length > 8 && (
          <button
            type="button"
            onClick={() => setShowAllQuals((s) => !s)}
            className="mt-1 text-xs text-amber-400 hover:text-amber-300"
          >
            {showAllQuals ? "Zwiń" : `Pokaż więcej (${POPULAR_QUALIFICATIONS.length - 8})`}
          </button>
        )}
      </div>

      {/* Salary range */}
      <SalaryRange
        min={filters.salary_min}
        max={filters.salary_max}
        onChange={(min, max) => onChange({ ...filters, salary_min: min, salary_max: max })}
      />

      {/* Verified-only toggle */}
      <label className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card cursor-pointer hover:bg-accent/40">
        <input
          type="checkbox"
          checked={!!filters.verified_only}
          onChange={(e) => onChange({ ...filters, verified_only: e.target.checked || undefined })}
          className="w-4 h-4 rounded border-border accent-amber-400"
        />
        <ShieldCheck className="w-4 h-4 text-amber-400" />
        <span className="text-sm flex-1">Tylko zweryfikowane firmy</span>
      </label>

      {/* Saved search CTA */}
      <div className="pt-4 border-t border-border/40">
        {candidate ? (
          <button
            type="button"
            onClick={handleSaveSearch}
            disabled={saving || !isFilterActive(filters)}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors",
              isFilterActive(filters)
                ? "border-amber-400/40 bg-amber-400/5 text-amber-400 hover:bg-amber-400/10"
                : "border-border text-muted-foreground cursor-not-allowed"
            )}
          >
            <Bookmark className="w-4 h-4" />
            Zapisz to wyszukiwanie
          </button>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Link href={ROUTES.candidate.login} className="text-amber-400 hover:text-amber-300 font-medium">
              Zaloguj się
            </Link>
            , żeby zapisywać wyszukiwania i dostawać powiadomienia o nowych ofertach.
          </div>
        )}
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function buildDefaultName(f: JobBoardFilters): string {
  const parts: string[] = [];
  if (f.q) parts.push(f.q);
  if (f.location) parts.push(f.location);
  if (f.seniority?.[0]) parts.push(f.seniority[0]);
  return parts.join(" · ") || "Moje wyszukiwanie";
}

function ChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string[] | undefined;
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <div className="text-xs font-semibold mb-2">{label}</div>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const checked = selected?.includes(opt.value) ?? false;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={cn(
                "px-2.5 py-1 rounded-full border text-xs transition-colors",
                checked
                  ? "border-amber-400 bg-amber-400/10 text-amber-400"
                  : "border-border text-muted-foreground hover:bg-accent/40"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SalaryRange({
  min,
  max,
  onChange,
}: {
  min: number | undefined;
  max: number | undefined;
  onChange: (min: number | undefined, max: number | undefined) => void;
}) {
  const ABS_MIN = 0;
  const ABS_MAX = 50000;
  const STEP = 500;

  return (
    <div>
      <label className="block text-xs font-semibold mb-2">Wynagrodzenie (PLN / mies.)</label>
      <div className="px-1">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input
            type="number"
            min={0}
            placeholder="Od"
            value={min ?? ""}
            onChange={(e) =>
              onChange(e.target.value === "" ? undefined : Number(e.target.value), max)
            }
            className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
          <input
            type="number"
            min={0}
            placeholder="Do"
            value={max ?? ""}
            onChange={(e) =>
              onChange(min, e.target.value === "" ? undefined : Number(e.target.value))
            }
            className="px-2.5 py-1.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>
        {/* Dual range sliders. They sit at the same position visually so the user
            sees two thumbs. The lower-bound slider stops at the upper-bound value
            and vice-versa, so they can't cross. */}
        <div className="relative h-6">
          <input
            type="range"
            min={ABS_MIN}
            max={ABS_MAX}
            step={STEP}
            value={min ?? ABS_MIN}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), max ?? ABS_MAX);
              onChange(v === ABS_MIN ? undefined : v, max);
            }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full accent-amber-400"
          />
          <input
            type="range"
            min={ABS_MIN}
            max={ABS_MAX}
            step={STEP}
            value={max ?? ABS_MAX}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), min ?? ABS_MIN);
              onChange(min, v === ABS_MAX ? undefined : v);
            }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full accent-amber-400"
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>{(min ?? ABS_MIN).toLocaleString("pl-PL")} zł</span>
          <span>
            {max !== undefined
              ? `${max.toLocaleString("pl-PL")} zł`
              : `${ABS_MAX.toLocaleString("pl-PL")} zł +`}
          </span>
        </div>
      </div>
    </div>
  );
}
