"use client";

import { useState } from "react";
import { Monitor, Smartphone, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyPublicDetail, MyCompany } from "@/entities/company";
import { HeroSection } from "@/pages-ui/companies/sections/HeroSection";
import { KpiStrip } from "@/pages-ui/companies/sections/KpiStrip";
import {
  BenefitsSection,
  FaqSection,
  HowWeWorkSection,
  RecruitmentSection,
  TechStackSection,
  TimelineSection,
} from "@/pages-ui/companies/sections/OptionalSections";

interface Props {
  company: MyCompany;
}

/** Live preview column. Renders the same public-profile sections the
 * visitor will see at /firmy/{slug}, fed by the current MyCompany. We
 * intentionally read fresh server-side state (via the parent's
 * useMyCompany cache) — every section's save returns the canonical
 * row, so the preview reflects what's actually persisted. */
export function CompanyLivePreview({ company }: Props) {
  const [mode, setMode] = useState<"desktop" | "mobile">("desktop");

  // MyCompany → CompanyPublicDetail. The shapes are identical except
  // `open_jobs_count`, which only the public endpoint computes — for the
  // preview we just say 0 (and the jobs section is hidden anyway, since
  // editing jobs lives elsewhere in the dashboard).
  const asPublic: CompanyPublicDetail = {
    id: company.id,
    slug: company.slug,
    name: company.name,
    is_verified: company.is_verified,
    logo_url: company.logo_url,
    banner_url: company.banner_url,
    tagline: company.tagline,
    industry: company.industry,
    employee_count: company.employee_count,
    hq_location: company.hq_location,
    founded_year: company.founded_year,
    remote_percentage: company.remote_percentage,
    tech_stack: company.tech_stack,
    open_jobs_count: 0,
    description: company.description,
    website: company.website,
    how_we_work: company.how_we_work,
    benefits: company.benefits,
    recruitment_process: company.recruitment_process,
    timeline: company.timeline,
    faq: company.faq,
    gallery: company.gallery,
  };

  return (
    <aside className="hidden xl:block xl:sticky xl:top-20 xl:self-start">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <PreviewHeader mode={mode} setMode={setMode} />
        <div
          className={cn(
            "overflow-y-auto bg-background",
            mode === "desktop"
              ? "max-h-[calc(100vh-12rem)]"
              : "max-h-[calc(100vh-12rem)] max-w-[380px] mx-auto",
          )}
        >
          <PreviewBody company={asPublic} />
        </div>
      </div>
    </aside>
  );
}


function PreviewHeader({
  mode, setMode,
}: { mode: "desktop" | "mobile"; setMode: (m: "desktop" | "mobile") => void }) {
  return (
    <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
      <h3 className="text-sm font-semibold">Podgląd profilu</h3>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setMode("desktop")}
          className={cn(
            "p-1.5 rounded-md text-muted-foreground hover:text-foreground",
            mode === "desktop" && "bg-accent/40 text-foreground",
          )}
          title="Desktop"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setMode("mobile")}
          className={cn(
            "p-1.5 rounded-md text-muted-foreground hover:text-foreground",
            mode === "mobile" && "bg-accent/40 text-foreground",
          )}
          title="Mobile"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


function PreviewBody({ company }: { company: CompanyPublicDetail }) {
  // Truly empty profile — show a "what will appear here" placeholder so the
  // preview column never looks broken.
  if (!company.name.trim() && !company.tagline && !company.description) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <div className="text-sm">Wypełnij sekcję „Identyfikacja firmy”,</div>
        <div className="text-sm">aby zobaczyć podgląd profilu.</div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 scale-[0.85] origin-top">
      {/* Pass no-ops as toggle handlers; preview is read-only. */}
      <HeroSection company={company} saved={false} onToggleSaved={() => {}} />
      <KpiStrip company={company} />
      <HowWeWorkSection cards={company.how_we_work} />
      <TechStackSection techs={company.tech_stack} />
      <TimelineSection entries={company.timeline} />
      <BenefitsSection benefits={company.benefits} />
      <RecruitmentSection steps={company.recruitment_process} />
      <FaqSection items={company.faq} />
    </div>
  );
}
