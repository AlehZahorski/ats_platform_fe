"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, Briefcase, MapPin, Building2 } from "lucide-react";
import { usePublicJob } from "@/services/queries/public-jobs.queries";
import { useApplyForm } from "@/features/applications/hooks/useApplyForm";
import { ApplyForm } from "@/features/applications/components/ApplyForm";
import type { PublicJobDetail } from "@/entities/job";
import { ROUTES } from "@/config/routes";

function translateEnum(value: string | null, map: Record<string, string>) {
  if (!value) return null;
  return map[value] ?? value;
}

function getJobLocationLabel({ location, workMode, remoteConstraints }: { location: string | null; workMode: string | null; remoteConstraints: string | null }) {
  if (location) return location;
  if (workMode && remoteConstraints) return `${workMode} • ${remoteConstraints}`;
  if (remoteConstraints) return remoteConstraints;
  return workMode;
}

function SuccessScreen({ jobTitle, token }: { jobTitle: string; token: string }) {
  const t = useTranslations("apply");
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">{t("success")}</h1>
        <p className="text-muted-foreground mb-1">{t("thanksForApplying", { jobTitle })}</p>
        <p className="text-muted-foreground mb-6">{t("successDesc")}</p>
        <button
          onClick={() => router.push(ROUTES.public.track(token))}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all"
        >
          {t("trackApplication")}
        </button>
      </div>
    </div>
  );
}

function JobOfferDetail({ job }: { job: PublicJobDetail }) {
  const t = useTranslations("apply");
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
  const offerSections = [
    { title: t("jobOffer.sections.responsibilities"), html: job.responsibilities },
    { title: t("jobOffer.sections.mustHaves"), html: job.must_haves },
    { title: t("jobOffer.sections.niceToHaves"), html: job.nice_to_haves },
    { title: t("jobOffer.sections.techStack"), html: job.tech_stack },
    { title: t("jobOffer.sections.benefits"), html: job.benefits },
    { title: t("jobOffer.sections.hiringProcess"), html: job.hiring_process },
  ];

  return (
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
              <p className="mt-1 font-medium">{workMode}{job.remote_constraints ? ` • ${job.remote_constraints}` : ""}</p>
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
        section.html ? (
          <div key={section.title}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</p>
            <div
              className="mt-2 text-sm text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_p]:leading-relaxed [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: section.html }}
            />
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
          <div
            className="mt-2 text-sm text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_p]:leading-relaxed [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: job.value_proposition }}
          />
        </div>
      )}
    </div>
  );
}

interface ApplyPageProps {
  jobId: string;
}

export function ApplyPage({ jobId }: ApplyPageProps) {
  const t = useTranslations("apply");
  const { data: job, isLoading, isError } = usePublicJob(jobId);
  const {
    submitted, token, isSubmitting, duplicateMatches,
    coreForm, setCoreForm, cvFile, setCvFile, answers, setAnswers,
    handleSubmit, handleReuse, handleContinue, handleCloseDuplicate,
  } = useApplyForm(jobId, job);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !job) {
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
    return <SuccessScreen jobTitle={job.title} token={token} />;
  }

  const workModeLabel = translateEnum(job.work_mode, {
    remote: t("jobOffer.values.workMode.remote"),
    hybrid: t("jobOffer.values.workMode.hybrid"),
    onsite: t("jobOffer.values.workMode.onsite"),
  });
  const locationLabel = getJobLocationLabel({ location: job.location, workMode: workModeLabel, remoteConstraints: job.remote_constraints });

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
            <JobOfferDetail job={job} />
          </div>
          <ApplyForm
            job={job}
            coreForm={coreForm}
            onCoreFormChange={(updates) => setCoreForm((prev) => ({ ...prev, ...updates }))}
            cvFile={cvFile}
            onCvFileChange={setCvFile}
            answers={answers}
            onAnswerChange={(fieldId, value) => setAnswers((prev) => ({ ...prev, [fieldId]: value }))}
            isSubmitting={isSubmitting}
            duplicateMatches={duplicateMatches}
            onSubmit={handleSubmit}
            onContinue={handleContinue}
            onReuse={handleReuse}
            onCloseDuplicate={handleCloseDuplicate}
          />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">{t("privacyNote")}</p>
      </div>
    </div>
  );
}
