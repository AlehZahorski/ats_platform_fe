"use client";

import { useTranslations } from "next-intl";
import { Mail, X } from "lucide-react";

interface StageNotificationModalProps {
  count?: number;
  isPending?: boolean;
  onClose: () => void;
  onSendEmail: () => void;
  onSkipEmail: () => void;
}

export function StageNotificationModal({
  count = 1,
  isPending = false,
  onClose,
  onSendEmail,
  onSkipEmail,
}: StageNotificationModalProps) {
  const t = useTranslations("applications.notificationModal");
  const tc = useTranslations("common");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-fade-in">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{t("title")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("description", { count })}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-5">
          <button
            type="button"
            onClick={onSendEmail}
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? tc("saving") : t("sendEmail")}
          </button>
          <button
            type="button"
            onClick={onSkipEmail}
            disabled={isPending}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("withoutEmail")}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tc("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
