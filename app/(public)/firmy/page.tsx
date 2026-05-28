import type { Metadata } from "next";
import { CompaniesListPage } from "@/pages-ui/companies/CompaniesListPage";
import { SITE_URL } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Firmy IT — zweryfikowani pracodawcy | wakanta.pl",
  description:
    "Katalog zweryfikowanych firm IT w Polsce. Profile firm, oferty pracy, transparentne wynagrodzenia i procesy rekrutacji.",
  alternates: { canonical: `${SITE_URL}/firmy` },
  keywords: ["firmy IT", "pracodawcy IT", "katalog firm", "praca w IT"],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/firmy`,
    title: "Firmy IT — zweryfikowani pracodawcy | wakanta.pl",
    description:
      "Katalog zweryfikowanych firm IT w Polsce. Profile, oferty, opinie.",
    siteName: "wakanta.pl",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Firmy IT — wakanta.pl",
    description: "Katalog zweryfikowanych firm IT w Polsce.",
  },
};

export default function Page() {
  return <CompaniesListPage />;
}
