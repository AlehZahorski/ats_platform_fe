import { Suspense } from "react";
import { PresentationGate } from "@/pages-ui/public/PresentationGate";

// Standalone route (outside the public site shell) so the deck renders
// full-screen with no portal nav/footer. Noindex — it's gated content.
export const metadata = {
  title: "Prezentacja dla partnerów",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PresentationGate />
    </Suspense>
  );
}
