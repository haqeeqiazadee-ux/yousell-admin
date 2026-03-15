'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Package, Truck, CheckCircle, Clock, ShoppingBag, Search,
  ExternalLink, TrendingUp, DollarSign, BarChart3, Loader2,
} from 'lucide-react'
import { EngineGate } from '@/components/engine-gate'

interface Order {
  id: string
  external_order_id: string | null
  product_name: string | null
  platform: string | null
  status: string
  quantity: number
  total_amount: number | null
  currency: string
  customer_name: string | null
  customer_email: string | null
  tracking_number: string | null
  tracking_url: string | null
  created_at: string
}

const STATUS_CONFIG: Record<string, { icon: typeof Clock; label: string; gradient: string; bg: string }> = {
  pending: { icon: Clock, label: 'Pending', gradient: 'gradient-amber', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' },
  confirmed: { icon: Package, label: 'Confirmed', gradient: 'gradient-blue', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' },
  shipped: { icon: Truck, label: 'Shipped', gradient: 'gradient-purple', bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400' },
  delivered: { icon: CheckCircle, label: 'Delivered', gradient: 'gradient-emerald', bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' },
}

const PLATFORM_COLORS: Record<string, string> = {
  shopify: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  tiktok_shop: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/50 dark:text-pink-400 dark:border-pink-800',
  amazon: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/orders')
      .then(r => r.json())
      .then(data => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (o.external_order_id?.toLowerCase().includes(q)) ||
        (o.product_name?.toLowerCase().includes(q)) ||
        (o.customer_name?.toLowerCase().includes(q)) ||
        (o.customer_email?.toLowerCase().includes(q))
      )
    }
    return true
  })

  // KPI calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
  const totalOrders = orders.length
  const shippedCount = orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const kpis = [
    { label: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, gradient: 'gradient-coral' },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, gradient: 'gradient-emerald' },
    { label: 'Avg Order Value', value: `$${avgOrderValue.toFixed(2)}`, icon: TrendingUp, gradient: 'gradient-blue' },
    { label: 'Fulfilled', value: shippedCount.toString(), icon: BarChart3, gradient: 'gradient-purple' },
  ]

  return (
    <EngineGate engine="store_integration" featureName="Order Tracking">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Order Tracking</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and manage orders from your connected stores</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(kpi => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label} className="card-hover">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`icon-circle-lg ${kpi.gradient}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{loading ? '—' : kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={statusFilter === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setStatusFilter(null)}
          className={statusFilter === null ? 'gradient-coral text-white border-0' : ''}
        >
          All ({orders.length})
        </Button>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const count = orders.filter(o => o.status === key).length
          return (
            <Button
              key={key}
              variant={statusFilter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(statusFilter === key ? null : key)}
              className={statusFilter === key ? `${config.gradient} text-white border-0` : ''}
            >
              {config.label} ({count})
            </Button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin" />
          <p className="text-sm">Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {orders.length === 0 ? 'No orders yet' : 'No matching orders'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {orders.length === 0
                ? 'Orders from your connected stores will appear here automatically.'
                : 'Try adjusting your search or filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filtered.length} of {orders.length} orders
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(order => {
                    const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                    const StatusIcon = statusConf.icon
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs font-medium">
                          #{order.external_order_id || order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {order.product_name || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {order.customer_name || 'Unknown'}
                            </p>
                            {order.customer_email && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{order.customer_email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize text-xs ${PLATFORM_COLORS[order.platform || ''] || ''}`}>
                            {order.platform?.replace('_', ' ') || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {order.total_amount
                              ? `$${Number(order.total_amount).toFixed(2)}`
                              : '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConf.bg} border-0 flex items-center gap-1 w-fit`}>
                            <StatusIcon className="h-3 w-3" />
                            {statusConf.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {order.tracking_url ? (
                            <a
                              href={order.tracking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink size={12} />
                              Track
                            </a>
                          ) : order.tracking_number ? (
                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                              {order.tracking_number}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
    </EngineGate>
  )
}
