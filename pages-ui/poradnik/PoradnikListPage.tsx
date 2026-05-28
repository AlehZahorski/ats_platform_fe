"use client";

import { ArticleListView } from "./ArticleListView";

// Editorial /poradnik view — admin-authored articles. The shared
// ArticleListView component does all the lifting; we just supply
// copy + URL config.
export function PoradnikListPage() {
  return (
    <ArticleListView
      config={{
        type: "editorial",
        routePath: "/poradnik",
        heroTitle: "Poradnik dla kandydatów",
        heroAccent: "i pracodawców",
        heroSubtitle:
          "Artykuły, wskazówki, wzory CV i analizy rynku IT. Wszystko, czego potrzebujesz w karierze.",
        searchPlaceholder: 'Szukaj artykułów, np. "rozmowa rekrutacyjna"…',
        latestTitle: "Świeże publikacje",
        latestAccent: "z naszej redakcji",
      }}
    />
  );
}
