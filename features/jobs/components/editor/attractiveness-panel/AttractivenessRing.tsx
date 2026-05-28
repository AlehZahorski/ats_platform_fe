"use client";

interface AttractivenessRingProps {
  score: number;
}

/** SVG ring matching RiskScoreRing visual style but coloured by attractiveness score. */
export function AttractivenessRing({ score }: AttractivenessRingProps) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const fill = (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const color =
    score >= 80 ? "#22c55e" :   // green
    score >= 60 ? "#3b82f6" :   // blue
    score >= 40 ? "#f59e0b" :   // amber
                  "#ef4444";    // red

  return (
    <svg width="144" height="144" viewBox="0 0 144 144" className="drop-shadow-sm">
      <circle cx="72" cy="72" r={radius} fill="none" stroke="rgb(148 163 184 / 0.2)" strokeWidth="10" />
      <circle
        cx="72"
        cy="72"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${fill} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 72 72)"
        style={{ transition: "stroke-dasharray 0.4s ease-out" }}
      />
      <text x="72" y="76" textAnchor="middle" fontSize="32" fontWeight="800" fill="currentColor" className="font-display">
        {score}
      </text>
      <text x="72" y="96" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
        /100
      </text>
    </svg>
  );
}
