"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { categoryLabel, type ArticleSummary } from "@/entities/article";
import { AuthorAvatar } from "./AuthorAvatar";
import { formatDatePl, readTimeLabel } from "./lib/format";

interface Props {
  article: ArticleSummary;
}

/** Big hero card under the search bar. Two-column layout: cover left,
 * meta right. Used for the "POLECANE" article. Drops to single-column
 * on narrow viewports. */
export function FeaturedArticle({ article }: Props) {
  const readTime = readTimeLabel(article.read_time_minutes);
  // The title sometimes has a natural break point — second clause feels
  // like a serif italic accent in the design. We don't have a structured
  // split, so render the whole title in semibold and let the eye do the
  // work. Italic accent is reserved for the page-level h1.
  return (
    <Link
      href={`/poradnik/${article.slug}`}
      className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-amber-400/40 transition-colors"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Cover */}
        <div className="relative aspect-[16/10] lg:aspect-auto bg-gradient-to-br from-amber-400/15 via-amber-400/5 to-transparent">
          {article.cover_image_url && (
            <img
              src={article.cover_image_url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>

        {/* Meta */}
        <div className="p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-black text-[11px] font-semibold uppercase tracking-wider">
              <Star className="w-3 h-3 fill-current" />
              Polecane
            </span>
            <span className="text-[11px] uppercase tracking-wider text-amber-400">
              {categoryLabel(article.category)}
            </span>
          </div>

          <h2 className="mt-4 text-2xl md:text-3xl font-semibold leading-tight group-hover:text-amber-400 transition-colors">
            {article.title}
          </h2>

          {article.excerpt && (
            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              {article.excerpt}
            </p>
          )}

          <div className="mt-6 flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <AuthorAvatar name={article.author.name} avatarUrl={article.author.avatar_url} size={28} />
              <div className="leading-tight">
                <div className="text-foreground/90">{article.author.name}</div>
                {article.author.role && <div className="text-muted-foreground/70 text-[11px]">{article.author.role}</div>}
              </div>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <span>{formatDatePl(article.published_at)}</span>
            {readTime && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span>{readTime}</span>
              </>
            )}
          </div>

          <div className="mt-auto pt-6">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold group-hover:bg-amber-300 transition-colors">
              Czytaj artykuł →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
