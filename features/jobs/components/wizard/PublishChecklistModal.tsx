"use client";

import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Check, X, AlertTriangle, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildPublishChecklist, checklistPasses } from "./PublishChecklist";
import type { JobEditorState } from "../../types/job-editor.types";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  state: JobEditorState;
  onJumpTo?: (sectionId: string) => void;
  isPublishing?: boolean;
}

const SECTION_HINT: Record<string, string> = {
  title: "podstawy",
  category: "podstawy",
  location: "podstawy",
  work_mode: "podstawy",
  contract_type: "podstawy",
  role_summary: "zakres",
  must_haves: "wymagania",
  salary: "widelki",
  benefits: "widelki",
};

export function PublishChecklistModal({ open, onClose, onConfirm, state, onJumpTo, isPublishing }: Props) {
  const items = buildPublishChecklist(state);
  const canPublish = checklistPasses(items);
  const requiredMissing = items.filter((i) => i.required && !i.passed).length;
  const softMissing = items.filter((i) => !i.required && !i.passed).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0">
        <div className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Rocket className="w-5 h-5 text-amber-400" />
            Publikacja oferty
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {canPublish
              ? "Oferta jest gotowa do publikacji. Po opublikowaniu pojawi się na stronie karier."
              : `Brakuje ${requiredMissing} ${requiredMissing === 1 ? "elementu" : "elementów"} wymaganych do publikacji.`}
          </p>
        </div>

        <div className="px-6 py-5 space-y-1.5">
          {items.map((item) => {
            const targetSection = SECTION_HINT[item.id];
            const isError = item.required && !item.passed;
            const isWarn = !item.required && !item.passed;
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2 rounded-md",
                  item.passed && "bg-emerald-500/5",
                  isError && "bg-rose-500/5",
                  isWarn && "bg-amber-500/5"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.passed ? (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : item.required ? (
                    <X className="w-4 h-4 text-rose-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  <span className={cn("text-sm", item.passed && "text-muted-foreground")}>
                    {item.label}
                  </span>
                </div>
                {!item.passed && targetSection && onJumpTo && (
                  <button
                    type="button"
                    onClick={() => {
                      onJumpTo(targetSection);
                      onClose();
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium shrink-0"
                  >
                    Uzupełnij →
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {softMissing > 0 && canPublish && (
          <div className="mx-6 mb-2 p-3 rounded-md bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            Brakuje {softMissing} {softMissing === 1 ? "elementu" : "elementów"} zalecanych, ale możesz opublikować ofertę.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/40"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canPublish || isPublishing}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              canPublish
                ? "bg-amber-400 text-black hover:bg-amber-300"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Rocket className="w-4 h-4" />
            {isPublishing ? "Publikuję…" : "Opublikuj"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
