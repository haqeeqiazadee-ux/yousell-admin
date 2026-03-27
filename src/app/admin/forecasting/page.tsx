"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3, Package, AlertTriangle, TrendingUp, Plus,
  ChevronLeft, ChevronRight, Truck, Clock, CheckCircle,
  XCircle, ArrowDown, ShoppingCart
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface Forecast {
  id: string;
  product_name: string;
  current_stock: number;
  avg_daily_sales: number;
  predicted_demand_7d: number;
  predicted_demand_30d: number;
  predicted_demand_90d: number;
  days_until_stockout: number | null;
  confidence: number;
  restock_recommendation: string;
  seasonal_pattern: { peak_months?: number[]; trend?: string };
  created_at: string;
}

interface RestockAlert {
  id: string;
  product_name: string;
  supplier_name: string;
  current_stock: number;
  reorder_point: number;
  recommended_qty: number;
  estimated_cost: number;
  urgency: string;
  lead_time_days: number;
  status: string;
  ordered_at: string | null;
  created_at: string;
}

interface Metrics {
  stockoutRisk: number;
  overstockItems: number;
  avgAccuracy: string;
  criticalAlerts: number;
  pendingRestocks: number;
  nextRestockDue: string;
}

const PAGE_SIZE = 25;

const URGENCY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  ok: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const RECOMMENDATION_COLORS: Record<string, string> = {
  "order now": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  "order soon": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  adequate: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  overstock: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  ordered: "bg-blue-100 text-blue-800",
  received: "bg-green-100 text-green-800",
  dismissed: "bg-gray-100 text-gray-800",
};

export default function ForecastingPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [alerts, setAlerts] = useState<RestockAlert[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"forecasts" | "restock">("forecasts");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/forecasting");
      if (res.ok) {
        const data = await res.json();
        setForecasts(data.forecasts || []);
        setAlerts(data.alerts || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error("Error loading forecasting data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateAlertStatus = async (id: string, status: string) => {
    setSubmitting(true);
    await authFetch("/api/admin/forecasting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_alert_status", id, status }),
    });
    await fetchData();
    setSubmitting(false);
  };

  const filteredAlerts = urgencyFilter === "all" ? alerts : alerts.filter(a => a.urgency === urgencyFilter);
  const pagedForecasts = forecasts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function stockoutColor(days: number | null): string {
    if (days === null) return "text-gray-400";
    if (days <= 3) return "text-red-600 dark:text-red-400 font-bold";
    if (days <= 14) return "text-amber-600 dark:text-amber-400 font-medium";
    return "text-green-600 dark:text-green-400";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-500" />
            Demand Forecasting
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Inventory prediction, stockout alerts, and restock management</p>
        </div>
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Stockout Risk</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" />{metrics?.stockoutRisk || 0} items</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Overstock</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Package className="w-5 h-5 text-blue-500" />{metrics?.overstockItems || 0} items</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Forecast Accuracy</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" />{metrics?.avgAccuracy || "0"}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Critical Alerts</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" />{metrics?.criticalAlerts || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Restocks</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Truck className="w-5 h-5 text-purple-500" />{metrics?.pendingRestocks || 0}</div></CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["forecasts", "restock"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {t === "forecasts" ? "Demand Forecasts" : "Restock Alerts"}
          </button>
        ))}
      </div>

      {/* Forecasts Tab */}
      {tab === "forecasts" && (
        <Card>
          <CardHeader><CardTitle>Product Demand Forecasts</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : forecasts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No forecasts available</p>
                <p className="text-sm">Forecasts will be generated when sales data is available</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Avg Daily Sales</TableHead>
                      <TableHead>Demand 7d</TableHead>
                      <TableHead>Demand 30d</TableHead>
                      <TableHead>Demand 90d</TableHead>
                      <TableHead>Days to Stockout</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Recommendation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedForecasts.map(f => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium max-w-[150px] truncate">{f.product_name}</TableCell>
                        <TableCell>{f.current_stock.toLocaleString()}</TableCell>
                        <TableCell>{f.avg_daily_sales.toFixed(1)}</TableCell>
                        <TableCell>{f.predicted_demand_7d}</TableCell>
                        <TableCell>{f.predicted_demand_30d}</TableCell>
                        <TableCell>{f.predicted_demand_90d}</TableCell>
                        <TableCell><span className={stockoutColor(f.days_until_stockout)}>{f.days_until_stockout !== null ? `${f.days_until_stockout}d` : "N/A"}</span></TableCell>
                        <TableCell>{f.confidence}%</TableCell>
                        <TableCell><Badge className={`text-xs ${RECOMMENDATION_COLORS[f.restock_recommendation] || ""}`}>{f.restock_recommendation}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {forecasts.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <span className="text-xs text-muted-foreground">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, forecasts.length)} of {forecasts.length}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 text-xs disabled:opacity-50"><ChevronLeft className="h-4 w-4" /> Prev</button>
                      <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(forecasts.length / PAGE_SIZE)} className="flex items-center gap-1 text-xs disabled:opacity-50">Next <ChevronRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Restock Tab */}
      {tab === "restock" && (
        <Card>
          <CardHeader>
            <CardTitle>Restock Alerts</CardTitle>
            <div className="flex gap-2 mt-2">
              {["all", "critical", "warning", "ok"].map(f => (
                <button key={f} onClick={() => setUrgencyFilter(f)} className={`px-3 py-1 rounded-lg text-xs capitalize ${urgencyFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {f}
                </button>
              ))}
              <span className="text-xs text-muted-foreground self-center ml-2">{filteredAlerts.length} alerts</span>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No restock alerts</p>
                <p className="text-sm">All inventory levels are adequate</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Reorder Point</TableHead>
                    <TableHead>Rec. Qty</TableHead>
                    <TableHead>Est. Cost</TableHead>
                    <TableHead>Lead Time</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium max-w-[150px] truncate">{a.product_name}</TableCell>
                      <TableCell className="text-sm">{a.supplier_name || "—"}</TableCell>
                      <TableCell>{a.current_stock}</TableCell>
                      <TableCell>{a.reorder_point}</TableCell>
                      <TableCell className="font-medium">{a.recommended_qty}</TableCell>
                      <TableCell>${(a.estimated_cost || 0).toLocaleString()}</TableCell>
                      <TableCell>{a.lead_time_days}d</TableCell>
                      <TableCell><Badge className={`text-xs ${URGENCY_COLORS[a.urgency] || ""}`}>{a.urgency}</Badge></TableCell>
                      <TableCell><Badge className={`text-xs ${STATUS_COLORS[a.status] || ""}`}>{a.status}</Badge></TableCell>
                      <TableCell>
                        {a.status === "pending" && (
                          <div className="flex gap-1">
                            <button onClick={() => updateAlertStatus(a.id, "ordered")} disabled={submitting} className="text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 disabled:opacity-50">
                              <ShoppingCart className="h-3 w-3 inline mr-1" />Order
                            </button>
                            <button onClick={() => updateAlertStatus(a.id, "dismissed")} disabled={submitting} className="text-xs px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300 disabled:opacity-50">
                              <XCircle className="h-3 w-3 inline mr-1" />Dismiss
                            </button>
                          </div>
                        )}
                        {a.status === "ordered" && (
                          <button onClick={() => updateAlertStatus(a.id, "received")} disabled={submitting} className="text-xs px-2 py-1 rounded bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 disabled:opacity-50">
                            <CheckCircle className="h-3 w-3 inline mr-1" />Received
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
