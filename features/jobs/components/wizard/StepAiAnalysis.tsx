"use client";

import { useState } from "react";
import { Sparkles, TrendingUp, AlertCircle, Briefcase, Zap, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { useAnalyzeJob } from "@/services/queries";
import type { JobOfferAnalysis } from "@/types";

interface StepAiAnalysisProps {
  jobId: string;
  onPublish: () => void;
  onBack: () => void;
  isPublishing: boolean;
}

const MARKET_POSITION_CONFIG = {
  above_market: { label: "Powyżej rynku",   className: "bg-green-500/10 text-green-600 border-green-500/20" },
  at_market:    { label: "Na poziomie rynku", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  below_market: { label: "Poniżej rynku",   className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

function AttractivenessRing({ score }: { score: number }) {
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : score >= 40 ? "#f97316" : "#ef4444";
  const label = score >= 80 ? "Bardzo atrakcyjna" : score >= 60 ? "Dobra" : score >= 40 ? "Przeciętna" : "Słaba";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <circle
          cx="64" cy="64" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 64 64)"
        />
        <text x="64" y="60" textAnchor="middle" fontSize="28" fontWeight="800" fill="currentColor">{score}</text>
        <text x="64" y="78" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">/100</text>
      </svg>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

function AnalysisResult({ analysis, onPublish, onBack, isPublishing }: {
  analysis: JobOfferAnalysis;
  onPublish: () => void;
  onBack: () => void;
  isPublishing: boolean;
}) {
  const position = MARKET_POSITION_CONFIG[analysis.market_position] ?? MARKET_POSITION_CONFIG.at_market;

  return (
    <div className="space-y-6">
      {/* Header scores */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-muted/30 rounded-xl">
        <AttractivenessRing score={analysis.attractiveness_score} />
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${position.className}`}>
            {position.label}
          </span>
          <p className="text-sm text-foreground leading-relaxed">{analysis.summary}</p>
        </div>
      </div>

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Co przyciągnie kandydatów
          </p>
          <ul className="space-y-1.5">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {analysis.improvements.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            Co warto poprawić
          </p>
          <ul className="space-y-1.5">
            {analysis.improvements.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Motivational block */}
      <div className="rounded-xl bg-muted/40 border border-border p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Briefcase className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Dlaczego to ważne</p>
            <p className="text-sm text-foreground leading-relaxed">{analysis.candidate_impact}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground leading-relaxed italic">{analysis.urgency_message}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Wróć i popraw
        </Button>
        <Button onClick={onPublish} disabled={isPublishing} className="flex-1">
          {isPublishing ? "Publikowanie..." : "Opublikuj ofertę"}
        </Button>
      </div>
    </div>
  );
}

export function StepAiAnalysis({ jobId, onPublish, onBack, isPublishing }: StepAiAnalysisProps) {
  const [analysis, setAnalysis] = useState<JobOfferAnalysis | null>(null);
  const analyzeJob = useAnalyzeJob();

  const handleAnalyze = async () => {
    try {
      const result = await analyzeJob.mutateAsync(jobId);
      setAnalysis(result);
    } catch {
      toast.error("Analiza nie powiodła się. Spróbuj ponownie.");
    }
  };

  if (analysis) {
    return (
      <AnalysisResult
        analysis={analysis}
        onPublish={onPublish}
        onBack={onBack}
        isPublishing={isPublishing}
      />
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="font-display text-lg font-bold text-foreground">Sprawdź atrakcyjność swojej oferty</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Claude przeanalizuje Twoją ofertę i powie Ci, jak wygląda oczami kandydata — co przyciąga, co odstrasza
          i jak wypadasz na tle rynku.
        </p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        <Button onClick={handleAnalyze} disabled={analyzeJob.isPending} className="gap-2 w-full">
          {analyzeJob.isPending ? (
            <>
              <LoaderCircle className="w-4 h-4 animate-spin" />
              Analizuję ofertę...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analizuj z AI
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onPublish} disabled={isPublishing} className="w-full">
          {isPublishing ? "Publikowanie..." : "Pomiń i opublikuj"}
        </Button>
      </div>
    </div>
  );
}
