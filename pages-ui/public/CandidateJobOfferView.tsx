"use client";

/**
 * Single source of truth for how a job offer is rendered to a candidate.
 *
 * Used by:
 *   - `ApplyPage` — the real public route at /apply/[jobId]
 *   - `JobOfferPreview` — the editor's live sticky preview AND the offer
 *     half of the `JobPreviewModal`
 *
 * Both call sites used to maintain their own renderer; they drifted in
 * structure, copy and order of sections. Now every visual change to the
 * candidate experience automatically reflects in the editor preview — no
 * silent regressions where the recruiter polishes the wizard but the
 * candidate sees a different layout.
 *
 * The prop type is a deliberately narrow view-model. Both `PublicJobDetail`
 * (server-fetched) and `JobEditorState` (local draft) project into it via
 * one-line adapters at the call sites.
 */
import { useTranslations } from "next-intl";
import { Briefcase, Building2, Clock, MapPin } from "lucide-react";

export interface CandidateJobViewModel {
  title: string;
  department: string | null;
  location: string | null;
  work_mode: string | null;
  remote_constraints: string | null;
  contract_type: string | null;
  seniority: string | null;
  experience_min_years: number | null;
  experience_max_years: number | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: string | null;
  role_summary: string | null;
  responsibilities: string | null;
  must_haves: string | null;
  nice_to_haves: string | null;
  tech_stack: string | null;
  benefits: string | null;
  hiring_process: string | null;
  value_proposition: string | null;
  domain_context: string | null;
  team_context: string | null;
  success_profile: string | null;
}

interface Props {
  job: CandidateJobViewModel;
  /** Set to false to skip the centered hero (icon + title + chips + summary).
   *  Used when the parent page already renders its own hero/breadcrumbs. */
  showHero?: boolean;
}

function translateEnum<T extends string>(
  value: string | null,
  map: Record<T, string>,
): string | null {
  if (!value) return null;
  return (map as Record<string, string>)[value] ?? value;
}

function getLocationLabel({
  location,
  workMode,
  remoteConstraints,
}: {
  location: string | null;
  workMode: string | null;
  remoteConstraints: string | null;
}): string | null {
  if (location) return location;
  if (workMode && remoteConstraints) return `${workMode} • ${remoteConstraints}`;
  if (remoteConstraints) return remoteConstraints;
  return workMode;
}

export function CandidateJobOfferView({ job, showHero = true }: Props) {
  const t = useTranslations("apply");

  // ── Translated enum labels — must match the candidate-facing strings. ──
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
  const locationLabel = getLocationLabel({
    location: job.location,
    workMode,
    remoteConstraints: job.remote_constraints,
  });

  // ── HTML body sections (rich content). Order matches the candidate page. ──
  const offerSections = [
    { title: t("jobOffer.sections.responsibilities"), html: job.responsibilities },
    { title: t("jobOffer.sections.mustHaves"),       html: job.must_haves },
    { title: t("jobOffer.sections.niceToHaves"),     html: job.nice_to_haves },
    { title: t("jobOffer.sections.techStack"),       html: job.tech_stack },
    { title: t("jobOffer.sections.benefits"),        html: job.benefits },
    { title: t("jobOffer.sections.hiringProcess"),   html: job.hiring_process },
  ];

  return (
    <>
      {/* ── Centered hero (same as ApplyPage main column). ─────────────── */}
      {showHero && (
        <div className="mb-8 text-center animate-fade-in">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Briefcase className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            {job.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            {job.department && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" aria-hidden="true" /> {job.department}
              </span>
            )}
            {locationLabel && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {locationLabel}
              </span>
            )}
            {contractType && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {contractType}
              </span>
            )}
          </div>
          {job.role_summary && (
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {job.role_summary}
            </p>
          )}
        </div>
      )}

      {/* ── Offer card body. Mirrors ApplyPage's `JobOfferDetail`. ───── */}
      <div className="grid gap-4 rounded-xl border border-border bg-card p-6 text-sm text-foreground shadow-sm">
        {/* When the hero is hidden (e.g. embedded in some other layout)
            the role summary lives inside the card as a labelled block. */}
        {!showHero && job.role_summary && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("jobOffer.sections.roleSummary")}
            </p>
            <p className="mt-1 leading-relaxed">{job.role_summary}</p>
          </div>
        )}

        {/* Quick-fact 2-column grid. */}
        {(job.salary_min || job.salary_max || job.work_mode || job.contract_type) && (
          <div className="grid gap-3 md:grid-cols-2">
            {(job.salary_min || job.salary_max) && (
              <div className="rounded-lg bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">{t("jobOffer.cards.salary")}</p>
                <p className="mt-1 font-medium">
                  {job.salary_min ?? "?"} - {job.salary_max ?? "?"} {job.salary_currency ?? ""}
                  {salaryPeriod ? ` / ${salaryPeriod}` : ""}
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

        {/* Rich-text sections — same div + Tailwind selector chain as
            ApplyPage so HTML lists, bold and paragraphs render identically. */}
        {offerSections.map((section) =>
          section.html ? (
            <div key={section.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </p>
              <div
                className="mt-2 text-sm text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_p]:leading-relaxed [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: section.html }}
              />
            </div>
          ) : null,
        )}

        {/* Plain-text follow-ups. */}
        {job.domain_context && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("jobOffer.sections.domainContext")}
            </p>
            <p className="mt-1 leading-relaxed">{job.domain_context}</p>
          </div>
        )}
        {job.team_context && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("jobOffer.sections.teamContext")}
            </p>
            <p className="mt-1 leading-relaxed">{job.team_context}</p>
          </div>
        )}
        {job.success_profile && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("jobOffer.sections.successProfile")}
            </p>
            <p className="mt-1 leading-relaxed">{job.success_profile}</p>
          </div>
        )}
        {job.value_proposition && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("jobOffer.sections.valueProposition")}
            </p>
            <div
              className="mt-2 text-sm text-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_p]:leading-relaxed [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{ __html: job.value_proposition }}
            />
          </div>
        )}
      </div>
    </>
  );
}
