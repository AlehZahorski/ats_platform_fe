"use client";

import { useState } from "react";
import { DollarSign, Cpu, Activity, Building2, Clock } from "lucide-react";

import { useAdminUsage } from "@/services/queries/admin.queries";
import { cn } from "@/lib/utils";
import type {
  CompanyUsageRow,
  OperationUsageRow,
  ModelUsageRow,
  RecentUsageRow,
} from "@/entities/admin";

// Window options — value is `days` sent to the API; 0 means all-time.
const PERIODS: { label: string; days: number }[] = [
  { label: "7 dni", days: 7 },
  { label: "30 dni", days: 30 },
  { label: "90 dni", days: 90 },
  { label: "1 rok", days: 365 },
  { label: "Cały okres", days: 0 },
];

// Human-readable operation labels (keys match ApiUsageLog.operation).
const OPERATION_LABELS: Record<string, string> = {
  cv_parsing: "Parsowanie CV",
  cv_enrich: "Wzbogacanie CV",
  job_match: "Dopasowanie kandydata",
  job_analysis: "Analiza oferty",
  job_suggest: "Podpowiedzi oferty",
  risk_analysis: "Analiza ryzyka",
};

const fmtInt = (n: number | null | undefined) => (n ?? 0).toLocaleString("pl-PL");

