"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronRight, ExternalLink, FileText, Sparkles } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { useApplications, useAssignTemplate, useFormTemplates, useJob, useUpdateJob } from "@/services/queries";
import type { ContractType, Job, SalaryPeriod, Seniority, WorkMode } from "@/types";
import { formatRelative } from "@/lib/utils";

type JobFormState = {
  title: string;
  department: string;
  location: string;
  status: "draft" | "open" | "closed";
  role_summary: string;
  role_purpose: string;
  responsibilities: string;
  must_haves: string;
  nice_to_haves: string;
  tech_stack: string;
  domain_context: string;
  seniority: Seniority | "";
  experience_min_years: string;
  experience_max_years: string;
  work_mode: WorkMode | "";
  remote_constraints: string;
  success_profile: string;
  team_context: string;
  reporting_to: string;
  value_proposition: string;
  benefits: string;
  hiring_process: string;
  salary_min: string;
  salary_max: string;
  salary_currency: string;
  salary_period: SalaryPeriod | "";
  contract_type: ContractType | "";
  description: string;
};

function listToText(values: string[] | null | undefined): string {
  return (values ?? []).join("\n");
}

function textToList(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toForm(job: Job): JobFormState {
  return {
    title: job.title,
    department: job.department ?? "",
    location: job.location ?? "",
    status: job.status,
    role_summary: job.role_summary ?? "",
    role_purpose: job.role_purpose ?? "",
    responsibilities: listToText(job.responsibilities),
    must_haves: listToText(job.must_haves),
    nice_to_haves: listToText(job.nice_to_haves),
    tech_stack: listToText(job.tech_stack),
    domain_context: job.domain_context ?? "",
    seniority: job.seniority ?? "",
    experience_min_years: job.experience_min_years?.toString() ?? "",
    experience_max_years: job.experience_max_years?.toString() ?? "",
    work_mode: job.work_mode ?? "",
    remote_constraints: job.remote_constraints ?? "",
    success_profile: job.success_profile ?? "",
    team_context: job.team_context ?? "",
    reporting_to: job.reporting_to ?? "",
    value_proposition: job.value_proposition ?? "",
    benefits: listToText(job.benefits),
    hiring_process: listToText(job.hiring_process),
    salary_min: job.salary_min?.toString() ?? "",
    salary_max: job.salary_max?.toString() ?? "",
    salary_currency: job.salary_currency ?? "PLN",
    salary_period: job.salary_period ?? "",
    contract_type: job.contract_type ?? "",
    description: job.description ?? "",
  };
}

function getApiErrorMessage(error: unknown): string | null {
  const detail = (
    error as { response?: { data?: { detail?: string | { message?: string; issues?: string[] } } } }
  )?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object") {
    if (Array.isArray(detail.issues) && detail.issues.length > 0) {
      return detail.issues[0];
    }
    if (typeof detail.message === "string") return detail.message;
  }
  return null;
}

