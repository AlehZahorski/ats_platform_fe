import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArticlePage } from "@/pages-ui/poradnik/ArticlePage";
import { categoryLabel } from "@/entities/article";
import { getArticleBySlug, SITE_URL } from "@/lib/server-api";

interface PageProps {
  params: Promise<{ slug: string }>;
}


// ─────────────────────────────────────────────────────────────────────
// generateMetadata — runs server-side at request time (with ISR cache).
// Sets <title>, description, Open Graph, Twitter Card, canonical.
// Without this every article shares the root layout's "wakanta.pl" title,
// which is brutal for SEO and looks bad in social previews.
// ─────────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Nie znaleziono artykułu — wakanta.pl",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}/poradnik/${article.slug}`;
  const title = `${article.title} — Poradnik wakanta.pl`;
  const description =
    article.excerpt ??
    // Fall back to a slice of the body, stripped of HTML, so the
    // social card isn't empty when the editor forgot to fill excerpt.
    article.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);

  // Use the cover image when available, fall back to a default OG image
  // (which we don't ship yet but a referenced URL won't break renders —
  // social platforms gracefully degrade to no preview image).
  const ogImage = article.cover_image_url
    ? article.cover_image_url.startsWith("http")
      ? article.cover_image_url
      : `${SITE_URL}${article.cover_image_url}`
    : `${SITE_URL}/og-default.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [categoryLabel(article.category), "poradnik", "kariera", "rekrutacja", "IT"],
    authors: [{ name: article.author.name }],
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "wakanta.pl",
      locale: "pl_PL",
      images: [{ url: ogImage, alt: article.title }],
      // OG article extensions — picked up by Facebook + LinkedIn for nicer previews.
      publishedTime: article.published_at ?? undefined,
      authors: [article.author.name],
      section: categoryLabel(article.category),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}


export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  // Pre-fetch on the server: lets us serve a proper 404 page when the
  // article doesn't exist (instead of the client-side fallback inside
  // ArticlePage) AND lets us inject JSON-LD with real values.
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Slug is globally unique but type is not — if a brand article gets
  // requested under /poradnik, redirect to the canonical /firmy-pisza URL
  // so we don't serve duplicate content on two paths (SEO penalty).
  if (article.type === "company") {
    redirect(`/firmy-pisza/${article.slug}`);
  }

  // JSON-LD Article — Google's structured-data crawler turns this into
  // rich-result eligibility (top story carousel, author/date in SERP).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    image: article.cover_image_url
      ? [
          article.cover_image_url.startsWith("http")
            ? article.cover_image_url
            : `${SITE_URL}${article.cover_image_url}`,
        ]
      : undefined,
    datePublished: article.published_at ?? undefined,
    dateModified: article.published_at ?? undefined,
    author: {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.role ?? undefined,
    },
    publisher: {
      "@type": "Organization",
      name: "wakanta.pl",
      // logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` }, // add when we have one
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/poradnik/${article.slug}`,
    },
    articleSection: categoryLabel(article.category),
  };

  return (
    <>
      {/* JSON-LD must be a literal <script>, not via Next's <Script>, so
          it's present in the initial HTML for crawlers (no JS execution
          needed to find it). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticlePage slug={slug} />
    </>
  );
}
