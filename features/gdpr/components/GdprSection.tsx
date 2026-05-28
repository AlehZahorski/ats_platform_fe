"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useApplicationConsents,
  useAnonymize,
  useDeleteApplicationData,
} from "@/services/queries/gdpr.queries";
import { Shield, Trash2, UserX, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function GdprSection({ applicationId }: { applicationId: string }) {
  const t = useTranslations("gdpr");
  const tc = useTranslations("common");
  const router = useRouter();
  const { data: consents, isLoading } = useApplicationConsents(applicationId);
  const anonymizeMutation = useAnonymize();
  const deleteMutation = useDeleteApplicationData();
  const [showDanger, setShowDanger] = useState(false);

  const handleAnonymize = async () => {
    if (!confirm(t("anonymizeConfirm"))) return;
    try {
      const result = await anonymizeMutation.mutateAsync(applicationId);
      toast.success(result.message);
      router.refresh();
    } catch { toast.error(tc("error")); }
  };

  const handleDelete = async () => {
    if (!confirm(t("deleteConfirm"))) return;
    const confirm2 = window.prompt(t("deletePrompt"));
    if (confirm2 !== "DELETE") { toast.error(t("deleteCancelled")); return; }
    try {
      await deleteMutation.mutateAsync(applicationId);
      toast.success(t("deleted"));
      router.push(ROUTES.applications);
    } catch { toast.error(tc("error")); }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 animate-fade-in-delay-3">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-foreground">{t("title")}</h3>
      </div>

      {!isLoading && consents && consents.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t("consentRecords")}
          </p>
          <div className="space-y-2">
            {consents.map((record) => (
              <div key={record.consent_id} className="flex items-center gap-2.5 text-sm">
                {record.accepted
                  ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  : <XCircle className="w-4 h-4 text-destructive shrink-0" />
                }
                <span className="text-foreground">{record.consent?.name ?? "Consent"}</span>
                <span className={`ml-auto text-xs font-medium ${record.accepted ? "text-green-500" : "text-destructive"}`}>
                  {record.accepted ? t("accepted") : t("declined")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowDanger(!showDanger)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        {showDanger ? t("hideDangerZone") : t("showDangerZone")}
      </button>

      {showDanger && (
        <div className="mt-4 space-y-3 border border-destructive/30 rounded-xl p-4 bg-destructive/5 animate-fade-in">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">{t("dangerZone")}</p>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">{t("anonymizeTitle")}</p>
              <p className="text-xs text-muted-foreground">
                {t("anonymizeDesc")}
              </p>
            </div>
            <button
              onClick={handleAnonymize}
              disabled={anonymizeMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/10 disabled:opacity-50 transition-all shrink-0"
            >
              <UserX className="w-3.5 h-3.5" />
              {anonymizeMutation.isPending ? t("anonymizing") : t("anonymize")}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 pt-3 border-t border-destructive/20">
            <div>
              <p className="text-sm font-medium text-destructive">{t("deleteTitle")}</p>
              <p className="text-xs text-muted-foreground">
                {t("deleteDesc")}
              </p>
            </div>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 disabled:opacity-50 transition-all shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {deleteMutation.isPending ? t("deleting") : t("delete")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
