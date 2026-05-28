"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";
import { useCandidateLogin } from "@/services/queries/jobBoard.queries";
import { ROUTES } from "@/config/routes";
import { AuthShell } from "./AuthShell";
import { mergeLsSavedJobs } from "./lib/mergeLsSavedJobs";

const inputCls =
  "w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40";

export function CandidateLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const login = useCandidateLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const next = sp.get("next") || ROUTES.candidate.account;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email, password });
      const migrated = await mergeLsSavedJobs();
      if (migrated > 0) {
        toast.success(`Zalogowano. Przeniesiono ${migrated} obserwowanych ofert do konta.`);
      } else {
        toast.success("Zalogowano");
      }
      router.push(next);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Nieprawidłowy e-mail lub hasło";
      toast.error(msg);
    }
  };

  return (
    <AuthShell
      title="Zaloguj się"
      subtitle="Wejdź na konto kandydata, żeby zarządzać obserwacjami i aplikacjami."
      footer={
        <>
          Nie masz konta?{" "}
          <Link
            href={`${ROUTES.candidate.signup}?next=${encodeURIComponent(next)}`}
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            Zarejestruj się
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ty@example.com"
              className={inputCls}
              autoComplete="email"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Hasło</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputCls}
              autoComplete="current-password"
              minLength={8}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 disabled:opacity-50 transition-colors"
        >
          {login.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Zaloguj się
        </button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2">
        <Link href={ROUTES.login} className="hover:text-foreground">
          Logowanie dla pracodawców →
        </Link>
      </div>
    </AuthShell>
  );
}
