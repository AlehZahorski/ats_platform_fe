"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_GROUPS } from "@/features/jobs/lib/category-groups";
import { CATEGORIES, categoriesByGroup } from "@/features/jobs/lib/categories";

interface Props {
  selected: string[] | undefined;
  onChange: (next: string[] | undefined) => void;
}

/**
 * Category multi-select filter for the job board.
 *
 * Two modes inside one panel:
 *   - Default: collapsed list of 26 groups, each clickable to expand into
 *     its specializations (checkboxes). A count of selected items inside
 *     the group is shown on the right.
 *   - Typing in the search box switches to a flat result list ranked by
 *     label/code match across all 290+ specializations.
 *
 * Selected specializations bubble to the top of the panel as removable
 * chips so the user always sees what's active.
 */
export function CategoryFilter({ selected, onChange }: Props) {
  const tCat = useTranslations("jobs.categories");
  const tGroup = useTranslations("jobs.categoryGroups");
  const [query, setQuery] = useState("");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selected ?? []), [selected]);

  const toggle = (code: string) => {
    const next = new Set(selectedSet);
    if (next.has(code)) {
      next.delete(code);
    } else {
      next.add(code);
    }
    const arr = Array.from(next);
    onChange(arr.length > 0 ? arr : undefined);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return CATEGORIES.filter((c) => {
      const label = tCat(c.code as never).toLowerCase();
      return label.includes(q) || c.code.includes(q);
    }).slice(0, 30);
  }, [query, tCat]);

  // Group counts of currently-selected specializations
  const selectedInGroup = (groupCode: string) =>
    CATEGORIES.filter((c) => c.group === groupCode && selectedSet.has(c.code)).length;

  return (
    <div>
      <label className="block text-xs font-semibold mb-2">Kategoria zawodowa</label>

      {/* Selected chips */}
      {selected && selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => toggle(code)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 text-xs hover:bg-amber-400/25"
            >
              {tCat(code as never)}
              <X className="w-3 h-3" />
            </button>
          ))}
          {selected.length > 1 && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-xs text-muted-foreground hover:text-foreground ml-1"
            >
              Wyczyść
            </button>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj specjalizacji…"
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
        />
      </div>

      {/* Results: flat search list OR group accordion */}
      <div className="border border-border rounded-lg bg-card max-h-80 overflow-y-auto">
        {filtered ? (
          filtered.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Brak wyników dla „{query}"
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((c) => {
                const checked = selectedSet.has(c.code);
                return (
                  <label
                    key={c.code}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 cursor-pointer text-sm",
                      checked ? "bg-amber-400/5" : "hover:bg-accent/40"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(c.code)}
                      className="w-3.5 h-3.5 rounded border-border accent-amber-400"
                    />
                    <span className="flex-1">{tCat(c.code as never)}</span>
                    <span className="text-[10px] text-muted-foreground">{tGroup(c.group as never)}</span>
                  </label>
                );
              })}
            </div>
          )
        ) : (
          <div className="divide-y divide-border/40">
            {CATEGORY_GROUPS.map((g) => {
              const Icon = g.icon;
              const specs = categoriesByGroup(g.code);
              const expanded = expandedGroup === g.code;
              const groupSelected = selectedInGroup(g.code);
              return (
                <div key={g.code}>
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(expanded ? null : g.code)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent/40",
                      expanded && "bg-accent/30"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="flex-1 font-medium">{tGroup(g.code as never)}</span>
                    {groupSelected > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 font-medium">
                        {groupSelected}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground">{specs.length}</span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 text-muted-foreground transition-transform",
                        expanded && "rotate-180"
                      )}
                    />
                  </button>
                  {expanded && (
                    <div className="pl-6 pr-2 pb-1 bg-background/50">
                      {specs.map((c) => {
                        const checked = selectedSet.has(c.code);
                        return (
                          <label
                            key={c.code}
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm",
                              checked ? "bg-amber-400/10 text-foreground" : "hover:bg-accent/40"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggle(c.code)}
                              className="w-3.5 h-3.5 rounded border-border accent-amber-400"
                            />
                            <span>{tCat(c.code as never)}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
