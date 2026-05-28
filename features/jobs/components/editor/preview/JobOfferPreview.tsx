"use client";

import { useTranslations } from "next-intl";
import { Briefcase, Building2, Clock, MapPin } from "lucide-react";
import type { JobEditorState } from "../../../types/job-editor.types";

interface JobOfferPreviewProps {
  state: JobEditorState;
}

/** Renders the editor state as a candidate would see it on the public job board. */
export function JobOfferPreview({ state }: JobOfferPreviewProps) {
  const t = useTranslations("jobs");
  const ta = useTranslations("apply");

  const salaryParts = formatSalary(state, ta);
  const locationLine = [
    state.location,
    state.work_mode && t(`options.workMode.${state.work_mode}` as never),
    state.remote_constraints,
  ].filter(Boolean).join(" · ");

  const htmlSections: { title: string; html: string | null }[] = [
    { title: t("editor.compensation.benefitsLabel"), html: state.benefits ? wrapPlain(state.benefits) : null },
    { title: t("fields.responsibilities.label"), html: state.responsibilities || null },
    { title: t("fields.mustHaves.label"), html: state.must_haves || null },
    { title: t("fields.niceToHaves.label"), html: state.nice_to_haves || null },
    { title: t("fields.techStack.label"), html: state.tech_stack || null },
    { title: t("fields.valueProposition.label"), html: state.value_proposition ? wrapPlain(state.value_proposition) : null },
    { title: t("fields.hiringProcess.label"), html: state.hiring_process ? wrapPlain(state.hiring_process) : null },
  ];

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {state.title || t("editor.untitledJob")}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          {state.department && (
            <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{state.department}</span>
          )}
          {locationLine && (
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{locationLine}</span>
          )}
          {state.contract_type && (
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{t(`options.contractType.${state.contract_type}` as never)}</span>
          )}
        </div>
        {state.role_summary && (
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground leading-relaxed">
            {state.role_summary}
          </p>
        )}
      </div>

      {/* Quick facts grid */}
      {(salaryParts || state.seniority) && (
        <div className="rounded-xl border border-border bg-card p-5 grid gap-3 md:grid-cols-2">
          {salaryParts && <Fact label={ta("jobOffer.cards.salary")} value={salaryParts} />}
          {state.seniority && <Fact label={ta("jobOffer.cards.experienceLevel")} value={t(`options.seniority.${state.seniority}` as never)} />}
        </div>
      )}

      {/* HTML sections */}
      {htmlSections.map((section) =>
        section.html ? (
          <section key={section.title} className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              {section.title}
            </h2>
            <div
              className="text-sm text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_p]:leading-relaxed [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
          </section>
        ) : null,
      )}

      {/* Plain-text extras */}
      {(state.team_context || state.success_profile || state.domain_context) && (
        <section className="rounded-xl border border-border bg-card p-5 space-y-3">
          {state.team_context && <Fact label={t("fields.teamContext.label")} value={state.team_context} full />}
          {state.success_profile && <Fact label={t("fields.successProfile.label")} value={state.success_profile} full />}
          {state.domain_context && <Fact label={t("fields.domainContext.label")} value={state.domain_context} full />}
        </section>
      )}
    </div>
  );
}

function Fact({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : undefined}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground leading-relaxed">{value}</p>
    </div>
  );
}

function formatSalary(state: JobEditorState, ta: (k: string) => string): string | null {
  const { salary_min, salary_max, salary_currency, salary_period } = state;
  if (!salary_min && !salary_max) return null;
  const range = salary_min && salary_max
    ? `${salary_min} – ${salary_max}`
    : salary_min ? `${salary_min}+` : `do ${salary_max}`;
  const currency = salary_currency ? ` ${salary_currency}` : "";
  const period = salary_period ? ` / ${ta(`jobOffer.values.salaryPeriod.${salary_period}`)}` : "";
  return `${range}${currency}${period}`;
}

/** Wrap plain text in a <p> for consistent rendering inside the HTML-styled sections. */
function wrapPlain(text: string): string {
  if (/<[a-z][^>]*>/i.test(text)) return text;
  return `<p>${text.replace(/\n/g, "<br/>")}</p>`;
}
