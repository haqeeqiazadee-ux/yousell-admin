"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Share2,
  Download,
  Sparkles,
} from "lucide-react";
import { IntelligenceChain, MOCK_PRODUCT } from "@/components/IntelligenceChain";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Section 28.2 — Product Detail with Intelligence Chain              */
/* ------------------------------------------------------------------ */

// ── Composite Score Gauge ───────────────────────────────────────────

function CompositeScoreGauge({ score }: { score: number }) {
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const ringColor =
    score >= 70
      ? "stroke-emerald-500"
      : score >= 40
        ? "stroke-amber-500"
        : "stroke-red-500";

  const label =
    score >= 70
      ? "High Opportunity"
      : score >= 40
        ? "Moderate Opportunity"
        : "Low Opportunity";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width={size} height={size}>
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted-foreground/15"
          />
          {/* Colored arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn(ringColor, "transition-all duration-1000 ease-out")}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        {/* Score in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-5xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {score}
          </span>
          <span className="text-xs text-muted-foreground font-medium">/100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Top Signals ─────────────────────────────────────────────────────

interface TopSignal {
  engine: string;
  score: number;
  detail: string;
}

function TopSignals({ signals }: { signals: TopSignal[] }) {
  return (
    <div className="space-y-3 mt-4 w-full">
      {signals.map((s) => (
        <div key={s.engine} className="flex items-start gap-2">
          <span className="text-amber-500 shrink-0 mt-0.5">&#10022;</span>
          <div className="min-w-0">
            <span className="text-sm font-medium text-foreground">
              {s.engine}: {s.score}/100
            </span>
            <span className="text-sm text-muted-foreground"> — {s.detail}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [watched, setWatched] = useState(false);

  // Use mock product data
  const product = MOCK_PRODUCT;

  // Derive top 3 signals from engine data
  const topSignals: TopSignal[] = [
    {
      engine: "Social Proof",
      score: product.engines[0]?.score ?? 0,
      detail: "12 viral videos in 7 days",
    },
    {
      engine: "Predictive",
      score: product.engines[1]?.score ?? 0,
      detail: "Pre-viral window detected",
    },
    {
      engine: "Market Intel",
      score: product.engines[2]?.score ?? 0,
      detail: "Low saturation, growing demand",
    },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* ── 1. Breadcrumb ── */}
      <Breadcrumb
        customLabels={{
          product: "Trending Now",
          [id]: product.title,
        }}
        className="px-6 py-3"
      />

      {/* ── 2. Sticky Header ── */}
      <div
        className="sticky top-[48px] z-30 h-[60px] flex items-center gap-3 px-6 bg-[var(--color-brand-900)] border-b border-[var(--surface-border)]"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-foreground hover:bg-white/10 shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <h1
          className="text-sm font-semibold text-foreground truncate flex-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {product.title}
        </h1>

        <Badge variant="secondary" className="shrink-0 font-mono font-bold gap-1">
          {product.composite_score} <span aria-label="fire">&#128293;</span>
        </Badge>

        <Button
          variant={watched ? "default" : "outline"}
          size="sm"
          className="shrink-0 gap-1"
          onClick={() => setWatched(!watched)}
        >
          <Star className={cn("size-3.5", watched && "fill-current")} />
          {watched ? "Watching" : "Watch"}
        </Button>

        <Button variant="ghost" size="icon-sm" className="shrink-0 text-foreground">
          <Share2 className="size-3.5" />
        </Button>

        <Button variant="ghost" size="icon-sm" className="shrink-0 text-foreground">
          <Download className="size-3.5" />
        </Button>
      </div>

      {/* ── 3. Page Header (Split Layout) ── */}
      <div className="px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT — 60% */}
          <div className="lg:w-[60%] space-y-5">
            {/* Product Image Placeholder */}
            <div className="w-[200px] h-[200px] rounded-xl bg-muted flex items-center justify-center border border-[var(--surface-border)]">
              <span className="text-muted-foreground text-xs">Product Image</span>
            </div>

            {/* Title */}
            <h2
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {product.title}
            </h2>

            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{product.platform}</Badge>
              <Badge variant="outline">{product.product_type}</Badge>
              <Badge variant="secondary">{product.category}</Badge>
            </div>

            {/* Timestamps */}
            <p className="text-sm text-muted-foreground">
              First detected: 4 days ago &middot; Last updated: 12 minutes ago
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant={watched ? "default" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => setWatched(!watched)}
              >
                <Star className={cn("size-3.5", watched && "fill-current")} />
                {watched ? "Watching" : "Add to Watchlist"}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Share2 className="size-3.5" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="size-3.5" />
                Export report
              </Button>
            </div>
          </div>

          {/* RIGHT — 40% */}
          <div className="lg:w-[40%] flex flex-col items-center">
            <Card className="w-full">
              <CardContent className="flex flex-col items-center py-6">
                <CompositeScoreGauge score={product.composite_score} />
                <TopSignals signals={topSignals} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── 4. Intelligence Chain ── */}
      <div className="px-6 pb-8">
        <IntelligenceChain product={product} />
      </div>

      {/* ── 5. Bottom CTA Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-brand-900)] border-t border-[var(--surface-border)] py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-end gap-3 flex-wrap">
          <Button variant="ghost" size="sm" className="gap-1.5 text-foreground">
            <Download className="size-3.5" />
            Export to Excel
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Star className="size-3.5" />
            Add to Watchlist
          </Button>
          <Button size="sm" className="gap-1.5">
            <Sparkles className="size-3.5" />
            Generate Launch Blueprint
            <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1.5">
              Pro
            </Badge>
          </Button>
        </div>
      </div>
    </div>
  );
}
