"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle, Briefcase, MapPin, Building2, Upload } from "lucide-react";
import { DuplicateWarningModal } from "@/components/applications/DuplicateWarningModal";
import { applicationsApi } from "@/services/api/applications";
import apiClient from "@/services/api/client";
import type { DuplicateCheckMatch, FormField, FormTemplate } from "@/types";

interface PublicJob {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  description: string | null;
  role_summary: string | null;
  role_purpose: string | null;
  responsibilities: string[];
  must_haves: string[];
  nice_to_haves: string[];
  tech_stack: string[];
  domain_context: string | null;
  seniority: string | null;
  experience_min_years: number | null;
  experience_max_years: number | null;
  work_mode: string | null;
  remote_constraints: string | null;
  success_profile: string | null;
  team_context: string | null;
  reporting_to: string | null;
  value_proposition: string | null;
  benefits: string[];
  hiring_process: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: string | null;
  contract_type: string | null;
  template: FormTemplate | null;
}

function getApiErrorMessage(error: unknown): string | null {
  const detail = (
    error as {
      response?: { data?: { detail?: string | { message?: string } } };
    }
  )?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }
  if (detail && typeof detail === "object" && typeof detail.message === "string") {
    return detail.message;
  }
  return null;
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

function translateEnum(value: string | null, map: Record<string, string>) {
  if (!value) return null;
  return map[value] ?? value;
}

