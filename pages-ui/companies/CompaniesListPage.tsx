"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, X, ShieldCheck, MessageCircle, Zap, Bookmark, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicCompanies } from "@/services/queries/companies.queries";
import { CompanyCard } from "./CompanyCard";
import { CompanyFilterSidebar } from "./CompanyFilterSidebar";
import { useSavedCompaniesSet } from "./hooks/useSavedCompaniesSet";
import {
  type CompanyListFilters,
  QUICK_INDUSTRY_CHIPS,
  activeFilterCount,
  filtersFromQuery,
  filtersToQuery,
  toggleArr,
} from "./lib/filters";

const PAGE_SIZE = 24;

export function CompaniesListPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const filters = useMemo(() => filtersFromQuery(sp), [sp]);
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [
    filters.q, filters.location, filters.sort, filters.tab, filters.verified_only,
    JSON.stringify(filters.industry),
    JSON.stringify(filters.size),
    JSON.stringify(filters.work_mode),
  ]);

  const setFilters = (next: CompanyListFilters) => {
    const qs = filtersToQuery(next);
    router.replace(`/firmy?${qs.toString()}`, { scroll: false });
  };

  const { data, isLoading } = usePublicCompanies({
    q: filters.q,
    industry: filters.industry,
    size: filters.size,
    work_mode: filters.work_mode,
    location: filters.location,
    verified_only: filters.verified_only,
    sort: filters.sort,
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });

  const { savedSet, toggle: toggleSaved } = useSavedCompaniesSet();

  // "Obserwowane" tab — client-side filter over the current page.
  const displayed = useMemo(() => {
    if (!data?.items) return [];
    if (filters.tab === "saved") return data.items.filter((c) => savedSet.has(c.id));
    return data.items;
  }, [data, filters.tab, savedSet]);

  const filterCount = activeFilterCount(filters);
  const activeIndustry = filters.industry?.[0];

  return (
    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Hero — heading + search + industry chips, all centered. Mirrors the
          /jobs Hero so the two public landing pages feel like one family. */}
      <header className="max-w-[1100px] mx-auto px-4 py-12 md:py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          Poznaj firmy, do których{" "}
          <span className="text-amber-400 italic font-serif">warto dołączyć</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Zweryfikowani pracodawcy, transparentne informacje i opinie kandydatów.
        </p>

        {/* Search bar */}
        <div className="mt-8 relative max-w-3xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={filters.q ?? ""}
            onChange={(e) => setFilters({ ...filters, q: e.target.value || undefined })}
            placeholder="Szukaj firmy po nazwie, technologii lub lokalizacji…"
            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>

        {/* Industry quick chips — centered row that scrolls horizontally on
            narrow viewports, with edge fades to hint scrollability. */}
        <div className="relative mt-6">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 px-8 scrollbar-hide">
            <IndustryChip
              label="Wszystkie firmy"
              active={!activeIndustry}
              onClick={() => setFilters({ ...filters, industry: undefined })}
              count={data?.total}
            />
            {QUICK_INDUSTRY_CHIPS.map((c) => (
              <IndustryChip
                key={c.value}
                label={c.label}
                active={activeIndustry === c.value}
                onClick={() =>
                  setFilters({
                    ...filters,
                    industry: activeIndustry === c.value ? undefined : [c.value],
                  })
                }
              />
            ))}
          </div>
        </div>
      </header>

      {/* Layout: sidebar + grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
        <div className="hidden lg:block">
          <CompanyFilterSidebar filters={filters} onChange={setFilters} />
        </div>

        <div className="min-w-0">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-border mb-4">
            <div className="flex">
              <TabButton
                active={!filters.tab || filters.tab === "all"}
                onClick={() => setFilters({ ...filters, tab: "all" })}
              >
                Wszystkie firmy
              </TabButton>
              <TabButton
                active={filters.tab === "saved"}
                onClick={() => setFilters({ ...filters, tab: "saved" })}
              >
                Obserwowane ({savedSet.size})
              </TabButton>
            </div>
            {data && (
              <span className="text-xs text-muted-foreground pb-2">
                Znaleziono {data.total.toLocaleString("pl-PL")} firm
              </span>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {isLoading &&
              [...Array(8)].map((_, i) => (
                <div key={i} className="h-72 rounded-xl border border-border bg-card animate-pulse" />
              ))}
            {!isLoading &&
              displayed.map((c) => (
                <CompanyCard
                  key={c.id}
                  company={c}
                  saved={savedSet.has(c.id)}
                  onToggleSaved={() => toggleSaved(c.id)}
                />
              ))}
          </div>

          {!isLoading && displayed.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
              {filters.tab === "saved"
                ? "Nie obserwujesz jeszcze żadnej firmy. Kliknij zakładkę na karcie firmy, aby ją zapisać."
                : "Brak firm pasujących do filtrów. Spróbuj je rozluźnić."}
            </div>
          )}

          {/* Pagination */}
          {data && data.total > PAGE_SIZE && (
            <Pagination
              page={page}
              totalPages={Math.ceil(data.total / PAGE_SIZE)}
              onChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Bottom stats + add-company CTA */}
      <section className="mt-12 rounded-2xl border border-border bg-card p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat icon={<ShieldCheck className="w-5 h-5 text-amber-400" />} value={data?.total ?? "—"} label="zweryfikowanych firm" />
        <Stat icon={<MessageCircle className="w-5 h-5 text-amber-400" />} value="Transparentność" label="wynagrodzenia, procesy i opinie bez ukrywania" />
        <Stat icon={<Zap className="w-5 h-5 text-amber-400" />} value="Szybka aplikacja" label="aplikuj w 2 minuty bez zakładania konta" />
        <Stat icon={<Bookmark className="w-5 h-5 text-amber-400" />} value="Obserwuj firmy" label="zapisuj firmy, które Cię interesują" />
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-400" />
            Dodaj swoją firmę
          </h3>
          <p className="text-sm text-muted-foreground">
            Pokaż się najlepszym talentom i zbuduj silny zespół.
          </p>
        </div>
        <Link
          href="/dla-pracodawcow"
          className="px-5 py-2.5 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors"
        >
          Dodaj firmę →
        </Link>
      </section>

      {/* Mobile filters button + drawer — mirrors job-board pattern */}
      <button
        type="button"
        onClick={() => setFiltersOpen(true)}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-5 py-3 rounded-full bg-amber-400 text-black text-sm font-semibold shadow-xl hover:bg-amber-300 transition-colors"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtry
        {filterCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-black text-amber-400 text-xs font-bold">
            {filterCount}
          </span>
        )}
      </button>

      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-[88%] max-w-md h-full bg-background border-r border-border overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtry
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <CompanyFilterSidebar filters={filters} onChange={setFilters} />
            </div>
            <div className="sticky bottom-0 bg-background border-t border-border p-3">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full py-3 rounded-lg bg-amber-400 text-black font-semibold hover:bg-amber-300"
              >
                Pokaż firmy
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label="Zamknij filtry"
            onClick={() => setFiltersOpen(false)}
            className="flex-1 bg-black/60 backdrop-blur-sm"
          />
        </div>
      )}
    </div>
  );
}


