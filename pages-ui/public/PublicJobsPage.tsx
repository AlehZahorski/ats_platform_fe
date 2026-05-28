"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Briefcase, MapPin, Search, ArrowRight, Wallet, Clock3, SlidersHorizontal } from "lucide-react";
import { usePublicJobs } from "@/services/queries";
import type { ContractType, PublicJobListItem, SalaryPeriod, WorkMode } from "@/types";

function translateWorkMode(value: WorkMode | null, t: ReturnType<typeof useTranslations>) {
  if (!value) return null;
  const map: Record<WorkMode, string> = { remote: t("jobBoard.values.workMode.remote"), hybrid: t("jobBoard.values.workMode.hybrid"), onsite: t("jobBoard.values.workMode.onsite") };
  return map[value];
}

function translateSalaryPeriod(value: SalaryPeriod | null, t: ReturnType<typeof useTranslations>) {
  if (!value) return null;
  const map: Record<SalaryPeriod, string> = { hour: t("jobBoard.values.salaryPeriod.hour"), month: t("jobBoard.values.salaryPeriod.month"), year: t("jobBoard.values.salaryPeriod.year") };
  return map[value];
}

function translateContractType(value: ContractType | null, t: ReturnType<typeof useTranslations>) {
  if (!value) return null;
  const map: Record<ContractType, string> = {
    b2b: t("jobBoard.values.contractType.b2b"), employment: t("jobBoard.values.contractType.employment"),
    contract: t("jobBoard.values.contractType.contract"), internship: t("jobBoard.values.contractType.internship"),
    temporary: t("jobBoard.values.contractType.temporary"),
  };
  return map[value];
}

function getLocationLabel(job: PublicJobListItem, t: ReturnType<typeof useTranslations>) {
  const workMode = translateWorkMode(job.work_mode, t);
  if (job.location) return job.location;
  if (workMode && job.remote_constraints) return `${workMode} • ${job.remote_constraints}`;
  if (job.remote_constraints) return job.remote_constraints;
  return workMode;
}

function getSalaryLabel(job: PublicJobListItem, t: ReturnType<typeof useTranslations>) {
  if (!job.salary_min && !job.salary_max) return null;
  const period = translateSalaryPeriod(job.salary_period, t);
  return `${job.salary_min ?? "?"} - ${job.salary_max ?? "?"} ${job.salary_currency ?? ""}${period ? ` / ${period}` : ""}`;
}

