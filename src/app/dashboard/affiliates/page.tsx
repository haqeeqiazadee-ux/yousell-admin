"use client"

import { useState } from "react"
import {
  ShoppingBag,
  TrendingUp,
  DollarSign,
  MousePointerClick,
  Search,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/* ---------- Mock Data ---------- */

const physicalProducts = [
  {
    id: "1",
    product: "Anker USB-C Hub 7-in-1",
    category: "Electronics",
    commission: 6,
    cookieDuration: "24 hours",
    estMonthlyPayout: 1420,
    epc: 0.72,
    score: 94,
    network: "Amazon Associates",
  },
  {
    id: "2",
    product: "Lululemon Align Leggings",
    category: "Apparel",
    commission: 10,
    cookieDuration: "30 days",
    estMonthlyPayout: 2100,
    epc: 1.35,
    score: 92,
    network: "Impact",
  },
  {
    id: "3",
    product: "Dyson V15 Detect Vacuum",
    category: "Home & Garden",
    commission: 8,
    cookieDuration: "30 days",
    estMonthlyPayout: 3600,
    epc: 2.40,
    score: 90,
    network: "Rakuten",
  },
  {
    id: "4",
    product: "Nike Air Max 90",
    category: "Footwear",
    commission: 7,
    cookieDuration: "30 days",
    estMonthlyPayout: 1850,
    epc: 1.10,
    score: 88,
    network: "AWIN",
  },
  {
    id: "5",
    product: "Vitamix A3500 Blender",
    category: "Kitchen",
    commission: 10,
    cookieDuration: "15 days",
    estMonthlyPayout: 2800,
    epc: 1.95,
    score: 86,
    network: "Amazon Associates",
  },
  {
    id: "6",
    product: "Theragun Pro Massage Gun",
    category: "Health & Fitness",
    commission: 12,
    cookieDuration: "30 days",
    estMonthlyPayout: 1680,
    epc: 1.52,
    score: 83,
    network: "Impact",
  },
  {
    id: "7",
    product: "Samsonite Carry-On Spinner",
    category: "Travel",
    commission: 5,
    cookieDuration: "24 hours",
    estMonthlyPayout: 920,
    epc: 0.65,
    score: 79,
    network: "Amazon Associates",
  },
  {
    id: "8",
    product: "Le Creuset Dutch Oven 5.5qt",
    category: "Kitchen",
    commission: 8,
    cookieDuration: "30 days",
    estMonthlyPayout: 1340,
    epc: 1.20,
    score: 76,
    network: "Rakuten",
  },
]

const physicalNetworks = ["All Networks", "Amazon Associates", "Impact", "AWIN", "Rakuten"]
const physicalCategories = [
  "All Categories",
  "Electronics",
  "Apparel",
  "Home & Garden",
  "Footwear",
  "Kitchen",
  "Health & Fitness",
  "Travel",
]

/* ---------- Metric Card ---------- */

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string
  value: string
  change: string
  icon: React.ElementType
}) {
  const isPositive = change.startsWith("+")
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <p className={`text-xs mt-2 ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
          {change} vs last month
        </p>
      </CardContent>
    </Card>
  )
}

/* ---------- Score Badge ---------- */

function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 90 ? "default" : score >= 80 ? "secondary" : "outline"
  return <Badge variant={variant}>{score}</Badge>
}

/* ---------- Page ---------- */

export default function PhysicalAffiliatesPage() {
  const [networkFilter, setNetworkFilter] = useState("All Networks")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [search, setSearch] = useState("")

  const filtered = physicalProducts.filter((t) => {
    if (networkFilter !== "All Networks" && t.network !== networkFilter) return false
    if (categoryFilter !== "All Categories" && t.category !== categoryFilter) return false
    if (search && !t.product.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Physical Affiliates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Physical product affiliate programs from Amazon Associates, Impact, AWIN &amp; Rakuten.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1.5" />
          Export CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Programs Tracked"
          value="1,246"
          change="+9%"
          icon={ShoppingBag}
        />
        <MetricCard
          title="Avg. Commission"
          value="8.2%"
          change="+1.1%"
          icon={DollarSign}
        />
        <MetricCard
          title="Est. Monthly Payout"
          value="$6.1K"
          change="+11%"
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg. EPC"
          value="$1.24"
          change="+$0.08"
          icon={MousePointerClick}
        />
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search physical products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              {physicalNetworks.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              {physicalCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Physical Affiliate Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Commission %</TableHead>
                <TableHead>Cookie Duration</TableHead>
                <TableHead className="text-right">Est Monthly Payout</TableHead>
                <TableHead className="text-right">EPC</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium max-w-[220px] truncate">
                    {row.product}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-emerald-600 font-medium">{row.commission}%</span>
                  </TableCell>
                  <TableCell>{row.cookieDuration}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${row.estMonthlyPayout.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">${row.epc.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <ScoreBadge score={row.score} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No products match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
