"use client";

import { cn } from "@/lib/utils";
import type { AvatarKey } from "@/entities/user";
import { AVATAR_MAP } from "./avatars/presets";

type UserAvatarUser = {
  id?: string;
  email?: string | null;
  avatar_key?: AvatarKey | null;
};

interface UserAvatarProps {
  user?: UserAvatarUser | null;
  size?: number;
  className?: string;
  title?: string;
}

const DEFAULT_BG = "#E5E7EB";

export function UserAvatar({ user, size = 32, className, title }: UserAvatarProps) {
  const dimension = `${size}px`;
  const fontSize = Math.round(size * 0.6);
  const def = user?.avatar_key ? AVATAR_MAP[user.avatar_key] : undefined;

  const bg = def?.bg ?? DEFAULT_BG;
  const glyph = def?.emoji;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full shrink-0 select-none overflow-hidden",
        className
      )}
      style={{ width: dimension, height: dimension, backgroundColor: bg }}
      title={title ?? user?.email ?? undefined}
      aria-label={user?.email ?? "avatar"}
    >
      {glyph ? (
        <span style={{ fontSize, lineHeight: 1 }}>{glyph}</span>
      ) : (
        <EmptyFace size={size} />
      )}
    </span>
  );
}

function EmptyFace({ size }: { size: number }) {
  const stroke = Math.max(1, Math.round(size * 0.05));
  return (
    <svg
      viewBox="0 0 32 32"
      width={Math.round(size * 0.7)}
      height={Math.round(size * 0.7)}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground/60"
      aria-hidden="true"
    >
      <circle cx="16" cy="13" r="5" />
      <path d="M5 28c2.5-5 6.7-7 11-7s8.5 2 11 7" />
    </svg>
  );
}
