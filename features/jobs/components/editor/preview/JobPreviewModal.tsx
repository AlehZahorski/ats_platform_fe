"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Eye, X } from "lucide-react";
import type { JobEditorState } from "../../../types/job-editor.types";
import { JobOfferPreview } from "./JobOfferPreview";
import { ApplicationFormPreview } from "./ApplicationFormPreview";

interface JobPreviewModalProps {
  state: JobEditorState;
  onClose: () => void;
}

/**
 * Full-screen modal that shows the offer + apply form as a candidate would
 * see them, painted from the current editor state (no API call, no save).
 *
 * Closes on Esc and on backdrop click.
 */
export function JobPreviewModal({ state, onClose }: JobPreviewModalProps) {
  const t = useTranslations("jobs");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    // Lock body scroll while modal is open
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-sm">{t("preview.title")}</h3>
              <p className="text-[11px] text-muted-foreground">{t("preview.subtitle")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
            aria-label={t("preview.close")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-background py-10 px-6">
          <div className="mx-auto max-w-5xl grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <JobOfferPreview state={state} />
            <div className="xl:sticky xl:top-0 xl:self-start">
              <ApplicationFormPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
