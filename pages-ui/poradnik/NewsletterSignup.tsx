"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useNewsletterSubscribe } from "@/services/queries/articles.queries";

/** Email capture row at the bottom of /poradnik. Idempotent on the
 * backend — re-submitting the same address just refreshes the
 * subscribed_at timestamp. */
export function NewsletterSignup() {
  const subscribe = useNewsletterSubscribe();
  const [email, setEmail] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const result = await subscribe.mutateAsync({ email: email.trim(), source: "poradnik" });
      toast.success(
        result.already_existed
          ? "Już Cię mamy na liście — dzięki, że zostajesz!"
          : "Zapisaliśmy Cię. Do zobaczenia w skrzynce!",
      );
      setEmail("");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się zapisać. Spróbuj ponownie.");
    }
  };

  return (
    <section className="rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-400/[0.06] via-card to-card p-8 md:p-10">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-[11px] uppercase tracking-wider text-amber-400">Newsletter</div>
        <h2 className="mt-2 text-2xl md:text-3xl font-semibold leading-tight">
          Dostawaj najlepsze artykuły{" "}
          <span className="text-amber-400 italic font-serif">co tydzień</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Bez spamu. Tylko sprawdzona wiedza dla kandydatów i rekruterów.
        </p>

        <form
          onSubmit={submit}
          className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="twoj@email.pl"
            className="flex-1 px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
          <button
            type="submit"
            disabled={subscribe.isPending}
            className="px-5 py-3 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 transition-colors disabled:opacity-60"
          >
            {subscribe.isPending ? "Zapisuję…" : "Zapisz mnie"}
          </button>
        </form>
      </div>
    </section>
  );
}
