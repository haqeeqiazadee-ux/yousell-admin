'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import {
  Scan, X, ChevronDown, Clock, Package, AlertTriangle,
  CheckCircle, Loader2, ArrowLeft, BarChart2, Zap, TrendingUp
} from 'lucide-react'
import Link from 'next/link'

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

type ScanMode = 'quick' | 'full' | 'client'
type ScanStatus = 'idle' | 'confirming' | 'running' | 'completed' | 'failed' | 'cancelled'

interface ScanConfig {
  mode: ScanMode
  label: string
  description: string
  duration: string
  cost: string
  platforms: string[]
  color: string
  bg: string
}

const SCAN_CONFIGS: ScanConfig[] = [
  {
    mode: 'quick',
    label: '⚡ Quick Scan',
    description: 'Fast scan of TikTok & Amazon for trending products',
    duration: '~3 minutes',
    cost: '~$0.10',
    platforms: ['TikTok', 'Amazon'],
    color: 'text-blue-700',
    bg: 'bg-blue-600',
  },
  {
    mode: 'full',
    label: '🔍 Full Scan',
    description: 'All 7 discovery channels — comprehensive intelligence',
    duration: '~15 minutes',
    cost: '~$0.50',
    platforms: ['TikTok', 'Amazon', 'Shopify', 'Pinterest', 'Digital', 'AI Affiliates', 'Physical'],
    color: 'text-gray-700',
    bg: 'bg-gray-900',
  },
  {
    mode: 'client',
    label: '👥 Client Scan',
    description: 'Discover top 50 products per platform for client allocation',
    duration: '~8 minutes',
    cost: '~$0.30',
    platforms: ['TikTok', 'Amazon'],
    color: 'text-emerald-700',
    bg: 'bg-emerald-600',
  },
]

interface ScanHistory {
  id: string
  mode: string
  status: string
  products_found: number
  created_at: string
  duration_seconds: number
}

