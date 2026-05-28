"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import {
  useUploadCompanyLogo,
  useRemoveCompanyLogo,
  useUploadCompanyBanner,
  useRemoveCompanyBanner,
} from "@/services/queries/companies.queries";
import type { MyCompany } from "@/entities/company";
import { SectionShell, TextField } from "./SectionShell";

interface Props {
  company: MyCompany;
}

interface BrandState {
  name: string;
  slug: string;
  tagline: string | null;
  website: string | null;
}

export function BrandSection({ company }: Props) {
  const state: BrandState = {
    name:    company.name,
    slug:    company.slug ?? "",
    tagline: company.tagline,
    website: company.website,
  };
  // Slug is "set-once" — once the public URL exists we lock the input.
  // Backend enforces the same rule; this is the UX hint.
  const slugLocked = !!company.slug;

  return (
    <SectionShell<BrandState>
      description="Logo, banner, nazwa i adres publiczny. Adres URL można ustawić tylko raz — pojawi się jako /firmy/{adres}."
      value={state}
      buildPayload={(next) => ({
        name: next.name.trim(),
        // Don't send slug if it's empty or unchanged from current persisted value,
        // so we never trip the "slug locked" guard with the same string.
        slug:
          !slugLocked && next.slug.trim()
            ? next.slug.trim()
            : undefined as unknown as string,
        tagline: next.tagline?.trim() || null,
        website: next.website?.trim() || null,
      })}
    >
      {(draft, setDraft) => (
        <>
          {/* Logo + banner uploads live above the text fields so the UX
              mirrors what the public profile will show top-to-bottom. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LogoUploader logoUrl={company.logo_url} />
            <BannerUploader bannerUrl={company.banner_url} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <TextField
              label="Nazwa firmy"
              value={draft.name}
              onChange={(v) => setDraft({ ...draft, name: v })}
              maxLength={200}
            />
            <div>
              <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">
                <span>Adres URL (slug)</span>
                {slugLocked && (
                  <span className="text-[10px] text-muted-foreground/60">
                    zablokowany po pierwszym zapisie
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground shrink-0 px-2">/firmy/</span>
                <input
                  value={draft.slug}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                    })
                  }
                  disabled={slugLocked}
                  placeholder="moja-firma"
                  maxLength={60}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 disabled:opacity-60"
                />
              </div>
            </div>
          </div>
          <TextField
            label="Tagline (krótkie hasło)"
            value={draft.tagline}
            onChange={(v) => setDraft({ ...draft, tagline: v })}
            placeholder="np. Nowoczesna platforma finansowa dla firm"
            maxLength={200}
          />
          <TextField
            label="Strona WWW"
            value={draft.website}
            onChange={(v) => setDraft({ ...draft, website: v })}
            placeholder="https://example.com"
            maxLength={400}
            type="url"
          />
        </>
      )}
    </SectionShell>
  );
}


// ─────────────────────────────────────────────────────────────────────
// Logo / banner uploaders. Each handles its own upload mutation —
// uploads happen immediately, no "save" needed (file is the value).
// ─────────────────────────────────────────────────────────────────────

function LogoUploader({ logoUrl }: { logoUrl: string | null }) {
  const upload = useUploadCompanyLogo();
  const remove = useRemoveCompanyLogo();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File) => {
    try {
      await upload.mutateAsync(file);
      toast.success("Logo zaktualizowane");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się przesłać logo");
    }
  };

  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1.5">Logo</div>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-xl border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-accent/40"
          >
            <Upload className="w-3.5 h-3.5" />
            {logoUrl ? "Zmień logo" : "Wgraj logo"}
          </button>
          {/* Hint: kwadrat ~256×256, bo logo jest renderowane jako 56–96 px
              z object-cover. Wszystko poniżej 128 px wygląda rozmyte. */}
          <p className="text-[10px] text-muted-foreground leading-tight">
            Kwadrat 256×256 px (min. 128×128)<br />
            PNG / JPG / WEBP · max 2 MB
          </p>
          {logoUrl && (
            <button
              type="button"
              onClick={() => remove.mutate()}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-400"
            >
              <X className="w-3 h-3" /> Usuń
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}

function BannerUploader({ bannerUrl }: { bannerUrl: string | null }) {
  const upload = useUploadCompanyBanner();
  const remove = useRemoveCompanyBanner();
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File) => {
    try {
      await upload.mutateAsync(file);
      toast.success("Banner zaktualizowany");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się przesłać bannera");
    }
  };

  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1.5">Banner (góra profilu)</div>
      <div className="flex items-center gap-3">
        <div className="h-16 w-32 rounded-lg border border-border bg-background overflow-hidden shrink-0">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-amber-400/15 to-transparent" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs hover:bg-accent/40"
          >
            <Upload className="w-3.5 h-3.5" />
            {bannerUrl ? "Zmień banner" : "Wgraj banner"}
          </button>
          {/* Hint: proporcje 4:1 (panoramiczny pasek nad profilem).
              Renderowany na pełną szerokość kontenera ~1024 px wys. 192–224 px,
              więc 1600×400 px daje ostrość również na retinie. */}
          <p className="text-[10px] text-muted-foreground leading-tight">
            Panorama 1600×400 px (proporcje 4:1)<br />
            PNG / JPG / WEBP · max 2 MB
          </p>
          {bannerUrl && (
            <button
              type="button"
              onClick={() => remove.mutate()}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-rose-400"
            >
              <X className="w-3 h-3" /> Usuń
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
