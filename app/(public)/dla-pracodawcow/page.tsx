import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

/**
 * `/dla-pracodawcow` is a marketing landing entry point from the candidate
 * site that funnels recruiters to the HR side. For now we redirect straight
 * to the recruiter login; later this can become a proper sales landing page.
 */
export default function Page() {
  redirect(ROUTES.login);
}
