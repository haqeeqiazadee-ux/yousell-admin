"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DollarSign, TrendingUp, Cpu, Activity, Star,
  ThumbsUp, ThumbsDown, Settings, BarChart2, Zap,
} from "lucide-react";

/* ── Mock Data ──────────────────────────────────────────────── */

const BUDGET = { spent: 48.2, limit: 100, currency: "GBP" };

const FEATURE_BREAKDOWN = [
  { feature: "Briefings", model: "Claude 3.5 Haiku", volume: 12840, cost: 8.42, avgLatency: 320 },
  { feature: "Product Search", model: "Claude 3.5 Haiku", volume: 9620, cost: 6.18, avgLatency: 280 },
  { feature: "Pricing Engine", model: "Claude 3.5 Sonnet", volume: 3410, cost: 22.60, avgLatency: 890 },
  { feature: "Content Generation", model: "Claude 3.5 Sonnet", volume: 1850, cost: 10.14, avgLatency: 1120 },
  { feature: "Fraud Detection", model: "Claude 3.5 Haiku", volume: 4200, cost: 0.86, avgLatency: 210 },
];

const DAILY_COSTS = [
  { date: "Mar 01", cost: 1.42 }, { date: "Mar 02", cost: 1.58 }, { date: "Mar 03", cost: 1.31 },
  { date: "Mar 04", cost: 1.75 }, { date: "Mar 05", cost: 2.10 }, { date: "Mar 06", cost: 1.90 },
  { date: "Mar 07", cost: 1.45 }, { date: "Mar 08", cost: 1.68 }, { date: "Mar 09", cost: 1.82 },
  { date: "Mar 10", cost: 1.55 }, { date: "Mar 11", cost: 2.34 }, { date: "Mar 12", cost: 1.92 },
  { date: "Mar 13", cost: 1.40 }, { date: "Mar 14", cost: 1.78 }, { date: "Mar 15", cost: 1.63 },
  { date: "Mar 16", cost: 1.49 }, { date: "Mar 17", cost: 2.05 }, { date: "Mar 18", cost: 1.88 },
  { date: "Mar 19", cost: 1.72 }, { date: "Mar 20", cost: 1.54 }, { date: "Mar 21", cost: 1.39 },
  { date: "Mar 22", cost: 1.67 }, { date: "Mar 23", cost: 1.95 }, { date: "Mar 24", cost: 2.22 },
  { date: "Mar 25", cost: 1.80 }, { date: "Mar 26", cost: 1.61 }, { date: "Mar 27", cost: 1.50 },
];

const ROUTING_RULES = [
  { queryType: "Simple lookups", model: "Haiku", volume: 18460, cost: 12.40, avgLatency: 280, rule: "tokens < 500 => Haiku" },
  { queryType: "Scoring / analysis", model: "Sonnet", volume: 3410, cost: 22.60, avgLatency: 890, rule: "complexity >= 0.7 => Sonnet" },
  { queryType: "Content generation", model: "Sonnet", volume: 1850, cost: 10.14, avgLatency: 1120, rule: "task = content_gen => Sonnet" },
  { queryType: "Classification", model: "Haiku", volume: 8200, cost: 2.20, avgLatency: 190, rule: "task = classify => Haiku" },
];

const MODEL_SPLIT = [
  { model: "Haiku", volumePct: 74, costPct: 22, color: "bg-blue-500" },
  { model: "Sonnet", volumePct: 26, costPct: 78, color: "bg-purple-500" },
];

const TRACES = [
  { id: "tr-001", timestamp: "2026-03-27 09:42:18", feature: "Briefings", model: "Haiku", inputTokens: 342, outputTokens: 128, latencyMs: 310, score: 5 },
  { id: "tr-002", timestamp: "2026-03-27 09:41:55", feature: "Pricing Engine", model: "Sonnet", inputTokens: 1840, outputTokens: 620, latencyMs: 920, score: 4 },
  { id: "tr-003", timestamp: "2026-03-27 09:41:30", feature: "Content Gen", model: "Sonnet", inputTokens: 2100, outputTokens: 890, latencyMs: 1180, score: 5 },
  { id: "tr-004", timestamp: "2026-03-27 09:40:12", feature: "Product Search", model: "Haiku", inputTokens: 280, outputTokens: 95, latencyMs: 260, score: 4 },
  { id: "tr-005", timestamp: "2026-03-27 09:39:48", feature: "Fraud Detection", model: "Haiku", inputTokens: 410, outputTokens: 52, latencyMs: 195, score: 5 },
  { id: "tr-006", timestamp: "2026-03-27 09:38:22", feature: "Briefings", model: "Haiku", inputTokens: 390, outputTokens: 140, latencyMs: 340, score: 3 },
  { id: "tr-007", timestamp: "2026-03-27 09:37:05", feature: "Pricing Engine", model: "Sonnet", inputTokens: 1620, outputTokens: 580, latencyMs: 870, score: 4 },
  { id: "tr-008", timestamp: "2026-03-27 09:36:42", feature: "Content Gen", model: "Sonnet", inputTokens: 2450, outputTokens: 1020, latencyMs: 1340, score: 5 },
  { id: "tr-009", timestamp: "2026-03-27 09:35:18", feature: "Product Search", model: "Haiku", inputTokens: 310, outputTokens: 88, latencyMs: 245, score: 4 },
  { id: "tr-010", timestamp: "2026-03-27 09:34:50", feature: "Fraud Detection", model: "Haiku", inputTokens: 380, outputTokens: 48, latencyMs: 185, score: 5 },
];

