"use client";

import Link from "next/link";
import { categoryLabel, type ArticleSummary } from "@/entities/article";
import { AuthorAvatar } from "./AuthorAvatar";
import { BrandByline } from "./BrandByline";
import { formatDatePl, readTimeLabel } from "./lib/format";

interface Props {
  article: ArticleSummary;
}

/** Standard card for the article grid. Same shape for both /poradnik
 * (editorial) and /firmy-pisza (brand) — only the byline + base URL
 * differ. We pick the variant from `article.type`. */
export function ArticleCard({ article }: Props) {
  const readTime = readTimeLabel(article.read_time_minutes);
  const isBrand = article.type === "company" && !!article.company;
  // Brand articles live under a different public URL prefix so the URL
  // itself signals authorship direction (companies writing).
  const href = isBrand ? `/firmy-pisza/${article.slug}` : `/poradnik/${article.slug}`;

  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden hover:border-amber-400/40 transition-colors"
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] bg-gradient-to-br from-amber-400/15 via-amber-400/5 to-transparent">
        {article.cover_image_url && (
          <img
            src={article.cover_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex w-fit px-2.5 py-0.5 rounded-md bg-amber-400/15 text-amber-400 text-[11px] uppercase tracking-wider">
            {categoryLabel(article.category)}
          </span>
          {isBrand && (
            // Visible label so readers know this is brand content. When the
            // article is promoted (paid for editorial-feed visibility) we
            // use a stronger "Promowane" chip — more transparent for the
            // reader than the soft "Firma pisze" tag.
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

        {/* Title — capped at 2 lines so cards stay aligned in the grid. */}
        <h3 className="mt-3 text-base font-semibold leading-tight text-foreground line-clamp-2 group-hover:text-amber-400 transition-colors">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {article.excerpt}
          </p>
        )}

        {/* Footer pushed to bottom regardless of excerpt length. */}
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isBrand && article.company ? (
              <BrandByline author={article.author} company={article.company} />
            ) : (
              <>
                <AuthorAvatar name={article.author.name} avatarUrl={article.author.avatar_url} size={24} />
                <span className="text-xs text-muted-foreground truncate">
                  {article.author.name}
                </span>
              </>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground/70 shrink-0">
            {[readTime, formatDatePl(article.published_at)].filter(Boolean).join(" · ")}
          </div>
        </div>
      </div>
    </Link>
  );
}
