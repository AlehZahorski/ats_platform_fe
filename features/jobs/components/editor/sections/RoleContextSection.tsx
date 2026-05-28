"use client";

import { useTranslations } from "next-intl";
import type { JobEditorState } from "../../../types/job-editor.types";

interface RoleContextSectionProps {
  state: JobEditorState;
  patch: (changes: Partial<JobEditorState>) => void;
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-ring";

function CharCounter({ value, max }: { value: string; max: number }) {
  return (
    <p className="text-[11px] text-muted-foreground mt-1 text-right">
      {value.length}/{max}
    </p>
  );
}

export function RoleContextSection({ state, patch }: RoleContextSectionProps) {
  const t = useTranslations("jobs");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          {t("editor.context.purposeLabel")}
        </label>
        <p className="text-[11px] text-muted-foreground mb-2">
          {t("editor.context.purposeDesc")}
        </p>
        <textarea
          value={state.role_purpose}
          onChange={(e) => patch({ role_purpose: e.target.value.slice(0, 300) })}
          rows={5}
          maxLength={300}
          placeholder={t("editor.context.purposePlaceholder")}
          className={`${inputClass} resize-none`}
        />
        <CharCounter value={state.role_purpose} max={300} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          {t("editor.context.scopeLabel")}
        </label>
        <p className="text-[11px] text-muted-foreground mb-2">
          {t("editor.context.scopeDesc")}
        </p>
        <textarea
          value={state.role_scope}
          onChange={(e) => patch({ role_scope: e.target.value.slice(0, 300) })}
          rows={5}
          maxLength={300}
          placeholder={t("editor.context.scopePlaceholder")}
          className={`${inputClass} resize-none`}
        />
        <CharCounter value={state.role_scope} max={300} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          {t("editor.context.deliversToLabel")}
        </label>
        <p className="text-[11px] text-muted-foreground mb-2">
          {t("editor.context.deliversToDesc")}
        </p>
        <textarea
          value={state.role_deliverables}
          onChange={(e) => patch({ role_deliverables: e.target.value.slice(0, 200) })}
          rows={5}
          maxLength={200}
          placeholder={t("editor.context.deliversToPlaceholder")}
          className={`${inputClass} resize-none`}
        />
        <CharCounter value={state.role_deliverables} max={200} />
      </div>
    </div>
  );
}
