"use client";

import { use } from "react";
import { useTrackApplication } from "@/services/queries";
import { formatDate } from "@/lib/utils";
import { CheckCircle, Circle, Clock, Briefcase, MapPin, Building2 } from "lucide-react";

const STAGE_ORDER = ["Applied", "Screening", "Interview", "Offer", "Hired"];

export default function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { data: app, isLoading, error } = useTrackApplication(token);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Application Not Found</h1>
          <p className="text-muted-foreground">This tracking link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const isRejected = app.stage?.name === "Rejected";
  const isHired = app.stage?.name === "Hired";
  const currentStageIndex = STAGE_ORDER.indexOf(app.stage?.name ?? "");

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Application Status</h1>
          <p className="text-muted-foreground mt-2">
            Hi <strong className="text-foreground">{app.first_name}</strong>, here&apos;s your application progress
          </p>
        </div>

        {/* Job info card */}
        {app.job && (
          <div className="bg-card border border-border rounded-xl p-5 mb-5 animate-fade-in-delay-1">
            <h2 className="font-display text-lg font-bold text-foreground">{app.job.title}</h2>
            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
              {app.job.department && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5" /> {app.job.department}
                </span>
              )}
              {app.job.location && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" /> {app.job.location}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Status card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg animate-fade-in-delay-1">

          {/* Current stage badge */}
          <div className="text-center mb-8">
            <span className={`inline-block px-6 py-2.5 rounded-full font-semibold text-lg ${
              isRejected
                ? "bg-destructive/10 text-destructive"
                : isHired
                ? "bg-green-500/10 text-green-500"
                : "bg-primary/10 text-primary"
            }`}>
              {app.stage?.name ?? "Under Review"}
            </span>

            {isRejected && (
              <p className="text-muted-foreground text-sm mt-3">
                Thank you for your interest. We&apos;ll keep your profile for future opportunities.
              </p>
            )}
            {isHired && (
              <p className="text-green-500 text-sm font-medium mt-3">
                🎉 Congratulations! Welcome to the team.
              </p>
            )}
          </div>

          {/* Progress steps */}
          {!isRejected && (
            <div className="space-y-0 mb-6">
              {STAGE_ORDER.map((stageName, i) => {
                const isCompleted = i < currentStageIndex;
                const isCurrent = stageName === app.stage?.name;
                const isFuture = i > currentStageIndex;
                const historyEntry = app.stage_history.find((h) => h.stage.name === stageName);

                return (
                  <div key={stageName} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {isCompleted
                          ? <CheckCircle className="w-4 h-4" />
                          : isCurrent
                          ? <Clock className="w-4 h-4" />
                          : <Circle className="w-4 h-4" />}
                      </div>
                      {i < STAGE_ORDER.length - 1 && (
                        <div className={`w-0.5 h-8 my-1 transition-all ${
                          isCompleted ? "bg-primary" : "bg-border"
                        }`} />
                      )}
                    </div>
                    <div className="pb-6 pt-1">
                      <p className={`font-medium text-sm ${
                        isCurrent
                          ? "text-primary"
                          : isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}>
                        {stageName}
                        {isCurrent && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </p>
                      {historyEntry && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(historyEntry.changed_at)}
                        </p>
                      )}
                      {isFuture && (
                        <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rejected timeline */}
          {isRejected && app.stage_history.length > 0 && (
            <div className="space-y-3 mb-6">
              {app.stage_history.map((h, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{h.stage.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(h.changed_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Applied on {formatDate(app.created_at)}
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Bookmark this page to check your application status anytime.
        </p>
      </div>
    </div>
  );
}