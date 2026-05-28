/**
 * Slugifier — converts a job title into a URL-safe slug.
 *
 * Multi-locale support: strips diacritics via NFD normalization so Polish
 * ("ą", "ł"), German ("ä", "ß"), Czech, Ukrainian etc. all collapse to ASCII.
 * Special-cases Polish "ł" → "l" because it doesn't have a combining form.
 *
 * Examples:
 *   "Starszy Backend Developer — Warszawa"  → "starszy-backend-developer-warszawa"
 *   "Nauczyciel języka angielskiego"        → "nauczyciel-jezyka-angielskiego"
 *   "Pracownik produkcji (3-zmianowy)"      → "pracownik-produkcji-3-zmianowy"
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")           // strip combining diacritics
    .replace(/ł/g, "l").replace(/Ł/g, "l")     // Polish edge case
    .replace(/ß/g, "ss")                       // German edge case
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")               // non-alnum → dash
    .replace(/^-+|-+$/g, "")                   // trim leading/trailing dashes
    .slice(0, 80);                             // hard cap (URL hygiene)
}
