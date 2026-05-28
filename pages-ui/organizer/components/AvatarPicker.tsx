"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { AVATAR_PRESETS } from "@/shared/ui/avatars/presets";
import { useUpdateAvatar } from "@/services/queries/organizer.queries";
import { useMe } from "@/services/queries";
import type { AvatarKey } from "@/entities/user";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AvatarPicker({ open, onClose }: Props) {
  const { data: me } = useMe();
  const update = useUpdateAvatar();
  const [picked, setPicked] = useState<AvatarKey | null>(me?.avatar_key ?? null);

  const handleSave = async () => {
    await update.mutateAsync(picked);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogTitle>Wybierz avatar</DialogTitle>

        <div className="flex items-center justify-center my-4">
          <UserAvatar user={{ ...me, avatar_key: picked }} size={80} />
        </div>

        <div className="grid grid-cols-4 gap-3">
          <PickerTile
            label="Brak"
            isActive={picked === null}
            onClick={() => setPicked(null)}
          >
            <UserAvatar user={{ avatar_key: null }} size={48} />
          </PickerTile>

          {AVATAR_PRESETS.map((preset) => (
            <PickerTile
              key={preset.key}
              label={preset.label}
              isActive={picked === preset.key}
              onClick={() => setPicked(preset.key)}
            >
              <UserAvatar user={{ avatar_key: preset.key }} size={48} />
            </PickerTile>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={onClose}>Anuluj</Button>
          <Button onClick={handleSave} disabled={update.isPending}>Zapisz</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PickerTile({
  label,
  isActive,
  onClick,
  children,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors",
        isActive ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40"
      )}
    >
      {children}
      <span className="text-xs text-muted-foreground">{label}</span>
      {isActive && (
        <Check className="absolute top-1 right-1 w-3 h-3 text-primary" />
      )}
    </button>
  );
}
