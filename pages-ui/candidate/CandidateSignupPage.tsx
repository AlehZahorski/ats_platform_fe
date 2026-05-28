"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { useCandidateSignup } from "@/services/queries/jobBoard.queries";
import { ROUTES } from "@/config/routes";
import { AuthShell } from "./AuthShell";
import { mergeLsSavedJobs } from "./lib/mergeLsSavedJobs";

const inputCls =
  "w-full pl-10 pr-3 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40";

export function CandidateSignupPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const signup = useCandidateSignup();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const next = sp.get("next") || ROUTES.candidate.account;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup.mutateAsync({ email, password, full_name: fullName || undefined });
      const migrated = await mergeLsSavedJobs();
      if (migrated > 0) {
        toast.success(`Konto utworzone. Przeniesiono ${migrated} obserwowanych ofert.`);
      } else {
        toast.success("Konto utworzone");
      }
      router.push(next);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Nie udało się utworzyć konta";
      toast.error(msg);
    }
  };

  return (
    <AuthShell
      title="Utwórz konto"
      subtitle="Konto kandydata umożliwia aplikowanie 1 kliknięciem, zapisywanie ofert i otrzymywanie powiadomień."
      footer={
        <>
          Masz już konto?{" "}
          <Link
            href={`${ROUTES.candidate.login}?next=${encodeURIComponent(next)}`}
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            Zaloguj się
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Imię i nazwisko</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jan Kowalski"
              className={inputCls}
              autoComplete="name"
            />
          </div>
        </div>

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
              placeholder="Min. 8 znaków"
              className={inputCls}
              autoComplete="new-password"
              minLength={8}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={signup.isPending}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 disabled:opacity-50 transition-colors"
        >
          {signup.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Utwórz konto
        </button>

        <p className="text-xs text-muted-foreground text-center">
          Tworząc konto akceptujesz Regulamin i Politykę prywatności.
        </p>
      </form>
    </AuthShell>
  );
}