function getJobLocationLabel({
  location,
  workMode,
  remoteConstraints,
}: {
  location: string | null;
  workMode: string | null;
  remoteConstraints: string | null;
}) {
  if (location) return location;
  if (workMode && remoteConstraints) return `${workMode} • ${remoteConstraints}`;
  if (remoteConstraints) return remoteConstraints;
  return workMode;
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
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateCheckMatch[]>([]);
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

  const validateFields = () => {
    const fields = job?.template?.fields ?? [];
    for (const field of fields) {
      if (field.required && !answers[field.id]?.trim()) {
        toast.error(t("requiredField", { field: field.label }));
        return false;
      }
    }
    return true;
  };

  const submitApplication = async (ignoreDuplicateWarning = false) => {
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
      if (ignoreDuplicateWarning) {
        formData.append("ignore_duplicate_warning", "true");
      }

      const response = await applicationsApi.apply(jobId, formData);
      setToken(response.data.public_token);
      setSubmitted(true);
      setDuplicateMatches([]);
    } catch (error: unknown) {
      const detail = (
        error as {
          response?: { status?: number; data?: { detail?: { code?: string; matches?: DuplicateCheckMatch[] } } };
        }
      )?.response?.data?.detail;
      if (
        (error as { response?: { status?: number } })?.response?.status === 409 &&
        detail?.code === "duplicate_candidate_detected"
      ) {
        setDuplicateMatches(detail.matches ?? []);
        return;
      }
      toast.error(getApiErrorMessage(error) ?? t("submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateFields()) return;

    try {
      const duplicateCheck = await applicationsApi.duplicateCheck({
        job_id: jobId,
        email: coreForm.email,
        phone: coreForm.phone || undefined,
      });
      if (duplicateCheck.data.has_duplicates) {
        setDuplicateMatches(duplicateCheck.data.matches);
        return;
      }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? t("submitFailed"));
      return;
    }

    await submitApplication(false);
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
  const salaryPeriod = translateEnum(job.salary_period, {
    hour: t("jobOffer.values.salaryPeriod.hour"),
    month: t("jobOffer.values.salaryPeriod.month"),
    year: t("jobOffer.values.salaryPeriod.year"),
  });
  const workMode = translateEnum(job.work_mode, {
    remote: t("jobOffer.values.workMode.remote"),
    hybrid: t("jobOffer.values.workMode.hybrid"),
    onsite: t("jobOffer.values.workMode.onsite"),
  });
  const contractType = translateEnum(job.contract_type, {
    employment: t("jobOffer.values.contractType.employment"),
    b2b: t("jobOffer.values.contractType.b2b"),
    contract: t("jobOffer.values.contractType.contract"),
    internship: t("jobOffer.values.contractType.internship"),
    temporary: t("jobOffer.values.contractType.temporary"),
  });
  const seniority = translateEnum(job.seniority, {
    junior: t("jobOffer.values.seniority.junior"),
    mid: t("jobOffer.values.seniority.mid"),
    senior: t("jobOffer.values.seniority.senior"),
    lead: t("jobOffer.values.seniority.lead"),
  });
  const locationLabel = getJobLocationLabel({
    location: job.location,
    workMode,
    remoteConstraints: job.remote_constraints,
  });

  const offerSections = [
    { title: t("jobOffer.sections.responsibilities"), items: job.responsibilities },
    { title: t("jobOffer.sections.mustHaves"), items: job.must_haves },
    { title: t("jobOffer.sections.niceToHaves"), items: job.nice_to_haves },
    { title: t("jobOffer.sections.techStack"), items: job.tech_stack },
    { title: t("jobOffer.sections.benefits"), items: job.benefits },
    { title: t("jobOffer.sections.hiringProcess"), items: job.hiring_process },
  ];

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center animate-fade-in">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">{job.title}</h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            {job.department && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> {job.department}
              </span>
            )}
            {locationLabel && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {locationLabel}
              </span>
            )}
          </div>
          {job.description && (
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{job.description}</p>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
          <div className="space-y-6">
            <div className="grid gap-4 rounded-xl border border-border bg-card p-6 text-sm text-foreground shadow-sm">
              {job.role_summary && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("jobOffer.sections.roleSummary")}</p>
                  <p className="mt-1 leading-relaxed">{job.role_summary}</p>
                </div>
              )}
              {job.role_purpose && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("jobOffer.sections.rolePurpose")}</p>
                  <p className="mt-1 leading-relaxed">{job.role_purpose}</p>
                </div>
              )}
              {(job.salary_min || job.salary_max || job.work_mode || job.contract_type) && (
                <div className="grid gap-3 md:grid-cols-2">
                  {(job.salary_min || job.salary_max) && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">{t("jobOffer.cards.salary")}</p>
                      <p className="mt-1 font-medium">
                        {job.salary_min ?? "?"} - {job.salary_max ?? "?"} {job.salary_currency ?? ""} / {salaryPeriod ?? ""}
                      </p>
                    </div>
                  )}
                  {job.work_mode && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">{t("jobOffer.cards.workMode")}</p>
                      <p className="mt-1 font-medium">
                        {workMode}
                        {job.remote_constraints ? ` • ${job.remote_constraints}` : ""}
                      </p>
                    </div>
                  )}
                  {job.contract_type && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">{t("jobOffer.cards.contract")}</p>
                      <p className="mt-1 font-medium">{contractType}</p>
                    </div>
                  )}
                  {(job.seniority || job.experience_min_years || job.experience_max_years) && (
                    <div className="rounded-lg bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">{t("jobOffer.cards.experienceLevel")}</p>
                      <p className="mt-1 font-medium">
                        {seniority ?? t("jobOffer.values.roleFallback")}
                        {(job.experience_min_years || job.experience_max_years) &&
                          ` • ${job.experience_min_years ?? "?"}-${job.experience_max_years ?? "?"} ${t("jobOffer.values.years")}`}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {offerSections.map((section) =>
                section.items.length > 0 ? (
                  <div key={section.title}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</p>
                    <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                      {section.items.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null
              )}

              {job.domain_context && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("jobOffer.sections.domainContext")}</p>
                  <p className="mt-1 leading-relaxed">{job.domain_context}</p>
                </div>
              )}
              {job.team_context && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("jobOffer.sections.teamContext")}</p>
                  <p className="mt-1 leading-relaxed">{job.team_context}</p>
                </div>
              )}
              {job.success_profile && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("jobOffer.sections.successProfile")}</p>
                  <p className="mt-1 leading-relaxed">{job.success_profile}</p>
                </div>
              )}
              {job.value_proposition && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("jobOffer.sections.valueProposition")}</p>
                  <p className="mt-1 leading-relaxed">{job.value_proposition}</p>
                </div>
              )}
            </div>
          </div>

          <div className="xl:sticky xl:top-6 xl:self-start">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lg animate-fade-in-delay-1">
              <div className="border-b border-border bg-muted/30 px-6 py-4">
                <p className="text-sm font-semibold text-foreground">{t("formTitle")}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("requiredHint")}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      {t("firstName")} <span className="text-destructive">*</span>
                    </label>
                    <input
                      required
                      value={coreForm.first_name}
                      onChange={(event) => setCoreForm((form) => ({ ...form, first_name: event.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      {t("lastName")} <span className="text-destructive">*</span>
                    </label>
                    <input
                      required
                      value={coreForm.last_name}
                      onChange={(event) => setCoreForm((form) => ({ ...form, last_name: event.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    {t("email")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={coreForm.email}
                    onChange={(event) => setCoreForm((form) => ({ ...form, email: event.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">{t("phone")}</label>
                  <input
                    type="tel"
                    value={coreForm.phone}
                    onChange={(event) => setCoreForm((form) => ({ ...form, phone: event.target.value }))}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {sortedFields.length > 0 && (
                  <div className="border-t border-border pt-5">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("additionalInfo")}</p>
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
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                              {field.label}
                              {field.required && <span className="ml-1 text-destructive">*</span>}
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
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4" /> {t("cv")}
                    </span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(event) => setCvFile(event.target.files?.[0] ?? null)}
                    className="w-full cursor-pointer rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {cvFile && <p className="mt-1 text-xs text-green-500">{t("cvSelected", { name: cvFile.name })}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{t("cvDesc")}</p>
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
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">{t("privacyNote")}</p>
      </div>

      {duplicateMatches.length > 0 && (
        <DuplicateWarningModal
          matches={duplicateMatches}
          isPending={isSubmitting}
          onClose={() => setDuplicateMatches([])}
          onContinue={() => void submitApplication(true)}
          onReuse={(match) => router.push(`/track/${match.public_token}`)}
        />
      )}
    </div>
  );
}
