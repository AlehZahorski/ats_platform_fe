import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ size = 16 }: { size?: number }) {
  return (
    <span title="Firma zweryfikowana" className="inline-flex items-center text-sky-400">
      <BadgeCheck className={`w-${Math.ceil(size / 4)} h-${Math.ceil(size / 4)}`} style={{ width: size, height: size }} />
    </span>
  );
}
