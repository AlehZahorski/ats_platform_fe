"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, Eye, LoaderCircle, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { useMyCompany } from "@/services/queries/companies.queries";
import type { MyCompany } from "@/entities/company";

// Reuse the same building blocks the job-creation wizard uses, so the
// two editors feel like one product. No fork required — these are
// generic enough to drive any sectional editor.
import { WizardStepper, type StepDefinition } from "@/features/jobs/components/wizard/WizardStepper";
import { SectionCard } from "@/features/jobs/components/wizard/SectionCard";

import { BrandSection } from "./company-profile/BrandSection";
import { IdentitySection, DescriptionSection } from "./company-profile/TextSections";
import {
  BenefitsSection,
  FaqSection,
  HowWeWorkSection,
  RecruitmentSection,
  TechStackSection,
  TimelineSection,
} from "./company-profile/ListSections";
import { GallerySection } from "./company-profile/GallerySection";
import { CompanyLivePreview } from "./company-profile/CompanyLivePreview";
import {
  SECTION_DEFS,
  progressToStatus,
  type SectionId,
} from "./company-profile/lib/completeness";


export function CompanyProfileEditorPage() {
  const { data: company, isLoading } = useMyCompany();
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading || !company) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const steps: StepDefinition[] = SECTION_DEFS.map((def) => {
    const p = def.progress(company);
    return {
      id: def.id,
      label: def.label,
      hint: def.hint,
      status: progressToStatus(p),
      progress: p.progress,
      missing: p.missing,
    };
  });

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <EditorHeader company={company} />

      {/*
        Grid layout — identical pattern to /dashboard/jobs/create:
          • mobile: single column (no preview)
          • lg:    stepper + sections
          • xl:    stepper + sections + live preview
      */}
      <div
        className="flex-1 px-6 py-6 grid gap-6
                   grid-cols-1
                   lg:grid-cols-[240px_minmax(0,1fr)]
                   xl:grid-cols-[240px_minmax(0,1fr)_clamp(420px,32vw,720px)]"
      >
        {/* Left: stepper */}
        <div>
          <WizardStepper steps={steps} activeIndex={activeIndex} onSelect={setActiveIndex} />
        </div>

        {/* Center: sections */}
        <div className="space-y-4 min-w-0 w-full">
          {SECTION_DEFS.map((def, i) => (
            // Key intentionally changes when activeIndex flips for this slot.
            // Forces a remount of SectionCard so defaultExpanded picks up the
            // new value — same trick the job wizard uses.
            <SectionCard
              key={`${def.id}-${activeIndex === i}`}
              number={i + 1}
              title={def.label}
              status={steps[i].status}
              defaultExpanded={activeIndex === i}
              summary={sectionSummary(def.id, company)}
              onExpand={() => setActiveIndex(i)}
            >
              <SectionBody id={def.id} company={company} />
            </SectionCard>
          ))}
        </div>

        {/* Right: live preview (xl+) */}
        <CompanyLivePreview company={company} />
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────
// Body switch — picks the right form for the active step.
// ─────────────────────────────────────────────────────────────────────

function SectionBody({ id, company }: { id: SectionId; company: MyCompany }) {
  switch (id) {
    case "brand":       return <BrandSection company={company} />;
    case "identity":    return <IdentitySection company={company} />;
    case "description": return <DescriptionSection company={company} />;
    case "howWeWork":   return <HowWeWorkSection company={company} />;
    case "techStack":   return <TechStackSection company={company} />;
    case "timeline":    return <TimelineSection company={company} />;
    case "benefits":    return <BenefitsSection company={company} />;
    case "recruitment": return <RecruitmentSection company={company} />;
    case "faq":         return <FaqSection company={company} />;
    case "gallery":     return <GallerySection company={company} />;
  }
}


// One-liner summaries shown when the section is collapsed. Mirrors the
// "Brak danych" / "8 ofert" style used in the job wizard.
function sectionSummary(id: SectionId, c: MyCompany): React.ReactNode {
  switch (id) {
    case "brand":
      return c.slug
        ? `wakanta.pl/firmy/${c.slug}${c.logo_url ? " · logo ustawione" : ""}`
        : "Brak adresu URL — ustaw aby aktywować profil";
    case "identity": {
      const parts = [c.industry, c.hq_location, c.employee_count ? `${c.employee_count} prac.` : null].filter(Boolean);
      return parts.length ? parts.join(" · ") : "Brak danych";
    }
    case "description":
      return c.description ? `${c.description.slice(0, 120)}${c.description.length > 120 ? "…" : ""}` : "Brak opisu";
    case "howWeWork":   return c.how_we_work.length ? `${c.how_we_work.length} kart` : "Brak kart";
    case "techStack":   return c.tech_stack.length ? c.tech_stack.slice(0, 5).join(", ") + (c.tech_stack.length > 5 ? "…" : "") : "Brak technologii";
    case "timeline":    return c.timeline.length ? `${c.timeline.length} wpisów` : "Brak osi czasu";
    case "benefits":    return c.benefits.length ? `${c.benefits.length} benefitów` : "Brak benefitów";
    case "recruitment": return c.recruitment_process.length ? `${c.recruitment_process.length} kroków` : "Brak procesu";
    case "faq":         return c.faq.length ? `${c.faq.length} pytań` : "Brak pytań";
    case "gallery":     return c.gallery.length ? `${c.gallery.length} zdjęć` : "Brak zdjęć";
  }
}


// ─────────────────────────────────────────────────────────────────────
// Sticky header — matches the job-wizard look. Includes a quick link to
// the public profile so the owner can flip between editor and the live
// view without losing context.
// ─────────────────────────────────────────────────────────────────────
function EditorHeader({ company }: { company: MyCompany }) {
  const filled = SECTION_DEFS.filter((d) => d.progress(company).progress === 100).length;

  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold truncate">
              {company.name || "Profil firmy"}
            </h1>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1",
                company.slug
                  ? "bg-emerald-500/15 text-emerald-500"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Building2 className="w-3 h-3" />
              {company.slug ? "Publiczny" : "Szkic"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
            <Check className="w-3 h-3 text-emerald-500" />
            {filled} z {SECTION_DEFS.length} sekcji ukończonych
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {company.slug && (
            <Link
              href={`/firmy/${company.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent/40 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Zobacz publiczny profil
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
