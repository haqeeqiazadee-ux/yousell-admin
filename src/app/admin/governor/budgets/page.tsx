'use client'

import { useEffect, useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { DollarSign, Users, AlertTriangle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'

interface EngineAllowanceUI {
  engineName: string
  enabled: boolean
  maxOperations: number
  usedOperations: number
  maxCostUSD: number
  usedCostUSD: number
  utilizationPercent: number
}

interface ClientEnvelope {
  id: string
  client_id: string
  clientName: string
  clientEmail: string
  plan_tier: string
  global_cost_cap_usd: number
  total_spent_usd: number
  globalUtilizationPercent: number
  status: string
  engine_allowances: Record<string, EngineAllowanceUI>
  period_start: string
  period_end: string
}

export default function BudgetPanelPage() {
  const [clients, setClients] = useState<ClientEnvelope[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterTier, setFilterTier] = useState<string>('all')

  async function loadClients() {
    try {
      const res = await authFetch('/api/admin/governor/clients')
      if (res.ok) {
        const data = await res.json()
        setClients(data.clients || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadClients() }, [])

  async function resetPeriod(clientId: string) {
    if (!confirm('Reset billing period for this client? This archives the current envelope and creates a fresh one.')) return
    await authFetch('/api/admin/governor/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, action: 'reset_period' }),
    })
    await loadClients()
  }

  async function adjustBudget(clientId: string) {
    const newCap = prompt('Enter new global cost cap (USD):')
    if (!newCap) return
    await authFetch('/api/admin/governor/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, action: 'adjust_budget', value: parseFloat(newCap) }),
    })
    await loadClients()
  }

  const filtered = filterTier === 'all' ? clients : clients.filter(c => c.plan_tier === filterTier)

  const statusColor = (status: string) => {
    if (status === 'blocked') return 'bg-red-100 text-red-700'
    if (status === 'throttled') return 'bg-amber-100 text-amber-700'
    if (status === 'warning') return 'bg-yellow-100 text-yellow-700'
    return 'bg-emerald-100 text-emerald-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <DollarSign size={24} /> Client Budget Panel
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Per-client budget envelopes and engine quotas</p>
        </div>
        <select value={filterTier} onChange={e => setFilterTier(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
          <option value="all">All tiers</option>
          <option value="starter">Starter</option>
          <option value="growth">Growth</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Clients', value: filtered.length, icon: Users },
          { label: 'At Risk', value: filtered.filter(c => c.status !== 'ok').length, icon: AlertTriangle },
          { label: 'Blocked', value: filtered.filter(c => c.status === 'blocked').length, icon: DollarSign },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <s.icon size={18} className="text-gray-400 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{loading ? '—' : s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {filtered.map(client => (
          <div key={client.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl"
              onClick={() => setExpanded(expanded === client.id ? null : client.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-coral flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{client.clientName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{client.clientName}</p>
                  <p className="text-xs text-gray-400">{client.plan_tier} · {client.clientEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(client.status)}`}>
                  {client.status}
                </span>
                <div className="w-24">
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className={`h-2 rounded-full ${
                      client.globalUtilizationPercent >= 95 ? 'bg-red-500' :
                      client.globalUtilizationPercent >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} style={{ width: `${Math.min(client.globalUtilizationPercent, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-0.5">{client.globalUtilizationPercent.toFixed(0)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">${Number(client.total_spent_usd).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">/ ${Number(client.global_cost_cap_usd).toFixed(2)}</p>
                </div>
                {expanded === client.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </div>

            {expanded === client.id && (
              <div className="border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-3">
                <div className="flex gap-2 mb-3">
                  <button onClick={() => adjustBudget(client.client_id)}
                    className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                    Adjust Budget
                  </button>
                  <button onClick={() => resetPeriod(client.client_id)}
                    className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 flex items-center gap-1">
                    <RotateCcw size={12} /> Reset Period
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {Object.entries(client.engine_allowances || {}).map(([name, allowance]) => {
                    const a = allowance as EngineAllowanceUI
                    if (!a.enabled) return null
                    const pct = a.maxOperations > 0 ? (a.usedOperations / a.maxOperations) * 100 : 0
                    return (
                      <div key={name} className="border border-gray-100 dark:border-gray-800 rounded-lg p-2">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{name}</p>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-1">
                          <div className={`h-1.5 rounded-full ${pct >= 95 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {a.usedOperations}/{a.maxOperations === -1 ? '∞' : a.maxOperations} ops
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && !loading && (
          <p className="text-sm text-gray-400 text-center py-8">No client envelopes found</p>
        )}
      </div>
    </div>
  )
}
