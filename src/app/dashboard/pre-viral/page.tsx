"use client"

import { useState, Fragment } from "react"
import {
  Activity,
  Bell,
  ChevronDown,
  ChevronRight,
  Eye,
  Flame,
  Radar,
  Target,
  TrendingUp,
  Zap,
  Sparkles,
  Info,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MetricCard } from "@/components/MetricCard"
import { StreamingText } from "@/components/StreamingText"

/* ------------------------------------------------------------------ */
/*  Section 28.6 — Pre-Viral Detection (THE MOAT)                      */
/* ------------------------------------------------------------------ */

// ── Types ──
interface SignalSource {
  source: string
  signalType: string
  strength: number
  detectedDate: string
}

interface PreViralProduct {
  id: string
  score: number
  product: string
  category: string
  signalSources: string[]
  predictedViralDate: string
  confidence: number
  status: "building" | "early" | "fading"
  signals: SignalSource[]
  aiPrediction: string
}

// ── Mock data ──
const MOCK_PRODUCTS: PreViralProduct[] = [
  {
    id: "pv-001",
    score: 94,
    product: "Magnetic Posture Corrector Belt",
    category: "Health & Wellness",
    signalSources: ["Reddit", "Pinterest", "Micro-creators"],
    predictedViralDate: "Apr 12, 2026",
    confidence: 91,
    status: "early",
    signals: [
      { source: "Reddit", signalType: "Mentions spike", strength: 88, detectedDate: "Mar 20, 2026" },
      { source: "Pinterest", signalType: "Save rate surge", strength: 76, detectedDate: "Mar 22, 2026" },
      { source: "Micro-creators", signalType: "Review volume", strength: 82, detectedDate: "Mar 21, 2026" },
      { source: "Niche forums", signalType: "Thread activity", strength: 65, detectedDate: "Mar 23, 2026" },
    ],
    aiPrediction:
      "This product is showing a classic pre-viral pattern: Reddit discussions are up 340% in health subreddits, Pinterest saves have tripled in 5 days, and 12 micro-creators posted reviews this week. Based on historical data from similar products, we predict viral breakout within 14-18 days. Recommend immediate sourcing and content preparation.",
  },
  {
    id: "pv-002",
    score: 89,
    product: "Portable UV-C Sanitizer Wand",
    category: "Electronics",
    signalSources: ["Reddit", "Niche forums"],
    predictedViralDate: "Apr 8, 2026",
    confidence: 87,
    status: "early",
    signals: [
      { source: "Reddit", signalType: "Post engagement", strength: 92, detectedDate: "Mar 18, 2026" },
      { source: "Niche forums", signalType: "Buyer intent", strength: 79, detectedDate: "Mar 19, 2026" },
      { source: "Pinterest", signalType: "Pin velocity", strength: 54, detectedDate: "Mar 24, 2026" },
      { source: "Micro-creators", signalType: "Unboxing videos", strength: 71, detectedDate: "Mar 22, 2026" },
    ],
    aiPrediction:
      "UV-C sanitizer wands are surging on Reddit's r/gadgets and r/BuyItForLife with highly engaged threads. Forum discussions indicate strong buyer intent among health-conscious consumers. Signal trajectory matches products that went viral in Q1 2025. Confidence is high for breakout within 10-14 days.",
  },
  {
    id: "pv-003",
    score: 82,
    product: "Mushroom Coffee Blend (Lion's Mane)",
    category: "Food & Beverage",
    signalSources: ["Pinterest", "Micro-creators", "Niche forums"],
    predictedViralDate: "Apr 18, 2026",
    confidence: 78,
    status: "building",
    signals: [
      { source: "Pinterest", signalType: "Board additions", strength: 85, detectedDate: "Mar 19, 2026" },
      { source: "Micro-creators", signalType: "Recipe content", strength: 73, detectedDate: "Mar 21, 2026" },
      { source: "Niche forums", signalType: "Discussion volume", strength: 68, detectedDate: "Mar 22, 2026" },
      { source: "Reddit", signalType: "Subreddit mentions", strength: 51, detectedDate: "Mar 25, 2026" },
    ],
    aiPrediction:
      "Mushroom coffee is building steady momentum on Pinterest with a 220% increase in board saves. Micro-creators in the wellness niche are producing recipe and review content. Signal is still building but trajectory is consistent with pre-viral patterns. Estimated 3-4 weeks to viral threshold.",
  },
  {
    id: "pv-004",
    score: 77,
    product: "Desk Treadmill Pad (Under-Desk)",
    category: "Fitness",
    signalSources: ["Reddit", "Pinterest"],
    predictedViralDate: "Apr 22, 2026",
    confidence: 74,
    status: "building",
    signals: [
      { source: "Reddit", signalType: "WFH threads", strength: 74, detectedDate: "Mar 20, 2026" },
      { source: "Pinterest", signalType: "Office setup pins", strength: 69, detectedDate: "Mar 23, 2026" },
      { source: "Micro-creators", signalType: "Setup tours", strength: 58, detectedDate: "Mar 25, 2026" },
      { source: "Niche forums", signalType: "Recommendations", strength: 45, detectedDate: "Mar 26, 2026" },
    ],
    aiPrediction:
      "Under-desk treadmill pads are gaining traction in WFH and productivity communities. Reddit engagement is growing steadily in r/homeoffice and r/WFH. Pinterest office setup content is incorporating this product. Signal is moderate but building consistently. Monitor for acceleration.",
  },
  {
    id: "pv-005",
    score: 71,
    product: "Smart Sleep Mask with Bluetooth",
    category: "Tech & Gadgets",
    signalSources: ["Micro-creators", "Reddit"],
    predictedViralDate: "Apr 25, 2026",
    confidence: 69,
    status: "building",
    signals: [
      { source: "Micro-creators", signalType: "Review videos", strength: 72, detectedDate: "Mar 22, 2026" },
      { source: "Reddit", signalType: "Gift guide mentions", strength: 64, detectedDate: "Mar 24, 2026" },
      { source: "Pinterest", signalType: "Wishlist saves", strength: 48, detectedDate: "Mar 26, 2026" },
      { source: "Niche forums", signalType: "Comparison threads", strength: 41, detectedDate: "Mar 27, 2026" },
    ],
    aiPrediction:
      "Smart sleep masks are receiving early attention from tech micro-creators. Reddit gift guide threads are starting to include this product. Signal is building from the creator side first, which is a pattern we see with tech gadgets. Keep monitoring for Pinterest acceleration.",
  },
  {
    id: "pv-006",
    score: 65,
    product: "Biodegradable Phone Cases",
    category: "Sustainability",
    signalSources: ["Niche forums", "Pinterest"],
    predictedViralDate: "May 2, 2026",
    confidence: 62,
    status: "building",
    signals: [
      { source: "Niche forums", signalType: "Eco discussions", strength: 68, detectedDate: "Mar 21, 2026" },
      { source: "Pinterest", signalType: "Sustainable living", strength: 61, detectedDate: "Mar 24, 2026" },
      { source: "Reddit", signalType: "r/ZeroWaste", strength: 44, detectedDate: "Mar 26, 2026" },
      { source: "Micro-creators", signalType: "Eco reviews", strength: 38, detectedDate: "Mar 27, 2026" },
    ],
    aiPrediction:
      "Biodegradable phone cases are seeing growing interest in sustainability forums and Pinterest eco-living boards. The signal is still early-stage but aligns with the growing consumer demand for sustainable alternatives. Earth Day (April 22) could be a catalyst. Watch for acceleration.",
  },
  {
    id: "pv-007",
    score: 58,
    product: "Portable Espresso Maker (12V)",
    category: "Kitchen & Outdoors",
    signalSources: ["Reddit", "Niche forums"],
    predictedViralDate: "May 8, 2026",
    confidence: 55,
    status: "building",
    signals: [
      { source: "Reddit", signalType: "Camping threads", strength: 62, detectedDate: "Mar 23, 2026" },
      { source: "Niche forums", signalType: "Van life groups", strength: 55, detectedDate: "Mar 25, 2026" },
      { source: "Micro-creators", signalType: "Travel content", strength: 34, detectedDate: "Mar 27, 2026" },
      { source: "Pinterest", signalType: "Camping boards", strength: 29, detectedDate: "Mar 27, 2026" },
    ],
    aiPrediction:
      "Portable espresso makers are picking up in camping and van life communities. Signal is early and concentrated in niche groups. As camping season approaches, this could accelerate. Currently below viral threshold but worth monitoring for spring breakout.",
  },
  {
    id: "pv-008",
    score: 42,
    product: "LED Strip Lights (App-Controlled)",
    category: "Home Decor",
    signalSources: ["Pinterest"],
    predictedViralDate: "May 15, 2026",
    confidence: 38,
    status: "fading",
    signals: [
      { source: "Pinterest", signalType: "Room decor pins", strength: 45, detectedDate: "Mar 18, 2026" },
      { source: "Micro-creators", signalType: "Room tours", strength: 32, detectedDate: "Mar 22, 2026" },
      { source: "Reddit", signalType: "r/malelivingspace", strength: 28, detectedDate: "Mar 25, 2026" },
      { source: "Niche forums", signalType: "Smart home", strength: 22, detectedDate: "Mar 27, 2026" },
    ],
    aiPrediction:
      "LED strip lights had a brief signal spike on Pinterest room decor boards but momentum is fading. This is a saturated market with many competitors. The signal pattern does not match pre-viral criteria. Recommend deprioritizing unless new differentiation signals emerge.",
  },
]

