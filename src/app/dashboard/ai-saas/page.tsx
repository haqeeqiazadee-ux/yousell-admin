"use client"

import { useState } from "react"
import {
  Bot,
  TrendingUp,
  DollarSign,
  MousePointerClick,
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

const aiSaasTools = [
  {
    id: "1",
    tool: "Jasper AI",
    category: "Content Writing",
    commission: 30,
    cookieDuration: "90 days",
    estMonthlyPayout: 2400,
    epc: 1.85,
    score: 96,
    network: "PartnerStack",
  },
  {
    id: "2",
    tool: "Surfer SEO",
    category: "SEO",
    commission: 25,
    cookieDuration: "60 days",
    estMonthlyPayout: 1850,
    epc: 1.62,
    score: 93,
    network: "PartnerStack",
  },
  {
    id: "3",
    tool: "ClickFunnels 2.0",
    category: "Sales Funnels",
    commission: 40,
    cookieDuration: "45 days",
    estMonthlyPayout: 3200,
    epc: 2.10,
    score: 91,
    network: "ClickBank",
  },
  {
    id: "4",
    tool: "Notion AI",
    category: "Productivity",
    commission: 15,
    cookieDuration: "30 days",
    estMonthlyPayout: 980,
    epc: 0.92,
    score: 88,
    network: "Impact.com",
  },
  {
    id: "5",
    tool: "Writesonic",
    category: "Content Writing",
    commission: 30,
    cookieDuration: "60 days",
    estMonthlyPayout: 1620,
    epc: 1.45,
    score: 86,
    network: "ShareASale",
  },
  {
    id: "6",
    tool: "Descript",
    category: "Video Editing",
    commission: 20,
    cookieDuration: "30 days",
    estMonthlyPayout: 1100,
    epc: 1.18,
    score: 83,
    network: "Impact.com",
  },
  {
    id: "7",
    tool: "Copy.ai",
    category: "Content Writing",
    commission: 25,
    cookieDuration: "45 days",
    estMonthlyPayout: 1340,
    epc: 1.30,
    score: 80,
    network: "PartnerStack",
  },
  {
    id: "8",
    tool: "Loom Pro",
    category: "Communication",
    commission: 15,
    cookieDuration: "30 days",
    estMonthlyPayout: 720,
    epc: 0.78,
    score: 77,
    network: "ShareASale",
  },
]

const networks = ["All Networks", "PartnerStack", "ShareASale", "ClickBank", "Impact.com"]
const aiCategories = [
  "All Categories",
  "Content Writing",
  "SEO",
  "Sales Funnels",
  "Productivity",
  "Video Editing",
  "Communication",
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

export default function AISaaSAffiliatesPage() {
  const [networkFilter, setNetworkFilter] = useState("All Networks")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [search, setSearch] = useState("")

  const filtered = aiSaasTools.filter((t) => {
    if (networkFilter !== "All Networks" && t.network !== networkFilter) return false
    if (categoryFilter !== "All Categories" && t.category !== categoryFilter) return false
    if (search && !t.tool.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            AI/SaaS Affiliates
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            High-commission affiliate programs from PartnerStack, ShareASale, ClickBank &amp; Impact.com.
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
          value="384"
          change="+22%"
          icon={Bot}
        />
        <MetricCard
          title="Avg. Commission"
          value="24.5%"
          change="+3.2%"
          icon={DollarSign}
        />
        <MetricCard
          title="Est. Monthly Payout"
          value="$8.4K"
          change="+15%"
          icon={TrendingUp}
        />
        <MetricCard
          title="Avg. EPC"
          value="$1.28"
          change="+$0.14"
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
                placeholder="Search AI/SaaS tools..."
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
              {networks.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              {aiCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top AI/SaaS Affiliate Programs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool Name</TableHead>
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
                  <TableCell className="font-medium">{row.tool}</TableCell>
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
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-0.5">
                      ${row.epc.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <ScoreBadge score={row.score} />
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No programs match your filters.
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
