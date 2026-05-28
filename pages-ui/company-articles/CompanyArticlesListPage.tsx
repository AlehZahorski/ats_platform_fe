"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Trash2, ExternalLink, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { categoryLabel } from "@/entities/article";
import type { AdminArticle } from "@/entities/admin";
import {
  useCompanyArticles,
  useDeleteCompanyArticle,
  useToggleCompanyPublish,
} from "@/services/queries/company-articles.queries";
import { Topbar } from "@/shared/layout/Topbar";
import { formatDatePl } from "@/pages-ui/poradnik/lib/format";

/** Recruiter-side list of articles authored by the current company.
 * Mirror of the admin list but scoped: backend filters to company_id of
 * the active session, the UI hides the "Polecany" column entirely. */
export function CompanyArticlesListPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"draft" | "published" | undefined>(undefined);

  const { data, isLoading } = useCompanyArticles({
    q: q.trim() || undefined,
    status: statusFilter,
    limit: 100,
  });

  return (
    <>
      <Topbar title="Artykuły firmy" />
      <div className="p-8 max-w-5xl mx-auto">
        <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Artykuły firmy</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Publikuj treści brandowane — pojawią się na /firmy-pisza z waszym logo i linkiem do profilu.
            </p>
          </div>
          <Link
            href="/dashboard/articles/new"
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
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="p-12 text-center text-muted-foreground text-sm">Ładowanie…</td></tr>
              )}
              {!isLoading && data?.items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground text-sm">
                    Nie macie jeszcze żadnych artykułów.{" "}
                    <Link href="/dashboard/articles/new" className="text-amber-400 hover:text-amber-300">
                      Napisz pierwszy →
                    </Link>
                  </td>
                </tr>
              )}
              {!isLoading && data?.items.map((a) => <Row key={a.id} article={a} />)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}


function Row({ article }: { article: AdminArticle }) {
  const togglePublish = useToggleCompanyPublish();
  const del = useDeleteCompanyArticle();
  const [menuOpen, setMenuOpen] = useState(false);

  const onPublish = async () => {
    try {
      await togglePublish.mutateAsync(article.id);
      toast.success(article.is_published ? "Cofnięto publikację" : "Opublikowano");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się zmienić statusu");
    }
  };

  const onDelete = async () => {
    if (!window.confirm(`Usunąć artykuł „${article.title}"?`)) return;
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
        <Link href={`/dashboard/articles/${article.id}`} className="block">
          <span className="font-medium text-foreground hover:text-amber-400 transition-colors">
            {article.title}
          </span>
          <div className="text-xs text-muted-foreground mt-0.5 truncate">/firmy-pisza/{article.slug}</div>
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
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/40"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-10 rounded-lg border border-border bg-card shadow-xl py-1 w-48"
              onMouseLeave={() => setMenuOpen(false)}
            >
              {article.is_published && (
                <Link
                  href={`/firmy-pisza/${article.slug}`}
                  target="_blank"
                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/40"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Zobacz publicznie
                </Link>
              )}
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
