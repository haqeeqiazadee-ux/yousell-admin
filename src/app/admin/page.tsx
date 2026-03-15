'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { authFetch } from '@/lib/auth-fetch'
import {
  Zap, TrendingUp, Users, Package, Activity,
  ArrowRight, Clock,
  BarChart2, Scan, Settings, ChevronRight, Flame,
  Target, DollarSign, Eye, Music2, ShoppingCart, Store,
  UserSearch, Bot
} from 'lucide-react'

let _browserClient: ReturnType<typeof createBrowserClient> | null = null
function getSupabase() {
  if (!_browserClient) {
    _browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  }
  return _browserClient
}

interface Stats {
  productsTracked: number
  activeTrends: number
  competitors: number
  tiktokProducts: number
  amazonListings: number
  hotProducts: number
}

interface RevenueMetrics {
  mrr: number
  activeSubscriptions: number
  totalClients: number
  totalAllocations: number
  planBreakdown: Record<string, number>
}

interface RecentClient {
  id: string
  name: string
  created_at: string
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
  title: string
  viral_score: number | null
  trend_stage: string
  platform: string
  final_score: number | null
}

interface SystemStatus {
  label: string
  status: 'connected' | 'warning' | 'error'
  detail: string
}

// FastMoss-style feature category cards
const featureCategories = [
  {
    title: 'Discover Products',
    icon: Scan,
    gradient: 'gradient-coral',
    href: '/admin/scan',
    items: [
      { label: 'Quick Product Scan', href: '/admin/scan?mode=quick' },
      { label: 'Full Channel Scan', href: '/admin/scan?mode=full', badge: 'NEW' },
      { label: 'All Products', href: '/admin/products' },
    ],
  },
  {
    title: 'Find Trends',
    icon: TrendingUp,
    gradient: 'gradient-teal',
    href: '/admin/trends',
    items: [
      { label: 'Trend Scout', href: '/admin/trends' },
      { label: 'TikTok Intelligence', href: '/admin/tiktok', badge: 'NEW' },
      { label: 'Product Clusters', href: '/admin/clusters' },
    ],
  },
  {
    title: 'Find Shops',
    icon: Store,
    gradient: 'gradient-blue',
    href: '/admin/shopify',
    items: [
      { label: 'Amazon FBA', href: '/admin/amazon' },
      { label: 'Shopify DTC', href: '/admin/shopify' },
      { label: 'Competitor Stores', href: '/admin/competitors' },
    ],
  },
  {
    title: 'Find Creators',
    icon: UserSearch,
    gradient: 'gradient-purple',
    href: '/admin/influencers',
    items: [
      { label: 'Creator Matches', href: '/admin/creator-matches' },
      { label: 'Influencer Database', href: '/admin/influencers' },
      { label: 'Supplier Discovery', href: '/admin/suppliers' },
    ],
  },
  {
    title: 'AI Intelligence',
    icon: Bot,
    gradient: 'gradient-pink',
    href: '/admin/ads',
    items: [
      { label: 'Ad Intelligence', href: '/admin/ads', badge: 'NEW' },
      { label: 'AI Affiliates', href: '/admin/affiliates/ai' },
      { label: 'Launch Blueprints', href: '/admin/blueprints' },
    ],
  },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    productsTracked: 0, activeTrends: 0, competitors: 0,
    tiktokProducts: 0, amazonListings: 0, hotProducts: 0
  })
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([])
  const [preViralProducts, setPreViralProducts] = useState<PreViralProduct[]>([])
  const [lastScan, setLastScan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [revenue, setRevenue] = useState<RevenueMetrics>({
    mrr: 0, activeSubscriptions: 0, totalClients: 0, totalAllocations: 0, planBreakdown: {}
  })
  const [recentClients, setRecentClients] = useState<RecentClient[]>([])
  const [serviceStatus, setServiceStatus] = useState<Record<string, boolean>>({})

  const systemStatus: SystemStatus[] = [
    { label: 'Supabase', status: serviceStatus.supabase ? 'connected' : 'warning', detail: serviceStatus.supabase ? 'Connected' : 'Check Config' },
    { label: 'Auth + RBAC', status: serviceStatus.auth ? 'connected' : 'warning', detail: serviceStatus.auth ? 'Connected' : 'Check Config' },
    { label: 'AI Engine (Claude)', status: serviceStatus.ai ? 'connected' : 'warning', detail: serviceStatus.ai ? 'Active' : 'Not Configured' },
    { label: 'Resend Email', status: serviceStatus.email ? 'connected' : 'warning', detail: serviceStatus.email ? 'Active' : 'Not Configured' },
    { label: 'Apify Scrapers', status: serviceStatus.apify ? 'connected' : 'warning', detail: serviceStatus.apify ? 'Active' : 'Not Configured' },
    { label: 'RapidAPI', status: serviceStatus.rapidapi ? 'connected' : 'warning', detail: serviceStatus.rapidapi ? 'Active' : 'Not Configured' },
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await authFetch('/api/admin/dashboard')
        if (!res.ok) {
          console.error('Dashboard API returned', res.status)
          setLoading(false)
          return
        }

        const d = await res.json()

        if (d.services) setServiceStatus(d.services)
        if (d.revenue) setRevenue(d.revenue)
        if (d.recentClients) setRecentClients(d.recentClients)

        const productsList = d.productsList as { id: string; title: string; viral_score: number | null; trend_stage: string; platform: string; final_score: number | null; channel: string }[] || []
        setStats({
          productsTracked: d.products ?? productsList.length,
          activeTrends: d.trends ?? productsList.filter((p: { trend_stage: string }) => ['emerging', 'rising'].includes(p.trend_stage)).length,
          tiktokProducts: d.tiktok ?? 0,
          amazonListings: d.amazon ?? 0,
          hotProducts: productsList.filter((p: { viral_score: number | null }) => (p.viral_score ?? 0) >= 80).length,
          competitors: d.competitors ?? 0,
        })
        setPreViralProducts(productsList.filter((p: { viral_score: number | null }) => (p.viral_score ?? 0) >= 70).slice(0, 5))

        const scans = d.scanHistory || []
        setScanHistory(scans.map((s: Record<string, unknown>) => ({
          ...s,
          mode: s.scan_mode || s.mode,
          created_at: s.started_at || s.created_at,
        })))
        if (scans.length > 0) setLastScan((scans[0].started_at || scans[0].created_at) as string)
      } catch (e) {
        console.error('Failed to load dashboard data:', e)
        setError('Failed to load dashboard data. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    const sb = getSupabase()
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    const debouncedFetch = (payload: unknown) => {
      console.log('[Realtime] change received:', payload)
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => { fetchData() }, 2000)
    }
    const channel = sb.channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, debouncedFetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scan_history' }, debouncedFetch)
      .subscribe((status: string) => {
        console.log('[Realtime] channel status:', status)
      })

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      sb.removeChannel(channel)
    }
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
    { label: 'Products Tracked', value: stats.productsTracked, icon: Package, gradient: 'gradient-blue', ringColor: 'ring-blue-200' },
    { label: 'Active Trends', value: stats.activeTrends, icon: TrendingUp, gradient: 'gradient-emerald', ringColor: 'ring-emerald-200' },
    { label: 'TikTok Products', value: stats.tiktokProducts, icon: Music2, gradient: 'gradient-pink', ringColor: 'ring-pink-200' },
    { label: 'Amazon Listings', value: stats.amazonListings, icon: ShoppingCart, gradient: 'gradient-orange', ringColor: 'ring-orange-200' },
    { label: 'Hot Products', value: stats.hotProducts, icon: Flame, gradient: 'gradient-coral', ringColor: 'ring-red-200' },
    { label: 'Competitors', value: stats.competitors, icon: Target, gradient: 'gradient-purple', ringColor: 'ring-purple-200' },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">YouSell Admin Intelligence Platform</p>
        </div>
        <div className="flex items-center gap-3">
          {lastScan && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} /> Last scan: {formatTime(lastScan)}
            </span>
          )}
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
            System Online
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-2">
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Feature Category Cards — FastMoss Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {featureCategories.map(cat => (
          <div key={cat.title} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 card-hover">
            <Link href={cat.href} className="flex items-center gap-3 mb-3">
              <span className={`${cat.gradient} icon-circle-lg text-white`} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <cat.icon size={18} />
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{cat.title}</span>
            </Link>
            <div className="space-y-1.5 pl-1">
              {cat.items.map(item => (
                <Link key={item.href} href={item.href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors py-0.5 group">
                  <span className="text-gray-300 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors">&#8250;</span>
                  <span className="truncate">{item.label}</span>
                  {item.badge && <span className="badge-new">{item.badge}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pre-Viral Alert Strip */}
      {preViralProducts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="gradient-amber icon-circle text-white" style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={14} />
              </span>
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Pre-Viral Opportunities — {preViralProducts.length} product{preViralProducts.length > 1 ? 's' : ''} detected
              </span>
            </div>
            <Link href="/admin/products" className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1 hover:text-amber-900">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {preViralProducts.map(p => (
              <div key={p.id} className="flex-shrink-0 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 flex items-center gap-2.5 card-hover">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                  (p.viral_score ?? 0) >= 90 ? 'gradient-coral text-white' :
                  (p.viral_score ?? 0) >= 80 ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {Math.round(p.viral_score ?? 0)}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-gray-100 max-w-[130px] truncate">{p.title}</p>
                  <p className="text-xs text-gray-400 capitalize">{p.trend_stage} · {p.platform}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No products yet */}
      {!loading && preViralProducts.length === 0 && stats.productsTracked === 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="gradient-amber icon-circle text-white" style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={14} />
            </span>
            <div>
              <span className="text-sm font-medium text-amber-800">Pre-Viral Opportunities — No products detected yet</span>
              <p className="text-xs text-amber-600 mt-0.5">Run a scan from the Scan Control Panel to discover trending products</p>
            </div>
          </div>
          <Link href="/admin/scan" className="text-xs font-semibold gradient-coral text-white px-4 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <Scan size={12} /> Run Scan
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 card-hover">
            <div className={`${kpi.gradient} icon-circle-lg text-white mb-3`} style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <kpi.icon size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{loading ? '—' : kpi.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue & SaaS Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Recurring Revenue', value: loading ? '—' : `$${revenue.mrr.toLocaleString()}`, icon: DollarSign, gradient: 'gradient-emerald' },
          { label: 'Active Subscriptions', value: loading ? '—' : revenue.activeSubscriptions, icon: Activity, gradient: 'gradient-blue' },
          { label: 'Total Clients', value: loading ? '—' : revenue.totalClients, icon: Users, gradient: 'gradient-teal' },
          { label: 'Products Allocated', value: loading ? '—' : revenue.totalAllocations, icon: Package, gradient: 'gradient-purple' },
        ].map(metric => (
          <div key={metric.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 card-hover">
            <div className={`${metric.gradient} icon-circle-lg text-white mb-3`} style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <metric.icon size={16} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Scan Control Panel */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="gradient-teal icon-circle text-white" style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Scan size={14} />
            </span>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Scan Control Panel</h2>
          </div>
          <div className="space-y-3">
            <Link href="/admin/scan?mode=quick" className="block w-full gradient-blue text-white rounded-lg px-4 py-3 transition-opacity hover:opacity-90">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Quick Scan</p>
                  <p className="text-xs text-blue-100 mt-0.5">TikTok + Amazon · ~3 min · ~$0.10</p>
                </div>
                <ArrowRight size={16} />
              </div>
            </Link>
            <Link href="/admin/scan?mode=full" className="block w-full bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-lg px-4 py-3 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Full Scan</p>
                  <p className="text-xs text-gray-400 mt-0.5">All 7 channels · ~15 min · ~$0.50</p>
                </div>
                <ArrowRight size={16} />
              </div>
            </Link>
            <Link href="/admin/scan?mode=client" className="block w-full gradient-emerald text-white rounded-lg px-4 py-3 transition-opacity hover:opacity-90">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Client Scan</p>
                  <p className="text-xs text-emerald-100 mt-0.5">Top 50 per platform · ~$0.30</p>
                </div>
                <ArrowRight size={16} />
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="gradient-amber icon-circle text-white" style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={14} />
            </span>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h2>
          </div>
          <div className="space-y-1">
            {[
              { href: '/admin/scan', label: 'Run Product Scan', icon: Scan, iconColor: 'text-blue-600', iconBg: 'bg-blue-50' },
              { href: '/admin/setup', label: 'Configure API Keys', icon: Settings, iconColor: 'text-gray-600', iconBg: 'bg-gray-100' },
              { href: '/admin/clients', label: 'Manage Clients', icon: Users, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50' },
              { href: '/admin/allocate', label: 'Allocate Products', icon: Package, iconColor: 'text-purple-600', iconBg: 'bg-purple-50' },
              { href: '/admin/affiliates/ai', label: 'View Affiliates', icon: DollarSign, iconColor: 'text-orange-600', iconBg: 'bg-orange-50' },
              { href: '/admin/blueprints', label: 'Launch Blueprints', icon: Eye, iconColor: 'text-pink-600', iconBg: 'bg-pink-50' },
            ].map(action => (
              <Link key={action.href} href={action.href} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                <div className="flex items-center gap-2.5">
                  <span className={`${action.iconBg} rounded-lg flex items-center justify-center`} style={{ width: "1.75rem", height: "1.75rem" }}>
                    <action.icon size={13} className={action.iconColor} />
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{action.label}</span>
                </div>
                <ArrowRight size={13} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="gradient-coral icon-circle text-white" style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={14} />
            </span>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">System Status</h2>
          </div>
          <div className="space-y-2.5">
            {systemStatus.map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{s.label}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  s.status === 'connected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' :
                  s.status === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800' :
                  'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    s.status === 'connected' ? 'bg-emerald-500' :
                    s.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  {s.detail}
                </span>
              </div>
            ))}
          </div>
          <Link href="/admin/setup" className="mt-4 flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 font-medium">
            Configure integrations <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Scan History + Live Trend Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Scan History */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="gradient-blue icon-circle text-white" style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Clock size={14} />
              </span>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Scan History</h2>
            </div>
            <Link href="/admin/scan" className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 font-medium flex items-center gap-1">
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
                <div key={scan.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      scan.status === 'completed' ? 'bg-emerald-400' :
                      scan.status === 'failed' ? 'bg-red-400' : 'bg-amber-400 pulse-dot'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{scan.mode} Scan</p>
                      <p className="text-xs text-gray-400">{formatTime(scan.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{scan.products_found ?? 0} products</p>
                    <p className="text-xs text-gray-400">{scan.duration_seconds ? `${scan.duration_seconds}s` : '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Trend Feed */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="gradient-emerald icon-circle text-white" style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart2 size={14} />
            </span>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Live Trend Feed</h2>
            <span className="text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full ml-auto flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
              Realtime
            </span>
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
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    (p.final_score ?? 0) >= 80 ? 'gradient-coral text-white' :
                    (p.final_score ?? 0) >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {Math.round(p.final_score ?? 0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.trend_stage} · {p.platform}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    p.trend_stage === 'exploding' ? 'gradient-coral text-white' :
                    p.trend_stage === 'rising' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' :
                    'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                  }`}>
                    {p.trend_stage}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscription Breakdown + Recent Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="gradient-purple icon-circle text-white" style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <DollarSign size={14} />
              </span>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Subscription Plans</h2>
            </div>
            <Link href="/admin/clients" className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 font-medium flex items-center gap-1">
              Manage <ChevronRight size={12} />
            </Link>
          </div>
          {revenue.activeSubscriptions === 0 ? (
            <div className="text-center py-8">
              <DollarSign size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No active subscriptions</p>
              <p className="text-xs text-gray-300 mt-1">Client subscriptions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(revenue.planBreakdown).map(([plan, count]) => {
                const total = revenue.activeSubscriptions || 1
                const pct = Math.round((count / total) * 100)
                const gradients: Record<string, string> = {
                  starter: 'gradient-blue', growth: 'gradient-emerald',
                  professional: 'gradient-purple', enterprise: 'gradient-orange', free: 'bg-gray-400'
                }
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{plan}</span>
                      <span className="text-xs text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div className={`${gradients[plan] || 'bg-gray-400'} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Clients */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="gradient-teal icon-circle text-white" style={{ width: "1.75rem", height: "1.75rem", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Users size={14} />
              </span>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Clients</h2>
            </div>
            <Link href="/admin/clients" className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 font-medium flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {recentClients.length === 0 ? (
            <div className="text-center py-8">
              <Users size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No clients yet</p>
              <p className="text-xs text-gray-300 mt-1">Clients will appear here when they sign up</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentClients.map((c: RecentClient) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-coral flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{c.name?.charAt(0)?.toUpperCase() || '?'}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{c.name}</p>
                      <p className="text-xs text-gray-400">{formatTime(c.created_at)}</p>
                    </div>
                  </div>
                  <Link href="/admin/clients" className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 font-medium">
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
