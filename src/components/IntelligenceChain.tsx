"use client";

import { useState } from "react";
import {
  TrendingUp,
  Users,
  Video,
  ShoppingCart,
  BarChart3,
  Brain,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EngineSignal {
  label: string;
  score: number;
  detail: string;
  trend: "up" | "down" | "stable";
  confidence: number;
}

export interface EngineBlock {
  id: string;
  name: string;
  icon: React.ElementType;
  score: number;
  status: "active" | "processing" | "inactive";
  signals: EngineSignal[];
  summary: string;
}

export interface IntelligenceProduct {
  id: string;
  title: string;
  platform: string;
  product_type: string;
  category: string;
  composite_score: number;
  engines: EngineBlock[];
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

export const MOCK_PRODUCT: IntelligenceProduct = {
  id: "prod-001",
  title: "Portable Neck Fan with LED Display",
  platform: "TikTok Shop",
  product_type: "Physical",
  category: "Electronics",
  composite_score: 84,
  engines: [
    {
      id: "social-proof",
      name: "Social Proof Engine",
      icon: Video,
      score: 89,
      status: "active",
      summary:
        "Strong viral traction with 12 videos exceeding 1M views in the past 7 days. Creator adoption accelerating.",
      signals: [
        { label: "Viral Videos (7d)", score: 89, detail: "12 videos >1M views", trend: "up", confidence: 94 },
        { label: "Creator Adoption", score: 85, detail: "47 new creators this week", trend: "up", confidence: 88 },
        { label: "Engagement Rate", score: 91, detail: "8.4% avg engagement", trend: "up", confidence: 92 },
        { label: "Hashtag Velocity", score: 82, detail: "#neckfan growing +340%", trend: "up", confidence: 86 },
      ],
    },
    {
      id: "predictive",
      name: "Predictive Trend Engine",
      icon: Brain,
      score: 86,
      status: "active",
      summary:
        "Pre-viral window detected. Search volume trajectory matches historical breakout patterns with 86% confidence.",
      signals: [
        { label: "Search Trajectory", score: 88, detail: "Matches breakout pattern P-7", trend: "up", confidence: 86 },
        { label: "Momentum Index", score: 84, detail: "Acceleration phase detected", trend: "up", confidence: 82 },
        { label: "Seasonality Fit", score: 79, detail: "Summer peak approaching", trend: "up", confidence: 90 },
        { label: "Virality Predictor", score: 92, detail: "High viral probability (92%)", trend: "up", confidence: 88 },
      ],
    },
    {
      id: "market-intel",
      name: "Market Intelligence Engine",
      icon: ShoppingCart,
      score: 78,
      status: "active",
      summary:
        "Low market saturation with growing demand. Only 23 active sellers detected across major platforms.",
      signals: [
        { label: "Seller Saturation", score: 82, detail: "23 sellers (low)", trend: "stable", confidence: 90 },
        { label: "Price Stability", score: 74, detail: "Avg price stable at £18.99", trend: "stable", confidence: 85 },
        { label: "Demand Growth", score: 81, detail: "+47% demand increase (30d)", trend: "up", confidence: 84 },
        { label: "Supply Chain Risk", score: 68, detail: "2 verified suppliers", trend: "down", confidence: 78 },
      ],
    },
    {
      id: "competitor-radar",
      name: "Competitor Radar",
      icon: Users,
      score: 72,
      status: "active",
      summary:
        "Moderate competition. 3 established sellers dominate 60% market share but new entrants gaining ground.",
      signals: [
        { label: "Top Seller Share", score: 65, detail: "Top 3 hold 60% share", trend: "down", confidence: 82 },
        { label: "New Entrants", score: 78, detail: "8 new sellers this month", trend: "up", confidence: 80 },
        { label: "Ad Spend Trend", score: 71, detail: "Competitor ad spend +22%", trend: "up", confidence: 76 },
        { label: "Review Velocity", score: 74, detail: "Avg 34 reviews/day growing", trend: "up", confidence: 84 },
      ],
    },
    {
      id: "revenue-model",
      name: "Revenue Modelling Engine",
      icon: BarChart3,
      score: 81,
      status: "active",
      summary:
        "Estimated £12,400/mo revenue potential with 42% margin at current market pricing. Break-even in 14 days.",
      signals: [
        { label: "Revenue Potential", score: 84, detail: "£12,400/mo estimated", trend: "up", confidence: 82 },
        { label: "Margin Analysis", score: 78, detail: "42% gross margin", trend: "stable", confidence: 88 },
        { label: "Break-even Speed", score: 86, detail: "14 days estimated", trend: "up", confidence: 80 },
        { label: "ROI Projection", score: 76, detail: "3.2x ROI in 90 days", trend: "up", confidence: 74 },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70
      ? "stroke-emerald-500"
      : score >= 40
        ? "stroke-amber-500"
        : "stroke-red-500";

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={4}
        className="text-muted-foreground/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className={cn(color, "transition-all duration-700")}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground text-sm font-bold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {score}
      </text>
    </svg>
  );
}

function TrendArrow({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up")
    return <TrendingUp className="size-3.5 text-emerald-500" />;
  if (trend === "down")
    return <TrendingUp className="size-3.5 text-red-500 rotate-180" />;
  return <span className="size-3.5 inline-block text-center text-muted-foreground">—</span>;
}

function SignalRow({ signal }: { signal: EngineSignal }) {
  const barColor =
    signal.score >= 70
      ? "bg-emerald-500"
      : signal.score >= 40
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-3 py-2 border-b border-[var(--surface-border)] last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{signal.label}</span>
          <TrendArrow trend={signal.trend} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{signal.detail}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", barColor)}
            style={{ width: `${signal.score}%` }}
          />
        </div>
        <span className="text-sm font-mono font-bold text-foreground w-8 text-right">
          {signal.score}
        </span>
      </div>
    </div>
  );
}

function EngineCard({ engine }: { engine: EngineBlock }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = engine.icon;

  const statusColor =
    engine.status === "active"
      ? "text-emerald-500"
      : engine.status === "processing"
        ? "text-amber-500"
        : "text-muted-foreground";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-muted">
              <Icon className="size-5 text-foreground" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{engine.name}</CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className={cn("size-3", statusColor)} />
                <span className="text-xs text-muted-foreground capitalize">{engine.status}</span>
              </div>
            </div>
          </div>
          <ScoreRing score={engine.score} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{engine.summary}</p>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center gap-1 text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide Signals" : `View ${engine.signals.length} Signals`}
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </Button>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-[var(--surface-border)]">
            {engine.signals.map((signal) => (
              <SignalRow key={signal.label} signal={signal} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Chain Visualization                                                */
/* ------------------------------------------------------------------ */

function ChainConnector() {
  return (
    <div className="flex items-center justify-center py-1">
      <div className="w-px h-6 bg-[var(--surface-border)]" />
      <Zap className="size-4 text-amber-500 absolute" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

interface IntelligenceChainProps {
  product: IntelligenceProduct;
  className?: string;
}

export function IntelligenceChain({ product, className }: IntelligenceChainProps) {
  return (
    <section className={cn("space-y-2", className)}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-lg font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Intelligence Chain
          </h2>
          <p className="text-sm text-muted-foreground">
            {product.engines.length} engines analysed {product.engines.filter((e) => e.status === "active").length} active signals
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Zap className="size-3 text-amber-500" />
          Live
        </Badge>
      </div>

      {/* Chain Flow */}
      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-[var(--surface-border)] hidden md:block" />

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {product.engines.map((engine) => (
            <EngineCard key={engine.id} engine={engine} />
          ))}
        </div>
      </div>

      {/* Chain Summary */}
      <Card className="mt-4 border-amber-500/20 bg-amber-500/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Intelligence Summary</p>
              <p className="text-sm text-muted-foreground mt-1">
                This product shows strong signals across {product.engines.filter((e) => e.score >= 70).length} of {product.engines.length} engines.
                The highest-confidence signal is Social Proof ({product.engines[0]?.score}/100).
                Key risk: Supply chain concentration with limited verified suppliers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
