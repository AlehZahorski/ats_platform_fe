export const locales = ["en", "pl"] as const;
export type Locale = (typeof locales)[number];
// audit_seo F-05: the product is on `.pl`, the public content is Polish,
// schema.org `og:locale` is `pl_PL` everywhere — but the default used to be
// English, so an anonymous Googlebot request (no cookie) saw `<html lang="en">`
// on Polish content. Flipping the default to `pl` matches the actual UX.
export const defaultLocale: Locale = "pl";
