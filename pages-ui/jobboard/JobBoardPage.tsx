"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Hero } from "./Hero";
import { FilterSidebar } from "./FilterSidebar";
import { JobCard } from "./JobCard";
import { JobDetailPanel } from "./JobDetailPanel";
import { useSavedJobsSet } from "./hooks/useSavedJobsSet";
import { usePublicJobBoard } from "@/services/queries/jobBoard.queries";
import { activeFilterCount, filtersFromQuery, filtersToQuery, type JobBoardFilters } from "./lib/filters";
import { cn } from "@/lib/utils";
import { jobBoardApi } from "@/services/api/jobBoard";

const PAGE_SIZE       = 25;  // "Wszystkie oferty" — server-side paginated
const PAGE_SIZE_SAVED = 10;  // "Obserwowane"     — client-side paginated

export function JobBoardPage() {
  const router = useRouter();
  const sp = useSearchParams();

  // Filters are derived from URL on every render — no local state needed.
  const filters = useMemo(() => filtersFromQuery(sp), [sp]);
  const [selectedId, setSelectedId] = useState<string | null>(sp.get("job") ?? null);
  const [page, setPage] = useState(0);

  // Reset to first page when filters change (except when only `job` changes)
  useEffect(() => {
    setPage(0);
  }, [
    filters.q, filters.location, filters.sort, filters.tab, filters.verified_only,
    JSON.stringify(filters.category),
    JSON.stringify(filters.work_mode),
    JSON.stringify(filters.contract_type),
    JSON.stringify(filters.seniority),
    JSON.stringify(filters.employment_size),
    JSON.stringify(filters.shift_system),
    JSON.stringify(filters.qualification),
    filters.salary_min, filters.salary_max,
  ]);

  const setFilters = (next: JobBoardFilters) => {
    const qs = filtersToQuery(next);
    if (selectedId) qs.set("job", selectedId);
    router.replace(`/jobs?${qs.toString()}`, { scroll: false });
  };

  // Tracks whether the user explicitly clicked a card. On narrow screens we
  // open a drawer; the auto-select effect (which fires on first load) must
  // NOT trigger the drawer — only manual clicks should.
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Mobile filters drawer (separate from detail drawer)
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterCount = activeFilterCount(filters);

  const selectJob = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
    const qs = filtersToQuery(filters);
    qs.set("job", id);
    router.replace(`/jobs?${qs.toString()}`, { scroll: false });
  };

  // Search log — fire-and-forget when meaningful filters present
  useEffect(() => {
    if (filters.q || filters.category?.[0] || filters.location) {
      jobBoardApi
        .logSearch({
          query_text: filters.q,
          category: filters.category?.[0],
          location: filters.location,
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q, filters.category?.[0], filters.location]);

  const { savedSet, toggle: toggleSaved } = useSavedJobsSet();
  const isSavedTab = filters.tab === "saved";

  // Local client-side search input — only used on the saved tab. We keep
  // it out of the URL because (a) it filters a small, already-loaded set
  // and (b) the user expects it to clear when they switch tabs.
  const [savedSearch, setSavedSearch] = useState("");
  useEffect(() => {
    if (!isSavedTab) setSavedSearch("");
  }, [isSavedTab]);

  // Stable array of saved IDs — drives both the query and effect dep.
  const savedIds = useMemo(() => Array.from(savedSet), [savedSet]);

  // Two query strategies:
  //   • "All offers"    — server pagination; backend already knows total.
  //   • "Obserwowane"   — fetch only saved jobs in one shot via job_ids[].
  //     Other server-side filters still apply so the user can combine
  //     them. JS-side search + 10-per-page pagination happens below.
  const { data, isLoading } = usePublicJobBoard(
    isSavedTab
      ? {
          job_ids: savedIds,
          // Re-apply structural filters so checking "Tylko zdalne" etc. still
          // narrows the saved list — but skip free-text q (saved search is JS).
          category: filters.category,
          work_mode: filters.work_mode,
          contract_type: filters.contract_type,
          seniority: filters.seniority,
          employment_size: filters.employment_size,
          shift_system: filters.shift_system,
          qualification: filters.qualification,
          verified_only: filters.verified_only,
          location: filters.location,
          salary_min: filters.salary_min,
          salary_max: filters.salary_max,
          sort: filters.sort,
          // 200 is the backend's hard cap and well above what any candidate
          // realistically follows. We never page server-side on this tab.
          skip: 0,
          limit: 200,
        }
      : {
          q: filters.q,
          category: filters.category,
          work_mode: filters.work_mode,
          contract_type: filters.contract_type,
          seniority: filters.seniority,
          employment_size: filters.employment_size,
          shift_system: filters.shift_system,
          qualification: filters.qualification,
          verified_only: filters.verified_only,
          location: filters.location,
          salary_min: filters.salary_min,
          salary_max: filters.salary_max,
          sort: filters.sort,
          skip: page * PAGE_SIZE,
          limit: PAGE_SIZE,
        },
  );

  // Reset client-side page whenever the saved search changes — otherwise
  // typing a query while on page 3 hides results.
  useEffect(() => {
    if (isSavedTab) setPage(0);
  }, [savedSearch, isSavedTab]);

  // For the saved tab, JS-filter the returned set then paginate by hand.
  // For the "all" tab, displayedItems is just whatever the server returned.
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    if (!isSavedTab) return data.items;
    const q = savedSearch.trim().toLowerCase();
    if (!q) return data.items;
    return data.items.filter((j) => {
      return (
        j.title.toLowerCase().includes(q) ||
        (j.company?.name ?? "").toLowerCase().includes(q) ||
        (j.location ?? "").toLowerCase().includes(q)
      );
    });
  }, [data, isSavedTab, savedSearch]);

  const displayedItems = useMemo(() => {
    if (!isSavedTab) return filteredItems;
    const start = page * PAGE_SIZE_SAVED;
    return filteredItems.slice(start, start + PAGE_SIZE_SAVED);
  }, [filteredItems, isSavedTab, page]);

  // Page count: client-side on saved tab, server-side otherwise.
  const totalPages = isSavedTab
    ? Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE_SAVED))
    : data
      ? Math.ceil(data.total / PAGE_SIZE)
      : 0;

  // Auto-select first job when results load and nothing selected
  useEffect(() => {
    if (!selectedId && displayedItems.length > 0) {
      setSelectedId(displayedItems[0].id);
    }
    // If selectedId no longer in results (filter change), clear it
    if (selectedId && displayedItems.length > 0 && !displayedItems.find((j) => j.id === selectedId)) {
      setSelectedId(displayedItems[0].id);
    }
  }, [displayedItems, selectedId]);

  return (
    <div>
      <Hero onSearch={({ q, location }) => setFilters({ ...filters, q: q || undefined, location: location || undefined })} />

      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 grid gap-6 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_clamp(420px,32vw,720px)]">
        {/* Left filters — inline on lg+, drawer on smaller screens */}
        <div className="hidden lg:block">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>

        {/* Middle: tabs + sort + list */}
        <div className="min-w-0">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-border mb-4">
            <div className="flex">
              <TabButton
                active={filters.tab === "all" || !filters.tab}
                onClick={() => setFilters({ ...filters, tab: "all" })}
              >
                Wszystkie oferty
              </TabButton>
              <TabButton
                active={filters.tab === "saved"}
                onClick={() => setFilters({ ...filters, tab: "saved" })}
              >
                Moje obserwacje ({savedSet.size})
              </TabButton>
            </div>
            <div className="flex items-center gap-2 pb-2">
              <span className="text-xs text-muted-foreground">Sortuj:</span>
              <select
                value={filters.sort ?? "newest"}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value as JobBoardFilters["sort"] })}
                className="text-sm bg-card border border-border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              >
                <option value="newest">Najnowsze</option>
                <option value="salary_high">Najwyższe widełki</option>
                <option value="salary_low">Najniższe widełki</option>
              </select>
            </div>
          </div>

          {/* Saved-tab JS search — only visible when there's something to
              filter. Hides when the user has zero saved jobs so the empty
              state below stays the focus. */}
          {isSavedTab && savedSet.size > 0 && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={savedSearch}
                onChange={(e) => setSavedSearch(e.target.value)}
                placeholder="Szukaj w obserwowanych — tytuł, firma, lokalizacja…"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              />
            </div>
          )}

          {/* Result counter — count semantics differ per tab.
              All:   data.total (server-side count of matching jobs).
              Saved: filteredItems.length (after JS search). */}
          {!isLoading && (
            <div className="text-sm text-muted-foreground mb-3">
              {isSavedTab
                ? `Obserwujesz ${filteredItems.length.toLocaleString("pl-PL")} ${plOferty(filteredItems.length)}`
                : data
                  ? `Znaleziono ${data.total.toLocaleString("pl-PL")} ${plOferty(data.total)}`
                  : null}
            </div>
          )}

          {/* List */}
          <div className="space-y-3">
            {isLoading && (
              <>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
                ))}
              </>
            )}
            {!isLoading && displayedItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                {isSavedTab
                  ? savedSet.size === 0
                    ? "Brak obserwowanych ofert. Kliknij ❤️ na ofercie aby ją zapisać."
                    : savedSearch
                      ? `Brak obserwowanych ofert pasujących do „${savedSearch}".`
                      : "Brak ofert pasujących do wybranych filtrów wśród obserwowanych."
                  : "Brak wyników dla wybranych filtrów. Spróbuj je rozluźnić."}
              </div>
            )}
            {displayedItems.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                selected={selectedId === job.id}
                saved={savedSet.has(job.id)}
                onSelect={() => selectJob(job.id)}
                onToggleSaved={() => toggleSaved(job.id)}
              />
            ))}
          </div>

          {/* Pagination — driven by `totalPages` which knows about the tab. */}
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          )}
        </div>

        {/* Right: sticky detail (xl+) */}
        <div className="hidden xl:block xl:sticky xl:top-20 xl:self-start">
          <JobDetailPanel
            jobId={selectedId}
            saved={selectedId ? savedSet.has(selectedId) : false}
            onToggleSaved={() => selectedId && toggleSaved(selectedId)}
          />
        </div>
      </div>

      {/* Drawer (<xl) — slides in from the right when a card is clicked.
          Backdrop covers the page; click-outside closes. */}
      {drawerOpen && selectedId && (
        <div className="xl:hidden fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Zamknij szczegóły"
            onClick={() => setDrawerOpen(false)}
            className="flex-1 bg-black/60 backdrop-blur-sm"
          />
          <div className="w-full max-w-xl bg-background border-l border-border overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <h3 className="text-sm font-semibold">Szczegóły oferty</h3>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="px-3 py-1.5 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40"
              >
                Zamknij
              </button>
            </div>
            <div className="p-4">
              <JobDetailPanel
                jobId={selectedId}
                saved={savedSet.has(selectedId)}
                onToggleSaved={() => toggleSaved(selectedId)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile filter button (<lg). Sits bottom-right, shifted left of the
            preview button if both could collide. Pill style, with active-count
            badge so user knows they have filters applied. ───────────────── */}
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

      {/* Mobile filters drawer — slides in from left, covers ~88% of viewport.
          Holds the same FilterSidebar component so behaviour is identical on
          all screen sizes. Click outside / X button closes it. */}
      {filtersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-[88%] max-w-md h-full bg-background border-r border-border overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtry
                {filterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-black text-xs font-bold">
                    {filterCount}
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40"
                aria-label="Zamknij filtry"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar filters={filters} onChange={setFilters} />
            </div>
            {/* Sticky bottom CTA — quick way to dismiss after picking filters */}
            <div className="sticky bottom-0 bg-background border-t border-border p-3">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full py-3 rounded-lg bg-amber-400 text-black font-semibold hover:bg-amber-300"
              >
                Pokaż oferty
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

/** Polish noun declension for "oferta" — 1 oferta, 2-4 oferty, 5+ ofert. */
function plOferty(n: number): string {
  if (n === 1) return "ofertę";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "oferty";
  return "ofert";
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

function Pagination({
  page, totalPages, onChange,
}: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const maxBtns = 5;
  const start = Math.max(0, Math.min(page - 2, totalPages - maxBtns));
  const end = Math.min(totalPages, start + maxBtns);
  const btns = Array.from({ length: end - start }, (_, i) => start + i);
  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        type="button"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className="px-3 py-2 rounded-md border border-border text-sm disabled:opacity-40"
      >‹</button>
      {start > 0 && <button onClick={() => onChange(0)} className="px-3 py-2 rounded-md border border-border text-sm">1</button>}
      {start > 1 && <span className="px-2 text-muted-foreground">…</span>}
      {btns.map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={cn(
            "px-3 py-2 rounded-md text-sm",
            i === page ? "bg-amber-400 text-black font-semibold" : "border border-border hover:bg-accent/40"
          )}
        >
          {i + 1}
        </button>
      ))}
      {end < totalPages - 1 && <span className="px-2 text-muted-foreground">…</span>}
      {end < totalPages && (
        <button onClick={() => onChange(totalPages - 1)} className="px-3 py-2 rounded-md border border-border text-sm">
          {totalPages}
        </button>
      )}
      <button
        type="button"
        disabled={page === totalPages - 1}
        onClick={() => onChange(page + 1)}
        className="px-3 py-2 rounded-md border border-border text-sm disabled:opacity-40"
      >›</button>
    </div>
  );
}
