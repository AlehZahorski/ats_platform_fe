"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Logo } from "@/shared/ui/Logo";
import {
  useAcceptInvitation,
  useInvitationPreview,
} from "@/services/queries";

const inputClass =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function AcceptInvitationPage() {
  const t = useTranslations("acceptInvitation");
  const tc = useTranslations("common");
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token");

  const preview = useInvitationPreview(token);
  const accept = useAcceptInvitation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // ---------------------------------------------------------------------
  // States
  // ---------------------------------------------------------------------
  if (!token) {
    return <ErrorScreen message={t("missingToken")} />;
  }

  if (preview.isLoading) {
    return (
      <Centered>
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </Centered>
    );
  }

  if (preview.isError || !preview.data) {
    const detail =
      (preview.error as any)?.response?.data?.detail ?? t("invalidOrExpired");
    return <ErrorScreen message={detail} />;
  }

  const invitation = preview.data;

  // ---------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error(t("passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      toast.error(t("passwordMismatch"));
      return;
    }
    try {
      await accept.mutateAsync({ token, password });
      toast.success(t("accepted"));
      router.replace(ROUTES.dashboard);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? tc("error"));
    }
  };

  // ---------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <Logo className="h-20 w-auto mx-auto" />
          <p className="text-muted-foreground mt-3 text-sm">
            {t("welcome", { company: invitation.company_name })}
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 shadow-lg space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t("setPassword")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("invitedAs", { email: invitation.email, role: invitation.role })}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                autoFocus
                minLength={8}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("confirmPassword")}
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={accept.isPending}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {accept.isPending ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {accept.isPending ? t("creating") : t("activateAccount")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {children}
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  const t = useTranslations("acceptInvitation");
  return (
    <Centered>
      <div className="w-full max-w-md text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {t("errorTitle")}
        </h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </Centered>
  );
}
