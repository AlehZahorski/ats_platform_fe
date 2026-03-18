"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Topbar } from "@/components/layout/Topbar";
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
  usePreviewEmailTemplate,
} from "@/services/queries/email-automation.queries";
import type { EmailTemplate } from "@/services/api/email-templates";
import { Plus, Mail, Pencil, Trash2, Eye, X } from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_TYPES = [
  "application_received",
  "interview_invite",
  "rejection",
  "offer",
  "custom",
];

const LANGUAGES = ["en", "pl"];

// ─── Template Form Modal ──────────────────────────────────────────────────────
function TemplateModal({
  template,
  onClose,
}: {
  template?: EmailTemplate;
  onClose: () => void;
}) {
  const t = useTranslations("emailTemplates");
  const tc = useTranslations("common");

  const createMutation = useCreateEmailTemplate();
  const updateMutation = useUpdateEmailTemplate(template?.id ?? "");

  const [form, setForm] = useState({
    name: template?.name ?? "",
    type: template?.type ?? "application_received",
    subject: template?.subject ?? "",
    body: template?.body ?? "",
    language: template?.language ?? "en",
  });

  const isEditing = !!template;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async () => {
    if (!form.name || !form.subject || !form.body) {
      toast.error(tc("error"));
      return;
    }
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(form);
        toast.success(t("updated"));
      } else {
        await createMutation.mutateAsync(form);
        toast.success(t("created"));
      }
      onClose();
    } catch {
      toast.error(tc("error"));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h3 className="font-display font-semibold text-foreground">
            {isEditing ? t("edit") : t("new")}
          </h3>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("name")} *</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("language")}</label>
              <select value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {LANGUAGES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("type")}</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {TEMPLATE_TYPES.map((type) => (
                <option key={type} value={type}>{t(`types.${type}` as any)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("subject")} *</label>
            <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. Your application for {{job_title}}"
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("body")} *</label>
            <textarea value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              rows={10}
              placeholder={"Hi {{candidate_name}},\n\nThank you for applying for {{job_title}}...\n\nTrack: {{tracking_url}}"}
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono" />
          </div>

          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1.5">{t("variables")}</p>
            <div className="flex flex-wrap gap-1.5">
              {["{{candidate_name}}", "{{job_title}}", "{{company_name}}", "{{stage_name}}", "{{tracking_url}}", "{{interview_date}}", "{{interview_url}}"].map((v) => (
                <code key={v}
                  className="text-xs bg-background border border-border px-2 py-0.5 rounded text-primary cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => setForm((f) => ({ ...f, body: f.body + v }))}>
                  {v}
                </code>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-border shrink-0">
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

// ─── Preview Modal ────────────────────────────────────────────────────────────
function PreviewModal({ template, onClose }: { template: EmailTemplate; onClose: () => void }) {
  const t = useTranslations("emailTemplates");
  const preview = usePreviewEmailTemplate(template.id);
  const [previewData, setPreviewData] = useState<{ subject: string; body: string } | null>(null);

  // useEffect prevents calling mutateAsync during render (infinite loop)
  useEffect(() => {
    preview.mutateAsync().then(setPreviewData).catch(() => {});
  }, [template.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl shadow-2xl animate-fade-in max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">{t("preview")} — {template.name}</h3>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          {preview.isPending ? (
            <div className="h-32 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : previewData ? (
            <>
              <div className="mb-4 p-3 bg-muted/40 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Subject</p>
                <p className="text-sm font-medium text-foreground">{previewData.subject}</p>
              </div>
              <div className="p-4 bg-background border border-border rounded-lg">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{previewData.body}</pre>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No preview available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EmailTemplatesPage() {
  const t = useTranslations("emailTemplates");
  const tc = useTranslations("common");
  const { data: templates, isLoading } = useEmailTemplates();
  const deleteMutation = useDeleteEmailTemplate();

  const [showCreate, setShowCreate] = useState(false);
  const [editTemplate, setEditTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [filterLang, setFilterLang] = useState("");
  const [filterType, setFilterType] = useState("");

  const handleDelete = async (id: string) => {
    if (!confirm(tc("confirm"))) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success(t("deleted"));
    } catch {
      toast.error(tc("error"));
    }
  };

  const filtered = templates?.filter((tpl) => {
    if (filterLang && tpl.language !== filterLang) return false;
    if (filterType && tpl.type !== filterType) return false;
    return true;
  });

  return (
    <div>
      <Topbar title={t("title")} />
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All languages</option>
              {LANGUAGES.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">All types</option>
              {TEMPLATE_TYPES.map((type) => (
                <option key={type} value={type}>{t(`types.${type}` as any)}</option>
              ))}
            </select>
          </div>
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
        ) : filtered?.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">{t("noTemplates")}</p>
            <p className="text-muted-foreground text-sm mt-1">{t("noTemplatesDesc")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered?.map((tpl, i) => (
              <div key={tpl.id}
                className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/30 transition-all animate-fade-in"
                style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{tpl.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        {t(`types.${tpl.type}` as any)}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
                        {tpl.language}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">{tpl.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => setPreviewTemplate(tpl)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditTemplate(tpl)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(tpl.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreate && <TemplateModal onClose={() => setShowCreate(false)} />}
      {editTemplate && <TemplateModal template={editTemplate} onClose={() => setEditTemplate(null)} />}
      {previewTemplate && <PreviewModal template={previewTemplate} onClose={() => setPreviewTemplate(null)} />}
    </div>
  );
}