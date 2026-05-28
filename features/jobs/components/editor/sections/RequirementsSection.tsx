"use client";

import { useTranslations } from "next-intl";
import type { Seniority } from "@/types";
import type { JobEditorState } from "../../../types/job-editor.types";
import { htmlListToTags, tagsToHtmlList } from "../../../utils/job-editor.utils";
import { TagChipsInput } from "../shared/TagChipsInput";

interface RequirementsSectionProps {
  state: JobEditorState;
  patch: (changes: Partial<JobEditorState>) => void;
}

const SENIORITY_OPTIONS: Seniority[] = ["junior", "mid", "senior", "lead"];

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-ring";

function numberOrNull(value: string): number | null {
  if (value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function RequirementsSection({ state, patch }: RequirementsSectionProps) {
  const t = useTranslations("jobs");

  const mustHavesTags = htmlListToTags(state.must_haves);
  const niceToHavesTags = htmlListToTags(state.nice_to_haves);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Critical / nice-to-have tags */}
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-2">
            {t("editor.requirements.mustHavesLabel")}
          </label>
          <TagChipsInput
            tags={mustHavesTags}
            onChange={(next) => patch({ must_haves: tagsToHtmlList(next) })}
            placeholder={t("editor.requirements.mustHavesPlaceholder")}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-2">
            {t("editor.requirements.niceToHavesLabel")}
          </label>
          <TagChipsInput
            tags={niceToHavesTags}
            onChange={(next) => patch({ nice_to_haves: tagsToHtmlList(next) })}
            placeholder={t("editor.requirements.niceToHavesPlaceholder")}
          />
        </div>
      </div>

      {/* Experience */}
      <div className="space-y-4">
        <p className="text-xs font-semibold text-foreground">
          {t("editor.requirements.experienceLabel")}
        </p>

        <div>
          <label className="block text-[11px] text-muted-foreground mb-1.5">
            {t("editor.requirements.seniorityLabel")}
          </label>
          <select
            value={state.seniority ?? ""}
            onChange={(e) => patch({ seniority: (e.target.value || null) as Seniority | null })}
            className={inputClass}
          >
            <option value="">—</option>
            {SENIORITY_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {t(`options.seniority.${s}` as never)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1.5">
              {t("editor.requirements.minYearsLabel")}
            </label>
            <input
              type="number"
              min={0}
              value={state.experience_min_years ?? ""}
              onChange={(e) => patch({ experience_min_years: numberOrNull(e.target.value) })}
              placeholder="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] text-muted-foreground mb-1.5">
              {t("editor.requirements.maxYearsLabel")}
            </label>
            <input
              type="number"
              min={0}
              value={state.experience_max_years ?? ""}
              onChange={(e) => patch({ experience_max_years: numberOrNull(e.target.value) })}
              placeholder="—"
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
