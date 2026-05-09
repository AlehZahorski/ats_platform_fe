import { use } from "react";
import { ApplyPage } from "@/pages-ui/public/ApplyPage";

export default function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  return <ApplyPage jobId={jobId} />;
}
