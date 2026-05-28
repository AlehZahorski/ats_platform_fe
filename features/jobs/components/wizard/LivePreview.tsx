"use client";

import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { JobOfferPreview } from "../editor/preview/JobOfferPreview";
import type { JobEditorState } from "../../types/job-editor.types";

interface Props {
  state: JobEditorState;
  /** Variant: 'sidebar' (default) — sticky in right column. 'modal' — full content for use inside a Dialog. */
  variant?: "sidebar" | "modal";
}

export function LivePreview({ state, variant = "sidebar" }: Props) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");

  if (variant === "modal") {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <PreviewHeader mode={mode} setMode={setMode} />
        <div
          className={cn(
            "overflow-y-auto bg-background",
            mode === "desktop" ? "max-h-[75vh]" : "max-h-[75vh] max-w-[380px] mx-auto"
          )}
        >
          <div className="p-4">
            <JobOfferPreview state={state} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className="hidden xl:block xl:sticky xl:top-20 xl:self-start">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <PreviewHeader mode={mode} setMode={setMode} />
        <div
          className={cn(
            "overflow-y-auto bg-background",
            mode === "desktop" ? "max-h-[calc(100vh-12rem)]" : "max-h-[calc(100vh-12rem)] max-w-[380px] mx-auto"
          )}
        >
          <div className="p-4">
            <JobOfferPreview state={state} />
          </div>
        </div>
      </div>
    </aside>
  );
}

function PreviewHeader({
  mode,
  setMode,
}: {
  mode: "desktop" | "mobile";
  setMode: (m: "desktop" | "mobile") => void;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border">
      <h3 className="text-sm font-semibold">Podgląd oferty</h3>
      <div className="inline-flex rounded-md border border-border p-0.5">
        <button
          type="button"
          onClick={() => setMode("desktop")}
          className={cn(
            "p-1.5 rounded transition-colors",
            mode === "desktop" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Podgląd desktop"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setMode("mobile")}
          className={cn(
            "p-1.5 rounded transition-colors",
            mode === "mobile" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Podgląd mobile"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

/**
 * Modal wrapper for the live preview — used on narrow screens (<xl) where the
 * preview can't fit in a side column. Triggered by a floating button.
 */
export function LivePreviewDialog({
  open,
  onClose,
  state,
}: {
  open: boolean;
  onClose: () => void;
  state: JobEditorState;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0">
        <div className="px-5 py-3 border-b border-border pr-12">
          <DialogTitle className="text-base font-semibold">Podgląd oferty</DialogTitle>
        </div>
        <div className="p-4">
          <LivePreview state={state} variant="modal" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
