/**
 * Rules that map a category group (e.g. `tech`, `manufacturing`) to the
 * filters that make sense within it. Without this every visitor sees the
 * full superset — IT seniority ladder ("junior / senior / lead") sitting
 * next to corporate ("specialist / director") next to production
 * ("operator / foreman"), which is overwhelming and signals that the site
 * doesn't understand the candidate's intent.
 *
 * Design:
 *   - GROUP_TO_LADDERS: each group can pull from MULTIPLE ladders because
 *     real organisations mix scales (a hospital has doctors AND
 *     administrators AND cleaners). Union of selected categories drives
 *     the visible ladder set.
 *   - GROUP_TO_QUALS: each group narrows the universal qualification list
 *     to the ones recruiters actually request. Cross-group qualifications
 *     (e.g. `first_aid`, `bhp`) are duplicated across groups on purpose.
 *   - GROUP_HAS_SHIFTS: shift system is meaningless for office work; we
 *     only show it for groups that actually run 2/3-shift operations.
 *
 * When NO category is selected we hide seniority + shifts + qualifications
 * entirely and replace them with a one-line hint. Universal filters
 * (location, work mode, contract, salary, verified) always stay visible.
 */
import type { GroupCode } from "@/features/jobs/lib/category-groups";
import { CATEGORIES } from "@/features/jobs/lib/categories";

// ─────────────────────────────────────────────────────────────────────
// Seniority ladders — kept centrally so the URL `seniority=<value>` slugs
// match what the backend stores per job.
// ─────────────────────────────────────────────────────────────────────

export type SeniorityLadderKey =
  | "it"
  | "corporate"
  | "production"
  | "medical"
  | "academic"
  | "manual";

export interface SeniorityLadder {
  key: SeniorityLadderKey;
  label: string;
  values: string[];
}

export const SENIORITY_LADDERS: SeniorityLadder[] = [
  {
    key: "it",
    label: "IT / Tech",
    values: ["intern", "junior", "mid", "senior", "expert", "lead"],
  },
  {
    key: "corporate",
    label: "Korporacja / Biuro",
    values: ["specialist", "senior_specialist", "coordinator", "manager", "director", "executive"],
  },
  {
    key: "production",
    label: "Produkcja",
    values: ["operator", "team_leader", "foreman", "production_manager"],
  },
  {
    key: "medical",
    label: "Medycyna",
    values: ["resident", "attending", "consultant", "head_of_department"],
  },
  {
    key: "academic",
    label: "Edukacja akademicka",
    values: ["assistant", "lecturer", "professor"],
  },
  {
    key: "manual",
    label: "Praca fizyczna",
    values: ["helper", "worker"],
  },
];

// All seniority values across every ladder — used when scrubbing stale
// values that no longer match the selected categories.
export const ALL_SENIORITY_VALUES: Set<string> = new Set(
  SENIORITY_LADDERS.flatMap((l) => l.values),
);

// ─────────────────────────────────────────────────────────────────────
// Group → applicable ladders.
// A category group can map to several ladders because real industries
// mix scales — e.g. healthcare has both medical (resident / attending)
// and manual (sanitariusz) titles. A category selection is the union.
// ─────────────────────────────────────────────────────────────────────

export const GROUP_TO_LADDERS: Record<GroupCode, SeniorityLadderKey[]> = {
  tech:             ["it"],
  design:           ["it", "corporate"],
  marketing:        ["corporate"],
  sales:            ["corporate"],
  customer_service: ["corporate", "manual"],
  finance:          ["corporate"],
  hr:               ["corporate"],
  legal:            ["corporate"],
  operations:       ["corporate"],
  logistics:        ["manual", "corporate"],     // magazynier vs dyrektor logistyki
  manufacturing:    ["production", "manual"],
  construction:     ["manual", "production"],
  engineering:      ["it", "corporate", "production"],
  healthcare:       ["medical", "manual"],       // lekarz vs sanitariusz
  education:        ["academic", "corporate"],   // wykładowca vs dyrektor szkoły
  hospitality:      ["manual", "corporate"],     // kelner vs manager restauracji
  retail:           ["manual", "corporate"],     // kasjer vs kierownik sklepu
  beauty:           ["manual", "corporate"],
  cleaning:         ["manual"],
  security:         ["manual", "corporate"],
  media:            ["corporate", "it"],
  science:          ["academic", "it"],
  agriculture:      ["manual", "corporate"],
  automotive:       ["production", "manual", "corporate"],
  energy:           ["production", "corporate"],
  government:       ["corporate", "manual"],
};

// ─────────────────────────────────────────────────────────────────────
// Group → applicable qualifications.
// Cross-cutting certs (`bhp`, `first_aid`, `language_cert`) are listed
// per-group where they're actually relevant, so we don't show "AWS cert"
// to someone filtering for "gastronomia".
// ─────────────────────────────────────────────────────────────────────

