"use client";

import type { RiskLevel } from "@/types";

interface RiskScoreRingProps {
  score: number;
  level: RiskLevel;
}

const RING_COLORS: Record<RiskLevel, string> = {
  high:   "#f59e0b", // amber — high risk = warning, not destructive
  medium: "#3b82f6", // blue
  low:    "#22c55e", // green
};

const TRACK = "rgb(148 163 184 / 0.2)"; // slate-400 / 20%

/**
 * Circular SVG progress ring displaying a risk score 0–100.
 *
 * Ring color is driven by ``level``, not raw score, so the visual matches
 * the level label the backend emits (high/medium/low).
 */
export function RiskScoreRing({ score, level }: RiskScoreRingProps) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const fill = (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const color = RING_COLORS[level];

  return (
    <svg width="144" height="144" viewBox="0 0 144 144" className="drop-shadow-sm">
      <circle cx="72" cy="72" r={radius} fill="none" stroke={TRACK} strokeWidth="10" />
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
      <text
        x="72"
        y="76"
        textAnchor="middle"
        fontSize="32"
        fontWeight="800"
        fill="currentColor"
        className="font-display"
      >
        {score}
      </text>
      <text x="72" y="96" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">
        /100
      </text>
    </svg>
  );
}
