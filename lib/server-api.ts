/**
 * Server-side fetchers used by SSR-only code paths (generateMetadata,
 * sitemap, robots). Never imported from a "use client" component — those
 * still go through the axios apiClient and react-query.
 *
 * We hit the backend directly (BACKEND_INTERNAL_URL) rather than the
 * Next.js rewrite, because:
 *   • SSR runs server-side so the rewrite isn't in front of us anyway
 *   • Skipping the local proxy is one less hop on every page render
 *
 * All functions are no-throw — they return null when the resource is
 * missing/unavailable so generateMetadata can fall back to a safe
 * default instead of breaking the page render.
 */
import type { ArticleDetail } from "@/entities/article";
import type { CompanyPublicDetail } from "@/entities/company";

const BACKEND = process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";
const API = `${BACKEND}/api/v1`;

// Default revalidation — content changes occasionally, full SSR every
// request is wasteful. 5-minute window keeps things reasonably fresh
// without hammering the backend. Individual callers can override.
const DEFAULT_REVALIDATE = 300;


async function safeGetJson<T>(url: string, revalidate = DEFAULT_REVALIDATE): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Backend down / DNS failure / timeout — let the caller render the
    // page anyway with default metadata; don't 500 the public site.
    return null;
  }
}


// ─────────────────────────────────────────────────────────────────────
// Articles
// ─────────────────────────────────────────────────────────────────────

export function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  return safeGetJson<ArticleDetail>(`${API}/articles/public/${encodeURIComponent(slug)}`);
}

interface ArticleSlugRow {
  slug:         string;
  type:         "editorial" | "company";
  published_at: string | null;
}

interface ArticleSlugList {
  items: ArticleSlugRow[];
  total: number;
}

export async function listAllArticleSlugs(): Promise<ArticleSlugRow[]> {
  // Sitemap caller — pulls up to 500 of EACH type (`type=all`). If we
  // ever exceed this, switch to a paginated walk; not worth it today.
  const data = await safeGetJson<ArticleSlugList>(`${API}/articles/public?type=all&limit=500`);
  return data?.items ?? [];
}


// ─────────────────────────────────────────────────────────────────────
// Companies
// ─────────────────────────────────────────────────────────────────────

export function getCompanyBySlug(slug: string): Promise<CompanyPublicDetail | null> {
  return safeGetJson<CompanyPublicDetail>(`${API}/companies/public/${encodeURIComponent(slug)}`);
}

interface CompanySlugList {
  items: { slug: string | null; name: string }[];
  total: number;
}

export async function listAllCompanySlugs(): Promise<{ slug: string }[]> {
  const data = await safeGetJson<CompanySlugList>(`${API}/companies/public?limit=500`);
  return (data?.items ?? [])
    .filter((c): c is { slug: string; name: string } => !!c.slug)
    .map((c) => ({ slug: c.slug }));
}


// ─────────────────────────────────────────────────────────────────────
// Canonical site URL — used by every metadata function for OG / canonical
// ─────────────────────────────────────────────────────────────────────

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://wakanta.pl";
