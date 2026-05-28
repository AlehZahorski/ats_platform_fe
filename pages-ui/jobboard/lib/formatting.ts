/** Salary formatting helpers shared between the card and the detail panel. */

export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null,
  period: string | null,
): string | null {
  if (min === null && max === null) return null;
  const fmt = (n: number) => n.toLocaleString("pl-PL");
  const range =
    min !== null && max !== null
      ? `${fmt(min)} - ${fmt(max)}`
      : min !== null
        ? `od ${fmt(min)}`
        : `do ${fmt(max!)}`;
  const cur = currency ?? "PLN";
  const periodLabel =
    period === "hour" ? " / h" : period === "year" ? " / rok" : period === "month" ? " / mies" : "";
  return `${range} ${cur}${periodLabel}`;
}

export function timeAgoPl(iso: string): string {
  const ts = new Date(iso).getTime();
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "przed chwilą";
  if (minutes < 60) return `${minutes} min temu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h temu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} dn temu`;
  const months = Math.floor(days / 30);
  return `${months} mies temu`;
}

export function htmlToBullets(html: string | null | undefined): string[] {
  if (!html) return [];
  const matches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (!matches) return [];
  return matches
    .map((li) => li.replace(/<li[^>]*>|<\/li>/gi, "").replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);
}
