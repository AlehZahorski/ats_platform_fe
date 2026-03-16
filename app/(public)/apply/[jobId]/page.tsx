"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { applicationsApi } from "@/services/api/applications";
import apiClient from "@/services/api/client";
import type { FormField, FormTemplate } from "@/types";
import { CheckCircle, Briefcase, MapPin, Building2, Upload } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────
interface PublicJob {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  description: string | null;
  template: FormTemplate | null;
}

// ─── Dynamic field renderer ───────────────────────────────────────────────
function DynamicField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string;
  onChange: (val: string) => void;
}) {
  const baseClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all";

  switch (field.field_type) {
    case "textarea":
      return (
        <textarea
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={`${baseClass} resize-none`}
        />
      );

    case "select":
      return (
        <select
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        >
          <option value="">Select an option...</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );

    case "multiselect":
      return (
        <div className="space-y-2">
          {(field.options ?? []).map((opt) => {
            const selected = value.split(",").filter(Boolean);
            const checked = selected.includes(opt);
            return (
              <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selected.filter((s) => s !== opt)
                      : [...selected, opt];
                    onChange(next.join(","));
                  }}
                  className="w-4 h-4 rounded border-input accent-primary"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">{opt}</span>
              </label>
            );
          })}
        </div>
      );

    case "checkbox":
      return (
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={(e) => onChange(e.target.checked ? "true" : "false")}
            className="w-4 h-4 rounded border-input accent-primary"
          />
          <span className="text-sm text-foreground">{field.label}</span>
        </label>
      );

    case "number":
      return (
        <input
          type="number"
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );

    case "email":
      return (
        <input
          type="email"
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );

    case "phone":
      return (
        <input
          type="tel"
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );

    case "date":
      return (
        <input
          type="date"
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );

    default: // text
      return (
        <input
          type="text"
          required={field.required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClass}
        />
      );
  }
}

// ─── Main page ────────────────────────────────────────────────────────────
export default function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();

  const [job, setJob] = useState<PublicJob | null>(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [jobNotFound, setJobNotFound] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Core fields
  const [coreForm, setCoreForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);

  // Dynamic field answers: { field_id: value }
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Fetch job + template
  useEffect(() => {
    apiClient.get(`/jobs/public/${jobId}`)
      .then((res) => {
        setJob(res.data);
        // Initialize answers
        const init: Record<string, string> = {};
        res.data.template?.fields?.forEach((f: FormField) => {
          init[f.id] = "";
        });
        setAnswers(init);
      })
      .catch(() => setJobNotFound(true))
      .finally(() => setJobLoading(false));
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required dynamic fields
    const fields = job?.template?.fields ?? [];
    for (const field of fields) {
      if (field.required && !answers[field.id]?.trim()) {
        toast.error(`"${field.label}" is required`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(coreForm).forEach(([k, v]) => v && fd.append(k, v));
      if (cvFile) fd.append("cv_file", cvFile);

      // Append dynamic answers as JSON
      const answersPayload = Object.entries(answers)
        .filter(([, v]) => v !== "")
        .map(([field_id, value]) => ({ field_id, value }));
      fd.append("answers", JSON.stringify(answersPayload));

      const res = await applicationsApi.apply(jobId, fd);
      setToken(res.data.public_token);
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────
  if (jobLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────
  if (jobNotFound || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Position Not Available</h1>
          <p className="text-muted-foreground">This job posting is no longer accepting applications.</p>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Application Submitted!</h1>
          <p className="text-muted-foreground mb-1">Thank you for applying for <strong className="text-foreground">{job.title}</strong>.</p>
          <p className="text-muted-foreground mb-6">We&apos;ll review your application and be in touch soon.</p>
          <button
            onClick={() => router.push(`/track/${token}`)}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all"
          >
            Track my application
          </button>
        </div>
      </div>
    );
  }

  const sortedFields = [...(job.template?.fields ?? [])].sort(
    (a, b) => a.order_index - b.order_index
  );

  // ── Form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-xl mx-auto">
        {/* Job header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">{job.title}</h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            {job.department && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> {job.department}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {job.location}
              </span>
            )}
          </div>
          {job.description && (
            <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto leading-relaxed">
              {job.description}
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in-delay-1">
          <div className="px-6 py-4 border-b border-border bg-muted/30">
            <p className="text-sm font-semibold text-foreground">Application Form</p>
            <p className="text-xs text-muted-foreground mt-0.5">Fields marked with * are required</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Core fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">First name *</label>
                <input
                  required
                  value={coreForm.first_name}
                  onChange={(e) => setCoreForm((f) => ({ ...f, first_name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Last name *</label>
                <input
                  required
                  value={coreForm.last_name}
                  onChange={(e) => setCoreForm((f) => ({ ...f, last_name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
              <input
                required
                type="email"
                value={coreForm.email}
                onChange={(e) => setCoreForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
              <input
                type="tel"
                value={coreForm.phone}
                onChange={(e) => setCoreForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Dynamic fields from template */}
            {sortedFields.length > 0 && (
              <>
                <div className="border-t border-border pt-5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                    Additional Information
                  </p>
                  <div className="space-y-5">
                    {sortedFields.map((field) => (
                      field.field_type === "checkbox" ? (
                        // Checkbox renders its own label
                        <div key={field.id}>
                          <DynamicField
                            field={field}
                            value={answers[field.id] ?? ""}
                            onChange={(val) => setAnswers((a) => ({ ...a, [field.id]: val }))}
                          />
                        </div>
                      ) : (
                        <div key={field.id}>
                          <label className="block text-sm font-medium text-foreground mb-1.5">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </label>
                          <DynamicField
                            field={field}
                            value={answers[field.id] ?? ""}
                            onChange={(val) => setAnswers((a) => ({ ...a, [field.id]: val }))}
                          />
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* CV Upload */}
            <div className="border-t border-border pt-5">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" /> CV / Resume
                </span>
              </label>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground cursor-pointer"
              />
              {cvFile && (
                <p className="text-xs text-green-500 mt-1">✓ {cvFile.name}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">PDF or DOCX, max 10MB</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : "Submit Application"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Your data is processed securely and will only be used for recruitment purposes.
        </p>
      </div>
    </div>
  );
}