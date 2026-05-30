/**
 * Streaming Suspense fallback for /firmy/[slug].
 *
 * Without this file Next can't show any UI while the server fetches company
 * data — the previous page stays frozen for the whole RSC round-trip
 * (typically 300-800 ms on cold cache). With it, users see this skeleton in
 * < 50 ms after clicking the link, then the real content streams in.
 *
 * Layout mirrors `CompanyProfilePage` (hero → KPI strip → jobs → optional
 * sections) so the visual shift on swap is minimal — no jarring layout
 * jumps, just content materialising into the placeholders.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Ładowanie profilu firmy"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6"
    >
      {/* Back link */}
      <div className="h-6 w-32 rounded bg-muted animate-pulse" />

      {/* Hero (logo + banner area) */}
      <div className="h-56 rounded-2xl border border-border bg-card animate-pulse" />

      {/* KPI strip — 4 small cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>

      {/* Jobs section header + 3 job cards */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-muted animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg border border-border animate-pulse" />
        ))}
      </div>

      {/* Optional sections */}
      <div className="h-32 rounded-2xl border border-border bg-card animate-pulse" />
      <div className="h-48 rounded-2xl border border-border bg-card animate-pulse" />

      <span className="sr-only">Wczytywanie strony firmy…</span>
    </div>
  );
}
