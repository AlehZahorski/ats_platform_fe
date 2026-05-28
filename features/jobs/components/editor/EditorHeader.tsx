"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, ChevronRight, Eye, LoaderCircle } from "lucide-react";
import { ROUTES } from "@/config/routes";
import type { JobStatus } from "@/types";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  title: string;
  status: JobStatus;
  lastSavedAt: Date | null;
  isSaving: boolean;
  hasChanges: boolean;
  onPreview: () => void;
}

const STATUS_CLASSES: Record<JobStatus, string> = {
  draft:  "bg-muted text-muted-foreground border-border",
  open:   "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  closed: "bg-muted text-muted-foreground border-border",
};

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function EditorHeader({
  title,
  status,
  lastSavedAt,
  isSaving,
  hasChanges,
  onPreview,
}: EditorHeaderProps) {
  const t = useTranslations("jobs");

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm min-w-0">
          <Link href={ROUTES.jobs} className="text-muted-foreground hover:text-foreground transition-colors">
            {t("title")}
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          <span className="text-foreground font-medium truncate">
            {title || t("editor.untitledJob")}
          </span>
          <span
            className={cn(
              "ml-2 px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0",
              STATUS_CLASSES[status],
            )}
          >
            {t(`status.${status}` as never)}
          </span>
        </div>

        {/* Preview + autosave indicator */}
        <div className="flex items-center gap-3 text-xs shrink-0">
          <button
            type="button"
            onClick={onPreview}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-foreground text-xs font-medium hover:bg-muted transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            {t("preview.button")}
          </button>
          <span className="w-px h-4 bg-border" />
          {isSaving ? (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
              {t("editor.saving")}
            </span>
          ) : hasChanges ? (
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {t("editor.unsavedChanges")}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
              <Check className="w-3.5 h-3.5" />
              {t("editor.autosaveOn")}
            </span>
          )}
          {lastSavedAt && (
            <span className="text-muted-foreground">
              {t("editor.lastSaved", { time: formatTime(lastSavedAt) })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
