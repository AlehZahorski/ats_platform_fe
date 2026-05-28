import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Providers } from "@/shared/layout/Providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "wakanta.pl",
  description: "wakanta.pl — System Zarządzania Rekrutacją",
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
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
