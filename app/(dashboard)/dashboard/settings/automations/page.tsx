"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Topbar } from "@/components/layout/Topbar";
import {
  useAutomations,
  useCreateAutomation,
  useUpdateAutomation,
  useToggleAutomation,
  useDeleteAutomation,
} from "@/services/queries/email-automation.queries";
import { useEmailTemplates } from "@/services/queries/email-automation.queries";
import { usePipelineStages } from "@/services/queries";
import type { AutomationRule } from "@/services/api/automations";
import { Plus, Zap, Trash2, Pencil, X, Power } from "lucide-react";
import { toast } from "sonner";

const TRIGGER_TYPES = ["stage_changed", "application_created"];

// ─── Rule Form Modal ──────────────────────────────────────────────────────────
function RuleModal({
  rule,
  onClose,
}: {
  rule?: AutomationRule;
  onClose: () => void;
}) {
  const t = useTranslations("automations");
  const tc = useTranslations("common");
  const { data: templates } = useEmailTemplates();
  const { data: stages } = usePipelineStages();

  const createMutation = useCreateAutomation();
  const updateMutation = useUpdateAutomation(rule?.id ?? "");

  const [form, setForm] = useState({
    name: rule?.name ?? "",
    trigger_type: rule?.trigger_type ?? "stage_changed",
    trigger_value: rule?.trigger_value ?? "",
    template_id: rule?.template_id ?? "",
    is_active: rule?.is_active ?? true,
  });

  const isEditing = !!rule;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!form.name || !form.template_id) {
      toast.error(tc("error"));
      return;
    }
    const payload = {
      name: form.name,
      trigger_type: form.trigger_type,
      trigger_value: form.trigger_value || null,
      template_id: form.template_id || null,
      is_active: form.is_active,
    };
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(payload);
        toast.success(t("updated"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("created"));
      }
      onClose();
    } catch {
      toast.error(tc("error"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">
            {isEditing ? t("edit") : t("new")}
          </h3>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("name")} *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Send confirmation on apply"
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("trigger")}</label>
            <select value={form.trigger_type}
              onChange={(e) => setForm((f) => ({ ...f, trigger_type: e.target.value, trigger_value: "" }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {TRIGGER_TYPES.map((type) => (
                <option key={type} value={type}>{t(`triggers.${type}` as any)}</option>
              ))}
            </select>
          </div>

          {form.trigger_type === "stage_changed" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("triggerValue")}</label>
              <select value={form.trigger_value}
                onChange={(e) => setForm((f) => ({ ...f, trigger_value: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Any stage</option>
                {stages?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("template")} *</label>
            <select value={form.template_id}
              onChange={(e) => setForm((f) => ({ ...f, template_id: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select template...</option>
              {templates?.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.language.toUpperCase()})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/40">
            <div>
              <p className="text-sm font-medium text-foreground">{form.is_active ? t("active") : t("inactive")}</p>
            </div>
            <button onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
              className={`w-10 h-6 rounded-full transition-all relative ${form.is_active ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.is_active ? "left-4" : "left-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-0">
          <button onClick={handleSubmit} disabled={isPending}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
            {isPending ? tc("saving") : tc("save")}
          </button>
          <button onClick={onClose}
            className="px-4 py-2.5 border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-all">
            {tc("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AutomationsPage() {
  const t = useTranslations("automations");
  const tc = useTranslations("common");
  const { data: rules, isLoading } = useAutomations();
  const toggleMutation = useToggleAutomation();
  const deleteMutation = useDeleteAutomation();

  const [showCreate, setShowCreate] = useState(false);
  const [editRule, setEditRule] = useState<AutomationRule | null>(null);

  const handleToggle = async (id: string) => {
    try {
      await toggleMutation.mutateAsync(id);
    } catch {
      toast.error(tc("error"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(tc("confirm"))) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t("deleted"));
    } catch {
      toast.error(tc("error"));
    }
  };

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">{rules?.length ?? 0} rules</p>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
            <Plus className="w-4 h-4" /> {t("new")}
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}
          </div>
        ) : rules?.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">{t("noRules")}</p>
            <p className="text-muted-foreground text-sm mt-1">{t("noRulesDesc")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules?.map((rule, i) => (
              <div key={rule.id}
                className={`bg-card border rounded-xl p-5 flex items-center justify-between transition-all animate-fade-in ${
                  rule.is_active ? "border-border hover:border-primary/30" : "border-border/50 opacity-60"
                }`}
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    rule.is_active ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <Zap className={`w-5 h-5 ${rule.is_active ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{rule.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        {t(`triggers.${rule.trigger_type}` as any)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        rule.is_active
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {rule.is_active ? t("active") : t("inactive")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => handleToggle(rule.id)}
                    title={rule.is_active ? t("disable") : t("enable")}
                    className={`p-2 rounded-lg transition-all ${
                      rule.is_active
                        ? "text-green-500 hover:bg-green-500/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}>
                    <Power className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditRule(rule)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(rule.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && <RuleModal onClose={() => setShowCreate(false)} />}
      {editRule && <RuleModal rule={editRule} onClose={() => setEditRule(null)} />}
    </div>
  );
}