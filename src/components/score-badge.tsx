"use client";

import { cn } from "@/lib/utils";

const tierConfig = {
  hot: { label: "HOT", color: "text-red-500 border-red-500/30 bg-red-500/10" },
  warm: { label: "WARM", color: "text-orange-500 border-orange-500/30 bg-orange-500/10" },
  watch: { label: "WATCH", color: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10" },
  cold: { label: "COLD", color: "text-gray-500 border-gray-500/30 bg-gray-500/10" },
};

function getTier(score: number) {
  if (score >= 80) return "hot";
  if (score >= 60) return "warm";
  if (score >= 40) return "watch";
  return "cold";
}

export function ScoreBadge({
  score,
  size = "default",
  showTier = false,
}: {
  score: number;
  size?: "default" | "lg";
  showTier?: boolean;
}) {
  const tier = getTier(score);
  const config = tierConfig[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-md border font-mono font-bold",
        config.color,
        size === "lg"
          ? "text-lg px-2 py-1 min-w-[3rem]"
          : "text-xs px-1.5 py-0.5 min-w-[2rem]"
      )}
    >
      {score}
      {showTier && (
        <span className="text-[10px] font-sans font-medium">{config.label}</span>
      )}
    </span>
  );
}

export function TierBadge({ score }: { score: number }) {
  const tier = getTier(score);
  const config = tierConfig[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        config.color
      )}
    >
      {config.label}
    </span>
  );
}
