"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, FileSearch, LoaderCircle, RefreshCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useConfirmCvParse, useCvParseStatus, useRetryCvParse } from "@/services/queries";
import type { Application, ParsedEducation, ParsedExperience, ParsedSkill } from "@/types";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";

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
    const skills: ParsedSkill[] = skillsText.split("\n").map((item) => item.trim()).filter(Boolean).map((name) => ({ name }));

    const experience: ParsedExperience[] = experienceText.split("\n").map((item) => item.trim()).filter(Boolean).map((line) => {
      const [title, company, date_range, ...rest] = line.split("|").map((part) => part.trim());
      return { title: title || null, company: company || null, date_range: date_range || null, description: rest.join(" | ") || null };
    });

    const education: ParsedEducation[] = educationText.split("\n").map((item) => item.trim()).filter(Boolean).map((line) => {
      const [school, degree, date_range, ...rest] = line.split("|").map((part) => part.trim());
      return { school: school || null, degree: degree || null, date_range: date_range || null, description: rest.join(" | ") || null };
    });

    return { skills, experience, education };
  }, [educationText, experienceText, skillsText]);

  const handleConfirm = async () => {
    try {
      await confirmParse.mutateAsync({
        first_name: firstName, last_name: lastName, email,
        phone: phone || null, headline: headline || null, summary: summary || null,
        skills: parsedProfile.skills, experience: parsedProfile.experience, education: parsedProfile.education,
      });
      toast.success(t("confirmed"));
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? tc("error"));
    }
  };

  const handleRetry = async () => {
    try {
      await retryParse.mutateAsync();
      toast.success(t("retryStarted"));
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? tc("error"));
    }
  };

  if (!application.cv_url) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-1">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          {t("title")}
        </h3>
        {status === "failed" && (
          <Button variant="outline" onClick={handleRetry} disabled={retryParse.isPending} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            {t("retry")}
          </Button>
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

      {/* LLM enrichment panel — shown when v2 data is available */}
      {canReview && application.candidate_profile?.parser_version === "v2-llm" && (
        <div className="space-y-4 mb-5">
          {/* Parser badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="w-3 h-3" />
              Parsed by Claude
            </span>
            {application.candidate_profile.seniority_estimate && application.candidate_profile.total_experience_years && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {application.candidate_profile.seniority_estimate.charAt(0).toUpperCase() + application.candidate_profile.seniority_estimate.slice(1)}
                {" · "}
                {application.candidate_profile.total_experience_years} lat
              </span>
            )}
          </div>

          {/* Executive summary */}
          {application.candidate_profile.executive_summary && (
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <p className="text-sm font-medium text-primary mb-1">Podsumowanie kandydata</p>
              <p className="text-sm text-foreground leading-relaxed">{application.candidate_profile.executive_summary}</p>
            </div>
          )}

          {/* Skills sections */}
          {(application.candidate_profile.technical_skills?.length || application.candidate_profile.soft_skills?.length || application.candidate_profile.languages?.length) && (
            <div className="grid gap-3 sm:grid-cols-3">
              {application.candidate_profile.technical_skills && application.candidate_profile.technical_skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Techniczne</p>
                  <div className="flex flex-wrap gap-1">
                    {application.candidate_profile.technical_skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-xs bg-muted text-foreground">
                        {s.name}{s.level ? ` · ${s.level}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {application.candidate_profile.soft_skills && application.candidate_profile.soft_skills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Miękkie</p>
                  <div className="flex flex-wrap gap-1">
                    {application.candidate_profile.soft_skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-xs bg-muted text-foreground">{s.name}</span>
                    ))}
                  </div>
                </div>
              )}
              {application.candidate_profile.languages && application.candidate_profile.languages.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Języki</p>
                  <div className="flex flex-wrap gap-1">
                    {application.candidate_profile.languages.map((l, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-xs bg-muted text-foreground">
                        {l.name}{l.level ? ` · ${l.level}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hobbies */}
          {application.candidate_profile.hobbies && application.candidate_profile.hobbies.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Hobby i zainteresowania</p>
              <div className="flex flex-wrap gap-1">
                {application.candidate_profile.hobbies.map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20">{h}</span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths and red flags */}
          {(application.candidate_profile.strengths?.length || application.candidate_profile.red_flags?.length) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {application.candidate_profile.strengths && application.candidate_profile.strengths.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Mocne strony</p>
                  <div className="flex flex-wrap gap-1">
                    {application.candidate_profile.strengths.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-600 border border-green-500/20">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {application.candidate_profile.red_flags && application.candidate_profile.red_flags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    Uwagi
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {application.candidate_profile.red_flags.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Culture fit notes */}
          {application.candidate_profile.culture_fit_notes && (
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Dopasowanie kulturowe</p>
              <p className="text-xs text-foreground leading-relaxed">{application.candidate_profile.culture_fit_notes}</p>
            </div>
          )}
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
            <div className="space-y-1.5">
              <Label>{t("fields.firstName")}</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("fields.lastName")}</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("fields.email")}</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("fields.phone")}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("fields.headline")}</Label>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>{t("fields.summary")}</Label>
            <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t("fields.skills")}</Label>
              <Textarea value={skillsText} onChange={(e) => setSkillsText(e.target.value)} rows={8} placeholder={t("placeholders.skills")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("fields.experience")}</Label>
              <Textarea value={experienceText} onChange={(e) => setExperienceText(e.target.value)} rows={8} placeholder={t("placeholders.experience")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("fields.education")}</Label>
              <Textarea value={educationText} onChange={(e) => setEducationText(e.target.value)} rows={8} placeholder={t("placeholders.education")} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleConfirm} disabled={confirmParse.isPending}>
              {confirmParse.isPending ? tc("saving") : t("confirm")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
