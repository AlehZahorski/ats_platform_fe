/**
 * Streaming Suspense fallback for the /firmy catalogue list.
 * Same role as `/firmy/[slug]/loading.tsx` — unfreezes the previous page
 * while Next is server-fetching the next route.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Ładowanie katalogu firm"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
    >
      <div className="h-10 w-60 rounded bg-muted animate-pulse" />
      <div className="h-12 rounded-xl border border-border bg-card animate-pulse" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-44 rounded-2xl border border-border bg-card animate-pulse" />
        ))}
      </div>

      <span className="sr-only">Wczytywanie katalogu firm…</span>
    </div>
  );
}