const filterInputClass = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function PublicJobsPage() {
  const t = useTranslations("apply");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") ?? "");
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode | "">((searchParams.get("workMode") as WorkMode | "") ?? "");
  const [contractFilter, setContractFilter] = useState<ContractType | "">((searchParams.get("contractType") as ContractType | "") ?? "");
  const [salaryMinFilter, setSalaryMinFilter] = useState(searchParams.get("salaryMin") ?? "");
  const [salaryMaxFilter, setSalaryMaxFilter] = useState(searchParams.get("salaryMax") ?? "");

  const deferredQuery = useDeferredValue(query.trim());
  const { data, isLoading } = usePublicJobs({ q: deferredQuery || undefined });

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setLocationFilter(searchParams.get("location") ?? "");
    setWorkModeFilter((searchParams.get("workMode") as WorkMode | "") ?? "");
    setContractFilter((searchParams.get("contractType") as ContractType | "") ?? "");
    setSalaryMinFilter(searchParams.get("salaryMin") ?? "");
    setSalaryMaxFilter(searchParams.get("salaryMax") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (locationFilter.trim()) params.set("location", locationFilter.trim());
    if (workModeFilter) params.set("workMode", workModeFilter);
    if (contractFilter) params.set("contractType", contractFilter);
    if (salaryMinFilter) params.set("salaryMin", salaryMinFilter);
    if (salaryMaxFilter) params.set("salaryMax", salaryMaxFilter);
    const next = params.toString();
    if (next !== searchParams.toString()) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [contractFilter, locationFilter, pathname, query, router, salaryMaxFilter, salaryMinFilter, searchParams, workModeFilter]);

  const jobs = useMemo(() => {
    const baseJobs = data?.items ?? [];
    const locationNeedle = locationFilter.trim().toLowerCase();
    const minSalary = salaryMinFilter ? Number(salaryMinFilter) : null;
    const maxSalary = salaryMaxFilter ? Number(salaryMaxFilter) : null;
    return baseJobs.filter((job) => {
      const locationLabel = getLocationLabel(job, t)?.toLowerCase() ?? "";
      if (locationNeedle && !locationLabel.includes(locationNeedle)) return false;
      if (workModeFilter && job.work_mode !== workModeFilter) return false;
      if (contractFilter && job.contract_type !== contractFilter) return false;
      if (minSalary !== null && (job.salary_max ?? job.salary_min ?? 0) < minSalary) return false;
      if (maxSalary !== null && (job.salary_min ?? job.salary_max ?? Number.MAX_SAFE_INTEGER) > maxSalary) return false;
      return true;
    });
  }, [contractFilter, data?.items, locationFilter, salaryMaxFilter, salaryMinFilter, t, workModeFilter]);

  const clearFilters = () => { setLocationFilter(""); setWorkModeFilter(""); setContractFilter(""); setSalaryMinFilter(""); setSalaryMaxFilter(""); };
  const hasActiveFilters = Boolean(locationFilter || workModeFilter || contractFilter || salaryMinFilter || salaryMaxFilter);

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-border bg-card px-6 py-8 shadow-sm">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("jobBoard.eyebrow")}</p>
            <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{t("jobBoard.title")}</h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">{t("jobBoard.description")}</p>
          </div>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("jobBoard.searchPlaceholder")}
                className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <p className="text-sm text-muted-foreground">{t("jobBoard.results", { count: jobs.length })}</p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">{t("jobBoard.filters.title")}</h2>
                </div>
                {hasActiveFilters && (
                  <button type="button" onClick={clearFilters} className="text-xs font-medium text-primary hover:underline">{t("jobBoard.filters.clear")}</button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">{t("jobBoard.filters.location")}</label>
                  <input value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} placeholder={t("jobBoard.filters.locationPlaceholder")} className={filterInputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">{t("jobBoard.filters.workMode")}</label>
                  <select value={workModeFilter} onChange={(e) => setWorkModeFilter(e.target.value as WorkMode | "")} className={filterInputClass}>
                    <option value="">{t("jobBoard.filters.anyWorkMode")}</option>
                    <option value="remote">{t("jobBoard.values.workMode.remote")}</option>
                    <option value="hybrid">{t("jobBoard.values.workMode.hybrid")}</option>
                    <option value="onsite">{t("jobBoard.values.workMode.onsite")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">{t("jobBoard.filters.contractType")}</label>
                  <select value={contractFilter} onChange={(e) => setContractFilter(e.target.value as ContractType | "")} className={filterInputClass}>
                    <option value="">{t("jobBoard.filters.anyContractType")}</option>
                    <option value="employment">{t("jobBoard.values.contractType.employment")}</option>
                    <option value="b2b">{t("jobBoard.values.contractType.b2b")}</option>
                    <option value="contract">{t("jobBoard.values.contractType.contract")}</option>
                    <option value="internship">{t("jobBoard.values.contractType.internship")}</option>
                    <option value="temporary">{t("jobBoard.values.contractType.temporary")}</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">{t("jobBoard.filters.salary")}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" min={0} value={salaryMinFilter} onChange={(e) => setSalaryMinFilter(e.target.value)} placeholder={t("jobBoard.filters.salaryMin")} className={filterInputClass} />
                    <input type="number" min={0} value={salaryMaxFilter} onChange={(e) => setSalaryMaxFilter(e.target.value)} placeholder={t("jobBoard.filters.salaryMax")} className={filterInputClass} />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section>
            {isLoading ? (
              <div className="grid gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-36 animate-pulse rounded-2xl border border-border bg-card" />)}</div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card px-6 py-14 text-center">
                <Briefcase className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                <p className="text-lg font-semibold text-foreground">{t("jobBoard.emptyTitle")}</p>
                <p className="mt-2 text-sm text-muted-foreground">{t("jobBoard.emptyDescription")}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {jobs.map((job) => {
                  const locationLabel = getLocationLabel(job, t);
                  const salaryLabel = getSalaryLabel(job, t);
                  const contractLabel = translateContractType(job.contract_type, t);
                  return (
                    <Link key={job.id} href={`/apply/${job.id}`}
                      className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <h2 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">{job.title}</h2>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              {job.department && <span>{job.department}</span>}
                              {locationLabel && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{locationLabel}</span>}
                            </div>
                          </div>
                          {job.role_summary && (
                            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{job.role_summary}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {salaryLabel && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5"><Wallet className="h-3.5 w-3.5" />{salaryLabel}</span>}
                            {contractLabel && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5"><Clock3 className="h-3.5 w-3.5" />{contractLabel}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                          <span>{t("jobBoard.viewOffer")}</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
