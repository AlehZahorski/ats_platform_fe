"use client";

import { useTranslations } from "next-intl";
import type { ContractType, SalaryPeriod, WorkMode } from "@/types";
import type { JobEditorState } from "../../../types/job-editor.types";

interface CompensationSectionProps {
  state: JobEditorState;
  patch: (changes: Partial<JobEditorState>) => void;
}

const PERIODS: SalaryPeriod[] = ["hour", "month", "year"];
const WORK_MODES: WorkMode[] = ["remote", "hybrid", "onsite"];
const CONTRACT_TYPES: ContractType[] = ["employment", "b2b", "contract", "internship", "temporary"];
const CURRENCIES = ["PLN", "EUR", "USD", "GBP"];

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-ring";

function numberOrNull(value: string): number | null {
  if (value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function CompensationSection({ state, patch }: CompensationSectionProps) {
  const t = useTranslations("jobs");

  return (
    <div className="space-y-6">
      {/* Salary row */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-3">{t("wizard.salary")}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1.5">{t("wizard.salaryFrom")}</label>
            <input
              type="number"
              min={0}
              value={state.salary_min ?? ""}
              onChange={(e) => patch({ salary_min: numberOrNull(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1.5">{t("wizard.salaryTo")}</label>
            <input
              type="number"
              min={0}
              value={state.salary_max ?? ""}
              onChange={(e) => patch({ salary_max: numberOrNull(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1.5">{t("editor.compensation.currencyLabel")}</label>
            <select
              value={state.salary_currency}
              onChange={(e) => patch({ salary_currency: e.target.value })}
              className={inputClass}
            >
              <option value="">—</option>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1.5">{t("wizard.period")}</label>
            <select
              value={state.salary_period ?? ""}
              onChange={(e) => patch({ salary_period: (e.target.value || null) as SalaryPeriod | null })}
              className={inputClass}
            >
              <option value="">—</option>
              {PERIODS.map((p) => (
                <option key={p} value={p}>{t(`options.salaryPeriod.${p}` as never)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Work mode + contract type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("editor.compensation.workModeLabel")}
          </label>
          <select
            value={state.work_mode ?? ""}
            onChange={(e) => patch({ work_mode: (e.target.value || null) as WorkMode | null })}
            className={inputClass}
          >
            <option value="">—</option>
            {WORK_MODES.map((w) => (
              <option key={w} value={w}>{t(`options.workMode.${w}` as never)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("editor.compensation.contractTypeLabel")}
          </label>
          <select
            value={state.contract_type ?? ""}
            onChange={(e) => patch({ contract_type: (e.target.value || null) as ContractType | null })}
            className={inputClass}
          >
            <option value="">—</option>
            {CONTRACT_TYPES.map((c) => (
              <option key={c} value={c}>{t(`options.contractType.${c}` as never)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Benefits + Hiring process */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("editor.compensation.benefitsLabel")}
          </label>
          <textarea
            value={state.benefits}
            onChange={(e) => patch({ benefits: e.target.value })}
            rows={5}
            placeholder={t("editor.compensation.benefitsPlaceholder")}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("editor.compensation.hiringProcessLabel")}
          </label>
          <textarea
            value={state.hiring_process}
            onChange={(e) => patch({ hiring_process: e.target.value })}
            rows={5}
            placeholder={t("editor.compensation.hiringProcessPlaceholder")}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}
