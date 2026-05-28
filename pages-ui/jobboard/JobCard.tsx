"use client";

import Link from "next/link";
import { Heart, MapPin, Wallet, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PublicJobSummary } from "@/services/api/jobBoard";
import { formatSalary, timeAgoPl, htmlToBullets } from "./lib/formatting";
import { VerifiedBadge } from "./VerifiedBadge";

interface Props {
  job: PublicJobSummary;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onToggleSaved: () => void;
}

export function JobCard({ job, selected, saved, onSelect, onToggleSaved }: Props) {
  const tWork = useTranslations("jobs.workMode");
  const tContract = useTranslations("apply.jobBoard.values.contractType");

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.salary_period);
  const techs = htmlToBullets(job.tech_stack);
  // applications_count is fed by future endpoint enhancement — for now show "ostatnio dodane"
  const meta = timeAgoPl(job.created_at);

  return (
    // Using a div with role="button" instead of a real <button> because the
    // card needs to contain the "Save" heart button — HTML disallows nested
    // <button>, which causes a hydration error and breaks click forwarding.
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "w-full text-left rounded-xl border bg-card transition-colors p-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400/40",
        selected
          ? "border-amber-400/60 ring-1 ring-amber-400/30"
          : "border-border hover:border-border/80 hover:bg-card/80"
      )}
    >
      <div className="flex items-start gap-4">
        <CompanyAvatar name={job.company?.name ?? "?"} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {job.company?.slug ? (
              // Clicking the name jumps to the company profile. Stop propagation
              // so we don't also fire the parent card's onSelect (which would
              // open the job detail panel — opposite of what the user wants).
              <Link
                href={`/firmy/${job.company.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium text-muted-foreground hover:text-amber-400 hover:underline"
              >
                {job.company.name}
              </Link>
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                {job.company?.name ?? "—"}
              </span>
            )}
            {job.company?.is_verified && <VerifiedBadge size={14} />}
          </div>
          <h3 className="text-base font-semibold text-foreground truncate">{job.title}</h3>

          {/* Meta chips row */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {job.location}
              </span>
            )}
            {job.work_mode && (
              <span className="flex items-center gap-1">
                <Home className="w-3 h-3" /> {tWork(job.work_mode as never)}
              </span>
            )}
            {salary && (
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <Wallet className="w-3 h-3" /> {salary}
              </span>
            )}
          </div>

          {/* Tech tags */}
          {techs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {techs.slice(0, 5).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-muted/40 text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
              {techs.length > 5 && (
                <span className="px-2 py-0.5 rounded-md bg-muted/40 text-xs text-muted-foreground">
                  +{techs.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>Opublikowano {meta}</span>
            {job.contract_type && (
              <span className="text-foreground/80">{tContract(job.contract_type as never)}</span>
            )}
          </div>
        </div>

        {/* Save heart */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSaved();
          }}
          className={cn(
            "p-2 rounded-full hover:bg-accent/40 shrink-0",
            saved ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
          )}
          title={saved ? "Usuń z obserwowanych" : "Obserwuj ofertę"}
        >
          <Heart className={cn("w-5 h-5", saved && "fill-current")} />
        </button>
      </div>
    </div>
  );
}

function CompanyAvatar({ name }: { name: string }) {
  // Placeholder square avatar with first letter — until companies upload logos.
  const letter = (name?.trim()?.charAt(0) || "?").toUpperCase();
  const hue = letterHue(letter);
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0 text-sm"
      style={{ backgroundColor: hue }}
    >
      {letter}
    </div>
  );
}

function letterHue(letter: string): string {
  // Deterministic hue per letter so the avatar is stable across renders.
  const PALETTE = ["#F59E0B", "#10B981", "#3B82F6", "#A855F7", "#EC4899", "#F43F5E", "#06B6D4"];
  return PALETTE[letter.charCodeAt(0) % PALETTE.length];
}
