"use client";

import { Topbar } from "@/components/layout/Topbar";
import { Briefcase, Users, GitBranch, TrendingUp } from "lucide-react";
import { useJobs } from "@/services/queries";
import { useApplications } from "@/services/queries";

function StatCard({ title, value, icon: Icon, color }: {
  title: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: jobsData } = useJobs();
  const { data: appsData } = useApplications();

  const openJobs = jobsData?.items.filter((j) => j.status === "open").length ?? 0;
  const totalApps = appsData?.total ?? 0;

  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Open Jobs" value={openJobs} icon={Briefcase} color="bg-primary/10 text-primary" />
          <StatCard title="Total Applications" value={totalApps} icon={Users} color="bg-blue-500/10 text-blue-500" />
          <StatCard title="Active Pipeline" value="—" icon={GitBranch} color="bg-green-500/10 text-green-500" />
          <StatCard title="Hired this month" value="—" icon={TrendingUp} color="bg-purple-500/10 text-purple-500" />
        </div>

        {/* Recent jobs */}
        <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-1">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">Recent Jobs</h2>
          {jobsData?.items.length === 0 ? (
            <p className="text-muted-foreground text-sm">No jobs yet. Create your first job posting.</p>
          ) : (
            <div className="space-y-3">
              {jobsData?.items.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.department ?? "No department"}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    job.status === "open" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                    job.status === "draft" ? "bg-muted text-muted-foreground" :
                    "bg-destructive/10 text-destructive"
                  }`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
