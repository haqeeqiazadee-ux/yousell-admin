"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Section 6.1 — AI Insight Card                                      */
/* ------------------------------------------------------------------ */

export interface AIInsightCardProps {
  title?: string;
  content: string;
  confidence?: number;
  streaming?: boolean;
  onWhyClick?: () => void;
  className?: string;
}

/**
 * Resolve the right-border confidence color.
 *  >= 85  → success (green)
 *  60-84  → warning (amber)
 *  < 60   → transparent (hidden)
 */
function confidenceBorderColor(confidence: number | undefined): string {
  if (confidence === undefined) return "transparent";
  if (confidence >= 85) return "var(--color-success)";
  if (confidence >= 60) return "var(--color-warning)";
  return "transparent";
}

export function AIInsightCard({
  title,
  content,
  confidence,
  streaming = false,
  onWhyClick,
  className,
}: AIInsightCardProps) {
  return (
    <div
      className={cn("relative rounded-lg p-4", className)}
      style={{
        background: "var(--surface-card)",
        /* 4 % indigo tint overlay via gradient */
        backgroundImage:
          "linear-gradient(to bottom, rgba(99, 102, 241, 0.04), rgba(99, 102, 241, 0.04))",
        /* left accent border + right confidence border */
        borderLeft: "2px solid var(--color-ai-insight)",
        borderRight: `2px solid ${confidenceBorderColor(confidence)}`,
        borderTop: "1px solid var(--surface-border)",
        borderBottom: "1px solid var(--surface-border)",
      }}
    >
      {/* ── AI badge (top-right) ── */}
      <span
        className="absolute right-3 top-3 inline-flex items-center gap-1 select-none"
        style={{
          fontSize: "var(--text-xs)",
          lineHeight: "var(--text-xs-lh)",
          color: "var(--color-ai-insight)",
        }}
      >
        <Sparkles className="h-3 w-3" />
        AI
      </span>

      {/* ── Title ── */}
      {title && (
        <h4
          className="mb-1 pr-10 text-sm font-semibold"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {title}
        </h4>
      )}

      {/* ── Content (with optional streaming cursor) ── */}
      <p
        className={cn(
          "text-sm leading-relaxed",
          streaming && "streaming-cursor",
        )}
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-sm)",
          lineHeight: "var(--text-sm-lh)",
        }}
      >
        {content}
      </p>

      {/* ── "Why?" chip ── */}
      {onWhyClick && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onWhyClick}
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5",
              "text-xs font-medium transition-colors duration-150",
              "hover:bg-[var(--state-hover-bg)]",
              "focus-visible:outline-none",
            )}
            style={{
              color: "var(--color-ai-insight)",
              border: "1px solid var(--surface-border)",
              fontFamily: "var(--font-body)",
              boxShadow: "none",
            }}
          >
            Why?
          </button>
        </div>
      )}
    </div>
  );
}

export default AIInsightCard;
