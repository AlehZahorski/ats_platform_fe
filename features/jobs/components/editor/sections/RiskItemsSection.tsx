"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { LoaderCircle, Plus, Trash2, X } from "lucide-react";

import {
  useAddMitigation,
  useAddRiskItem,
  useDeleteMitigation,
  useDeleteRiskItem,
} from "@/services/queries";
import type { MitigationAction, RiskItem, RiskSeverity } from "@/types";

import { SeverityBadge } from "../shared/SeverityBadge";

interface RiskItemsSectionProps {
  jobId: string | null;
  riskItems: RiskItem[];
  mitigations: MitigationAction[];
}

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-ring";

const SEVERITIES: RiskSeverity[] = ["high", "medium", "low"];

export function RiskItemsSection({ jobId, riskItems, mitigations }: RiskItemsSectionProps) {
  const t = useTranslations("jobs");

  if (!jobId) {
    return (
      <p className="text-sm text-muted-foreground italic">
        {t("editor.risks.saveFirst")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RisksList jobId={jobId} items={riskItems} />
      <MitigationsList jobId={jobId} items={mitigations} />
    </div>
  );
}

// ── Risks list ─────────────────────────────────────────────────────────

function RisksList({ jobId, items }: { jobId: string; items: RiskItem[] }) {
  const t = useTranslations("jobs");
  const tc = useTranslations("common");
  const addM = useAddRiskItem(jobId);
  const deleteM = useDeleteRiskItem(jobId);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [severity, setSeverity] = useState<RiskSeverity>("medium");

  const submit = async () => {
    const description = draft.trim();
    if (!description) return;
    try {
      await addM.mutateAsync({ description, severity, order: items.length });
      setDraft("");
      setSeverity("medium");
      setAdding(false);
    } catch {
      toast.error(tc("error"));
    }
  };

  const remove = async (id: string) => {
    try { await deleteM.mutateAsync(id); }
    catch { toast.error(tc("error")); }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-foreground">{t("editor.risks.mainRisksLabel")}</p>

      {items.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground italic">{t("editor.risks.noRisks")}</p>
      )}

      <ol className="space-y-2">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-start gap-2 group">
            <span className="text-xs text-muted-foreground tabular-nums mt-1.5">{i + 1}.</span>
            <span className="flex-1 text-sm text-foreground">{item.description}</span>
            <SeverityBadge severity={item.severity} />
            <button
              type="button"
              onClick={() => remove(item.id)}
              disabled={deleteM.isPending}
              className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
              aria-label={tc("delete")}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ol>

      {adding ? (
        <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/30">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t("editor.risks.riskPlaceholder")}
            className={inputClass}
          />
          <div className="flex items-center justify-between gap-2">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as RiskSeverity)}
              className={inputClass}
              style={{ width: "auto" }}
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>{t(`severity.${s}` as never)}</option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={submit}
                disabled={!draft.trim() || addM.isPending}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {addM.isPending ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : tc("add")}
              </button>
              <button
                type="button"
                onClick={() => { setDraft(""); setAdding(false); }}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("editor.risks.addRisk")}
        </button>
      )}
    </div>
  );
}

// ── Mitigations list ───────────────────────────────────────────────────

function MitigationsList({ jobId, items }: { jobId: string; items: MitigationAction[] }) {
  const t = useTranslations("jobs");
  const tc = useTranslations("common");
  const addM = useAddMitigation(jobId);
  const deleteM = useDeleteMitigation(jobId);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const submit = async () => {
    const description = draft.trim();
    if (!description) return;
    try {
      await addM.mutateAsync({ description, order: items.length });
      setDraft("");
      setAdding(false);
    } catch {
      toast.error(tc("error"));
    }
  };

  const remove = async (id: string) => {
    try { await deleteM.mutateAsync(id); }
    catch { toast.error(tc("error")); }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-foreground">{t("editor.risks.mainActionsLabel")}</p>

      {items.length === 0 && !adding && (
        <p className="text-xs text-muted-foreground italic">{t("editor.risks.noActions")}</p>
      )}

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 group">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="flex-1 text-sm text-foreground">{item.description}</span>
            <button
              type="button"
              onClick={() => remove(item.id)}
              disabled={deleteM.isPending}
              className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
              aria-label={tc("delete")}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="flex gap-2 p-3 rounded-lg border border-border bg-muted/30">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={t("editor.risks.actionPlaceholder")}
            className={inputClass}
          />
          <button
            type="button"
            onClick={submit}
            disabled={!draft.trim() || addM.isPending}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            {addM.isPending ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : tc("add")}
          </button>
          <button
            type="button"
            onClick={() => { setDraft(""); setAdding(false); }}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("editor.risks.addAction")}
        </button>
      )}
    </div>
  );
}
