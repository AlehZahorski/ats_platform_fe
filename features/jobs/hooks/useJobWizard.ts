"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateJob, useUpdateJob } from "@/services/queries";
import { ROUTES } from "@/config/routes";
import type { WizardFormData, WizardStep } from "../types/job-wizard.types";
import { emptyWizardForm, wizardFormToPayload } from "../utils/job-wizard.utils";

export function useJobWizard() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>(1);
  const [jobId, setJobId] = useState<string | null>(null);
  const [form, setForm] = useState<WizardFormData>(emptyWizardForm());

  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const isSaving = createJob.isPending || updateJob.isPending;

  function handleChange<K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleNext() {
    try {
      if (step === 1) {
        const payload = wizardFormToPayload(form);
        const job = await createJob.mutateAsync({ ...payload, status: "draft" });
        setJobId(job.id);
      } else if (jobId) {
        await updateJob.mutateAsync({ id: jobId, data: wizardFormToPayload(form) });
      }
      setStep((s) => (s + 1) as WizardStep);
    } catch {
      toast.error("Nie udało się zapisać. Spróbuj ponownie.");
    }
  }

  function handleBack() {
    setStep((s) => (s - 1) as WizardStep);
  }

  async function handlePublish() {
    if (!jobId) return;
    try {
      await updateJob.mutateAsync({ id: jobId, data: { status: "open" } });
      toast.success("Oferta opublikowana!");
      router.push(ROUTES.jobs);
    } catch {
      toast.error("Nie udało się opublikować oferty.");
    }
  }

  function handleSaveDraft() {
    if (jobId) router.push(ROUTES.job(jobId));
    else router.push(ROUTES.jobs);
  }

  return {
    step,
    jobId,
    form,
    isSaving,
    handleChange,
    handleNext,
    handleBack,
    handlePublish,
    handleSaveDraft,
  };
}
