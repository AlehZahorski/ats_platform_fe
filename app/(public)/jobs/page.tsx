import type { Metadata } from "next";
import { Suspense } from "react";
import { ROUTES } from "@/config/routes";
import { listAllPublicJobs, SITE_URL } from "@/lib/server-api";
import { JobBoardPage } from "@/pages-ui/jobboard/JobBoardPage";

export const metadata: Metadata = {
  title: "Oferty pracy — wakanta.pl",
  description:
    "Przeglądaj aktualne oferty pracy od zweryfikowanych pracodawców i agencji. " +
    "Filtruj po branży, lokalizacji, trybie pracy i typie umowy.",
  alternates: { canonical: `${SITE_URL}/jobs` },
  openGraph: {
    title: "Oferty pracy — wakanta.pl",
    description: "Aktualne oferty pracy od zweryfikowanych pracodawców i agencji.",
    url: `${SITE_URL}/jobs`,
    type: "website",
    locale: "pl_PL",
  },
};

export default async function Page() {
  // SSR a crawlable list of current offers so search engines discover and index
  // the /praca/<slug>-<uuid> pages directly from the listing. The interactive,
  // filterable board below is client-side; these links are screen-reader-only so
  // they don't visually duplicate the board for sighted users.
  const jobs = (await listAllPublicJobs()).slice(0, 60);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: jobs.map((j, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${ROUTES.public.job(j.id, j.slug)}`,
      name: j.title,
    })),
  };

  return (
    <>
      {jobs.length > 0 && (
        <nav aria-label="Aktualne oferty pracy" className="sr-only">
          <h2>Aktualne oferty pracy</h2>
          <ul>
            {jobs.map((j) => (
              <li key={j.id}>
                <a href={ROUTES.public.job(j.id, j.slug)}>{j.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      {/* JobBoardPage uses useSearchParams which requires Suspense in Next 15. */}
      <Suspense
        fallback={<div className="p-12 text-center text-muted-foreground">Ładowanie…</div>}
      >
        <JobBoardPage />
      </Suspense>
    </>
  );
}
