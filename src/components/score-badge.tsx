"use client";

import { cn } from "@/lib/utils";

export function ScoreBadge({
  score,
  size = "default",
}: {
  score: number;
  size?: "default" | "lg";
}) {
  const color =
    score >= 70
      ? "text-green-500 border-green-500/30 bg-green-500/10"
      : score >= 40
        ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/10"
        : "text-red-500 border-red-500/30 bg-red-500/10";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md border font-mono font-bold",
        color,
        size === "lg" ? "text-lg px-2 py-1 min-w-[3rem]" : "text-xs px-1.5 py-0.5 min-w-[2rem]"
      )}
    >
      {score}
    </span>
  );
}
