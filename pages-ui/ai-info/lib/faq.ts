/**
 * AI-info FAQ. Single source of truth — rendered visibly on the page AND
 * emitted as FAQPage JSON-LD in page.tsx so the visible Q&A mirrors the
 * structured data (Google requires the two to match).
 */
export interface FaqItem {
  question: string;
  answer: string;
}

export const AI_INFO_FAQ: FaqItem[] = [
  {
    question: "Czy sztuczna inteligencja sama odrzuca moją aplikację?",
    answer:
      "Nie. AI nigdy nie podejmuje samodzielnie decyzji rekrutacyjnej. Generuje co najwyżej podpowiedź dla rekrutera, a ostateczną decyzję — zaproszenie lub odrzucenie — zawsze podejmuje człowiek. Zgodnie z art. 22 RODO masz prawo nie podlegać decyzji opartej wyłącznie na automatycznym przetwarzaniu.",
  },
  {
    question: "Czy mogę aplikować bez zgody na profilowanie AI?",
    answer:
      "Tak. Zgoda na profilowanie AI jest opcjonalna (opt-in). Jeśli jej nie wyrazisz, dopasowanie AI się nie uruchamia, a Twoja aplikacja trafia do rekrutera w klasyczny sposób — bez żadnej kary ani gorszego traktowania.",
  },
  {
    question: "Jakiego modelu AI używacie?",
    answer:
      "Korzystamy z modeli Claude firmy Anthropic. Przed wysłaniem czegokolwiek do modelu automatycznie redagujemy dane osobowe (PII), żeby analiza dotyczyła kompetencji, a nie tożsamości.",
  },
  {
    question: "Czy moje dane są używane do trenowania AI?",
    answer:
      "Nie. Twoich danych nie używamy do trenowania ani dostrajania modeli AI. Służą wyłącznie do obsługi Twojej konkretnej aplikacji.",
  },
  {
    question: "Jak AI dba o to, żeby nie dyskryminować?",
    answer:
      "Model jest instruowany, by ignorować cechy chronione (wiek, płeć, narodowość, status rodzinny i inne), a ocena opiera się wyłącznie na kompetencjach zestawionych z wymaganiami oferty. Rekruter widzi, że to sugestia AI, i może ją nadpisać — każda taka decyzja jest logowana.",
  },
  {
    question: "Jak skorzystać ze swoich praw?",
    answer:
      "Większość praw — wycofanie zgody na profilowanie, usunięcie danych — zrealizujesz w swoim koncie. W każdej innej sprawie (wyjaśnienie udziału AI, interwencja człowieka) napisz na dpo@wakanta.pl. Odpowiadamy w ciągu 2 dni roboczych.",
  },
];
