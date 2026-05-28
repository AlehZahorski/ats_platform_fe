"use client";

import { ArticleListView } from "./ArticleListView";

// /firmy-pisza — articles authored by verified companies. Same shared
// rendering as /poradnik with distinct copy so readers know they're in
// a brand-content context, not editorial. The action verb in the title
// ("piszą") signals authorship direction unambiguously.
export function FirmyPiszaListPage() {
  return (
    <ArticleListView
      config={{
        type: "company",
        routePath: "/firmy-pisza",
        heroTitle: "Firmy",
        heroAccent: "piszą",
        heroSubtitle:
          "Insighty, case study i historie zespołów technicznych z polskich firm IT. Treści tworzone przez ludzi, którzy w danej firmie pracują.",
        searchPlaceholder: 'Szukaj artykułów firm, np. "kultura zespołu"…',
        latestTitle: "Najnowsze",
        latestAccent: "głosy firm",
      }}
    />
  );
}
