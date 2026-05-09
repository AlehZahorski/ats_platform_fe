import { use } from "react";
import { JobEditPage } from "@/pages-ui/jobs/JobEditPage";

export default function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  return <JobEditPage jobId={jobId} />;
}
