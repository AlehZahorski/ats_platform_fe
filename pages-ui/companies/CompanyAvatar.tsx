"use client";

interface Props {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

/** Square company avatar — uses logo if uploaded, otherwise a coloured
 * letter tile. Same letter-hue palette as the job-board avatar so cards
 * look consistent across /jobs and /firmy. */
export function CompanyAvatar({ name, logoUrl, size = 48, className }: Props) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        width={size}
        height={size}
        className={`rounded-lg object-cover shrink-0 ${className ?? ""}`}
        style={{ width: size, height: size }}
      />
    );
  }
  const letter = (name?.trim()?.charAt(0) || "?").toUpperCase();
  return (
    <div
      className={`rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        backgroundColor: letterHue(letter),
      }}
    >
      {letter}
    </div>
  );
}

const PALETTE = ["#F59E0B", "#10B981", "#3B82F6", "#A855F7", "#EC4899", "#F43F5E", "#06B6D4"];
function letterHue(letter: string): string {
  return PALETTE[letter.charCodeAt(0) % PALETTE.length];
}
