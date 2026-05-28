"use client";

import Link from "next/link";
import { Bookmark, Building2, Users, Home, MapPin, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyPublicDetail } from "@/entities/company";
import { VerifiedBadge } from "@/pages-ui/jobboard/VerifiedBadge";
import { CompanyAvatar } from "../CompanyAvatar";

interface Props {
  company: CompanyPublicDetail;
  saved: boolean;
  onToggleSaved: () => void;
}

export function HeroSection({ company, saved, onToggleSaved }: Props) {
  const remoteLabel =
    company.remote_percentage != null && company.remote_percentage >= 80
      ? `Zdalnie w ${company.remote_percentage}%`
      : company.remote_percentage != null
      ? `Hybrydowo (${company.remote_percentage}% zdalnie)`
      : null;

  return (
    <section className="relative rounded-2xl overflow-hidden border border-border bg-card">
      {/* Banner */}
      <div className="relative h-48 md:h-56 bg-gradient-to-br from-amber-400/15 via-amber-400/5 to-transparent">
        {company.banner_url && (
          <img src={company.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>

      <div className="p-6 md:p-8 -mt-12 md:-mt-14 relative">
        <div className="flex flex-col md:flex-row gap-6 md:items-end">
          <CompanyAvatar
            name={company.name}
            logoUrl={company.logo_url}
            size={96}
            className="border-4 border-card shadow-md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-semibold">{company.name}</h1>
              {company.is_verified && <VerifiedBadge size={18} />}
            </div>
            {company.tagline && (
              <p className="mt-1 text-sm md:text-base text-muted-foreground">{company.tagline}</p>
            )}

            {/* Meta chips */}
            <div className="mt-3 flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-muted-foreground">
              {company.industry && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> {company.industry}
                </span>
              )}
              {company.employee_count != null && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> {company.employee_count} pracowników
                </span>
              )}
              {remoteLabel && (
                <span className="inline-flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5" /> {remoteLabel}
                </span>
              )}
              {company.hq_location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {company.hq_location}
                </span>
              )}
              {company.founded_year && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Założona w {company.founded_year}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="#oferty"
            className="px-5 py-2.5 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors inline-flex items-center gap-2"
          >
            {company.open_jobs_count > 0
              ? `Zobacz ${company.open_jobs_count} ${company.open_jobs_count === 1 ? "ofertę" : company.open_jobs_count < 5 ? "oferty" : "ofert"} pracy →`
              : "Aktualnie brak ofert"}
          </a>
          <button
            type="button"
            onClick={onToggleSaved}
            className={cn(
              "px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors inline-flex items-center gap-2",
              saved
                ? "border-amber-400/60 bg-amber-400/10 text-amber-400"
                : "border-border bg-card hover:border-amber-400/40"
            )}
          >
            <Bookmark className={cn("w-4 h-4", saved && "fill-current")} />
            {saved ? "Obserwujesz" : "Obserwuj firmę"}
          </button>
        </div>
      </div>
    </section>
  );
}
