"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useJobs, useCreateJob, useDeleteJob } from "@/services/queries";
import { formatRelative } from "@/lib/utils";
import { Plus, Briefcase, MapPin, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function JobsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");

  const { data, isLoading } = useJobs();
  const createJob = useCreateJob();
  const deleteJob = useDeleteJob();

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      await createJob.mutateAsync({ title, department, location, status: "draft" });
      toast.success("Job created");
      setTitle(""); setDepartment(""); setLocation("");
      setShowCreate(false);
    } catch {
      toast.error("Failed to create job");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job?")) return;
    try {
      await deleteJob.mutateAsync(id);
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  return (
    <div>
      <Topbar title="Jobs" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{data?.total ?? 0} total jobs</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" /> New Job
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
            <h3 className="font-display font-semibold text-foreground mb-4">New Job Posting</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Job title *" className="px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input value={department} onChange={(e) => setDepartment(e.target.value)}
                placeholder="Department" className="px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="Location" className="px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleCreate} disabled={!title.trim() || createJob.isPending}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
                {createJob.isPending ? "Creating..." : "Create Job"}
              </button>
              <button onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Jobs list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No jobs yet</p>
            <p className="text-muted-foreground text-sm mt-1">Create your first job posting to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.items.map((job, i) => (
              <div key={job.id}
                className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/30 transition-all animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <Link href={`/dashboard/jobs/${job.id}`}
                      className="font-semibold text-foreground hover:text-primary transition-colors truncate">
                      {job.title}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      job.status === "open" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                      job.status === "draft" ? "bg-muted text-muted-foreground" :
                      "bg-destructive/10 text-destructive"}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {job.department && <span>{job.department}</span>}
                    {job.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>}
                    <span>{formatRelative(job.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/dashboard/jobs/${job.id}`}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDelete(job.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
