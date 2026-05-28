"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { ROUTES } from "@/config/routes";
import { useCreateJob, useJob, useUpdateJob } from "@/services/queries";
import type { Job } from "@/types";

import { useJobAutosave } from "./useJobAutosave";
import type { EditorMode, JobEditorState } from "../types/job-editor.types";
import { emptyState, jobToState, stateToPayload } from "../utils/job-editor.utils";

interface UseJobEditorParams {
  mode: EditorMode;
  jobId?: string;
}

export interface JobEditorReturn {
  job: Job | null;
  state: JobEditorState;
  patch: (changes: Partial<JobEditorState>) => void;
  isLoading: boolean;
  jobId: string | null;
  lastSavedAt: Date | null;
  isSaving: boolean;
  hasChanges: boolean;
  saveDraft: () => Promise<void>;
  publish: () => Promise<void>;
}

/**
 * Editor state machine. Works in two modes:
 *
 *   create — `jobId` starts null. First successful autosave/manual save
 *            creates a draft job (POST) and redirects to /jobs/{id}.
 *   edit   — loads job by id, hydrates form state.
 *
 * Autosave is wired with a 10s debounce. It is gated by `hasChanges`,
 * so a freshly-loaded job won't immediately fire a PATCH.
 */
export function useJobEditor({ mode, jobId: initialJobId }: UseJobEditorParams): JobEditorReturn {
  const router = useRouter();
  const t = useTranslations("jobs");

  const { data: loadedJob, isLoading } = useJob(initialJobId ?? "");
  const createMutation = useCreateJob();
  const updateMutation = useUpdateJob();

  const [state, setState] = useState<JobEditorState>(emptyState);
  const [jobId, setJobId] = useState<string | null>(initialJobId ?? null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);
  const [hydrated, setHydrated] = useState(mode === "create");
  // Guard so we only push the URL update once after the first POST in create mode.
  const urlSyncedRef = useRef(false);

  // Hydrate state from loaded job (edit mode only). Runs once on first load.
  useEffect(() => {
    if (loadedJob && !hydrated) {
      setState(jobToState(loadedJob));
      setLastSavedAt(loadedJob.updated_at ? new Date(loadedJob.updated_at) : null);
      setHydrated(true);
    }
  }, [loadedJob, hydrated]);

  const patch = useCallback((changes: Partial<JobEditorState>) => {
    setState((s) => ({ ...s, ...changes }));
    setDirty(true);
  }, []);

  const persist = useCallback(
    async (override?: Partial<JobEditorState>): Promise<Job | null> => {
      const next = override ? { ...state, ...override } : state;
      // Create requires at least a title.
      if (!jobId && !next.title.trim()) return null;

      try {
        if (!jobId) {
          const created = await createMutation.mutateAsync(stateToPayload(next));
          setJobId(created.id);
          setLastSavedAt(new Date());
          setDirty(false);
          // ─── Critical UX fix ─────────────────────────────────────────
          // In create mode the first POST returns a new job id. We used to
          // call router.replace() here, which causes Next.js to re-render
          // the route segment — the page remounts and any focused input
          // loses focus mid-typing once autosave fires.
          //
          // Instead we update the URL via window.history.replaceState so
          // the address bar reflects /jobs/{id} (useful for refresh and
          // for "copy link"), but the React tree stays mounted. Inputs
          // keep their focus, autosave is invisible to the user.
          if (mode === "create" && !urlSyncedRef.current && typeof window !== "undefined") {
            window.history.replaceState(null, "", ROUTES.job(created.id));
            urlSyncedRef.current = true;
          }
          return created;
        } else {
          const updated = await updateMutation.mutateAsync({
            id: jobId,
            data: stateToPayload(next),
          });
          setLastSavedAt(new Date());
          setDirty(false);
          return updated;
        }
      } catch {
        toast.error(t("wizard.saveError"));
        return null;
      }
    },
    [state, jobId, mode, router, t, createMutation, updateMutation],
  );

  // Autosave — debounced, only when dirty and not currently saving.
  useJobAutosave({
    value: state,
    enabled: hydrated && dirty && !createMutation.isPending && !updateMutation.isPending,
    onSave: async () => {
      await persist();
    },
  });

  const saveDraft = useCallback(async () => {
    await persist();
  }, [persist]);

  const publish = useCallback(async () => {
    const result = await persist({ status: "open" });
    if (result) {
      toast.success(t("wizard.published"));
      router.push(ROUTES.jobs);
    } else if (!result && jobId) {
      // persist returned null for a reason other than missing title
      toast.error(t("wizard.publishFailed"));
    }
  }, [persist, jobId, router, t]);

  return {
    job: loadedJob ?? null,
    state,
    patch,
    isLoading: mode === "edit" && isLoading && !hydrated,
    jobId,
    lastSavedAt,
    isSaving: createMutation.isPending || updateMutation.isPending,
    hasChanges: dirty,
    saveDraft,
    publish,
  };
}
