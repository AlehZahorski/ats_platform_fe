"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { useCandidateMe } from "@/services/queries/jobBoard.queries";
import { candidatesApi } from "@/services/api/jobBoard";
import { AVATAR_PRESETS } from "@/shared/ui/avatars/presets";
import type { AvatarKey } from "@/entities/user";
import { useQueryClient } from "@tanstack/react-query";
import { candidateKeys } from "@/services/queries/jobBoard.queries";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40";

export function ProfileSection() {
  const { data: me } = useCandidateMe();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    full_name: me?.full_name || "",
    phone: me?.phone || "",
    location: me?.location || "",
    headline: me?.headline || "",
    avatar_key: (me?.avatar_key as AvatarKey | null) ?? null,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await candidatesApi.updateMe({
        full_name: form.full_name || null,
        phone: form.phone || null,
        location: form.location || null,
        headline: form.headline || null,
        avatar_key: form.avatar_key,
      });
      qc.setQueryData(candidateKeys.me, data);
      toast.success("Profil zapisany");
    } catch {
      toast.error("Nie udało się zapisać profilu");
    } finally {
      setSaving(false);
    }
  };

  if (!me) return null;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar user={{ ...me, avatar_key: form.avatar_key }} size={64} />
          <div>
            <div className="text-lg font-semibold">{form.full_name || me.email}</div>
            <div className="text-sm text-muted-foreground">{me.email}</div>
            {form.headline && <div className="text-xs text-muted-foreground mt-1">{form.headline}</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1.5">Imię i nazwisko</label>
          <input
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            className={inputCls}
            placeholder="Jan Kowalski"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Telefon</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className={inputCls}
            placeholder="+48 600 123 456"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Lokalizacja</label>
          <input
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className={inputCls}
            placeholder="Warszawa, Polska"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1.5">Krótki opis (headline)</label>
          <input
            value={form.headline}
            onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
            className={inputCls}
            placeholder="np. Senior Backend Developer • Python/AWS"
          />
        </div>
      </div>

      {/* Avatar picker */}
      <div>
        <label className="block text-xs font-semibold mb-2">Avatar</label>
        <div className="grid grid-cols-7 md:grid-cols-13 gap-2">
          <PickerTile
            isActive={form.avatar_key === null}
            onClick={() => setForm((f) => ({ ...f, avatar_key: null }))}
          >
            <UserAvatar user={{ avatar_key: null }} size={40} />
          </PickerTile>
          {AVATAR_PRESETS.map((p) => (
            <PickerTile
              key={p.key}
              isActive={form.avatar_key === p.key}
              onClick={() => setForm((f) => ({ ...f, avatar_key: p.key }))}
            >
              <UserAvatar user={{ avatar_key: p.key }} size={40} />
            </PickerTile>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 text-black text-sm font-semibold hover:bg-amber-300 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Zapisz zmiany
        </button>
      </div>
    </div>
  );
}

function PickerTile({
  isActive, onClick, children,
}: { isActive: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center p-1.5 rounded-lg border",
        isActive ? "border-amber-400 bg-amber-400/5" : "border-border hover:bg-accent/40"
      )}
    >
      {children}
      {isActive && <Check className="absolute top-0.5 right-0.5 w-3 h-3 text-amber-400" />}
    </button>
  );
}
