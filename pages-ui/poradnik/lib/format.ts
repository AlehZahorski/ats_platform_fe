/** Short PL date — "12 maja 2026" style. Falls back to "—" for nulls. */
export function formatDatePl(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric", month: "long", year: "numeric",
  }).format(d);
}

/** Compact read-time hint: "5 min" or null when unknown. */
export function readTimeLabel(minutes: number | null): string | null {
  return minutes ? `${minutes} min czytania` : null;
}

/** First-letter initials for the byline avatar — "Jan Kowalski" → "JK". */
export function authorInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("") || "?";
}
