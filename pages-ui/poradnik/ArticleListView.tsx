"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ARTICLE_CATEGORIES, categoryLabel } from "@/entities/article";
import {
  useArticleCategories,
  useFeaturedArticle,
  usePublicArticles,
} from "@/services/queries/articles.queries";
import { ArticleCard } from "./ArticleCard";
import { FeaturedArticle } from "./FeaturedArticle";
import { NewsletterSignup } from "./NewsletterSignup";

const PAGE_SIZE = 9;

/** Hero copy + URL config — different per article flavour so /poradnik
 * and /firmy-pisza read like distinct destinations even though they
 * share 95% of the rendering code. */
export interface ArticleListConfig {
  type:              "editorial" | "company";
  /** Browser URL the page lives at — used for setting query params. */
  routePath:         string;
  heroTitle:         string;
  heroAccent:        string;
  heroSubtitle:      string;
  searchPlaceholder: string;
  latestTitle:       string;
  latestAccent:      string;
}


export function ArticleListView({ config }: { config: ArticleListConfig }) {
  const router = useRouter();
  const sp = useSearchParams();

  const category = sp.get("category") || undefined;
  const q        = sp.get("q") || undefined;
  const sort     = (sp.get("sort") as "newest" | "oldest") || "newest";
  const [page, setPage] = useState(0);

  useEffect(() => setPage(0), [category, q, sort]);

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(sp);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${config.routePath}?${next.toString()}`, { scroll: false });
  };

  const noFilter = !category && !q;
  const { data: featured } = useFeaturedArticle(config.type);
  const { data: cats }     = useArticleCategories(config.type);

  const { data, isLoading } = usePublicArticles({
    q, category, sort,
    type: config.type,
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    exclude_featured: noFilter && !!featured,
  });

  const totalAll = useMemo(() => (cats ?? []).reduce((s, c) => s + c.count, 0), [cats]);
  const countFor = (value: string) => cats?.find((c) => c.category === value)?.count;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Hero — centered template, same shape as /jobs and /firmy. */}
      <header className="max-w-[1100px] mx-auto px-4 py-12 md:py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          {config.heroTitle}{" "}
          <span className="text-amber-400 italic font-serif">{config.heroAccent}</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">{config.heroSubtitle}</p>

        {/* Search bar */}
        <div className="mt-8 relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q ?? ""}
            onChange={(e) => setParam("q", e.target.value || undefined)}
            placeholder={config.searchPlaceholder}
            className="w-full pl-11 pr-4 py-3.5 rounded-full border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>

        {/* Category chips */}
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap">
          <CategoryChip
            label="Wszystkie"
            count={totalAll}
            active={!category}
            onClick={() => setParam("category", undefined)}
          />
          {ARTICLE_CATEGORIES.map((c) => (
            <CategoryChip
              key={c.value}
              label={c.label}
              count={countFor(c.value)}
              active={category === c.value}
              onClick={() => setParam("category", category === c.value ? undefined : c.value)}
            />
          ))}
        </div>
      </header>

      {/* Featured */}
      {noFilter && featured && (
        <section className="mb-12">
          <FeaturedArticle article={featured} />
        </section>
      )}

      {/* Section header */}
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-amber-400">
            {category ? categoryLabel(category) : q ? "Wyniki wyszukiwania" : "Najnowsze"}
          </div>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold leading-tight">
            {category ? (
              <>Artykuły z kategorii „<span className="italic font-serif">{categoryLabel(category)}</span>”</>
            ) : q ? (
              <>Znalezione „<span className="italic font-serif">{q}</span>”</>
            ) : (
              <>{config.latestTitle} <span className="text-amber-400 italic font-serif">{config.latestAccent}</span></>
            )}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs text-muted-foreground">Sortuj:</span>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value === "newest" ? undefined : e.target.value)}
            className="bg-card border border-border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          >
            <option value="newest">Najnowsze</option>
            <option value="oldest">Najstarsze</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading &&
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-[420px] rounded-xl border border-border bg-card animate-pulse" />
          ))}
        {!isLoading && data?.items.map((a) => <ArticleCard key={a.id} article={a} />)}
      </section>

      {!isLoading && data && data.items.length === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
          Brak artykułów pasujących do filtrów. Spróbuj je rozluźnić.
        </div>
      )}

      {data && data.total > PAGE_SIZE && (
        <Pagination
          page={page}
          totalPages={Math.ceil(data.total / PAGE_SIZE)}
          onChange={setPage}
        />
      )}

      <div className="mt-14">
        <NewsletterSignup />
      </div>
    </div>
  );
}


function CategoryChip({
  label, count, active, onClick,
}: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 px-4 py-1.5 rounded-full border text-sm transition-colors inline-flex items-center gap-2",
        active
          ? "border-amber-400 bg-amber-400/10 text-amber-400"
          : "border-border bg-card text-muted-foreground hover:border-amber-400/40 hover:text-foreground",
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


function Pagination({
  page, totalPages, onChange,
}: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const maxBtns = 5;
  const start = Math.max(0, Math.min(page - 2, totalPages - maxBtns));
  const end = Math.min(totalPages, start + maxBtns);
  const btns = Array.from({ length: end - start }, (_, i) => start + i);
  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button type="button" disabled={page === 0} onClick={() => onChange(page - 1)}
        className="px-3 py-2 rounded-md border border-border text-sm disabled:opacity-40">←</button>
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
        className="px-3 py-2 rounded-md border border-border text-sm disabled:opacity-40">→</button>
    </div>
  );
}
