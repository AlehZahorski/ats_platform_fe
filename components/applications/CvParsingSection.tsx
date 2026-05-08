"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FileSearch, LoaderCircle, RefreshCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useConfirmCvParse, useCvParseStatus, useRetryCvParse } from "@/services/queries";
import type { Application, ParsedEducation, ParsedExperience, ParsedSkill } from "@/types";

function getApiErrorMessage(error: unknown): string | null {
  const detail = (
    error as { response?: { data?: { detail?: string } } }
  )?.response?.data?.detail;
  return typeof detail === "string" ? detail : null;
}

const STATUS_STEPS = ["queued", "extracting", "parsing", "review_required", "completed"] as const;

export function CvParsingSection({ application }: { application: Application }) {
  const t = useTranslations("cvParsing");
  const tc = useTranslations("common");
  const cvParse = useCvParseStatus(application.id, Boolean(application.cv_url));
  const retryParse = useRetryCvParse(application.id);
  const confirmParse = useConfirmCvParse(application.id);

  const latestJob = cvParse.data ?? application.latest_cv_parse_job;
  const normalized = latestJob?.normalized_result;

  const [firstName, setFirstName] = useState(application.first_name);
  const [lastName, setLastName] = useState(application.last_name);
  const [email, setEmail] = useState(application.email);
  const [phone, setPhone] = useState(application.phone ?? "");
  const [headline, setHeadline] = useState(application.candidate_profile?.headline ?? "");
  const [summary, setSummary] = useState(application.candidate_profile?.summary ?? "");
  const [skillsText, setSkillsText] = useState("");
  const [experienceText, setExperienceText] = useState("");
  const [educationText, setEducationText] = useState("");

  useEffect(() => {
    if (!normalized) return;
    setFirstName(normalized.first_name || application.first_name);
    setLastName(normalized.last_name || application.last_name);
    setEmail(normalized.email || application.email);
    setPhone(normalized.phone || application.phone || "");
    setHeadline(normalized.headline || application.candidate_profile?.headline || "");
    setSummary(normalized.summary || application.candidate_profile?.summary || "");
    setSkillsText((normalized.skills ?? application.candidate_profile?.skills ?? []).map((item) => item.name).join("\n"));
    setExperienceText(
      (normalized.experience ?? application.candidate_profile?.experience ?? [])
        .map((item) => [item.title, item.company, item.date_range, item.description].filter(Boolean).join(" | "))
        .join("\n")
    );
    setEducationText(
      (normalized.education ?? application.candidate_profile?.education ?? [])
        .map((item) => [item.school, item.degree, item.date_range, item.description].filter(Boolean).join(" | "))
        .join("\n")
    );
  }, [application.candidate_profile?.education, application.candidate_profile?.experience, application.candidate_profile?.headline, application.candidate_profile?.skills, application.candidate_profile?.summary, application.email, application.first_name, application.last_name, application.phone, normalized]);

  const status = latestJob?.status ?? (application.cv_url ? "queued" : null);
  const activeStepIndex = status ? STATUS_STEPS.indexOf(status as (typeof STATUS_STEPS)[number]) : -1;
  const canReview = status === "review_required" || status === "completed";

  const parsedProfile = useMemo(() => {
    const skills: ParsedSkill[] = skillsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    const experience: ParsedExperience[] = experienceText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((line) => {
        const [title, company, date_range, ...rest] = line.split("|").map((part) => part.trim());
        return {
          title: title || null,
          company: company || null,
          date_range: date_range || null,
          description: rest.join(" | ") || null,
        };
      });

    const education: ParsedEducation[] = educationText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((line) => {
        const [school, degree, date_range, ...rest] = line.split("|").map((part) => part.trim());
        return {
          school: school || null,
          degree: degree || null,
          date_range: date_range || null,
          description: rest.join(" | ") || null,
        };
      });

    return { skills, experience, education };
  }, [educationText, experienceText, skillsText]);

  const handleConfirm = async () => {
    try {
      await confirmParse.mutateAsync({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        headline: headline || null,
        summary: summary || null,
        skills: parsedProfile.skills,
        experience: parsedProfile.experience,
        education: parsedProfile.education,
      });
      toast.success(t("confirmed"));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? tc("error"));
    }
  };

  const handleRetry = async () => {
    try {
      await retryParse.mutateAsync();
      toast.success(t("retryStarted"));
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? tc("error"));
    }
  };

  if (!application.cv_url) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-1">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {t("title")}
        </h3>
        {status === "failed" && (
          <button
            onClick={handleRetry}
            disabled={retryParse.isPending}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted disabled:opacity-50"
          >
            <RefreshCcw className="w-4 h-4" />
            {t("retry")}
          </button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-5 mb-5">
        {STATUS_STEPS.map((step, index) => {
          const active = activeStepIndex >= index;
          return (
            <div key={step} className={`rounded-lg px-3 py-2 text-xs font-medium ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {t(`steps.${step}` as "steps.queued")}
            </div>
          );
        })}
      </div>

      {status && ["queued", "extracting", "parsing"].includes(status) && (
        <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground flex items-center gap-3">
          <LoaderCircle className="w-4 h-4 animate-spin text-primary" />
          <span>{t("inProgress")}</span>
        </div>
      )}

      {status === "failed" && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-medium">{t("failed")}</p>
          {latestJob?.error_message && <p className="mt-1 text-xs">{latestJob.error_message}</p>}
        </div>
      )}

      {canReview && (
        <div className="space-y-5">
          <div className="rounded-xl bg-muted/30 p-4 text-sm text-muted-foreground flex items-start gap-3">
            <FileSearch className="w-4 h-4 mt-0.5 text-primary" />
            <div>
              <p className="font-medium text-foreground">{t("reviewTitle")}</p>
              <p className="mt-1">{t("reviewDescription")}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.firstName")}</label>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.lastName")}</label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.email")}</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.phone")}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.headline")}</label>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.summary")}</label>
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.skills")}</label>
              <textarea value={skillsText} onChange={(e) => setSkillsText(e.target.value)} rows={8} placeholder={t("placeholders.skills")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.experience")}</label>
              <textarea value={experienceText} onChange={(e) => setExperienceText(e.target.value)} rows={8} placeholder={t("placeholders.experience")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.education")}</label>
              <textarea value={educationText} onChange={(e) => setEducationText(e.target.value)} rows={8} placeholder={t("placeholders.education")} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleConfirm}
              disabled={confirmParse.isPending}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {confirmParse.isPending ? tc("saving") : t("confirm")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
