"use client";

import { Users, Home, Briefcase } from "lucide-react";
import type { CompanyPublicDetail } from "@/entities/company";

/** Three honest KPI tiles — count of employees, remote %, open jobs.
 * "Średni czas rekrutacji" and rating were deliberately dropped per
 * product decision. */
export function KpiStrip({ company }: { company: CompanyPublicDetail }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Tile
        icon={<Users className="w-5 h-5 text-amber-400" />}
        value={company.employee_count ?? "—"}
        label="pracowników"
      />
      <Tile
        icon={<Home className="w-5 h-5 text-amber-400" />}
        value={company.remote_percentage != null ? `${company.remote_percentage}%` : "—"}
        label="pracuje zdalnie"
      />
      <Tile
        icon={<Briefcase className="w-5 h-5 text-amber-400" />}
        value={company.open_jobs_count}
        label="otwartych ofert"
      />
    </section>
  );
}

function Tile({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
      <div className="p-2.5 rounded-lg bg-amber-400/10">{icon}</div>
      <div>
        <div className="text-xl font-semibold tabular-nums">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
