"use client"

import { useState } from "react"
import {
  Package,
  TrendingUp,
  DollarSign,
  Star,
  ArrowUpRight,
  ArrowDownRight,
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

const digitalProducts = [
  {
    id: "1",
    product: "Ultimate Notion Template Pack",
    price: 49,
    estSalesPerMonth: 320,
    platform: "Gumroad",
    creator: "Marie K.",
    reviews: 1247,
    growth7d: 12.4,
    score: 94,
  },
  {
    id: "2",
    product: "Watercolor Brush Set for Procreate",
    price: 29,
    estSalesPerMonth: 580,
    platform: "Creative Market",
    creator: "Alex Chen",
    reviews: 2031,
    growth7d: 8.1,
    score: 91,
  },
  {
    id: "3",
    product: "Complete Web Dev Bootcamp 2026",
    price: 89.99,
    estSalesPerMonth: 1200,
    platform: "Udemy",
    creator: "Dr. Angela Yu",
    reviews: 34520,
    growth7d: -2.3,
    score: 89,
  },
  {
    id: "4",
    product: "Printable Planner Bundle",
    price: 14.99,
    estSalesPerMonth: 890,
    platform: "Etsy",
    creator: "PlannerCo",
    reviews: 4102,
    growth7d: 5.7,
    score: 87,
  },
  {
    id: "5",
    product: "AI Prompt Engineering Masterclass",
    price: 199,
    estSalesPerMonth: 210,
    platform: "Teachable",
    creator: "Sam Althaus",
    reviews: 876,
    growth7d: 22.6,
    score: 85,
  },
  {
    id: "6",
    product: "Lightroom Preset Collection - Moody",
    price: 39,
    estSalesPerMonth: 410,
    platform: "Gumroad",
    creator: "NomadLens",
    reviews: 1580,
    growth7d: 3.2,
    score: 82,
  },
  {
    id: "7",
    product: "SVG Icon Library - 5000 Icons",
    price: 59,
    estSalesPerMonth: 190,
    platform: "Creative Market",
    creator: "IconFlow Studio",
    reviews: 920,
    growth7d: -1.1,
    score: 79,
  },
  {
    id: "8",
    product: "Knitting Pattern eBook Collection",
    price: 19.99,
    estSalesPerMonth: 670,
    platform: "Etsy",
    creator: "YarnCraft",
    reviews: 3210,
    growth7d: 1.8,
    score: 76,
  },
]

const platforms = ["All Platforms", "Gumroad", "Etsy", "Creative Market", "Udemy", "Teachable"]
const categories = ["All Categories", "Templates", "Design Assets", "Courses", "Printables", "Software"]

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

export default function DigitalProductsPage() {
  const [platformFilter, setPlatformFilter] = useState("All Platforms")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [search, setSearch] = useState("")

  const filtered = digitalProducts.filter((p) => {
    if (platformFilter !== "All Platforms" && p.platform !== platformFilter) return false
    if (search && !p.product.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Digital Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover trending digital products across Gumroad, Etsy, Creative Market, Udemy &amp; Teachable.
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
          title="Products Tracked"
          value="2,847"
          change="+18%"
          icon={Package}
        />
        <MetricCard
          title="Avg. Monthly Revenue"
          value="$14.2K"
          change="+12%"
          icon={DollarSign}
        />
        <MetricCard
          title="Trending Products"
          value="142"
          change="+24%"
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg. Rating"
          value="4.6"
          change="+0.2"
          icon={Star}
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
                placeholder="Search digital products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              {platforms.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Digital Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Est Sales/mo</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead className="text-right">Reviews</TableHead>
                <TableHead className="text-right">Growth 7d</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium max-w-[220px] truncate">
                    {row.product}
                  </TableCell>
                  <TableCell className="text-right">${row.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {row.estSalesPerMonth.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.platform}</Badge>
                  </TableCell>
                  <TableCell>{row.creator}</TableCell>
                  <TableCell className="text-right">
                    {row.reviews.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        row.growth7d >= 0 ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {row.growth7d >= 0 ? (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      )}
                      {Math.abs(row.growth7d)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <ScoreBadge score={row.score} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
