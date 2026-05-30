import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./shared/i18n/request.ts");

const backendInternalUrl =
  process.env.BACKEND_INTERNAL_URL || "http://localhost:8000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // audit_devops F-12: produce a self-contained server bundle in
  // `.next/standalone`. The production Dockerfile can copy that + `.next/static`
  // + `public/` instead of the entire `node_modules` tree, which historically
  // bloated the runtime image by ~400 MB. Standalone reads NEXT_PUBLIC_*
  // env vars at build time and supports `next start` from the bundle.
  output: "standalone",
  // audit_performance F-08: barrel imports of `lucide-react` and Radix
  // icons used to pull every icon in the package into the bundle even when
  // only a handful were referenced. Next's optimizePackageImports rewrites
  // the import at build time so only the used icons land in the chunk.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendInternalUrl}/api/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
