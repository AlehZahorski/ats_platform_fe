"use client";

import { useTranslations } from "next-intl";
import type { JobEditorState } from "../../../types/job-editor.types";

interface SummarySectionProps {
  state: JobEditorState;
  patch: (changes: Partial<JobEditorState>) => void;
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-ring";

export function SummarySection({ state, patch }: SummarySectionProps) {
  const t = useTranslations("jobs");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("editor.summary.valuePropositionLabel")}
          </label>
          <textarea
            value={state.value_proposition}
            onChange={(e) => patch({ value_proposition: e.target.value })}
            rows={4}
            placeholder={t("editor.summary.valuePropositionPlaceholder")}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("editor.summary.successProfileLabel")}
          </label>
          <textarea
            value={state.success_profile}
            onChange={(e) => patch({ success_profile: e.target.value })}
            rows={4}
            placeholder={t("editor.summary.successProfilePlaceholder")}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("editor.summary.teamContextLabel")}
          </label>
          <textarea
            value={state.team_context}
            onChange={(e) => patch({ team_context: e.target.value })}
            rows={3}
            placeholder={t("editor.summary.teamContextPlaceholder")}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("editor.summary.reportingToLabel")}
          </label>
          <input
            value={state.reporting_to}
            onChange={(e) => patch({ reporting_to: e.target.value })}
            placeholder={t("editor.summary.reportingToPlaceholder")}
            className={inputClass}
          />
          <label className="block text-xs font-semibold text-foreground mt-4 mb-1.5">
            {t("editor.summary.domainContextLabel")}
          </label>
          <input
            value={state.domain_context}
            onChange={(e) => patch({ domain_context: e.target.value })}
            placeholder={t("editor.summary.domainContextPlaceholder")}
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
