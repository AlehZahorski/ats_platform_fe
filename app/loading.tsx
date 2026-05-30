// audit_frontend_code: root loading.tsx unlocks Next's streaming SSR.
// Without it Next has nothing to render while async server components
// resolve, so the user sees nothing for the full duration of the slowest
// data fetch on the route.

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-screen flex items-center justify-center bg-background"
    >
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <span className="sr-only">Ładowanie…</span>
    </div>
  );
}
