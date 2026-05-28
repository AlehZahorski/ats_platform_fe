"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Eye, Save, Trash2, Upload, X, Image as ImageIcon, LoaderCircle, Star, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ARTICLE_CATEGORIES } from "@/entities/article";
import type { AdminArticle } from "@/entities/admin";
import {
  useAdminArticle,
  useCreateAdminArticle,
  useDeleteAdminArticle,
  useRemoveArticleCover,
  useToggleFeature,
  useTogglePublish,
  useUpdateAdminArticle,
  useUploadArticleCover,
} from "@/services/queries/admin.queries";
import { ArticleContentEditor } from "./ArticleContentEditor";

interface Props {
  articleId: string | null; // null for /admin/articles/new
}

// Local draft state — superset of CompanyEditPayload-style partial. Lives
// in component state until the user clicks Save; then sent to backend as
// either create or update payload.
interface Draft {
  slug:              string;
  title:             string;
  excerpt:           string;
  content:           string;
  category:          string;
  author_name:       string;
  author_role:       string;
  read_time_minutes: string;   // string in form, parsed to number on save
  // Publish flag is part of the draft so the admin sees it BEFORE clicking
  // Create, not just after. Defaults to true for new articles — most of the
  // time admins write to publish, not stockpile drafts.
  is_published:      boolean;
}

const EMPTY_DRAFT: Draft = {
  slug: "", title: "", excerpt: "", content: "",
  category: ARTICLE_CATEGORIES[0].value,
  author_name: "", author_role: "",
  read_time_minutes: "",
  is_published: true,
};


