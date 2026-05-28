"use client";

import { useEffect, useRef } from "react";

interface UseJobAutosaveOptions {
  /** The value to watch — typically the form state object. */
  value: unknown;
  /** Skip autosave when false (e.g. while loading, while saving). */
  enabled: boolean;
  /** Save callback. Latest closure is always called via ref. */
  onSave: () => void | Promise<void>;
  /** Debounce delay in ms. Default 10000. */
  delay?: number;
}

/**
 * Fires `onSave` after `delay` ms of no changes to `value`.
 *
 * Implementation notes:
 * - Each change to `value` resets the timer.
 * - `onSave` is held in a ref so we don't restart the timer when only the
 *   callback identity changes (which would happen on every parent render).
 */
export function useJobAutosave({
  value,
  enabled,
  onSave,
  delay = 10000,
}: UseJobAutosaveOptions): void {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      void onSaveRef.current();
    }, delay);
    return () => clearTimeout(timer);
  }, [value, enabled, delay]);
}
