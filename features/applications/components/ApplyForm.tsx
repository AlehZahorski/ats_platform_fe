"use client";

import { Upload, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PublicJobDetail } from "@/entities/job";
import type { DuplicateCheckMatch } from "@/entities/application";
import { DynamicField } from "@/features/forms-builder/components/DynamicField";
import { DuplicateWarningModal } from "@/features/applications/components/DuplicateWarningModal";

interface ApplyFormProps {
  job: PublicJobDetail;
  coreForm: { first_name: string; last_name: string; email: string; phone: string };
  onCoreFormChange: (updates: Partial<{ first_name: string; last_name: string; email: string; phone: string }>) => void;
  cvFile: File | null;
  onCvFileChange: (file: File | null) => void;
  answers: Record<string, string>;
  onAnswerChange: (fieldId: string, value: string) => void;
  aiProfilingConsent: boolean;
  onAiProfilingConsentChange: (value: boolean) => void;
  isSubmitting: boolean;
  duplicateMatches: DuplicateCheckMatch[];
  onSubmit: (event: React.FormEvent) => void;
  onContinue: () => void;
  onReuse: (match: DuplicateCheckMatch) => void;
  onCloseDuplicate: () => void;
}

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function ApplyForm({
  job,
  coreForm,
  onCoreFormChange,
  cvFile,
  onCvFileChange,
  answers,
  onAnswerChange,
  aiProfilingConsent,
  onAiProfilingConsentChange,
  isSubmitting,
  duplicateMatches,
  onSubmit,
  onContinue,
  onReuse,
  onCloseDuplicate,
}: ApplyFormProps) {
  const t = useTranslations("apply");
  const sortedFields = [...(job.template?.fields ?? [])].sort((a, b) => a.order_index - b.order_index);

  return (
    <>
      <div className="xl:sticky xl:top-6 xl:self-start">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg animate-fade-in-delay-1">
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <p className="text-sm font-semibold text-foreground">{t("formTitle")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("requiredHint")}</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t("firstName")} <span className="text-destructive">*</span>
                </label>
                <input required value={coreForm.first_name} onChange={(e) => onCoreFormChange({ first_name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {t("lastName")} <span className="text-destructive">*</span>
                </label>
                <input required value={coreForm.last_name} onChange={(e) => onCoreFormChange({ last_name: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {t("email")} <span className="text-destructive">*</span>
              </label>
              <input required type="email" value={coreForm.email} onChange={(e) => onCoreFormChange({ email: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">{t("phone")}</label>
              <input type="tel" value={coreForm.phone} onChange={(e) => onCoreFormChange({ phone: e.target.value })} className={inputClass} />
            </div>

            {sortedFields.length > 0 && (
              <div className="border-t border-border pt-5">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("additionalInfo")}</p>
                <div className="space-y-5">
                  {sortedFields.map((field) =>
                    field.field_type === "checkbox" ? (
                      <div key={field.id}>
                        <DynamicField field={field} value={answers[field.id] ?? ""} onChange={(v) => onAnswerChange(field.id, v)} />
                      </div>
                    ) : (
                      <div key={field.id}>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                          {field.label}
                          {field.required && <span className="ml-1 text-destructive">*</span>}
                        </label>
                        <DynamicField field={field} value={answers[field.id] ?? ""} onChange={(v) => onAnswerChange(field.id, v)} />
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-5">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                <span className="flex items-center gap-2">
                  <Upload className="h-4 w-4" /> {t("cv")}
                </span>
              </label>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => onCvFileChange(e.target.files?.[0] ?? null)}
                className="w-full cursor-pointer rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {cvFile && <p className="mt-1 text-xs text-green-500">{t("cvSelected", { name: cvFile.name })}</p>}
              <p className="mt-1 text-xs text-muted-foreground">{t("cvDesc")}</p>
            </div>

            {/* F-01 (audit_ai_ethics): EU AI Act art. 26(11) + RODO art. 13(2)(f)
                require the candidate to know that an AI system is used. The
                checkbox below is opt-in — when unchecked the backend redacts PII
                before any Anthropic call and skips the candidate↔job match. */}
            <div className="border-t border-border pt-5 space-y-3">
              <div className="rounded-lg border border-primary/15 bg-primary/5 p-4 text-xs leading-relaxed text-foreground">
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkles className="h-4 w-4" />
                  {t("aiNotice.title")}
                </p>
                <p className="text-muted-foreground">{t("aiNotice.body")}</p>
                <p className="mt-2">
                  <a href="/ai-info" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                    {t("aiNotice.learnMore")}
                  </a>
                </p>
              </div>

              <label className="flex items-start gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiProfilingConsent}
                  onChange={(e) => onAiProfilingConsentChange(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                />
                <span className="leading-relaxed">{t("aiNotice.consentLabel")}</span>
              </label>
              <p className="text-xs text-muted-foreground pl-6">{t("aiNotice.optOutHint")}</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  {t("submitting")}
                </span>
              ) : (
                t("submit")
              )}
            </button>
          </form>
        </div>
      </div>

      {duplicateMatches.length > 0 && (
        <DuplicateWarningModal
          matches={duplicateMatches}
          isPending={isSubmitting}
          onClose={onCloseDuplicate}
          onContinue={onContinue}
          onReuse={onReuse}
        />
      )}
    </>
  );
}
