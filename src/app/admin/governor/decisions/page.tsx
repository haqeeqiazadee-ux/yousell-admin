'use client'

import { useEffect, useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { Zap, CheckCircle, XCircle, Undo2, Filter } from 'lucide-react'

interface Decision {
  id: string
  level: number
  decision_type: string
  description: string
  confidence: number
  applied: boolean
  approved_by: string | null
  reverted: boolean
  revertible: boolean
  affected_clients: string[]
  affected_engines: string[]
  created_at: string
}

export default function AIDecisionFeedPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [pendingCount, setPendingCount] = useState(0)

  async function loadDecisions() {
    try {
      const url = filter === 'pending'
        ? '/api/admin/governor/decisions?pending=true'
        : filter !== 'all'
        ? `/api/admin/governor/decisions?type=${filter}`
        : '/api/admin/governor/decisions'

      const res = await authFetch(url)
      if (res.ok) {
        const data = await res.json()
        setDecisions(data.decisions || [])
        setPendingCount(data.pending || 0)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDecisions() }, [filter])

  async function handleAction(decisionId: string, action: 'approve' | 'dismiss' | 'revert') {
    await authFetch('/api/admin/governor/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, decisionId, approvedBy: 'admin' }),
    })
    await loadDecisions()
  }

  const levelBadge = (level: number) => {
    if (level === 1) return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
    if (level === 2) return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
    return 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
  }

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = {
      reallocation: 'bg-indigo-100 text-indigo-700',
      anomaly: 'bg-red-100 text-red-700',
      health_route: 'bg-orange-100 text-orange-700',
      scaling: 'bg-emerald-100 text-emerald-700',
      cost_alert: 'bg-amber-100 text-amber-700',
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Zap size={24} /> AI Decision Feed
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Governor AI suggestions and automated actions
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="text-sm bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-medium">
            {pendingCount} pending approval
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-gray-400" />
        {['all', 'pending', 'reallocation', 'anomaly', 'scaling', 'cost_alert'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
            }`}>
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Decision List */}
      <div className="space-y-3">
        {decisions.map(d => (
          <div key={d.id} className={`bg-white dark:bg-gray-900 rounded-xl border p-4 ${
            d.reverted ? 'border-gray-200 dark:border-gray-800 opacity-60' :
            !d.applied && !d.approved_by ? 'border-amber-200 dark:border-amber-800' :
            'border-gray-200 dark:border-gray-800'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${levelBadge(d.level)}`}>
                    L{d.level}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${typeBadge(d.decision_type)}`}>
                    {d.decision_type.replace('_', ' ')}
                  </span>
                  {d.confidence > 0 && (
                    <span className="text-xs text-gray-400">{(d.confidence * 100).toFixed(0)}% confidence</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(d.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{d.description}</p>
                {d.affected_engines.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {d.affected_engines.map(e => (
                      <span key={e} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
                        {e}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Pending — show approve/dismiss */}
                {!d.applied && !d.approved_by && !d.reverted && (
                  <>
                    <button onClick={() => handleAction(d.id, 'approve')}
                      className="text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button onClick={() => handleAction(d.id, 'dismiss')}
                      className="text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <XCircle size={12} /> Dismiss
                    </button>
                  </>
                )}
                {/* Applied — show revert if revertible */}
                {d.applied && d.revertible && !d.reverted && (
                  <button onClick={() => handleAction(d.id, 'revert')}
                    className="text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Undo2 size={12} /> Revert
                  </button>
                )}
                {/* Status badges */}
                {d.applied && !d.reverted && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Applied</span>
                )}
                {d.reverted && (
                  <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Reverted</span>
                )}
                {d.approved_by?.startsWith('dismissed:') && (
                  <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Dismissed</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {decisions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Zap size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No AI decisions yet</p>
            <p className="text-xs text-gray-300 mt-1">Decisions will appear here as the Governor AI analyzes usage patterns</p>
          </div>
        )}
      </div>
    </div>
  )
}
