"use client";

import { useState } from "react";
import {
  Package,
  TrendingUp,
  Users,
  Store,
  Search,
  Star,
  Eye,
  Download,
  Play,
  ExternalLink,
  ShoppingBag,
  Megaphone,
  X,
  ChevronDown,
  ScanSearch,
  GitCompare,
  ListPlus,
  FileDown,
  Wand2,
  Clock,
  DollarSign,
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { AIInsightCard } from "@/components/AIInsightCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
/*  Section 28.3 — TikTok Intelligence                                 */
/* ------------------------------------------------------------------ */

/* ── TypeScript Types ── */

interface TikTokProduct {
  id: string;
  score: number;
  image: string;
  title: string;
  category: string;
  estSales: string;
  change7d: number;
  videos: number;
}

interface TrendingVideo {
  id: string;
  thumbnail: string;
  views: string;
  productName: string;
  creatorHandle: string;
  postedDate: string;
}

interface TikTokShop {
  id: string;
  name: string;
  products: number;
  estGmvMonth: string;
  topProduct: string;
  growth30d: number;
  creatorPartners: number;
}

interface Creator {
  id: string;
  avatar: string;
  handle: string;
  followers: string;
  platform: string;
  niche: string;
  matchScore: number;
  productsPromoting: number;
}

interface TikTokAd {
  id: string;
  thumbnail: string;
  platformBadge: string;
  runningTime: string;
  estDailySpend: string;
  productName: string;
}

/* ── Mock Data ── */

const MOCK_PRODUCTS: TikTokProduct[] = [
  { id: "p1", score: 94, image: "", title: "LED Cloud Light Lamp", category: "Home & Decor", estSales: "£12,400", change7d: 34.2, videos: 312 },
  { id: "p2", score: 91, image: "", title: "Portable Neck Fan 2.0", category: "Electronics", estSales: "£9,800", change7d: 28.5, videos: 245 },
  { id: "p3", score: 89, image: "", title: "Magnetic Phone Mount Ring", category: "Accessories", estSales: "£7,200", change7d: 19.8, videos: 189 },
  { id: "p4", score: 87, image: "", title: "Self-Heating Coffee Mug", category: "Kitchen", estSales: "£6,500", change7d: 15.3, videos: 167 },
  { id: "p5", score: 85, image: "", title: "Mini Projector HD 1080p", category: "Electronics", estSales: "£18,900", change7d: 12.1, videos: 420 },
  { id: "p6", score: 82, image: "", title: "Silicone Scalp Massager", category: "Beauty", estSales: "£4,300", change7d: -3.2, videos: 98 },
  { id: "p7", score: 80, image: "", title: "Foldable Laptop Stand", category: "Office", estSales: "£5,100", change7d: 8.7, videos: 134 },
  { id: "p8", score: 78, image: "", title: "Reusable Water Bottle UV-C", category: "Health", estSales: "£3,900", change7d: 22.4, videos: 76 },
  { id: "p9", score: 75, image: "", title: "Wireless Earbuds Pro Max", category: "Electronics", estSales: "£14,200", change7d: -1.5, videos: 380 },
  { id: "p10", score: 72, image: "", title: "Bamboo Cutlery Travel Set", category: "Eco", estSales: "£2,100", change7d: 5.6, videos: 54 },
];

const MOCK_VIDEOS: TrendingVideo[] = [
  { id: "v1", thumbnail: "", views: "2.3M views", productName: "LED Cloud Light Lamp", creatorHandle: "@homevibes_uk", postedDate: "2 hours ago" },
  { id: "v2", thumbnail: "", views: "1.8M views", productName: "Portable Neck Fan 2.0", creatorHandle: "@techfinds", postedDate: "5 hours ago" },
  { id: "v3", thumbnail: "", views: "1.2M views", productName: "Mini Projector HD 1080p", creatorHandle: "@gadgetguru", postedDate: "8 hours ago" },
  { id: "v4", thumbnail: "", views: "980K views", productName: "Self-Heating Coffee Mug", creatorHandle: "@morningroutine", postedDate: "12 hours ago" },
  { id: "v5", thumbnail: "", views: "750K views", productName: "Magnetic Phone Mount Ring", creatorHandle: "@drivehacks", postedDate: "1 day ago" },
  { id: "v6", thumbnail: "", views: "620K views", productName: "Silicone Scalp Massager", creatorHandle: "@selfcareclub", postedDate: "1 day ago" },
  { id: "v7", thumbnail: "", views: "540K views", productName: "Foldable Laptop Stand", creatorHandle: "@wfh_setup", postedDate: "2 days ago" },
  { id: "v8", thumbnail: "", views: "410K views", productName: "Reusable Water Bottle UV-C", creatorHandle: "@ecowarrior", postedDate: "2 days ago" },
  { id: "v9", thumbnail: "", views: "380K views", productName: "Wireless Earbuds Pro Max", creatorHandle: "@audiophile_uk", postedDate: "3 days ago" },
];

const MOCK_SHOPS: TikTokShop[] = [
  { id: "s1", name: "TrendyHome UK", products: 124, estGmvMonth: "£89,000", topProduct: "LED Cloud Light Lamp", growth30d: 42.3, creatorPartners: 18 },
  { id: "s2", name: "GadgetWorld", products: 89, estGmvMonth: "£67,500", topProduct: "Mini Projector HD 1080p", growth30d: 31.2, creatorPartners: 12 },
  { id: "s3", name: "BeautyFinds Official", products: 67, estGmvMonth: "£45,200", topProduct: "Silicone Scalp Massager", growth30d: 18.7, creatorPartners: 24 },
  { id: "s4", name: "EcoLiving Store", products: 43, estGmvMonth: "£23,100", topProduct: "Bamboo Cutlery Travel Set", growth30d: 12.5, creatorPartners: 8 },
  { id: "s5", name: "TechDirect Shop", products: 156, estGmvMonth: "£112,400", topProduct: "Wireless Earbuds Pro Max", growth30d: -2.1, creatorPartners: 31 },
  { id: "s6", name: "HomeEssentials", products: 78, estGmvMonth: "£34,800", topProduct: "Self-Heating Coffee Mug", growth30d: 25.6, creatorPartners: 14 },
];

const MOCK_CREATORS: Creator[] = [
  { id: "c1", avatar: "", handle: "@homevibes_uk", followers: "2.4M", platform: "TikTok", niche: "Home & Decor", matchScore: 96, productsPromoting: 12 },
  { id: "c2", avatar: "", handle: "@techfinds", followers: "1.8M", platform: "TikTok", niche: "Tech", matchScore: 93, productsPromoting: 8 },
  { id: "c3", avatar: "", handle: "@gadgetguru", followers: "3.1M", platform: "TikTok + IG", niche: "Electronics", matchScore: 91, productsPromoting: 15 },
  { id: "c4", avatar: "", handle: "@selfcareclub", followers: "890K", platform: "TikTok", niche: "Beauty", matchScore: 88, productsPromoting: 6 },
  { id: "c5", avatar: "", handle: "@morningroutine", followers: "1.2M", platform: "TikTok + YT", niche: "Lifestyle", matchScore: 85, productsPromoting: 10 },
  { id: "c6", avatar: "", handle: "@ecowarrior", followers: "560K", platform: "TikTok", niche: "Eco & Sustainability", matchScore: 82, productsPromoting: 4 },
  { id: "c7", avatar: "", handle: "@wfh_setup", followers: "740K", platform: "TikTok + IG", niche: "Office", matchScore: 79, productsPromoting: 7 },
];

const MOCK_ADS: TikTokAd[] = [
  { id: "a1", thumbnail: "", platformBadge: "TikTok", runningTime: "14 days", estDailySpend: "£320", productName: "LED Cloud Light Lamp" },
  { id: "a2", thumbnail: "", platformBadge: "TikTok", runningTime: "7 days", estDailySpend: "£540", productName: "Mini Projector HD 1080p" },
  { id: "a3", thumbnail: "", platformBadge: "TikTok", runningTime: "21 days", estDailySpend: "£180", productName: "Portable Neck Fan 2.0" },
  { id: "a4", thumbnail: "", platformBadge: "TikTok", runningTime: "3 days", estDailySpend: "£890", productName: "Wireless Earbuds Pro Max" },
  { id: "a5", thumbnail: "", platformBadge: "TikTok", runningTime: "10 days", estDailySpend: "£250", productName: "Self-Heating Coffee Mug" },
  { id: "a6", thumbnail: "", platformBadge: "TikTok", runningTime: "5 days", estDailySpend: "£420", productName: "Magnetic Phone Mount Ring" },
  { id: "a7", thumbnail: "", platformBadge: "TikTok", runningTime: "18 days", estDailySpend: "£150", productName: "Silicone Scalp Massager" },
  { id: "a8", thumbnail: "", platformBadge: "TikTok", runningTime: "12 days", estDailySpend: "£275", productName: "Foldable Laptop Stand" },
  { id: "a9", thumbnail: "", platformBadge: "TikTok", runningTime: "8 days", estDailySpend: "£610", productName: "Reusable Water Bottle UV-C" },
];

/* ── Score color helper ── */

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

/* ================================================================== */
/*  TikTok Intelligence Page                                           */
/* ================================================================== */

export default function TikTokIntelligencePage() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [productInsightDismissed, setProductInsightDismissed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Row selection helpers ── */
  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllRows = () => {
    if (selectedRows.size === MOCK_PRODUCTS.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(MOCK_PRODUCTS.map((p) => p.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            TikTok Intelligence
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            Last scan: 12 minutes ago
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <ScanSearch className="h-4 w-4" />
            Run manual scan
            <Badge variant="secondary" className="ml-1 text-[10px]">
              Pro
            </Badge>
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export current view
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Products"
          value="2,341"
          delta={2.1}
          deltaLabel="+47 today"
          icon={<Package className="h-4 w-4" />}
          sparklineData={[18, 22, 19, 25, 30, 28, 34]}
        />
        <MetricCard
          title="Viral Videos"
          value="847"
          delta={2.8}
          deltaLabel="+23 today"
          icon={<Play className="h-4 w-4" />}
          sparklineData={[12, 15, 14, 18, 21, 20, 23]}
        />
        <MetricCard
          title="Creators"
          value="1,205"
          delta={0.7}
          deltaLabel="+8 today"
          icon={<Users className="h-4 w-4" />}
          sparklineData={[40, 42, 41, 43, 44, 43, 45]}
        />
        <MetricCard
          title="TikTok Shops"
          value="412"
          delta={1.2}
          deltaLabel="+5 today"
          icon={<Store className="h-4 w-4" />}
          sparklineData={[30, 31, 32, 33, 34, 35, 37]}
        />
      </div>

      {/* ── Sub-tabs ── */}
      <Tabs defaultValue={0}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value={0} className="gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Products
          </TabsTrigger>
          <TabsTrigger value={1} className="gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Trending Videos
          </TabsTrigger>
          <TabsTrigger value={2} className="gap-1.5">
            <Store className="h-3.5 w-3.5" />
            TikTok Shops
          </TabsTrigger>
          <TabsTrigger value={3} className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Creators
          </TabsTrigger>
          <TabsTrigger value={4} className="gap-1.5">
            <Megaphone className="h-3.5 w-3.5" />
            Ads
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  TAB 1 — Products                                             */}
        {/* ============================================================ */}
        <TabsContent value={0} className="mt-4 space-y-4">
          {/* Sticky Filter Bar */}
          <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-lg border bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Select placeholder="Category">
              <option value="">Category</option>
              <option value="electronics">Electronics</option>
              <option value="beauty">Beauty</option>
              <option value="home">Home & Decor</option>
              <option value="kitchen">Kitchen</option>
            </Select>
            <Select placeholder="Score">
              <option value="">Score</option>
              <option value="90">90+</option>
              <option value="80">80+</option>
              <option value="70">70+</option>
            </Select>
            <Select placeholder="Trend Period">
              <option value="">Trend Period</option>
              <option value="7d">7 days</option>
              <option value="14d">14 days</option>
              <option value="30d">30 days</option>
            </Select>
            <Select placeholder="Product Type">
              <option value="">Product Type</option>
              <option value="physical">Physical</option>
              <option value="digital">Digital</option>
            </Select>
            <Select placeholder="Price Range">
              <option value="">Price Range</option>
              <option value="0-25">£0 – £25</option>
              <option value="25-50">£25 – £50</option>
              <option value="50+">£50+</option>
            </Select>
            <Select placeholder="Saturation">
              <option value="">Saturation</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
            <Select placeholder="Date Found">
              <option value="">Date Found</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Select>
            <div className="relative ml-auto min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8"
              />
            </div>
          </div>

          {/* AI Insight Banner */}
          {!productInsightDismissed && (
            <div className="relative">
              <AIInsightCard
                title="Product Discovery Update"
                content="TikTok product discovery detected 47 new products today. 3 show pre-viral patterns."
                confidence={92}
              />
              <button
                type="button"
                onClick={() => setProductInsightDismissed(true)}
                className="absolute right-3 top-3 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                style={{ right: 40, top: 12 }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedRows.size === MOCK_PRODUCTS.length}
                        onCheckedChange={toggleAllRows}
                      />
                    </TableHead>
                    <TableHead className="w-16">Score</TableHead>
                    <TableHead className="w-12">Img</TableHead>
                    <TableHead>Product Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Est Sales</TableHead>
                    <TableHead>7d Chg</TableHead>
                    <TableHead>Videos</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_PRODUCTS.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(product.id)}
                          onCheckedChange={() => toggleRow(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${scoreColor(product.score)} ${scoreBg(product.score)}`}
                        >
                          {product.score}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="h-9 w-9 rounded-md bg-muted" />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{product.estSales}</TableCell>
                      <TableCell>
                        <span
                          className={
                            product.change7d >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }
                        >
                          {product.change7d >= 0 ? "+" : ""}
                          {product.change7d}%
                        </span>
                      </TableCell>
                      <TableCell>{product.videos}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-amber-500 hover:text-amber-400">
                            <Star className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Bulk Actions Bar */}
          {selectedRows.size > 0 && (
            <div className="sticky bottom-4 z-10 flex items-center justify-between rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <span className="text-sm text-muted-foreground">
                {selectedRows.size} product{selectedRows.size !== 1 ? "s" : ""}{" "}
                selected
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <GitCompare className="h-3.5 w-3.5" />
                  Compare
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ListPlus className="h-3.5 w-3.5" />
                  Add to Watchlist
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <FileDown className="h-3.5 w-3.5" />
                  Export
                </Button>
                <Button variant="default" size="sm" className="gap-1.5">
                  <Wand2 className="h-3.5 w-3.5" />
                  Generate Blueprints
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 2 — Trending Videos                                      */}
        {/* ============================================================ */}
        <TabsContent value={1} className="mt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_VIDEOS.map((video) => (
              <Card key={video.id} className="overflow-hidden">
                <div className="relative aspect-[9/16] max-h-[220px] w-full bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
                      {video.views}
                    </Badge>
                  </div>
                </div>
                <CardContent className="space-y-2 p-4">
                  <p className="text-sm font-semibold leading-tight">
                    {video.productName}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-pink-500">
                      {video.creatorHandle}
                    </span>
                    <span>{video.postedDate}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button variant="outline" size="sm" className="h-7 flex-1 gap-1 text-xs">
                      <ExternalLink className="h-3 w-3" />
                      TikTok
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 flex-1 gap-1 text-xs">
                      <ShoppingBag className="h-3 w-3" />
                      Product
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 3 — TikTok Shops                                         */}
        {/* ============================================================ */}
        <TabsContent value={2} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Est GMV/mo</TableHead>
                    <TableHead>Top Product</TableHead>
                    <TableHead>Growth 30d</TableHead>
                    <TableHead>Creator Partners</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SHOPS.map((shop) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>{shop.products}</TableCell>
                      <TableCell>{shop.estGmvMonth}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{shop.topProduct}</Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            shop.growth30d >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }
                        >
                          {shop.growth30d >= 0 ? "+" : ""}
                          {shop.growth30d}%
                        </span>
                      </TableCell>
                      <TableCell>{shop.creatorPartners}</TableCell>
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
        {/*  TAB 4 — Creators                                             */}
        {/* ============================================================ */}
        <TabsContent value={3} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Avatar</TableHead>
                    <TableHead>Handle</TableHead>
                    <TableHead>Followers</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Niche</TableHead>
                    <TableHead>Match Score</TableHead>
                    <TableHead>Products Promoting</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_CREATORS.map((creator) => (
                    <TableRow key={creator.id}>
                      <TableCell>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {creator.handle.charAt(1).toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-pink-500">
                        {creator.handle}
                      </TableCell>
                      <TableCell>{creator.followers}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{creator.platform}</Badge>
                      </TableCell>
                      <TableCell>{creator.niche}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ${scoreColor(creator.matchScore)} ${scoreBg(creator.matchScore)}`}
                        >
                          {creator.matchScore}
                        </span>
                      </TableCell>
                      <TableCell>{creator.productsPromoting}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                            <ExternalLink className="h-3 w-3" />
                            Profile
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 5 — Ads                                                   */}
        {/* ============================================================ */}
        <TabsContent value={4} className="mt-4 space-y-4">
          <AIInsightCard
            title="Competitor Ad Spend Alert"
            content="12 competitors increased TikTok ad spend by combined £8,500 this week."
            confidence={88}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MOCK_ADS.map((ad) => (
              <Card key={ad.id} className="overflow-hidden">
                <div className="relative aspect-video w-full bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Megaphone className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <div className="absolute left-2 top-2">
                    <Badge className="bg-pink-500 text-white">
                      {ad.platformBadge}
                    </Badge>
                  </div>
                </div>
                <CardContent className="space-y-2 p-4">
                  <p className="text-sm font-semibold leading-tight">
                    {ad.productName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {ad.runningTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {ad.estDailySpend}/day
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Button variant="outline" size="sm" className="h-7 flex-1 gap-1 text-xs">
                      <Eye className="h-3 w-3" />
                      View ad
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 flex-1 gap-1 text-xs">
                      <TrendingUp className="h-3 w-3" />
                      Track spend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
