"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { CompanyAvatar } from "@/pages-ui/companies/CompanyAvatar";
import type { ArticleAuthor, ArticleBrandCompany } from "@/entities/article";

interface Props {
  author:  ArticleAuthor;
  company: ArticleBrandCompany;
  size?:   "sm" | "md";
}

/** Byline for type='company' articles: "Anna Kowalska, CTO @ Brainly"
 * with the company logo + clickable chip linking to /firmy/{slug}.
 * Visible difference vs editorial byline is intentional — readers
 * should know at a glance this is brand content, not editorial. */
export function BrandByline({ author, company, size = "sm" }: Props) {
  const logoSize  = size === "md" ? 32 : 24;
  const textClass = size === "md" ? "text-sm" : "text-xs";

  const chip = (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-[11px] font-medium">
      <CompanyAvatar name={company.name} logoUrl={company.logo_url} size={14} />
      {company.name}
      {company.is_verified && <ShieldCheck className="w-3 h-3 text-emerald-500" />}
    </span>
  );

  return (
    <div className="flex items-center gap-2 min-w-0">
      <CompanyAvatar name={company.name} logoUrl={company.logo_url} size={logoSize} />
      <div className={`leading-tight min-w-0 ${textClass}`}>
        <div className="text-foreground/90 truncate">
          {author.name}
          {author.role && <span className="text-muted-foreground"> · {author.role}</span>}
        </div>
        <div className="mt-0.5">
          {company.slug ? (
            <Link
              href={`/firmy/${company.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:opacity-80 transition-opacity"
            >
              {chip}
            </Link>
          ) : (
            chip
          )}
        </div>
      </div>
    </div>
  );
}
