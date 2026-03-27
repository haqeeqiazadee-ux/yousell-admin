"use client"

import { useState } from "react"
import {
  ArrowRight,
  BarChart3,
  Clock,
  Eye,
  Flame,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  TrendingUp,
  Video,
  X,
  Zap,
  ShoppingBag,
  Target,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MetricCard } from "@/components/MetricCard"
import { StreamingText } from "@/components/StreamingText"

/* ------------------------------------------------------------------ */
/*  Section 28.7 — Opportunity Feed                                    */
/* ------------------------------------------------------------------ */

// ── Types ──
interface OpportunityCard {
  id: string
  score: number
  detectedHoursAgo: number
  product: string
  imageUrl: string
  price: number
  cogsEstimate: number
  whyNow: string
  socialProof: number
  predictive: number
  marketIntel: number
  estRevenue: string
  sevenDayChange: number
  videoCount: number
  tiktokShops: number
  competitionLevel: "Low" | "Medium" | "High"
  platform: string
  category: string
}

// ── Mock data (20 products) ──
const MOCK_OPPORTUNITIES: OpportunityCard[] = [
  {
    id: "opp-001",
    score: 96,
    detectedHoursAgo: 2,
    product: "Magnetic Posture Corrector Belt",
    imageUrl: "/placeholder-product.png",
    price: 29.99,
    cogsEstimate: 6.50,
    whyNow: "Reddit mentions spiked 340% in r/posture and r/WFH this week. Pinterest saves tripled in 5 days. 12 micro-creators posted reviews. This product matches the exact signal pattern of the Neck Stretcher that went viral in Jan 2026. Market window is estimated at 14-18 days before saturation begins.",
    socialProof: 92,
    predictive: 88,
    marketIntel: 95,
    estRevenue: "$14,200/mo",
    sevenDayChange: 340,
    videoCount: 47,
    tiktokShops: 12,
    competitionLevel: "Low",
    platform: "TikTok",
    category: "Health & Wellness",
  },
  {
    id: "opp-002",
    score: 93,
    detectedHoursAgo: 3,
    product: "Portable UV-C Sanitizer Wand",
    imageUrl: "/placeholder-product.png",
    price: 34.99,
    cogsEstimate: 8.20,
    whyNow: "Strong buyer intent signals detected across Reddit r/gadgets and r/BuyItForLife. Forum discussions show 280% increase in purchase-related queries. Signal trajectory matches Q1 2025 viral electronics pattern. Early mover advantage window is 10-14 days.",
    socialProof: 87,
    predictive: 91,
    marketIntel: 89,
    estRevenue: "$11,800/mo",
    sevenDayChange: 280,
    videoCount: 34,
    tiktokShops: 8,
    competitionLevel: "Low",
    platform: "TikTok",
    category: "Electronics",
  },
  {
    id: "opp-003",
    score: 91,
    detectedHoursAgo: 1,
    product: "Mushroom Coffee Blend (Lion's Mane)",
    imageUrl: "/placeholder-product.png",
    price: 24.99,
    cogsEstimate: 5.80,
    whyNow: "Pinterest board additions up 220% in wellness and morning routine boards. Micro-creators in the health niche are producing recipe content. TikTok #mushroomcoffee has 12M views this week alone. Functional food trend is accelerating into mainstream.",
    socialProof: 85,
    predictive: 82,
    marketIntel: 90,
    estRevenue: "$9,500/mo",
    sevenDayChange: 220,
    videoCount: 89,
    tiktokShops: 15,
    competitionLevel: "Medium",
    platform: "Pinterest",
    category: "Food & Beverage",
  },
  {
    id: "opp-004",
    score: 89,
    detectedHoursAgo: 4,
    product: "Under-Desk Treadmill Pad",
    imageUrl: "/placeholder-product.png",
    price: 149.99,
    cogsEstimate: 42.00,
    whyNow: "WFH and productivity communities on Reddit showing growing interest. Pinterest office setup content incorporating this product at increasing rates. Higher price point means better margins. Spring season drives home office upgrades.",
    socialProof: 78,
    predictive: 85,
    marketIntel: 82,
    estRevenue: "$18,400/mo",
    sevenDayChange: 165,
    videoCount: 23,
    tiktokShops: 5,
    competitionLevel: "Low",
    platform: "Instagram",
    category: "Fitness",
  },
  {
    id: "opp-005",
    score: 87,
    detectedHoursAgo: 6,
    product: "Smart Sleep Mask with Bluetooth",
    imageUrl: "/placeholder-product.png",
    price: 39.99,
    cogsEstimate: 11.50,
    whyNow: "Tech micro-creators driving early awareness with review videos. Reddit gift guide threads featuring this product. Sleep optimization is a growing macro trend. Signal building from creator side first — classic tech gadget viral pattern.",
    socialProof: 72,
    predictive: 79,
    marketIntel: 86,
    estRevenue: "$8,200/mo",
    sevenDayChange: 145,
    videoCount: 31,
    tiktokShops: 9,
    competitionLevel: "Medium",
    platform: "TikTok",
    category: "Tech & Gadgets",
  },
  {
    id: "opp-006",
    score: 85,
    detectedHoursAgo: 2,
    product: "Biodegradable Phone Cases (Wheat Straw)",
    imageUrl: "/placeholder-product.png",
    price: 14.99,
    cogsEstimate: 2.80,
    whyNow: "Sustainability forums showing growing interest. Pinterest eco-living boards featuring this product. Earth Day (April 22) approaching as a major catalyst. Consumer demand for sustainable alternatives is at an all-time high according to Google Trends.",
    socialProof: 68,
    predictive: 76,
    marketIntel: 88,
    estRevenue: "$6,800/mo",
    sevenDayChange: 130,
    videoCount: 18,
    tiktokShops: 6,
    competitionLevel: "Medium",
    platform: "Pinterest",
    category: "Sustainability",
  },
  {
    id: "opp-007",
    score: 83,
    detectedHoursAgo: 5,
    product: "Portable Espresso Maker (12V Car)",
    imageUrl: "/placeholder-product.png",
    price: 54.99,
    cogsEstimate: 15.20,
    whyNow: "Camping and van life communities picking up interest. Camping season approaching in Northern Hemisphere. Signal concentrated in niche groups but cross-pollinating to mainstream outdoor content. Higher AOV opportunity.",
    socialProof: 65,
    predictive: 74,
    marketIntel: 80,
    estRevenue: "$7,400/mo",
    sevenDayChange: 110,
    videoCount: 15,
    tiktokShops: 4,
    competitionLevel: "Low",
    platform: "YouTube",
    category: "Kitchen & Outdoors",
  },
  {
    id: "opp-008",
    score: 81,
    detectedHoursAgo: 3,
    product: "Scalp Massager Shampoo Brush",
    imageUrl: "/placeholder-product.png",
    price: 9.99,
    cogsEstimate: 1.20,
    whyNow: "TikTok #scalpcare trending with 45M views this month. Low price point drives impulse purchases. Multiple micro-creators posting ASMR-style content. Self-care trend continues to drive demand in beauty accessories.",
    socialProof: 88,
    predictive: 71,
    marketIntel: 77,
    estRevenue: "$5,200/mo",
    sevenDayChange: 195,
    videoCount: 112,
    tiktokShops: 22,
    competitionLevel: "High",
    platform: "TikTok",
    category: "Beauty",
  },
  {
    id: "opp-009",
    score: 79,
    detectedHoursAgo: 8,
    product: "Foldable Laptop Stand (Aluminum)",
    imageUrl: "/placeholder-product.png",
    price: 24.99,
    cogsEstimate: 5.40,
    whyNow: "Ergonomic workspace products are seeing renewed interest as return-to-office policies increase. Reddit r/homeoffice threads showing consistent mentions. Lightweight and portable angle appeals to hybrid workers.",
    socialProof: 62,
    predictive: 70,
    marketIntel: 78,
    estRevenue: "$6,100/mo",
    sevenDayChange: 88,
    videoCount: 19,
    tiktokShops: 7,
    competitionLevel: "Medium",
    platform: "Amazon",
    category: "Tech & Gadgets",
  },
  {
    id: "opp-010",
    score: 78,
    detectedHoursAgo: 4,
    product: "Ice Roller for Face (Skincare)",
    imageUrl: "/placeholder-product.png",
    price: 12.99,
    cogsEstimate: 2.10,
    whyNow: "Skincare routine content on TikTok featuring ice rollers is accelerating. Pinterest save rates for 'morning skincare routine' boards up 180%. Low COGS and high perceived value make this a strong impulse buy candidate.",
    socialProof: 82,
    predictive: 65,
    marketIntel: 73,
    estRevenue: "$4,800/mo",
    sevenDayChange: 180,
    videoCount: 78,
    tiktokShops: 18,
    competitionLevel: "High",
    platform: "TikTok",
    category: "Beauty",
  },
  {
    id: "opp-011",
    score: 76,
    detectedHoursAgo: 7,
    product: "Reusable Silicone Food Bags",
    imageUrl: "/placeholder-product.png",
    price: 19.99,
    cogsEstimate: 4.20,
    whyNow: "Zero-waste community engagement rising. Pinterest meal prep boards increasingly featuring reusable storage. Earth Day timing creates a natural marketing window. Repeat purchase potential adds LTV value.",
    socialProof: 58,
    predictive: 72,
    marketIntel: 76,
    estRevenue: "$5,600/mo",
    sevenDayChange: 95,
    videoCount: 14,
    tiktokShops: 5,
    competitionLevel: "Medium",
    platform: "Pinterest",
    category: "Sustainability",
  },
  {
    id: "opp-012",
    score: 75,
    detectedHoursAgo: 6,
    product: "Wireless Earbuds Cleaning Kit",
    imageUrl: "/placeholder-product.png",
    price: 8.99,
    cogsEstimate: 1.50,
    whyNow: "Viral TikTok showing dirty AirPods drove 500K views. Accessory products ride the halo of parent product popularity. Ultra-low COGS with high margin potential. Perfect impulse add-on for electronics buyers.",
    socialProof: 75,
    predictive: 60,
    marketIntel: 72,
    estRevenue: "$3,400/mo",
    sevenDayChange: 250,
    videoCount: 56,
    tiktokShops: 11,
    competitionLevel: "Medium",
    platform: "TikTok",
    category: "Electronics",
  },
  {
    id: "opp-013",
    score: 73,
    detectedHoursAgo: 10,
    product: "Mini Projector (720p Portable)",
    imageUrl: "/placeholder-product.png",
    price: 69.99,
    cogsEstimate: 22.00,
    whyNow: "Outdoor movie night content trending on Instagram and Pinterest as weather warms. Higher price point product with strong margin. Seasonal timing is optimal for spring and summer entertainment content.",
    socialProof: 55,
    predictive: 68,
    marketIntel: 74,
    estRevenue: "$9,800/mo",
    sevenDayChange: 75,
    videoCount: 28,
    tiktokShops: 6,
    competitionLevel: "Medium",
    platform: "Instagram",
    category: "Electronics",
  },
  {
    id: "opp-014",
    score: 72,
    detectedHoursAgo: 5,
    product: "Desk Organizer (Bamboo Multi-Slot)",
    imageUrl: "/placeholder-product.png",
    price: 22.99,
    cogsEstimate: 6.80,
    whyNow: "Organization and desk setup content continues to perform well on TikTok and Pinterest. Spring cleaning season drives purchases. Bamboo material aligns with sustainability preferences. Good candidate for bundle strategies.",
    socialProof: 52,
    predictive: 64,
    marketIntel: 71,
    estRevenue: "$4,200/mo",
    sevenDayChange: 68,
    videoCount: 21,
    tiktokShops: 4,
    competitionLevel: "Low",
    platform: "Pinterest",
    category: "Home & Office",
  },
  {
    id: "opp-015",
    score: 71,
    detectedHoursAgo: 12,
    product: "Pet Grooming Glove",
    imageUrl: "/placeholder-product.png",
    price: 11.99,
    cogsEstimate: 1.80,
    whyNow: "Pet content dominates social media. Spring shedding season creates natural demand spike. Satisfying fur-removal videos generate strong engagement and shares. Low price point enables impulse purchases and gifting.",
    socialProof: 70,
    predictive: 55,
    marketIntel: 69,
    estRevenue: "$3,800/mo",
    sevenDayChange: 120,
    videoCount: 65,
    tiktokShops: 14,
    competitionLevel: "High",
    platform: "TikTok",
    category: "Pet Supplies",
  },
  {
    id: "opp-016",
    score: 70,
    detectedHoursAgo: 9,
    product: "Magnetic Spice Jars (Wall-Mount Set)",
    imageUrl: "/placeholder-product.png",
    price: 34.99,
    cogsEstimate: 9.50,
    whyNow: "Kitchen organization content performing well on Pinterest and Instagram. Space-saving solutions trend remains strong. Visually appealing product drives user-generated content. Good candidate for before/after transformation content.",
    socialProof: 48,
    predictive: 62,
    marketIntel: 70,
    estRevenue: "$5,100/mo",
    sevenDayChange: 58,
    videoCount: 16,
    tiktokShops: 3,
    competitionLevel: "Low",
    platform: "Pinterest",
    category: "Kitchen & Home",
  },
  {
    id: "opp-017",
    score: 68,
    detectedHoursAgo: 14,
    product: "Resistance Band Set (Fabric, 5-Pack)",
    imageUrl: "/placeholder-product.png",
    price: 19.99,
    cogsEstimate: 3.60,
    whyNow: "Home workout trend sustained post-pandemic. Spring fitness motivation drives seasonal demand. Fabric bands trending over rubber due to comfort and durability. Fitness micro-creators producing consistent content.",
    socialProof: 60,
    predictive: 52,
    marketIntel: 66,
    estRevenue: "$4,600/mo",
    sevenDayChange: 45,
    videoCount: 38,
    tiktokShops: 10,
    competitionLevel: "High",
    platform: "Instagram",
    category: "Fitness",
  },
  {
    id: "opp-018",
    score: 65,
    detectedHoursAgo: 18,
    product: "Car Phone Mount (MagSafe Compatible)",
    imageUrl: "/placeholder-product.png",
    price: 17.99,
    cogsEstimate: 3.90,
    whyNow: "MagSafe accessory ecosystem continues to grow. Car accessory content performs well on YouTube. Product addresses a genuine pain point. Cross-sell potential with other car accessories and tech gadgets.",
    socialProof: 45,
    predictive: 58,
    marketIntel: 64,
    estRevenue: "$3,200/mo",
    sevenDayChange: 35,
    videoCount: 12,
    tiktokShops: 3,
    competitionLevel: "Medium",
    platform: "YouTube",
    category: "Tech & Gadgets",
  },
  {
    id: "opp-019",
    score: 62,
    detectedHoursAgo: 20,
    product: "Insulated Water Bottle (40oz, Handle)",
    imageUrl: "/placeholder-product.png",
    price: 24.99,
    cogsEstimate: 5.90,
    whyNow: "Hydration and wellness content remains strong on TikTok. Spring and summer seasons drive water bottle purchases. Customization and color options create variety appeal. Emotional attachment marketing works well in this category.",
    socialProof: 55,
    predictive: 48,
    marketIntel: 60,
    estRevenue: "$4,400/mo",
    sevenDayChange: 28,
    videoCount: 42,
    tiktokShops: 16,
    competitionLevel: "High",
    platform: "TikTok",
    category: "Health & Wellness",
  },
  {
    id: "opp-020",
    score: 58,
    detectedHoursAgo: 24,
    product: "Acupressure Mat and Pillow Set",
    imageUrl: "/placeholder-product.png",
    price: 29.99,
    cogsEstimate: 7.20,
    whyNow: "Wellness and recovery content growing on YouTube and TikTok. Product has strong visual appeal for content creation. Pain relief and stress management messaging resonates widely. Review-driven purchase behavior fits creator marketing strategy.",
    socialProof: 42,
    predictive: 45,
    marketIntel: 58,
    estRevenue: "$3,600/mo",
    sevenDayChange: 22,
    videoCount: 19,
    tiktokShops: 5,
    competitionLevel: "Medium",
    platform: "YouTube",
    category: "Health & Wellness",
  },
]

