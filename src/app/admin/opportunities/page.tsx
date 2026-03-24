"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/auth-fetch"
import { Lightbulb, ExternalLink, Users, Layers, RefreshCw, Filter, ChevronLeft, ChevronRight } from "lucide-react"

interface Opportunity {
  id: string
  title: string
  platform: string
  category: string
  price: number
  finalScore: number
  trendScore: number
  viralScore: number
  profitScore: number
  trendStage: string
  tier: "HOT" | "WARM" | "WATCH" | "COLD"
  imageUrl: string | null
  externalUrl: string | null
  clusterName: string | null
  clusterSize: number
  matchedCreators: number
  topCreator: string | null
  estimatedProfit: number
  isAllocated: boolean
  hasBlueprint: boolean
  hasFinancialModel: boolean
  createdAt: string
}

interface Stats {
  total: number
  hot: number
  warm: number
  watch: number
  cold: number
  avgScore: number
  topPlatform: string
  topCategory: string
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [tierFilter, setTierFilter] = useState<string>("all")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 25

  async function loadData() {
    setLoading(true)
    try {
      const res = await authFetch("/api/admin/opportunities?limit=200")
      if (res.ok) {
        const data = await res.json()
        setOpportunities(data.opportunities || [])
        setStats(data.stats || null)
      }
    } catch (err) {
      console.error("Failed to load opportunities:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const filtered = opportunities.filter(o => {
    if (tierFilter !== "all" && o.tier !== tierFilter) return false
    if (platformFilter !== "all" && o.platform !== platformFilter) return false
    return true
  })

  const platforms = [...new Set(opportunities.map(o => o.platform))].sort()

  const tierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      HOT: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
      WARM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      WATCH: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      COLD: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    }
    return <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${colors[tier] || colors.COLD}`}>{tier}</span>
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading opportunities...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-500" /> Opportunity Feed
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Aggregated product opportunities with enrichment signals.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <StatBadge label="Total" value={stats.total} />
          <StatBadge label="HOT" value={stats.hot} className="text-rose-600" />
          <StatBadge label="WARM" value={stats.warm} className="text-amber-600" />
          <StatBadge label="WATCH" value={stats.watch} className="text-blue-600" />
          <StatBadge label="COLD" value={stats.cold} className="text-gray-500" />
          <StatBadge label="Avg Score" value={stats.avgScore} />
          <StatBadge label="Top Platform" value={stats.topPlatform} />
          <StatBadge label="Top Category" value={stats.topCategory} />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <select value={tierFilter} onChange={e => { setTierFilter(e.target.value); setPage(1) }} className="text-sm bg-muted rounded-lg px-3 py-1.5 border-0">
          <option value="all">All Tiers</option>
          <option value="HOT">HOT</option>
          <option value="WARM">WARM</option>
          <option value="WATCH">WATCH</option>
          <option value="COLD">COLD</option>
        </select>
        <select value={platformFilter} onChange={e => { setPlatformFilter(e.target.value); setPage(1) }} className="text-sm bg-muted rounded-lg px-3 py-1.5 border-0">
          <option value="all">All Platforms</option>
          {platforms.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className="text-xs text-muted-foreground">{filtered.length} results</span>
      </div>

      {/* Opportunities Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Product</th>
                <th className="text-left px-4 py-2 font-medium">Platform</th>
                <th className="text-left px-4 py-2 font-medium">Tier</th>
                <th className="text-right px-4 py-2 font-medium">Score</th>
                <th className="text-right px-4 py-2 font-medium">Price</th>
                <th className="text-left px-4 py-2 font-medium">Stage</th>
                <th className="text-left px-4 py-2 font-medium">Cluster</th>
                <th className="text-right px-4 py-2 font-medium">Creators</th>
                <th className="text-right px-4 py-2 font-medium">Est. Profit</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(o => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate max-w-[200px]">{o.title}</span>
                      {o.externalUrl && (
                        <a href={o.externalUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 capitalize text-xs">{o.platform}</td>
                  <td className="px-4 py-2">{tierBadge(o.tier)}</td>
                  <td className="px-4 py-2 text-right font-mono">{o.finalScore}</td>
                  <td className="px-4 py-2 text-right">${o.price}</td>
                  <td className="px-4 py-2 capitalize text-xs">{o.trendStage}</td>
                  <td className="px-4 py-2 text-xs">
                    {o.clusterName ? (
                      <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{o.clusterName}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {o.matchedCreators > 0 ? (
                      <span className="flex items-center justify-end gap-1"><Users className="h-3 w-3" />{o.matchedCreators}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-mono">{o.estimatedProfit > 0 ? `$${o.estimatedProfit.toFixed(0)}` : "—"}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      {o.isAllocated && <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Allocated</span>}
                      {o.hasBlueprint && <span className="text-[10px] px-1 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Blueprint</span>}
                      {o.hasFinancialModel && <span className="text-[10px] px-1 py-0.5 rounded bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">Financial</span>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">No opportunities found. Try adjusting filters or run a product scan first.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1 text-sm rounded border disabled:opacity-40 hover:bg-muted transition-colors">
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(filtered.length / PAGE_SIZE)} className="flex items-center gap-1 px-3 py-1 text-sm rounded border disabled:opacity-40 hover:bg-muted transition-colors">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBadge({ label, value, className }: { label: string; value: string | number; className?: string }) {
  return (
    <div className="bg-card border rounded-lg px-3 py-2 text-center">
      <p className={`text-lg font-bold ${className || ""}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
    </div>
  )
}
