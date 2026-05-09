"use client";

import { ExternalLink, FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { Job, ContractType, SalaryPeriod, Seniority, WorkMode } from "@/entities/job";
import type { FormTemplate } from "@/entities/forms";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { RichTextEditor } from "@/shared/ui/RichTextEditor";
import { formatRelative } from "@/shared/utils/format";
import type { JobFormState } from "../types/job-form.types";

interface SectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
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

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

function TextareaField({ label, value, onChange, rows = 4, placeholder }: TextareaFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} />
    </div>
  );
}

interface JobFormProps {
  job: Job;
  form: JobFormState;
  templates: FormTemplate[] | undefined;
  onChange: <K extends keyof JobFormState>(key: K, value: JobFormState[K]) => void;
  onSave: () => void;
  onTemplateChange: (templateId: string) => void;
  isSaving: boolean;
  isAssigning: boolean;
}

export function JobForm({ job, form, templates, onChange, onSave, onTemplateChange, isSaving, isAssigning }: JobFormProps) {
  const t = useTranslations("jobs");
  const tc = useTranslations("common");
  const assignedTemplate = templates?.find((tpl) => tpl.id === job.template_id);
  const publishIssues = job.publish_issues ?? [];

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("jobTitle")}</Label>
              <Input
                value={form.title}
                onChange={(e) => onChange("title", e.target.value)}
                className="text-lg font-semibold"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label>{t("department")}</Label>
                <Input value={form.department} onChange={(e) => onChange("department", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("location")}</Label>
                <Input value={form.location} onChange={(e) => onChange("location", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{tc("status")}</Label>
                <select
                  value={form.status}
                  onChange={(e) => onChange("status", e.target.value as JobFormState["status"])}
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

        <div className="mt-6">
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? tc("saving") : t("saveOffer")}
          </Button>
        </div>
      </div>

      <Section title={t("sections.roleClarity.title")} description={t("sections.roleClarity.description")}>
        <TextareaField label={t("fields.roleSummary.label")} value={form.role_summary} onChange={(v) => onChange("role_summary", v)} placeholder={t("fields.roleSummary.placeholder")} />
        <TextareaField label={t("fields.rolePurpose.label")} value={form.role_purpose} onChange={(v) => onChange("role_purpose", v)} placeholder={t("fields.rolePurpose.placeholder")} />
        <TextareaField label={t("fields.description.label")} value={form.description} onChange={(v) => onChange("description", v)} placeholder={t("fields.description.placeholder")} />
      </Section>

      <Section title={t("sections.expectations.title")} description={t("sections.expectations.description")}>
        <div className="space-y-1.5">
          <Label>{t("fields.responsibilities.label")}</Label>
          <RichTextEditor value={form.responsibilities} onChange={(v) => onChange("responsibilities", v)} placeholder={t("fields.responsibilities.placeholder")} minHeight={160} />
        </div>
        <TextareaField label={t("fields.successProfile.label")} value={form.success_profile} onChange={(v) => onChange("success_profile", v)} placeholder={t("fields.successProfile.placeholder")} />
      </Section>

      <Section title={t("sections.candidateFit.title")} description={t("sections.candidateFit.description")}>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>{t("fields.seniority.label")}</Label>
            <select value={form.seniority} onChange={(e) => onChange("seniority", e.target.value as Seniority | "")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">{t("fields.seniority.placeholder")}</option>
              <option value="junior">{t("options.seniority.junior")}</option>
              <option value="mid">{t("options.seniority.mid")}</option>
              <option value="senior">{t("options.seniority.senior")}</option>
              <option value="lead">{t("options.seniority.lead")}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("fields.experienceMin.label")}</Label>
            <Input type="number" min={0} value={form.experience_min_years} onChange={(e) => onChange("experience_min_years", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("fields.experienceMax.label")}</Label>
            <Input type="number" min={0} value={form.experience_max_years} onChange={(e) => onChange("experience_max_years", e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{t("fields.mustHaves.label")}</Label>
          <RichTextEditor value={form.must_haves} onChange={(v) => onChange("must_haves", v)} placeholder={t("fields.mustHaves.placeholder")} minHeight={140} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("fields.niceToHaves.label")}</Label>
          <RichTextEditor value={form.nice_to_haves} onChange={(v) => onChange("nice_to_haves", v)} placeholder={t("fields.niceToHaves.placeholder")} minHeight={120} />
        </div>
      </Section>

      <Section title={t("sections.techContext.title")} description={t("sections.techContext.description")}>
        <div className="space-y-1.5">
          <Label>{t("fields.techStack.label")}</Label>
          <RichTextEditor value={form.tech_stack} onChange={(v) => onChange("tech_stack", v)} placeholder={t("fields.techStack.placeholder")} minHeight={120} />
        </div>
        <TextareaField label={t("fields.domainContext.label")} value={form.domain_context} onChange={(v) => onChange("domain_context", v)} placeholder={t("fields.domainContext.placeholder")} />
      </Section>

      <Section title={t("sections.teamContext.title")} description={t("sections.teamContext.description")}>
        <TextareaField label={t("fields.teamContext.label")} value={form.team_context} onChange={(v) => onChange("team_context", v)} placeholder={t("fields.teamContext.placeholder")} />
        <div className="space-y-1.5">
          <Label>{t("fields.reportingTo.label")}</Label>
          <Input value={form.reporting_to} onChange={(e) => onChange("reporting_to", e.target.value)} placeholder={t("fields.reportingTo.placeholder")} />
        </div>
      </Section>

      <Section title={t("sections.transparency.title")} description={t("sections.transparency.description")}>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-1.5"><Label>{t("fields.salaryMin.label")}</Label><Input type="number" min={0} value={form.salary_min} onChange={(e) => onChange("salary_min", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>{t("fields.salaryMax.label")}</Label><Input type="number" min={0} value={form.salary_max} onChange={(e) => onChange("salary_max", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>{t("fields.salaryCurrency.label")}</Label><Input value={form.salary_currency} onChange={(e) => onChange("salary_currency", e.target.value.toUpperCase())} /></div>
          <div className="space-y-1.5">
            <Label>{t("fields.salaryPeriod.label")}</Label>
            <select value={form.salary_period} onChange={(e) => onChange("salary_period", e.target.value as SalaryPeriod | "")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">{t("fields.salaryPeriod.placeholder")}</option>
              <option value="hour">{t("options.salaryPeriod.hour")}</option>
              <option value="month">{t("options.salaryPeriod.month")}</option>
              <option value="year">{t("options.salaryPeriod.year")}</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("fields.workMode.label")}</Label>
            <select value={form.work_mode} onChange={(e) => onChange("work_mode", e.target.value as WorkMode | "")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">{t("fields.workMode.placeholder")}</option>
              <option value="remote">{t("options.workMode.remote")}</option>
              <option value="hybrid">{t("options.workMode.hybrid")}</option>
              <option value="onsite">{t("options.workMode.onsite")}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("fields.contractType.label")}</Label>
            <select value={form.contract_type} onChange={(e) => onChange("contract_type", e.target.value as ContractType | "")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">{t("fields.contractType.placeholder")}</option>
              <option value="employment">{t("options.contractType.employment")}</option>
              <option value="b2b">{t("options.contractType.b2b")}</option>
              <option value="contract">{t("options.contractType.contract")}</option>
              <option value="internship">{t("options.contractType.internship")}</option>
              <option value="temporary">{t("options.contractType.temporary")}</option>
            </select>
          </div>
        </div>
        <TextareaField label={t("fields.remoteConstraints.label")} value={form.remote_constraints} onChange={(v) => onChange("remote_constraints", v)} placeholder={t("fields.remoteConstraints.placeholder")} />
        <div className="space-y-1.5">
          <Label>{t("fields.valueProposition.label")}</Label>
          <RichTextEditor value={form.value_proposition} onChange={(v) => onChange("value_proposition", v)} placeholder={t("fields.valueProposition.placeholder")} minHeight={100} />
        </div>
        <div className="space-y-1.5">
          <Label>{t("fields.benefits.label")}</Label>
          <RichTextEditor value={form.benefits} onChange={(v) => onChange("benefits", v)} placeholder={t("fields.benefits.placeholder")} minHeight={120} />
        </div>
      </Section>

      <Section title={t("sections.hiringProcess.title")} description={t("sections.hiringProcess.description")}>
        <div className="space-y-1.5">
          <Label>{t("fields.hiringProcess.label")}</Label>
          <RichTextEditor value={form.hiring_process} onChange={(v) => onChange("hiring_process", v)} placeholder={t("fields.hiringProcess.placeholder")} minHeight={120} />
        </div>

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
              onChange={(e) => onTemplateChange(e.target.value)}
              disabled={isAssigning}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="none">{t("noTemplate")}</option>
              {templates?.map((tpl) => <option key={tpl.id} value={tpl.id}>{tpl.name}</option>)}
            </select>
            {isAssigning && <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
          </div>
        </div>
      </Section>
    </div>
  );
}
