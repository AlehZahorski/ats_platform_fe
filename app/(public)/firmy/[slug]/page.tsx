import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyProfilePage } from "@/pages-ui/companies/CompanyProfilePage";
import { getCompanyBySlug, SITE_URL } from "@/lib/server-api";

interface PageProps {
  params: Promise<{ slug: string }>;
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return {
      title: "Nie znaleziono firmy — wakanta.pl",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}/firmy/${company.slug}`;
  const title = `${company.name} — oferty pracy i opinie | wakanta.pl`;
  // Tagline first (shorter, hand-written), description second, employee
  // count as last-ditch fallback. Anything < 50 chars looks barren in SERP.
  const description =
    company.tagline ??
    company.description ??
    [company.industry, company.hq_location, company.employee_count ? `${company.employee_count} pracowników` : null]
      .filter(Boolean)
      .join(" · ");

  const image = company.banner_url || company.logo_url;
  const ogImage = image
    ? image.startsWith("http") ? image : `${SITE_URL}${image}`
    : `${SITE_URL}/og-default.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [company.name, company.industry, company.hq_location, "oferty pracy", "rekrutacja"]
      .filter((x): x is string => !!x),
    openGraph: {
      type: "profile",
      url,
      title,
      description,
      siteName: "wakanta.pl",
      locale: "pl_PL",
      images: [{ url: ogImage, alt: company.name }],
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
  const company = await getCompanyBySlug(slug);
  if (!company) notFound();

  // JSON-LD Organization — drives the knowledge-panel-style sidebar
  // Google sometimes renders for recognized companies.
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    url: company.website ?? `${SITE_URL}/firmy/${company.slug}`,
    description: company.tagline ?? company.description ?? undefined,
    logo: company.logo_url
      ? company.logo_url.startsWith("http")
        ? company.logo_url
        : `${SITE_URL}${company.logo_url}`
      : undefined,
    image: company.banner_url
      ? company.banner_url.startsWith("http")
        ? company.banner_url
        : `${SITE_URL}${company.banner_url}`
      : undefined,
    foundingDate: company.founded_year ? String(company.founded_year) : undefined,
    numberOfEmployees: company.employee_count ?? undefined,
    address: company.hq_location
      ? { "@type": "PostalAddress", addressLocality: company.hq_location }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CompanyProfilePage slug={slug} />
    </>
  );
}
