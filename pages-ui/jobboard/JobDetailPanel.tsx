"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, MapPin, Wallet, Briefcase, Building2, MoreVertical, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { usePublicJobDetail } from "@/services/queries/jobBoard.queries";
import { formatSalary, htmlToBullets, timeAgoPl } from "./lib/formatting";
import { VerifiedBadge } from "./VerifiedBadge";
import { ROUTES } from "@/config/routes";

interface Props {
  jobId: string | null;
  saved: boolean;
  onToggleSaved: () => void;
}

type Tab = "description" | "company" | "benefits" | "process";

export function JobDetailPanel({ jobId, saved, onToggleSaved }: Props) {
  const { data: job, isLoading, isError } = usePublicJobDetail(jobId);
  const [tab, setTab] = useState<Tab>("description");

  // Stale ID in URL (e.g. after re-seed) → show a friendly notice instead of
  // letting the request 404 endlessly in the background.
  if (jobId && isError) {
    return (
      <aside className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
        Oferta jest już niedostępna lub została zamknięta.
        <div className="text-xs mt-2">Wybierz inną z listy po lewej.</div>
      </aside>
    );
  }

  const tWork = useTranslations("jobs.workMode");
  const tContract = useTranslations("apply.jobBoard.values.contractType");

  if (!jobId) {
    return (
      <aside className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
        Wybierz ofertę z listy, żeby zobaczyć szczegóły.
      </aside>
    );
  }

  if (isLoading || !job) {
    return (
      <aside className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-6 bg-muted/40 rounded w-2/3 mb-3" />
        <div className="h-4 bg-muted/40 rounded w-1/3 mb-6" />
        <div className="space-y-2">
          <div className="h-3 bg-muted/40 rounded" />
          <div className="h-3 bg-muted/40 rounded w-5/6" />
          <div className="h-3 bg-muted/40 rounded w-4/6" />
        </div>
      </aside>
    );
  }

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency, job.salary_period);
  const responsibilities = htmlToBullets(job.responsibilities);
  const musts = htmlToBullets(job.must_haves);
  const nices = htmlToBullets(job.nice_to_haves);
  const benefits = htmlToBullets(job.benefits);
  const process = htmlToBullets(job.hiring_process);
  const techs = htmlToBullets(job.tech_stack);

  return (
    <aside className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyAvatar name={job.company?.name ?? "?"} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                {job.company?.slug ? (
                  <Link
                    href={`/firmy/${job.company.slug}`}
                    className="text-sm font-medium text-muted-foreground hover:text-amber-400 hover:underline"
                  >
                    {job.company.name}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">{job.company?.name ?? "—"}</span>
                )}
                {job.company?.is_verified && <VerifiedBadge size={14} />}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onToggleSaved}
              className={cn(
                "p-2 rounded-full hover:bg-accent/40",
                saved ? "text-rose-500" : "text-muted-foreground hover:text-foreground"
              )}
              title={saved ? "Usuń z obserwowanych" : "Obserwuj"}
            >
              <Heart className={cn("w-5 h-5", saved && "fill-current")} />
            </button>
            <Link
              href={ROUTES.public.apply(jobId)}
              className="px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors"
            >
              Aplikuj teraz
            </Link>
            {/* Dead-end "kebab" menu removed — no onClick, no aria-label,
                no menu wired up. Reinstate when we actually have items
                like "Share", "Copy link", "Report ad". */}
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-3">{job.title}</h2>

        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
          {job.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {job.location}
              {job.work_mode && job.work_mode !== "office" && ` (${tWork(job.work_mode as never)})`}
            </span>
          )}
          {job.contract_type && (
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> {tContract(job.contract_type as never)}
            </span>
          )}
          {salary && (
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <Wallet className="w-3.5 h-3.5" /> {salary}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-border flex gap-1">
        <TabButton active={tab === "description"} onClick={() => setTab("description")}>
          Opis oferty
        </TabButton>
        <TabButton active={tab === "company"} onClick={() => setTab("company")}>
          O firmie
        </TabButton>
        <TabButton active={tab === "benefits"} onClick={() => setTab("benefits")}>
          Benefity
        </TabButton>
        <TabButton active={tab === "process"} onClick={() => setTab("process")}>
          Proces rekrutacji
        </TabButton>
      </div>

      {/* Body */}
      <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5 text-sm">
        {tab === "description" && (
          <>
            {job.role_summary && (
              <Section title="O roli">
                <p className="text-foreground/90 leading-relaxed">{job.role_summary}</p>
              </Section>
            )}
            {responsibilities.length > 0 && (
              <Section title="Twoje obowiązki">
                <ul className="space-y-1.5">
                  {responsibilities.map((r) => (
                    <li key={r} className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">•</span>
                      <span className="text-foreground/90">{r}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {(musts.length > 0 || nices.length > 0) && (
              <Section title="Wymagania">
                {musts.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-emerald-500 mb-1.5">Wymagane</div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {musts.map((m) => (
                        <span key={m} className="px-2 py-1 rounded-md border border-border bg-card text-xs">
                          {m}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {nices.length > 0 && (
                  <>
                    <div className="text-xs font-medium text-muted-foreground mb-1.5">Mile widziane</div>
                    <div className="flex flex-wrap gap-1.5">
                      {nices.map((n) => (
                        <span key={n} className="px-2 py-1 rounded-md border border-border bg-card text-xs text-muted-foreground">
                          {n}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </Section>
            )}
            {techs.length > 0 && (
              <Section title="Tech stack">
                <div className="flex flex-wrap gap-1.5">
                  {techs.map((t) => (
                    <span key={t} className="px-2 py-1 rounded-md bg-amber-400/10 text-amber-400 text-xs font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {tab === "company" && (
          <Section title="O firmie">
            <p className="text-foreground/90 leading-relaxed">
              {job.team_context || job.value_proposition || "Brak opisu firmy."}
            </p>
            {job.company && (
              <div className="mt-4 p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{job.company.name}</span>
                  {job.company.is_verified && <VerifiedBadge size={14} />}
                </div>
                <Link
                  href={`${ROUTES.public.companies}/${job.company.id}`}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  Zobacz profil <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </Section>
        )}

        {tab === "benefits" && (
          <Section title="Co oferujemy">
            {benefits.length > 0 ? (
              <ul className="space-y-1.5">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-1">✓</span>
                    <span className="text-foreground/90">{b}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Brak wymienionych benefitów.</p>
            )}
          </Section>
        )}

        {tab === "process" && (
          <Section title="Proces rekrutacji">
            {process.length > 0 ? (
              <ol className="space-y-2">
                {process.map((p, i) => (
                  <li key={p} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400/10 text-amber-400 text-xs font-semibold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-foreground/90">{p}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-muted-foreground">Standardowy proces: CV → rozmowa → decyzja.</p>
            )}
          </Section>
        )}

        <div className="text-xs text-muted-foreground pt-4 border-t border-border">
          Opublikowano {timeAgoPl(job.created_at)}
          {job.slug && (
            <> · ID: <span className="font-mono">{job.slug.toUpperCase().slice(0, 20)}</span></>
          )}
        </div>
      </div>

      {/* Sticky bottom CTA on narrow */}
      <div className="px-6 py-3 border-t border-border bg-card">
        <Link
          href={ROUTES.public.apply(jobId)}
          className="w-full block text-center py-3 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors"
        >
          Aplikuj teraz
        </Link>
      </div>
    </aside>
  );
}

function CompanyAvatar({ name }: { name: string }) {
  const letter = (name?.trim()?.charAt(0) || "?").toUpperCase();
  const PALETTE = ["#F59E0B", "#10B981", "#3B82F6", "#A855F7", "#EC4899", "#F43F5E", "#06B6D4"];
  const color = PALETTE[letter.charCodeAt(0) % PALETTE.length];
  return (
    <div
      className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {letter}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
        active ? "border-amber-400 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