// Token-derived costs are tiny — show enough precision to be meaningful.
const fmtUsd = (n: number | null | undefined) =>
  `$${(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;

const fmtDateTime = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const opLabel = (op: string) => OPERATION_LABELS[op] ?? op;

export function UsagePage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useAdminUsage(days);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Zużycie AI</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tokeny i koszty modeli Claude w podziale na firmy, operacje i modele
          </p>
        </div>
        <PeriodSelector value={days} onChange={setDays} />
      </div>

      {isLoading ? (
        <UsageSkeleton />
      ) : !data ? (
        <EmptyState text="Nie udało się wczytać danych o zużyciu." />
      ) : (
        <>
          <OverviewCards data={data.overview} />

          {data.overview.total_calls === 0 ? (
            <EmptyState text="Brak wywołań AI w wybranym okresie." />
          ) : (
            <>
              <CompanyTable rows={data.by_company} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OperationCard rows={data.by_operation} />
                <ModelCard rows={data.by_model} />
              </div>
              <RecentTable rows={data.recent} />
            </>
          )}
        </>
      )}
    </div>
  );
}

// ── Period selector ──────────────────────────────────────────────────────────

function PeriodSelector({ value, onChange }: { value: number; onChange: (days: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-card p-1 self-start">
      {PERIODS.map((p) => (
        <button
          key={p.days}
          type="button"
          onClick={() => onChange(p.days)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
            value === p.days
              ? "bg-amber-400 text-zinc-950"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ── Overview cards ───────────────────────────────────────────────────────────

function OverviewCards({
  data,
}: {
  data: { total_cost_usd: number; total_tokens: number; total_calls: number; companies_using: number };
}) {
  const cards = [
    { label: "Koszt łączny", value: fmtUsd(data.total_cost_usd), icon: DollarSign, color: "text-emerald-400" },
    { label: "Tokeny łącznie", value: fmtInt(data.total_tokens), icon: Cpu, color: "text-blue-400" },
    { label: "Wywołania AI", value: fmtInt(data.total_calls), icon: Activity, color: "text-amber-400" },
    { label: "Aktywne firmy", value: fmtInt(data.companies_using), icon: Building2, color: "text-purple-400" },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2 tabular-nums">{c.value}</p>
              </div>
              <Icon className={cn("w-8 h-8", c.color)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── By-company table ─────────────────────────────────────────────────────────

function CompanyTable({ rows }: { rows: CompanyUsageRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground">Zużycie wg firm</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Firma</th>
              <th className="px-5 py-3 text-right font-semibold">Wywołania</th>
              <th className="px-5 py-3 text-right font-semibold">Tokeny wej.</th>
              <th className="px-5 py-3 text-right font-semibold">Tokeny wyj.</th>
              <th className="px-5 py-3 text-right font-semibold">Tokeny łącznie</th>
              <th className="px-5 py-3 text-right font-semibold">Koszt</th>
              <th className="px-5 py-3 text-right font-semibold">Ostatnio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((r) => (
              <tr key={r.company_id} className="hover:bg-accent/30">
                <td className="px-5 py-3 font-medium text-foreground">{r.company_name}</td>
                <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">{fmtInt(r.calls)}</td>
                <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">{fmtInt(r.input_tokens)}</td>
                <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">{fmtInt(r.output_tokens)}</td>
                <td className="px-5 py-3 text-right font-medium text-foreground tabular-nums">{fmtInt(r.total_tokens)}</td>
                <td className="px-5 py-3 text-right font-medium text-emerald-400 tabular-nums">{fmtUsd(r.cost_usd)}</td>
                <td className="px-5 py-3 text-right text-muted-foreground whitespace-nowrap">{fmtDateTime(r.last_used_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── By-operation / by-model cards ────────────────────────────────────────────

function BreakdownCard({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; label: string; calls: number; total_tokens: number; cost_usd: number }[];
}) {
  const maxCost = Math.max(1e-9, ...rows.map((r) => r.cost_usd));
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <ul className="divide-y divide-border/50">
        {rows.map((r) => (
          <li key={r.key} className="px-5 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-foreground truncate">{r.label}</span>
              <span className="text-sm font-medium text-emerald-400 shrink-0 tabular-nums">{fmtUsd(r.cost_usd)}</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-amber-400" style={{ width: `${Math.round((r.cost_usd / maxCost) * 100)}%` }} />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>{fmtInt(r.calls)} wywołań</span>
              <span>{fmtInt(r.total_tokens)} tokenów</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OperationCard({ rows }: { rows: OperationUsageRow[] }) {
  return (
    <BreakdownCard
      title="Wg operacji"
      rows={rows.map((r) => ({
        key: r.operation,
        label: opLabel(r.operation),
        calls: r.calls,
        total_tokens: r.total_tokens,
        cost_usd: r.cost_usd,
      }))}
    />
  );
}

function ModelCard({ rows }: { rows: ModelUsageRow[] }) {
  return (
    <BreakdownCard
      title="Wg modelu"
      rows={rows.map((r) => ({
        key: r.llm_model ?? "unknown",
        label: r.llm_model ?? "Nieznany",
        calls: r.calls,
        total_tokens: r.total_tokens,
        cost_usd: r.cost_usd,
      }))}
    />
  );
}

// ── Recent calls ─────────────────────────────────────────────────────────────

function RecentTable({ rows }: { rows: RecentUsageRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h2 className="font-semibold text-foreground">Ostatnie wywołania</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-semibold">Czas</th>
              <th className="px-5 py-3 text-left font-semibold">Firma</th>
              <th className="px-5 py-3 text-left font-semibold">Operacja</th>
              <th className="px-5 py-3 text-left font-semibold">Model</th>
              <th className="px-5 py-3 text-right font-semibold">Tokeny</th>
              <th className="px-5 py-3 text-right font-semibold">Koszt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-accent/30">
                <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{fmtDateTime(r.created_at)}</td>
                <td className="px-5 py-3 font-medium text-foreground">{r.company_name}</td>
                <td className="px-5 py-3 text-muted-foreground">{opLabel(r.operation)}</td>
                <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{r.llm_model ?? "—"}</td>
                <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">{fmtInt(r.total_tokens)}</td>
                <td className="px-5 py-3 text-right text-emerald-400 tabular-nums">{fmtUsd(r.cost_usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

function UsageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-xl border border-border bg-card animate-pulse" />
    </div>
  );
}
