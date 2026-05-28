"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  type CompanyListFilters,
  SIZE_BUCKETS,
  WORK_MODES_COMPANY,
  toggleArr,
} from "./lib/filters";

interface Props {
  filters: CompanyListFilters;
  onChange: (next: CompanyListFilters) => void;
  totalShown?: number;
}

export function CompanyFilterSidebar({ filters, onChange, totalShown }: Props) {
  const clearAll = () => onChange({ sort: filters.sort, tab: filters.tab });

  return (
    <aside className="space-y-6 text-sm">
      <header className="flex items-center justify-between">
        <h2 className="font-semibold">Filtry</h2>
        <button
          type="button"
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Wyczyść
        </button>
      </header>

      {/* Lokalizacja */}
      <FilterGroup title="Lokalizacja">
        <input
          value={filters.location ?? ""}
          onChange={(e) => onChange({ ...filters, location: e.target.value || undefined })}
          placeholder="Wybierz lokalizację…"
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
        />
      </FilterGroup>

      {/* Tryb pracy */}
      <FilterGroup title="Tryb pracy">
        {WORK_MODES_COMPANY.map((m) => (
          <CheckboxRow
            key={m.value}
            checked={!!filters.work_mode?.includes(m.value)}
            onChange={() =>
              onChange({ ...filters, work_mode: toggleArr(filters.work_mode, m.value) })
            }
            label={m.label}
          />
        ))}
      </FilterGroup>

      {/* Wielkość firmy */}
      <FilterGroup title="Wielkość firmy">
        {SIZE_BUCKETS.map((bucket) => (
          <CheckboxRow
            key={bucket}
            checked={!!filters.size?.includes(bucket)}
            onChange={() =>
              onChange({ ...filters, size: toggleArr(filters.size, bucket) })
            }
            label={bucket}
          />
        ))}
      </FilterGroup>

      {/* Tylko zweryfikowane */}
      <FilterGroup title="Weryfikacja">
        <CheckboxRow
          checked={!!filters.verified_only}
          onChange={() => onChange({ ...filters, verified_only: !filters.verified_only || undefined })}
          label={
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Tylko zweryfikowane
            </span>
          }
        />
      </FilterGroup>

      {/* Sortowanie */}
      <FilterGroup title="Sortuj według">
        <select
          value={filters.sort ?? "newest"}
          onChange={(e) =>
            onChange({ ...filters, sort: e.target.value as CompanyListFilters["sort"] })
          }
          className="w-full px-3 py-2 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
        >
          <option value="newest">Najnowsze</option>
          <option value="jobs">Najwięcej ofert</option>
          <option value="name">Alfabetycznie</option>
        </select>
      </FilterGroup>

      {/* Transparency CTA — points to /dla-pracodawcow per plan */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <h3 className="font-semibold text-sm">Transparentne firmy</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pokazujemy firmy, które dzielą się wynagrodzeniami i procesem rekrutacji.
        </p>
        <Link
          href="/dla-pracodawcow"
          className="inline-flex items-center text-xs text-amber-400 hover:text-amber-300 font-medium"
        >
          Dowiedz się więcej →
        </Link>
      </div>
    </aside>
  );
}


function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function CheckboxRow({
  checked, onChange, label,
}: { checked: boolean; onChange: () => void; label: React.ReactNode }) {
  return (
    <label className={cn(
      "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/40",
      checked && "bg-accent/40 text-foreground"
    )}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-amber-400"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}
