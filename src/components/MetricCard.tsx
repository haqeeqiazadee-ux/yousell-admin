"use client";

import { type ReactNode } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Section 6.2 — KPI Metric Card                                     */
/* ------------------------------------------------------------------ */

export interface MetricCardProps {
  title: string;
  value: string | number;
  delta: number;
  deltaLabel?: string;
  sparklineData?: number[];
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  delta,
  deltaLabel,
  sparklineData,
  loading = false,
  icon,
  className,
}: MetricCardProps) {
  const isPositive = delta >= 0;
  const sparkColor = isPositive
    ? "var(--color-success)"
    : "var(--color-danger)";

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div
        className={cn(
          "rounded-lg border p-4",
          className,
        )}
        style={{
          background: "var(--surface-card)",
          borderColor: "var(--surface-border)",
        }}
      >
        {/* title skeleton */}
        <div
          className="skeleton mb-3"
          style={{ height: 14, width: "50%", borderRadius: 6 }}
        />
        {/* value skeleton */}
        <div
          className="skeleton mb-2"
          style={{ height: 36, width: "60%", borderRadius: 6 }}
        />
        {/* delta skeleton */}
        <div
          className="skeleton mb-3"
          style={{ height: 20, width: "40%", borderRadius: 9999 }}
        />
        {/* sparkline skeleton */}
        <div
          className="skeleton"
          style={{ height: 40, width: "100%", borderRadius: 6 }}
        />
      </div>
    );
  }

  /* ── Sparkline data points ── */
  const chartData = sparklineData?.map((v, i) => ({ i, v }));

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-4 transition-all duration-150",
        "hover:scale-[1.01]",
        className,
      )}
      style={{
        background: "var(--surface-card)",
        borderColor: "var(--surface-border)",
        boxShadow: "var(--shadow-card)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "var(--shadow-elevated)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "var(--shadow-card)";
      }}
    >
      {/* ── Header row ── */}
      <div className="mb-1 flex items-center justify-between">
        <span
          className="text-sm font-medium"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-neutral)",
          }}
        >
          {title}
        </span>
        {icon && (
          <span className="text-[var(--color-neutral)] opacity-60">
            {icon}
          </span>
        )}
      </div>

      {/* ── Value ── */}
      <p
        className="mb-2 text-4xl font-bold leading-tight"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-4xl)",
          lineHeight: "var(--text-4xl-lh)",
        }}
      >
        {value}
      </p>

      {/* ── Delta pill ── */}
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
          isPositive
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-red-500/15 text-red-400",
        )}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {isPositive ? "+" : ""}
        {delta.toFixed(1)}%
        {deltaLabel && (
          <span className="ml-0.5 font-normal opacity-70">{deltaLabel}</span>
        )}
      </span>

      {/* ── Sparkline ── */}
      {chartData && chartData.length > 1 && (
        <div className="mt-3" style={{ height: 40, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id={`spark-fill-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={sparkColor}
                strokeWidth={1.5}
                fill={`url(#spark-fill-${title})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default MetricCard;
