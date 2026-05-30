/**
 * Structured data builders for the /o-nas page.
 *
 * We emit five Schema.org graphs — Organization, AboutPage, WebSite,
 * BreadcrumbList and FAQPage. Each maps to a Google rich-result family:
 *
 *   - Organization     → knowledge-panel sidebar, logo+contact carousel
 *   - AboutPage        → "About" entity association for the brand
 *   - WebSite          → sitelinks + search action box in SERPs
 *   - BreadcrumbList   → breadcrumb trail under the result snippet
 *   - FAQPage          → expandable Q&A inside the result itself
 *
 * Keeping the graphs in a single helper makes it trivial to keep the
 * source-of-truth strings consistent between SSR metadata and on-page
 * markup — no copy-paste drift.
 */

export const ABOUT_FAQ: { question: string; answer: string }[] = [
  {
    question: "Czym jest wakanta.pl?",
    answer:
      "wakanta.pl to nowoczesny portal rekrutacyjny i system zarządzania kandydatami (ATS) dla firm w Polsce. Łączymy publiczny job board dla osób szukających pracy z zaawansowanym oprogramowaniem dla działów HR, wspieranym przez sztuczną inteligencję. Nasza misja to uczynienie rekrutacji bardziej ludzką, transparentną i zgodną z RODO.",
  },
  {
    question: "Czy korzystanie z wakanta.pl jest płatne dla kandydatów?",
    answer:
      "Nie. Przeglądanie ofert pracy, aplikowanie i tworzenie konta kandydata jest i pozostanie w pełni bezpłatne. Płatność dotyczy wyłącznie pracodawców, którzy korzystają z naszego ATS do zarządzania procesem rekrutacji.",
  },
  {
    question: "Jak wakanta.pl chroni moje dane osobowe?",
    answer:
      "Działamy w pełnej zgodności z RODO (Rozporządzenie 2016/679). Każdy kandydat ma prawo do dostępu, sprostowania, usunięcia i przenoszenia swoich danych. Stosujemy szyfrowanie haseł (bcrypt), bezpieczne JWT tokeny, audit log dostępu do danych oraz mechanizm wycofania zgody na profilowanie AI w dowolnym momencie. Inspektor Ochrony Danych: dpo@wakanta.pl.",
  },
  {
    question: "Czy wakanta.pl używa AI do oceny kandydatów?",
    answer:
      "Tak — opcjonalnie i wyłącznie za jawną, wcześniejszą zgodą kandydata (art. 22 RODO). AI (Claude od Anthropic) pomaga rekruterowi w analizie CV i dopasowaniu do oferty, ale każda rekomendacja jest oznaczona jako sugestia i wymaga weryfikacji człowieka. Decyzja o zatrudnieniu zawsze należy do rekrutera. Spełniamy wymogi nadchodzącego EU AI Act dla systemów wysokiego ryzyka.",
  },
  {
    question: "Czym wakanta.pl różni się od innych portali pracy?",
    answer:
      "Po pierwsze: jesteśmy zarówno publicznym job boardem, jak i pełnoprawnym ATS w jednym produkcie — nie musisz integrować dwóch systemów. Po drugie: oferty są kategoryzowane zawodowo (290+ specjalizacji), a filtry dynamicznie dostosowują się do branży. Po trzecie: jasno i otwarcie komunikujemy, gdzie używamy AI, jak chronimy dane i jak działa nasza rekomendacja — żadnych \"czarnych skrzynek\".",
  },
  {
    question: "Jak długo przechowujecie aplikacje kandydatów?",
    answer:
      "Domyślnie 12 miesięcy od daty złożenia aplikacji (zgodnie z rekomendacją UODO dla danych rekrutacyjnych bez dodatkowej zgody). Po tym okresie dane są automatycznie anonimizowane: usuwany jest plik CV, profil AI, dane kontaktowe i wszystkie powiązane oceny. Pracodawca może skonfigurować inny okres retencji per konto.",
  },
  {
    question: "Jak rozpocząć współpracę z wakanta.pl jako firma?",
    answer:
      "Załóż darmowe konto na stronie /signup lub przejdź do sekcji \"Dla pracodawców\", gdzie znajdziesz szczegóły o ofertach. Pierwsza publikacja oferty pracy jest bezpłatna, a pełen dostęp do ATS (zarządzanie pipeline, zespoły, automatyzacje, raporty, AI) jest dostępny w planach miesięcznych dopasowanych do wielkości firmy.",
  },
  {
    question: "Czy wakanta.pl wspiera proces rekrutacyjny w wielu językach?",
    answer:
      "Tak. Interfejs jest dostępny w języku polskim i angielskim, a CV są przetwarzane w obu językach automatycznie (model AI rozpoznaje język CV). Pracujemy nad rozszerzeniem o niemiecki i ukraiński w Q3 2026.",
  },
];

