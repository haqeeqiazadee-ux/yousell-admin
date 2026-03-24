"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/auth-fetch"
import { Sparkles, TrendingUp, Zap, DollarSign, RefreshCw, Filter } from "lucide-react"

interface Product {
  id: string
  title: string
  platform: string
  category: string
  price: number
  final_score: number
  trend_score: number
  viral_score: number
  profit_score: number
  trend_stage: string
  status: string
  created_at: string
}

const TIER_CONFIG = {
  HOT: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  WARM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  WATCH: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  COLD: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

function getTier(score: number): keyof typeof TIER_CONFIG {
  if (score >= 80) return "HOT"
  if (score >= 60) return "WARM"
  if (score >= 40) return "WATCH"
  return "COLD"
}

function ScoreBar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono w-6 text-right">{Math.round(value)}</span>
    </div>
  )
}

export default function ScoringPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<string>("final_score")

  async function loadProducts() {
    setLoading(true)
    try {
      const res = await authFetch(`/api/admin/products?limit=200&sort=${sortField}&order=desc`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch (err) {
      console.error("Failed to load products:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [sortField])

  const filtered = tierFilter === "all"
    ? products
    : products.filter(p => getTier(p.final_score || 0) === tierFilter)

  const tierCounts = {
    HOT: products.filter(p => getTier(p.final_score || 0) === "HOT").length,
    WARM: products.filter(p => getTier(p.final_score || 0) === "WARM").length,
    WATCH: products.filter(p => getTier(p.final_score || 0) === "WATCH").length,
    COLD: products.filter(p => getTier(p.final_score || 0) === "COLD").length,
  }

  const avgScore = products.length > 0
    ? Math.round(products.reduce((s, p) => s + (p.final_score || 0), 0) / products.length)
    : 0

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading scoring data...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-violet-500" /> Product Scoring
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Score breakdown: final = trend(40%) + viral(35%) + profit(25%)
          </p>
        </div>
        <button onClick={loadProducts} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-card border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{avgScore}</p>
          <p className="text-xs text-muted-foreground">Avg Score</p>
        </div>
        {(["HOT", "WARM", "WATCH", "COLD"] as const).map(tier => (
          <div key={tier} className="bg-card border rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{tierCounts[tier]}</p>
            <p className="text-xs text-muted-foreground">{tier}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="text-sm bg-muted rounded-lg px-3 py-1.5 border-0">
          <option value="all">All Tiers</option>
          <option value="HOT">HOT (&ge;80)</option>
          <option value="WARM">WARM (&ge;60)</option>
          <option value="WATCH">WATCH (&ge;40)</option>
          <option value="COLD">COLD (&lt;40)</option>
        </select>
        <select value={sortField} onChange={e => setSortField(e.target.value)} className="text-sm bg-muted rounded-lg px-3 py-1.5 border-0">
          <option value="final_score">Sort by Final Score</option>
          <option value="viral_score">Sort by Viral Score</option>
          <option value="created_at">Sort by Date</option>
        </select>
        <span className="text-xs text-muted-foreground">{filtered.length} products</span>
      </div>

      {/* Scoring Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Product</th>
                <th className="text-left px-4 py-2 font-medium">Platform</th>
                <th className="text-left px-4 py-2 font-medium">Tier</th>
                <th className="text-left px-4 py-2 font-medium w-32">
                  <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" />Final</span>
                </th>
                <th className="text-left px-4 py-2 font-medium w-32">
                  <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />Trend (40%)</span>
                </th>
                <th className="text-left px-4 py-2 font-medium w-32">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3" />Viral (35%)</span>
                </th>
                <th className="text-left px-4 py-2 font-medium w-32">
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />Profit (25%)</span>
                </th>
                <th className="text-left px-4 py-2 font-medium">Stage</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const tier = getTier(p.final_score || 0)
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium truncate max-w-[200px]">{p.title}</td>
                    <td className="px-4 py-2 capitalize text-xs">{p.platform}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${TIER_CONFIG[tier]}`}>{tier}</span>
                    </td>
                    <td className="px-4 py-2"><ScoreBar value={p.final_score || 0} color="bg-violet-500" /></td>
                    <td className="px-4 py-2"><ScoreBar value={p.trend_score || 0} color="bg-blue-500" /></td>
                    <td className="px-4 py-2"><ScoreBar value={p.viral_score || 0} color="bg-rose-500" /></td>
                    <td className="px-4 py-2"><ScoreBar value={p.profit_score || 0} color="bg-emerald-500" /></td>
                    <td className="px-4 py-2 capitalize text-xs">{p.trend_stage || "—"}</td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No products found. Run a scan to discover products.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
