"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { LoaderCircle, Sparkles } from "lucide-react";
import { useJobSuggest } from "@/services/queries";
import type { JobEditorState } from "../../types/job-editor.types";

interface AiSuggestCardProps {
  jobId: string | null;
  suggestUsedAt: string | null;
  patch: (changes: Partial<JobEditorState>) => void;
}

/**
 * One-click "fill the rest from the title" prompt.
 *
 * Calls `POST /jobs/{id}/suggest` and merges the returned non-empty fields
 * into the editor state. Disabled until the draft is saved (needs jobId).
 */
export function AiSuggestCard({ jobId, suggestUsedAt, patch }: AiSuggestCardProps) {
  const t = useTranslations("jobs");
  const suggest = useJobSuggest();

  // One-time gate — once starters were generated for this job, hide the card entirely.
  if (suggestUsedAt) return null;

  const handleClick = async () => {
    if (!jobId) return;
    try {
      const result = await suggest.mutateAsync(jobId);
      // Apply only non-empty fields — don't overwrite user's manual edits with nulls
      const applied: Partial<JobEditorState> = {};
      const keys = [
        "role_summary", "role_purpose", "responsibilities",
        "must_haves", "nice_to_haves", "tech_stack",
        "team_context", "success_profile",
        "value_proposition", "benefits", "hiring_process",
      ] as const;
      for (const k of keys) {
        const v = result[k];
        if (v) applied[k] = v;
      }
      if (Object.keys(applied).length === 0) {
        toast.error(t("wizard.generateFailed"));
        return;
      }
      patch(applied);
      toast.success(t("wizard.aiFilledStartersHint"));
    } catch {
      toast.error(t("wizard.generateFailed"));
    }
  };

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{t("wizard.aiSuggestTitle")}</p>
        <p className="text-xs text-muted-foreground">{t("wizard.aiSuggestDesc")}</p>
      </div>
      <button
        type="button"
        onClick={handleClick}
        disabled={!jobId || suggest.isPending}
        title={!jobId ? t("wizard.saveFirstHint") : undefined}
        className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all shrink-0"
      >
        {suggest.isPending
          ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
          : <Sparkles className="w-3.5 h-3.5" />}
        {suggest.isPending ? t("wizard.generating") : t("wizard.loadExample")}
      </button>
    </div>
  );
}
