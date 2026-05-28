"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Star, MoreVertical, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ARTICLE_CATEGORIES, categoryLabel } from "@/entities/article";
import {
  useAdminArticles,
  useDeleteAdminArticle,
  usePromoteArticle,
  useToggleFeature,
  useTogglePublish,
} from "@/services/queries/admin.queries";
import type { AdminArticle } from "@/entities/admin";
import { formatDatePl } from "@/pages-ui/poradnik/lib/format";

export function AdminArticlesListPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<"editorial" | "company" | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<"draft" | "published" | undefined>(undefined);

  const { data, isLoading } = useAdminArticles({
    q: q.trim() || undefined,
    category,
    type: typeFilter,
    status: statusFilter,
    limit: 100,
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Artykuły</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Zarządzaj treścią poradnika — szkice, publikacja, polecane.
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nowy artykuł
        </Link>
      </header>

      {/* Filter bar */}
      <div className="rounded-xl border border-border bg-card p-4 mb-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Szukaj po tytule lub slug…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>
        <select
          value={category ?? ""}
          onChange={(e) => setCategory(e.target.value || undefined)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          <option value="">Wszystkie kategorie</option>
          {ARTICLE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={typeFilter ?? ""}
          onChange={(e) => setTypeFilter((e.target.value as any) || undefined)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          <option value="">Wszystkie typy</option>
          <option value="editorial">Redakcyjne</option>
          <option value="company">Firmowe</option>
        </select>
        <select
          value={statusFilter ?? ""}
          onChange={(e) => setStatusFilter((e.target.value as any) || undefined)}
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          <option value="">Wszystkie statusy</option>
          <option value="published">Opublikowane</option>
          <option value="draft">Szkice</option>
        </select>
        {data && (
          <span className="text-xs text-muted-foreground ml-auto">
            {data.total} {data.total === 1 ? "artykuł" : data.total < 5 ? "artykuły" : "artykułów"}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Tytuł</th>
              <th className="text-left px-4 py-3 font-medium w-32">Kategoria</th>
              <th className="text-left px-4 py-3 font-medium w-28">Status</th>
              <th className="text-left px-4 py-3 font-medium w-32">Opublikowano</th>
              <th className="w-32"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted-foreground text-sm">
                  Ładowanie…
                </td>
              </tr>
            )}
            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted-foreground text-sm">
                  Brak artykułów pasujących do filtrów.
                </td>
              </tr>
            )}
            {!isLoading && data?.items.map((a) => <Row key={a.id} article={a} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function Row({ article }: { article: AdminArticle }) {
  const togglePublish = useTogglePublish();
  const toggleFeature = useToggleFeature();
  const promote      = usePromoteArticle();
  const del = useDeleteAdminArticle();
  const [menuOpen, setMenuOpen] = useState(false);

  const onPublish = async () => {
    try {
      await togglePublish.mutateAsync(article.id);
      toast.success(article.is_published ? "Cofnięto publikację" : "Opublikowano");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się zmienić statusu");
    }
  };

  const onFeature = async () => {
    try {
      await toggleFeature.mutateAsync(article.id);
      toast.success(article.is_featured ? "Usunięto z polecanych" : "Ustawiono jako polecane");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się zmienić flagi");
    }
  };

  const onPromote = async (days: number | null) => {
    try {
      await promote.mutateAsync({ id: article.id, days });
      toast.success(
        days === null
          ? "Usunięto promocję"
          : `Promowane na /poradnik przez ${days} dni`,
      );
      setMenuOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się ustawić promocji");
    }
  };

  const onDelete = async () => {
    if (!window.confirm(`Usunąć artykuł „${article.title}"? Tej operacji nie da się cofnąć.`)) return;
    try {
      await del.mutateAsync(article.id);
      toast.success("Artykuł usunięty");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się usunąć");
    }
  };

  return (
    <tr className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
      <td className="px-4 py-3">
        <Link href={`/admin/articles/${article.id}`} className="block">
          <div className="flex items-center gap-2 flex-wrap">
            {article.is_featured && (
              <Star className="w-3.5 h-3.5 text-amber-400 fill-current" aria-label="Polecany" />
            )}
            <span className="font-medium text-foreground hover:text-amber-400 transition-colors">
              {article.title}
            </span>
            {/* Type chip — admin needs to see at a glance which articles
                are brand content vs editorial. */}
            {article.type === "company" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-violet-400/10 text-violet-300">
                Firma{article.company ? ` · ${article.company.name}` : ""}
              </span>
            )}
            {/* Promotion chip — company article actively boosted into /poradnik. */}
            {article.is_promoted && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-amber-400/15 text-amber-400"
                title={article.promoted_until ? `Do ${new Date(article.promoted_until).toLocaleString("pl-PL")}` : "Bezterminowo"}
              >
                Promowane
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">
            /{article.type === "company" ? "firmy-pisza" : "poradnik"}/{article.slug}
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">{categoryLabel(article.category)}</span>
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium",
            article.is_published
              ? "bg-emerald-500/15 text-emerald-500"
              : "bg-muted text-muted-foreground",
          )}
        >
          {article.is_published ? "Opublikowany" : "Szkic"}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {article.published_at ? formatDatePl(article.published_at) : "—"}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end relative">
          <button
            type="button"
            onClick={onPublish}
            title={article.is_published ? "Cofnij publikację" : "Opublikuj"}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onFeature}
            title={article.is_featured ? "Usuń z polecanych" : "Ustaw jako polecane"}
            className={cn(
              "p-2 rounded-md hover:bg-accent/40",
              article.is_featured ? "text-amber-400" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Star className={cn("w-4 h-4", article.is_featured && "fill-current")} />
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-10 rounded-lg border border-border bg-card shadow-xl py-1 w-56"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <Link
                href={`/${article.type === "company" ? "firmy-pisza" : "poradnik"}/${article.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/40"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Zobacz publicznie
              </Link>

              {/* Promotion is only meaningful for company articles —
                  editorial ones are already on /poradnik by definition. */}
              {article.type === "company" && (
                <>
                  <div className="border-t border-border my-1" />
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Promocja na /poradnik
                  </div>
                  <button
                    type="button"
                    onClick={() => onPromote(7)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/40"
                  >
                    Promuj na 7 dni
                  </button>
                  <button
                    type="button"
                    onClick={() => onPromote(30)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/40"
                  >
                    Promuj na 30 dni
                  </button>
                  <button
                    type="button"
                    onClick={() => onPromote(90)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/40"
                  >
                    Promuj na 90 dni
                  </button>
                  {article.is_promoted && (
                    <button
                      type="button"
                      onClick={() => onPromote(null)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-400 hover:bg-amber-400/10"
                    >
                      Zakończ promocję teraz
                    </button>
                  )}
                </>
              )}

              <div className="border-t border-border my-1" />
              <button
                type="button"
                onClick={onDelete}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Usuń artykuł
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
