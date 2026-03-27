"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/auth-fetch"
import { DollarSign, Users, TrendingUp, TrendingDown, ArrowUpRight, RefreshCw } from "lucide-react"

interface RevenueData {
  mrr: number
  arr: number
  activeSubscriptions: number
  totalClients: number
  planBreakdown: Record<string, { count: number; revenue: number }>
  churn: { cancelled: number; pendingCancellation: number }
  growth: { newClientsLast30Days: number; conversionRate: number }
  usageSummary: Record<string, number>
  recentSubscriptions: Array<{
    id: string
    clientId: string
    plan: string
    status: string
    createdAt: string
    periodEnd: string
  }>
}

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const res = await authFetch("/api/admin/revenue")
      if (res.ok) setData(await res.json())
    } catch (err) {
      console.error("Failed to load revenue data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading revenue data...</div>
  if (!data) return <div className="p-6 text-red-600">Failed to load revenue data</div>

  const plans = Object.entries(data.planBreakdown)
  const usageEntries = Object.entries(data.usageSummary)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">MRR, ARR, churn, and subscription metrics.</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={DollarSign} label="MRR" value={`$${data.mrr.toLocaleString()}`} color="text-emerald-500" />
        <KPICard icon={TrendingUp} label="ARR" value={`$${data.arr.toLocaleString()}`} color="text-blue-500" />
        <KPICard icon={Users} label="Active Subs" value={data.activeSubscriptions.toString()} color="text-violet-500" />
        <KPICard icon={Users} label="Total Clients" value={data.totalClients.toString()} color="text-amber-500" />
      </div>

      {/* Growth & Churn */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={ArrowUpRight} label="New Clients (30d)" value={data.growth.newClientsLast30Days.toString()} color="text-emerald-500" />
        <KPICard icon={TrendingUp} label="Conversion Rate" value={`${data.growth.conversionRate}%`} color="text-blue-500" />
        <KPICard icon={TrendingDown} label="Cancelled" value={data.churn.cancelled.toString()} color="text-red-500" />
        <KPICard icon={TrendingDown} label="Pending Cancel" value={data.churn.pendingCancellation.toString()} color="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plan Breakdown */}
        <div className="bg-card border rounded-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Plan Breakdown</h2>
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active subscriptions</p>
          ) : (
            <div className="space-y-3">
              {plans.map(([plan, info]) => (
                <div key={plan} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium capitalize">{plan}</span>
                    <span className="text-xs text-muted-foreground ml-2">{info.count} subs</span>
                  </div>
                  <span className="font-semibold">${info.revenue}/mo</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Summary */}
        <div className="bg-card border rounded-xl p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Usage Summary</h2>
          {usageEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No usage data</p>
          ) : (
            <div className="space-y-3">
              {usageEntries.map(([metric, count]) => (
                <div key={metric} className="flex items-center justify-between">
                  <span className="text-sm capitalize">{metric.replace(/_/g, " ")}</span>
                  <span className="font-semibold">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Subscriptions</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Client</th>
              <th className="text-left px-4 py-2 font-medium">Plan</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-left px-4 py-2 font-medium">Created</th>
              <th className="text-left px-4 py-2 font-medium">Period End</th>
            </tr>
          </thead>
          <tbody>
            {data.recentSubscriptions.map(sub => (
              <tr key={sub.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-2 font-mono text-xs">{sub.clientId.slice(0, 8)}...</td>
                <td className="px-4 py-2 capitalize">{sub.plan}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    sub.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}>{sub.status}</span>
                </td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground">{sub.periodEnd ? new Date(sub.periodEnd).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {data.recentSubscriptions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No subscriptions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function KPICard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
