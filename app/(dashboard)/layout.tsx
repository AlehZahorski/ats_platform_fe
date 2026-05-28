import type { Metadata } from "next";
import { DashboardShell } from "@/shared/layout/DashboardShell";

// Recruiter dashboard is private — never indexable. Same pattern as
// the /admin layout: server-side metadata + client shell wrapper.
// robots.ts also disallows /dashboard, but the meta tag is what stops
// pages someone deep-links to from getting indexed.
export const metadata: Metadata = {
  title: "Panel rekrutera — wakanta.pl",
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
