"use client";

import { useEffect } from "react";
import { Lock, AlertCircle } from "lucide-react";
import type { JobEditorState } from "../../../types/job-editor.types";
import type { SalaryPeriod } from "@/types";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40";

interface Props {
  state: JobEditorState;
  patch: (changes: Partial<JobEditorState>) => void;
}

const PERIODS: { value: SalaryPeriod; label: string }[] = [
  { value: "hour", label: "Godzinowo" },
  { value: "month", label: "Miesięcznie" },
  { value: "year", label: "Rocznie" },
];

const CURRENCIES = ["PLN", "EUR", "USD", "GBP", "CHF", "CZK", "SEK", "NOK"];

/**
 * Suggests a sensible default salary period for a given category code.
 * Drivers / hospitality / retail / cleaning → hourly.
 * C-level / executives → yearly.
 * Everyone else → monthly.
 */
function defaultPeriodForCategory(code: string): SalaryPeriod {
  if (code === "fin_cfo") return "year";
  if (
    code.startsWith("log_driver_") ||
    code.startsWith("hsp_") ||
    code.startsWith("ret_") ||
    code.startsWith("cln_") ||
    code.startsWith("bty_") ||
    code.startsWith("sec_") ||
    code === "agr_farm_worker" ||
    code === "mfg_operator" ||
    code === "mfg_assembly" ||
    code === "con_worker"
  ) {
    return "hour";
  }
  return "month";
}

// Salary "undisclosed" is implicit: both min and max are null.
const isUndisclosed = (s: JobEditorState) => s.salary_min === null && s.salary_max === null;

export function WidelkiStep({ state, patch }: Props) {
  // Smart defaults — set period & currency on first render when missing,
  // based on the chosen category. Doesn't override user choice.
  useEffect(() => {
    const changes: Partial<JobEditorState> = {};
    if (!state.salary_period && state.category) {
      changes.salary_period = defaultPeriodForCategory(state.category);
    }
    if (!state.salary_currency) {
      changes.salary_currency = "PLN";
    }
    if (Object.keys(changes).length > 0) {
      patch(changes);
    }
    // run only when category changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.category]);

  const undisclosed = isUndisclosed(state);

  // Validation: min must not exceed max (when both set).
  const rangeInvalid =
    state.salary_min !== null &&
    state.salary_max !== null &&
    state.salary_min > state.salary_max;

  const toggleUndisclosed = (checked: boolean) => {
    if (checked) {
      patch({ salary_min: null, salary_max: null });
    } else {
      patch({ salary_min: 0, salary_max: 0 });
    }
  };

  return (
    <div className="space-y-5">
      {/* Undisclosed toggle */}
      <label className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
        <input
          type="checkbox"
          checked={undisclosed}
          onChange={(e) => toggleUndisclosed(e.target.checked)}
          className="w-4 h-4 rounded border-border"
        />
        <Lock className="w-4 h-4 text-muted-foreground" />
        <div className="flex-1">
          <div className="text-sm font-medium">Widełki nieujawnione</div>
          <div className="text-xs text-muted-foreground">
            Kandydaci zobaczą „Wynagrodzenie do uzgodnienia" zamiast kwoty.
          </div>
        </div>
      </label>

      {/* Salary inputs — only when disclosed */}
      {!undisclosed && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5">Od</label>
              <input
                type="number"
                min={0}
                value={state.salary_min ?? ""}
                onChange={(e) =>
                  patch({ salary_min: e.target.value === "" ? null : Number(e.target.value) })
                }
                className={cn(inputClass, rangeInvalid && "border-rose-500/60 ring-rose-500/20")}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Do</label>
              <input
                type="number"
                min={0}
                value={state.salary_max ?? ""}
                onChange={(e) =>
                  patch({ salary_max: e.target.value === "" ? null : Number(e.target.value) })
                }
                className={cn(inputClass, rangeInvalid && "border-rose-500/60 ring-rose-500/20")}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Waluta</label>
              <select
                value={state.salary_currency || "PLN"}
                onChange={(e) => patch({ salary_currency: e.target.value })}
                className={inputClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5">Okres</label>
              <select
                value={state.salary_period ?? "month"}
                onChange={(e) => patch({ salary_period: e.target.value as SalaryPeriod })}
                className={inputClass}
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {rangeInvalid && (
            <div className="flex items-center gap-2 text-xs text-rose-500">
              <AlertCircle className="w-3.5 h-3.5" />
              Kwota „od" nie może być wyższa niż „do".
            </div>
          )}
        </>
      )}

      {/* Benefits */}
      <div>
        <label className="block text-xs font-semibold mb-1.5">Benefity</label>
        <textarea
          value={state.benefits}
          onChange={(e) => patch({ benefits: e.target.value })}
          rows={5}
          placeholder="Każdy benefit w nowej linii (np. Prywatna opieka medyczna, Karta sportowa…)"
          className={`${inputClass} resize-none`}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Linia = jeden benefit. Pojawia się jako lista z ikonami na ofercie.
        </p>
      </div>
    </div>
  );
}

export function widelkiSummary(state: JobEditorState): string {
  const parts: string[] = [];
  if (isUndisclosed(state)) {
    parts.push("Wynagrodzenie do uzgodnienia");
  } else if (state.salary_min !== null && state.salary_max !== null) {
    const period =
      state.salary_period === "hour" ? "/h"
      : state.salary_period === "year" ? "/rok"
      : "/mies";
    parts.push(
      `${state.salary_min.toLocaleString("pl-PL")}–${state.salary_max.toLocaleString("pl-PL")} ${state.salary_currency || "PLN"}${period}`
    );
  }
  const bens = state.benefits.split(/\n+/).filter((l) => l.trim()).length;
  if (bens > 0) parts.push(`${bens} benefit${bens === 1 ? "" : bens < 5 ? "y" : "ów"}`);
  return parts.join(" · ") || "Brak danych";
}
