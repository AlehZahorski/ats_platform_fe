"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import {
  useUploadGalleryItem,
  useRemoveGalleryItem,
} from "@/services/queries/companies.queries";
import type { MyCompany } from "@/entities/company";

interface Props { company: MyCompany; }

/** Gallery doesn't use SectionShell — there's no "save" button because
 * every action (upload, remove) is immediate. Each tile is a thumbnail
 * with a remove cross; the trailing + tile opens the file picker. */
export function GallerySection({ company }: Props) {
  const upload = useUploadGalleryItem();
  const remove = useRemoveGalleryItem();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      await upload.mutateAsync(file);
      toast.success("Dodano zdjęcie");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? "Nie udało się przesłać zdjęcia");
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card">
      <header className="flex items-start justify-between gap-4 p-5 border-b border-border">
        <div>
          <h2 className="font-semibold">Galeria</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Zdjęcia biura, zespołu lub eventów. Pojawiają się w sekcji „Zobacz nas w akcji".
          </p>
        </div>
      </header>
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {company.gallery.map((item, i) => (
            <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-background group">
              <img src={item.url} alt={item.caption ?? ""} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove.mutate(i)}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                aria-label="Usuń zdjęcie"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-video rounded-lg border border-dashed border-border text-muted-foreground hover:border-amber-400/60 hover:text-foreground flex flex-col items-center justify-center gap-1"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Dodaj zdjęcie</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>
      </div>
    </section>
  );
}
