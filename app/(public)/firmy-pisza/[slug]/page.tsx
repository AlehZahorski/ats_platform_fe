import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ArticlePage } from "@/pages-ui/poradnik/ArticlePage";
import { categoryLabel } from "@/entities/article";
import { getArticleBySlug, SITE_URL } from "@/lib/server-api";

interface PageProps {
  params: Promise<{ slug: string }>;
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Nie znaleziono artykułu — wakanta.pl",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}/firmy-pisza/${article.slug}`;
  const brandSuffix = article.company ? ` | ${article.company.name}` : "";
  const title = `${article.title}${brandSuffix} — wakanta.pl`;
  const description =
    article.excerpt ??
    article.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);

  const ogImage = article.cover_image_url
    ? article.cover_image_url.startsWith("http")
      ? article.cover_image_url
      : `${SITE_URL}${article.cover_image_url}`
    : `${SITE_URL}/og-default.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [categoryLabel(article.category), "opinie firm", "case study", article.company?.name].filter(
      (x): x is string => !!x,
    ),
    authors: [{ name: article.author.name }],
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "wakanta.pl",
      locale: "pl_PL",
      images: [{ url: ogImage, alt: article.title }],
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
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Type-mismatch guard. If someone clicks an /firmy-pisza/{slug} link
  // for an editorial article (or vice versa), redirect to the correct
  // public URL — avoids two URLs for the same content (SEO duplicate).
  if (article.type !== "company") {
    redirect(`/poradnik/${article.slug}`);
  }

  // JSON-LD Article schema — Google rich results.
  const jsonLd: Record<string, unknown> = {
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
      ...(article.company
        ? {
            affiliation: {
              "@type": "Organization",
              name: article.company.name,
              url: article.company.slug ? `${SITE_URL}/firmy/${article.company.slug}` : undefined,
            },
          }
        : {}),
    },
    publisher: article.company
      ? {
          "@type": "Organization",
          name: article.company.name,
          logo: article.company.logo_url
            ? {
                "@type": "ImageObject",
                url: article.company.logo_url.startsWith("http")
                  ? article.company.logo_url
                  : `${SITE_URL}${article.company.logo_url}`,
              }
            : undefined,
        }
      : { "@type": "Organization", name: "wakanta.pl" },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/firmy-pisza/${article.slug}`,
    },
    articleSection: categoryLabel(article.category),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticlePage slug={slug} />
    </>
  );
}
