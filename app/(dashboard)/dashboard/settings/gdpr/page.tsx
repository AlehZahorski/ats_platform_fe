"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Topbar } from "@/components/layout/Topbar";
import {
  useConsents,
  useCreateConsent,
  useUpdateConsent,
  useDeleteConsent,
  useCleanupExpired,
} from "@/services/queries/gdpr.queries";
import type { Consent } from "@/services/api/gdpr";
import { Plus, Shield, Trash2, Pencil, X, Power, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = ["en", "pl"];

// ─── Consent Form Modal ────────────────────────────────────────────────────────
function ConsentModal({
  consent,
  onClose,
}: {
  consent?: Consent;
  onClose: () => void;
}) {
  const t = useTranslations("consents");
  const tc = useTranslations("common");
  const createMutation = useCreateConsent();
  const updateMutation = useUpdateConsent();

  const [form, setForm] = useState({
    name: consent?.name ?? "",
    content: consent?.content ?? "",
    language: consent?.language ?? "en",
    required: consent?.required ?? true,
  });

  const isEditing = !!consent;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.content.trim()) {
      toast.error(tc("error"));
      return;
    }
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: consent.id, data: form });
        toast.success(tc("save"));
      } else {
        await createMutation.mutateAsync(form);
        toast.success(t("created"));
      }
      onClose();
    } catch { toast.error(tc("error")); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">
            {isEditing ? tc("edit") : t("new")}
          </h3>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("name")} *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{tc("language.en") ? "Language" : "Language"}</label>
              <select value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {LANGUAGES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("content")} *</label>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={5}
              placeholder="I consent to the processing of my personal data for recruitment purposes..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>
          <div className="flex items-center justify-between py-2 px-3 bg-muted/40 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">{t("required")}</p>
              <p className="text-xs text-muted-foreground">Candidates must accept this consent</p>
            </div>
            <button onClick={() => setForm((f) => ({ ...f, required: !f.required }))}
              className={`w-10 h-6 rounded-full transition-all relative ${form.required ? "bg-primary" : "bg-muted-foreground/30"}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.required ? "left-4" : "left-0.5"}`} />
            </button>
          </div>
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <button onClick={handleSubmit} disabled={isPending}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all">
            {isPending ? tc("saving") : tc("save")}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-border text-foreground rounded-lg text-sm hover:bg-muted transition-all">
            {tc("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GdprSettingsPage() {
  const t = useTranslations("consents");
  const tc = useTranslations("common");
  const { data: consents, isLoading } = useConsents();
  const deleteMutation = useDeleteConsent();
  const updateMutation = useUpdateConsent();
  const cleanupMutation = useCleanupExpired();

  const [showCreate, setShowCreate] = useState(false);
  const [editConsent, setEditConsent] = useState<Consent | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(tc("confirm"))) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t("deleted"));
    } catch { toast.error(tc("error")); }
  };

  const handleToggle = async (consent: Consent) => {
    try {
      await updateMutation.mutateAsync({ id: consent.id, data: { is_active: !consent.is_active } });
    } catch { toast.error(tc("error")); }
  };

  const handleCleanup = async () => {
    if (!confirm("This will anonymize all applications past their data retention date. Continue?")) return;
    try {
      const result = await cleanupMutation.mutateAsync();
      toast.success(`Anonymized ${result.anonymized} expired applications`);
    } catch { toast.error(tc("error")); }
  };

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-6">

        {/* GDPR cleanup */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              Data Retention Cleanup
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Anonymize all applications that have passed their data retention date
            </p>
          </div>
          <button
            onClick={handleCleanup}
            disabled={cleanupMutation.isPending}
            className="px-4 py-2 text-sm font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-all"
          >
            {cleanupMutation.isPending ? "Running..." : "Run cleanup"}
          </button>
        </div>

        {/* Consents list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {t("title")}
            </h2>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
              <Plus className="w-4 h-4" /> {t("new")}
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => <div key={i} className="h-20 bg-card border border-border rounded-xl animate-pulse" />)}
            </div>
          ) : consents?.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">{t("noConsents")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consents?.map((consent, i) => (
                <div key={consent.id}
                  className={`bg-card border rounded-xl p-5 transition-all animate-fade-in ${
                    consent.is_active ? "border-border" : "border-border/50 opacity-60"
                  }`}
                  style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground text-sm">{consent.name}</p>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">{consent.language}</span>
                        {consent.required && (
                          <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">Required</span>
                        )}
                        {!consent.is_active && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Inactive</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{consent.content}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => handleToggle(consent)}
                        className={`p-2 rounded-lg transition-all ${
                          consent.is_active
                            ? "text-green-500 hover:bg-green-500/10"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}>
                        <Power className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditConsent(consent)}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(consent.id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && <ConsentModal onClose={() => setShowCreate(false)} />}
      {editConsent && <ConsentModal consent={editConsent} onClose={() => setEditConsent(null)} />}
    </div>
  );
}