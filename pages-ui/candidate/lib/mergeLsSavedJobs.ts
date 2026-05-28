/**
 * Merge anonymous (localStorage) saved-jobs into the candidate's DB account.
 *
 * Called once after a successful login/signup. Reads the LS list, pushes every
 * id to /candidates/me/saved-jobs/{id}, then clears LS so the union becomes
 * the canonical set from now on.
 *
 * Network errors are swallowed silently — if one job fails to migrate, we
 * still proceed (saved jobs are non-critical state).
 */
import { candidatesApi } from "@/services/api/jobBoard";

const LS_KEY = "wakanta_saved_jobs";

export async function mergeLsSavedJobs(): Promise<number> {
  if (typeof window === "undefined") return 0;
  let ids: string[] = [];
  try {
    ids = JSON.parse(window.localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return 0;
  }
  if (!Array.isArray(ids) || ids.length === 0) return 0;

  let migrated = 0;
  for (const id of ids) {
    try {
      await candidatesApi.saveJob(id);
      migrated++;
    } catch {
      // skip
    }
  }
  // Clear local copy — DB is now authoritative
  window.localStorage.removeItem(LS_KEY);
  return migrated;
}
