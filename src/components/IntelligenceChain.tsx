"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { StreamingText } from "@/components/StreamingText"
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator"
import { AIInsightCard } from "@/components/AIInsightCard"
import {
  ChevronDown,
  Mail,
  Sparkles,
  BookmarkPlus,
  FileDown,
  Share2,
  TrendingUp,
  BarChart3,
  Eye,
  Play,
  ExternalLink,
} from "lucide-react"

/* ================================================================== */
/*  Section 27.2 — Universal 7-Row Intelligence Chain                  */
/*  The MOST IMPORTANT component in the entire platform.               */
/*  Shows comprehensive intelligence about a product in 7 rows.        */
/* ================================================================== */

/* ------------------------------------------------------------------ */
/*  TypeScript Interfaces                                              */
/* ------------------------------------------------------------------ */

export interface CreatorInfo {
  id: string
  name: string
  avatarUrl?: string
  followers: number
  platform: string
  matchScore: number
  lastPostedDate: string
}

export interface TikTokShop {
  id: string
  name: string
  gmvEstimate: string
  unitsPerMonth: number
  creatorCount: number
  growthRate: number
}

export interface ChannelMetrics {
  label: string
  value: string
}

export interface PlatformChannel {
  platform: string
  metrics: ChannelMetrics[]
}

export interface VideoAdItem {
  id: string
  title: string
  views: number
  engagementRate: number
  postedDate: string
  estimatedAdSpend?: string
  thumbnailUrl?: string
}

export interface EngineScore {
  name: string
  score: number
}

export interface ProductStats {
  trendScore: number
  predictiveScore: number
  estMonthlySales: string
  estRevenue: string
  sevenDayChange: number
  thirtyDayVelocity: number
  saturationRisk: string
  marginPotential: string
}

export interface OpportunityData {
  score: number
  label: string
  engines: EngineScore[]
  recommendedActions: string
}

export interface ProductEngine {
  name: string
  score: number
  detail?: string
}

