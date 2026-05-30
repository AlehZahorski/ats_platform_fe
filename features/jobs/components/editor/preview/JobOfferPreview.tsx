"use client";

/**
 * Editor-side preview of a job offer — renders identically to what the
 * candidate will see on /apply/{jobId}.
 *
 * Implementation note: there used to be a parallel renderer in this file
 * that diverged from `ApplyPage`. Now both views are powered by the shared
 * `CandidateJobOfferView` component, so any styling tweak the team makes
 * for the candidate side automatically lands in the editor preview without
 * extra work — and the recruiter never sees a layout the candidate
 * actually won't get.
 */
import type { JobEditorState } from "../../../types/job-editor.types";
import { CandidateJobOfferView } from "@/pages-ui/public/CandidateJobOfferView";

interface JobOfferPreviewProps {
  state: JobEditorState;
}

export function JobOfferPreview({ state }: JobOfferPreviewProps) {
  return <CandidateJobOfferView job={mapEditorStateToViewModel(state)} showHero />;
}

/**
 * Adapt the editor's wide draft state to the narrow view-model the shared
 * renderer expects. Editor fields use `undefined` for empty; the candidate
 * renderer treats `null` and `undefined` interchangeably, so we coerce
 * once here to keep `CandidateJobViewModel` strict.
 */
function mapEditorStateToViewModel(state: JobEditorState) {
  const orNull = <T,>(v: T | undefined | null): T | null =>
    v === undefined || v === "" ? null : v;

  return {
    title: state.title || "—",
    department: orNull(state.department),
    location: orNull(state.location),
    work_mode: orNull(state.work_mode),
    remote_constraints: orNull(state.remote_constraints),
    contract_type: orNull(state.contract_type),
    seniority: orNull(state.seniority),
    experience_min_years: orNull(state.experience_min_years),
    experience_max_years: orNull(state.experience_max_years),
    salary_min: orNull(state.salary_min),
    salary_max: orNull(state.salary_max),
    salary_currency: orNull(state.salary_currency),
    salary_period: orNull(state.salary_period),
    role_summary: orNull(state.role_summary),
    responsibilities: orNull(state.responsibilities),
    must_haves: orNull(state.must_haves),
    nice_to_haves: orNull(state.nice_to_haves),
    tech_stack: orNull(state.tech_stack),
    benefits: orNull(state.benefits),
    hiring_process: orNull(state.hiring_process),
    value_proposition: orNull(state.value_proposition),
    domain_context: orNull(state.domain_context),
    team_context: orNull(state.team_context),
    success_profile: orNull(state.success_profile),
  };
}
