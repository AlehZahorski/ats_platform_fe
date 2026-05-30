/**
 * /o-nas — About page.
 *
 * Server Component on purpose: every word is indexable, zero hydration cost,
 * five JSON-LD graphs streamed into the initial HTML.
 *
 * SEO checklist applied:
 *   - generateMetadata: title, description, keywords, canonical,
 *     openGraph (article), twitter (summary_large_image), robots.googleBot
 *     with max-snippet/max-image-preview unlocked.
 *   - JSON-LD: Organization, AboutPage, WebSite (search box), BreadcrumbList,
 *     FAQPage — five separate <script type="application/ld+json"> tags so
 *     Google's validator parses each independently.
 *   - Heading hierarchy: exactly one <h1>, nested <h2>/<h3>.
 *   - Semantic HTML: <article>, <section>, <header>, <nav aria-label>,
 *     <dl>/<dt>/<dd>, <ol> with timestamps, <table> with <caption>.
 *   - Internal links to /jobs, /firmy, /dla-pracodawcow, /signup,
 *     /poradnik — strengthens site graph.
 *   - Anchored sections (#misja, #wartosci, …) for in-page TOC + deep
 *     linking from external content.
 */
import type { Metadata } from "next";
import { AboutPage as AboutPageView } from "@/pages-ui/about/AboutPage";
import { SITE_URL } from "@/lib/server-api";
import {
  buildAboutPageGraph,
  buildBreadcrumbGraph,
  buildFaqGraph,
  buildOrganizationGraph,
  buildWebSiteGraph,
} from "@/pages-ui/about/lib/structured-data";

const PAGE_URL = `${SITE_URL}/o-nas`;
const PAGE_TITLE = "O nas — misja, wizja i zespół | wakanta.pl";
const PAGE_DESCRIPTION =
  "wakanta.pl to polski portal pracy i ATS z etycznym AI. Poznaj naszą misję, dlaczego powstaliśmy, jak chronimy dane kandydatów (RODO + EU AI Act) i czym różnimy się od innych portali rekrutacyjnych.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    keywords: [
      "wakanta",
      "wakanta.pl",
      "o nas",
      "misja",
      "portal pracy Polska",
      "ATS",
      "Applicant Tracking System",
      "system rekrutacyjny",
      "AI w rekrutacji",
      "etyczne AI",
      "RODO rekrutacja",
      "EU AI Act",
      "system HR",
      "polski portal pracy",
      "transparentna rekrutacja",
    ],
    alternates: { canonical: PAGE_URL },
    openGraph: {
      type: "article",
      url: PAGE_URL,
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      siteName: "wakanta.pl",
      locale: "pl_PL",
      images: [
        {
          url: `${SITE_URL}/og-default.png`,
          width: 1200,
          height: 630,
          alt: "wakanta.pl — polski portal pracy i ATS",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      images: [`${SITE_URL}/og-default.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    authors: [{ name: "wakanta.pl" }],
    publisher: "wakanta.pl",
    category: "Recruitment",
    // No language alternates for now — English version of /about is planned.
    other: {
      // Optional dc:* terms — some crawlers / readers still consume them.
      "dc.language": "pl",
      "dc.subject": "Rekrutacja, ATS, Job board, AI w HR",
      "dc.publisher": "wakanta.pl",
    },
  };
}

export default function Page() {
  const ctx = { siteUrl: SITE_URL, pageUrl: PAGE_URL };
  // Five independent graphs. Splitting them gives Google's structured-data
  // tester one block per result type — easier to debug and harder for a
  // single bad field to invalidate the whole bundle.
  const graphs = [
    buildOrganizationGraph(ctx),
    buildWebSiteGraph(ctx),
    buildAboutPageGraph(ctx),
    buildBreadcrumbGraph(ctx),
    buildFaqGraph(),
  ];

  return (
    <>
      {graphs.map((g, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          // JSON.stringify can't accidentally inject HTML — but we still
          // escape `</script>` defensively in case a future copywriter
          // pastes one into a FAQ answer.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(g).replace(/</g, "\\u003c"),
          }}
        />
      ))}
      <AboutPageView />
    </>
  );
}
