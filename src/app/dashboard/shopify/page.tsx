"use client";

import { useState } from "react";
import {
  Store,
  Package,
  Search,
  Eye,
  Download,
  ExternalLink,
  TrendingUp,
  Globe,
  BarChart3,
  Blocks,
  X,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { StreamingText } from "@/components/StreamingText";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

/* ------------------------------------------------------------------ */
/*  Section 28.5 — Shopify Intelligence                                 */
/* ------------------------------------------------------------------ */

/* ── TypeScript Types ── */

interface ShopifyStore {
  id: string;
  name: string;
  domain: string;
  estRevenue: string;
  topProducts: string;
  trafficEst: string;
  appsUsed: number;
  launchDate: string;
  score: number;
  aiAnalysis: string;
}

interface ShopifyProduct {
  id: string;
  name: string;
  store: string;
  price: string;
  estSalesMonth: number;
  reviews: number;
  growth30d: number;
  score: number;
}

interface AppStackItem {
  id: string;
  appName: string;
  category: string;
  storesUsing: number;
  winRate: number;
  notes: string;
}

interface TrafficIntel {
  id: string;
  store: string;
  organicPct: number;
  paidPct: number;
  socialPct: number;
  directPct: number;
  totalEstTraffic: string;
}

/* ── Mock Data ── */

const MOCK_STORES: ShopifyStore[] = [
  { id: "ss1", name: "GlowSkin Beauty", domain: "glowskinbeauty.com", estRevenue: "$340,000/mo", topProducts: "Vitamin C Serum, Retinol Cream", trafficEst: "245K/mo", appsUsed: 18, launchDate: "Mar 2023", score: 94, aiAnalysis: "GlowSkin Beauty demonstrates exceptional DTC execution. Their Vitamin C Serum drives 42% of revenue with a 3.2x ROAS on Meta ads. They use Klaviyo for email (generating 28% of revenue), Yotpo for reviews, and ReCharge for subscriptions. Their subscription rate of 34% is well above the 18% industry average. Key risk: heavy dependence on a single hero product. Recommendation: monitor their Q2 product launch calendar for expansion signals." },
  { id: "ss2", name: "TechEdge Gear", domain: "techedgegear.co", estRevenue: "$890,000/mo", topProducts: "USB-C Hub Pro, Laptop Stand X", trafficEst: "520K/mo", appsUsed: 24, launchDate: "Jan 2022", score: 91, aiAnalysis: "TechEdge Gear is a category leader in tech accessories. Their paid traffic split (45% paid, 30% organic) suggests strong unit economics. They run Shopify Plus with custom checkout. Notable: 24 apps installed including Judge.me, Gorgias, and Triple Whale. Their USB-C Hub Pro has 4,200+ reviews at 4.7 stars, indicating strong product-market fit. Growth trajectory suggests potential 7-figure monthly revenue within 2 quarters." },
  { id: "ss3", name: "PetPaws Co", domain: "petpawsco.com", estRevenue: "$210,000/mo", topProducts: "Orthopedic Dog Bed, Calming Treats", trafficEst: "180K/mo", appsUsed: 12, launchDate: "Aug 2023", score: 88, aiAnalysis: "PetPaws Co shows rapid growth in the pet niche with strong organic content strategy. Their blog drives 38% of traffic. Subscription model on calming treats yields 41% repeat purchase rate. App stack is lean at 12 apps, focusing on essentials. TikTok organic content is their strongest acquisition channel. Weakness: limited product range may cap growth at current trajectory." },
  { id: "ss4", name: "ActiveFit Pro", domain: "activefitpro.store", estRevenue: "$560,000/mo", topProducts: "Resistance Bands Set, Yoga Mat Ultra", trafficEst: "390K/mo", appsUsed: 21, launchDate: "Jun 2021", score: 86, aiAnalysis: "ActiveFit Pro operates in the competitive fitness space with solid margins. Their influencer program with 120+ micro-influencers drives 22% of revenue. They use Smile.io loyalty program with 45K enrolled members. Average order value of $67 is strong for the category. Their app stack includes Rebuy for upsells which reportedly increased AOV by 18%." },
  { id: "ss5", name: "HomeNest Living", domain: "homenestliving.com", estRevenue: "$420,000/mo", topProducts: "Bamboo Shelf Unit, Linen Cushion Set", trafficEst: "310K/mo", appsUsed: 16, launchDate: "Nov 2022", score: 84, aiAnalysis: "HomeNest Living targets the premium home decor segment with ASP of $89. Pinterest drives 19% of their traffic, unusual for the category. They use Shopify AR for product visualization which reportedly reduced returns by 23%. Strong email flows via Klaviyo generate 31% of revenue. Their Bamboo Shelf Unit went viral on TikTok in Q4 2025, driving a 340% traffic spike." },
  { id: "ss6", name: "BrewMaster Coffee", domain: "brewmaster.coffee", estRevenue: "$180,000/mo", topProducts: "Single Origin Box, Cold Brew Kit", trafficEst: "95K/mo", appsUsed: 14, launchDate: "Feb 2024", score: 82, aiAnalysis: "BrewMaster Coffee is a fast-growing DTC coffee brand with exceptional subscription metrics. 58% of customers are subscribed, with 92% 3-month retention. Their Single Origin Box has a 4.9 star rating across 890 reviews. Weakness: organic traffic is low, relying heavily on paid acquisition. Opportunity: untapped wholesale channel and Amazon expansion." },
  { id: "ss7", name: "LuxeWatch Hub", domain: "luxewatchhub.com", estRevenue: "$1,200,000/mo", topProducts: "Chronograph Classic, Minimalist Gold", trafficEst: "680K/mo", appsUsed: 28, launchDate: "Sep 2020", score: 79, aiAnalysis: "LuxeWatch Hub operates in the premium watch space with high AOV ($245). Heavy ad spend on Google Shopping drives 52% of traffic. They use Affirm for BNPL which reportedly increased conversion by 15%. Large app stack of 28 suggests potential bloat affecting site speed. PageSpeed score of 42 is below recommended threshold and may be impacting conversion rates." },
  { id: "ss8", name: "EcoWear Basics", domain: "ecowearbasics.com", estRevenue: "$290,000/mo", topProducts: "Organic Cotton Tee, Recycled Hoodie", trafficEst: "210K/mo", appsUsed: 11, launchDate: "Apr 2023", score: 77, aiAnalysis: "EcoWear Basics positions in sustainable fashion with strong brand values. Their lean app stack of 11 contributes to a fast 1.8s page load. Social proof is strong with 12K Instagram followers engaging at 4.2% rate. Weakness: limited paid advertising suggests either cash constraints or intentional organic focus. Their recycled materials story resonates well with Gen Z demographic." },
];

const MOCK_PRODUCTS: ShopifyProduct[] = [
  { id: "sp1", name: "USB-C Hub Pro 8-in-1", store: "TechEdge Gear", price: "$49.99", estSalesMonth: 4200, reviews: 4210, growth30d: 24.3, score: 95 },
  { id: "sp2", name: "Vitamin C Serum 30ml", store: "GlowSkin Beauty", price: "$34.99", estSalesMonth: 3800, reviews: 2890, growth30d: 18.7, score: 93 },
  { id: "sp3", name: "Orthopedic Dog Bed Large", store: "PetPaws Co", price: "$79.99", estSalesMonth: 1200, reviews: 1560, growth30d: 32.1, score: 91 },
  { id: "sp4", name: "Resistance Bands Set Pro", store: "ActiveFit Pro", price: "$29.99", estSalesMonth: 5600, reviews: 3420, growth30d: 12.5, score: 89 },
  { id: "sp5", name: "Bamboo Shelf Unit 5-Tier", store: "HomeNest Living", price: "$129.99", estSalesMonth: 890, reviews: 920, growth30d: 45.2, score: 87 },
  { id: "sp6", name: "Single Origin Coffee Box", store: "BrewMaster Coffee", price: "$39.99", estSalesMonth: 2100, reviews: 890, growth30d: 28.4, score: 86 },
  { id: "sp7", name: "Chronograph Classic Watch", store: "LuxeWatch Hub", price: "$249.99", estSalesMonth: 780, reviews: 1240, growth30d: 8.9, score: 83 },
  { id: "sp8", name: "Organic Cotton Tee Pack", store: "EcoWear Basics", price: "$44.99", estSalesMonth: 2400, reviews: 670, growth30d: 15.3, score: 81 },
  { id: "sp9", name: "Calming Dog Treats 90ct", store: "PetPaws Co", price: "$24.99", estSalesMonth: 3100, reviews: 1890, growth30d: 21.6, score: 88 },
  { id: "sp10", name: "Laptop Stand Ergonomic X", store: "TechEdge Gear", price: "$59.99", estSalesMonth: 1900, reviews: 2340, growth30d: 9.8, score: 84 },
];

const MOCK_APP_STACK: AppStackItem[] = [
  { id: "a1", appName: "Klaviyo", category: "Email Marketing", storesUsing: 847, winRate: 78, notes: "Most used by 6-figure stores" },
  { id: "a2", appName: "Judge.me", category: "Reviews", storesUsing: 634, winRate: 72, notes: "Preferred over Yotpo for cost efficiency" },
  { id: "a3", appName: "ReCharge", category: "Subscriptions", storesUsing: 412, winRate: 81, notes: "Dominant in consumables niche" },
  { id: "a4", appName: "Gorgias", category: "Customer Support", storesUsing: 389, winRate: 69, notes: "Strong correlation with high NPS scores" },
  { id: "a5", appName: "Triple Whale", category: "Analytics", storesUsing: 567, winRate: 74, notes: "Used by top-performing ad spenders" },
  { id: "a6", appName: "Rebuy", category: "Upsell & Cross-sell", storesUsing: 298, winRate: 83, notes: "Avg AOV increase of 18% reported" },
  { id: "a7", appName: "Smile.io", category: "Loyalty & Rewards", storesUsing: 445, winRate: 65, notes: "Higher retention in fashion vertical" },
  { id: "a8", appName: "Shogun", category: "Page Builder", storesUsing: 523, winRate: 61, notes: "Declining usage, replaced by Sections" },
  { id: "a9", appName: "Affirm", category: "BNPL", storesUsing: 234, winRate: 76, notes: "High-AOV stores see 15% conversion lift" },
  { id: "a10", appName: "Privy", category: "Pop-ups & Email Capture", storesUsing: 378, winRate: 58, notes: "Being replaced by Klaviyo forms" },
];

const MOCK_TRAFFIC: TrafficIntel[] = [
  { id: "t1", store: "GlowSkin Beauty", organicPct: 28, paidPct: 42, socialPct: 22, directPct: 8, totalEstTraffic: "245K/mo" },
  { id: "t2", store: "TechEdge Gear", organicPct: 30, paidPct: 45, socialPct: 12, directPct: 13, totalEstTraffic: "520K/mo" },
  { id: "t3", store: "PetPaws Co", organicPct: 38, paidPct: 18, socialPct: 32, directPct: 12, totalEstTraffic: "180K/mo" },
  { id: "t4", store: "ActiveFit Pro", organicPct: 25, paidPct: 35, socialPct: 28, directPct: 12, totalEstTraffic: "390K/mo" },
  { id: "t5", store: "HomeNest Living", organicPct: 22, paidPct: 30, socialPct: 34, directPct: 14, totalEstTraffic: "310K/mo" },
  { id: "t6", store: "BrewMaster Coffee", organicPct: 15, paidPct: 48, socialPct: 25, directPct: 12, totalEstTraffic: "95K/mo" },
  { id: "t7", store: "LuxeWatch Hub", organicPct: 18, paidPct: 52, socialPct: 10, directPct: 20, totalEstTraffic: "680K/mo" },
  { id: "t8", store: "EcoWear Basics", organicPct: 42, paidPct: 12, socialPct: 35, directPct: 11, totalEstTraffic: "210K/mo" },
];

/* ── Helpers ── */

function scoreColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 80) return "text-blue-400";
  if (score >= 70) return "text-amber-400";
  return "text-gray-400";
}