function IndustryChip({
  label, active, onClick, count,
}: { label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 px-3.5 py-1.5 rounded-full border text-xs transition-colors flex items-center gap-2",
        active
          ? "border-amber-400 bg-amber-400/10 text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-amber-400/60 hover:text-foreground"
      )}
    >
      {label}
      {count != null && (
        <span className={cn("text-[10px] tabular-nums", active ? "text-amber-400" : "text-muted-foreground/70")}>
          {count}
        </span>
      )}
    </button>
  );
}


function TabButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
        active ? "border-amber-400 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}


function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-md bg-amber-400/10">{icon}</div>
      <div>
        <div className="font-semibold text-sm">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}


function Pagination({
  page, totalPages, onChange,
}: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const maxBtns = 5;
  const start = Math.max(0, Math.min(page - 2, totalPages - maxBtns));
  const end = Math.min(totalPages, start + maxBtns);
  const btns = Array.from({ length: end - start }, (_, i) => start + i);
  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button type="button" disabled={page === 0} onClick={() => onChange(page - 1)}
        className="px-3 py-2 rounded-md border border-border text-sm disabled:opacity-40">‹</button>
      {start > 0 && <button onClick={() => onChange(0)} className="px-3 py-2 rounded-md border border-border text-sm">1</button>}
      {start > 1 && <span className="px-2 text-muted-foreground">…</span>}
      {btns.map((i) => (
        <button key={i} type="button" onClick={() => onChange(i)}
          className={cn(
            "px-3 py-2 rounded-md text-sm",
            i === page ? "bg-amber-400 text-black font-semibold" : "border border-border hover:bg-accent/40"
          )}>
          {i + 1}
        </button>
      ))}
      {end < totalPages - 1 && <span className="px-2 text-muted-foreground">…</span>}
      {end < totalPages && (
        <button onClick={() => onChange(totalPages - 1)} className="px-3 py-2 rounded-md border border-border text-sm">
          {totalPages}
        </button>
      )}
      <button type="button" disabled={page === totalPages - 1} onClick={() => onChange(page + 1)}
        className="px-3 py-2 rounded-md border border-border text-sm disabled:opacity-40">›</button>
    </div>
  );
}
