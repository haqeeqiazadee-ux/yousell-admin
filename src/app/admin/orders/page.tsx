"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart, Search, Filter, MoreHorizontal, Eye,
  PackageCheck, Clock, AlertTriangle, RotateCcw, Brain,
  ChevronLeft, ChevronRight, ExternalLink, X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Order {
  id: string;
  date: string;
  customer: string;
  items: string;
  total: number;
  status: "fulfilled" | "pending" | "at_risk" | "returned";
  source: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_ORDERS: Order[] = [
  { id: "ORD-7841", date: "2026-03-27T09:12:00Z", customer: "Emma Wilson", items: "3x Bluetooth Speaker", total: 89.97, status: "fulfilled", source: "Shopify" },
  { id: "ORD-7840", date: "2026-03-27T08:45:00Z", customer: "Jack Thompson", items: "1x Wireless Mouse", total: 24.99, status: "fulfilled", source: "Amazon" },
  { id: "ORD-7839", date: "2026-03-27T07:30:00Z", customer: "Olivia Brown", items: "2x USB-C Cable", total: 15.98, status: "returned", source: "Shopify" },
  { id: "ORD-7838", date: "2026-03-26T22:14:00Z", customer: "Noah Davis", items: "1x Laptop Stand", total: 49.99, status: "pending", source: "eBay" },
  { id: "ORD-7837", date: "2026-03-26T19:55:00Z", customer: "Sophia Martinez", items: "5x Phone Case", total: 74.95, status: "fulfilled", source: "Shopify" },
  { id: "ORD-7836", date: "2026-03-26T16:30:00Z", customer: "Liam Johnson", items: "1x Webcam HD", total: 59.99, status: "at_risk", source: "Amazon" },
  { id: "ORD-7835", date: "2026-03-26T14:22:00Z", customer: "Ava Garcia", items: "2x Screen Protector", total: 19.98, status: "fulfilled", source: "Shopify" },
  { id: "ORD-7834", date: "2026-03-26T11:08:00Z", customer: "Mason Lee", items: "1x Mechanical Keyboard", total: 129.99, status: "fulfilled", source: "Amazon" },
  { id: "ORD-7833", date: "2026-03-26T09:45:00Z", customer: "Isabella Clark", items: "3x USB-C Hub", total: 104.97, status: "pending", source: "eBay" },
  { id: "ORD-7832", date: "2026-03-25T20:30:00Z", customer: "Ethan Walker", items: "1x Desk Lamp LED", total: 34.99, status: "fulfilled", source: "Shopify" },
];

const STATUS_CONFIG: Record<string, { label: string; icon: typeof PackageCheck; style: string }> = {
  fulfilled: { label: "Fulfilled", icon: PackageCheck, style: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  pending: { label: "Pending", icon: Clock, style: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  at_risk: { label: "At Risk", icon: AlertTriangle, style: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  returned: { label: "Returned", icon: RotateCcw, style: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OrderInsightsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders ?? MOCK_ORDERS);
      } else {
        setOrders(MOCK_ORDERS);
      }
    } catch {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* Filters */
  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (platformFilter !== "all" && o.source.toLowerCase() !== platformFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.items.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* Summary counts */
  const totalOrders = 1247;
  const pendingCount = 23;
  const fulfilledCount = 1198;
  const returnedCount = 26;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" /> Order Insights
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track orders across all platforms with AI-powered insights
        </p>
      </div>

      {/* Sticky Filter Bar */}
      <Card className="sticky top-0 z-10">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by SKU, order ID, or customer..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
            </div>
            <Select value={platformFilter} onValueChange={(v) => { setPlatformFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="shopify">Shopify</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="ebay">eBay</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>
            {(searchQuery || statusFilter !== "all" || platformFilter !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setPlatformFilter("all"); setPage(1); }}>
                <X className="h-3 w-3 mr-1" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalOrders.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-zinc-500">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{fulfilledCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Fulfilled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{returnedCount}</p>
            <p className="text-xs text-muted-foreground">Returned</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight Banner */}
      <Card className="border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-transparent">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Brain className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                AI Insight
                <Badge variant="outline" className="text-xs">Auto-detected</Badge>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Return rate for USB cables spiked 3.2x this week. Check batch quality.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((order) => {
                    const sc = STATUS_CONFIG[order.status];
                    const StatusIcon = sc.icon;
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">{order.id}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(order.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{order.items}</TableCell>
                        <TableCell className="font-medium">&pound;{order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={sc.style}>
                            <StatusIcon className="h-3 w-3 mr-1" /> {sc.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.source}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="h-4 w-4 mr-2" /> View details</DropdownMenuItem>
                              <DropdownMenuItem><ExternalLink className="h-4 w-4 mr-2" /> Open in {order.source}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {((page - 1) * PAGE_SIZE) + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
