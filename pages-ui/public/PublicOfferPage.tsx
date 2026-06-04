"use client";

/**
 * Public, SEO-indexed single-offer page rendered at /praca/<slug>-<uuid>.
 *
 * Server-rendered (the route is a server component that passes `job` in),
 * so the full offer content is in the initial HTML for crawlers. Reuses the
 * shared `CandidateJobOfferView` so the layout matches the apply page and
 * the recruiter's editor preview 1:1.
 */
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

import { ROUTES } from "@/config/routes";
import type { PublicJobDetail } from "@/entities/job";
import { CandidateJobOfferView, type CandidateJobViewModel } from "./CandidateJobOfferView";

function mapToViewModel(job: PublicJobDetail): CandidateJobViewModel {
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

export function PublicOfferPage({ job }: { job: PublicJobDetail }) {
  const company = job.company;

  return (
    <article className="bg-background text-foreground">
      {/* Breadcrumbs */}
      <nav aria-label="Ścieżka nawigacji" className="border-b border-border/50 bg-card/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 text-xs">
          <ol className="flex items-center gap-1.5 text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Strona główna</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={ROUTES.public.jobs} className="hover:text-foreground">Oferty pracy</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium truncate max-w-[40ch]" aria-current="page">
              {job.title}
            </li>
          </ol>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Company line + back link */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {company ? (
            company.slug ? (
              <Link
                href={`/firmy/${company.slug}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Building2 className="w-4 h-4" />
                {company.name}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                {company.name}
              </span>
            )
          ) : (
            <span />
          )}
          <Link
            href={ROUTES.public.jobs}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Wszystkie oferty
          </Link>
        </div>

        {/* Offer body (shared renderer, with hero) */}
        <CandidateJobOfferView job={mapToViewModel(job)} showHero />

        {/* Sticky apply CTA */}
        <div className="sticky bottom-4 mt-10 flex justify-center">
          <Link
            href={ROUTES.public.apply(job.id)}
            className="inline-flex items-center gap-2 rounded-full bg-amber-400 text-zinc-950 px-8 py-3.5 text-sm font-semibold shadow-lg hover:bg-amber-300 transition-colors"
          >
            Aplikuj na to stanowisko
          </Link>
        </div>
      </div>
    </article>
  );
}