function scoreBg(score: number): string {
  if (score >= 90) return "bg-emerald-500/15";
  if (score >= 80) return "bg-blue-500/15";
  if (score >= 70) return "bg-amber-500/15";
  return "bg-gray-500/15";
}

function trafficBarColor(type: string): string {
  switch (type) {
    case "organic":
      return "bg-emerald-500";
    case "paid":
      return "bg-blue-500";
    case "social":
      return "bg-pink-500";
    case "direct":
      return "bg-amber-500";
    default:
      return "bg-gray-500";
  }
}

/* ================================================================== */
/*  Shopify Intelligence Page                                           */
/* ================================================================== */

export default function ShopifyIntelligencePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState<ShopifyStore | null>(null);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Shopify Intelligence
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            Last scan: 2h ago
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Scan now
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Stores Tracked"
          value="892"
          delta={4.1}
          deltaLabel="+36 this week"
          icon={<Store className="h-4 w-4" />}
          sparklineData={[70, 74, 78, 80, 84, 88, 92]}
        />
        <MetricCard
          title="New Stores Today"
          value="12"
          delta={20.0}
          deltaLabel="+4 vs yesterday"
          icon={<ArrowUpRight className="h-4 w-4" />}
          sparklineData={[6, 8, 5, 10, 7, 9, 12]}
        />
        <MetricCard
          title="Revenue Movers"
          value="67"
          delta={12.3}
          deltaLabel="significant shifts"
          icon={<TrendingUp className="h-4 w-4" />}
          sparklineData={[42, 48, 52, 55, 58, 62, 67]}
        />
        <MetricCard
          title="Apps Intelligence"
          value="234"
          delta={5.6}
          deltaLabel="apps tracked"
          icon={<Blocks className="h-4 w-4" />}
          sparklineData={[180, 190, 200, 210, 218, 226, 234]}
        />
      </div>

      {/* ── Sub-tabs ── */}
      <Tabs defaultValue={0}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value={0} className="gap-1.5">
            <Store className="h-3.5 w-3.5" />
            Stores
          </TabsTrigger>
          <TabsTrigger value={1} className="gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Products
          </TabsTrigger>
          <TabsTrigger value={2} className="gap-1.5">
            <Blocks className="h-3.5 w-3.5" />
            App Stack Analysis
          </TabsTrigger>
          <TabsTrigger value={3} className="gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Traffic Intelligence
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  TAB 1 — Stores                                               */}
        {/* ============================================================ */}
        <TabsContent value={0} className="mt-4 space-y-4">
          <div className="flex gap-4">
            {/* Store Table */}
            <div className={selectedStore ? "flex-1 min-w-0" : "w-full"}>
              {/* Filter Bar */}
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Select placeholder="Revenue Range">
                  <option value="">Revenue Range</option>
                  <option value="0-100k">$0 - $100K/mo</option>
                  <option value="100k-500k">$100K - $500K/mo</option>
                  <option value="500k+">$500K+/mo</option>
                </Select>
                <Select placeholder="Niche">
                  <option value="">Niche</option>
                  <option value="beauty">Beauty</option>
                  <option value="tech">Tech</option>
                  <option value="fashion">Fashion</option>
                  <option value="pets">Pets</option>
                  <option value="home">Home</option>
                </Select>
                <div className="relative ml-auto min-w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search stores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8"
                  />
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Store Name</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead>Est Revenue/mo</TableHead>
                        <TableHead>Top Products</TableHead>
                        <TableHead>Traffic Est</TableHead>
                        <TableHead>Apps</TableHead>
                        <TableHead>Launch</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_STORES.filter(
                        (s) =>
                          !searchQuery ||
                          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.domain.toLowerCase().includes(searchQuery.toLowerCase())
                      ).map((store) => (
                        <TableRow
                          key={store.id}
                          className="cursor-pointer"
                          onClick={() =>
                            setSelectedStore(
                              selectedStore?.id === store.id ? null : store
                            )
                          }
                          data-state={selectedStore?.id === store.id ? "selected" : undefined}
                        >
                          <TableCell className="font-medium">
                            {store.name}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-blue-500">
                              {store.domain}
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {store.estRevenue}
                          </TableCell>
                          <TableCell className="max-w-[160px] truncate text-xs text-muted-foreground">
                            {store.topProducts}
                          </TableCell>
                          <TableCell>{store.trafficEst}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{store.appsUsed}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {store.launchDate}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${scoreColor(store.score)} ${scoreBg(store.score)}`}
                            >
                              {store.score}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Detail Panel (right side) */}
            {selectedStore && (
              <div className="w-[380px] shrink-0">
                <Card className="sticky top-4">
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {selectedStore.name}
                        </h3>
                        <p className="text-sm text-blue-500">
                          {selectedStore.domain}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedStore(null)}
                        className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-md border p-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Revenue
                        </p>
                        <p className="text-sm font-bold">
                          {selectedStore.estRevenue}
                        </p>
                      </div>
                      <div className="rounded-md border p-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Traffic
                        </p>
                        <p className="text-sm font-bold">
                          {selectedStore.trafficEst}
                        </p>
                      </div>
                      <div className="rounded-md border p-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Apps Used
                        </p>
                        <p className="text-sm font-bold">
                          {selectedStore.appsUsed}
                        </p>
                      </div>
                      <div className="rounded-md border p-2.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Score
                        </p>
                        <p className="text-sm font-bold">
                          <span className={scoreColor(selectedStore.score)}>
                            {selectedStore.score}/100
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Top Products
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedStore.topProducts.split(", ").map((product) => (
                          <Badge key={product} variant="outline" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          AI Analysis
                        </span>
                      </div>
                      <StreamingText
                        text={selectedStore.aiAnalysis}
                        speed={15}
                        className="text-muted-foreground"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
                        <Eye className="h-3 w-3" />
                        Full Report
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs">
                        <ExternalLink className="h-3 w-3" />
                        Visit Store
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 2 — Products                                             */}
        {/* ============================================================ */}
        <TabsContent value={1} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Store</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Est Sales/mo</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Growth 30d</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_PRODUCTS.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <span className="text-blue-500">{product.store}</span>
                      </TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell className="font-medium">
                        {product.estSalesMonth.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {product.reviews.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            product.growth30d >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }
                        >
                          {product.growth30d >= 0 ? "+" : ""}
                          {product.growth30d}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${scoreColor(product.score)} ${scoreBg(product.score)}`}
                        >
                          {product.score}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 3 — App Stack Analysis                                    */}
        {/* ============================================================ */}
        <TabsContent value={2} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>App Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stores Using</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_APP_STACK.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">
                        {app.appName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{app.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {app.storesUsing.toLocaleString()}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          stores
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${
                                app.winRate >= 75
                                  ? "bg-emerald-500"
                                  : app.winRate >= 60
                                    ? "bg-blue-500"
                                    : "bg-amber-500"
                              }`}
                              style={{ width: `${app.winRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {app.winRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[240px] text-xs text-muted-foreground">
                        {app.notes}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                          <BarChart3 className="h-3 w-3" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 4 — Traffic Intelligence                                  */}
        {/* ============================================================ */}
        <TabsContent value={3} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Store</TableHead>
                    <TableHead>Organic %</TableHead>
                    <TableHead>Paid %</TableHead>
                    <TableHead>Social %</TableHead>
                    <TableHead>Direct %</TableHead>
                    <TableHead>Total Est Traffic</TableHead>
                    <TableHead>Breakdown</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_TRAFFIC.map((traffic) => (
                    <TableRow key={traffic.id}>
                      <TableCell className="font-medium">
                        {traffic.store}
                      </TableCell>
                      <TableCell>
                        <span className="text-emerald-500 font-medium">
                          {traffic.organicPct}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-blue-500 font-medium">
                          {traffic.paidPct}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-pink-500 font-medium">
                          {traffic.socialPct}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-amber-500 font-medium">
                          {traffic.directPct}%
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {traffic.totalEstTraffic}
                      </TableCell>
                      <TableCell>
                        <div className="flex h-2 w-32 overflow-hidden rounded-full">
                          <div
                            className={trafficBarColor("organic")}
                            style={{ width: `${traffic.organicPct}%` }}
                          />
                          <div
                            className={trafficBarColor("paid")}
                            style={{ width: `${traffic.paidPct}%` }}
                          />
                          <div
                            className={trafficBarColor("social")}
                            style={{ width: `${traffic.socialPct}%` }}
                          />
                          <div
                            className={trafficBarColor("direct")}
                            style={{ width: `${traffic.directPct}%` }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
