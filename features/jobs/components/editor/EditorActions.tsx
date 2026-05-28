"use client";

import { useTranslations } from "next-intl";
import { LoaderCircle, Save, Sparkles, CheckCircle2 } from "lucide-react";

interface EditorActionsProps {
  isSaving: boolean;
  isPublishing?: boolean;
  canPublish: boolean;
  onSaveDraft: () => void | Promise<void>;
  onPreviewAi: () => void | Promise<void>;
  onPublish: () => void | Promise<void>;
}

/**
 * Sticky bottom bar with three actions: save draft, AI preview, publish.
 *
 * Renders inside the editor's main container — the parent applies sticky
 * positioning via CSS context.
 */
export function EditorActions({
  isSaving,
  isPublishing,
  canPublish,
  onSaveDraft,
  onPreviewAi,
  onPublish,
}: EditorActionsProps) {
  const t = useTranslations("jobs");

  return (
    <div className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="px-6 py-3 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted disabled:opacity-50 transition-all"
        >
          {isSaving ? (
            <LoaderCircle className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {t("editor.saveDraft")}
        </button>

        <button
          type="button"
          onClick={onPreviewAi}
          disabled={isSaving || !canPublish}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted disabled:opacity-50 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          {t("editor.previewAi")}
        </button>

        <button
          type="button"
          onClick={onPublish}
          disabled={isSaving || isPublishing || !canPublish}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
        >
          {isPublishing ? (
            <LoaderCircle className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {t("editor.saveAndPublish")}
        </button>
      </div>
    </div>
  );
}
