// Visual cue for required fields that are still empty: a gently-pulsing amber
// outline so the recruiter can immediately see what's left to fill in before
// the offer can be published. Append the result to a field's className.
//
// Kept in one place so the "what's missing" highlight stays consistent across
// every wizard step (and matches the publish checklist / backend validator).
export const PULSE_EMPTY_CLASS =
  "border-amber-500 ring-2 ring-amber-400/50 animate-pulse";

export function pulseIfEmpty(isEmpty: boolean): string {
  return isEmpty ? ` ${PULSE_EMPTY_CLASS}` : "";
}
