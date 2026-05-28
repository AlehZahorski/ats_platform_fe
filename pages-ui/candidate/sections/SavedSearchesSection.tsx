"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, Search, Trash2 } from "lucide-react";
import { useSavedSearches } from "@/services/queries/jobBoard.queries";
import { candidateKeys } from "@/services/queries/jobBoard.queries";
import { candidatesApi } from "@/services/api/jobBoard";
import { filtersToQuery, type JobBoardFilters } from "@/pages-ui/jobboard/lib/filters";
import { ROUTES } from "@/config/routes";

export function SavedSearchesSection() {
  const qc = useQueryClient();
  const { data: searches } = useSavedSearches();

  const handleDelete = async (id: string) => {
    try {
      await candidatesApi.deleteSavedSearch(id);
      qc.invalidateQueries({ queryKey: candidateKeys.savedSearches });
      toast.success("Wyszukiwanie usunięte");
    } catch {
      toast.error("Nie udało się usunąć");
    }
  };

  if (!searches || searches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Brak zapisanych wyszukiwań. Zastosuj filtry na liście ofert i kliknij „Zapisz wyszukiwanie".
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
      {searches.map((s) => {
        const qs = filtersToQuery(s.query as JobBoardFilters).toString();
        const summary = describeQuery(s.query as JobBoardFilters);
        return (
          <div key={s.id} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <Link
                href={`${ROUTES.public.jobs}?${qs}`}
                className="block font-semibold hover:text-amber-400"
              >
                {s.name}
              </Link>
              {summary && <div className="text-xs text-muted-foreground mt-0.5">{summary}</div>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="p-2 text-muted-foreground" title={s.notify_email ? "Powiadomienia e-mail włączone" : "Bez powiadomień"}>
                {s.notify_email ? <Bell className="w-4 h-4 text-amber-400" /> : <BellOff className="w-4 h-4" />}
              </div>
              <Link
                href={`${ROUTES.public.jobs}?${qs}`}
                className="p-2 rounded-md hover:bg-accent/40 text-muted-foreground"
                title="Uruchom wyszukiwanie"
              >
                <Search className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(s.id)}
                className="p-2 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
                title="Usuń"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function describeQuery(f: JobBoardFilters): string | null {
  const parts: string[] = [];
  if (f.q) parts.push(`"${f.q}"`);
  if (f.location) parts.push(`📍 ${f.location}`);
  if (f.work_mode?.length) parts.push(`tryb: ${f.work_mode.join(", ")}`);
  if (f.contract_type?.length) parts.push(`umowa: ${f.contract_type.join(", ")}`);
  if (f.seniority?.length) parts.push(`poziom: ${f.seniority.join(", ")}`);
  if (f.salary_min || f.salary_max) {
    parts.push(`${f.salary_min ?? "?"}–${f.salary_max ?? "?"} PLN`);
  }
  return parts.length ? parts.join(" · ") : null;
}