function ScanPageContent() {
  const searchParams = useSearchParams()
  const initialMode = (searchParams.get('mode') as ScanMode) || 'quick'

  const [selectedMode, setSelectedMode] = useState<ScanMode>(initialMode)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<ScanStatus>('idle')
  const [jobId, setJobId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<ScanHistory[]>([])
  const [productsFound, setProductsFound] = useState(0)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const config = SCAN_CONFIGS.find(c => c.mode === selectedMode)!

  useEffect(() => {
    fetchHistory()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [])

  async function fetchHistory() {
    const { data } = await getSupabase()
      .from('scan_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    if (data) setHistory(data)
  }

  function startConfirm() {
    setStatus('confirming')
    setError(null)
  }

  async function confirmScan() {
    setStatus('running')
    setProgress(5)
    setProgressLabel('Initialising scan...')
    setError(null)

    try {
      const { data: { session } } = await getSupabase().auth.getSession()
      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ mode: selectedMode, query }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to start scan')
      }

      const { jobId: id } = await res.json()
      setJobId(id)
      pollJobStatus(id)
    } catch (e: unknown) {
      setStatus('failed')
      setError(e instanceof Error ? e.message : 'Failed to start scan. Please try again.')
    }
  }

  function pollJobStatus(id: string) {
    pollRef.current = setInterval(async () => {
      try {
        const { data: { session } } = await getSupabase().auth.getSession()
        const res = await fetch(`/api/admin/scan?jobId=${id}`, {
          headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        })
        if (!res.ok) return
        const job = await res.json()

        setProgress(job.progress ?? progress)
        setProgressLabel(job.step ?? progressLabel)

        if (job.status === 'completed') {
          clearInterval(pollRef.current!)
          setStatus('completed')
          setProgress(100)
          setProgressLabel('Scan complete!')
          setProductsFound(job.productsFound ?? 0)
          fetchHistory()
        } else if (job.status === 'failed') {
          clearInterval(pollRef.current!)
          setStatus('failed')
          setError(job.error || 'Scan failed. Check logs for details.')
        }
      } catch {}
    }, 2000)
  }

  async function cancelScan() {
    if (!jobId) { setStatus('idle'); return }
    if (pollRef.current) clearInterval(pollRef.current)
    try {
      const { data: { session } } = await getSupabase().auth.getSession()
      await fetch(`/api/admin/scan?jobId=${jobId}`, {
        method: 'DELETE',
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      })
    } catch {}
    setStatus('cancelled')
    setProgress(0)
    setJobId(null)
  }

  function reset() {
    setStatus('idle')
    setProgress(0)
    setProgressLabel('')
    setError(null)
    setJobId(null)
    setProductsFound(0)
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Scan size={20} className="text-blue-600" /> Product Scanner
          </h1>
          <p className="text-sm text-gray-500">Discover trending products across all channels</p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Scan Controls */}
        <div className="lg:col-span-2 space-y-5">

          {/* Mode selector */}
          {status === 'idle' && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Select Scan Mode</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SCAN_CONFIGS.map(c => (
                  <button
                    key={c.mode}
                    onClick={() => setSelectedMode(c.mode)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedMode === c.mode
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">{c.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {c.platforms.slice(0, 3).map(p => (
                        <span key={p} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p}</span>
                      ))}
                      {c.platforms.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">+{c.platforms.length - 3}</span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{c.duration}</span>
                      <span className="text-xs font-medium text-gray-600">{c.cost}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Query input */}
              <div className="mt-4">
                <label className="text-xs font-medium text-gray-600 block mb-1.5">Search Query (optional)</label>
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="e.g., phone accessories, kitchen gadgets..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={startConfirm}
                className={`mt-4 w-full ${config.bg} text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
              >
                <Scan size={16} /> Start Scan
              </button>
            </div>
          )}

          {/* Confirmation dialog */}
          {status === 'confirming' && (
            <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Confirm Scan</h2>
              <p className="text-sm text-gray-500 mb-5">Review scan details before starting</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mode</span>
                  <span className="font-semibold text-gray-900">{config.label}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Platforms</span>
                  <span className="font-medium text-gray-700">{config.platforms.join(', ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Est. Duration</span>
                  <span className="font-medium text-gray-700">{config.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Est. Cost</span>
                  <span className="font-semibold text-emerald-600">{config.cost}</span>
                </div>
                {query && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Query</span>
                    <span className="font-medium text-gray-700">{query}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={reset} className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
                <button onClick={confirmScan} className={`flex-1 ${config.bg} text-white font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2`}>
                  <Zap size={14} /> Confirm & Start
                </button>
              </div>
            </div>
          )}

          {/* Running state */}
          {status === 'running' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Loader2 size={18} className="text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Scan Running</p>
                    <p className="text-xs text-gray-400">{config.label}</p>
                  </div>
                </div>
                <button
                  onClick={cancelScan}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <X size={14} /> Cancel Scan
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>{progressLabel || 'Processing...'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400">Scanning {config.platforms.join(', ')}...</p>
            </div>
          )}

          {/* Completed */}
          {status === 'completed' && (
            <div className="bg-white rounded-xl border border-emerald-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Scan Complete!</p>
                  <p className="text-sm text-gray-500">{productsFound} products discovered</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
                <div className="bg-emerald-500 h-2 rounded-full w-full" />
              </div>
              <div className="flex gap-3">
                <button onClick={reset} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  New Scan
                </button>
                <Link href="/admin" className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold text-center hover:bg-gray-800 transition-colors">
                  View Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Failed / Cancelled */}
          {(status === 'failed' || status === 'cancelled') && (
            <div className="bg-white rounded-xl border border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{status === 'cancelled' ? 'Scan Cancelled' : 'Scan Failed'}</p>
                  {error && <p className="text-sm text-red-600 mt-0.5">{error}</p>}
                </div>
              </div>
              <button onClick={reset} className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                Try Again
              </button>
            </div>
          )}

          {/* Scan Info Cards */}
          {status === 'idle' && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Zap, label: 'Pre-Viral Detection', desc: 'Spots trends 2–3 weeks before mainstream', color: 'text-amber-600', bg: 'bg-amber-50' },
                { icon: TrendingUp, label: '7 Discovery Channels', desc: 'TikTok, Amazon, Pinterest & more', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: BarChart2, label: 'Composite Scoring', desc: 'Trend × Viral × Profit analysis', color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
                    <item.icon size={15} className={item.color} />
                  </div>
                  <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Scan History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={15} className="text-gray-600" />
              <h2 className="text-sm font-semibold text-gray-900">Scan History</h2>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={22} className="text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No scans yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map(scan => (
                  <div key={scan.id} className="p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700 capitalize">{scan.mode} Scan</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        scan.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                        scan.status === 'failed' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {scan.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatTime(scan.created_at)}</span>
                      <span className="font-medium text-gray-600">{scan.products_found ?? 0} products</span>
                    </div>
                    {scan.duration_seconds && (
                      <p className="text-xs text-gray-300 mt-0.5">{scan.duration_seconds}s duration</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-blue-600" />
      </div>
    }>
      <ScanPageContent />
    </Suspense>
  )
}
