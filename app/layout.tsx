import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Suspense } from "react";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Providers } from "@/shared/layout/Providers";
import { NavigationProgress } from "@/shared/layout/NavigationProgress";
import "@/styles/globals.css";

// audit_seo F-07: Next.js 14+ requires viewport / themeColor in a separate
// `export const viewport` object — putting them on `metadata` is silently
// ignored at build time. The values below match the app's actual theme
// (dark default, brand orange).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  // audit_seo: explicit metadataBase so OG / Twitter images use absolute URLs.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://wakanta.pl",
  ),
  title: {
    default: "wakanta.pl",
    template: "%s — wakanta.pl",
  },
  description:
    "wakanta.pl — system rekrutacji i zarządzania kandydatami dla firm w Polsce.",
  applicationName: "wakanta.pl",
  openGraph: {
    type: "website",
    siteName: "wakanta.pl",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("a11y");

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {/* A11Y-003 (audit_accessibility): "Skip to main content" — visually
            hidden until focused with Tab. Targets the #main-content id added
            in DashboardShell. WCAG 2.4.1 Bypass Blocks (Level A). */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg"
        >
          {t("skipToMain")}
        </a>
        {/* Global "I clicked, something is happening" indicator.
            Suspense-wrapped because it reads useSearchParams, which Next 15
            requires to be inside a boundary at the root level. */}
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
