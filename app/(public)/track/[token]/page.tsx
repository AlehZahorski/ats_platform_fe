"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, Circle, Clock, Briefcase, MapPin, Building2 } from "lucide-react";
import { useTrackApplication } from "@/services/queries";
import { formatDate } from "@/lib/utils";

const STAGE_ORDER = ["Applied", "Screening", "Interview", "Offer", "Hired"];

export default function TrackPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const t = useTranslations("track");
  const tStages = useTranslations("common.stageNames");
  const { data: application, isLoading, error } = useTrackApplication(token);

  const translateStageName = (stageName: string) => {
    const key = stageName.toLowerCase().replace(/\s+/g, "_");
    const knownKeys = ["applied", "screening", "interview", "offer", "hired", "rejected", "under_review"];
    return knownKeys.includes(key)
      ? tStages(key as "applied" | "screening" | "interview" | "offer" | "hired" | "rejected" | "under_review")
      : stageName;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">{t("notFound")}</h1>
          <p className="text-muted-foreground">{t("notFoundDesc")}</p>
        </div>
      </div>
    );
  }

  const isRejected = application.stage?.name === "Rejected";
  const isHired = application.stage?.name === "Hired";
  const currentStageIndex = STAGE_ORDER.indexOf(application.stage?.name ?? "");

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("subtitle", { name: application.first_name })}</p>
        </div>

        {application.job && (
          <div className="bg-card border border-border rounded-xl p-5 mb-5 animate-fade-in-delay-1">
            <h2 className="font-display text-lg font-bold text-foreground">{application.job.title}</h2>
            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
              {application.job.department && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5" /> {application.job.department}
                </span>
              )}
              {application.job.location && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" /> {application.job.location}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-8 shadow-lg animate-fade-in-delay-1">
          <div className="text-center mb-8">
            <span
              className={`inline-block px-6 py-2.5 rounded-full font-semibold text-lg ${
                isRejected
                  ? "bg-destructive/10 text-destructive"
                  : isHired
                    ? "bg-green-500/10 text-green-500"
                    : "bg-primary/10 text-primary"
              }`}
            >
              {application.stage?.name ? translateStageName(application.stage.name) : t("underReview")}
            </span>

            {isRejected && <p className="text-muted-foreground text-sm mt-3">{t("rejectedNote")}</p>}
            {isHired && <p className="text-green-500 text-sm font-medium mt-3">{t("congratulations")}</p>}
          </div>

          {!isRejected && (
            <div className="space-y-0 mb-6">
              {STAGE_ORDER.map((stageName, index) => {
                const isCompleted = index < currentStageIndex;
                const isCurrent = stageName === application.stage?.name;
                const isFuture = index > currentStageIndex;
                const historyEntry = application.stage_history.find((entry) => entry.stage.name === stageName);

                return (
                  <div key={stageName} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isCompleted
                            ? "bg-primary text-primary-foreground"
                            : isCurrent
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </div>
                      {index < STAGE_ORDER.length - 1 && (
                        <div className={`w-0.5 h-8 my-1 transition-all ${isCompleted ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>

                    <div className="pb-6 pt-1">
                      <p
                        className={`font-medium text-sm ${
                          isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {translateStageName(stageName)}
                        {isCurrent && (
                          <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {t("current")}
                          </span>
                        )}
                      </p>
                      {historyEntry && <p className="text-xs text-muted-foreground mt-0.5">{formatDate(historyEntry.changed_at)}</p>}
                      {isFuture && <p className="text-xs text-muted-foreground mt-0.5">{t("pending")}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isRejected && application.stage_history.length > 0 && (
            <div className="space-y-3 mb-6">
              {application.stage_history.map((entry, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{translateStageName(entry.stage.name)}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(entry.changed_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">{t("appliedOn", { date: formatDate(application.created_at) })}</p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">{t("bookmarkNote")}</p>
      </div>
    </div>
  );
}
