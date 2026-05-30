import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const SUPPORTED_LOCALES = ["en", "pl"];
// audit_seo F-05: matches `routing.ts` — Polish content + .pl domain.
const DEFAULT_LOCALE = "pl";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requested = cookieStore.get("locale")?.value ?? DEFAULT_LOCALE;

  // Validate — fall back to default if unsupported locale in cookie
  const locale = SUPPORTED_LOCALES.includes(requested)
    ? requested
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default,
  };
});
