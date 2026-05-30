"use client";

// audit_frontend_code: root error boundary. Without this any runtime crash
// inside a server- or client-component lands the user on the default Next
// dev error overlay (or a blank white page in prod). The boundary catches
// the exception, shows a friendly message and gives the user a one-click
// way back into the app.

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log so it shows up in our root logger / future Sentry integration.
    // eslint-disable-next-line no-console
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Coś poszło nie tak
        </h1>
        <p className="text-sm text-muted-foreground">
          Wystąpił nieoczekiwany błąd aplikacji. Możesz spróbować odświeżyć
          ten ekran lub wrócić do strony głównej.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/70">
            Identyfikator błędu: <code>{error.digest}</code>
          </p>
        )}
        <div className="flex gap-2 justify-center pt-2">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Spróbuj ponownie
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Strona główna
          </Link>
        </div>
      </div>
    </div>
  );
}
