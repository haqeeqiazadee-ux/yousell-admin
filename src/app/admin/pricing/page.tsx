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
  DollarSign, TrendingUp, TrendingDown, Minus, Plus,
  ChevronLeft, ChevronRight, Check, BarChart3, Target,
  ArrowUpDown, Eye, Zap, Users
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface PricingStrategy {
  id: string;
  name: string;
  strategy_type: string;
  constraints: Record<string, unknown>;
  active: boolean;
  applied_to_categories: string[];
  created_at: string;
}

interface PricingSuggestion {
  id: string;
  product_name: string;
  current_price: number;
  suggested_price: number;
  competitor_avg_price: number;
  margin_pct: number;
  demand_signal: string;
  elasticity: string;
  reason: string;
  auto_apply: boolean;
  applied: boolean;
  applied_at: string | null;
  created_at: string;
}

interface CompetitorPrice {
  id: string;
  competitor_name: string;
  competitor_url: string;
  product_name: string;
  their_price: number;
  our_price: number;
  difference_pct: number;
  trend: string;
  last_checked_at: string;
  source: string;
}

interface Metrics {
  activeStrategy: string;
  pendingSuggestions: number;
  appliedToday: number;
  avgMargin: string;
  priceChanges24h: number;
}

const PAGE_SIZE = 25;

const DEMAND_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  high: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
};

const TREND_ICONS: Record<string, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

