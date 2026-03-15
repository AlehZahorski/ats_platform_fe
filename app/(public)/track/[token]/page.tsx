"use client";

import { use } from "react";
import { useTrackApplication } from "@/services/queries";
import { formatDate } from "@/lib/utils";
import { CheckCircle, Circle, Clock } from "lucide-react";

const STAGE_ORDER = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];

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

  const currentStageIndex = STAGE_ORDER.indexOf(app.stage?.name ?? "");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Application Status</h1>
          <p className="text-muted-foreground mt-2">Hi {app.first_name}, here&apos;s your application progress</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          {/* Current stage badge */}
          <div className="text-center mb-8">
            <span className="inline-block px-5 py-2 bg-primary/10 text-primary rounded-full font-semibold text-lg">
              {app.stage?.name ?? "Pending Review"}
            </span>
          </div>

          {/* Progress steps */}
          <div className="space-y-0">
            {STAGE_ORDER.filter(s => s !== "Rejected").map((stageName, i) => {
              const isCompleted = i < currentStageIndex;
              const isCurrent = stageName === app.stage?.name;
              const historyEntry = app.stage_history.find((h) => h.stage.name === stageName);

              return (
                <div key={stageName} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted || isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                       isCurrent ? <Clock className="w-4 h-4" /> :
                       <Circle className="w-4 h-4" />}
                    </div>
                    {i < STAGE_ORDER.filter(s => s !== "Rejected").length - 1 && (
                      <div className={`w-0.5 h-8 my-1 ${isCompleted ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`font-medium text-sm ${isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {stageName}
                    </p>
                    {historyEntry && (
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(historyEntry.changed_at)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">Applied on {formatDate(app.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
