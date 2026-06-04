import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getPublicJobById, SITE_URL } from "@/lib/server-api";
import { slugify } from "@/features/jobs/lib/slugify";
import { PublicOfferPage } from "@/pages-ui/public/PublicOfferPage";
import type { PublicJobDetail } from "@/entities/job";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// The URL is /praca/<slug>-<uuid>. Pull the trailing UUID; the slug prefix is
// cosmetic. Accepts a bare UUID too (defensive — e.g. hand-typed links).
const UUID_RE = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

function extractId(slugParam: string): string | null {
  const m = slugParam.match(UUID_RE);
  return m ? m[1] : null;
}

// Canonical path for a job — keeps the human-readable slug in sync with the
// current title so a renamed offer still resolves and self-canonicalizes.
function canonicalPath(job: PublicJobDetail): string {
  const slug = job.slug || slugify(job.title);
  return `/praca/${slug}-${job.id}`;
}

// Plain-text helper for meta description: strip HTML, collapse whitespace,
// clamp to ~160 chars (SERP snippet length).
function metaDescription(job: PublicJobDetail): string {
  const raw = job.role_summary || job.value_proposition || "";
  const text = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length > 0) return text.slice(0, 160);
  const bits = [job.title, job.location, job.company?.name].filter(Boolean);
  return `${bits.join(" · ")} — oferta pracy na wakanta.pl`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const id = extractId(slug);
  const job = id ? await getPublicJobById(id) : null;

  if (!job) {
    return {
      title: "Nie znaleziono oferty — wakanta.pl",
      robots: { index: false, follow: false },
    };
  }

  const url = `${SITE_URL}${canonicalPath(job)}`;
  const company = job.company?.name;
  const title = company
    ? `${job.title} — ${company} | wakanta.pl`
    : `${job.title} — oferta pracy | wakanta.pl`;
  const description = metaDescription(job);
  const ogImage = job.company?.logo_url
    ? job.company.logo_url.startsWith("http")
      ? job.company.logo_url
      : `${SITE_URL}${job.company.logo_url}`
    : `${SITE_URL}/og-default.png`;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [job.title, job.location, company, job.seniority, "oferta pracy", "praca"].filter(
      (x): x is string => !!x,
    ),
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "wakanta.pl",
      locale: "pl_PL",
      images: [{ url: ogImage, alt: job.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

// Map our salary period to schema.org unitText.
const SALARY_UNIT: Record<string, string> = { hour: "HOUR", month: "MONTH", year: "YEAR" };
// Map work_mode to schema.org jobLocationType / arrangement hints.
const REMOTE_MODES = new Set(["remote"]);

function buildJobPostingJsonLd(job: PublicJobDetail, url: string): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description:
      (job.role_summary || "") +
      (job.responsibilities ? `<h3>Obowiązki</h3>${job.responsibilities}` : "") +
      (job.must_haves ? `<h3>Wymagania</h3>${job.must_haves}` : ""),
    datePosted: job.created_at,
    url,
    directApply: true,
    employmentType: job.contract_type ? job.contract_type.toUpperCase() : undefined,
    hiringOrganization: job.company
      ? {
          "@type": "Organization",
          name: job.company.name,
          logo: job.company.logo_url
            ? job.company.logo_url.startsWith("http")
              ? job.company.logo_url
              : `${SITE_URL}${job.company.logo_url}`
            : undefined,
        }
      : { "@type": "Organization", name: "wakanta.pl" },
  };

  // Location — Google requires either jobLocation OR a remote flag.
  if (REMOTE_MODES.has(job.work_mode ?? "")) {
    jsonLd.jobLocationType = "TELECOMMUTE";
    jsonLd.applicantLocationRequirements = { "@type": "Country", name: "Polska" };
  }
  if (job.location) {
    jsonLd.jobLocation = {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location, addressCountry: "PL" },
    };
  }

  // Salary — only when fully disclosed (both bounds + currency).
  if (job.salary_min != null && job.salary_max != null && job.salary_currency) {
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salary_currency,
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salary_min,
        maxValue: job.salary_max,
        unitText: SALARY_UNIT[job.salary_period ?? "month"] ?? "MONTH",
      },
    };
  }

  return jsonLd;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const id = extractId(slug);
  const job = id ? await getPublicJobById(id) : null;
  if (!job) notFound();

  // Self-canonicalize: if the slug prefix drifted (title changed, or someone
  // hit /praca/<bare-uuid>), 308-redirect to the canonical slug URL so Google
  // only ever indexes one address per offer.
  const canonical = canonicalPath(job);
  if (`/praca/${slug}` !== canonical) {
    redirect(canonical);
  }

  const jsonLd = buildJobPostingJsonLd(job, `${SITE_URL}${canonical}`);

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify can't inject HTML, but escape `<` defensively in case
        // a recruiter pasted "</script>" into a free-text field.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PublicOfferPage job={job} />
    </>
  );
}
