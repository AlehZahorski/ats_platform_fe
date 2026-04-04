"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle, Briefcase, MapPin, Building2, Upload } from "lucide-react";
import { applicationsApi } from "@/services/api/applications";
import apiClient from "@/services/api/client";
import type { FormField, FormTemplate } from "@/types";

interface PublicJob {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  description: string | null;
  template: FormTemplate | null;
}

function DynamicField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("apply");
  const baseClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  switch (field.field_type) {
    case "textarea":
      return (
        <textarea
          required={field.required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className={`${baseClass} resize-none`}
        />
      );

    case "select":
      return (
        <select
          required={field.required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={baseClass}
        >
          <option value="">{t("selectOption")}</option>
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );

    case "multiselect":
      return (
        <div className="space-y-2">
          {(field.options ?? []).map((option) => {
            const selected = value.split(",").filter(Boolean);
            const checked = selected.includes(option);

            return (
              <label key={option} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked ? selected.filter((item) => item !== option) : [...selected, option];
                    onChange(next.join(","));
                  }}
                  className="w-4 h-4 rounded border-input accent-primary"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">{option}</span>
              </label>
            );
          })}
        </div>
      );

    case "checkbox":
      return (
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(event) => onChange(event.target.checked ? "true" : "false")}
            className="w-4 h-4 rounded border-input accent-primary"
          />
          <span className="text-sm text-foreground">{field.label}</span>
        </label>
      );

    case "number":
      return (
        <input
          type="number"
          required={field.required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={baseClass}
        />
      );

    case "email":
      return (
        <input
          type="email"
          required={field.required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={baseClass}
        />
      );

    case "phone":
      return (
        <input
          type="tel"
          required={field.required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={baseClass}
        />
      );

    case "date":
      return (
        <input
          type="date"
          required={field.required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={baseClass}
        />
      );

    default:
      return (
        <input
          type="text"
          required={field.required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={baseClass}
        />
      );
  }
}

export default function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const t = useTranslations("apply");

  const [job, setJob] = useState<PublicJob | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobNotFound, setJobNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coreForm, setCoreForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    apiClient
      .get(`/jobs/public/${jobId}`)
      .then((response) => {
        setJob(response.data);
        const initialAnswers: Record<string, string> = {};
        response.data.template?.fields?.forEach((field: FormField) => {
          initialAnswers[field.id] = "";
        });
        setAnswers(initialAnswers);
      })
      .catch(() => setJobNotFound(true))
      .finally(() => setJobLoading(false));
  }, [jobId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const fields = job?.template?.fields ?? [];
    for (const field of fields) {
      if (field.required && !answers[field.id]?.trim()) {
        toast.error(t("requiredField", { field: field.label }));
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(coreForm).forEach(([key, value]) => value && formData.append(key, value));

      if (cvFile) {
        formData.append("cv_file", cvFile);
      }

      const answersPayload = Object.entries(answers)
        .filter(([, value]) => value !== "")
        .map(([field_id, value]) => ({ field_id, value }));
      formData.append("answers", JSON.stringify(answersPayload));

      const response = await applicationsApi.apply(jobId, formData);
      setToken(response.data.public_token);
      setSubmitted(true);
    } catch {
      toast.error(t("submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (jobLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (jobNotFound || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">{t("notAvailable")}</h1>
          <p className="text-muted-foreground">{t("notAvailableDesc")}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">{t("success")}</h1>
          <p className="text-muted-foreground mb-1">{t("thanksForApplying", { jobTitle: job.title })}</p>
          <p className="text-muted-foreground mb-6">{t("successDesc")}</p>
          <button
            onClick={() => router.push(`/track/${token}`)}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all"
          >
            {t("trackApplication")}
          </button>
        </div>
      </div>
    );
  }

  const sortedFields = [...(job.template?.fields ?? [])].sort((left, right) => left.order_index - right.order_index);

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">{job.title}</h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            {job.department && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> {job.department}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {job.location}
              </span>
            )}
          </div>
          {job.description && (
            <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto leading-relaxed">{job.description}</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in-delay-1">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <p className="text-sm font-semibold text-foreground">{t("formTitle")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("requiredHint")}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("firstName")} <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  value={coreForm.first_name}
                  onChange={(event) => setCoreForm((form) => ({ ...form, first_name: event.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t("lastName")} <span className="text-destructive">*</span>
                </label>
                <input
                  required
                  value={coreForm.last_name}
                  onChange={(event) => setCoreForm((form) => ({ ...form, last_name: event.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("email")} <span className="text-destructive">*</span>
              </label>
              <input
                required
                type="email"
                value={coreForm.email}
                onChange={(event) => setCoreForm((form) => ({ ...form, email: event.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("phone")}</label>
              <input
                type="tel"
                value={coreForm.phone}
                onChange={(event) => setCoreForm((form) => ({ ...form, phone: event.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {sortedFields.length > 0 && (
              <div className="border-t border-border pt-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  {t("additionalInfo")}
                </p>
                <div className="space-y-5">
                  {sortedFields.map((field) =>
                    field.field_type === "checkbox" ? (
                      <div key={field.id}>
                        <DynamicField
                          field={field}
                          value={answers[field.id] ?? ""}
                          onChange={(value) => setAnswers((current) => ({ ...current, [field.id]: value }))}
                        />
                      </div>
                    ) : (
                      <div key={field.id}>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          {field.label}
                          {field.required && <span className="text-destructive ml-1">*</span>}
                        </label>
                        <DynamicField
                          field={field}
                          value={answers[field.id] ?? ""}
                          onChange={(value) => setAnswers((current) => ({ ...current, [field.id]: value }))}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            <div className="border-t border-border pt-5">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" /> {t("cv")}
                </span>
              </label>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground cursor-pointer"
              />
              {cvFile && <p className="text-xs text-green-500 mt-1">✓ {cvFile.name}</p>}
              <p className="text-xs text-muted-foreground mt-1">{t("cvDesc")}</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  {t("submitting")}
                </span>
              ) : (
                t("submit")
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">{t("privacyNote")}</p>
      </div>
    </div>
  );
}
