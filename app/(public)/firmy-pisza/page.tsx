import type { Metadata } from "next";
import { FirmyPiszaListPage } from "@/pages-ui/poradnik/FirmyPiszaListPage";
import { SITE_URL } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Firmy piszą — głos polskich zespołów IT | wakanta.pl",
  description:
    "Insighty, case study i historie zespołów technicznych z polskich firm IT. Treści tworzone przez ludzi z branży.",
  alternates: { canonical: `${SITE_URL}/firmy-pisza` },
  keywords: ["artykuły firm IT", "case study IT", "kultura firmy", "polskie firmy IT"],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/firmy-pisza`,
    title: "Firmy piszą — wakanta.pl",
    description:
      "Insighty, case study i historie zespołów technicznych z polskich firm IT.",
    siteName: "wakanta.pl",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
    title: "Firmy piszą — wakanta.pl",
    description: "Insighty i case study z polskich firm IT.",
  },
};

export default function Page() {
  return <FirmyPiszaListPage />;
}
