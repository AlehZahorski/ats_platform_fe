"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCandidateMe,
  useSavedJobs,
  candidateKeys,
} from "@/services/queries/jobBoard.queries";
import { candidatesApi } from "@/services/api/jobBoard";

const LS_KEY = "wakanta_saved_jobs";

function readLs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLs(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

/**
 * Returns the set of saved job IDs and a toggle function.
 *
 * Anonymous visitors → localStorage. Logged-in candidates → DB.
 * The hook abstracts both behind the same interface so callers don't care
 * which one is active.
 */
export function useSavedJobsSet() {
  const qc = useQueryClient();
  const { data: candidate } = useCandidateMe();
  const { data: dbSavedJobs } = useSavedJobs();

  const isLoggedIn = !!candidate;

  const [lsIds, setLsIds] = useState<string[]>(() => readLs());

  // Hydrate from LS on mount (avoid SSR mismatch)
  useEffect(() => {
    setLsIds(readLs());
  }, []);

  const savedSet = useMemo(() => {
    if (isLoggedIn && dbSavedJobs) {
      return new Set(dbSavedJobs.map((s) => s.job_id));
    }
    return new Set(lsIds);
  }, [isLoggedIn, dbSavedJobs, lsIds]);

  const toggle = useCallback(
    async (jobId: string) => {
      const currentlySaved = savedSet.has(jobId);
      if (isLoggedIn) {
        if (currentlySaved) {
          await candidatesApi.unsaveJob(jobId);
        } else {
          await candidatesApi.saveJob(jobId);
        }
        qc.invalidateQueries({ queryKey: candidateKeys.savedJobs });
      } else {
        const next = currentlySaved ? lsIds.filter((x) => x !== jobId) : [...lsIds, jobId];
        setLsIds(next);
        writeLs(next);
      }
    },
    [isLoggedIn, lsIds, qc, savedSet],
  );

  return { savedSet, toggle, isLoggedIn };
}
