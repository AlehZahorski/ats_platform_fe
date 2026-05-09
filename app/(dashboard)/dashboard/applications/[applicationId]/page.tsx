import { use } from "react";
import { ApplicationDetailPage } from "@/pages-ui/applications/ApplicationDetailPage";

export default function Page({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = use(params);
  return <ApplicationDetailPage applicationId={applicationId} />;
}
