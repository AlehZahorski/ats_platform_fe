"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateMyCompany } from "@/services/queries/companies.queries";
import type { CompanyEditPayload } from "@/entities/company";

interface Props<T> {
  /** Optional helper text — shown above the form fields. The header
   *  (number, title, status badge) is rendered by the outer SectionCard
   *  in the wizard layout, so this component is intentionally chrome-free. */
  description?: string;
  /** Snapshot of the persisted state. Acts as reset target on save success. */
  value: T;
  /** What to PATCH when the user clicks save. Takes the local draft. */
  buildPayload: (next: T) => CompanyEditPayload;
  /** Render-prop: receives the local mutable copy + setter. */
  children: (state: T, setState: (next: T) => void) => React.ReactNode;
}

/**
 * Sectional save shell — owns the "local draft → dirty tracking → save
 * → toast → reset" loop. Renders the form children, a divider, and a
 * right-aligned Save button. No outer card chrome — the caller wraps
 * this inside the wizard's SectionCard.
 */
export function SectionShell<T>({ description, value, buildPayload, children }: Props<T>) {
  const update = useUpdateMyCompany();
  const [draft, setDraft] = useState<T>(value);
  // Re-sync the draft whenever the upstream value changes (e.g. another
  // section's save returned a fresh MyCompany — we don't want this one's
  // local copy to lag behind).
  useEffect(() => setDraft(value), [value]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(value);

  const save = async () => {
    try {
      await update.mutateAsync(buildPayload(draft));
      toast.success("Zapisano zmiany");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Nie udało się zapisać";
      toast.error(typeof msg === "string" ? msg : "Nie udało się zapisać");
    }
  };

  return (
    <div>
      {description && (
        <p className="text-xs text-muted-foreground mb-4">{description}</p>
      )}
      <div className="space-y-4">
        {children(draft, setDraft)}
      </div>
      <div className="mt-5 pt-4 border-t border-border flex items-center justify-end">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || update.isPending}
          className={cn(
            "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
            dirty
              ? "bg-amber-400 text-black hover:bg-amber-300"
              : "bg-muted/40 text-muted-foreground cursor-not-allowed",
          )}
        >
          <Save className="w-4 h-4" />
          {update.isPending ? "Zapisywanie…" : dirty ? "Zapisz" : "Zapisano"}
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────
// Tiny shared inputs reused across sections (unchanged from previous
// iteration — these are not chrome, just form primitives).
// ─────────────────────────────────────────────────────────────────────

const inputBase =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40";

export function TextField({
  label, value, onChange, placeholder, maxLength, type = "text",
}: {
  label: string;
  value: string | null | number;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: "text" | "number" | "url";
}) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={inputBase}
      />
    </label>
  );
}

export function Textarea({
  label, value, onChange, placeholder, rows = 4, maxLength,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
        <span>{label}</span>
        {maxLength && (
          <span className="text-[10px] text-muted-foreground/60 tabular-nums">
            {(value ?? "").length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={inputBase}
      />
    </label>
  );
}
