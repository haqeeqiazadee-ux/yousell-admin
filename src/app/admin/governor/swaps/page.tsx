'use client'

import { useEffect, useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { RefreshCw, ArrowRight, Plus, Undo2, Globe } from 'lucide-react'

interface ExternalEngineRef {
  display_name: string
  engine_key: string
  api_endpoint: string
  active: boolean
  last_health_status: boolean | null
}

interface Swap {
  id: string
  source_engine: string
  target_engine: string
  reason: string
  created_by: string
  activated_at: string
  expires_at: string | null
  active: boolean
  is_external: boolean
  external_engine_id: string | null
  external_engines: ExternalEngineRef | null
}

interface ExternalEngine {
  id: string
  engine_key: string
  display_name: string
  replaces_engine: string | null
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
  const [externalEngines, setExternalEngines] = useState<ExternalEngine[]>([])
  const [, setLoading] = useState(true)

  // Form state
  const [swapMode, setSwapMode] = useState<'internal' | 'external'>('internal')
  const [source, setSource] = useState('')
  const [target, setTarget] = useState('')
  const [externalEngineId, setExternalEngineId] = useState('')
  const [reason, setReason] = useState('')
  const [expiresHours, setExpiresHours] = useState('24')
  const [creating, setCreating] = useState(false)

  async function loadSwaps() {
    try {
      const [swapRes, extRes] = await Promise.all([
        authFetch('/api/admin/governor/swaps'),
        authFetch('/api/admin/governor/external-engines'),
      ])
      if (swapRes.ok) {
        const data = await swapRes.json()
        setActive(data.active || [])
        setHistory(data.history || [])
      }
      if (extRes.ok) {
        const data = await extRes.json()
        setExternalEngines((data.engines || []).filter((e: ExternalEngine) => e.active))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSwaps() }, [])

  async function createSwap() {
    if (!source || !reason) return
    if (swapMode === 'internal' && !target) return
    if (swapMode === 'external' && !externalEngineId) return

    setCreating(true)
    try {
      await authFetch('/api/admin/governor/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          sourceEngine: source,
          ...(swapMode === 'external'
            ? { isExternal: true, externalEngineId }
            : { targetEngine: target }
          ),
          reason,
          createdBy: 'admin',
          expiresInHours: parseInt(expiresHours) || 24,
        }),
      })
      setSource(''); setTarget(''); setExternalEngineId(''); setReason('')
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

  function getTargetDisplay(swap: Swap) {
    if (swap.is_external && swap.external_engines) {
      return swap.external_engines.display_name
    }
    return swap.target_engine
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <RefreshCw size={24} /> Engine Swap Manager
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Hot-swap engine implementations — internal or external API</p>
      </div>

      {/* Create Swap Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Plus size={16} /> Create New Swap
        </h2>

        {/* Swap Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSwapMode('internal')}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
              swapMode === 'internal'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <RefreshCw size={12} /> Internal Engine
          </button>
          <button
            onClick={() => setSwapMode('external')}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
              swapMode === 'external'
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Globe size={12} /> External API
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Source Engine</label>
            <select value={source} onChange={e => setSource(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              <option value="">Select engine...</option>
              {ENGINE_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          {swapMode === 'internal' ? (
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Replace With (Internal)</label>
              <select value={target} onChange={e => setTarget(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="">Select engine...</option>
                {ENGINE_NAMES.filter(n => n !== source).map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Replace With (External API)</label>
              <select value={externalEngineId} onChange={e => setExternalEngineId(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="">Select external engine...</option>
                {externalEngines.map(e => (
                  <option key={e.id} value={e.id}>{e.display_name} ({e.engine_key})</option>
                ))}
              </select>
              {externalEngines.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">No external engines registered. Register one first.</p>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Reason</label>
            <input value={reason} onChange={e => setReason(e.target.value)}
              placeholder="e.g., Testing external scoring API"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Auto-Revert (hours)</label>
            <div className="flex gap-2">
              <input value={expiresHours} onChange={e => setExpiresHours(e.target.value)} type="number" min="1" max="168"
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
              <button onClick={createSwap}
                disabled={creating || !source || !reason || (swapMode === 'internal' ? !target : !externalEngineId)}
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
                  <span className={`text-sm font-medium ${s.is_external ? 'text-purple-600' : 'text-blue-600'}`}>
                    {getTargetDisplay(s)}
                  </span>
                  {s.is_external && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Globe size={10} /> External
                    </span>
                  )}
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
                <div className="flex items-center gap-2">
                  <span>{s.source_engine} → {getTargetDisplay(s)}</span>
                  {s.is_external && (
                    <Globe size={10} className="text-purple-400" />
                  )}
                </div>
                <span className="text-xs">{s.reason} · {new Date(s.activated_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
