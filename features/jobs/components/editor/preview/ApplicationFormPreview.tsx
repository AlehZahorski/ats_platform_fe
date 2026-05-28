"use client";

import { useTranslations } from "next-intl";
import { Send, Upload } from "lucide-react";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-muted/30 text-muted-foreground text-sm cursor-not-allowed";

/**
 * Static mock of the public application form — every input is disabled.
 * Goal is to show candidates what they will fill, not to accept input.
 */
export function ApplicationFormPreview() {
  const ta = useTranslations("apply");

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <header>
        <h2 className="font-display font-semibold text-foreground">{ta("formTitle")}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{ta("subtitle")}</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Field label={ta("firstName")} placeholder="Anna" />
        <Field label={ta("lastName")} placeholder="Kowalska" />
      </div>
      <Field label={ta("email")} placeholder="anna@example.com" />
      <Field label={ta("phone")} placeholder="+48 …" />

      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">{ta("cv")}</label>
        <div className="flex items-center gap-2 px-3.5 py-3 rounded-lg border border-dashed border-input bg-muted/20 text-muted-foreground text-sm">
          <Upload className="w-4 h-4" />
          <span>{ta("cvDesc")}</span>
        </div>
      </div>

      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary/40 text-primary-foreground/70 text-sm font-semibold cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
        {ta("submit")}
      </button>

      <p className="text-[11px] text-muted-foreground text-center italic">
        {ta("previewDisabledNote")}
      </p>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">{label}</label>
      <input value="" placeholder={placeholder} disabled className={inputClass} />
    </div>
  );
}
