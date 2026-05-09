import { use } from "react";
import { TrackPage } from "@/pages-ui/public/TrackPage";

export default function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  return <TrackPage token={token} />;
}
