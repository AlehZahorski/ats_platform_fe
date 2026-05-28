"use client";

import { useTranslations } from "next-intl";
import type { JobStatus } from "@/types";
import type { JobEditorState } from "../../../types/job-editor.types";

interface BasicInfoSectionProps {
  state: JobEditorState;
  patch: (changes: Partial<JobEditorState>) => void;
}

const STATUS_OPTIONS: JobStatus[] = ["draft", "open", "closed"];

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-ring";

export function BasicInfoSection({ state, patch }: BasicInfoSectionProps) {
  const t = useTranslations("jobs");

  return (
    <div className="space-y-5">
      {/* Title — always editable, the rest depends on it */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          {t("jobTitle")} *
        </label>
        <input
          value={state.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder={t("form.titlePlaceholder")}
          className={inputClass}
        />
      </div>

      {/* Department / Location / Status row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("department")}
          </label>
          <input
            value={state.department}
            onChange={(e) => patch({ department: e.target.value })}
            placeholder={t("form.departmentPlaceholder")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("location")}
          </label>
          <input
            value={state.location}
            onChange={(e) => patch({ location: e.target.value })}
            placeholder={t("form.locationPlaceholder")}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t("status.label")}
          </label>
          <select
            value={state.status}
            onChange={(e) => patch({ status: e.target.value as JobStatus })}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {t(`status.${s}` as never)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Role description — single field. AI Suggest writes here too. */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          {t("editor.basic.roleSummaryLabel")}
        </label>
        <textarea
          value={state.role_summary}
          onChange={(e) => patch({ role_summary: e.target.value })}
          rows={5}
          placeholder={t("editor.basic.roleSummaryPlaceholder")}
          className={`${inputClass} resize-none`}
        />
      </div>
    </div>
  );
}