interface SiteContext {
  siteUrl: string;
  pageUrl: string;
}

/**
 * Builds Organization graph. Google uses this for the knowledge-panel
 * sidebar (logo, founding date, contact, social profiles).
 */
export function buildOrganizationGraph(ctx: SiteContext) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${ctx.siteUrl}/#organization`,
    name: "wakanta.pl",
    legalName: "wakanta.pl",
    url: ctx.siteUrl,
    logo: `${ctx.siteUrl}/og-default.png`,
    description:
      "wakanta.pl to nowoczesny portal rekrutacyjny i system ATS dla firm w Polsce — łączymy publiczny job board z oprogramowaniem HR wspieranym przez AI, zgodnym z RODO i EU AI Act.",
    foundingDate: "2026",
    foundingLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "PL" },
    },
    areaServed: { "@type": "Country", name: "Polska" },
    knowsAbout: [
      "Rekrutacja",
      "Applicant Tracking System",
      "Sztuczna inteligencja w HR",
      "RODO",
      "EU AI Act",
      "Job board",
      "Pipeline rekrutacyjny",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "kontakt@wakanta.pl",
        availableLanguage: ["Polish", "English"],
      },
      {
        "@type": "ContactPoint",
        contactType: "data protection officer",
        email: "dpo@wakanta.pl",
        availableLanguage: ["Polish"],
      },
      {
        "@type": "ContactPoint",
        contactType: "security",
        email: "security@wakanta.pl",
        availableLanguage: ["Polish", "English"],
      },
    ],
    sameAs: [
      // Placeholdery — uzupełnij rzeczywistymi profilami po założeniu
      "https://www.linkedin.com/company/wakanta",
      "https://twitter.com/wakanta_pl",
    ],
  };
}

/** AboutPage graph — łączy stronę z encją Organization. */
export function buildAboutPageGraph(ctx: SiteContext) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${ctx.pageUrl}#aboutpage`,
    url: ctx.pageUrl,
    name: "O nas — wakanta.pl",
    description:
      "Poznaj misję wakanta.pl: dlaczego powstaliśmy, jakie problemy rozwiązujemy w polskiej rekrutacji i jak łączymy ATS, job board i etyczne AI w jednym produkcie.",
    inLanguage: "pl-PL",
    isPartOf: { "@id": `${ctx.siteUrl}/#website` },
    about: { "@id": `${ctx.siteUrl}/#organization` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${ctx.siteUrl}/og-default.png`,
    },
  };
}

/** WebSite graph — odblokowuje "sitelinks search box" w SERPach. */
export function buildWebSiteGraph(ctx: SiteContext) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${ctx.siteUrl}/#website`,
    url: ctx.siteUrl,
    name: "wakanta.pl",
    inLanguage: "pl-PL",
    publisher: { "@id": `${ctx.siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${ctx.siteUrl}/jobs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Breadcrumbs — pokazuje trail pod wynikiem w Google. */
export function buildBreadcrumbGraph(ctx: SiteContext) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Strona główna",
        item: ctx.siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "O nas",
        item: ctx.pageUrl,
      },
    ],
  };
}

/** FAQPage — Google pokazuje rozwijane Q&A wewnątrz wyniku. Najmocniejszy SEO win. */
export function buildFaqGraph() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ABOUT_FAQ.map((qa) => ({
      "@type": "Question",
      name: qa.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: qa.answer,
      },
    })),
  };
}
