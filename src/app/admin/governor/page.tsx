'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { authFetch } from '@/lib/auth-fetch'
import {
  Shield, Activity, DollarSign, Users,
  AlertTriangle, ChevronRight, Cpu, RefreshCw,
  BarChart2, Zap, Settings,
} from 'lucide-react'

interface EngineFleetItem {
  name: string
  status: string
  healthy: boolean
  operations: number
  costUSD: number
  failures: number
  swappedTo: string | null
}

interface FleetData {
  engines: EngineFleetItem[]
  totalEngines: number
  totalOperations: number
  totalCostUSD: number
  activeSwaps: number
}

interface ClientEnvelope {
  id: string
  client_id: string
  clientName: string
  plan_tier: string
  global_cost_cap_usd: number
  total_spent_usd: number
  globalUtilizationPercent: number
  status: string
}

interface ClientsData {
  clients: ClientEnvelope[]
  total: number
  atRisk: number
}

interface AnalyticsData {
  totals: { operations: number; costUSD: number; failures: number; successRate: number }
  perEngine: { name: string; operations: number; costUSD: number }[]
  topClients: { clientId: string; costUSD: number }[]
  dailyTrend: { date: string; costUSD: number }[]
}

interface Decision {
  id: string
  level: number
  decision_type: string
  description: string
  confidence: number
  applied: boolean
  approved_by: string | null
  created_at: string
}

interface DecisionsData {
  decisions: Decision[]
  pending: number
  applied: number
}

export default function GovernorDashboard() {
  const [fleet, setFleet] = useState<FleetData | null>(null)
  const [clients, setClients] = useState<ClientsData | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [decisions, setDecisions] = useState<DecisionsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [fleetRes, clientsRes, analyticsRes, decisionsRes] = await Promise.all([
          authFetch('/api/admin/governor/fleet'),
          authFetch('/api/admin/governor/clients'),
          authFetch('/api/admin/governor/analytics?days=30'),
          authFetch('/api/admin/governor/decisions?pending=true'),
        ])

        if (fleetRes.ok) setFleet(await fleetRes.json())
        if (clientsRes.ok) setClients(await clientsRes.json())
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
        if (decisionsRes.ok) setDecisions(await decisionsRes.json())
      } catch (e) {
        console.error('Failed to load governor data:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statusColor = (status: string) => {
    if (status === 'blocked') return 'bg-red-100 text-red-700 border-red-200'
    if (status === 'throttled') return 'bg-amber-100 text-amber-700 border-amber-200'
    if (status === 'warning') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Shield size={24} /> Engine Governor
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Centralized engine orchestration, cost metering & AI optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/governor/overrides" className="text-xs font-medium bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg flex items-center gap-1.5">
            <Shield size={12} /> Overrides
          </Link>
          <Link href="/admin/governor/swaps" className="text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg flex items-center gap-1.5">
            <RefreshCw size={12} /> Swaps
          </Link>
          <Link href="/admin/settings" className="text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg flex items-center gap-1.5">
            <Settings size={12} /> Config
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Engines', value: fleet?.totalEngines ?? '—', icon: Cpu, gradient: 'gradient-blue' },
          { label: 'Operations (30d)', value: analytics?.totals.operations.toLocaleString() ?? '—', icon: Activity, gradient: 'gradient-emerald' },
          { label: 'Total Cost (30d)', value: analytics ? `$${analytics.totals.costUSD.toFixed(2)}` : '—', icon: DollarSign, gradient: 'gradient-coral' },
          { label: 'Clients at Risk', value: clients?.atRisk ?? '—', icon: AlertTriangle, gradient: 'gradient-amber' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className={`${kpi.gradient} text-white mb-3`} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <kpi.icon size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {loading ? '—' : kpi.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel A: Engine Fleet */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Cpu size={16} /> Engine Fleet
            </h2>
            <span className="text-xs text-gray-400">{fleet?.engines.length ?? 0} engines</span>
          </div>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {fleet?.engines.map(engine => (
              <div key={engine.name} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${engine.healthy ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{engine.name}</span>
                  {engine.swappedTo && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                      → {engine.swappedTo}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{engine.operations} ops</span>
                  <span>${engine.costUSD.toFixed(2)}</span>
                </div>
              </div>
            ))}
            {!fleet && !loading && <p className="text-sm text-gray-400 text-center py-4">No fleet data</p>}
          </div>
        </div>

        {/* Panel B: Client Budgets */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Users size={16} /> Client Budgets
            </h2>
            <Link href="/admin/clients" className="text-xs text-rose-600 flex items-center gap-1">
              All clients <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {clients?.clients.map(client => (
              <div key={client.id} className="py-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{client.clientName}</span>
                    <span className="text-xs text-gray-400 capitalize">{client.plan_tier}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor(client.status)}`}>
                    {client.status}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      client.globalUtilizationPercent >= 95 ? 'bg-red-500' :
                      client.globalUtilizationPercent >= 80 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(client.globalUtilizationPercent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                  <span>${Number(client.total_spent_usd).toFixed(2)} spent</span>
                  <span>${Number(client.global_cost_cap_usd).toFixed(2)} cap</span>
                </div>
              </div>
            ))}
            {clients?.clients.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No active envelopes</p>
            )}
          </div>
        </div>

        {/* Panel C: AI Decisions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Zap size={16} /> AI Decisions
            </h2>
            {(decisions?.pending ?? 0) > 0 && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {decisions?.pending} pending
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {decisions?.decisions.map(d => (
              <div key={d.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      d.level === 1 ? 'bg-blue-100 text-blue-700' :
                      d.level === 2 ? 'bg-amber-100 text-amber-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>L{d.level}</span>
                    <span className="text-xs text-gray-500 capitalize">{d.decision_type}</span>
                  </div>
                  <span className="text-xs text-gray-400">{d.confidence ? `${(d.confidence * 100).toFixed(0)}%` : ''}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{d.description}</p>
              </div>
            ))}
            {decisions?.decisions.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No AI decisions yet</p>
            )}
          </div>
        </div>

        {/* Panel D: Cost Analytics */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <BarChart2 size={16} /> Cost Analytics (30d)
            </h2>
          </div>
          {analytics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    ${analytics.totals.costUSD.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Total Cost</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {analytics.totals.successRate}%
                  </p>
                  <p className="text-xs text-gray-500">Success Rate</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Top Engines by Cost</p>
                {analytics.perEngine.slice(0, 5).map(e => (
                  <div key={e.name} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{e.name}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">${e.costUSD.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Loading analytics...</p>
          )}
        </div>
      </div>
    </div>
  )
}
