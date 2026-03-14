'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Package, Truck, CheckCircle, Clock, ShoppingBag } from 'lucide-react'

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

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  confirmed: Package,
  shipped: Truck,
  delivered: CheckCircle,
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/orders')
      .then(r => r.json())
      .then(data => setOrders(data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order Tracking</h1>
        <p className="text-muted-foreground">Track orders from your connected stores</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading orders...</div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-1">No orders yet</h3>
            <p className="text-sm text-muted-foreground">
              Orders from your connected stores will appear here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => {
                const StatusIcon = STATUS_ICONS[order.status] || Clock
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {order.external_order_id || order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>{order.product_name || 'N/A'}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{order.customer_name || 'Unknown'}</p>
                        {order.customer_email && (
                          <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.platform || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.total_amount
                        ? `$${Number(order.total_amount).toFixed(2)}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
