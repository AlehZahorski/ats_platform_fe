import type { MetadataRoute } from "next";
import { ROUTES } from "@/config/routes";
import { listAllArticleSlugs, listAllCompanySlugs, listAllPublicJobs, SITE_URL } from "@/lib/server-api";

/**
 * App Router sitemap — served at /sitemap.xml. Next.js generates the
 * XML from the returned array. We pull live slugs from the backend so
 * the sitemap stays in sync with published content without a build.
 *
 * Revalidation is handled by the fetch calls in server-api (5 min).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static landing pages — handpicked so we don't list every dynamic route.
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                 changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/jobs`,             changeFrequency: "hourly",  priority: 0.9 },
    { url: `${SITE_URL}/firmy`,            changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE_URL}/poradnik`,         changeFrequency: "daily",   priority: 0.7 },
    { url: `${SITE_URL}/firmy-pisza`,      changeFrequency: "daily",   priority: 0.6 },
    { url: `${SITE_URL}/o-nas`,            changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/dla-pracodawcow`,  changeFrequency: "monthly", priority: 0.6 },
  ];

  // Pull dynamic content. Each call is no-throw; backend down = static-only sitemap.
  const [articles, companies, jobs] = await Promise.all([
    listAllArticleSlugs(),
    listAllCompanySlugs(),
    listAllPublicJobs(),
  ]);

  // Route each article under its canonical type-specific URL so the
  // sitemap matches the redirect logic on the page side.
  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/${a.type === "company" ? "firmy-pisza" : "poradnik"}/${a.slug}`,
    lastModified: a.published_at ? new Date(a.published_at) : undefined,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const companyEntries: MetadataRoute.Sitemap = companies.map((c) => ({
    url: `${SITE_URL}/firmy/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  // Individual open offers — the canonical /praca/<slug>-<uuid> URLs. These
  // pages already ship JobPosting structured data + SSR metadata, so listing
  // them here is what actually gets them crawled and indexed.
  const jobEntries: MetadataRoute.Sitemap = jobs.map((j) => ({
    url: `${SITE_URL}${ROUTES.public.job(j.id, j.slug)}`,
    lastModified: j.created_at ? new Date(j.created_at) : undefined,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticPages, ...articleEntries, ...companyEntries, ...jobEntries];
}
