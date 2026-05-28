"use client";

import { useMemo, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useTranslations } from "next-intl";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_GROUPS, GROUP_MAP } from "../../lib/category-groups";
import { CATEGORIES, categoriesByGroup, getCategoryConfig } from "../../lib/categories";

interface Props {
  value: string;                  // category code or ""
  onChange: (code: string) => void;
  placeholder?: string;
}

export function CategoryCombobox({ value, onChange, placeholder }: Props) {
  const tCat = useTranslations("jobs.categories");
  const tGroup = useTranslations("jobs.categoryGroups");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = getCategoryConfig(value);
  const selectedLabel = selected ? tCat(selected.code as never) : "";
  const selectedGroupLabel = selected ? tGroup(selected.group as never) : "";

  // Search across all categories — case insensitive, matches label and code.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return CATEGORIES.filter((c) => {
      const label = tCat(c.code as never).toLowerCase();
      return label.includes(q) || c.code.includes(q);
    });
  }, [query, tCat]);

  const handlePick = (code: string) => {
    onChange(code);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm",
            "flex items-center justify-between gap-2 hover:border-amber-400/40 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2 min-w-0">
              <SelectedGroupIcon groupCode={selected.group} />
              <span className="truncate">{selectedLabel}</span>
              <span className="text-xs text-muted-foreground shrink-0">· {selectedGroupLabel}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder ?? "Wybierz kategorię…"}</span>
          )}
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[420px] max-h-[480px] overflow-hidden rounded-lg border border-border bg-popover shadow-xl"
        >
          {/* Search box */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Szukaj specjalizacji…"
                className="w-full pl-7 pr-7 py-1.5 bg-transparent text-sm focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="overflow-y-auto max-h-[420px]">
            {filtered ? (
              filtered.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Brak wyników dla „{query}"
                </div>
              ) : (
                <div className="p-1">
                  {filtered.map((c) => {
                    const groupDef = GROUP_MAP[c.group];
                    const Icon = groupDef.icon;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handlePick(c.code)}
                        className={cn(
                          "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left text-sm hover:bg-accent/50",
                          value === c.code && "bg-amber-400/10 text-amber-400"
                        )}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate">{tCat(c.code as never)}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {tGroup(c.group as never)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )
            ) : (
              // Default state: list groups with counts. Click a group to expand.
              <GroupList onPick={handlePick} currentValue={value} />
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function SelectedGroupIcon({ groupCode }: { groupCode: string }) {
  const def = GROUP_MAP[groupCode as never];
  if (!def) return null;
  const Icon = def.icon;
  return <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />;
}

function GroupList({ onPick, currentValue }: { onPick: (code: string) => void; currentValue: string }) {
  const tCat = useTranslations("jobs.categories");
  const tGroup = useTranslations("jobs.categoryGroups");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Auto-expand the group containing currentValue
  useMemo(() => {
    if (currentValue) {
      const cat = getCategoryConfig(currentValue);
      if (cat && expandedGroup === null) setExpandedGroup(cat.group);
    }
  }, [currentValue, expandedGroup]);

  return (
    <div className="p-1">
      {CATEGORY_GROUPS.map((g) => {
        const Icon = g.icon;
        const groupCats = categoriesByGroup(g.code);
        const expanded = expandedGroup === g.code;
        return (
          <div key={g.code}>
            <button
              type="button"
              onClick={() => setExpandedGroup(expanded ? null : g.code)}
              className={cn(
                "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left text-sm hover:bg-accent/50",
                expanded && "bg-accent/30"
              )}
            >
              <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 font-medium">{tGroup(g.code as never)}</span>
              <span className="text-xs text-muted-foreground shrink-0">{groupCats.length}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", expanded && "rotate-180")} />
            </button>
            {expanded && (
              <div className="pl-7 pr-1 pb-1">
                {groupCats.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => onPick(c.code)}
                    className={cn(
                      "w-full px-2 py-1.5 rounded text-left text-sm hover:bg-accent/50",
                      currentValue === c.code && "bg-amber-400/10 text-amber-400 font-medium"
                    )}
                  >
                    {tCat(c.code as never)}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
