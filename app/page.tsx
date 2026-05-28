import { redirect } from "next/navigation";

/**
 * wakanta.pl root → candidate-facing job board.
 *
 * The HR / recruiter side has its own entry point at /dashboard (after login).
 * In production this will likely move to a separate subdomain (hr.wakanta.pl),
 * but during dev they coexist behind path-based routing.
 */
export default function RootPage() {
  redirect("/jobs");
}
