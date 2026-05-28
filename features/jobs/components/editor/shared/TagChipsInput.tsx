"use client";

import { useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";

interface TagChipsInputProps {
  tags: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Comma/Enter-delimited chips input.
 *
 * Backed by `string[]` — the parent owns the array. Click + opens a small
 * inline input; Enter or comma commits; Esc / blur with empty value cancels.
 */
export function TagChipsInput({
  tags,
  onChange,
  placeholder,
  disabled,
}: TagChipsInputProps) {
  const t = useTranslations("common");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (value && !tags.includes(value)) {
      onChange([...tags, value]);
    }
    setDraft("");
    setAdding(false);
  };

  const cancel = () => {
    setDraft("");
    setAdding(false);
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    } else if (e.key === "Backspace" && !draft && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const remove = (index: number) => onChange(tags.filter((_, i) => i !== index));

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted text-foreground text-xs font-medium border border-border"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label={t("delete")}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}

      {adding ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => (draft.trim() ? commit() : cancel())}
          placeholder={placeholder}
          className="px-2.5 py-1 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring min-w-[120px]"
        />
      ) : (
        !disabled && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            <Plus className="w-3 h-3" />
            {t("add")}
          </button>
        )
      )}
    </div>
  );
}
