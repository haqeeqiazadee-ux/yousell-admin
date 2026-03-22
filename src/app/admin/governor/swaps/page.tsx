'use client'

import { useEffect, useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { RefreshCw, ArrowRight, Plus, Undo2 } from 'lucide-react'

interface Swap {
  id: string
  source_engine: string
  target_engine: string
  reason: string
  created_by: string
  activated_at: string
  expires_at: string | null
  active: boolean
}

const ENGINE_NAMES = [
  'discovery', 'tiktok-discovery', 'product-extraction', 'clustering',
  'trend-detection', 'creator-matching', 'opportunity-feed', 'ad-intelligence',
  'amazon-intelligence', 'shopify-intelligence', 'scoring', 'supplier-discovery',
  'influencer-discovery', 'content-engine', 'store-integration', 'order-tracking',
  'launch-blueprint', 'financial-model', 'pod-engine', 'affiliate-engine',
  'client-allocation', 'competitor-intelligence', 'profitability',
  'fulfillment-recommendation', 'admin-command-center',
]

export default function SwapManagerPage() {
  const [active, setActive] = useState<Swap[]>([])
  const [history, setHistory] = useState<Swap[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')
  const [reason, setReason] = useState('')
  const [expiresHours, setExpiresHours] = useState('24')
  const [creating, setCreating] = useState(false)

  async function loadSwaps() {
    try {
      const res = await authFetch('/api/admin/governor/swaps')
      if (res.ok) {
        const data = await res.json()
        setActive(data.active || [])
        setHistory(data.history || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSwaps() }, [])

  async function createSwap() {
    if (!source || !target || !reason) return
    setCreating(true)
    try {
      await authFetch('/api/admin/governor/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          sourceEngine: source,
          targetEngine: target,
          reason,
          createdBy: 'admin',
          expiresInHours: parseInt(expiresHours) || 24,
        }),
      })
      setSource(''); setTarget(''); setReason('')
      await loadSwaps()
    } finally {
      setCreating(false)
    }
  }

  async function revertSwap(swapId: string) {
    await authFetch('/api/admin/governor/swaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'revert', swapId }),
    })
    await loadSwaps()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <RefreshCw size={24} /> Engine Swap Manager
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Hot-swap engine implementations without downtime</p>
      </div>

      {/* Create Swap Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Plus size={16} /> Create New Swap
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Source Engine</label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
              <option value="">Select engine...</option>
              {ENGINE_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Replace With</label>
            <select value={target} onChange={e => setTarget(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800">
              <option value="">Select engine...</option>
              {ENGINE_NAMES.filter(n => n !== source).map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Reason</label>
            <input value={reason} onChange={e => setReason(e.target.value)}
              placeholder="e.g., Testing TikTok-first flow"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Auto-Revert (hours)</label>
            <div className="flex gap-2">
              <input value={expiresHours} onChange={e => setExpiresHours(e.target.value)} type="number" min="1" max="168"
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800" />
              <button onClick={createSwap} disabled={creating || !source || !target || !reason}
                className="gradient-blue text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1">
                <ArrowRight size={14} /> Swap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Swaps */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Active Swaps ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No active swaps</p>
        ) : (
          <div className="space-y-2">
            {active.map(s => (
              <div key={s.id} className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{s.source_engine}</span>
                  <ArrowRight size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-purple-600">{s.target_engine}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{s.reason}</span>
                  {s.expires_at && (
                    <span className="text-xs text-amber-600">Expires: {new Date(s.expires_at).toLocaleString()}</span>
                  )}
                  <button onClick={() => revertSwap(s.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                    <Undo2 size={12} /> Revert
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Swap History */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">History ({history.length})</h2>
          <div className="space-y-1">
            {history.slice(0, 20).map(s => (
              <div key={s.id} className="flex items-center justify-between py-2 text-sm text-gray-500">
                <span>{s.source_engine} → {s.target_engine}</span>
                <span className="text-xs">{s.reason} · {new Date(s.activated_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