export const GROUP_TO_QUALS: Record<GroupCode, string[]> = {
  tech:             ["aws_cert", "azure_cert", "gcp_cert", "scrum_cert", "pmp", "language_cert"],
  design:           ["language_cert", "scrum_cert"],
  marketing:        ["language_cert", "scrum_cert"],
  sales:            ["driving_b", "language_cert"],
  customer_service: ["language_cert"],
  finance:          ["language_cert", "pmp"],
  hr:               ["language_cert"],
  legal:            ["language_cert"],
  operations:       ["scrum_cert", "pmp", "language_cert", "bhp"],
  logistics:        ["forklift_udt", "driving_b", "driving_c", "driving_ce", "driving_d", "haccp", "bhp"],
  manufacturing:    ["forklift_udt", "sep_g1", "sep_g2", "sep_g3", "bhp", "first_aid", "haccp"],
  construction:     ["sep_g1", "sep_g2", "sep_g3", "construction_license", "bhp", "first_aid", "driving_b", "driving_c"],
  engineering:      ["sep_g1", "sep_g2", "sep_g3", "pmp", "language_cert", "bhp"],
  healthcare:       ["medical_license", "first_aid", "health_card", "language_cert"],
  education:        ["teaching_credential", "language_cert", "first_aid"],
  hospitality:      ["health_card", "haccp", "first_aid", "language_cert"],
  retail:           ["health_card", "haccp", "language_cert"],
  beauty:           ["health_card", "first_aid"],
  cleaning:         ["bhp", "health_card"],
  security:         ["security_license", "driving_b", "first_aid", "bhp"],
  media:            ["language_cert"],
  science:          ["language_cert", "first_aid"],
  agriculture:      ["driving_b", "driving_c", "bhp", "first_aid"],
  automotive:       ["driving_b", "driving_c", "sep_g1", "bhp"],
  energy:           ["sep_g1", "sep_g2", "sep_g3", "bhp", "first_aid"],
  government:       ["language_cert", "first_aid", "bhp"],
};

// ─────────────────────────────────────────────────────────────────────
// Group → does it use shift work?
// Office groups (tech / finance / hr / legal / …) get the shift section
// suppressed entirely — there's no such thing as "weekend shift" for a
// frontend developer role.
// ─────────────────────────────────────────────────────────────────────

export const GROUP_HAS_SHIFTS: Record<GroupCode, boolean> = {
  tech:             false,
  design:           false,
  marketing:        false,
  sales:            false,
  customer_service: true,
  finance:          false,
  hr:               false,
  legal:            false,
  operations:       false,
  logistics:        true,
  manufacturing:    true,
  construction:     true,
  engineering:      false,
  healthcare:       true,
  education:        false,
  hospitality:      true,
  retail:           true,
  beauty:           false,
  cleaning:         true,
  security:         true,
  media:            false,
  science:          false,
  agriculture:      false,
  automotive:       true,
  energy:           true,
  government:       false,
};

// ─────────────────────────────────────────────────────────────────────
// Helpers — derive what's visible from the current category selection.
// ─────────────────────────────────────────────────────────────────────

const CATEGORY_TO_GROUP: Map<string, GroupCode> = new Map(
  CATEGORIES.map((c) => [c.code, c.group as GroupCode]),
);

/** Distinct groups that the current category selection spans. */
export function groupsFromCategories(categoryCodes: readonly string[] | undefined): GroupCode[] {
  if (!categoryCodes || categoryCodes.length === 0) return [];
  const groups = new Set<GroupCode>();
  for (const code of categoryCodes) {
    const g = CATEGORY_TO_GROUP.get(code);
    if (g) groups.add(g);
  }
  return Array.from(groups);
}

/** Union of ladder keys applicable to the given groups. */
export function applicableLadderKeys(groups: readonly GroupCode[]): Set<SeniorityLadderKey> {
  const result = new Set<SeniorityLadderKey>();
  for (const g of groups) {
    for (const ladder of GROUP_TO_LADDERS[g] ?? []) result.add(ladder);
  }
  return result;
}

/** Union of qualification codes applicable to the given groups. */
export function applicableQualifications(groups: readonly GroupCode[]): Set<string> {
  const result = new Set<string>();
  for (const g of groups) {
    for (const q of GROUP_TO_QUALS[g] ?? []) result.add(q);
  }
  return result;
}

/** True when at least one selected group actually uses shift work. */
export function anyGroupHasShifts(groups: readonly GroupCode[]): boolean {
  return groups.some((g) => GROUP_HAS_SHIFTS[g]);
}
