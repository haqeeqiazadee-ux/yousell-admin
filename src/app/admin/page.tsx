'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import {
  Zap, TrendingUp, Users, Package, ShoppingBag, Activity,
  ArrowRight, Clock, AlertTriangle, CheckCircle, XCircle,
  BarChart2, Scan, Settings, Bell, ChevronRight, Flame,
  Target, DollarSign, Eye
} from 'lucide-react'

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

interface Stats {
  productsTracked: number
  activeTrends: number
  competitors: number
  tiktokProducts: number
  amazonListings: number
  hotProducts: number
}

interface ScanHistory {
  id: string
  mode: string
  status: string
  products_found: number
  created_at: string
  duration_seconds: number
}

interface PreViralProduct {
  id: string
  name: string
  viral_score: number
  trend_stage: string
  platform: string
  final_score: number
}

interface SystemStatus {
  label: string
  status: 'connected' | 'warning' | 'error'
  detail: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    productsTracked: 0, activeTrends: 0, competitors: 0,
    tiktokProducts: 0, amazonListings: 0, hotProducts: 0
  })
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([])
  const [preViralProducts, setPreViralProducts] = useState<PreViralProduct[]>([])
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const systemStatus: SystemStatus[] = [
    { label: 'Supabase', status: 'connected', detail: 'Connected' },
    { label: 'Auth + RBAC', status: 'connected', detail: 'Connected' },
    { label: 'AI Engine (Claude)', status: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ? 'connected' : 'warning', detail: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY ? 'Active' : 'Not Configured' },
    { label: 'Resend Email', status: process.env.NEXT_PUBLIC_RESEND_API_KEY ? 'connected' : 'warning', detail: process.env.NEXT_PUBLIC_RESEND_API_KEY ? 'Active' : 'Not Configured' },
    { label: 'Apify Scrapers', status: 'warning', detail: 'Not Configured' },
    { label: 'RapidAPI', status: 'warning', detail: 'Not Configured' },
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        const sb = getSupabase()
        const [products, scans] = await Promise.all([
          sb.from('products').select('id, name, viral_score, trend_stage, platform, final_score, channel').order('final_score', { ascending: false }),
          sb.from('scan_history').select('*').order('created_at', { ascending: false }).limit(5),
        ])

        if (products.data) {
          const all = products.data
          setStats({
            productsTracked: all.length,
            activeTrends: all.filter(p => ['emerging', 'rising'].includes(p.trend_stage)).length,
            competitors: 0,
            tiktokProducts: all.filter(p => p.platform === 'tiktok').length,
            amazonListings: all.filter(p => p.platform === 'amazon').length,
            hotProducts: all.filter(p => (p.viral_score ?? 0) >= 80).length,
          })
          setPreViralProducts(all.filter(p => (p.viral_score ?? 0) >= 70).slice(0, 5))
        }

        if (scans.data) {
          setScanHistory(scans.data)
          if (scans.data.length > 0) setLastScan(scans.data[0].created_at)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function formatTime(iso: string) {
    const d = new Date(iso)
    const diff = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  const kpis = [
    { label: 'Products Tracked', value: stats.productsTracked, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Trends', value: stats.activeTrends, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'TikTok Products', value: stats.tiktokProducts, icon: Activity, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Amazon Listings', value: stats.amazonListings, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Hot Products 🔥', value: stats.hotProducts, icon: Flame, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Competitors', value: stats.competitors, icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">YouSell Admin Intelligence Platform</p>
        </div>
        <div className="flex items-center gap-3">
          {lastScan && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} /> Last scan: {formatTime(lastScan)}
            </span>
          )}
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            System Online
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Pre-Viral Alert Strip */}
        {preViralProducts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">
                  Pre-Viral Opportunities — {preViralProducts.length} product{preViralProducts.length > 1 ? 's' : ''} detected
                </span>
              </div>
              <Link href="/admin/scan" className="text-xs text-amber-700 font-medium flex items-center gap-1 hover:text-amber-900">
                View All <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {preViralProducts.map(p => (
                <div key={p.id} className="flex-shrink-0 bg-white border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber-700">{Math.round(p.viral_score)}</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-900 max-w-[120px] truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.trend_stage} · {p.platform}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No products yet */}
        {!loading && preViralProducts.length === 0 && stats.productsTracked === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span className="text-sm font-medium text-amber-800">Pre-Viral Opportunities — No products detected yet</span>
              <span className="text-sm text-amber-600">Run a scan from the Scan Control Panel to discover trending products</span>
            </div>
            <Link href="/admin/scan" className="text-xs font-semibold bg-amber-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-amber-600 transition-colors">
              <Scan size={12} /> Run Scan
            </Link>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map(kpi => (
            <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : kpi.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Scan Control Panel */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Scan size={16} className="text-gray-700" />
              <h2 className="font-semibold text-gray-900">Scan Control Panel</h2>
            </div>
            <div className="space-y-3">
              <Link href="/admin/scan?mode=quick" className="block w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">⚡ Quick Scan</p>
                    <p className="text-xs text-blue-200 mt-0.5">TikTok + Amazon · ~3 min · ~$0.10</p>
                  </div>
                  <ArrowRight size={16} />
                </div>
              </Link>
              <Link href="/admin/scan?mode=full" className="block w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-3 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">🔍 Full Scan</p>
                    <p className="text-xs text-gray-400 mt-0.5">All 7 channels · ~15 min · ~$0.50</p>
                  </div>
                  <ArrowRight size={16} />
                </div>
              </Link>
              <Link href="/admin/scan?mode=client" className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-3 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">👥 Client Scan</p>
                    <p className="text-xs text-emerald-200 mt-0.5">Top 50 per platform · ~$0.30</p>
                  </div>
                  <ArrowRight size={16} />
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-gray-700" />
              <h2 className="font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              {[
                { href: '/admin/scan', label: 'Run Product Scan', icon: Scan, color: 'text-blue-600' },
                { href: '/admin/setup', label: 'Configure API Keys', icon: Settings, color: 'text-gray-600' },
                { href: '/admin/clients', label: 'Manage Clients', icon: Users, color: 'text-emerald-600' },
                { href: '/admin/allocate', label: 'Allocate Products', icon: Package, color: 'text-purple-600' },
                { href: '/admin/affiliates', label: 'View Affiliates', icon: DollarSign, color: 'text-orange-600' },
                { href: '/admin/blueprints', label: 'Launch Blueprints', icon: Eye, color: 'text-pink-600' },
              ].map(action => (
                <Link key={action.href} href={action.href} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <action.icon size={15} className={action.color} />
                    <span className="text-sm text-gray-700">{action.label}</span>
                  </div>
                  <ArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-gray-700" />
              <h2 className="font-semibold text-gray-900">System Status</h2>
            </div>
            <div className="space-y-2.5">
              {systemStatus.map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{s.label}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    s.status === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    s.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {s.detail}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/admin/setup" className="mt-4 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
              Configure integrations <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Scan History + Live Trend Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Scan History */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-700" />
                <h2 className="font-semibold text-gray-900">Scan History</h2>
              </div>
              <Link href="/admin/scan" className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            {scanHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No scans yet</p>
                <p className="text-xs text-gray-300 mt-1">Run your first scan to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scanHistory.map(scan => (
                  <div key={scan.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        scan.status === 'completed' ? 'bg-emerald-400' :
                        scan.status === 'failed' ? 'bg-red-400' : 'bg-amber-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-700 capitalize">{scan.mode} Scan</p>
                        <p className="text-xs text-gray-400">{formatTime(scan.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{scan.products_found ?? 0} products</p>
                      <p className="text-xs text-gray-400">{scan.duration_seconds ? `${scan.duration_seconds}s` : '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live Trend Feed */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={16} className="text-gray-700" />
              <h2 className="font-semibold text-gray-900">Live Trend Feed</h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-auto">Realtime</span>
            </div>
            {stats.productsTracked === 0 ? (
              <div className="text-center py-8">
                <Activity size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No activity yet</p>
                <p className="text-xs text-gray-300 mt-1">Real-time updates will appear here when scans detect new products</p>
              </div>
            ) : (
              <div className="space-y-2">
                {preViralProducts.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      (p.final_score ?? 0) >= 80 ? 'bg-red-100 text-red-700' :
                      (p.final_score ?? 0) >= 60 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {Math.round(p.final_score ?? 0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.trend_stage} · {p.platform}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.trend_stage === 'exploding' ? 'bg-red-50 text-red-600' :
                      p.trend_stage === 'rising' ? 'bg-amber-50 text-amber-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {p.trend_stage}
                    </span>
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
