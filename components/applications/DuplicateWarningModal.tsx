"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowRight, Mail, Phone, X } from "lucide-react";
import type { DuplicateCheckMatch } from "@/types";
import { formatDate } from "@/lib/utils";

interface DuplicateWarningModalProps {
  matches: DuplicateCheckMatch[];
  isPending?: boolean;
  onClose: () => void;
  onContinue: () => void;
  onReuse: (match: DuplicateCheckMatch) => void;
}

export function DuplicateWarningModal({
  matches,
  isPending = false,
  onClose,
  onContinue,
  onReuse,
}: DuplicateWarningModalProps) {
  const t = useTranslations("apply.duplicateModal");
  const tc = useTranslations("common");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-in">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{t("title")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto p-5">
          {matches.map((match) => (
            <div key={match.application_id} className="rounded-xl border border-border bg-background/60 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{match.candidate_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {match.job_title ?? t("unknownJob")} • {t("createdAt", { date: formatDate(match.created_at) })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {match.email}
                    </span>
                    {match.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {match.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {match.match_reasons.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {t(`reasons.${reason}` as "reasons.email" | "reasons.phone")}
                      </span>
                    ))}
                    {match.stage_name && (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {t("stage", { stage: match.stage_name })}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onReuse(match)}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("reuse")}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-5 sm:flex-row">
          <button
            type="button"
            onClick={onContinue}
            disabled={isPending}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? tc("saving") : t("continue")}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tc("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
