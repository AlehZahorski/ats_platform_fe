/**
 * /ai-info — "Jak używamy sztucznej inteligencji" (AI transparency page).
 *
 * Server Component on purpose — pure indexable content, zero hydration cost.
 * Linked from every place where AI touches a candidate's data:
 *   - ApplyForm (consent line)
 *   - JobMatchSection (AI badge → "which model, what bias controls")
 *   - TrackPage (status explanation)
 *
 * Covers the obligations that make those links meaningful:
 *   - RODO art. 13/14 (information duty), art. 22 (automated decisions),
 *     art. 9 (special-category data), art. 17 (erasure)
 *   - EU AI Act transparency for recruitment systems (Annex III §4)
 * Mirrors the voice + layout of /o-nas so the public site stays consistent.
 */
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  UserCheck,
  EyeOff,
  Scale,
  FileText,
  Ban,
  Mail,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { AI_INFO_FAQ } from "./lib/faq";

const SECTIONS: { id: string; label: string }[] = [
  { id: "gdzie", label: "Gdzie używamy AI" },
  { id: "model", label: "Jaki model" },
  { id: "decyzje", label: "Decyzje i człowiek" },
  { id: "dane", label: "Twoje dane" },
  { id: "uczciwosc", label: "Uczciwość" },
  { id: "prawa", label: "Twoje prawa" },
  { id: "faq", label: "FAQ" },
  { id: "kontakt", label: "Kontakt" },
];

