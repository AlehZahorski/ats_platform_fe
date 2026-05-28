"use client";

import Link from "next/link";
import { Bookmark, MapPin, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicCompanyJobs } from "@/services/queries/companies.queries";
import type { PublicCompanyJob } from "@/services/api/companies";
import type { CompanyPublicDetail } from "@/entities/company";
import { formatSalary, timeAgoPl } from "@/pages-ui/jobboard/lib/formatting";

interface Props {
  company: CompanyPublicDetail;
  onToggleSavedCompany: () => void;
  followingCompany: boolean;
}

/** "Aktualne oferty pracy" — always rendered, even if zero jobs. Empty
 * state converts the dead space into a CTA to follow the company so the
 * candidate gets notified when something opens. */
export function JobsSection({ company, onToggleSavedCompany, followingCompany }: Props) {
  const { data, isLoading } = usePublicCompanyJobs(company.slug, 6);

  return (
    <section id="oferty" className="rounded-2xl border border-border bg-card p-6">
      <header className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Aktualne oferty pracy</h2>
        {data && data.total > (data.items?.length ?? 0) && (
          <Link
            href={`/jobs?q=${encodeURIComponent(company.name)}`}
            className="text-xs text-amber-400 hover:text-amber-300"
          >
            Zobacz wszystkie oferty →
          </Link>
        )}
      </header>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg border border-border bg-background animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && data && data.items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Aktualnie brak otwartych rekrutacji.
          </p>
          <button
            type="button"
            onClick={onToggleSavedCompany}
            className={cn(
              "mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
              followingCompany
                ? "border-amber-400/60 bg-amber-400/10 text-amber-400"
                : "border-border bg-card hover:border-amber-400/40"
            )}
          >
            <Bookmark className={cn("w-4 h-4", followingCompany && "fill-current")} />
            {followingCompany ? "Obserwujesz" : "Obserwuj firmę"}
          </button>
          <p className="mt-2 text-xs text-muted-foreground">
            Damy znać, gdy {company.name} doda nową ofertę.
          </p>
        </div>
      )}

      {!isLoading && data && data.items.length > 0 && (
        <ul className="space-y-2">
          {data.items.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </ul>
      )}
    </section>
  );
}

function JobRow({ job }: { job: PublicCompanyJob }) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.salary_period);
  const techs = job.tech_stack?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];

  return (
    <li>
      <Link
        href={`/jobs?job=${job.id}`}
        className="block rounded-lg border border-border bg-background hover:border-amber-400/40 transition-colors p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold truncate">{job.title}</h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {job.work_mode && <span>{job.work_mode === "remote" ? "Zdalnie" : job.work_mode === "hybrid" ? "Hybrydowo" : "Stacjonarnie"}</span>}
              {job.employment_size === "full" && <span>Pełny etat</span>}
              {job.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {job.location}
                </span>
              )}
            </div>
            {techs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {techs.slice(0, 4).map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-muted/40 text-xs text-muted-foreground">{t}</span>
                ))}
                {techs.length > 4 && (
                  <span className="px-2 py-0.5 rounded-md bg-muted/40 text-xs text-muted-foreground">+{techs.length - 4}</span>
                )}
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            {salary && (
              <div className="text-sm text-emerald-400 font-medium inline-flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> {salary}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">{timeAgoPl(job.created_at)}</div>
          </div>
        </div>
      </Link>
    </li>
  );
}
