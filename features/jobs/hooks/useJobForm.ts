import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useUpdateJob, useAssignTemplate } from "@/services/queries";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import type { Job } from "@/entities/job";
import type { JobFormState } from "../types/job-form.types";
import { toForm, fromForm } from "../utils/job-form.utils";

export function useJobForm(jobId: string, job: Job | undefined) {
  const t = useTranslations("jobs");
  const tc = useTranslations("common");
  const updateJob = useUpdateJob();
  const assignTemplate = useAssignTemplate();
  const [form, setForm] = useState<JobFormState | null>(null);

  useEffect(() => {
    if (job) setForm(toForm(job));
  }, [job]);

  const handleChange = <K extends keyof JobFormState>(key: K, value: JobFormState[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSave = async () => {
    if (!form) return;
    try {
      await updateJob.mutateAsync({ id: jobId, data: fromForm(form) as never });
      toast.success(t("saved"));
    } catch (error) {
      const detail = (error as any)?.response?.data?.detail;
      if (detail && Array.isArray(detail.issues) && detail.issues.length > 0) {
        detail.issues.forEach((issue: string) => toast.error(issue));
      } else {
        toast.error(getApiErrorMessage(error) ?? t("updateFailed"));
      }
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    try {
      await assignTemplate.mutateAsync({ id: jobId, template_id: templateId === "none" ? null : templateId });
      toast.success(templateId === "none" ? t("templateRemoved") : t("assignTemplate"));
    } catch {
      toast.error(t("templateUpdateFailed"));
    }
  };

  return {
    t,
    tc,
    form,
    handleChange,
    handleSave,
    handleTemplateChange,
    isSaving: updateJob.isPending,
    isAssigning: assignTemplate.isPending,
  };
}