function translateStageName(name: string, t: ReturnType<typeof useTranslations>) {
  const map: Record<string, string> = {
    applied: t("stageNames.applied"),
    screening: t("stageNames.screening"),
    interview: t("stageNames.interview"),
    offer: t("stageNames.offer"),
    hired: t("stageNames.hired"),
    rejected: t("stageNames.rejected"),
    under_review: t("stageNames.under_review"),
  };
  return map[name] ?? name;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const t = useTranslations("jobs");
  const tc = useTranslations("common");
  const { data: job, isLoading } = useJob(jobId);
  const { data: apps } = useApplications({ job_id: jobId });
  const { data: templates } = useFormTemplates();
  const updateJob = useUpdateJob();
  const assignTemplate = useAssignTemplate();

  const [form, setForm] = useState<JobFormState | null>(null);

  useEffect(() => {
    if (job) {
      setForm(toForm(job));
    }
  }, [job]);

  const publishIssues = useMemo(() => job?.publish_issues ?? [], [job]);
  const stageName = (value: string) => translateStageName(value, tc);

  const handleChange = <K extends keyof JobFormState>(key: K, value: JobFormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      await updateJob.mutateAsync({
        id: jobId,
        data: {
          title: form.title,
          department: form.department || null,
          location: form.location || null,
          status: form.status,
          role_summary: form.role_summary || null,
          role_purpose: form.role_purpose || null,
          responsibilities: textToList(form.responsibilities),
          must_haves: textToList(form.must_haves),
          nice_to_haves: textToList(form.nice_to_haves),
          tech_stack: textToList(form.tech_stack),
          domain_context: form.domain_context || null,
          seniority: form.seniority || null,
          experience_min_years: form.experience_min_years ? Number(form.experience_min_years) : null,
          experience_max_years: form.experience_max_years ? Number(form.experience_max_years) : null,
          work_mode: form.work_mode || null,
          remote_constraints: form.remote_constraints || null,
          success_profile: form.success_profile || null,
          team_context: form.team_context || null,
          reporting_to: form.reporting_to || null,
          value_proposition: form.value_proposition || null,
          benefits: textToList(form.benefits),
          hiring_process: textToList(form.hiring_process),
          salary_min: form.salary_min ? Number(form.salary_min) : null,
          salary_max: form.salary_max ? Number(form.salary_max) : null,
          salary_currency: form.salary_currency || null,
          salary_period: form.salary_period || null,
          contract_type: form.contract_type || null,
          description: form.description || null,
        },
      });
      toast.success(t("saved"));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? t("updateFailed"));
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    try {
      await assignTemplate.mutateAsync({ id: jobId, template_id: templateId === "none" ? null : templateId });
      toast.success(templateId === "none" ? t("templateRemoved") : t("assignTemplate"));
    } catch {
      toast.error(t("templateUpdateFailed"));
    }
  };

  if (isLoading || !form) {
    return (
      <div className="p-6">
        <div className="h-64 rounded-xl border border-border bg-card animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return <div className="p-6 text-muted-foreground">{t("notFound")}</div>;
  }

  const assignedTemplate = templates?.find((template) => template.id === job.template_id);

  return (
    <div>
      <Topbar title={job.title} />
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/jobs" className="hover:text-foreground">
            {t("title")}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{job.title}</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">{t("jobTitle")}</label>
                <input
                  value={form.title}
                  onChange={(event) => handleChange("title", event.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-lg font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">{t("department")}</label>
                  <input
                    value={form.department}
                    onChange={(event) => handleChange("department", event.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">{t("location")}</label>
                  <input
                    value={form.location}
                    onChange={(event) => handleChange("location", event.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">{tc("status")}</label>
                  <select
                    value={form.status}
                    onChange={(event) => handleChange("status", event.target.value as JobFormState["status"])}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="draft">{t("status.draft")}</option>
                    <option value="open">{t("status.open")}</option>
                    <option value="closed">{t("status.closed")}</option>
                  </select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t("createdAt", { value: formatRelative(job.created_at) })}</p>
            </div>

            <div className="min-w-[260px] rounded-xl bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold text-foreground">
                  {job.publish_ready ? t("publish.readyTitle") : t("publish.needsWorkTitle")}
                </p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {job.publish_ready ? t("publish.readyDescription") : t("publish.needsWorkDescription")}
              </p>
              {publishIssues.length > 0 && (
                <div className="mt-3 space-y-2">
                  {publishIssues.map((issue) => (
                    <div key={issue} className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
                      {issue}
                    </div>
                  ))}
                </div>
              )}
              {job.status === "open" && (
                <div className="mt-4">
                  <p className="mb-1 text-xs text-muted-foreground">{t("publicLink")}</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-lg bg-background px-3 py-2 text-xs text-foreground">
                      {typeof window !== "undefined" ? window.location.origin : ""}/apply/{job.id}
                    </code>
                    <a href={`/apply/${job.id}`} target="_blank" rel="noreferrer" className="p-2 text-muted-foreground hover:text-foreground">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={updateJob.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {updateJob.isPending ? tc("saving") : t("saveOffer")}
            </button>
          </div>
        </div>

        <Section title={t("sections.roleClarity.title")} description={t("sections.roleClarity.description")}>
          <TextareaField
            label={t("fields.roleSummary.label")}
            value={form.role_summary}
            onChange={(value) => handleChange("role_summary", value)}
            placeholder={t("fields.roleSummary.placeholder")}
          />
          <TextareaField
            label={t("fields.rolePurpose.label")}
            value={form.role_purpose}
            onChange={(value) => handleChange("role_purpose", value)}
            placeholder={t("fields.rolePurpose.placeholder")}
          />
          <TextareaField
            label={t("fields.description.label")}
            value={form.description}
            onChange={(value) => handleChange("description", value)}
            placeholder={t("fields.description.placeholder")}
          />
        </Section>

        <Section title={t("sections.expectations.title")} description={t("sections.expectations.description")}>
          <TextareaField
            label={t("fields.responsibilities.label")}
            value={form.responsibilities}
            onChange={(value) => handleChange("responsibilities", value)}
            rows={6}
            placeholder={t("fields.responsibilities.placeholder")}
          />
          <TextareaField
            label={t("fields.successProfile.label")}
            value={form.success_profile}
            onChange={(value) => handleChange("success_profile", value)}
            placeholder={t("fields.successProfile.placeholder")}
          />
        </Section>

        <Section title={t("sections.candidateFit.title")} description={t("sections.candidateFit.description")}>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.seniority.label")}</label>
              <select
                value={form.seniority}
                onChange={(event) => handleChange("seniority", event.target.value as Seniority | "")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t("fields.seniority.placeholder")}</option>
                <option value="junior">{t("options.seniority.junior")}</option>
                <option value="mid">{t("options.seniority.mid")}</option>
                <option value="senior">{t("options.seniority.senior")}</option>
                <option value="lead">{t("options.seniority.lead")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.experienceMin.label")}</label>
              <input
                type="number"
                min={0}
                value={form.experience_min_years}
                onChange={(event) => handleChange("experience_min_years", event.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.experienceMax.label")}</label>
              <input
                type="number"
                min={0}
                value={form.experience_max_years}
                onChange={(event) => handleChange("experience_max_years", event.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <TextareaField
            label={t("fields.mustHaves.label")}
            value={form.must_haves}
            onChange={(value) => handleChange("must_haves", value)}
            rows={6}
            placeholder={t("fields.mustHaves.placeholder")}
          />
          <TextareaField
            label={t("fields.niceToHaves.label")}
            value={form.nice_to_haves}
            onChange={(value) => handleChange("nice_to_haves", value)}
            rows={4}
            placeholder={t("fields.niceToHaves.placeholder")}
          />
        </Section>

        <Section title={t("sections.techContext.title")} description={t("sections.techContext.description")}>
          <TextareaField
            label={t("fields.techStack.label")}
            value={form.tech_stack}
            onChange={(value) => handleChange("tech_stack", value)}
            rows={4}
            placeholder={t("fields.techStack.placeholder")}
          />
          <TextareaField
            label={t("fields.domainContext.label")}
            value={form.domain_context}
            onChange={(value) => handleChange("domain_context", value)}
            placeholder={t("fields.domainContext.placeholder")}
          />
        </Section>

        <Section title={t("sections.teamContext.title")} description={t("sections.teamContext.description")}>
          <TextareaField
            label={t("fields.teamContext.label")}
            value={form.team_context}
            onChange={(value) => handleChange("team_context", value)}
            placeholder={t("fields.teamContext.placeholder")}
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.reportingTo.label")}</label>
            <input
              value={form.reporting_to}
              onChange={(event) => handleChange("reporting_to", event.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t("fields.reportingTo.placeholder")}
            />
          </div>
        </Section>

        <Section title={t("sections.transparency.title")} description={t("sections.transparency.description")}>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.salaryMin.label")}</label>
              <input
                type="number"
                min={0}
                value={form.salary_min}
                onChange={(event) => handleChange("salary_min", event.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.salaryMax.label")}</label>
              <input
                type="number"
                min={0}
                value={form.salary_max}
                onChange={(event) => handleChange("salary_max", event.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.salaryCurrency.label")}</label>
              <input
                value={form.salary_currency}
                onChange={(event) => handleChange("salary_currency", event.target.value.toUpperCase())}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.salaryPeriod.label")}</label>
              <select
                value={form.salary_period}
                onChange={(event) => handleChange("salary_period", event.target.value as SalaryPeriod | "")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t("fields.salaryPeriod.placeholder")}</option>
                <option value="hour">{t("options.salaryPeriod.hour")}</option>
                <option value="month">{t("options.salaryPeriod.month")}</option>
                <option value="year">{t("options.salaryPeriod.year")}</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.workMode.label")}</label>
              <select
                value={form.work_mode}
                onChange={(event) => handleChange("work_mode", event.target.value as WorkMode | "")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t("fields.workMode.placeholder")}</option>
                <option value="remote">{t("options.workMode.remote")}</option>
                <option value="hybrid">{t("options.workMode.hybrid")}</option>
                <option value="onsite">{t("options.workMode.onsite")}</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.contractType.label")}</label>
              <select
                value={form.contract_type}
                onChange={(event) => handleChange("contract_type", event.target.value as ContractType | "")}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t("fields.contractType.placeholder")}</option>
                <option value="employment">{t("options.contractType.employment")}</option>
                <option value="b2b">{t("options.contractType.b2b")}</option>
                <option value="contract">{t("options.contractType.contract")}</option>
                <option value="internship">{t("options.contractType.internship")}</option>
                <option value="temporary">{t("options.contractType.temporary")}</option>
              </select>
            </div>
          </div>
          <TextareaField
            label={t("fields.remoteConstraints.label")}
            value={form.remote_constraints}
            onChange={(value) => handleChange("remote_constraints", value)}
            placeholder={t("fields.remoteConstraints.placeholder")}
          />
          <TextareaField
            label={t("fields.valueProposition.label")}
            value={form.value_proposition}
            onChange={(value) => handleChange("value_proposition", value)}
            placeholder={t("fields.valueProposition.placeholder")}
          />
          <TextareaField
            label={t("fields.benefits.label")}
            value={form.benefits}
            onChange={(value) => handleChange("benefits", value)}
            rows={5}
            placeholder={t("fields.benefits.placeholder")}
          />
        </Section>

        <Section title={t("sections.hiringProcess.title")} description={t("sections.hiringProcess.description")}>
          <TextareaField
            label={t("fields.hiringProcess.label")}
            value={form.hiring_process}
            onChange={(value) => handleChange("hiring_process", value)}
            rows={5}
            placeholder={t("fields.hiringProcess.placeholder")}
          />

          <div className="rounded-xl bg-muted/30 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">{t("applicationForm")}</h4>
            </div>
            {assignedTemplate ? (
              <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm font-medium text-foreground">{assignedTemplate.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("fieldsCount", { count: assignedTemplate.fields?.length ?? 0 })}</p>
              </div>
            ) : (
              <p className="mb-3 text-sm text-muted-foreground">{t("noAssignedTemplate")}</p>
            )}
            <div className="flex items-center gap-3">
              <select
                value={job.template_id ?? "none"}
                onChange={(event) => handleTemplateChange(event.target.value)}
                disabled={assignTemplate.isPending}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="none">{t("noTemplate")}</option>
                {templates?.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {assignTemplate.isPending && <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
            </div>
          </div>
        </Section>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            {t("applicationsTitle")} <span className="ml-1 text-sm font-normal text-muted-foreground">({apps?.total ?? 0})</span>
          </h3>
          {apps?.items.length ? (
            <div className="space-y-2">
              {apps.items.map((application) => (
                <Link
                  key={application.id}
                  href={`/dashboard/applications/${application.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:border-primary/30 hover:bg-muted/30"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {application.first_name} {application.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{application.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {application.stage && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {stageName(application.stage.name)}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noApplications")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
