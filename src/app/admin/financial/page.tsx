"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/auth-fetch"
import { DollarSign, AlertTriangle, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"

interface FinancialModel {
  id: string
  product_id: string
  retail_price: number
  total_cost: number
  gross_margin: number
  break_even_units: number
  revenue_30day: number | null
  revenue_60day: number | null
  revenue_90day: number | null
  cost_breakdown: Record<string, number>
  risk_flags: string[]
  auto_rejected: boolean
  rejection_reason: string | null
  created_at: string
  products?: { title: string; platform: string } | null
}

export default function FinancialPage() {
  const [models, setModels] = useState<FinancialModel[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 25

  async function loadModels() {
    setLoading(true)
    try {
      const res = await authFetch("/api/admin/financial")
      if (res.ok) {
        const data = await res.json()
        setModels(data.models || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      console.error("Failed to load financial models:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadModels() }, [])

  const approved = models.filter(m => !m.auto_rejected)
  const rejected = models.filter(m => m.auto_rejected)
  const avgMargin = models.length > 0
    ? (models.reduce((s, m) => s + (m.gross_margin || 0), 0) / models.length * 100).toFixed(1)
    : "0"
  const totalRevenue30d = models.reduce((s, m) => s + (m.revenue_30day || 0), 0)

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading financial data...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-emerald-500" /> Financial Models
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Product financial projections, margins, and auto-rejection analysis.</p>
        </div>
        <button onClick={loadModels} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <KPI label="Total Models" value={total.toString()} />
        <KPI label="Approved" value={approved.length.toString()} className="text-emerald-600" />
        <KPI label="Auto-Rejected" value={rejected.length.toString()} className="text-red-600" />
        <KPI label="Avg Margin" value={`${avgMargin}%`} />
        <KPI label="30d Revenue (proj)" value={`$${totalRevenue30d.toLocaleString()}`} className="text-emerald-600" />
      </div>

      {/* Models Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Product</th>
                <th className="text-right px-4 py-2 font-medium">Retail</th>
                <th className="text-right px-4 py-2 font-medium">Cost</th>
                <th className="text-right px-4 py-2 font-medium">Margin</th>
                <th className="text-right px-4 py-2 font-medium">Break-Even</th>
                <th className="text-right px-4 py-2 font-medium">30d Rev</th>
                <th className="text-right px-4 py-2 font-medium">90d Rev</th>
                <th className="text-left px-4 py-2 font-medium">Risk Flags</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {models.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(m => {
                const marginPct = (m.gross_margin * 100).toFixed(1)
                const marginColor = m.gross_margin >= 0.6 ? "text-emerald-600" : m.gross_margin >= 0.4 ? "text-amber-600" : "text-red-600"
                return (
                  <tr key={m.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <div className="font-medium truncate max-w-[200px]">{m.products?.title || m.product_id.slice(0, 8)}</div>
                      {m.products?.platform && <span className="text-[10px] text-muted-foreground capitalize">{m.products.platform}</span>}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">${m.retail_price}</td>
                    <td className="px-4 py-2 text-right font-mono">${m.total_cost.toFixed(2)}</td>
                    <td className={`px-4 py-2 text-right font-bold ${marginColor}`}>{marginPct}%</td>
                    <td className="px-4 py-2 text-right">{m.break_even_units} units</td>
                    <td className="px-4 py-2 text-right font-mono">{m.revenue_30day ? `$${m.revenue_30day.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-2 text-right font-mono">{m.revenue_90day ? `$${m.revenue_90day.toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-2">
                      {m.risk_flags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.risk_flags.map(flag => (
                            <span key={flag} className="text-[10px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              {flag.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-xs text-muted-foreground">None</span>}
                    </td>
                    <td className="px-4 py-2">
                      {m.auto_rejected ? (
                        <div>
                          <span className="flex items-center gap-1 text-xs text-red-600"><XCircle className="h-3 w-3" />Rejected</span>
                          {m.rejection_reason && <p className="text-[10px] text-red-500 mt-0.5">{m.rejection_reason}</p>}
                        </div>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle className="h-3 w-3" />Approved</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {models.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">No financial models yet. Create one from the product detail page.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {models.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-xs text-muted-foreground">
              Page {page} of {Math.ceil(models.length / PAGE_SIZE)} ({models.length} models)
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 px-3 py-1 text-sm rounded border disabled:opacity-40 hover:bg-muted transition-colors">
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(models.length / PAGE_SIZE)} className="flex items-center gap-1 px-3 py-1 text-sm rounded border disabled:opacity-40 hover:bg-muted transition-colors">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Analysis */}
      {rejected.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold flex items-center gap-2 text-red-700 dark:text-red-400 mb-3">
            <AlertTriangle className="h-4 w-4" /> Auto-Rejection Summary
          </h2>
          <div className="space-y-2">
            {rejected.map(m => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{m.products?.title || m.product_id.slice(0, 8)}</span>
                <span className="text-xs text-red-600 dark:text-red-400">{m.rejection_reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KPI({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="bg-card border rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${className || ""}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
