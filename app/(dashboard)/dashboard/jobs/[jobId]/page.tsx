"use client";

import { use, useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useJob, useUpdateJob, useApplications, useAssignTemplate } from "@/services/queries";
import { useFormTemplates } from "@/services/queries";
import { formatRelative } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronRight, ExternalLink, FileText } from "lucide-react";

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const { data: job, isLoading } = useJob(jobId);
  const { data: apps } = useApplications({ job_id: jobId });
  const { data: templates } = useFormTemplates();
  const updateJob = useUpdateJob();
  const assignTemplate = useAssignTemplate();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", department: "", location: "", status: "" });

  const startEdit = () => {
    if (!job) return;
    setForm({ title: job.title, department: job.department ?? "", location: job.location ?? "", status: job.status });
    setEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateJob.mutateAsync({ id: jobId, data: form });
      toast.success("Job updated");
      setEditing(false);
    } catch { toast.error("Failed to update job"); }
  };

  const handleTemplateChange = async (templateId: string) => {
    try {
      await assignTemplate.mutateAsync({
        id: jobId,
        template_id: templateId === "none" ? null : templateId,
      });
      toast.success(templateId === "none" ? "Template removed" : "Template assigned");
    } catch { toast.error("Failed to update template"); }
  };

  if (isLoading) return <div className="p-6"><div className="h-64 bg-card border border-border rounded-xl animate-pulse" /></div>;
  if (!job) return <div className="p-6 text-muted-foreground">Job not found</div>;

  const assignedTemplate = templates?.find((t) => t.id === job.template_id);

  return (
    <div>
      <Topbar title={job.title} />
      <div className="p-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/jobs" className="hover:text-foreground">Jobs</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{job.title}</span>
        </div>

        {/* Job details card */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <div>
              {editing ? (
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="font-display text-xl font-bold bg-transparent border-b-2 border-primary text-foreground focus:outline-none w-full" />
              ) : (
                <h2 className="font-display text-xl font-bold text-foreground">{job.title}</h2>
              )}
              <p className="text-muted-foreground text-sm mt-1">Created {formatRelative(job.created_at)}</p>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={updateJob.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
                    {updateJob.isPending ? "Saving..." : "Save"}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-all">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={startEdit}
                  className="px-4 py-2 border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-all">
                  Edit
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {editing ? (
              <>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Department</label>
                  <input value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                  <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="draft">Draft</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{job.department ?? "—"}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{job.location ?? "—"}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span className={`text-sm font-medium mt-0.5 inline-block ${
                    job.status === "open" ? "text-green-500" :
                    job.status === "draft" ? "text-muted-foreground" : "text-destructive"}`}>
                    {job.status}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Apply link */}
          {job.status === "open" && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Public application link</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-muted px-3 py-1.5 rounded-lg text-foreground flex-1 truncate">
                  {typeof window !== "undefined" ? window.location.origin : ""}/apply/{job.id}
                </code>
                <a href={`/apply/${job.id}`} target="_blank" rel="noreferrer"
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Form template assignment */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-1">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground">Application Form</h3>
          </div>

          {assignedTemplate ? (
            <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">{assignedTemplate.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{assignedTemplate.fields?.length ?? 0} fields</p>
              </div>
              <Link href="/dashboard/forms" className="text-xs text-primary hover:underline font-medium">
                Edit template
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-3">No form template assigned — candidates will only submit basic info.</p>
          )}

          <div className="flex items-center gap-3">
            <select
              value={job.template_id ?? "none"}
              onChange={(e) => handleTemplateChange(e.target.value)}
              disabled={assignTemplate.isPending}
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              <option value="none">No template</option>
              {templates?.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {assignTemplate.isPending && (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {!templates?.length && (
            <p className="text-xs text-muted-foreground mt-2">
              No templates yet.{" "}
              <Link href="/dashboard/forms" className="text-primary hover:underline">Create one</Link>
            </p>
          )}
        </div>

        {/* Applications for this job */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-2">
          <h3 className="font-semibold text-foreground mb-4">
            Applications <span className="text-muted-foreground text-sm font-normal ml-1">({apps?.total ?? 0})</span>
          </h3>
          {apps?.items.length === 0 ? (
            <p className="text-muted-foreground text-sm">No applications yet</p>
          ) : (
            <div className="space-y-2">
              {apps?.items.map((app) => (
                <Link key={app.id} href={`/dashboard/applications/${app.id}`}
                  className="flex items-center justify-between py-3 px-4 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/30 transition-all">
                  <div>
                    <p className="text-sm font-medium text-foreground">{app.first_name} {app.last_name}</p>
                    <p className="text-xs text-muted-foreground">{app.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.stage && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{app.stage.name}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}