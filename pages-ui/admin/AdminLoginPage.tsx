"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useAdminLogin, useAdminMe } from "@/services/queries/admin.queries";

export function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminLogin();
  const { data: existing, isLoading } = useAdminMe();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Already signed in? Skip the form entirely.
  useEffect(() => {
    if (existing && !isLoading) {
      router.replace("/admin");
    }
  }, [existing, isLoading, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ email: email.trim(), password });
      router.replace("/admin");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Logowanie nieudane");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl"
      >
        <div className="flex items-center gap-2 text-base font-semibold mb-6">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          wakanta.pl <span className="text-amber-400">admin</span>
        </div>
        <h1 className="text-xl font-semibold mb-1">Zaloguj się</h1>
        <p className="text-xs text-muted-foreground mb-6">
          Dostęp tylko dla administratorów platformy.
        </p>

        <label className="block mb-3">
          <div className="text-xs text-muted-foreground mb-1">E-mail</div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            autoComplete="email"
          />
        </label>
        <label className="block mb-6">
          <div className="text-xs text-muted-foreground mb-1">Hasło</div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            autoComplete="current-password"
          />
        </label>

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full py-2.5 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {login.isPending && <LoaderCircle className="w-4 h-4 animate-spin" />}
          Zaloguj się
        </button>
      </form>
    </div>
  );
}
