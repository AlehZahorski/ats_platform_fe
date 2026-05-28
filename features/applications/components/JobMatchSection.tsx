"use client";

import { useTranslations } from "next-intl";
import { useCvParseStatus, useJobMatches } from "@/services/queries";
import type { CandidateJobMatch, CandidateProfile } from "@/types";
import {
  CheckCircle, AlertCircle, XCircle, TrendingUp, Heart,
  LoaderCircle, Check, RefreshCcw, User,
} from "lucide-react";

// ─── Pipeline progress ────────────────────────────────────────────────────────

const STEP_KEYS = ["queued", "extracting", "parsing", "matching", "done"] as const;
type StepKey = (typeof STEP_KEYS)[number];

function resolveActiveStep(
  parseStatus: string | undefined,
  hasMatches: boolean,
): StepKey | "failed" {
  if (!parseStatus || parseStatus === "queued") return "queued";
  if (parseStatus === "extracting") return "extracting";
  if (parseStatus === "parsing" || parseStatus === "review_required") return "parsing";
  if (parseStatus === "failed") return "failed";
  return hasMatches ? "done" : "matching";
}

function PipelineProgress({ activeStep }: { activeStep: StepKey | "failed" }) {
  const t = useTranslations("cvParsing");
  const activeIndex = STEP_KEYS.findIndex((k) => k === activeStep);

  return (
    <div className="space-y-2">
      {STEP_KEYS.map((key, i) => {
        const done = activeIndex > i;
        const active = activeIndex === i;
        return (
          <div
            key={key}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
              done ? "bg-green-500/10 text-green-600" :
              active ? "bg-primary/10 text-primary" :
              "bg-muted/40 text-muted-foreground"
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center shrink-0">
              {done ? (
                <Check className="w-4 h-4" />
              ) : active ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-current opacity-40" />
              )}
            </span>
            <span className="font-medium">{i + 1}. {t(`steps.${key}` as never)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Score ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="var(--muted)" strokeWidth="6" />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
        />
        <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill="currentColor">
          {score}
        </text>
      </svg>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

// ─── Recommendation badge ─────────────────────────────────────────────────────

function RecommendationBadge({ recommendation }: { recommendation: CandidateJobMatch["recommendation"] }) {
  const t = useTranslations("cvParsing");
  if (!recommendation) return null;
  const config = {
    top_candidate: { icon: CheckCircle, className: "bg-green-500/10 text-green-600 border-green-500/20" },
    consider:      { icon: AlertCircle, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    not_a_match:   { icon: XCircle,     className: "bg-red-500/10 text-red-600 border-red-500/20" },
  };
  const { icon: Icon, className } = config[recommendation];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${className}`}>
      <Icon className="w-4 h-4" />
      {t(`matching.recommendation.${recommendation}` as never)}
    </span>
  );
}

// ─── Candidate portrait (cultural) ───────────────────────────────────────────

function CandidatePortrait({ profile }: { profile: CandidateProfile }) {
  const t = useTranslations("cvParsing");
  const hasContent =
    profile.executive_summary ||
    (profile.hobbies && profile.hobbies.length > 0) ||
    profile.culture_fit_notes ||
    profile.personality_signals;

  if (!hasContent) return null;

  return (
    <div className="rounded-xl border border-primary/10 bg-primary/5 p-5 space-y-4">
      <p className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1.5">
        <User className="w-3.5 h-3.5" />
        {t("matching.candidate")}
      </p>

      {profile.executive_summary && (
        <p className="text-sm text-foreground leading-relaxed">{profile.executive_summary}</p>
      )}

      {profile.hobbies && profile.hobbies.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{t("matching.hobbies")}</p>
          <div className="flex flex-wrap gap-1">
            {profile.hobbies.map((h, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20">{h}</span>
            ))}
          </div>
        </div>
      )}

      {profile.personality_signals && (
        <div className="grid gap-2 sm:grid-cols-2 text-xs">
          {profile.personality_signals.communication_style && (
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <span className="text-muted-foreground">{t("matching.commStyle")} </span>
              <span className="text-foreground font-medium">{profile.personality_signals.communication_style}</span>
            </div>
          )}
          {profile.personality_signals.leadership_indicators && (
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <span className="text-muted-foreground">{t("matching.leadership")} </span>
              <span className="text-foreground font-medium">{profile.personality_signals.leadership_indicators}</span>
            </div>
          )}
          {profile.personality_signals.growth_mindset && (
            <div className="rounded-lg bg-muted/40 px-3 py-2 sm:col-span-2">
              <span className="text-muted-foreground">{t("matching.growthMindset")} </span>
              <span className="text-foreground font-medium">{profile.personality_signals.growth_mindset}</span>
            </div>
          )}
        </div>
      )}

      {profile.culture_fit_notes && (
        <div className="rounded-lg bg-muted/30 px-3 py-2">
          <p className="text-xs text-muted-foreground mb-0.5 font-semibold">{t("matching.cultureFit")}</p>
          <p className="text-xs text-foreground leading-relaxed">{profile.culture_fit_notes}</p>
        </div>
      )}
    </div>
  );
}

// ─── Match card ───────────────────────────────────────────────────────────────

function MatchCard({ match, profile }: { match: CandidateJobMatch; profile: CandidateProfile | null }) {
  const t = useTranslations("cvParsing");
  const techColor = match.match_score !== null
    ? match.match_score >= 75 ? "#22c55e" : match.match_score >= 50 ? "#f59e0b" : "#ef4444"
    : "#94a3b8";
  const fitColor = match.fit_score !== null
    ? match.fit_score >= 75 ? "#22c55e" : match.fit_score >= 50 ? "#f59e0b" : "#ef4444"
    : "#94a3b8";

  return (
    <div className="space-y-4">
      {profile && <CandidatePortrait profile={profile} />}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-5">
          {match.match_score !== null && (
            <ScoreRing score={match.match_score} label={t("matching.technical")} color={techColor} />
          )}
          {match.fit_score !== null && (
            <ScoreRing score={match.fit_score} label={t("matching.cultural")} color={fitColor} />
          )}
        </div>
        <RecommendationBadge recommendation={match.recommendation} />
      </div>

      {match.reasoning && (
        <p className="text-sm text-muted-foreground leading-relaxed">{match.reasoning}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {match.strengths_match && match.strengths_match.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
              <TrendingUp className="w-3.5 h-3.5" />
              {t("matching.strengths")}
            </div>
            <ul className="space-y-1">
              {match.strengths_match.map((s, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {match.gaps && match.gaps.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
              {t("matching.gaps")}
            </div>
            <ul className="space-y-1">
              {match.gaps.map((g, i) => (
                <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface JobMatchSectionProps {
  applicationId: string;
  candidateProfile: CandidateProfile | null | undefined;
}

export function JobMatchSection({ applicationId, candidateProfile }: JobMatchSectionProps) {
  const t = useTranslations("cvParsing");
  const cvParse = useCvParseStatus(applicationId, true);
  const parseStatus = cvParse.data?.status ?? (candidateProfile ? "completed" : undefined);
  const parseCompleted = parseStatus === "completed";

  const { data: matches } = useJobMatches(applicationId, parseCompleted);

  const hasMatches = Boolean(matches && matches.length > 0);
  const activeStep = resolveActiveStep(parseStatus, hasMatches);

  if (!parseStatus && !candidateProfile) return null;

  const isProcessing = activeStep !== "done" && activeStep !== "failed";

  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-2">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Heart className="w-4 h-4 text-primary" />
          {t("matching.title")}
        </h3>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 shrink-0">
          <span>✦</span>
          Powered by AI
        </span>
      </div>

      {activeStep === "failed" ? (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3">
          <RefreshCcw className="w-4 h-4 shrink-0" />
          <span>{t("matching.failed")}</span>
        </div>
      ) : isProcessing ? (
        <PipelineProgress activeStep={activeStep} />
      ) : (
        <div className="space-y-3">
          {matches!.map((match) => (
            <MatchCard key={match.id} match={match} profile={candidateProfile ?? null} />
          ))}
        </div>
      )}
    </div>
  );
}
