// audit_frontend_code: explicit 404 page. Without this `notFound()` calls
// from server components fall back to Next's default tiny "404 Not Found"
// page — bad UX and a SEO miss.

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          404
        </p>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Nie znaleźliśmy tej strony
        </h1>
        <p className="text-sm text-muted-foreground">
          Adres mógł zostać zmieniony lub strona nie istnieje. Możesz wrócić
          na stronę główną i spróbować ponownie.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Strona główna
        </Link>
      </div>
    </div>
  );
}