export default function PricingPage() {
  const [strategies, setStrategies] = useState<PricingStrategy[]>([]);
  const [suggestions, setSuggestions] = useState<PricingSuggestion[]>([]);
  const [competitorPrices, setCompetitorPrices] = useState<CompetitorPrice[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"suggestions" | "competitors" | "strategies">("suggestions");
  const [page, setPage] = useState(1);
  const [competitorDialogOpen, setCompetitorDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [compForm, setCompForm] = useState({ competitorName: "", productName: "", theirPrice: "", ourPrice: "", competitorUrl: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/pricing");
      if (res.ok) {
        const data = await res.json();
        setStrategies(data.strategies || []);
        setSuggestions(data.suggestions || []);
        setCompetitorPrices(data.competitorPrices || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error("Error loading pricing data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const applySuggestion = async (id: string) => {
    setSubmitting(true);
    await authFetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "apply_suggestion", id }),
    });
    await fetchData();
    setSubmitting(false);
  };

  const activateStrategy = async (id: string) => {
    setSubmitting(true);
    await authFetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "activate_strategy", id }),
    });
    await fetchData();
    setSubmitting(false);
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await authFetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_competitor_price",
        competitorName: compForm.competitorName,
        productName: compForm.productName,
        theirPrice: parseFloat(compForm.theirPrice),
        ourPrice: compForm.ourPrice ? parseFloat(compForm.ourPrice) : undefined,
        competitorUrl: compForm.competitorUrl || undefined,
      }),
    });
    if (res.ok) {
      setCompForm({ competitorName: "", productName: "", theirPrice: "", ourPrice: "", competitorUrl: "" });
      setCompetitorDialogOpen(false);
      await fetchData();
    }
    setSubmitting(false);
  };

  const pagedSuggestions = suggestions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-500" />
            Dynamic Pricing
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI pricing intelligence, competitor tracking, and price optimization</p>
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
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Strategy</CardTitle></CardHeader>
            <CardContent><div className="text-lg font-bold flex items-center gap-2 capitalize"><Target className="w-5 h-5 text-blue-500" />{metrics?.activeStrategy || "None"}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Suggestions</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" />{metrics?.pendingSuggestions || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Applied Today</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Check className="w-5 h-5 text-green-500" />{metrics?.appliedToday || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Margin</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-500" />{metrics?.avgMargin || "0"}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Price Changes (24h)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><ArrowUpDown className="w-5 h-5 text-orange-500" />{metrics?.priceChanges24h || 0}</div></CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["suggestions", "competitors", "strategies"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {t === "suggestions" ? "Price Suggestions" : t === "competitors" ? "Competitor Prices" : "Strategies"}
          </button>
        ))}
      </div>

      {/* Suggestions Tab */}
      {tab === "suggestions" && (
        <Card>
          <CardHeader><CardTitle>AI Price Suggestions</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : suggestions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No price suggestions</p>
                <p className="text-sm">AI will generate suggestions when pricing data is available</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Suggested</TableHead>
                      <TableHead>Competitor Avg</TableHead>
                      <TableHead>Margin</TableHead>
                      <TableHead>Demand</TableHead>
                      <TableHead>Elasticity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedSuggestions.map(s => {
                      const priceDiff = s.suggested_price - s.current_price;
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium max-w-[150px] truncate">{s.product_name}</TableCell>
                          <TableCell>${s.current_price.toFixed(2)}</TableCell>
                          <TableCell className={priceDiff > 0 ? "text-green-600" : priceDiff < 0 ? "text-red-600" : ""}>
                            ${s.suggested_price.toFixed(2)}
                            <span className="text-xs ml-1">({priceDiff > 0 ? "+" : ""}{priceDiff.toFixed(2)})</span>
                          </TableCell>
                          <TableCell>{s.competitor_avg_price ? `$${s.competitor_avg_price.toFixed(2)}` : "—"}</TableCell>
                          <TableCell>{s.margin_pct ? `${s.margin_pct}%` : "—"}</TableCell>
                          <TableCell><Badge className={`text-xs ${DEMAND_COLORS[s.demand_signal] || ""}`}>{s.demand_signal}</Badge></TableCell>
                          <TableCell className="text-xs capitalize">{s.elasticity}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{s.reason || "—"}</TableCell>
                          <TableCell>{s.applied ? <Badge className="bg-green-100 text-green-800 text-xs">Applied</Badge> : <Badge variant="outline" className="text-xs">Pending</Badge>}</TableCell>
                          <TableCell>
                            {!s.applied && (
                              <button onClick={() => applySuggestion(s.id)} disabled={submitting} className="text-xs px-2 py-1 rounded bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 disabled:opacity-50">Apply</button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {suggestions.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <span className="text-xs text-muted-foreground">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, suggestions.length)} of {suggestions.length}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 text-xs disabled:opacity-50"><ChevronLeft className="h-4 w-4" /> Prev</button>
                      <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(suggestions.length / PAGE_SIZE)} className="flex items-center gap-1 text-xs disabled:opacity-50">Next <ChevronRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Competitors Tab */}
      {tab === "competitors" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Competitor Price Tracker</CardTitle>
            <Dialog open={competitorDialogOpen} onOpenChange={setCompetitorDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add Entry</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Competitor Price</DialogTitle></DialogHeader>
                <form onSubmit={handleAddCompetitor} className="space-y-4">
                  <div className="space-y-2"><Label>Competitor</Label><Input value={compForm.competitorName} onChange={e => setCompForm(f => ({ ...f, competitorName: e.target.value }))} placeholder="Amazon" required /></div>
                  <div className="space-y-2"><Label>Product</Label><Input value={compForm.productName} onChange={e => setCompForm(f => ({ ...f, productName: e.target.value }))} placeholder="Product name" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Their Price</Label><Input type="number" step="0.01" value={compForm.theirPrice} onChange={e => setCompForm(f => ({ ...f, theirPrice: e.target.value }))} placeholder="29.99" required /></div>
                    <div className="space-y-2"><Label>Our Price</Label><Input type="number" step="0.01" value={compForm.ourPrice} onChange={e => setCompForm(f => ({ ...f, ourPrice: e.target.value }))} placeholder="34.99" /></div>
                  </div>
                  <div className="space-y-2"><Label>URL (optional)</Label><Input value={compForm.competitorUrl} onChange={e => setCompForm(f => ({ ...f, competitorUrl: e.target.value }))} placeholder="https://..." /></div>
                  <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Adding..." : "Add Competitor Price"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {competitorPrices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No competitor prices tracked</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competitor</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Their Price</TableHead>
                    <TableHead>Our Price</TableHead>
                    <TableHead>Difference</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Last Checked</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitorPrices.map(cp => {
                    const TrendIcon = TREND_ICONS[cp.trend] || Minus;
                    return (
                      <TableRow key={cp.id}>
                        <TableCell className="font-medium">{cp.competitor_name}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{cp.product_name}</TableCell>
                        <TableCell>${cp.their_price.toFixed(2)}</TableCell>
                        <TableCell>{cp.our_price ? `$${cp.our_price.toFixed(2)}` : "—"}</TableCell>
                        <TableCell className={cp.difference_pct > 0 ? "text-green-600" : cp.difference_pct < 0 ? "text-red-600" : ""}>
                          {cp.difference_pct ? `${cp.difference_pct > 0 ? "+" : ""}${cp.difference_pct}%` : "—"}
                        </TableCell>
                        <TableCell><TrendIcon className={`h-4 w-4 ${cp.trend === "up" ? "text-red-500" : cp.trend === "down" ? "text-green-500" : "text-gray-400"}`} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(cp.last_checked_at).toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs capitalize">{cp.source}</Badge></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strategies Tab */}
      {tab === "strategies" && (
        <Card>
          <CardHeader><CardTitle>Pricing Strategies</CardTitle></CardHeader>
          <CardContent>
            {strategies.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No strategies configured</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {strategies.map(s => (
                  <Card key={s.id} className={`${s.active ? "border-green-300 dark:border-green-800" : ""}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base capitalize">{s.name}</CardTitle>
                        {s.active ? <Badge className="bg-green-100 text-green-800">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm"><span className="text-muted-foreground">Type:</span> <span className="capitalize font-medium">{s.strategy_type}</span></div>
                      {s.constraints && Object.entries(s.constraints).map(([k, v]) => (
                        <div key={k} className="text-xs flex justify-between"><span className="text-muted-foreground">{k.replace(/_/g, " ")}</span><span>{String(v)}</span></div>
                      ))}
                      {!s.active && (
                        <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => activateStrategy(s.id)} disabled={submitting}>Activate</Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