export function AdminArticleEditorPage({ articleId }: Props) {
  const router = useRouter();
  const isNew = articleId === null;

  const { data: article, isLoading } = useAdminArticle(articleId);
  const create = useCreateAdminArticle();
  const update = useUpdateAdminArticle(articleId ?? "");
  const del = useDeleteAdminArticle();
  const togglePublish = useTogglePublish();
  const toggleFeature = useToggleFeature();

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  // When loading an existing article, sync the form once data arrives.
  useEffect(() => {
    if (article) {
      setDraft({
        slug:              article.slug,
        title:             article.title,
        excerpt:           article.excerpt ?? "",
        content:           article.content,
        category:          article.category,
        author_name:       article.author.name,
        author_role:       article.author.role ?? "",
        read_time_minutes: article.read_time_minutes?.toString() ?? "",
        is_published:      article.is_published,
      });
    }
  }, [article]);

  // Auto-generate slug from title in new-mode only. Don't overwrite a slug
  // the user has already typed manually.
  const slugTouched = useRef(false);
  useEffect(() => {
    if (!isNew || slugTouched.current) return;
    setDraft((d) => ({ ...d, slug: slugify(d.title) }));
  }, [draft.title, isNew]);

  const onSave = async () => {
    const readTime = draft.read_time_minutes ? parseInt(draft.read_time_minutes, 10) : null;
    const payload = {
      slug: draft.slug.trim(),
      title: draft.title.trim(),
      excerpt: draft.excerpt.trim() || null,
      content: draft.content,
      category: draft.category,
      author_name: draft.author_name.trim() || "Redakcja wakanta.pl",
      author_role: draft.author_role.trim() || null,
      read_time_minutes: readTime,
      // Explicit so a new article respects the toggle the admin set in the
      // meta panel instead of silently defaulting to draft on the backend.
      is_published: draft.is_published,
    };
    try {
      if (isNew) {
        const created = await create.mutateAsync(payload);
        toast.success("Artykuł utworzony");
        router.replace(`/admin/articles/${created.id}`);
      } else {
        await update.mutateAsync(payload);
        toast.success("Zapisano zmiany");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się zapisać");
    }
  };

  const onDelete = async () => {
    if (!articleId) return;
    if (!window.confirm(`Usunąć artykuł „${draft.title}"? Tej operacji nie da się cofnąć.`)) return;
    try {
      await del.mutateAsync(articleId);
      toast.success("Artykuł usunięty");
      router.replace("/admin/articles");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się usunąć");
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderCircle className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <Header
        article={article}
        isNew={isNew}
        title={draft.title}
        saving={create.isPending || update.isPending}
        onSave={onSave}
        onDelete={onDelete}
        onPublish={article ? () => togglePublish.mutate(article.id) : undefined}
        onFeature={article ? () => toggleFeature.mutate(article.id) : undefined}
      />

      <div className="flex-1 px-6 py-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Center: main form */}
        <div className="space-y-5 min-w-0">
          {/* Title + slug card */}
          <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Field label="Tytuł">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="np. Jak przygotować się do rozmowy technicznej w 2026"
                className={inputCls}
              />
            </Field>
            <Field label="Adres URL (slug)">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground shrink-0 px-2">/poradnik/</span>
                <input
                  value={draft.slug}
                  onChange={(e) => {
                    slugTouched.current = true;
                    setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
                  }}
                  placeholder="moj-artykul"
                  className={inputCls}
                />
              </div>
            </Field>
            <Field label="Zajawka (excerpt)">
              <textarea
                value={draft.excerpt}
                onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
                rows={2}
                maxLength={400}
                placeholder="Krótki opis pokazywany na kartach i w hero."
                className={inputCls}
              />
            </Field>
          </section>

          {/* Content editor */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground mb-2">Treść artykułu</div>
            <ArticleContentEditor
              value={draft.content}
              onChange={(html) => setDraft({ ...draft, content: html })}
              placeholder="Zacznij pisać. Użyj toolbara dla H2, H3, list, cytatów…"
            />
          </section>
        </div>

        {/* Right: meta panel */}
        <aside className="space-y-5">
          {/* Cover */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="text-xs text-muted-foreground mb-2">Cover</div>
            <CoverUploader article={article} disabled={isNew} />
            {isNew && (
              <p className="text-[11px] text-muted-foreground/60 mt-2">
                Zapisz artykuł, aby wgrać cover.
              </p>
            )}
          </section>

          {/* Meta */}
          <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Field label="Kategoria">
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className={inputCls}
              >
                {ARTICLE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Autor — imię i nazwisko">
              <input
                value={draft.author_name}
                onChange={(e) => setDraft({ ...draft, author_name: e.target.value })}
                placeholder="Jan Kowalski"
                className={inputCls}
              />
            </Field>
            <Field label="Autor — rola">
              <input
                value={draft.author_role}
                onChange={(e) => setDraft({ ...draft, author_role: e.target.value })}
                placeholder="Senior Tech Recruiter"
                className={inputCls}
              />
            </Field>
            <Field label="Czas czytania (min)">
              <input
                type="number"
                value={draft.read_time_minutes}
                onChange={(e) => setDraft({ ...draft, read_time_minutes: e.target.value })}
                placeholder="8"
                className={inputCls}
              />
            </Field>
          </section>

          {/* Status panel — visible in BOTH new and existing modes. In new
              mode the publish toggle drives `draft.is_published` so the
              article is created with the correct flag. In edit mode the
              toggles hit dedicated backend endpoints for instant flip. */}
          <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <div className="text-xs text-muted-foreground">Status</div>
            <Row label="Opublikowany">
              {isNew ? (
                <Toggle
                  active={draft.is_published}
                  onClick={() => setDraft({ ...draft, is_published: !draft.is_published })}
                  label={draft.is_published ? "Tak" : "Szkic"}
                />
              ) : article ? (
                <Toggle
                  active={article.is_published}
                  onClick={() => togglePublish.mutate(article.id)}
                  label={article.is_published ? "Tak" : "Szkic"}
                />
              ) : null}
            </Row>
            {article && (
              <>
                <Row label="Polecany">
                  <Toggle
                    active={article.is_featured}
                    onClick={() => toggleFeature.mutate(article.id)}
                    label={article.is_featured ? "Tak" : "Nie"}
                  />
                </Row>
                <Link
                  href={`/poradnik/${article.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300"
                >
                  Zobacz publicznie
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </>
            )}
            {isNew && (
              <p className="text-[11px] text-muted-foreground/70 leading-tight">
                {draft.is_published
                  ? 'Po kliknięciu „Utwórz” artykuł od razu pojawi się na /poradnik.'
                  : "Zapisany jako szkic — widoczny tylko w panelu admina."}
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────
// Header — sticky title bar with Save + danger zone.
// ─────────────────────────────────────────────────────────────────────

interface HeaderProps {
  article: AdminArticle | undefined;
  isNew: boolean;
  title: string;
  saving: boolean;
  onSave: () => void;
  onDelete: () => void;
  onPublish?: () => void;
  onFeature?: () => void;
}

function Header({ article, isNew, title, saving, onSave, onDelete }: HeaderProps) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="px-6 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Wróć do listy
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold truncate">
              {isNew ? "Nowy artykuł" : title || "Bez tytułu"}
            </h1>
            {article && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-medium",
                  article.is_published
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {article.is_published ? "Opublikowany" : "Szkic"}
              </span>
            )}
            {article?.is_featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-400/15 text-amber-400">
                <Star className="w-3 h-3 fill-current" /> Polecany
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isNew && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2 rounded-lg border border-border text-rose-400 hover:bg-rose-500/10"
              title="Usuń artykuł"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 disabled:opacity-60"
          >
            {saving ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isNew ? "Utwórz" : "Zapisz"}
          </button>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────
// Cover uploader — only enabled once the article has an id.
// ─────────────────────────────────────────────────────────────────────

function CoverUploader({ article, disabled }: { article: AdminArticle | undefined; disabled: boolean }) {
  const upload = useUploadArticleCover(article?.id ?? "");
  const remove = useRemoveArticleCover(article?.id ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File) => {
    try {
      await upload.mutateAsync(file);
      toast.success("Cover zaktualizowany");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się przesłać");
    }
  };

  return (
    <div>
      <div className="aspect-[16/9] rounded-lg border border-border bg-background overflow-hidden mb-2">
        {article?.cover_image_url ? (
          <img src={article.cover_image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-8 h-8 opacity-40" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-accent/40",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <Upload className="w-3.5 h-3.5" />
          {article?.cover_image_url ? "Zmień" : "Wgraj"}
        </button>
        {article?.cover_image_url && (
          <button
            type="button"
            onClick={() => remove.mutate()}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-400"
          >
            <X className="w-3 h-3" /> Usuń
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>
      <p className="text-[10px] text-muted-foreground/70 mt-2 leading-tight">
        16:9 (np. 1600×900 px) · PNG/JPG/WEBP · max 2 MB
      </p>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────
// Small UI primitives shared in this file only.
// ─────────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-2 py-0.5 rounded text-xs font-medium transition-colors",
        active
          ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
      )}
    >
      {label}
    </button>
  );
}


// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
