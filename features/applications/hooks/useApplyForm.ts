import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { applicationsApi } from "@/services/api/applications";
import { getApiErrorMessage } from "@/shared/utils/api-error";
import { ROUTES } from "@/config/routes";
import type { PublicJobDetail } from "@/entities/job";
import type { DuplicateCheckMatch } from "@/entities/application";

interface CoreForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export function useApplyForm(jobId: string, job: PublicJobDetail | undefined) {
  const t = useTranslations("apply");
  const router = useRouter();

  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateCheckMatch[]>([]);
  const [coreForm, setCoreForm] = useState<CoreForm>({ first_name: "", last_name: "", email: "", phone: "" });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!job) return;
    const initial: Record<string, string> = {};
    job.template?.fields?.forEach((field) => { initial[field.id] = ""; });
    setAnswers(initial);
  }, [job]);

  const validateFields = () => {
    const fields = job?.template?.fields ?? [];
    for (const field of fields) {
      if (field.required && !answers[field.id]?.trim()) {
        toast.error(t("requiredField", { field: field.label }));
        return false;
      }
    }
    return true;
  };

  const submitApplication = async (ignoreDuplicateWarning = false) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(coreForm).forEach(([key, value]) => { if (value) formData.append(key, value); });
      if (cvFile) formData.append("cv_file", cvFile);
      const answersPayload = Object.entries(answers)
        .filter(([, v]) => v !== "")
        .map(([field_id, value]) => ({ field_id, value }));
      formData.append("answers", JSON.stringify(answersPayload));
      if (ignoreDuplicateWarning) formData.append("ignore_duplicate_warning", "true");

      const response = await applicationsApi.apply(jobId, formData);
      setToken(response.data.public_token);
      setSubmitted(true);
      setDuplicateMatches([]);
    } catch (error: unknown) {
      const detail = (error as { response?: { status?: number; data?: { detail?: { code?: string; matches?: DuplicateCheckMatch[] } } } })
        ?.response?.data?.detail;
      if ((error as { response?: { status?: number } })?.response?.status === 409 && detail?.code === "duplicate_candidate_detected") {
        setDuplicateMatches(detail.matches ?? []);
        return;
      }
      toast.error(getApiErrorMessage(error) ?? t("submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateFields()) return;
    try {
      const check = await applicationsApi.duplicateCheck({ job_id: jobId, email: coreForm.email, phone: coreForm.phone || undefined });
      if (check.data.has_duplicates) { setDuplicateMatches(check.data.matches); return; }
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) ?? t("submitFailed"));
      return;
    }
    await submitApplication(false);
  };

  const handleReuse = (match: DuplicateCheckMatch) => router.push(ROUTES.public.track(match.public_token));
  const handleContinue = () => void submitApplication(true);
  const handleCloseDuplicate = () => setDuplicateMatches([]);

  return {
    submitted,
    token,
    isSubmitting,
    duplicateMatches,
    coreForm,
    setCoreForm,
    cvFile,
    setCvFile,
    answers,
    setAnswers,
    handleSubmit,
    handleReuse,
    handleContinue,
    handleCloseDuplicate,
  };
}
