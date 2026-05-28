import type { Metadata } from "next";
import { PoradnikListPage } from "@/pages-ui/poradnik/PoradnikListPage";
import { SITE_URL } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Poradnik — wakanta.pl",
  description:
    "Artykuły, wskazówki i analizy rynku IT dla kandydatów i pracodawców. CV, rozmowy rekrutacyjne, wynagrodzenia, kariera.",
  alternates: { canonical: `${SITE_URL}/poradnik` },
  keywords: ["poradnik IT", "rozmowy rekrutacyjne", "CV", "wynagrodzenia IT", "kariera w IT"],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/poradnik`,
    title: "Poradnik — wakanta.pl",
    description:
      "Artykuły, wskazówki i analizy rynku IT dla kandydatów i pracodawców.",
    siteName: "wakanta.pl",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Poradnik — wakanta.pl",
    description:
      "Artykuły, wskazówki i analizy rynku IT dla kandydatów i pracodawców.",
  },
};

export default function Page() {
  return <PoradnikListPage />;
}
