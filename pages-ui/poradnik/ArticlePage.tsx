"use client";

import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { categoryLabel } from "@/entities/article";
import { useArticleDetail, usePublicArticles } from "@/services/queries/articles.queries";
import { AuthorAvatar } from "./AuthorAvatar";
import { ArticleCard } from "./ArticleCard";
import { BrandByline } from "./BrandByline";
import { NewsletterSignup } from "./NewsletterSignup";
import { formatDatePl, readTimeLabel } from "./lib/format";

interface Props {
  slug: string;
}

export function ArticlePage({ slug }: Props) {
  const { data: article, isLoading, isError } = useArticleDetail(slug);

  // Related — three other articles in the same category. Fired only once
  // we know the article's category so we don't waste a request on errors.
  const { data: related } = usePublicArticles(
    article ? { category: article.category, limit: 4, exclude_featured: false } : { limit: 0 },
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 w-1/2 bg-card rounded animate-pulse" />
        <div className="h-72 rounded-2xl bg-card animate-pulse" />
        <div className="h-4 w-full bg-card rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-card rounded animate-pulse" />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold mb-2">Nie znaleziono artykułu</h1>
        <p className="text-muted-foreground mb-6">
          Artykuł o adresie <code>{slug}</code> nie istnieje lub został usunięty.
        </p>
        <Link
          href="/poradnik"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent/40 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Wróć do poradnika
        </Link>
      </div>
    );
  }

  const readTime = readTimeLabel(article.read_time_minutes);
  // Filter out the current article from "Powiązane" so we don't link to self.
  const relatedItems = (related?.items ?? []).filter((a) => a.id !== article.id).slice(0, 3);
  // Pick the base path for breadcrumb + back-link based on article type.
  // Company articles live under /firmy-pisza so navigation feels consistent.
  const isBrand = article.type === "company";
  const sectionPath  = isBrand ? "/firmy-pisza" : "/poradnik";
  const sectionLabel = isBrand ? "Firmy piszą"  : "Poradnik";

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Breadcrumb — keeps the back-link explicit, also good for SEO. */}
      <div className="pt-6 pb-4 text-sm text-muted-foreground flex items-center gap-2">
        <Link href={sectionPath} className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> {sectionLabel}
        </Link>
        <span className="text-muted-foreground/50">/</span>
        <Link
          href={`${sectionPath}?category=${article.category}`}
          className="hover:text-foreground"
        >
          {categoryLabel(article.category)}
        </Link>
      </div>

      {/* Article header */}
      <header className="max-w-3xl mx-auto text-center pt-4 pb-8">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <div className="text-[11px] uppercase tracking-wider text-amber-400">
            {categoryLabel(article.category)}
          </div>
          {/* Brand-content label, visible high so the reader knows the
              context before reading anything else. Promoted = stronger
              label since it sits on the editorial feed. */}
          {article.type === "company" && (
            article.is_promoted ? (
              <span className="inline-flex w-fit px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-400 text-[11px] uppercase tracking-wider font-medium">
                Promowane
              </span>
            ) : (
              <span className="inline-flex w-fit px-2.5 py-0.5 rounded-md bg-violet-400/10 text-violet-300 text-[11px] uppercase tracking-wider">
                Firma pisze
              </span>
            )
          )}
        </div>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="mt-4 text-base text-muted-foreground">{article.excerpt}</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap text-xs text-muted-foreground">
          {article.type === "company" && article.company ? (
            <BrandByline author={article.author} company={article.company} size="md" />
          ) : (
            <div className="flex items-center gap-2">
              <AuthorAvatar name={article.author.name} avatarUrl={article.author.avatar_url} size={28} />
              <div className="leading-tight text-left">
                <div className="text-foreground/90">{article.author.name}</div>
                {article.author.role && (
                  <div className="text-[11px] text-muted-foreground/70">{article.author.role}</div>
                )}
              </div>
            </div>
          )}
          <span className="text-muted-foreground/40">•</span>
          <span>{formatDatePl(article.published_at)}</span>
          {readTime && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {readTime}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Cover image — drops if none uploaded */}
      {article.cover_image_url && (
        <div className="rounded-2xl overflow-hidden border border-border mb-8">
          <img
            src={article.cover_image_url}
            alt=""
            className="w-full aspect-[16/9] object-cover"
          />
        </div>
      )}

      {/* HTML body — trusted, comes from our DB.
          Prose classes give us reasonable typographic defaults without
          installing @tailwindcss/typography (markdown lib not in deps). */}
      <article
        className="max-w-3xl mx-auto text-[15px] leading-relaxed text-foreground/90
                   [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3
                   [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
                   [&_p]:my-4
                   [&_ul]:my-4 [&_ul]:pl-6 [&_ul]:list-disc
                   [&_ol]:my-4 [&_ol]:pl-6 [&_ol]:list-decimal
                   [&_li]:my-1
                   [&_strong]:text-foreground [&_strong]:font-semibold
                   [&_em]:italic
                   [&_code]:text-xs [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
                   [&_a]:text-amber-400 [&_a]:underline hover:[&_a]:text-amber-300"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Related */}
      {relatedItems.length > 0 && (
        <section className="mt-16">
          <div className="text-[11px] uppercase tracking-wider text-amber-400">
            Powiązane artykuły
          </div>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold leading-tight mb-6">
            Czytaj dalej{" "}
            <span className="italic font-serif text-amber-400">w tej samej kategorii</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedItems.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-16">
        <NewsletterSignup />
      </div>
    </div>
  );
}
