'use client'

import { useEffect, useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import {
  Globe, Plus, Activity, Trash2, RefreshCw, ArrowRight,
  CheckCircle, XCircle, Zap, Settings2, TestTube,
} from 'lucide-react'

interface ExternalEngine {
  id: string
  engine_key: string
  display_name: string
  api_endpoint: string
  auth_type: string
  auth_header_name: string
  auth_token_encrypted: string | null
  health_endpoint: string | null
  cost_per_operation_usd: number
  timeout_ms: number
  replaces_engine: string | null
  active: boolean
  last_health_check: string | null
  last_health_status: boolean | null
  metadata: Record<string, unknown>
  created_at: string
}

interface TestResult {
  reachable: boolean
  statusCode: number
  responseTimeMs: number
  error?: string
  testedUrl: string
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

export default function ExternalEnginesPage() {
  const [engines, setEngines] = useState<ExternalEngine[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [testing, setTesting] = useState<Record<string, boolean>>({})
  const [swapping, setSwapping] = useState<Record<string, boolean>>({})

  // Form state
  const [form, setForm] = useState({
    engineKey: '',
    displayName: '',
    apiEndpoint: '',
    authType: 'bearer',
    authHeaderName: 'Authorization',
    authToken: '',
    healthEndpoint: '/health',
    costPerOperationUsd: '0',
    timeoutMs: '30000',
    replacesEngine: '',
  })
  const [submitting, setSubmitting] = useState(false)

  async function loadEngines() {
    try {
      const res = await authFetch('/api/admin/governor/external-engines')
      if (res.ok) {
        const data = await res.json()
        setEngines(data.engines || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEngines() }, [])

  async function registerEngine() {
    if (!form.engineKey || !form.displayName || !form.apiEndpoint) return
    setSubmitting(true)
    try {
      const res = await authFetch('/api/admin/governor/external-engines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineKey: form.engineKey,
          displayName: form.displayName,
          apiEndpoint: form.apiEndpoint,
          authType: form.authType,
          authHeaderName: form.authHeaderName,
          authToken: form.authToken || undefined,
          healthEndpoint: form.healthEndpoint || undefined,
          costPerOperationUsd: parseFloat(form.costPerOperationUsd) || 0,
          timeoutMs: parseInt(form.timeoutMs) || 30000,
          replacesEngine: form.replacesEngine || undefined,
          createdBy: 'admin',
        }),
      })
      if (res.ok) {
        setForm({
          engineKey: '', displayName: '', apiEndpoint: '', authType: 'bearer',
          authHeaderName: 'Authorization', authToken: '', healthEndpoint: '/health',
          costPerOperationUsd: '0', timeoutMs: '30000', replacesEngine: '',
        })
        setShowForm(false)
        await loadEngines()
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function testEngine(engine: ExternalEngine) {
    setTesting(prev => ({ ...prev, [engine.id]: true }))
    try {
      const res = await authFetch('/api/admin/governor/external-engines/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: engine.id }),
      })
      if (res.ok) {
        const result = await res.json()
        setTestResults(prev => ({ ...prev, [engine.id]: result }))
        await loadEngines() // refresh health status
      }
    } finally {
      setTesting(prev => ({ ...prev, [engine.id]: false }))
    }
  }

  async function quickSwap(engine: ExternalEngine) {
    if (!engine.replaces_engine) return
    setSwapping(prev => ({ ...prev, [engine.id]: true }))
    try {
      await authFetch('/api/admin/governor/swaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          sourceEngine: engine.replaces_engine,
          isExternal: true,
          externalEngineId: engine.id,
          reason: `Swapped to external: ${engine.display_name}`,
          createdBy: 'admin',
          expiresInHours: 24,
        }),
      })
      await loadEngines()
    } finally {
      setSwapping(prev => ({ ...prev, [engine.id]: false }))
    }
  }

  async function deactivateEngine(id: string) {
    await authFetch(`/api/admin/governor/external-engines?id=${id}`, { method: 'DELETE' })
    await loadEngines()
  }

  const activeEngines = engines.filter(e => e.active)
  const inactiveEngines = engines.filter(e => !e.active)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Globe size={24} /> External Engines
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Register any platform API as an engine replacement
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="gradient-blue text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
        >
          <Plus size={14} /> Register Engine
        </button>
      </div>

      {/* Registration Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Settings2 size={16} /> Register External Engine API
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Engine Key *</label>
              <input
                value={form.engineKey}
                onChange={e => setForm(f => ({ ...f, engineKey: e.target.value }))}
                placeholder="ext-openai-scoring"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-400 mt-0.5">Lowercase, hyphens only</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Display Name *</label>
              <input
                value={form.displayName}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="OpenAI Scoring Engine"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">API Endpoint *</label>
              <input
                value={form.apiEndpoint}
                onChange={e => setForm(f => ({ ...f, apiEndpoint: e.target.value }))}
                placeholder="https://api.example.com/v1/engine"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Auth Type</label>
              <select
                value={form.authType}
                onChange={e => setForm(f => ({ ...f, authType: e.target.value }))}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="bearer">Bearer Token</option>
                <option value="api_key">API Key</option>
                <option value="header">Custom Header</option>
                <option value="none">None</option>
              </select>
            </div>
            {form.authType !== 'none' && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Auth Header Name</label>
                  <input
                    value={form.authHeaderName}
                    onChange={e => setForm(f => ({ ...f, authHeaderName: e.target.value }))}
                    placeholder="Authorization"
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Auth Token</label>
                  <input
                    value={form.authToken}
                    onChange={e => setForm(f => ({ ...f, authToken: e.target.value }))}
                    type="password"
                    placeholder="sk-..."
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                  <p className="text-xs text-gray-400 mt-0.5">Encrypted with AES-256-GCM before storage</p>
                </div>
              </>
            )}
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Health Endpoint</label>
              <input
                value={form.healthEndpoint}
                onChange={e => setForm(f => ({ ...f, healthEndpoint: e.target.value }))}
                placeholder="/health"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Cost per Operation (USD)</label>
              <input
                value={form.costPerOperationUsd}
                onChange={e => setForm(f => ({ ...f, costPerOperationUsd: e.target.value }))}
                type="number" step="0.01" min="0"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Timeout (ms)</label>
              <input
                value={form.timeoutMs}
                onChange={e => setForm(f => ({ ...f, timeoutMs: e.target.value }))}
                type="number" min="1000" max="120000"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">Replaces Engine</label>
              <select
                value={form.replacesEngine}
                onChange={e => setForm(f => ({ ...f, replacesEngine: e.target.value }))}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">Select engine to replace...</option>
                {ENGINE_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-0.5">Which internal engine this can replace</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={registerEngine}
              disabled={submitting || !form.engineKey || !form.displayName || !form.apiEndpoint}
              className="gradient-blue text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-1"
            >
              <Plus size={14} /> Register
            </button>
          </div>
        </div>
      )}

      {/* Active External Engines */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Activity size={16} /> Registered Engines ({activeEngines.length})
        </h2>
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">Loading...</p>
        ) : activeEngines.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No external engines registered. Click &quot;Register Engine&quot; to add one.
          </p>
        ) : (
          <div className="space-y-3">
            {activeEngines.map(engine => (
              <div key={engine.id} className="border border-gray-100 dark:border-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {engine.last_health_status === true && (
                        <CheckCircle size={14} className="text-emerald-500" />
                      )}
                      {engine.last_health_status === false && (
                        <XCircle size={14} className="text-red-500" />
                      )}
                      {engine.last_health_status === null && (
                        <span className="w-3.5 h-3.5 rounded-full bg-gray-300 inline-block" />
                      )}
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {engine.display_name}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded font-mono">
                        {engine.engine_key}
                      </span>
                      {engine.replaces_engine && (
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <ArrowRight size={10} /> replaces {engine.replaces_engine}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="font-mono">{engine.api_endpoint}</span>
                      <span>${Number(engine.cost_per_operation_usd).toFixed(4)}/op</span>
                      <span>{engine.timeout_ms}ms timeout</span>
                      <span>{engine.auth_type}</span>
                      {engine.last_health_check && (
                        <span>Checked: {new Date(engine.last_health_check).toLocaleString()}</span>
                      )}
                    </div>
                    {/* Test result display */}
                    {testResults[engine.id] && (
                      <div className={`mt-2 text-xs px-3 py-1.5 rounded ${
                        testResults[engine.id].reachable
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                      }`}>
                        {testResults[engine.id].reachable
                          ? `Reachable (${testResults[engine.id].statusCode}) — ${testResults[engine.id].responseTimeMs}ms`
                          : `Unreachable: ${testResults[engine.id].error || `Status ${testResults[engine.id].statusCode}`}`
                        }
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => testEngine(engine)}
                      disabled={testing[engine.id]}
                      className="text-xs font-medium bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50"
                    >
                      <TestTube size={12} /> {testing[engine.id] ? 'Testing...' : 'Test'}
                    </button>
                    {engine.replaces_engine && (
                      <button
                        onClick={() => quickSwap(engine)}
                        disabled={swapping[engine.id]}
                        className="text-xs font-medium bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50"
                      >
                        <Zap size={12} /> {swapping[engine.id] ? 'Swapping...' : 'Quick Swap'}
                      </button>
                    )}
                    <button
                      onClick={() => deactivateEngine(engine.id)}
                      className="text-xs text-red-600 hover:text-red-800 px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inactive Engines */}
      {inactiveEngines.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Inactive ({inactiveEngines.length})
          </h2>
          <div className="space-y-1">
            {inactiveEngines.map(engine => (
              <div key={engine.id} className="flex items-center justify-between py-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <XCircle size={12} />
                  <span>{engine.display_name}</span>
                  <span className="font-mono text-xs">{engine.engine_key}</span>
                </div>
                <span className="text-xs">{engine.api_endpoint}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
