"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/auth-fetch"
import { BarChart3, Package, FileText, ShoppingBag, CreditCard, Wifi, RefreshCw } from "lucide-react"

interface AnalyticsData {
  plan: string
  allocations: { total: number; active: number; deployed: number }
  content: { total: number; generated: number; published: number; failed: number; byType: Record<string, number> }
  credits: { total: number; used: number; remaining: number; periodStart: string } | null
  revenue: { totalOrders: number; totalRevenue: number; fulfilledOrders: number }
  connectedChannels: Array<{ type: string; connectedAt: string }>
  usage: Record<string, number>
}

export default function ClientAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const res = await authFetch("/api/dashboard/analytics")
      if (res.ok) setData(await res.json())
    } catch (err) {
      console.error("Failed to load analytics:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-gray-400">Loading analytics...</div>
  if (!data) return <div className="text-gray-400 text-center py-8">Failed to load analytics</div>

  const contentTypes = Object.entries(data.content.byType)
  const usageEntries = Object.entries(data.usage)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Your platform usage and performance metrics.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={Package} label="Products Allocated" value={data.allocations.total} sub={`${data.allocations.active} active`} color="text-blue-500" />
        <KPI icon={FileText} label="Content Created" value={data.content.total} sub={`${data.content.published} published`} color="text-violet-500" />
        <KPI icon={ShoppingBag} label="Orders" value={data.revenue.totalOrders} sub={`$${data.revenue.totalRevenue.toLocaleString()} revenue`} color="text-emerald-500" />
        <KPI icon={Wifi} label="Channels Connected" value={data.connectedChannels.length} sub={data.plan ? `${data.plan} plan` : "No plan"} color="text-amber-500" />
      </div>

      {/* Credits */}
      {data.credits && (
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Content Credits
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (data.credits.used / data.credits.total) * 100)}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium">{data.credits.used} / {data.credits.total} used</span>
            <span className="text-sm text-emerald-600 font-medium">{data.credits.remaining} remaining</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content by Type */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Content by Type
          </h2>
          {contentTypes.length === 0 ? (
            <p className="text-sm text-gray-400">No content generated yet</p>
          ) : (
            <div className="space-y-3">
              {contentTypes.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{type.replace(/_/g, " ")}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Connected Channels */}
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
            <Wifi className="h-4 w-4" /> Connected Channels
          </h2>
          {data.connectedChannels.length === 0 ? (
            <p className="text-sm text-gray-400">No channels connected. Visit Integrations to connect a store.</p>
          ) : (
            <div className="space-y-3">
              {data.connectedChannels.map((ch, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm capitalize font-medium">{ch.type.replace(/_/g, " ")}</span>
                  <span className="text-xs text-gray-400">Connected {new Date(ch.connectedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Usage Summary */}
      {usageEntries.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border rounded-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Usage Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {usageEntries.map(([key, count]) => (
              <div key={key} className="text-center">
                <p className="text-xl font-bold">{count}</p>
                <p className="text-xs text-gray-500 capitalize">{key.replace(/\./g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KPI({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: number; sub: string; color: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 border rounded-xl p-4">
      <Icon className={`h-5 w-5 ${color} mb-2`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}
