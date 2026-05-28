"use client";

import { authorInitials } from "./lib/format";

interface Props {
  name:      string;
  avatarUrl?: string | null;
  size?:     number;
  className?: string;
}

/** Compact author avatar — uses the photo URL when provided, otherwise
 * an amber initials tile. Mirrors the company-avatar pattern from /firmy. */
export function AuthorAvatar({ name, avatarUrl, size = 28, className }: Props) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className ?? ""}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-card border border-border flex items-center justify-center font-semibold text-amber-400 shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {authorInitials(name)}
    </div>
  );
}
