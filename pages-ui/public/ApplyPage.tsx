"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Briefcase, Building2, CheckCircle, MapPin } from "lucide-react";
import { usePublicJob } from "@/services/queries/public-jobs.queries";
import { useApplyForm } from "@/features/applications/hooks/useApplyForm";
import { ApplyForm } from "@/features/applications/components/ApplyForm";
import type { PublicJobDetail } from "@/entities/job";
import { ROUTES } from "@/config/routes";
import { CandidateJobOfferView } from "./CandidateJobOfferView";

// Helpers used by the standalone hero above the apply grid. The shared
// `CandidateJobOfferView` renderer (used inside the grid) has its own
// internal versions — the duplication is intentional and kept local because
// the candidate apply page deliberately renders a bigger, more prominent
// hero than the embedded view does.
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

// `JobOfferDetail` and its 100+ lines of inline rendering moved into
// `CandidateJobOfferView` so the editor preview renders 1:1 the same view.
// The component below is intentionally kept as a thin shim until every
// internal caller is migrated.
function JobOfferDetail({ job }: { job: PublicJobDetail }) {
  return <CandidateJobOfferView job={mapPublicJobToViewModel(job)} showHero={false} />;
}

/**
 * Project the wide `PublicJobDetail` API type down to the narrow
 * `CandidateJobViewModel` consumed by the shared offer renderer.
 * Keeping the projection here means the renderer never has to know
 * about API-only fields like `id`, `slug`, `published_at`, etc.
 */
function mapPublicJobToViewModel(job: PublicJobDetail) {
  return {
    title: job.title,
    department: job.department,
    location: job.location,
    work_mode: job.work_mode,
    remote_constraints: job.remote_constraints,
    contract_type: job.contract_type,
    seniority: job.seniority,
    experience_min_years: job.experience_min_years,
    experience_max_years: job.experience_max_years,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_currency: job.salary_currency,
    salary_period: job.salary_period,
    role_summary: job.role_summary,
    responsibilities: job.responsibilities,
    must_haves: job.must_haves,
    nice_to_haves: job.nice_to_haves,
    tech_stack: job.tech_stack,
    benefits: job.benefits,
    hiring_process: job.hiring_process,
    value_proposition: job.value_proposition,
    domain_context: job.domain_context,
    team_context: job.team_context,
    success_profile: job.success_profile,
  };
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
    aiProfilingConsent, setAiProfilingConsent,
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

  // Build a back link that preserves the open detail so the user lands on the
  // same job they came from (state lives in `?job=<id>` on the board).
  const backHref = `${ROUTES.public.jobs}?job=${jobId}`;

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Back to board */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Wróć do ofert
        </Link>

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
          {job.role_summary && (
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{job.role_summary}</p>
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
            aiProfilingConsent={aiProfilingConsent}
            onAiProfilingConsentChange={setAiProfilingConsent}
            isSubmitting={isSubmitting}
            duplicateMatches={duplicateMatches}
            onSubmit={handleSubmit}
            onContinue={handleContinue}
            onReuse={handleReuse}
            onCloseDuplicate={handleCloseDuplicate}
          />
        </div>

        {/* F-24 (audit_ai_ethics): DPO contact + privacy note. Required by RODO
            art. 37-39 for profiling on a large scale. */}
        <div className="mt-6 text-center text-xs text-muted-foreground space-y-1">
          <p>{t("privacyNote")}</p>
          <p>{t("dpoContact")}</p>
        </div>
      </div>
    </div>
  );
}