export interface ProductIntelligence {
  id: string
  title: string
  imageUrl: string
  category: string
  platform: string
  firstDetectedDaysAgo: number
  freshnessStatus: "active" | "stale" | "new"
  productType: "Physical" | "Digital"
  compositeScore: number
  engineConfidence: number
  engines?: ProductEngine[]
  stats: ProductStats
  creators: CreatorInfo[]
  tiktokShops: TikTokShop[]
  channels: PlatformChannel[]
  videos: {
    tiktok: VideoAdItem[]
    tiktokAds: VideoAdItem[]
    facebookAds: VideoAdItem[]
    youtube: VideoAdItem[]
  }
  opportunity: OpportunityData
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

export const MOCK_PRODUCT: ProductIntelligence = {
  id: "prod_001",
  title: "MagSafe Wireless Charging Pad \u2014 iPhone 16 Pro Max Compatible",
  imageUrl: "/placeholder-product.png",
  category: "Electronics",
  platform: "TikTok Shop",
  firstDetectedDaysAgo: 12,
  freshnessStatus: "active",
  productType: "Physical",
  compositeScore: 84,
  engineConfidence: 92,
  engines: [
    { name: "Social Proof", score: 88, detail: "12 viral videos in 7 days" },
    { name: "Predictive", score: 79, detail: "Pre-viral window detected" },
    { name: "Market Intel", score: 82, detail: "Low saturation, growing demand" },
  ],
  stats: {
    trendScore: 87,
    predictiveScore: 79,
    estMonthlySales: "4,200",
    estRevenue: "\u00a3126,000",
    sevenDayChange: 23.4,
    thirtyDayVelocity: 156,
    saturationRisk: "Low",
    marginPotential: "High (62%)",
  },
  creators: [
    { id: "c1", name: "TechSavvySam", followers: 2400000, platform: "TikTok", matchScore: 94, lastPostedDate: "2 days ago" },
    { id: "c2", name: "GadgetGuru", followers: 890000, platform: "TikTok", matchScore: 88, lastPostedDate: "5 days ago" },
    { id: "c3", name: "UnboxDaily", followers: 156000, platform: "YouTube", matchScore: 82, lastPostedDate: "1 day ago" },
    { id: "c4", name: "DealFinderJess", followers: 67000, platform: "TikTok", matchScore: 76, lastPostedDate: "3 days ago" },
    { id: "c5", name: "SmartBuysUK", followers: 34000, platform: "Instagram", matchScore: 71, lastPostedDate: "7 days ago" },
    { id: "c6", name: "NanoReviewsLily", followers: 8500, platform: "TikTok", matchScore: 68, lastPostedDate: "1 day ago" },
  ],
  tiktokShops: [
    { id: "s1", name: "TechWave Official", gmvEstimate: "\u00a3245,000", unitsPerMonth: 3200, creatorCount: 18, growthRate: 340 },
    { id: "s2", name: "GadgetHub UK", gmvEstimate: "\u00a3178,000", unitsPerMonth: 2100, creatorCount: 12, growthRate: 120 },
    { id: "s3", name: "ChargePlus Store", gmvEstimate: "\u00a389,000", unitsPerMonth: 980, creatorCount: 6, growthRate: 85 },
    { id: "s4", name: "MagDirect", gmvEstimate: "\u00a342,000", unitsPerMonth: 450, creatorCount: 3, growthRate: 210 },
  ],
  channels: [
    {
      platform: "Amazon",
      metrics: [
        { label: "BSR", value: "#1,247" },
        { label: "Reviews", value: "2,340" },
        { label: "Est Sales", value: "8,400/mo" },
        { label: "Price Range", value: "\u00a319.99\u2013\u00a334.99" },
        { label: "Seller Count", value: "23" },
        { label: "Fulfillment", value: "FBA (78%)" },
      ],
    },
    {
      platform: "Shopify",
      metrics: [
        { label: "Store Count", value: "14" },
        { label: "Top Store", value: "ChargeNow.co" },
        { label: "Est Revenue", value: "\u00a3340K/mo" },
        { label: "Traffic", value: "120K visits/mo" },
        { label: "Apps Used", value: "Klaviyo, Privy" },
      ],
    },
    {
      platform: "eBay",
      metrics: [
        { label: "Listings", value: "89" },
        { label: "Avg Price", value: "\u00a324.99" },
        { label: "Sold (30d)", value: "1,230" },
      ],
    },
    {
      platform: "YouTube",
      metrics: [
        { label: "Review Videos", value: "34" },
        { label: "Total Views", value: "2.1M" },
        { label: "Avg Rating", value: "4.2/5" },
      ],
    },
    {
      platform: "Pinterest",
      metrics: [
        { label: "Pins", value: "560" },
        { label: "Saves", value: "12.4K" },
      ],
    },
    {
      platform: "Reddit",
      metrics: [
        { label: "Mentions", value: "47" },
        { label: "Sentiment", value: "Positive (72%)" },
      ],
    },
  ],
  videos: {
    tiktok: [
      { id: "v1", title: "This charger changed my life", views: 2400000, engagementRate: 8.4, postedDate: "3 days ago" },
      { id: "v2", title: "iPhone 16 must-have accessory", views: 1800000, engagementRate: 7.2, postedDate: "5 days ago" },
      { id: "v3", title: "MagSafe vs Qi2 comparison", views: 890000, engagementRate: 6.1, postedDate: "1 week ago" },
      { id: "v4", title: "Unboxing the viral charger", views: 560000, engagementRate: 9.3, postedDate: "2 days ago" },
    ],
    tiktokAds: [
      { id: "a1", title: "Charge faster than ever", views: 3200000, engagementRate: 4.2, postedDate: "1 day ago", estimatedAdSpend: "\u00a312,000" },
      { id: "a2", title: "Drop-proof & wireless", views: 1500000, engagementRate: 3.8, postedDate: "4 days ago", estimatedAdSpend: "\u00a38,500" },
      { id: "a3", title: "Limited time 50% off", views: 980000, engagementRate: 5.1, postedDate: "6 days ago", estimatedAdSpend: "\u00a35,200" },
      { id: "a4", title: "Why 1M people switched", views: 2100000, engagementRate: 4.7, postedDate: "2 days ago", estimatedAdSpend: "\u00a310,800" },
    ],
    facebookAds: [
      { id: "f1", title: "The #1 wireless charger 2026", views: 4500000, engagementRate: 3.1, postedDate: "2 days ago", estimatedAdSpend: "\u00a318,000" },
      { id: "f2", title: "Upgrade your desk setup", views: 2300000, engagementRate: 2.9, postedDate: "5 days ago", estimatedAdSpend: "\u00a311,500" },
      { id: "f3", title: "Perfect gift idea", views: 1200000, engagementRate: 3.4, postedDate: "1 week ago", estimatedAdSpend: "\u00a36,800" },
      { id: "f4", title: "Tech that just works", views: 890000, engagementRate: 2.7, postedDate: "3 days ago", estimatedAdSpend: "\u00a34,200" },
    ],
    youtube: [
      { id: "y1", title: "Honest MagSafe review 2026", views: 340000, engagementRate: 6.8, postedDate: "4 days ago" },
      { id: "y2", title: "Best iPhone accessories ranked", views: 890000, engagementRate: 5.4, postedDate: "1 week ago" },
      { id: "y3", title: "Is MagSafe worth it?", views: 210000, engagementRate: 7.2, postedDate: "2 days ago" },
      { id: "y4", title: "Charger tier list", views: 560000, engagementRate: 4.9, postedDate: "6 days ago" },
    ],
  },
  opportunity: {
    score: 84,
    label: "HIGH OPPORTUNITY",
    engines: [
      { name: "Market Intelligence", score: 88 },
      { name: "Predictive Analytics", score: 79 },
      { name: "Competitive Intel", score: 82 },
      { name: "Supply Chain", score: 91 },
      { name: "Social Proof", score: 87 },
      { name: "Pricing Intelligence", score: 76 },
      { name: "Risk Assessment", score: 85 },
    ],
    recommendedActions:
      "1. Source from Supplier X \u2014 12-day lead time, \u00a38.40 COGS\n2. Target: TikTok Shop + Amazon FBA simultaneously\n3. Hook angle: \"Wireless charging, iPhone 16 compatible\"\n4. Budget: \u00a3500 test recommended (low saturation)",
  },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 70) return "var(--color-success, #22c55e)"
  if (score >= 40) return "var(--color-warning, #f59e0b)"
  return "var(--color-destructive, #ef4444)"
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

function followerTier(n: number): string {
  if (n >= 1_000_000) return "Mega"
  if (n >= 100_000) return "Macro"
  if (n >= 10_000) return "Micro"
  return "Nano"
}

/* ------------------------------------------------------------------ */
/*  Row Header                                                         */
/* ------------------------------------------------------------------ */

function RowHeader({
  number,
  title,
  isOpen,
  onClick,
}: {
  number: number
  title: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:rounded-sm"
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{
            background: "var(--surface-card, hsl(var(--muted)))",
            border: "1px solid var(--surface-border, hsl(var(--border)))",
            fontFamily: "var(--font-display, inherit)",
          }}
        >
          {number}
        </span>
        <span
          className="text-sm font-semibold"
          style={{ fontFamily: "var(--font-display, inherit)" }}
        >
          {title}
        </span>
      </div>
      <ChevronDown
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Row Content Wrapper (animated expand/collapse)                     */
/* ------------------------------------------------------------------ */

function RowContent({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "grid transition-all duration-200 ease-in-out",
        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="overflow-hidden">
        <div className="pb-4">{children}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stat Item                                                          */
/* ------------------------------------------------------------------ */

function StatItem({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: "var(--surface-card, hsl(var(--card)))",
        border: "1px solid var(--surface-border, hsl(var(--border)))",
      }}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold" style={{ fontFamily: "var(--font-display, inherit)" }}>
        {value}
        {suffix && <span className="ml-1 text-xs font-normal text-muted-foreground">{suffix}</span>}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

interface IntelligenceChainProps {
  product: ProductIntelligence
  className?: string
}

export function IntelligenceChain({ product, className }: IntelligenceChainProps) {
  // Rows 1, 2, 7 expanded by default; rows 3-6 collapsed
  const [openRows, setOpenRows] = useState<Set<number>>(new Set([1, 2, 7]))
  const [creatorFilter, setCreatorFilter] = useState<string>("All")

  const toggleRow = (row: number) => {
    setOpenRows((prev) => {
      const next = new Set(prev)
      if (next.has(row)) next.delete(row)
      else next.add(row)
      return next
    })
  }

  const isOpen = (row: number) => openRows.has(row)

  // Filter creators by tier
  const filteredCreators = product.creators.filter((c) => {
    if (creatorFilter === "All") return true
    return followerTier(c.followers) === creatorFilter
  })

  const filterPills = [
    { label: "All", key: "All" },
    { label: "Mega >1M", key: "Mega" },
    { label: "Macro 100K-1M", key: "Macro" },
    { label: "Micro 10K-100K", key: "Micro" },
    { label: "Nano <10K", key: "Nano" },
  ]

  return (
    <div className={cn("w-full", className)}>

      {/* ============================================================ */}
      {/* ROW 1 — PRODUCT IDENTITY (always expanded)                    */}
      {/* ============================================================ */}
      <div style={{ borderBottom: "1px solid var(--surface-border, hsl(var(--border)))" }}>
        <RowHeader number={1} title="Product Identity" isOpen={isOpen(1)} onClick={() => toggleRow(1)} />
        <RowContent isOpen={isOpen(1)}>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            {/* Product image */}
            <div
              className="relative size-[120px] shrink-0 overflow-hidden rounded-lg"
              style={{ background: "var(--surface-card, hsl(var(--muted)))" }}
            >
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <Eye className="size-8" />
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="flex-1 space-y-3">
              <h2
                className="text-2xl font-bold leading-tight"
                style={{ fontFamily: "var(--font-display, inherit)" }}
              >
                {product.title}
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline">{product.platform}</Badge>
                <Badge variant={product.productType === "Digital" ? "secondary" : "outline"}>
                  {product.productType}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>First detected: {product.firstDetectedDaysAgo} days ago</span>
                <span className="inline-flex items-center gap-1">
                  Freshness:{" "}
                  {product.freshnessStatus === "active" && "\uD83D\uDFE2 Active"}
                  {product.freshnessStatus === "new" && "\uD83D\uDFE1 New"}
                  {product.freshnessStatus === "stale" && "\uD83D\uDD34 Stale"}
                </span>
              </div>

              {/* Composite Score */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Composite Score:{" "}
                    <span className="font-bold" style={{ color: scoreColor(product.compositeScore) }}>
                      {product.compositeScore}/100
                    </span>
                  </span>
                  <ConfidenceIndicator confidence={product.engineConfidence} size="md" />
                </div>
                <Progress
                  value={product.compositeScore}
                  className="h-2"
                  indicatorClassName={cn(
                    product.compositeScore >= 70 && "bg-green-500",
                    product.compositeScore >= 40 && product.compositeScore < 70 && "bg-amber-500",
                    product.compositeScore < 40 && "bg-red-500"
                  )}
                />
                <p className="text-xs text-muted-foreground">
                  Engine confidence: {product.engineConfidence}%
                </p>
              </div>
            </div>
          </div>
        </RowContent>
      </div>

      {/* ============================================================ */}
      {/* ROW 2 — PRODUCT STATS (expanded, 4 tabs)                      */}
      {/* ============================================================ */}
      <div style={{ borderBottom: "1px solid var(--surface-border, hsl(var(--border)))" }}>
        <RowHeader number={2} title="Product Stats" isOpen={isOpen(2)} onClick={() => toggleRow(2)} />
        <RowContent isOpen={isOpen(2)}>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trend">Trend</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="forecast">Forecast</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatItem label="Trend Score" value={product.stats.trendScore} suffix="/100" />
                <StatItem label="Predictive Score" value={product.stats.predictiveScore} suffix="/100" />
                <StatItem label="Est Monthly Sales" value={product.stats.estMonthlySales} />
                <StatItem label="Est Revenue" value={product.stats.estRevenue} />
                <StatItem label="7d Change" value={`+${product.stats.sevenDayChange}%`} />
                <StatItem label="30d Velocity" value={product.stats.thirtyDayVelocity} suffix="units/day" />
                <StatItem label="Saturation Risk" value={product.stats.saturationRisk} />
                <StatItem label="Margin Potential" value={product.stats.marginPotential} />
              </div>
            </TabsContent>

            <TabsContent value="trend">
              <div
                className="mt-3 flex h-48 items-center justify-center rounded-lg text-sm text-muted-foreground"
                style={{
                  background: "var(--surface-card, hsl(var(--muted)))",
                  border: "1px solid var(--surface-border, hsl(var(--border)))",
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp className="size-8 opacity-40" />
                  <span>90-day trend chart with prediction band</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sales">
              <div
                className="mt-3 flex h-48 items-center justify-center rounded-lg text-sm text-muted-foreground"
                style={{
                  background: "var(--surface-card, hsl(var(--muted)))",
                  border: "1px solid var(--surface-border, hsl(var(--border)))",
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="size-8 opacity-40" />
                  <span>Estimated sales volume by platform</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="forecast">
              <div
                className="mt-3 flex h-48 items-center justify-center rounded-lg text-sm text-muted-foreground"
                style={{
                  background: "var(--surface-card, hsl(var(--muted)))",
                  border: "1px solid var(--surface-border, hsl(var(--border)))",
                }}
              >
                <div className="flex flex-col items-center gap-2">
                  <BarChart3 className="size-8 opacity-40" />
                  <span>30/60/90-day forecast with confidence bands</span>
                  <Badge variant="secondary" className="gap-1">
                    <Sparkles className="size-3" />
                    AI Powered
                  </Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </RowContent>
      </div>

      {/* ============================================================ */}
      {/* ROW 3 — RELATED INFLUENCERS (collapsed)                       */}
      {/* ============================================================ */}
      <div style={{ borderBottom: "1px solid var(--surface-border, hsl(var(--border)))" }}>
        <RowHeader number={3} title="Related Influencers" isOpen={isOpen(3)} onClick={() => toggleRow(3)} />
        <RowContent isOpen={isOpen(3)}>
          {/* Filter pills */}
          <div className="mb-3 flex flex-wrap gap-2">
            {filterPills.map((pill) => (
              <button
                key={pill.key}
                type="button"
                onClick={() => setCreatorFilter(pill.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  creatorFilter === pill.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Horizontal scroll of creator cards */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="flex w-52 shrink-0 flex-col gap-2 rounded-lg p-3"
                style={{
                  background: "var(--surface-card, hsl(var(--card)))",
                  border: "1px solid var(--surface-border, hsl(var(--border)))",
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar circle */}
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase"
                    style={{
                      background: "var(--surface-card, hsl(var(--muted)))",
                      border: "2px solid var(--surface-border, hsl(var(--border)))",
                    }}
                  >
                    {creator.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{creator.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFollowers(creator.followers)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {creator.platform}
                  </Badge>
                  <span
                    className="text-xs font-bold"
                    style={{ color: scoreColor(creator.matchScore) }}
                  >
                    {creator.matchScore}% match
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground">Last posted: {creator.lastPostedDate}</p>

                <Button variant="outline" size="xs" className="mt-auto w-full gap-1">
                  <Mail className="size-3" />
                  Contact
                </Button>
              </div>
            ))}
          </div>
        </RowContent>
      </div>

      {/* ============================================================ */}
      {/* ROW 4 — TIKTOK SHOPS (collapsed)                              */}
      {/* ============================================================ */}
      <div style={{ borderBottom: "1px solid var(--surface-border, hsl(var(--border)))" }}>
        <RowHeader number={4} title="TikTok Shops" isOpen={isOpen(4)} onClick={() => toggleRow(4)} />
        <RowContent isOpen={isOpen(4)}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b text-left text-xs text-muted-foreground"
                  style={{ borderColor: "var(--surface-border, hsl(var(--border)))" }}
                >
                  <th className="pb-2 pr-4 font-medium">Shop Name</th>
                  <th className="pb-2 pr-4 font-medium">GMV Est</th>
                  <th className="pb-2 pr-4 font-medium">Units/Month</th>
                  <th className="pb-2 pr-4 font-medium">Creator Count</th>
                  <th className="pb-2 pr-4 font-medium">Growth Rate</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {product.tiktokShops.map((shop) => (
                  <tr
                    key={shop.id}
                    className="border-b"
                    style={{ borderColor: "var(--surface-border, hsl(var(--border)))" }}
                  >
                    <td className="py-2.5 pr-4 font-medium">{shop.name}</td>
                    <td className="py-2.5 pr-4">{shop.gmvEstimate}</td>
                    <td className="py-2.5 pr-4">{shop.unitsPerMonth.toLocaleString()}</td>
                    <td className="py-2.5 pr-4">{shop.creatorCount}</td>
                    <td className="py-2.5 pr-4">
                      <span className="text-green-500">+{shop.growthRate}%</span>
                    </td>
                    <td className="py-2.5">
                      <Button variant="ghost" size="xs" className="gap-1">
                        <ExternalLink className="size-3" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3">
            <AIInsightCard
              content="This shop's GMV grew 340% in 30 days \u2014 early mover advantage detected. Recommend immediate action to capture market share."
              confidence={88}
            />
          </div>
        </RowContent>
      </div>

      {/* ============================================================ */}
      {/* ROW 5 — OTHER CHANNELS (collapsed)                            */}
      {/* ============================================================ */}
      <div style={{ borderBottom: "1px solid var(--surface-border, hsl(var(--border)))" }}>
        <RowHeader number={5} title="Other Channels" isOpen={isOpen(5)} onClick={() => toggleRow(5)} />
        <RowContent isOpen={isOpen(5)}>
          <div className="space-y-4">
            {product.channels.map((channel) => (
              <div key={channel.platform}>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{channel.platform}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  {channel.metrics.map((metric) => (
                    <div
                      key={metric.label}
                      className="rounded-md p-2.5"
                      style={{
                        background: "var(--surface-card, hsl(var(--card)))",
                        border: "1px solid var(--surface-border, hsl(var(--border)))",
                      }}
                    >
                      <p className="text-[11px] text-muted-foreground">{metric.label}</p>
                      <p className="mt-0.5 text-sm font-semibold">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </RowContent>
      </div>

      {/* ============================================================ */}
      {/* ROW 6 — VIRAL VIDEOS & ADS (collapsed)                        */}
      {/* ============================================================ */}
      <div style={{ borderBottom: "1px solid var(--surface-border, hsl(var(--border)))" }}>
        <RowHeader number={6} title="Viral Videos & Ads" isOpen={isOpen(6)} onClick={() => toggleRow(6)} />
        <RowContent isOpen={isOpen(6)}>
          <Tabs defaultValue="tiktok">
            <TabsList>
              <TabsTrigger value="tiktok">TikTok Videos</TabsTrigger>
              <TabsTrigger value="tiktokAds">TikTok Ads</TabsTrigger>
              <TabsTrigger value="facebookAds">Facebook/Meta Ads</TabsTrigger>
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
            </TabsList>

            {(["tiktok", "tiktokAds", "facebookAds", "youtube"] as const).map((tabKey) => (
              <TabsContent key={tabKey} value={tabKey}>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {product.videos[tabKey].map((item) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-lg"
                      style={{
                        background: "var(--surface-card, hsl(var(--card)))",
                        border: "1px solid var(--surface-border, hsl(var(--border)))",
                      }}
                    >
                      {/* Thumbnail placeholder */}
                      <div
                        className="flex h-28 items-center justify-center"
                        style={{ background: "var(--surface-card, hsl(var(--muted)))" }}
                      >
                        <Play className="size-8 text-muted-foreground opacity-40" />
                      </div>
                      <div className="space-y-1 p-3">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatViews(item.views)} views</span>
                          <span>{item.engagementRate}% ER</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{item.postedDate}</p>
                        {item.estimatedAdSpend && (
                          <p className="text-[11px] font-medium text-amber-500">
                            Est spend: {item.estimatedAdSpend}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {(tabKey === "tiktokAds" || tabKey === "facebookAds") && (
                  <div className="mt-3">
                    <AIInsightCard
                      content="3 new ads started running \u2014 competitor scaling detected. Monitor spend patterns for market entry timing."
                      confidence={82}
                    />
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </RowContent>
      </div>

      {/* ============================================================ */}
      {/* ROW 7 — OPPORTUNITY SCORE & ACTION PLAN (expanded)            */}
      {/* ============================================================ */}
      <div style={{ borderBottom: "1px solid var(--surface-border, hsl(var(--border)))" }}>
        <RowHeader
          number={7}
          title="Opportunity Score & Action Plan"
          isOpen={isOpen(7)}
          onClick={() => toggleRow(7)}
        />
        <RowContent isOpen={isOpen(7)}>
          {/* Large score display */}
          <div className="mb-6 text-center">
            <p
              className="text-3xl font-bold"
              style={{ fontFamily: "var(--font-display, inherit)" }}
            >
              <span style={{ color: scoreColor(product.opportunity.score) }}>
                {product.opportunity.score}/100
              </span>{" "}
              {product.opportunity.score >= 70
                ? "\uD83D\uDD25"
                : product.opportunity.score >= 40
                  ? "\u26A0\uFE0F"
                  : "\u274C"}{" "}
              <span className="text-xl">{product.opportunity.label}</span>
            </p>
          </div>

          {/* Engine breakdown bars (7 engines) */}
          <div className="mb-6 space-y-3">
            {product.opportunity.engines.map((engine) => (
              <div key={engine.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{engine.name}</span>
                  <span className="font-semibold" style={{ color: scoreColor(engine.score) }}>
                    {engine.score}
                  </span>
                </div>
                <Progress
                  value={engine.score}
                  className="h-1.5"
                  indicatorClassName={cn(
                    engine.score >= 70 && "bg-green-500",
                    engine.score >= 40 && engine.score < 70 && "bg-amber-500",
                    engine.score < 40 && "bg-red-500"
                  )}
                />
              </div>
            ))}
          </div>

          {/* AI Recommended Actions */}
          <div
            className="mb-4 rounded-lg p-4"
            style={{
              background: "var(--surface-card, hsl(var(--card)))",
              border: "1px solid var(--surface-border, hsl(var(--border)))",
            }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="size-4" style={{ color: "var(--color-ai-insight, #6366f1)" }} />
              <h4 className="text-sm font-semibold">AI Recommended Actions</h4>
            </div>
            <StreamingText text={product.opportunity.recommendedActions} speed={20} />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button className="gap-1.5">
              <Sparkles className="size-3.5" />
              Generate Full Launch Blueprint
            </Button>
            <Button variant="outline" className="gap-1.5">
              <BookmarkPlus className="size-3.5" />
              Add to Watchlist
            </Button>
            <Button variant="outline" className="gap-1.5">
              <FileDown className="size-3.5" />
              Export to Excel
            </Button>
            <Button variant="outline" className="gap-1.5">
              <Share2 className="size-3.5" />
              Share product
            </Button>
          </div>
        </RowContent>
      </div>
    </div>
  )
}

export default IntelligenceChain
