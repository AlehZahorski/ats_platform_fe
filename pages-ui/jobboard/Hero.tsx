"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Briefcase } from "lucide-react";
import { usePublicStats, usePopularCategories } from "@/services/queries/jobBoard.queries";
import { CATEGORY_MAP } from "@/features/jobs/lib/categories";
import { useTranslations } from "next-intl";

interface Props {
  /** Called when search submitted — usually scrolls to board or updates URL params */
  onSearch?: (params: { q: string; location: string }) => void;
}

export function Hero({ onSearch }: Props) {
  const router = useRouter();
  const { data: stats } = usePublicStats();
  const { data: popular } = usePopularCategories(8);
  const tCat = useTranslations("jobs.categories");

  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    if (onSearch) {
      onSearch({ q, location });
    } else {
      // Build URL params and navigate
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (location) params.set("location", location);
      router.push(`/jobs?${params.toString()}`);
    }
  };

  const handlePopularClick = (code: string) => {
    const params = new URLSearchParams();
    params.set("category", code);
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden border-b border-border/40">
      {/* Subtle radial glow in the background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-400/[0.03] via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-[600px] h-[400px] -z-10 bg-amber-400/5 blur-[100px] rounded-full" />

      <div className="max-w-[1100px] mx-auto px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          Znajdź pracę, którą{" "}
          <span className="text-amber-400 italic font-serif">naprawdę</span>{" "}
          chcesz wykonywać
        </h1>

        {stats && (
          <p className="mt-4 text-sm text-muted-foreground">
            <strong className="text-foreground">{stats.total_jobs.toLocaleString("pl-PL")}</strong>{" "}
            aktywnych ofert od{" "}
            <strong className="text-foreground">{stats.total_companies.toLocaleString("pl-PL")}</strong>{" "}
            firm
          </p>
        )}

        {/* Search bar */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch gap-2 max-w-3xl mx-auto">
          <div className="flex-1 relative">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Stanowisko, firma lub technologia…"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
          </div>
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Lokalizacja lub tryb pracy"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="px-8 py-3.5 rounded-xl bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Szukaj
          </button>
        </div>

        {/* Popular categories — horizontal scroll row.
            No "Popularne:" label per user request; chips wrap if room, or scroll
            horizontally on narrow viewports. Gradient fades on the edges hint
            scrollability without taking visual space. Snap-x makes mobile swipe
            land cleanly on the next chip. */}
        {popular && popular.items.length > 0 && (
          <div className="relative mt-6 -mx-4 sm:mx-0">
            {/* Edge fades only when scroll is possible (overflow). Visual hint only. */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-10 bg-gradient-to-l from-background to-transparent z-10" />

            <div
              className="flex items-center gap-2 overflow-x-auto px-4 sm:px-10 py-1 snap-x snap-proximity scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
            >
              {popular.items.map((item) => {
                const def = CATEGORY_MAP[item.category];
                const label = def ? tCat(def.code as never) : item.category;
                return (
                  <button
                    key={item.category}
                    type="button"
                    onClick={() => handlePopularClick(item.category)}
                    className="snap-start shrink-0 px-3.5 py-1.5 rounded-full border border-border bg-card hover:border-amber-400/60 hover:bg-amber-400/5 text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
