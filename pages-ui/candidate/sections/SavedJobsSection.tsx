"use client";

import Link from "next/link";
import { Heart, MapPin, Wallet, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSavedJobs, useCandidateMe } from "@/services/queries/jobBoard.queries";
import { usePublicJobBoard } from "@/services/queries/jobBoard.queries";
import { useSavedJobsSet } from "@/pages-ui/jobboard/hooks/useSavedJobsSet";
import { formatSalary, timeAgoPl } from "@/pages-ui/jobboard/lib/formatting";
import { ROUTES } from "@/config/routes";

export function SavedJobsSection() {
  const { data: me } = useCandidateMe();
  const { data: savedRows } = useSavedJobs();
  const { toggle } = useSavedJobsSet();
  const tWork = useTranslations("jobs.workMode");

  // We need full job info to render cards — there's no single endpoint that
  // fetches "jobs by id list", so we fetch the recent open jobs and intersect.
  // This is a compromise for MVP; a /jobs/by-ids endpoint would be better.
  const { data: board } = usePublicJobBoard({ limit: 200 });

  if (!me) return null;

  const savedIds = new Set((savedRows ?? []).map((s) => s.job_id));
  const items = (board?.items ?? []).filter((j) => savedIds.has(j.id));

  if (items.length === 0 && savedIds.size === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <Heart className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Nie masz jeszcze obserwowanych ofert. Kliknij ❤️ na karcie oferty, żeby ją zapisać.
        </p>
        <Link
          href={ROUTES.public.jobs}
          className="inline-block mt-4 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300"
        >
          Przeglądaj oferty
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((job) => {
        const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.salary_period);
        return (
          <div
            key={job.id}
            className="rounded-xl border border-border bg-card p-4 flex items-start gap-3"
          >
            <div className="flex-1 min-w-0">
              <Link
                href={`${ROUTES.public.jobs}?job=${job.id}`}
                className="block text-base font-semibold hover:text-amber-400 truncate"
              >
                {job.title}
              </Link>
              <div className="text-sm text-muted-foreground mt-0.5">
                {job.company?.name} · {timeAgoPl(job.created_at)}
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>}
                {job.work_mode && <span>{tWork(job.work_mode as never)}</span>}
                {salary && <span className="flex items-center gap-1 text-emerald-500 font-medium"><Wallet className="w-3 h-3" /> {salary}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`${ROUTES.public.jobs}?job=${job.id}`}
                className="p-2 rounded-md hover:bg-accent/40 text-muted-foreground"
                title="Zobacz ofertę"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => toggle(job.id)}
                className="p-2 rounded-md text-rose-500 hover:bg-accent/40"
                title="Usuń z obserwowanych"
              >
                <Heart className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        );
      })}

      {/* Saved ids not visible in the current page of open jobs (filtered out, closed, etc.) */}
      {savedIds.size > items.length && (
        <p className="text-xs text-muted-foreground text-center pt-2">
          + {savedIds.size - items.length} obserwowanych ofert nie jest widocznych
          (mogły zostać zamknięte lub przekroczyły bieżącą stronę).
        </p>
      )}
    </div>
  );
}
