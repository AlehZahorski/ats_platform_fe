"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePublicCompanyDetail } from "@/services/queries/companies.queries";
import { useSavedCompaniesSet } from "./hooks/useSavedCompaniesSet";
import { HeroSection } from "./sections/HeroSection";
import { KpiStrip } from "./sections/KpiStrip";
import { JobsSection } from "./sections/JobsSection";
import {
  BenefitsSection,
  FaqSection,
  HowWeWorkSection,
  RecruitmentSection,
  TechStackSection,
  TimelineSection,
} from "./sections/OptionalSections";

interface Props {
  slug: string;
}

export function CompanyProfilePage({ slug }: Props) {
  const { data: company, isLoading, isError } = usePublicCompanyDetail(slug);
  const { savedSet, toggle } = useSavedCompaniesSet();

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-48 rounded-2xl border border-border bg-card animate-pulse" />
        <div className="h-24 rounded-2xl border border-border bg-card animate-pulse" />
        <div className="h-64 rounded-2xl border border-border bg-card animate-pulse" />
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-2">Nie znaleziono firmy</h1>
        <p className="text-muted-foreground mb-6">
          Firma o adresie <code>{slug}</code> nie istnieje lub nie ma jeszcze publicznego profilu.
        </p>
        <Link
          href="/firmy"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent/40 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Wróć do listy firm
        </Link>
      </div>
    );
  }

  const followingCompany = savedSet.has(company.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6">
      <Link
        href="/firmy"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Wróć do listy firm
      </Link>

      <HeroSection
        company={company}
        saved={followingCompany}
        onToggleSaved={() => toggle(company.id)}
      />

      <KpiStrip company={company} />

      {/* "Aktualne oferty pracy" — always shown.
          Empty state turns into a follow CTA inside the section. */}
      <JobsSection
        company={company}
        followingCompany={followingCompany}
        onToggleSavedCompany={() => toggle(company.id)}
      />

      {/* Optional sections — each hides itself when its data is empty. */}
      <HowWeWorkSection cards={company.how_we_work} />
      <TechStackSection techs={company.tech_stack} />
      <TimelineSection entries={company.timeline} />
      <BenefitsSection benefits={company.benefits} />
      <RecruitmentSection steps={company.recruitment_process} />
      <FaqSection items={company.faq} />
    </div>
  );
}