const QUALITY_SCORES = [
  { feature: "Briefings", thumbsUp: 482, thumbsDown: 31, satisfaction: 94 },
  { feature: "Product Search", thumbsUp: 612, thumbsDown: 58, satisfaction: 91 },
  { feature: "Pricing Engine", thumbsUp: 289, thumbsDown: 22, satisfaction: 93 },
  { feature: "Content Generation", thumbsUp: 178, thumbsDown: 19, satisfaction: 90 },
  { feature: "Fraud Detection", thumbsUp: 340, thumbsDown: 8, satisfaction: 98 },
];

/* ── Helpers ─────────────────────────────────────────────────── */

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= count ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

function ProgressBar({ value, max, className = "" }: { value: number; max: number; className?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={`w-full bg-muted rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-500" : "bg-green-500"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MiniBarChart({ data, maxVal }: { data: { date: string; cost: number }[]; maxVal: number }) {
  return (
    <div className="flex items-end gap-[2px] h-32 w-full">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
          <div
            className="w-full bg-blue-500 dark:bg-blue-400 rounded-t-sm min-h-[2px] hover:bg-blue-600 transition-colors"
            style={{ height: `${(d.cost / maxVal) * 100}%` }}
          />
          <div className="absolute -top-8 hidden group-hover:block bg-popover border border-border text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
            {d.date}: {"\u00A3"}{d.cost.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Page Component ──────────────────────────────────────────── */

export default function AICostDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingRules, setEditingRules] = useState(false);

  const budgetPct = (BUDGET.spent / BUDGET.limit) * 100;
  const totalVolume = FEATURE_BREAKDOWN.reduce((s, f) => s + f.volume, 0);
  const totalCost = FEATURE_BREAKDOWN.reduce((s, f) => s + f.cost, 0);
  const avgLatency = Math.round(FEATURE_BREAKDOWN.reduce((s, f) => s + f.avgLatency * f.volume, 0) / totalVolume);
  const maxDailyCost = Math.max(...DAILY_COSTS.map((d) => d.cost));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Cost Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor AI usage, costs, model routing and quality</p>
        </div>
        <Badge variant="outline" className="text-xs">
          <Activity className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="routing">Model Routing</TabsTrigger>
          <TabsTrigger value="traces">Request Traces</TabsTrigger>
          <TabsTrigger value="quality">Quality Scores</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ───────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{"\u00A3"}{BUDGET.spent.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">of {"\u00A3"}{BUDGET.limit} budget</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalVolume.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Cost/Request</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{"\u00A3"}{(totalCost / totalVolume * 1000).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">per 1K requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgLatency}ms</div>
                <p className="text-xs text-muted-foreground">Weighted average</p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-4 h-4" />
                Monthly Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{"\u00A3"}{BUDGET.spent.toFixed(2)} spent</span>
                <span className={budgetPct > 80 ? "text-red-500 font-medium" : "text-muted-foreground"}>
                  {budgetPct.toFixed(1)}% used
                </span>
              </div>
              <ProgressBar value={BUDGET.spent} max={BUDGET.limit} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {"\u00A3"}{(BUDGET.limit - BUDGET.spent).toFixed(2)} remaining &middot; ~{Math.round((BUDGET.limit - BUDGET.spent) / (BUDGET.spent / 27))} days at current rate
              </p>
            </CardContent>
          </Card>

          {/* 30-Day Cost Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4" />
                30-Day Cost Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MiniBarChart data={DAILY_COSTS} maxVal={maxDailyCost * 1.2} />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{DAILY_COSTS[0].date}</span>
                <span>{DAILY_COSTS[DAILY_COSTS.length - 1].date}</span>
              </div>
            </CardContent>
          </Card>

          {/* Feature Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Avg Latency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FEATURE_BREAKDOWN.map((f) => (
                    <TableRow key={f.feature}>
                      <TableCell className="font-medium">{f.feature}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{f.model}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{f.volume.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{"\u00A3"}{f.cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">{f.avgLatency}ms</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold border-t-2">
                    <TableCell>Total</TableCell>
                    <TableCell />
                    <TableCell className="text-right font-mono">{totalVolume.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono">{"\u00A3"}{totalCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">{avgLatency}ms</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Cost Breakdown Tab ─────────────────────────────── */}
        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURE_BREAKDOWN.map((f) => (
              <Card key={f.feature}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{f.feature}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="font-mono font-medium">{"\u00A3"}{f.cost.toFixed(2)}</span>
                  </div>
                  <ProgressBar value={f.cost} max={totalCost} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{f.volume.toLocaleString()} requests</span>
                    <span>{((f.cost / totalCost) * 100).toFixed(1)}% of total</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{f.model}</Badge>
                    <Badge variant="outline" className="text-xs">{f.avgLatency}ms avg</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Model Routing Tab (Section 33.1) ──────────────── */}
        <TabsContent value="routing" className="space-y-6">
          {/* Model Split Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Model Split by Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {/* Donut placeholder */}
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-blue-500" strokeDasharray={`${74 * 0.88} ${100 * 0.88}`} />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-purple-500" strokeDasharray={`${26 * 0.88} ${100 * 0.88}`} strokeDashoffset={`-${74 * 0.88}`} />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    {MODEL_SPLIT.map((m) => (
                      <div key={m.model} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${m.color}`} />
                        <div>
                          <p className="text-sm font-medium">{m.model}</p>
                          <p className="text-xs text-muted-foreground">{m.volumePct}% volume / {m.costPct}% cost</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Model Split by Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-purple-500" strokeDasharray={`${78 * 0.88} ${100 * 0.88}`} />
                      <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-blue-500" strokeDasharray={`${22 * 0.88} ${100 * 0.88}`} strokeDashoffset={`-${78 * 0.88}`} />
                    </svg>
                  </div>
                  <div className="space-y-3">
                    {MODEL_SPLIT.map((m) => (
                      <div key={m.model + "-cost"} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${m.color}`} />
                        <div>
                          <p className="text-sm font-medium">{m.model}</p>
                          <p className="text-xs text-muted-foreground">{"\u00A3"}{m.costPct === 78 ? "37.34" : "10.86"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Routing Breakdown Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Routing Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Query Type</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Volume</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Avg Latency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ROUTING_RULES.map((r) => (
                    <TableRow key={r.queryType}>
                      <TableCell className="font-medium">{r.queryType}</TableCell>
                      <TableCell>
                        <Badge variant={r.model === "Sonnet" ? "default" : "secondary"} className="text-xs">
                          {r.model}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{r.volume.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{"\u00A3"}{r.cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-mono">{r.avgLatency}ms</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Editable Routing Rules */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Routing Rules
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingRules(!editingRules)}
              >
                {editingRules ? "Save Rules" : "Edit Rules"}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ROUTING_RULES.map((r) => (
                  <div key={r.queryType} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{r.queryType}</p>
                      {editingRules ? (
                        <Input defaultValue={r.rule} className="mt-1 text-xs font-mono h-7" />
                      ) : (
                        <p className="text-xs text-muted-foreground font-mono">{r.rule}</p>
                      )}
                    </div>
                    <Badge variant={r.model === "Sonnet" ? "default" : "secondary"}>{r.model}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Request Traces Tab (Section 33.3) ─────────────── */}
        <TabsContent value="traces" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Request Traces</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right">Input Tokens</TableHead>
                    <TableHead className="text-right">Output Tokens</TableHead>
                    <TableHead className="text-right">Latency</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TRACES.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs">{t.timestamp}</TableCell>
                      <TableCell>{t.feature}</TableCell>
                      <TableCell>
                        <Badge variant={t.model === "Sonnet" ? "default" : "secondary"} className="text-xs">
                          {t.model}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{t.inputTokens.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{t.outputTokens.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{t.latencyMs}ms</TableCell>
                      <TableCell><Stars count={t.score} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Quality Scores Tab ─────────────────────────────── */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUALITY_SCORES.map((q) => (
              <Card key={q.feature}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{q.feature}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-center">{q.satisfaction}%</div>
                  <ProgressBar value={q.satisfaction} max={100} className="h-2" />
                  <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-1 text-sm">
                      <ThumbsUp className="w-4 h-4 text-green-500" />
                      <span className="font-mono">{q.thumbsUp}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <ThumbsDown className="w-4 h-4 text-red-500" />
                      <span className="font-mono">{q.thumbsDown}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quality Trend Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Satisfaction Trend (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Satisfaction trendline chart</p>
                  <p className="text-xs">Connect analytics to populate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
