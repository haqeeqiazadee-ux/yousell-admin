"use client";

import { useState } from "react";
import {
  Megaphone,
  TrendingUp,
  PoundSterling,
  Flame,
  Play,
  Eye,
  Star,
  BarChart3,
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { AIInsightCard } from "@/components/AIInsightCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ------------------------------------------------------------------ */
/*  Section 28.9 — Ad Intelligence                                     */
/* ------------------------------------------------------------------ */

// ── Mock ad data ──
interface AdEntry {
  id: string;
  product: string;
  platform: "TikTok" | "Meta" | "YouTube";
  runningDays: number;
  estDailySpend: string;
  format: string;
  ctaText: string;
  thumbnail: string;
}

const MOCK_ADS: AdEntry[] = [
  {
    id: "ad-1",
    product: "LED Sunset Lamp",
    platform: "TikTok",
    runningDays: 12,
    estDailySpend: "\u00a3340-520",
    format: "Video \u00b7 15s",
    ctaText: "Shop Now",
    thumbnail: "bg-gradient-to-br from-orange-400 to-pink-500",
  },
  {
    id: "ad-2",
    product: "Posture Corrector Pro",
    platform: "Meta",
    runningDays: 8,
    estDailySpend: "\u00a3220-380",
    format: "Carousel \u00b7 5 slides",
    ctaText: "Learn More",
    thumbnail: "bg-gradient-to-br from-blue-400 to-indigo-500",
  },
  {
    id: "ad-3",
    product: "Portable Blender V2",
    platform: "TikTok",
    runningDays: 21,
    estDailySpend: "\u00a3500-750",
    format: "Video \u00b7 30s",
    ctaText: "Get Yours",
    thumbnail: "bg-gradient-to-br from-green-400 to-teal-500",
  },
  {
    id: "ad-4",
    product: "Smart Aroma Diffuser",
    platform: "YouTube",
    runningDays: 5,
    estDailySpend: "\u00a3180-290",
    format: "Video \u00b7 60s",
    ctaText: "Buy Now",
    thumbnail: "bg-gradient-to-br from-purple-400 to-violet-500",
  },
  {
    id: "ad-5",
    product: "Cloud Slides Ultra",
    platform: "Meta",
    runningDays: 15,
    estDailySpend: "\u00a3410-600",
    format: "Video \u00b7 15s",
    ctaText: "Shop Now",
    thumbnail: "bg-gradient-to-br from-cyan-400 to-blue-500",
  },
  {
    id: "ad-6",
    product: "Electric Scalp Massager",
    platform: "TikTok",
    runningDays: 3,
    estDailySpend: "\u00a3120-200",
    format: "Video \u00b7 10s",
    ctaText: "Try It",
    thumbnail: "bg-gradient-to-br from-rose-400 to-red-500",
  },
  {
    id: "ad-7",
    product: "Magnetic Phone Mount",
    platform: "YouTube",
    runningDays: 9,
    estDailySpend: "\u00a3260-420",
    format: "Video \u00b7 45s",
    ctaText: "Order Now",
    thumbnail: "bg-gradient-to-br from-amber-400 to-orange-500",
  },
  {
    id: "ad-8",
    product: "Mini Projector HD",
    platform: "Meta",
    runningDays: 18,
    estDailySpend: "\u00a3550-800",
    format: "Collection \u00b7 4 items",
    ctaText: "Shop Now",
    thumbnail: "bg-gradient-to-br from-slate-400 to-gray-600",
  },
];

// ── Mock scaling signals ──
interface ScalingSignal {
  id: string;
  product: string;
  platform: string;
  adsRunning: number;
  estTotalSpend: string;
  spendChange7d: string;
  status: "scaling_fast" | "growing" | "stable";
}

const MOCK_SCALING_SIGNALS: ScalingSignal[] = [
  {
    id: "ss-1",
    product: "Portable Blender V2",
    platform: "TikTok",
    adsRunning: 14,
    estTotalSpend: "\u00a312,400",
    spendChange7d: "+42%",
    status: "scaling_fast",
  },
  {
    id: "ss-2",
    product: "Mini Projector HD",
    platform: "Meta",
    adsRunning: 9,
    estTotalSpend: "\u00a39,800",
    spendChange7d: "+28%",
    status: "growing",
  },
  {
    id: "ss-3",
    product: "Cloud Slides Ultra",
    platform: "Meta",
    adsRunning: 7,
    estTotalSpend: "\u00a36,200",
    spendChange7d: "+18%",
    status: "growing",
  },
  {
    id: "ss-4",
    product: "LED Sunset Lamp",
    platform: "TikTok",
    adsRunning: 5,
    estTotalSpend: "\u00a34,100",
    spendChange7d: "+5%",
    status: "stable",
  },
  {
    id: "ss-5",
    product: "Smart Aroma Diffuser",
    platform: "YouTube",
    adsRunning: 3,
    estTotalSpend: "\u00a31,900",
    spendChange7d: "+65%",
    status: "scaling_fast",
  },
  {
    id: "ss-6",
    product: "Magnetic Phone Mount",
    platform: "YouTube",
    adsRunning: 4,
    estTotalSpend: "\u00a32,600",
    spendChange7d: "+12%",
    status: "growing",
  },
];

const STATUS_MAP: Record<
  ScalingSignal["status"],
  { label: string; icon: string; className: string }
> = {
  scaling_fast: {
    label: "Scaling Fast",
    icon: "\uD83D\uDD25",
    className: "bg-red-500/15 text-red-400",
  },
  growing: {
    label: "Growing",
    icon: "\u25B2",
    className: "bg-emerald-500/15 text-emerald-400",
  },
  stable: {
    label: "Stable",
    icon: "\u2192",
    className: "bg-blue-500/15 text-blue-400",
  },
};

const PLATFORM_BADGE_COLORS: Record<string, string> = {
  TikTok: "bg-pink-500/15 text-pink-400",
  Meta: "bg-blue-500/15 text-blue-400",
  YouTube: "bg-red-500/15 text-red-400",
};

function AdCard({ ad }: { ad: AdEntry }) {
  return (
    <Card className="overflow-hidden">
      {/* Thumbnail placeholder */}
      <div
        className={`h-40 w-full ${ad.thumbnail} flex items-center justify-center`}
      >
        <Play className="h-10 w-10 text-white/70" />
      </div>
      <CardContent className="space-y-2 pt-3">
        {/* Platform badge + running time */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${PLATFORM_BADGE_COLORS[ad.platform]}`}
          >
            {ad.platform}
          </span>
          <span className="text-xs text-muted-foreground">
            {ad.runningDays} days
          </span>
        </div>

        {/* Product name */}
        <p className="text-sm font-semibold leading-tight">{ad.product}</p>

        {/* Details */}
        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            Est. daily spend:{" "}
            <span className="font-medium text-foreground">
              {ad.estDailySpend}
            </span>
          </p>
          <p>Format: {ad.format}</p>
          <p>CTA: &quot;{ad.ctaText}&quot;</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button variant="outline" size="xs" className="flex-1">
            <Eye className="mr-1 h-3 w-3" />
            View Ad
          </Button>
          <Button variant="outline" size="xs" className="flex-1">
            <BarChart3 className="mr-1 h-3 w-3" />
            Track
          </Button>
          <Button variant="ghost" size="icon-xs">
            <Star className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdIntelligencePage() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredAds =
    activeTab === "all"
      ? MOCK_ADS
      : MOCK_ADS.filter(
          (a) =>
            a.platform.toLowerCase() ===
            (activeTab === "meta" ? "meta" : activeTab)
        );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Ad Intelligence</h1>
          <Badge variant="secondary" className="text-xs">
            Meta + TikTok + YouTube monitored
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Track competitor ad spend, creatives, and scaling signals across
          platforms.
        </p>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard
          title="Active Ads Tracked"
          value="1,234"
          delta={8.2}
          deltaLabel="vs last week"
          icon={<Megaphone className="h-4 w-4" />}
          sparklineData={[800, 920, 980, 1050, 1120, 1180, 1234]}
        />
        <MetricCard
          title="New Ads Today"
          value={56}
          delta={12.5}
          deltaLabel="vs yesterday"
          icon={<TrendingUp className="h-4 w-4" />}
          sparklineData={[32, 45, 38, 50, 42, 48, 56]}
        />
        <MetricCard
          title="Spend Estimate Today"
          value="\u00a312,400"
          delta={-3.1}
          deltaLabel="vs yesterday"
          icon={<PoundSterling className="h-4 w-4" />}
          sparklineData={[11200, 12800, 13100, 12400, 11900, 12600, 12400]}
        />
        <MetricCard
          title="Scaling Signals"
          value={23}
          delta={15.0}
          deltaLabel="vs last week"
          icon={<Flame className="h-4 w-4" />}
          sparklineData={[12, 15, 14, 18, 20, 19, 23]}
        />
      </div>

      {/* ── Platform Tabs + Ad Grid ── */}
      <Tabs
        defaultValue="all"
        onValueChange={(val) => setActiveTab(val as string)}
      >
        <TabsList>
          <TabsTrigger value="tiktok">TikTok Ads</TabsTrigger>
          <TabsTrigger value="meta">Meta/Facebook</TabsTrigger>
          <TabsTrigger value="youtube">YouTube</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {["tiktok", "meta", "youtube", "all"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(tab === "all"
                ? MOCK_ADS
                : MOCK_ADS.filter(
                    (a) =>
                      a.platform.toLowerCase() ===
                      (tab === "meta" ? "meta" : tab)
                  )
              ).map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* ── Spend Timeline ── */}
      <Card>
        <CardHeader>
          <CardTitle>Spend Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex h-64 items-center justify-center rounded-lg border border-dashed border-muted-foreground/25"
            style={{ background: "var(--surface-card)" }}
          >
            <div className="text-center">
              <BarChart3 className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                30-day line chart &mdash; Estimated total ad spend across all
                tracked competitors
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                TikTok (pink) &bull; Meta (blue) &bull; YouTube (red) &bull;
                Combined (white)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Scaling Signals Table ── */}
      <Card>
        <CardHeader>
          <CardTitle>Scaling Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Ads Running</TableHead>
                <TableHead className="text-right">Est Total Spend</TableHead>
                <TableHead className="text-right">Spend Change 7d</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SCALING_SIGNALS.map((s) => {
                const status = STATUS_MAP[s.status];
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.product}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${PLATFORM_BADGE_COLORS[s.platform] ?? ""}`}
                      >
                        {s.platform}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{s.adsRunning}</TableCell>
                    <TableCell className="text-right font-medium">
                      {s.estTotalSpend}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-400">
                      {s.spendChange7d}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}
                      >
                        {status.icon} {status.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ── AI Insight Card ── */}
      <AIInsightCard
        title="Ad Spend Intelligence"
        content="12 advertisers increased TikTok ad spend by combined \u00a38,500 this week. Portable Blender V2 shows the strongest scaling signal with 14 active creatives and a 42% spend increase. Consider monitoring this product closely for saturation signals."
        confidence={88}
      />
    </div>
  );
}
