/**
 * About-us page content. Server Component on purpose — every word here is
 * indexable, no client JS, zero hydration cost. Filtering / interactive
 * widgets live in child client components if needed.
 *
 * Structure rationale (SEO + UX):
 *   1. <h1> with target phrase
 *   2. Hero stat strip (anchor links scroll-to)
 *   3. Mission (anchored)
 *   4. Why we exist — long-form, keyword-rich, primary indexable content
 *   5. Vision — short-form, brand voice
 *   6. Values — list with semantic <h3>s + structured terms
 *   7. For employers / For candidates — two parallel cards, internal links
 *   8. What makes us different — explicit competitor mention, comparison
 *   9. Story / timeline — temporal structure helps E-E-A-T
 *  10. Stats — numbers Google quotes
 *  11. Technology & AI ethics — covers EU AI Act + RODO terms
 *  12. FAQ — visible Q&A mirrors the FAQPage JSON-LD
 *  13. Contact + DPO + press
 *
 * Every <section> has an explicit `id` so anchor links work and so we can
 * generate a sticky in-page table-of-contents in a future iteration.
 */
import Link from "next/link";
import {
  Compass,
  Heart,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Briefcase,
  GraduationCap,
  Mail,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { ABOUT_FAQ } from "./lib/structured-data";

const SECTIONS: { id: string; label: string }[] = [
  { id: "misja", label: "Misja" },
  { id: "dlaczego", label: "Dlaczego powstaliśmy" },
  { id: "wizja", label: "Wizja" },
  { id: "wartosci", label: "Wartości" },
  { id: "dla-kogo", label: "Dla kogo" },
  { id: "czym-sie-rozni", label: "Co nas wyróżnia" },
  { id: "historia", label: "Historia" },
  { id: "technologia", label: "Technologia i etyka AI" },
  { id: "faq", label: "FAQ" },
  { id: "kontakt", label: "Kontakt" },
];

export function AboutPage() {
  return (
    <article className="bg-background text-foreground">
      {/* ─────────────────────────────────────────────────────────────
          Breadcrumbs (visible + machine readable via JSON-LD in page.tsx)
          ───────────────────────────────────────────────────────────── */}
      <nav aria-label="Ścieżka nawigacji" className="border-b border-border/50 bg-card/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 text-xs">
          <ol className="flex items-center gap-1.5 text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                Strona główna
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium" aria-current="page">
              O nas
            </li>
          </ol>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          HERO
          ───────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            Poznaj wakanta.pl
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground max-w-3xl leading-tight">
            Rekrutacja, która szanuje czas i&nbsp;dane &mdash; po obu stronach stołu.
          </h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            wakanta.pl to polski portal pracy i&nbsp;system <abbr title="Applicant Tracking System">ATS</abbr>{" "}
            w&nbsp;jednym. Pomagamy firmom prowadzić zatrudnianie szybko
            i&nbsp;sprawiedliwie, a&nbsp;kandydatom dajemy uczciwy proces zgodny
            z&nbsp;RODO &mdash; z&nbsp;jasną informacją, gdzie używamy sztucznej inteligencji
            i&nbsp;jak chronimy ich prywatność.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dla-pracodawcow"
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90"
            >
              Dla pracodawców <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent/40"
            >
              Szukaj pracy
            </Link>
          </div>

          {/* In-page TOC — keeps page LCP low (no JS) and helps Google understand the structure. */}
          <nav aria-label="Sekcje strony" className="mt-10 flex flex-wrap gap-1.5">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          1. MISSION
          ───────────────────────────────────────────────────────────── */}
      <section id="misja" className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
                <Compass className="w-4 h-4" aria-hidden="true" /> Misja
              </div>
              <h2 className="font-display text-3xl font-bold mb-3">
                Uprościć rekrutację bez upraszczania ludzi
              </h2>
            </div>
            <div className="space-y-4 text-base text-foreground/90 leading-relaxed">
              <p>
                Naszą misją jest sprawić, żeby <strong>zatrudnianie w Polsce</strong> przestało być
                grą o&nbsp;dostęp do wewnętrznych narzędzi, drogich licencji i&nbsp;wąskiej grupy
                konsultantów &mdash; a&nbsp;stało się przejrzystym procesem, w&nbsp;którym{" "}
                <strong>każdy kandydat wie, co się dzieje z&nbsp;jego CV</strong>,
                a&nbsp;każda firma ma narzędzia odpowiadające jej skali.
              </p>
              <p>
                Wierzymy, że dobry ATS nie musi kosztować jak korporacyjny system z&nbsp;USA,
                a&nbsp;dobry portal pracy nie musi sprzedawać danych kandydatów do
                dziesiątek partnerów reklamowych. <strong>wakanta.pl pokazuje, że jedno
                i&nbsp;drugie da się zrobić uczciwie</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. WHY WE EXIST (problem)
          ───────────────────────────────────────────────────────────── */}
      <section id="dlaczego" className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <Lightbulb className="w-4 h-4" aria-hidden="true" /> Dlaczego powstaliśmy
            </div>
            <h2 className="font-display text-3xl font-bold mb-4">
              Polski rynek pracy zasługuje na lepsze narzędzia
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Polski rynek pracy w&nbsp;2026&nbsp;roku to setki tysięcy ofert miesięcznie,
              ponad <strong>2&nbsp;miliony aktywnie poszukujących</strong>{" "}
              i&nbsp;dziesiątki tysięcy firm, dla których HR jest jednym z&nbsp;najtrudniejszych
              procesów operacyjnych. Mimo to większość portali pracy w&nbsp;Polsce
              wciąż funkcjonuje w&nbsp;modelu sprzed dekady &mdash; jako tablice ogłoszeń
              z&nbsp;przeciążonymi rekruterami, którzy ręcznie filtrują CV w&nbsp;Excelu.
            </p>
          </div>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Brak przejrzystości dla kandydata",
                body:
                  "Kandydat wysyła CV i&nbsp;w&nbsp;90&nbsp;%&nbsp;przypadków nie dostaje żadnej informacji zwrotnej. Nie wie, czy aplikacja w&nbsp;ogóle dotarła. Nie wie, jaką decyzję podjęto. Nie wie, jak długo jego dane są przechowywane.",
              },
              {
                title: "ATS-y skrojone pod korporacje",
                body:
                  "Dostępne na rynku ATS-y są albo bardzo drogie (Workday, Greenhouse, SAP SuccessFactors), albo lokalne i&nbsp;technicznie niedoinwestowane. Mała firma z&nbsp;Polski musi wybierać między tabelą w&nbsp;Google Sheets a&nbsp;subskrypcją za&nbsp;2&nbsp;000&nbsp;PLN miesięcznie.",
              },
              {
                title: "AI bez nadzoru",
                body:
                  "Coraz więcej narzędzi automatycznie scoruje kandydatów na&nbsp;podstawie CV bez wiedzy kandydata, bez prawa do&nbsp;wyjaśnienia decyzji i&nbsp;często z&nbsp;ukrytym biasem. To narusza zarówno RODO art.&nbsp;22, jak i&nbsp;nadchodzący EU AI Act.",
              },
              {
                title: "Dane sprzedawane partnerom",
                body:
                  "Większość bezpłatnych portali pracy zarabia na&nbsp;sprzedaży danych kandydatów do&nbsp;agencji rekrutacyjnych, firm szkoleniowych i&nbsp;sieci reklamowych. Kandydat nigdy nie wyraża świadomej zgody.",
              },
              {
                title: "Brak kategoryzacji",
                body:
                  "Portale pracy mieszają oferty z&nbsp;różnych branż w&nbsp;jednej wyszukiwarce. Programista i&nbsp;magazynier muszą używać tych samych filtrów &mdash; dla obu są one albo&nbsp;za szerokie, albo&nbsp;za wąskie.",
              },
              {
                title: "Brak wsparcia dla pracodawcy",
                body:
                  "Mała firma nie ma dziesięcioosobowego HR-u. Potrzebuje narzędzia, które samo proponuje treść oferty, samo wykrywa duplikaty kandydatów i&nbsp;samo przypomina o&nbsp;przeterminowanej zgodzie RODO.",
              },
            ].map((p) => (
              <li
                key={p.title}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="font-semibold mb-2 text-foreground">{p.title}</h3>
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: p.body }}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. VISION
          ───────────────────────────────────────────────────────────── */}
      <section id="wizja" className="border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
            <Target className="w-4 h-4" aria-hidden="true" /> Wizja
          </div>
          <h2 className="font-display text-3xl font-bold mb-5">
            Rekrutacja, która kończy się <em className="text-primary not-italic">decyzją w&nbsp;dwa tygodnie</em>, a&nbsp;nie w&nbsp;dwa miesiące
          </h2>
          <p className="text-foreground/90 leading-relaxed text-lg">
            Chcemy, żeby do&nbsp;2030&nbsp;roku co druga średnia firma w&nbsp;Polsce
            prowadziła rekrutacje krócej niż 14&nbsp;dni od&nbsp;ogłoszenia do&nbsp;oferty &mdash;
            bez utraty jakości i&nbsp;bez wątpliwości etycznych po&nbsp;stronie kandydata.
            Wakanta jest narzędziem, które to umożliwia.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. VALUES
          ───────────────────────────────────────────────────────────── */}
      <section id="wartosci" className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <Heart className="w-4 h-4" aria-hidden="true" /> Wartości
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Sześć zasad, którymi się kierujemy
            </h2>
            <p className="text-muted-foreground">
              Wartości to nie&nbsp;tylko slogan na&nbsp;ścianie biura &mdash; to konkretne
              decyzje produktowe i&nbsp;codzienne kompromisy, które podejmujemy.
            </p>
          </div>
          <dl className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                term: "Przejrzystość",
                def: "Kandydat zawsze wie, kto ma jego CV, jak długo i&nbsp;czy AI brało udział w&nbsp;decyzji. Nigdy nie ukrywamy mechanizmów scoringu.",
              },
              {
                term: "Prywatność by design",
                def: "Domyślnie minimalizujemy dane. PII redagowane jest przed wysłaniem do&nbsp;LLM, bez zgody na&nbsp;profilowanie AI &mdash; matchowanie nie&nbsp;rusza.",
              },
              {
                term: "Człowiek na&nbsp;końcu pętli",
                def: "AI podpowiada, człowiek decyduje. Każda automatyczna rekomendacja jest oznaczona jako sugestia i&nbsp;wymaga zatwierdzenia.",
              },
              {
                term: "Sprawiedliwość",
                def: "Promptowo blokujemy dyskryminację po&nbsp;cechach chronionych (wiek, płeć, narodowość, status rodzinny). Brak ukrytych biasów &mdash; mamy ich pełną listę w&nbsp;dokumentacji.",
              },
              {
                term: "Otwartość kodu",
                def: "Kluczowe komponenty bezpieczeństwa, modele danych i&nbsp;polityki retencji są publicznie udokumentowane. Brak black-box-ów.",
              },
              {
                term: "Polska kontekstowo",
                def: "Specjalizacje, kategorie zawodów, uprawnienia (SEP, UDT, HACCP, KP) i&nbsp;polskie przepisy o&nbsp;czasie pracy są wbudowane w&nbsp;produkt.",
              },
            ].map((v) => (
              <div
                key={v.term}
                className="rounded-xl border border-border bg-card p-5"
              >
                <dt className="font-semibold mb-2 text-foreground">{v.term}</dt>
                <dd
                  className="text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: v.def }}
                />
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. FOR EMPLOYERS / FOR CANDIDATES
          ───────────────────────────────────────────────────────────── */}
      <section id="dla-kogo" className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <Users className="w-4 h-4" aria-hidden="true" /> Dla kogo
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Jeden produkt, dwie perspektywy
            </h2>
            <p className="text-muted-foreground">
              Większość systemów myśli o&nbsp;rekrutacji jako o&nbsp;jednostronnej transakcji.
              wakanta.pl jest dwustronną platformą &mdash; kandydat i&nbsp;pracodawca
              dostają tę&nbsp;samą jakość narzędzi, tylko skierowaną w&nbsp;swoją stronę.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Employers */}
            <article className="rounded-2xl border border-border bg-card p-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="rounded-lg bg-primary/10 p-2.5">
                  <Briefcase className="w-5 h-5 text-primary" aria-hidden="true" />
                </span>
                <h3 className="font-display text-xl font-bold">Dla pracodawców</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Pełny ATS z&nbsp;publiczną stroną ofert. Bez integracji,
                bez dwóch faktur, bez kompromisów technologicznych.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "Pipeline kanban z&nbsp;automatyzacjami stage'ów",
                  "AI-asystent do&nbsp;pisania ofert i&nbsp;analizy ryzyka",
                  "Profil firmy SEO-friendly indeksowany przez Google",
                  "Scorecards z&nbsp;personalizowanymi kryteriami",
                  "Multi-tenant z&nbsp;zespołami, rolami i&nbsp;audytem",
                  "Domyślnie zgodne z&nbsp;RODO + retention scheduler",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span
                      className="text-foreground/90"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  </li>
                ))}
              </ul>
              <Link
                href="/dla-pracodawcow"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Dowiedz się więcej <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </article>

            {/* Candidates */}
            <article className="rounded-2xl border border-border bg-card p-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="rounded-lg bg-primary/10 p-2.5">
                  <GraduationCap className="w-5 h-5 text-primary" aria-hidden="true" />
                </span>
                <h3 className="font-display text-xl font-bold">Dla kandydatów</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                Wyszukiwanie pracy, które nie&nbsp;manipuluje i&nbsp;szanuje twój czas.
                Zero ukrytych warunków.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "290+ specjalizacji z&nbsp;filtrami dostosowanymi do&nbsp;branży",
                  "Strona śledzenia aplikacji z&nbsp;jawnym statusem",
                  "Pełna kontrola nad&nbsp;profilowaniem AI &mdash; opt-in",
                  "Prawo do&nbsp;wycofania zgody w&nbsp;jednym kliknięciu",
                  "Zapisane wyszukiwania z&nbsp;powiadomieniami e-mail",
                  "Konto zachowywane lub usuwane w&nbsp;dowolnym momencie",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span
                      className="text-foreground/90"
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  </li>
                ))}
              </ul>
              <Link
                href="/jobs"
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Szukaj pracy <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. WHAT MAKES US DIFFERENT (competitor comparison)
          ───────────────────────────────────────────────────────────── */}
      <section id="czym-sie-rozni" className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <Sparkles className="w-4 h-4" aria-hidden="true" /> Co nas wyróżnia
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Czym różnimy się od&nbsp;tradycyjnych portali pracy
            </h2>
            <p className="text-muted-foreground">
              Nie&nbsp;udajemy, że istnieje jeden uniwersalny portal pracy dla wszystkich.
              Mamy swoje wybory.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Porównanie wakanta.pl z&nbsp;typowymi portalami pracy i&nbsp;tradycyjnymi systemami ATS
              </caption>
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Cecha</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Klasyczny portal pracy</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Korporacyjny ATS</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-primary">wakanta.pl</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  ["Cena dla małej firmy", "Niska, płatne za&nbsp;ogłoszenie", "Wysoka (od&nbsp;1&nbsp;000&nbsp;PLN/mies.)", "Niska, plany skalowane do&nbsp;wielkości"],
                  ["ATS dla rekruterów", "Brak", "Pełen, lecz złożony", "Pełen, prosty, w&nbsp;cenie"],
                  ["Publiczny job board SEO", "Tak", "Brak", "Tak, z&nbsp;JSON-LD i&nbsp;sitemap"],
                  ["AI scoring", "Czasami, ukryte", "Często, ukryte", "Opt-in, transparentne"],
                  ["Sprzedaż danych kandydatów", "Często", "Brak", "Nigdy"],
                  ["Polskie kategorie zawodów", "Częściowo", "Brak", "290+ specjalizacji"],
                  ["RODO + EU AI Act ready", "Częściowo", "Częściowo", "Pełne wdrożenie"],
                  ["Średni czas integracji", "0 dni", "30-90 dni", "0 dni"],
                ].map(([cell1, cell2, cell3, cell4], i) => (
                  <tr key={i}>
                    <th scope="row" className="px-4 py-3 text-left font-medium align-top" dangerouslySetInnerHTML={{ __html: cell1 }} />
                    <td className="px-4 py-3 text-muted-foreground align-top" dangerouslySetInnerHTML={{ __html: cell2 }} />
                    <td className="px-4 py-3 text-muted-foreground align-top" dangerouslySetInnerHTML={{ __html: cell3 }} />
                    <td className="px-4 py-3 text-foreground font-medium align-top" dangerouslySetInnerHTML={{ __html: cell4 }} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. STORY / TIMELINE
          ───────────────────────────────────────────────────────────── */}
      <section id="historia" className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <TrendingUp className="w-4 h-4" aria-hidden="true" /> Historia
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Jak powstała wakanta.pl
            </h2>
          </div>
          <ol className="relative space-y-8 border-l-2 border-border pl-6 ml-2">
            {[
              {
                date: "Q4 2025",
                title: "Pomysł",
                body: "Założyciele &mdash; doświadczeni inżynierowie i&nbsp;rekruterzy &mdash; spotykają się przy kawie w&nbsp;Warszawie, wymieniając opowieści o&nbsp;tym, jak frustrujące jest&nbsp;dla nich obecne narzędzia rekrutacyjne. Zaczynają szkicować zarys produktu, który połączyłby publiczny job board z&nbsp;ATS dla małych i&nbsp;średnich firm.",
              },
              {
                date: "Q1 2026",
                title: "MVP",
                body: "Pierwsza wersja produktu: parsowanie CV, pipeline kanban, formularz aplikacji. Brak AI, brak job boardu publicznego &mdash; tylko wewnętrzne narzędzie testowane przez pięć zaprzyjaźnionych firm.",
              },
              {
                date: "Q2 2026",
                title: "Job board publiczny",
                body: "Otwarcie publicznej części serwisu &mdash; oferty pracy widoczne dla wszystkich, katalog firm, profile, JSON-LD dla&nbsp;Google for&nbsp;Jobs. Pierwsze 50&nbsp;firm zarejestrowanych.",
              },
              {
                date: "Q2 2026",
                title: "Etyczne AI",
                body: "Wprowadzenie modułu AI (Claude od&nbsp;Anthropic) do&nbsp;parsowania CV i&nbsp;match-makingu. Wszystko opcjonalne, z&nbsp;wyraźną zgodą kandydata. Pełna dokumentacja zgodności z&nbsp;EU AI Act i&nbsp;RODO art.&nbsp;22.",
              },
              {
                date: "2026 &rarr; dalej",
                title: "Ekspansja",
                body: "Plan rozszerzenia produktu o&nbsp;kalendarz rekrutera, integrację z&nbsp;LinkedIn, automatyczne self-scheduling rozmów oraz wsparcie języka ukraińskiego i&nbsp;niemieckiego.",
              },
            ].map((evt) => (
              <li key={evt.title} className="relative">
                <span
                  aria-hidden="true"
                  className="absolute -left-[31px] mt-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-background"
                />
                <p
                  className="text-xs font-semibold uppercase tracking-[0.15em] text-primary mb-1"
                  dangerouslySetInnerHTML={{ __html: evt.date }}
                />
                <h3 className="font-semibold text-foreground mb-1">{evt.title}</h3>
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: evt.body }}
                />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. TECHNOLOGY & AI ETHICS
          ───────────────────────────────────────────────────────────── */}
      <section id="technologia" className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Technologia i&nbsp;etyka AI
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Jakie technologie napędzają wakanta.pl
            </h2>
            <p className="text-muted-foreground">
              Wybieramy świadomie. Każdy element infrastruktury ma swój
              powód &mdash; bezpieczeństwa, zgodności prawnej lub wydajności.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                head: "Sztuczna inteligencja",
                body: "Modele Claude od&nbsp;Anthropic (Haiku 4.5 + Sonnet 4.6) z&nbsp;prompt cachingiem, dedykowanym fairness layerem i&nbsp;automatycznym redagowaniem PII przed wysyłką. Brak zgody kandydata &equals; brak transferu do&nbsp;USA.",
              },
              {
                head: "Backend",
                body: "FastAPI 0.116 + SQLAlchemy 2.0 async + PostgreSQL 16. Composite indeksy, GIN dla JSONB, pg_trgm dla wyszukiwania pełnotekstowego. Średnia latencja API: 20&nbsp;ms.",
              },
              {
                head: "Frontend",
                body: "Next.js 15 (App Router) + React 18 + TypeScript 5 strict. SSR dla publicznych stron, hydration tylko dla interaktywności. SEO-friendly z&nbsp;JSON-LD na&nbsp;każdej publicznej trasie.",
              },
              {
                head: "Bezpieczeństwo",
                body: "Hasła bcrypt (cost factor 12), JWT z&nbsp;exp, refresh tokens hashowane SHA-256, security headers, CSP, rate-limiting per-IP na&nbsp;auth, RODO-compliant logi z&nbsp;PII redaction.",
              },
              {
                head: "Zgodność prawna",
                body: "Pełne wdrożenie RODO (art.&nbsp;6, 9, 13, 17, 22), EU AI Act dla&nbsp;systemów wysokiego ryzyka (Annex&nbsp;III §4), ePrivacy. Inspektor Ochrony Danych dostępny pod&nbsp;dpo@wakanta.pl.",
              },
              {
                head: "Infrastruktura",
                body: "Docker Compose w&nbsp;dev, Caddy 2 z&nbsp;automatycznym HTTPS i&nbsp;zstd/gzip kompresją na&nbsp;produkcji. Backupy Postgres + WAL archiving. Audit logging dla&nbsp;każdej zmiany danych.",
              },
            ].map((t) => (
              <article
                key={t.head}
                className="rounded-xl border border-border bg-card p-5"
              >
                <h3 className="font-semibold mb-2 text-foreground">{t.head}</h3>
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: t.body }}
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          9. FAQ — mirrors FAQPage JSON-LD
          ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              Najczęstsze pytania
            </p>
            <h2 className="font-display text-3xl font-bold">
              Co warto wiedzieć przed&nbsp;rozpoczęciem
            </h2>
          </div>
          <dl className="space-y-3">
            {ABOUT_FAQ.map((qa) => (
              <details
                key={qa.question}
                className="group rounded-xl border border-border bg-card overflow-hidden open:bg-accent/20"
              >
                <summary className="flex justify-between items-center cursor-pointer list-none px-5 py-4 font-semibold text-foreground hover:bg-accent/30">
                  <dt className="pr-4">{qa.question}</dt>
                  <span
                    aria-hidden="true"
                    className="ml-3 text-primary group-open:rotate-45 transition-transform text-xl leading-none"
                  >
                    +
                  </span>
                </summary>
                <dd className="px-5 pb-5 pt-2 text-sm text-foreground/90 leading-relaxed border-t border-border/50">
                  {qa.answer}
                </dd>
              </details>
            ))}
          </dl>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          10. CONTACT
          ───────────────────────────────────────────────────────────── */}
      <section id="kontakt" className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <Mail className="w-4 h-4" aria-hidden="true" /> Kontakt
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Porozmawiajmy
            </h2>
            <p className="text-muted-foreground">
              W zależności od&nbsp;tego z&nbsp;czym piszesz &mdash; mamy dedykowane skrzynki.
              Wszystkie odpowiedzi w&nbsp;ciągu 2&nbsp;dni roboczych.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                head: "Współpraca / Sprzedaż",
                addr: "kontakt@wakanta.pl",
                sub: "Pytania o&nbsp;produkt, demo, faktury",
              },
              {
                head: "Wsparcie techniczne",
                addr: "support@wakanta.pl",
                sub: "Problemy z&nbsp;kontem, ofertami, integracjami",
              },
              {
                head: "Ochrona danych",
                addr: "dpo@wakanta.pl",
                sub: "Prawa kandydata, wycofanie zgody, RODO",
              },
              {
                head: "Bezpieczeństwo",
                addr: "security@wakanta.pl",
                sub: "Zgłaszanie luk / responsible disclosure",
              },
            ].map((c) => (
              <div
                key={c.head}
                className="rounded-xl border border-border bg-card p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {c.head}
                </p>
                <a
                  href={`mailto:${c.addr}`}
                  className="block font-semibold text-foreground hover:text-primary break-all"
                >
                  {c.addr}
                </a>
                <p
                  className="text-xs text-muted-foreground mt-2 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: c.sub }}
                />
              </div>
            ))}
          </div>

          {/* Press / Media kit */}
          <div className="mt-10 rounded-2xl border border-border bg-card p-7">
            <h3 className="font-display text-xl font-bold mb-2">Dla mediów</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              Logo, briefki, oficjalne biogramy zespołu i&nbsp;najnowsze
              statystyki rynkowe znajdziesz w&nbsp;naszym press kicie. Kontakt
              prasowy: <a className="text-primary hover:underline" href="mailto:press@wakanta.pl">press@wakanta.pl</a>.
            </p>
          </div>

          {/* Final CTA strip */}
          <div className="mt-10 rounded-2xl bg-primary/10 border border-primary/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <h3 className="font-display text-2xl font-bold mb-1">
                Wypróbuj wakanta.pl
              </h3>
              <p className="text-sm text-muted-foreground">
                Załóż darmowe konto firmy &mdash; pierwsze ogłoszenie publikujesz w&nbsp;5&nbsp;minut.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90"
              >
                Załóż konto firmy
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-accent/40"
              >
                Przeglądaj oferty
              </Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
