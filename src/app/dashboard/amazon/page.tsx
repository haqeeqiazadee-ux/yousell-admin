"use client";

import { useState } from "react";
import {
  Package,
  TrendingUp,
  TrendingDown,
  Search,
  Star,
  Eye,
  Download,
  ExternalLink,
  Music,
  BarChart3,
  Users,
  MessageSquare,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
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
/*  Section 28.4 — Amazon Intelligence                                  */
/* ------------------------------------------------------------------ */

/* ── TypeScript Types ── */

interface AmazonProduct {
  id: string;
  asin: string;
  title: string;
  category: string;
  bsr: number;
  reviews: number;
  rating: number;
  estSalesMonth: string;
  price: string;
  fulfilment: "FBA" | "FBM";
  tiktokLink: boolean;
}

interface BSRMover {
  id: string;
  asin: string;
  title: string;
  category: string;
  bsrCurrent: number;
  bsrPrevious: number;
  bsrChange: number;
  changePercent: number;
  price: string;
  estSalesMonth: string;
  direction: "up" | "down";
}

interface AmazonSeller {
  id: string;
  name: string;
  products: number;
  totalEstRevenue: string;
  fbaPercent: number;
  avgReview: number;
  crossPlatform: string[];
}

interface ReviewIntel {
  id: string;
  asin: string;
  productTitle: string;
  totalReviews: number;
  avgRating: number;
  reviewVelocity: string;
  sentiment: "Positive" | "Mixed" | "Negative";
}

/* ── Mock Data ── */

const MOCK_PRODUCTS: AmazonProduct[] = [
  { id: "ap1", asin: "B0CK1XLRQZ", title: "Portable Blender USB-C Rechargeable", category: "Kitchen", bsr: 342, reviews: 4821, rating: 4.6, estSalesMonth: "$48,200", price: "$29.99", fulfilment: "FBA", tiktokLink: true },
  { id: "ap2", asin: "B0D3MFKW9P", title: "LED Strip Lights 100ft Smart App", category: "Lighting", bsr: 567, reviews: 12340, rating: 4.4, estSalesMonth: "$36,700", price: "$19.99", fulfilment: "FBA", tiktokLink: true },
  { id: "ap3", asin: "B0BXQM4VLN", title: "Ergonomic Lumbar Support Pillow", category: "Health", bsr: 891, reviews: 8920, rating: 4.5, estSalesMonth: "$28,400", price: "$34.99", fulfilment: "FBA", tiktokLink: false },
  { id: "ap4", asin: "B0CW7X2R1T", title: "Wireless Earbuds ANC Pro 2024", category: "Electronics", bsr: 123, reviews: 23100, rating: 4.3, estSalesMonth: "$89,300", price: "$49.99", fulfilment: "FBA", tiktokLink: true },
  { id: "ap5", asin: "B0D1KLPQ8S", title: "Magnetic Phone MagSafe Wallet", category: "Accessories", bsr: 1245, reviews: 3450, rating: 4.7, estSalesMonth: "$18,900", price: "$24.99", fulfilment: "FBM", tiktokLink: false },
  { id: "ap6", asin: "B0C9NRVZ3X", title: "Ice Roller Face Massager Duo", category: "Beauty", bsr: 456, reviews: 6780, rating: 4.5, estSalesMonth: "$42,100", price: "$12.99", fulfilment: "FBA", tiktokLink: true },
  { id: "ap7", asin: "B0CLP5DW7M", title: "Collapsible Water Bottle 750ml", category: "Sports", bsr: 2340, reviews: 1890, rating: 4.2, estSalesMonth: "$9,400", price: "$16.99", fulfilment: "FBA", tiktokLink: false },
  { id: "ap8", asin: "B0D5RTLQ2K", title: "Smart Night Light Motion Sensor", category: "Home", bsr: 678, reviews: 5430, rating: 4.6, estSalesMonth: "$31,200", price: "$14.99", fulfilment: "FBA", tiktokLink: true },
  { id: "ap9", asin: "B0CKWM8F1P", title: "Cable Management Box Organizer", category: "Home Office", bsr: 1567, reviews: 2870, rating: 4.4, estSalesMonth: "$14,600", price: "$18.99", fulfilment: "FBM", tiktokLink: false },
  { id: "ap10", asin: "B0CZ4QNVX8", title: "Heated Eye Mask Bluetooth Sleep", category: "Health", bsr: 890, reviews: 7210, rating: 4.5, estSalesMonth: "$26,800", price: "$22.99", fulfilment: "FBA", tiktokLink: true },
];

const MOCK_BSR_MOVERS: BSRMover[] = [
  { id: "bm1", asin: "B0CK1XLRQZ", title: "Portable Blender USB-C Rechargeable", category: "Kitchen", bsrCurrent: 342, bsrPrevious: 1240, bsrChange: -898, changePercent: -72.4, price: "$29.99", estSalesMonth: "$48,200", direction: "up" },
  { id: "bm2", asin: "B0D3MFKW9P", title: "LED Strip Lights 100ft Smart App", category: "Lighting", bsrCurrent: 567, bsrPrevious: 890, bsrChange: -323, changePercent: -36.3, price: "$19.99", estSalesMonth: "$36,700", direction: "up" },
  { id: "bm3", asin: "B0CW7X2R1T", title: "Wireless Earbuds ANC Pro 2024", category: "Electronics", bsrCurrent: 123, bsrPrevious: 89, bsrChange: 34, changePercent: 38.2, price: "$49.99", estSalesMonth: "$89,300", direction: "down" },
  { id: "bm4", asin: "B0C9NRVZ3X", title: "Ice Roller Face Massager Duo", category: "Beauty", bsrCurrent: 456, bsrPrevious: 2100, bsrChange: -1644, changePercent: -78.3, price: "$12.99", estSalesMonth: "$42,100", direction: "up" },
  { id: "bm5", asin: "B0D5RTLQ2K", title: "Smart Night Light Motion Sensor", category: "Home", bsrCurrent: 678, bsrPrevious: 1450, bsrChange: -772, changePercent: -53.2, price: "$14.99", estSalesMonth: "$31,200", direction: "up" },
  { id: "bm6", asin: "B0CLP5DW7M", title: "Collapsible Water Bottle 750ml", category: "Sports", bsrCurrent: 2340, bsrPrevious: 980, bsrChange: 1360, changePercent: 138.8, price: "$16.99", estSalesMonth: "$9,400", direction: "down" },
  { id: "bm7", asin: "B0D1KLPQ8S", title: "Magnetic Phone MagSafe Wallet", category: "Accessories", bsrCurrent: 1245, bsrPrevious: 3400, bsrChange: -2155, changePercent: -63.4, price: "$24.99", estSalesMonth: "$18,900", direction: "up" },
  { id: "bm8", asin: "B0CKWM8F1P", title: "Cable Management Box Organizer", category: "Home Office", bsrCurrent: 1567, bsrPrevious: 890, bsrChange: 677, changePercent: 76.1, price: "$18.99", estSalesMonth: "$14,600", direction: "down" },
  { id: "bm9", asin: "B0CZ4QNVX8", title: "Heated Eye Mask Bluetooth Sleep", category: "Health", bsrCurrent: 890, bsrPrevious: 4500, bsrChange: -3610, changePercent: -80.2, price: "$22.99", estSalesMonth: "$26,800", direction: "up" },
  { id: "bm10", asin: "B0BXQM4VLN", title: "Ergonomic Lumbar Support Pillow", category: "Health", bsrCurrent: 891, bsrPrevious: 670, bsrChange: 221, changePercent: 33.0, price: "$34.99", estSalesMonth: "$28,400", direction: "down" },
];

const MOCK_SELLERS: AmazonSeller[] = [
  { id: "as1", name: "TechVenture Ltd", products: 87, totalEstRevenue: "$1,240,000", fbaPercent: 94, avgReview: 4.4, crossPlatform: ["TikTok Shop", "Shopify"] },
  { id: "as2", name: "HomeStyle Direct", products: 124, totalEstRevenue: "$980,000", fbaPercent: 88, avgReview: 4.3, crossPlatform: ["Shopify"] },
  { id: "as3", name: "BeautyPeak Global", products: 56, totalEstRevenue: "$760,000", fbaPercent: 100, avgReview: 4.6, crossPlatform: ["TikTok Shop", "Shopify", "Etsy"] },
  { id: "as4", name: "GadgetFlow Inc", products: 203, totalEstRevenue: "$2,100,000", fbaPercent: 91, avgReview: 4.2, crossPlatform: ["TikTok Shop"] },
  { id: "as5", name: "EcoSmart Brands", products: 34, totalEstRevenue: "$340,000", fbaPercent: 76, avgReview: 4.7, crossPlatform: ["Shopify", "Etsy"] },
  { id: "as6", name: "ActiveGear Pro", products: 67, totalEstRevenue: "$890,000", fbaPercent: 82, avgReview: 4.5, crossPlatform: ["TikTok Shop", "Shopify"] },
  { id: "as7", name: "LuxeHome Collection", products: 45, totalEstRevenue: "$520,000", fbaPercent: 100, avgReview: 4.6, crossPlatform: [] },
  { id: "as8", name: "PetPals Direct", products: 78, totalEstRevenue: "$670,000", fbaPercent: 85, avgReview: 4.4, crossPlatform: ["TikTok Shop"] },
];

const MOCK_REVIEWS: ReviewIntel[] = [
  { id: "ri1", asin: "B0CW7X2R1T", productTitle: "Wireless Earbuds ANC Pro 2024", totalReviews: 23100, avgRating: 4.3, reviewVelocity: "+148/week", sentiment: "Positive" },
  { id: "ri2", asin: "B0D3MFKW9P", productTitle: "LED Strip Lights 100ft Smart App", totalReviews: 12340, avgRating: 4.4, reviewVelocity: "+89/week", sentiment: "Positive" },
  { id: "ri3", asin: "B0BXQM4VLN", productTitle: "Ergonomic Lumbar Support Pillow", totalReviews: 8920, avgRating: 4.5, reviewVelocity: "+56/week", sentiment: "Positive" },
  { id: "ri4", asin: "B0CZ4QNVX8", productTitle: "Heated Eye Mask Bluetooth Sleep", totalReviews: 7210, avgRating: 4.5, reviewVelocity: "+67/week", sentiment: "Positive" },
  { id: "ri5", asin: "B0C9NRVZ3X", productTitle: "Ice Roller Face Massager Duo", totalReviews: 6780, avgRating: 4.5, reviewVelocity: "+72/week", sentiment: "Positive" },
  { id: "ri6", asin: "B0D5RTLQ2K", productTitle: "Smart Night Light Motion Sensor", totalReviews: 5430, avgRating: 4.6, reviewVelocity: "+43/week", sentiment: "Mixed" },
  { id: "ri7", asin: "B0CK1XLRQZ", productTitle: "Portable Blender USB-C Rechargeable", totalReviews: 4821, avgRating: 4.6, reviewVelocity: "+95/week", sentiment: "Positive" },
  { id: "ri8", asin: "B0D1KLPQ8S", productTitle: "Magnetic Phone MagSafe Wallet", totalReviews: 3450, avgRating: 4.7, reviewVelocity: "+31/week", sentiment: "Positive" },
  { id: "ri9", asin: "B0CKWM8F1P", productTitle: "Cable Management Box Organizer", totalReviews: 2870, avgRating: 4.4, reviewVelocity: "+22/week", sentiment: "Mixed" },
  { id: "ri10", asin: "B0CLP5DW7M", productTitle: "Collapsible Water Bottle 750ml", totalReviews: 1890, avgRating: 4.2, reviewVelocity: "+18/week", sentiment: "Negative" },
];

/* ── Helpers ── */

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars: string[] = [];
  for (let i = 0; i < full; i++) stars.push("★");
  if (hasHalf) stars.push("½");
  return (
    <span className="text-amber-400 text-xs tracking-wide">
      {stars.join("")}{" "}
      <span className="text-muted-foreground">{rating.toFixed(1)}</span>
    </span>
  );
}

function sentimentBadgeVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "Positive") return "default";
  if (s === "Mixed") return "secondary";
  return "destructive";
}

function bsrHeatmapClasses(direction: "up" | "down"): string {
  return direction === "up"
    ? "bg-emerald-500/10 text-emerald-500"
    : "bg-red-500/10 text-red-500";
}

/* ================================================================== */
/*  Amazon Intelligence Page                                            */
/* ================================================================== */

export default function AmazonIntelligencePage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Amazon Intelligence
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            Last sync: 4h ago
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync now
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
          title="Products Tracked"
          value="1,847"
          delta={3.2}
          deltaLabel="+54 this week"
          icon={<Package className="h-4 w-4" />}
          sparklineData={[32, 35, 34, 38, 42, 40, 47]}
        />
        <MetricCard
          title="New Today"
          value="23"
          delta={15.0}
          deltaLabel="+5 vs yesterday"
          icon={<Star className="h-4 w-4" />}
          sparklineData={[14, 18, 12, 20, 16, 19, 23]}
        />
        <MetricCard
          title="BSR Movers"
          value="156"
          delta={8.4}
          deltaLabel="significant shifts"
          icon={<TrendingUp className="h-4 w-4" />}
          sparklineData={[90, 110, 105, 120, 130, 140, 156]}
        />
        <MetricCard
          title="Price Changes"
          value="89"
          delta={-2.3}
          deltaLabel="detected today"
          icon={<BarChart3 className="h-4 w-4" />}
          sparklineData={[100, 95, 92, 88, 91, 87, 89]}
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
            BSR Movers
          </TabsTrigger>
          <TabsTrigger value={2} className="gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Sellers
          </TabsTrigger>
          <TabsTrigger value={3} className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Reviews Intelligence
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/*  TAB 1 — Products                                             */}
        {/* ============================================================ */}
        <TabsContent value={0} className="mt-4 space-y-4">
          {/* Filter Bar */}
          <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-lg border bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Select placeholder="Category">
              <option value="">Category</option>
              <option value="electronics">Electronics</option>
              <option value="beauty">Beauty</option>
              <option value="home">Home</option>
              <option value="kitchen">Kitchen</option>
              <option value="health">Health</option>
            </Select>
            <Select placeholder="BSR Range">
              <option value="">BSR Range</option>
              <option value="0-500">Top 500</option>
              <option value="500-1000">500 - 1,000</option>
              <option value="1000-5000">1,000 - 5,000</option>
              <option value="5000+">5,000+</option>
            </Select>
            <Select placeholder="Fulfilment">
              <option value="">Fulfilment</option>
              <option value="fba">FBA</option>
              <option value="fbm">FBM</option>
            </Select>
            <Select placeholder="Price Range">
              <option value="">Price Range</option>
              <option value="0-25">$0 - $25</option>
              <option value="25-50">$25 - $50</option>
              <option value="50+">$50+</option>
            </Select>
            <div className="relative ml-auto min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search ASIN or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8"
              />
            </div>
          </div>

          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ASIN</TableHead>
                    <TableHead>Product Title</TableHead>
                    <TableHead className="w-10 text-center">X-Plat</TableHead>
                    <TableHead>BSR</TableHead>
                    <TableHead>Reviews</TableHead>
                    <TableHead>Est Sales/mo</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_PRODUCTS.filter(
                    (p) =>
                      !searchQuery ||
                      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.asin.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs">
                        {product.asin}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate font-medium">
                        {product.title}
                      </TableCell>
                      <TableCell className="text-center">
                        {product.tiktokLink ? (
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md p-1 text-pink-500 transition-colors hover:bg-pink-500/10"
                            title="View on TikTok"
                          >
                            <Music className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          #{product.bsr.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {renderStars(product.rating)}
                          <span className="text-xs text-muted-foreground">
                            {product.reviews.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.estSalesMonth}
                      </TableCell>
                      <TableCell>{product.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant={product.fulfilment === "FBA" ? "default" : "outline"}
                          className={
                            product.fulfilment === "FBA"
                              ? "bg-orange-500 text-white"
                              : ""
                          }
                        >
                          {product.fulfilment}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                            <ExternalLink className="h-3 w-3" />
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
        {/*  TAB 2 — BSR Movers                                           */}
        {/* ============================================================ */}
        <TabsContent value={1} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ASIN</TableHead>
                    <TableHead>Product Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>BSR Now</TableHead>
                    <TableHead>BSR Prev</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Est Sales/mo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_BSR_MOVERS.map((mover) => (
                    <TableRow
                      key={mover.id}
                      className={bsrHeatmapClasses(mover.direction)}
                    >
                      <TableCell className="font-mono text-xs">
                        {mover.asin}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {mover.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{mover.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        #{mover.bsrCurrent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        #{mover.bsrPrevious.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 font-semibold">
                          {mover.direction === "up" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-red-500" />
                          )}
                          <span className={mover.direction === "up" ? "text-emerald-500" : "text-red-500"}>
                            {mover.changePercent > 0 ? "+" : ""}
                            {mover.changePercent.toFixed(1)}%
                          </span>
                        </span>
                      </TableCell>
                      <TableCell>{mover.price}</TableCell>
                      <TableCell>{mover.estSalesMonth}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/*  TAB 3 — Sellers                                               */}
        {/* ============================================================ */}
        <TabsContent value={2} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller Name</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Total Est Revenue</TableHead>
                    <TableHead>FBA %</TableHead>
                    <TableHead>Avg Review</TableHead>
                    <TableHead>Cross-Platform</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_SELLERS.map((seller) => (
                    <TableRow key={seller.id}>
                      <TableCell className="font-medium">
                        {seller.name}
                      </TableCell>
                      <TableCell>{seller.products}</TableCell>
                      <TableCell className="font-medium">
                        {seller.totalEstRevenue}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-orange-500"
                              style={{ width: `${seller.fbaPercent}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {seller.fbaPercent}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{renderStars(seller.avgReview)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {seller.crossPlatform.length > 0 ? (
                            seller.crossPlatform.map((platform) => (
                              <Badge key={platform} variant="secondary" className="text-[10px]">
                                {platform}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Amazon only</span>
                          )}
                        </div>
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
        {/*  TAB 4 — Reviews Intelligence                                  */}
        {/* ============================================================ */}
        <TabsContent value={3} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>ASIN</TableHead>
                    <TableHead>Total Reviews</TableHead>
                    <TableHead>Avg Rating</TableHead>
                    <TableHead>Review Velocity</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_REVIEWS.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="max-w-[200px] truncate font-medium">
                        {review.productTitle}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {review.asin}
                      </TableCell>
                      <TableCell className="font-medium">
                        {review.totalReviews.toLocaleString()}
                      </TableCell>
                      <TableCell>{renderStars(review.avgRating)}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-emerald-500">
                          <TrendingUp className="h-3 w-3" />
                          {review.reviewVelocity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sentimentBadgeVariant(review.sentiment)}>
                          {review.sentiment}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs">
                          <Eye className="h-3 w-3" />
                          Analyze
                        </Button>
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