const STATUS_CONFIG = {
  building: { emoji: "\uD83D\uDFE1", label: "Building", className: "bg-yellow-500/15 text-yellow-400" },
  early: { emoji: "\uD83D\uDFE2", label: "Early", className: "bg-emerald-500/15 text-emerald-400" },
  fading: { emoji: "\uD83D\uDD34", label: "Fading", className: "bg-red-500/15 text-red-400" },
}

export default function PreViralDetectionPage() {
  const [showExplanation, setShowExplanation] = useState(true)
  const [signalStrength, setSignalStrength] = useState(50)
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const [alertsSet, setAlertsSet] = useState<Set<string>>(new Set())

  const filteredProducts = MOCK_PRODUCTS.filter((p) => p.score >= signalStrength)

  const handleSetAlert = (productId: string) => {
    setAlertsSet((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Pre-Viral Detection</h1>
            <Sparkles className="h-5 w-5 text-amber-400" />
            <span className="text-sm text-muted-foreground">AI</span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              Predictive v2.1 &middot; Accuracy: 84%
            </Badge>
            <a
              href="#"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                setShowExplanation(true)
              }}
            >
              [How this works &rarr;]
            </a>
          </div>
        </div>
      </div>

      {/* ── First-time explanation banner ── */}
      {showExplanation && (
        <div className="relative rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <button
            onClick={() => setShowExplanation(false)}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss explanation"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-300 mb-1">How Pre-Viral Detection Works</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This engine analyzes early signals from Reddit, Pinterest, niche forums, and micro-creator
                content to identify products 2-4 weeks before they go viral. By tracking engagement patterns,
                mention velocity, and cross-platform signal convergence, the AI predicts which products are
                likely to break out — giving you a critical head start on sourcing and content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Products Tracked"
          value="1,247"
          delta={12.3}
          deltaLabel="vs last week"
          sparklineData={[30, 35, 38, 42, 48, 55, 62]}
          icon={<Eye className="h-4 w-4" />}
        />
        <MetricCard
          title="Pre-Viral Signals"
          value="342"
          delta={24.7}
          deltaLabel="vs last week"
          sparklineData={[18, 22, 28, 35, 41, 52, 68]}
          icon={<Radar className="h-4 w-4" />}
        />
        <MetricCard
          title="Accuracy Rate"
          value="84%"
          delta={2.1}
          deltaLabel="vs last month"
          sparklineData={[78, 79, 80, 81, 82, 83, 84]}
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Alerts"
          value="18"
          delta={-5.2}
          deltaLabel="vs last week"
          sparklineData={[24, 22, 21, 20, 19, 18, 18]}
          icon={<Bell className="h-4 w-4" />}
        />
      </div>

      {/* ── Signal Strength Filter ── */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Signal Strength Filter</span>
            </div>
            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={100}
                value={signalStrength}
                onChange={(e) => setSignalStrength(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
            <span className="text-sm font-mono font-semibold text-blue-400 w-12 text-right">
              {signalStrength}%
            </span>
            <span className="text-xs text-muted-foreground">
              ({filteredProducts.length} products)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Pre-Viral Product Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-400" />
            Pre-Viral Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Score</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden lg:table-cell">Signal Sources</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Predicted Viral Date</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Confidence</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isExpanded = expandedProduct === product.id
                  const statusCfg = STATUS_CONFIG[product.status]
                  const hasAlert = alertsSet.has(product.id)

                  return (
                    <Fragment key={product.id}>
                      <tr
                        className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                        onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                            <span
                              className={`font-bold text-base ${
                                product.score >= 80
                                  ? "text-emerald-400"
                                  : product.score >= 60
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {product.score}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-medium">{product.product}</td>
                        <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{product.category}</td>
                        <td className="py-3 px-2 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {product.signalSources.map((src) => (
                              <Badge key={src} variant="outline" className="text-[10px] px-1.5 py-0">
                                {src}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">
                          {product.predictedViralDate}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Progress value={product.confidence} className="h-1.5 w-16" />
                            <span className="text-xs font-mono">{product.confidence}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusCfg.className}`}
                          >
                            {statusCfg.emoji} {statusCfg.label}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant={hasAlert ? "secondary" : "outline"}
                              size="xs"
                              onClick={() => handleSetAlert(product.id)}
                            >
                              <Bell className="h-3 w-3" />
                              {hasAlert ? "Alert Set" : "Set Viral Alert"}
                            </Button>
                            <Button variant="default" size="xs">
                              <Sparkles className="h-3 w-3" />
                              Generate Pre-Launch Blueprint
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Expanded Signal Breakdown ── */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-0">
                            <div className="bg-muted/20 border-b border-border px-6 py-4 space-y-4">
                              {/* Signal breakdown table */}
                              <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                  Signal Breakdown
                                </h4>
                                <div className="grid gap-2">
                                  {product.signals.map((signal, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-4 text-sm"
                                    >
                                      <span className="w-28 shrink-0 font-medium">{signal.source}</span>
                                      <span className="w-36 shrink-0 text-muted-foreground">
                                        {signal.signalType}
                                      </span>
                                      <div className="flex-1 max-w-48">
                                        <Progress
                                          value={signal.strength}
                                          className="h-2"
                                          indicatorClassName={
                                            signal.strength >= 75
                                              ? "bg-emerald-400"
                                              : signal.strength >= 50
                                              ? "bg-yellow-400"
                                              : "bg-red-400"
                                          }
                                        />
                                      </div>
                                      <span className="text-xs font-mono w-10 text-right">
                                        {signal.strength}%
                                      </span>
                                      <span className="text-xs text-muted-foreground w-28 text-right">
                                        {signal.detectedDate}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* AI Prediction */}
                              <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <Zap className="h-3 w-3 text-amber-400" />
                                  AI Prediction
                                </h4>
                                <div className="rounded-lg border border-border/50 bg-background/50 p-3">
                                  <StreamingText
                                    text={product.aiPrediction}
                                    speed={15}
                                    className="text-muted-foreground"
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      No products match the current signal strength filter. Try lowering the threshold.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

