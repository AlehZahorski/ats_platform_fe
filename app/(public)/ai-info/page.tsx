/**
 * /ai-info — AI transparency page.
 *
 * Server Component: fully indexable, zero hydration. Emits FAQPage +
 * BreadcrumbList JSON-LD so the candidate-facing AI disclosures are
 * machine-readable (RODO art. 13 information duty + EU AI Act transparency).
 */
import type { Metadata } from "next";
import { AiInfoPage as AiInfoPageView } from "@/pages-ui/ai-info/AiInfoPage";
import { AI_INFO_FAQ } from "@/pages-ui/ai-info/lib/faq";
import { SITE_URL } from "@/lib/server-api";

const PAGE_URL = `${SITE_URL}/ai-info`;
const PAGE_TITLE = "Jak używamy AI — transparentność i prywatność | wakanta.pl";
const PAGE_DESCRIPTION =
  "Jak wakanta.pl używa sztucznej inteligencji w rekrutacji: gdzie działa AI, jaki model (Claude), jak chronimy Twoje dane (redakcja PII, brak treningu), oraz Twoje prawa zgodnie z RODO art. 22 i EU AI Act.";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    keywords: [
      "AI w rekrutacji",
      "transparentność AI",
      "etyczne AI",
      "RODO art. 22",
      "EU AI Act",
      "profilowanie kandydata",
      "automatyczne decyzje",
      "ochrona danych rekrutacja",
      "wakanta.pl",
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
          alt: "wakanta.pl — transparentność AI w rekrutacji",
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
  };
}

export default function Page() {
  const graphs = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Strona główna", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Sztuczna inteligencja", item: PAGE_URL },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: AI_INFO_FAQ.map((qa) => ({
        "@type": "Question",
        name: qa.question,
        acceptedAnswer: { "@type": "Answer", text: qa.answer },
      })),
    },
  ];

  return (
    <>
      {graphs.map((g, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(g).replace(/</g, "\\u003c"),
          }}
        />
      ))}
      <AiInfoPageView />
    </>
  );
}
