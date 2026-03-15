"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { useApplications, usePipelineStages } from "@/services/queries";
import { formatRelative } from "@/lib/utils";
import { Search, Users, ChevronRight } from "lucide-react";
import Link from "next/link";

const STAGE_COLORS: Record<string, string> = {
  Applied: "bg-blue-500/10 text-blue-500",
  Screening: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  Interview: "bg-purple-500/10 text-purple-500",
  Offer: "bg-orange-500/10 text-orange-500",
  Hired: "bg-green-500/10 text-green-500",
  Rejected: "bg-destructive/10 text-destructive",
};

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const { data: stages } = usePipelineStages();
  const { data, isLoading } = useApplications({
    search: search || undefined,
    stage_id: stageFilter || undefined,
  });

  return (
    <div>
      <Topbar title="Applications" />
      <div className="p-6 space-y-5">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All stages</option>
            {stages?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Count */}
        <p className="text-sm text-muted-foreground">{data?.total ?? 0} applications</p>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-card border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">No applications found</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Candidate", "Email", "Stage", "Applied", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.items.map((app, i) => (
                  <tr key={app.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 0.03}s` }}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-foreground text-sm">
                        {app.first_name} {app.last_name}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{app.email}</td>
                    <td className="px-5 py-4">
                      {app.stage ? (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_COLORS[app.stage.name] ?? "bg-muted text-muted-foreground"}`}>
                          {app.stage.name}
                        </span>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{formatRelative(app.created_at)}</td>
                    <td className="px-5 py-4">
                      <Link href={`/dashboard/applications/${app.id}`}
                        className="flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
