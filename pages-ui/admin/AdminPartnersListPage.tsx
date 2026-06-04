"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Copy,
  Link2,
  RefreshCw,
  Trash2,
  Ban,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PartnerToken } from "@/entities/partner";
import {
  useAdminPartners,
  useCreatePartnerToken,
  useUpdatePartnerToken,
  useRegeneratePartnerToken,
  useDeletePartnerToken,
} from "@/services/queries/partners.queries";

function presentationUrl(token: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/prezentacja?token=${encodeURIComponent(token)}`;
}

async function copy(text: string, label: string) {
  // navigator.clipboard is only available in secure contexts (HTTPS or
  // localhost). On plain-HTTP deployments (e.g. http://wakanta.pl) it's
  // undefined, so fall back to the legacy execCommand path.
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} skopiowano do schowka`);
      return;
    }
    if (legacyCopy(text)) {
      toast.success(`${label} skopiowano do schowka`);
      return;
    }
    throw new Error("copy unsupported");
  } catch {
    // Last resort: show the value so the user can copy it by hand.
    toast.error("Nie udało się skopiować automatycznie — skopiuj ręcznie", {
      description: text,
      duration: 10000,
    });
  }
}

/** Fallback copy for non-secure (HTTP) contexts. Returns true on success. */
function legacyCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    // Keep it off-screen but selectable.
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    ta.setAttribute("readonly", "");
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function AdminPartnersListPage() {
  const [q, setQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useAdminPartners(q);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold">Partnerzy</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generuj kody dostępu do prezentacji inwestorskiej i rozsyłaj je partnerom.
            Prezentacja dostępna jest pod <code>/prezentacja</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-amber-400/10 text-amber-400 px-4 py-2.5 text-sm font-semibold hover:bg-amber-400/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> Nowy kod
        </button>
      </header>

      {/* Search */}
      <div className="relative my-5">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Szukaj po nazwie partnera lub notatce…"
          className="w-full rounded-xl border border-border bg-card pl-9 pr-3 py-2.5 text-sm outline-none focus:border-amber-400/50"
        />
      </div>

      {showCreate && <CreateForm onClose={() => setShowCreate(false)} />}

      {/* List */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground py-10 text-center">Ładowanie…</div>
      ) : !data?.items.length ? (
        <div className="text-sm text-muted-foreground py-14 text-center border border-dashed border-border rounded-xl">
          Brak kodów dostępu. Kliknij „Nowy kod”, aby utworzyć pierwszy.
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((t) => (
            <Row key={t.id} token={t} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Create form ──────────────────────────────────────────────────────
function CreateForm({ onClose }: { onClose: () => void }) {
  const [label, setLabel] = useState("");
  const [deck, setDeck] = useState<"investor" | "partner">("investor");
  const [note, setNote] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const create = useCreatePartnerToken();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    try {
      const created = await create.mutateAsync({
        label: label.trim(),
        deck,
        note: note.trim() || null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        max_views: maxViews ? Number(maxViews) : null,
      });
      toast.success("Kod utworzony");
      await copy(presentationUrl(created.token), "Link do prezentacji");
      onClose();
    } catch {
      toast.error("Nie udało się utworzyć kodu");
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-amber-400/30 bg-card p-5 mb-5 space-y-4"
    >
      <h3 className="text-sm font-semibold">Nowy kod dostępu</h3>

      {/* Deck picker — decides which presentation the code unlocks. */}
      <Field label="Którą prezentację odblokowuje ten kod? *">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDeck("investor")}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              deck === "investor"
                ? "border-amber-400 bg-amber-400/10"
                : "border-border bg-background hover:border-amber-400/40",
            )}
          >
            <div className="text-sm font-semibold flex items-center gap-2">💰 Dla inwestora</div>
            <div className="text-xs text-muted-foreground mt-0.5">Pitch deck — rynek, runda, model biznesowy</div>
          </button>
          <button
            type="button"
            onClick={() => setDeck("partner")}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              deck === "partner"
                ? "border-amber-400 bg-amber-400/10"
                : "border-border bg-background hover:border-amber-400/40",
            )}
          >
            <div className="text-sm font-semibold flex items-center gap-2">🤝 Dla partnera</div>
            <div className="text-xs text-muted-foreground mt-0.5">Rekrutacja współzałożycieli — role, udziały</div>
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Nazwa partnera / inwestora *">
          <input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="np. Fundusz XYZ — Jan Kowalski"
            className={inputCls}
          />
        </Field>
        <Field label="Notatka (opcjonalnie)">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="kontekst, etap rozmów…"
            className={inputCls}
          />
        </Field>
        <Field label="Wygasa (opcjonalnie)">
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Limit wejść (opcjonalnie)">
          <input
            type="number"
            min={1}
            value={maxViews}
            onChange={(e) => setMaxViews(e.target.value)}
            placeholder="bez limitu"
            className={inputCls}
          />
        </Field>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
          Anuluj
        </button>
        <button
          type="submit"
          disabled={create.isPending || !label.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-amber-400 text-black px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Utwórz i skopiuj link
        </button>
      </div>
    </form>
  );
}

// ── Row ──────────────────────────────────────────────────────────────
function Row({ token }: { token: PartnerToken }) {
  const update = useUpdatePartnerToken();
  const regen = useRegeneratePartnerToken();
  const del = useDeletePartnerToken();

  const expired = token.expires_at ? new Date(token.expires_at) <= new Date() : false;
  const exhausted = token.max_views != null && token.view_count >= token.max_views;
  const live = token.is_active && !expired && !exhausted;

  const toggleActive = () =>
    update.mutate({ id: token.id, data: { is_active: !token.is_active } });

  const regenerate = async () => {
    if (!confirm("Wygenerować nowy kod? Stary link przestanie działać.")) return;
    const r = await regen.mutateAsync(token.id);
    await copy(presentationUrl(r.token), "Nowy link");
  };

  const remove = () => {
    if (!confirm(`Usunąć kod dla „${token.label}”? Tej operacji nie można cofnąć.`)) return;
    del.mutate(token.id, { onSuccess: () => toast.success("Kod usunięty") });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold truncate">{token.label}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400">
              {token.deck === "partner" ? "🤝 partner" : "💰 inwestor"}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full",
                live ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400",
              )}
            >
              {live ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
              {live ? "aktywny" : expired ? "wygasł" : exhausted ? "limit wyczerpany" : "wyłączony"}
            </span>
          </div>
          {token.note && <div className="text-xs text-muted-foreground mt-1 truncate">{token.note}</div>}

          {/* Token chip */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <code className="text-xs bg-muted/40 rounded-md px-2 py-1 font-mono">{token.token}</code>
            <button onClick={() => copy(token.token, "Kod")} className={iconBtn} title="Kopiuj kod">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => copy(presentationUrl(token.token), "Link")}
              className={iconBtn}
              title="Kopiuj link do prezentacji"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Meta */}
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {token.view_count}
              {token.max_views != null ? ` / ${token.max_views}` : ""} otwarć
            </span>
            {token.last_viewed_at && (
              <span>ostatnio: {new Date(token.last_viewed_at).toLocaleString("pl-PL")}</span>
            )}
            {token.expires_at && (
              <span>wygasa: {new Date(token.expires_at).toLocaleDateString("pl-PL")}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="shrink-0 flex items-center gap-1">
          <button onClick={toggleActive} className={actionBtn} title={token.is_active ? "Wyłącz" : "Włącz"}>
            {token.is_active ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </button>
          <button onClick={regenerate} className={actionBtn} title="Wygeneruj nowy kod">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={remove} className={cn(actionBtn, "hover:text-rose-400")} title="Usuń">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Small UI helpers ─────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-amber-400/50";
const iconBtn =
  "inline-grid place-items-center w-7 h-7 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-amber-400/40 transition-colors";
const actionBtn =
  "inline-grid place-items-center w-9 h-9 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-amber-400/40 transition-colors";