export function AiInfoPage() {
  return (
    <article className="bg-background text-foreground">
      {/* ── Breadcrumbs ─────────────────────────────────────────────── */}
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
              Sztuczna inteligencja
            </li>
          </ol>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            <Sparkles className="w-4 h-4" aria-hidden="true" /> Transparentność AI
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground max-w-3xl leading-tight">
            Jak wakanta.pl używa sztucznej inteligencji
          </h1>
          <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Używamy AI, żeby przyspieszyć rekrutację &mdash; nie&nbsp;żeby decydować
            za&nbsp;ludzi. Na&nbsp;tej stronie wyjaśniamy dokładnie, gdzie pojawia się
            sztuczna inteligencja, jakie dane przetwarza, kto podejmuje decyzję
            i&nbsp;jakie masz prawa. Bez&nbsp;ukrytych mechanizmów, bez&nbsp;czarnych skrzynek.
          </p>

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

      {/* ── 1. WHERE WE USE AI ──────────────────────────────────────── */}
      <section id="gdzie" className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <Sparkles className="w-4 h-4" aria-hidden="true" /> Gdzie używamy AI
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Trzy konkretne miejsca &mdash; i&nbsp;ani jedno więcej
            </h2>
            <p className="text-muted-foreground">
              AI w&nbsp;wakanta.pl jest narzędziem wspierającym. Działa tylko tam,
              gdzie realnie oszczędza czas, i&nbsp;nigdy nie&nbsp;uruchamia się bez&nbsp;Twojej wiedzy.
            </p>
          </div>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Odczytywanie CV",
                body: "AI wyłuskuje z&nbsp;Twojego CV ustrukturyzowane pola (stanowiska, umiejętności, doświadczenie), żeby rekruter nie&nbsp;musiał przepisywać ich ręcznie. To wygoda, nie&nbsp;ocena.",
              },
              {
                title: "Dopasowanie do oferty",
                body: "Na&nbsp;Twoją zgodę AI szacuje, jak bardzo Twój profil pasuje do&nbsp;wymagań oferty. Wynik jest podpowiedzią dla&nbsp;rekrutera &mdash; nie&nbsp;przepustką ani odrzuceniem.",
              },
              {
                title: "Pomoc w pisaniu ofert",
                body: "Po&nbsp;stronie pracodawcy AI proponuje treść ogłoszenia i&nbsp;wykrywa ryzykowne sformułowania. Dotyczy treści oferty, nie&nbsp;danych kandydatów.",
              },
            ].map((p) => (
              <li key={p.title} className="rounded-xl border border-border bg-card p-5">
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

      {/* ── 2. WHICH MODEL ──────────────────────────────────────────── */}
      <section id="model" className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" /> Jaki model
              </div>
              <h2 className="font-display text-3xl font-bold mb-3">
                Claude od&nbsp;Anthropic &mdash; z&nbsp;ochroną danych wbudowaną w&nbsp;proces
              </h2>
            </div>
            <div className="space-y-4 text-base text-foreground/90 leading-relaxed">
              <p>
                Korzystamy z&nbsp;modeli <strong>Claude</strong> firmy Anthropic.
                Przed&nbsp;wysłaniem czegokolwiek do&nbsp;modelu automatycznie{" "}
                <strong>redagujemy dane osobowe</strong> (PII) &mdash; tak, by analiza
                opierała się na&nbsp;kompetencjach, a&nbsp;nie na&nbsp;tożsamości.
              </p>
              <p>
                Twoich danych <strong>nie&nbsp;używamy do&nbsp;trenowania modeli</strong>.
                Jeśli nie&nbsp;wyrazisz zgody na&nbsp;profilowanie AI, dopasowanie po&nbsp;prostu
                się nie&nbsp;uruchamia &mdash; Twoja aplikacja trafia do&nbsp;rekrutera
                w&nbsp;klasyczny sposób, bez&nbsp;żadnej kary.
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 pt-2">
                {[
                  "Redakcja PII przed wysyłką do modelu",
                  "Brak treningu na Twoich danych",
                  "Profilowanie AI wyłącznie za zgodą (opt-in)",
                  "Pełne logowanie i audyt każdej analizy",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden="true" />
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. HUMAN IN THE LOOP ────────────────────────────────────── */}
      <section id="decyzje" className="border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
            <UserCheck className="w-4 h-4" aria-hidden="true" /> Decyzje i&nbsp;człowiek
          </div>
          <h2 className="font-display text-3xl font-bold mb-5">
            AI podpowiada. <em className="text-primary not-italic">Człowiek decyduje.</em>
          </h2>
          <p className="text-foreground/90 leading-relaxed text-lg">
            Żadna decyzja rekrutacyjna w&nbsp;wakanta.pl nie&nbsp;jest podejmowana
            wyłącznie automatycznie. Każda rekomendacja AI jest wyraźnie oznaczona
            jako <strong>sugestia</strong>, a&nbsp;ostateczną decyzję &mdash; zaproszenie,
            odrzucenie, dalsze etapy &mdash; zawsze podejmuje człowiek. Zgodnie
            z&nbsp;<strong>art.&nbsp;22 RODO</strong> masz prawo nie&nbsp;podlegać decyzji
            opartej wyłącznie na&nbsp;automatycznym przetwarzaniu.
          </p>
        </div>
      </section>

      {/* ── 4. YOUR DATA ────────────────────────────────────────────── */}
      <section id="dane" className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <EyeOff className="w-4 h-4" aria-hidden="true" /> Twoje dane
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Co dokładnie trafia do&nbsp;AI &mdash; a&nbsp;co nigdy
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
              <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                Może być przetwarzane (po anonimizacji)
              </h3>
              <ul className="space-y-2 text-sm text-foreground/90">
                {[
                  "Doświadczenie zawodowe i stanowiska",
                  "Umiejętności i technologie z CV",
                  "Wykształcenie i certyfikaty",
                  "Treść Twojej odpowiedzi w formularzu",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6">
              <h3 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-500" aria-hidden="true" />
                Nigdy nie używane do oceny
              </h3>
              <ul className="space-y-2 text-sm text-foreground/90">
                {[
                  "Wiek, płeć, narodowość, stan cywilny",
                  "Zdjęcie, dane kontaktowe, adres",
                  "Dane wrażliwe (art. 9 RODO)",
                  "Cokolwiek do trenowania modeli AI",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">•</span> {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FAIRNESS ─────────────────────────────────────────────── */}
      <section id="uczciwosc" className="border-t border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <Scale className="w-4 h-4" aria-hidden="true" /> Uczciwość
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Jak ograniczamy uprzedzenia algorytmu
            </h2>
            <p className="text-muted-foreground">
              Sama redakcja danych to&nbsp;za&nbsp;mało. Stosujemy dodatkowe warstwy,
              żeby AI oceniało kompetencje, a&nbsp;nie&nbsp;cechy chronione.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                head: "Blokada cech chronionych",
                body: "Model jest instruowany, by ignorować wiek, płeć, narodowość, status rodzinny i&nbsp;inne cechy chronione &mdash; mamy ich pełną, jawną listę w&nbsp;dokumentacji.",
              },
              {
                head: "Ocena tylko kompetencji",
                body: "Dopasowanie opiera się na&nbsp;wymaganiach oferty zestawionych z&nbsp;doświadczeniem i&nbsp;umiejętnościami &mdash; nie&nbsp;na&nbsp;tym, kim jesteś.",
              },
              {
                head: "Nadzór i możliwość nadpisania",
                body: "Rekruter widzi, że to&nbsp;sugestia AI, i&nbsp;może ją nadpisać jednym kliknięciem. Każda taka decyzja jest logowana.",
              },
            ].map((t) => (
              <article key={t.head} className="rounded-xl border border-border bg-card p-5">
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

      {/* ── 6. YOUR RIGHTS ──────────────────────────────────────────── */}
      <section id="prawa" className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <FileText className="w-4 h-4" aria-hidden="true" /> Twoje prawa
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Masz pełną kontrolę
            </h2>
            <p className="text-muted-foreground">
              Wynikają wprost z&nbsp;RODO i&nbsp;EU&nbsp;AI&nbsp;Act. Skorzystasz z&nbsp;nich
              w&nbsp;swoim koncie albo pisząc na&nbsp;<a className="text-primary hover:underline" href="mailto:dpo@wakanta.pl">dpo@wakanta.pl</a>.
            </p>
          </div>
          <dl className="grid md:grid-cols-2 gap-5">
            {[
              {
                term: "Prawo do wyjaśnienia",
                def: "Możesz poprosić o&nbsp;informację, czy i&nbsp;jak AI brało udział w&nbsp;ocenie Twojej aplikacji.",
              },
              {
                term: "Prawo do interwencji człowieka",
                def: "Możesz zażądać, by Twoją aplikację rozpatrzył człowiek &mdash; art.&nbsp;22 RODO.",
              },
              {
                term: "Prawo do wycofania zgody",
                def: "Zgodę na&nbsp;profilowanie AI wycofasz w&nbsp;jednym kliknięciu, w&nbsp;dowolnym momencie.",
              },
              {
                term: "Prawo do usunięcia danych",
                def: "Możesz usunąć swoje dane i&nbsp;konto &mdash; art.&nbsp;17 RODO &mdash; bez&nbsp;podawania przyczyny.",
              },
            ].map((v) => (
              <div key={v.term} className="rounded-xl border border-border bg-card p-5">
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

      {/* ── 7. FAQ ──────────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              Najczęstsze pytania
            </p>
            <h2 className="font-display text-3xl font-bold">
              Co kandydaci pytają o&nbsp;AI
            </h2>
          </div>
          <dl className="space-y-3">
            {AI_INFO_FAQ.map((qa) => (
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

      {/* ── 8. CONTACT ──────────────────────────────────────────────── */}
      <section id="kontakt" className="border-t border-border/50 bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mb-10">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-[0.15em] mb-3">
              <Mail className="w-4 h-4" aria-hidden="true" /> Kontakt
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Masz pytanie o&nbsp;swoje dane?
            </h2>
            <p className="text-muted-foreground">
              Nasz Inspektor Ochrony Danych odpowiada w&nbsp;ciągu 2&nbsp;dni roboczych.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-7 mb-10">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Ochrona danych / RODO
            </p>
            <a
              href="mailto:dpo@wakanta.pl"
              className="block font-semibold text-foreground hover:text-primary break-all"
            >
              dpo@wakanta.pl
            </a>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Prawa kandydata, wycofanie zgody, interwencja człowieka, usunięcie danych.
            </p>
          </div>

          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <h3 className="font-display text-2xl font-bold mb-1">
                Chcesz wiedzieć więcej o&nbsp;nas?
              </h3>
              <p className="text-sm text-muted-foreground">
                Poznaj naszą misję i&nbsp;podejście do&nbsp;etyki AI oraz prywatności.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/o-nas"
                className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90"
              >
                O nas <ArrowRight className="w-4 h-4" aria-hidden="true" />
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
