import type { Metadata } from "next";
import { AdminShell } from "@/pages-ui/admin/AdminShell";

// Admin panel must never end up in Google. noindex + nofollow at the
// layout level cascades to every /admin/* page (including login).
// robots.ts also disallows the path, but this header is what stops
// pages someone deep-links to from getting indexed.
export const metadata: Metadata = {
  title: "Panel administratora — wakanta.pl",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