const DEFAULT_CATEGORIES = ["Electronics", "Wellness", "Tech"]
const PRODUCT_TYPES = ["Physical", "Digital", "Print-on-Demand", "Dropship"]

export default function OpportunityFeedPage() {
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [newCategory, setNewCategory] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [minScore, setMinScore] = useState(70)
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(["Physical", "Dropship"]))
  const [visibleCount, setVisibleCount] = useState(6)
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredOpportunities = MOCK_OPPORTUNITIES.filter((o) => o.score >= minScore)
  const visibleOpportunities = filteredOpportunities.slice(0, visibleCount)
  const hasMore = visibleCount < filteredOpportunities.length

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1500)
  }

  const removeCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat))
  }

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories((prev) => [...prev, newCategory.trim()])
      setNewCategory("")
      setShowAddCategory(false)
    }
  }

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const toggleWatch = (id: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400"
    if (score >= 70) return "text-yellow-400"
    return "text-red-400"
  }

  const getCompetitionColor = (level: string) => {
    if (level === "Low") return "text-emerald-400"
    if (level === "Medium") return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your Opportunity Feed</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalised based on your category preferences and usage history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated: 5 minutes ago
          </span>
          <Button variant="default" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <Sparkles className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Opportunities"
          value={filteredOpportunities.length.toString()}
          delta={18.5}
          deltaLabel="vs last week"
          sparklineData={[12, 15, 18, 22, 25, 28, 32]}
          icon={<Zap className="h-4 w-4" />}
        />
        <MetricCard
          title="High Score (80+)"
          value={filteredOpportunities.filter((o) => o.score >= 80).length.toString()}
          delta={25.0}
          deltaLabel="vs last week"
          sparklineData={[3, 4, 5, 5, 6, 7, 8]}
          icon={<Flame className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg. Est. Revenue"
          value="$6.8K"
          delta={12.3}
          deltaLabel="vs last month"
          sparklineData={[4.2, 4.8, 5.1, 5.6, 6.0, 6.4, 6.8]}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Watchlist Items"
          value={watchlist.size.toString()}
          delta={0}
          deltaLabel="items"
          sparklineData={[0, 0, 1, 1, 2, 2, watchlist.size]}
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      {/* ── Preference Controls ── */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          {/* Category chips */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
              Followed Categories
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 text-blue-400 px-3 py-1 text-xs font-medium"
                >
                  {cat}
                  <button
                    onClick={() => removeCategory(cat)}
                    className="hover:text-blue-200 transition-colors"
                    aria-label={`Remove ${cat}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {showAddCategory ? (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCategory()}
                    placeholder="Category name..."
                    className="h-7 w-32 rounded-full border bg-transparent px-3 text-xs outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <Button variant="ghost" size="xs" onClick={addCategory}>
                    Add
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => setShowAddCategory(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            {/* Min Score slider */}
            <div className="flex-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Min Score
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="flex-1 accent-blue-500 cursor-pointer"
                />
                <span className="text-sm font-mono font-semibold text-blue-400 w-10 text-right">{minScore}</span>
              </div>
            </div>

            {/* Product Type checkboxes */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Product Type
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {PRODUCT_TYPES.map((type) => (
                  <label key={type} className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypes.has(type)}
                      onChange={() => toggleType(type)}
                      className="rounded accent-blue-500"
                    />
                    <span className="text-xs">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Opportunity Cards ── */}
      <div className="space-y-4">
        {visibleOpportunities.map((opp) => {
          const isWatched = watchlist.has(opp.id)
          const margin = opp.price - opp.cogsEstimate
          const marginPct = ((margin / opp.price) * 100).toFixed(0)

          return (
            <Card key={opp.id} className="overflow-hidden">
              <CardContent className="pt-4 space-y-4">
                {/* Score badge header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      <span className={getScoreColor(opp.score)}>
                        {opp.score >= 85 ? "HIGH OPPORTUNITY" : opp.score >= 70 ? "MODERATE OPPORTUNITY" : "WATCH"}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}&middot; Score: {opp.score}/100 &middot; Detected: {opp.detectedHoursAgo}h ago
                      </span>
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {opp.platform}
                  </Badge>
                </div>

                {/* Product info row */}
                <div className="flex gap-4">
                  {/* Product image placeholder */}
                  <div className="w-20 h-20 rounded-lg bg-muted/50 border border-border flex items-center justify-center shrink-0">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{opp.product}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-medium">${opp.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">
                        COGS: ${opp.cogsEstimate.toFixed(2)}
                      </span>
                      <span className="text-xs text-emerald-400 font-medium">
                        {marginPct}% margin
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] mt-1">
                      {opp.category}
                    </Badge>
                  </div>
                </div>

                {/* WHY NOW section */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <Zap className="h-3 w-3" />
                    WHY NOW?
                  </h4>
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                    <StreamingText
                      text={opp.whyNow}
                      speed={12}
                      className="text-muted-foreground"
                    />
                  </div>
                </div>

                {/* Key signal bars */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Social Proof</span>
                      <span className="text-xs font-mono">{opp.socialProof}%</span>
                    </div>
                    <Progress
                      value={opp.socialProof}
                      className="h-2"
                      indicatorClassName="bg-blue-400"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Predictive</span>
                      <span className="text-xs font-mono">{opp.predictive}%</span>
                    </div>
                    <Progress
                      value={opp.predictive}
                      className="h-2"
                      indicatorClassName="bg-purple-400"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Market Intel</span>
                      <span className="text-xs font-mono">{opp.marketIntel}%</span>
                    </div>
                    <Progress
                      value={opp.marketIntel}
                      className="h-2"
                      indicatorClassName="bg-emerald-400"
                    />
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Est revenue:</span>
                    <span className="font-semibold">{opp.estRevenue}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">7d change:</span>
                    <span className="font-semibold text-emerald-400">+{opp.sevenDayChange}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Video className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Videos:</span>
                    <span className="font-semibold">{opp.videoCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">TikTok shops:</span>
                    <span className="font-semibold">{opp.tiktokShops}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Competition:</span>
                    <span className={`font-semibold ${getCompetitionColor(opp.competitionLevel)}`}>
                      {opp.competitionLevel}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3.5 w-3.5" />
                    View Full Intelligence
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                  <Button variant="default" size="sm">
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate Blueprint
                  </Button>
                  <Button
                    variant={isWatched ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => toggleWatch(opp.id)}
                  >
                    <Star className={`h-3.5 w-3.5 ${isWatched ? "fill-current text-yellow-400" : ""}`} />
                    {isWatched ? "Watching" : "Watch"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setVisibleCount((prev) => Math.min(prev + 6, filteredOpportunities.length))}
            >
              <Activity className="h-4 w-4" />
              Load More Opportunities ({filteredOpportunities.length - visibleCount} remaining)
            </Button>
          </div>
        )}

        {filteredOpportunities.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No opportunities match your current filters. Try lowering the minimum score.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
