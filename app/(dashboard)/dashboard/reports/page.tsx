"use client";
import dynamic from "next/dynamic";

// Code-split recharts (heavy charting lib) out of the dashboard's shared client
// bundle — it's downloaded only when the reports page is actually opened, and
// SSR is skipped because the charts are client-only anyway. (audit_performance)
const ReportsPage = dynamic(
  () => import("@/pages-ui/reports/ReportsPage").then((m) => ({ default: m.ReportsPage })),
  {
    ssr: false,
    loading: () => (
      <div className="p-12 text-center text-muted-foreground">Ładowanie raportów…</div>
    ),
  },
);

export default function Page() {
  return <ReportsPage />;
}
