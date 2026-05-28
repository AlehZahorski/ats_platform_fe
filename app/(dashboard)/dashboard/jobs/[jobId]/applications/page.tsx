import { use } from "react";
import { JobApplicationsPage } from "@/pages-ui/jobs/JobApplicationsPage";

export default function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  return <JobApplicationsPage jobId={jobId} />;
}
