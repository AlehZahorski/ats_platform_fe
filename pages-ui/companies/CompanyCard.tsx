"use client";

import Link from "next/link";
import { Bookmark, MapPin, Users, Home, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CompanyPublicSummary } from "@/entities/company";
import { VerifiedBadge } from "@/pages-ui/jobboard/VerifiedBadge";
import { CompanyAvatar } from "./CompanyAvatar";

interface Props {
  company: CompanyPublicSummary;
  saved: boolean;
  onToggleSaved: () => void;
}

export function CompanyCard({ company, saved, onToggleSaved }: Props) {
  const remoteLabel =
    company.remote_percentage != null && company.remote_percentage >= 80
      ? "Zdalnie w 100%"
      : company.remote_percentage != null && company.remote_percentage >= 20
      ? `Zdalnie w ${company.remote_percentage}%`
      : "Hybrydowo";

  return (
    <article className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-amber-400/40 transition-colors flex flex-col">
      {/* Banner */}
      <Link
        href={company.slug ? `/firmy/${company.slug}` : "#"}
        className="block relative h-32 bg-gradient-to-br from-amber-400/10 via-amber-400/5 to-transparent"
        aria-label={company.name}
      >
        {company.banner_url ? (
          <img
            src={company.banner_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          // Subtle gradient placeholder when no banner uploaded yet.
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,158,11,0.12),transparent_60%)]" />
        )}
      </Link>

      {/* Body */}
      <div className="p-5 -mt-8 relative flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <CompanyAvatar
            name={company.name}
            logoUrl={company.logo_url}
            size={56}
            className="border-4 border-card shadow-md"
          />
          {/* Save bookmark — anonymous → localStorage, logged in → DB */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleSaved();
            }}
            className={cn(
              "p-2 rounded-full hover:bg-accent/40 mt-2",
              saved ? "text-amber-400" : "text-muted-foreground hover:text-foreground"
            )}
            title={saved ? "Przestań obserwować" : "Obserwuj firmę"}
          >
            <Bookmark className={cn("w-5 h-5", saved && "fill-current")} />
          </button>
        </div>

        <div className="mt-3">
          <Link
            href={company.slug ? `/firmy/${company.slug}` : "#"}
            className="inline-flex items-center gap-2 group/name"
          >
            <h3 className="text-base font-semibold text-foreground group-hover/name:text-amber-400 transition-colors">
              {company.name}
            </h3>
            {company.is_verified && <VerifiedBadge size={14} />}
          </Link>

          {(company.industry || company.hq_location) && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
              {company.industry && <span>{company.industry}</span>}
              {company.industry && company.hq_location && <span className="opacity-40">•</span>}
              {company.hq_location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {company.hq_location}
                </span>
              )}
            </p>
          )}

          {company.employee_count != null && (
            <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
              <Users className="w-3 h-3" />
              {company.employee_count} pracowników
            </p>
          )}
        </div>

        {/* Work-mode chip */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-xs">
            <Home className="w-3 h-3" />
            {remoteLabel}
          </span>
        </div>

        {/* Tech chips */}
        {company.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {company.tech_stack.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md bg-muted/40 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
            {company.tech_stack.length > 3 && (
              <span className="px-2 py-0.5 rounded-md bg-muted/40 text-xs text-muted-foreground">
                +{company.tech_stack.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer — verified-since on left, open jobs on right (matches mockup
            after rating was removed). Pushed to bottom with mt-auto so cards
            of varying content height align their feet. */}
        <div className="flex items-center justify-between mt-auto pt-4 text-xs">
          <span className="text-muted-foreground inline-flex items-center gap-1">
            {company.is_verified && company.founded_year ? (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Zweryfikowana od {company.founded_year}
              </>
            ) : company.founded_year ? (
              <>Założona w {company.founded_year}</>
            ) : null}
          </span>
          {company.open_jobs_count > 0 && (
            <Link
              href={company.slug ? `/firmy/${company.slug}` : "#"}
              className="text-amber-400 hover:text-amber-300 font-medium"
            >
              {company.open_jobs_count}{" "}
              {company.open_jobs_count === 1 ? "oferta pracy" : company.open_jobs_count < 5 ? "oferty pracy" : "ofert pracy"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
