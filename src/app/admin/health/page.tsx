"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Activity, CheckCircle, AlertTriangle, XCircle,
  RefreshCw, Server, Globe, Clock,
} from "lucide-react";

/* ── Mock Data: 25 Engines ────────────────────────────────────── */

type EngineStatus = "ok" | "slow" | "error";

interface Engine {
  name: string;
  category: "Discovery" | "Scoring" | "Advanced" | "Governor";
  status: EngineStatus;
  lastRun: string;
  score: number;
  nextRun: string;
}

const ENGINES: Engine[] = [
  // Discovery (10)
  { name: "TikTok Discovery", category: "Discovery", status: "ok", lastRun: "2026-03-27 09:30", score: 98, nextRun: "2026-03-27 10:30" },
  { name: "Amazon Discovery", category: "Discovery", status: "ok", lastRun: "2026-03-27 09:28", score: 95, nextRun: "2026-03-27 10:28" },
  { name: "Pinterest Discovery", category: "Discovery", status: "ok", lastRun: "2026-03-27 09:25", score: 97, nextRun: "2026-03-27 10:25" },
  { name: "Reddit Discovery", category: "Discovery", status: "slow", lastRun: "2026-03-27 09:15", score: 72, nextRun: "2026-03-27 10:15" },
  { name: "YouTube Discovery", category: "Discovery", status: "ok", lastRun: "2026-03-27 09:20", score: 94, nextRun: "2026-03-27 10:20" },
  { name: "eBay Discovery", category: "Discovery", status: "ok", lastRun: "2026-03-27 09:22", score: 91, nextRun: "2026-03-27 10:22" },
  { name: "Shopify Discovery", category: "Discovery", status: "ok", lastRun: "2026-03-27 09:18", score: 96, nextRun: "2026-03-27 10:18" },
  { name: "Instagram Discovery", category: "Discovery", status: "error", lastRun: "2026-03-27 08:45", score: 0, nextRun: "2026-03-27 10:45" },
  { name: "Alibaba Discovery", category: "Discovery", status: "ok", lastRun: "2026-03-27 09:10", score: 88, nextRun: "2026-03-27 10:10" },
  { name: "Etsy Discovery", category: "Discovery", status: "ok", lastRun: "2026-03-27 09:12", score: 93, nextRun: "2026-03-27 10:12" },
  // Scoring (10)
  { name: "Trend Scorer", category: "Scoring", status: "ok", lastRun: "2026-03-27 09:35", score: 99, nextRun: "2026-03-27 10:05" },
  { name: "Viral Scorer", category: "Scoring", status: "ok", lastRun: "2026-03-27 09:34", score: 97, nextRun: "2026-03-27 10:04" },
  { name: "Profit Scorer", category: "Scoring", status: "ok", lastRun: "2026-03-27 09:33", score: 96, nextRun: "2026-03-27 10:03" },
  { name: "Competition Scorer", category: "Scoring", status: "ok", lastRun: "2026-03-27 09:32", score: 94, nextRun: "2026-03-27 10:02" },
  { name: "Demand Scorer", category: "Scoring", status: "slow", lastRun: "2026-03-27 09:20", score: 68, nextRun: "2026-03-27 10:00" },
  { name: "Saturation Scorer", category: "Scoring", status: "ok", lastRun: "2026-03-27 09:31", score: 92, nextRun: "2026-03-27 10:01" },
  { name: "Seasonality Scorer", category: "Scoring", status: "ok", lastRun: "2026-03-27 09:30", score: 90, nextRun: "2026-03-27 10:00" },
  { name: "Price Elasticity Scorer", category: "Scoring", status: "ok", lastRun: "2026-03-27 09:29", score: 91, nextRun: "2026-03-27 09:59" },
  { name: "Audience Fit Scorer", category: "Scoring", status: "ok", lastRun: "2026-03-27 09:28", score: 95, nextRun: "2026-03-27 09:58" },
  { name: "Composite Scorer", category: "Scoring", status: "ok", lastRun: "2026-03-27 09:36", score: 98, nextRun: "2026-03-27 10:06" },
  // Advanced (4)
  { name: "AI Briefing Engine", category: "Advanced", status: "ok", lastRun: "2026-03-27 09:40", score: 97, nextRun: "2026-03-27 10:40" },
  { name: "Content Generator", category: "Advanced", status: "ok", lastRun: "2026-03-27 09:38", score: 95, nextRun: "2026-03-27 10:38" },
  { name: "Pricing Optimizer", category: "Advanced", status: "slow", lastRun: "2026-03-27 09:10", score: 74, nextRun: "2026-03-27 10:10" },
  { name: "Fraud Detector", category: "Advanced", status: "ok", lastRun: "2026-03-27 09:42", score: 99, nextRun: "2026-03-27 10:12" },
  // Governor (1)
  { name: "Governor Engine", category: "Governor", status: "ok", lastRun: "2026-03-27 09:45", score: 100, nextRun: "2026-03-27 09:50" },
];

/* ── Mock Data: 14 Providers ──────────────────────────────────── */

interface Provider {
  name: string;
  status: EngineStatus;
  rateLimit: string;
  callsToday: number;
  callsRemaining: number;
  lastSuccess: string;
}

const PROVIDERS: Provider[] = [
  { name: "TikTok", status: "ok", rateLimit: "100/min", callsToday: 4820, callsRemaining: 95180, lastSuccess: "2026-03-27 09:44:32" },
  { name: "Amazon", status: "ok", rateLimit: "50/min", callsToday: 3210, callsRemaining: 46790, lastSuccess: "2026-03-27 09:44:18" },
  { name: "Shopify", status: "ok", rateLimit: "40/min", callsToday: 2890, callsRemaining: 47110, lastSuccess: "2026-03-27 09:43:55" },
  { name: "Pinterest", status: "ok", rateLimit: "60/min", callsToday: 1540, callsRemaining: 58460, lastSuccess: "2026-03-27 09:42:10" },
  { name: "Reddit", status: "slow", rateLimit: "30/min", callsToday: 980, callsRemaining: 29020, lastSuccess: "2026-03-27 09:38:22" },
  { name: "YouTube", status: "ok", rateLimit: "100/min", callsToday: 2150, callsRemaining: 97850, lastSuccess: "2026-03-27 09:44:05" },
  { name: "eBay", status: "ok", rateLimit: "50/min", callsToday: 1870, callsRemaining: 48130, lastSuccess: "2026-03-27 09:43:40" },
  { name: "Facebook", status: "ok", rateLimit: "200/min", callsToday: 3420, callsRemaining: 196580, lastSuccess: "2026-03-27 09:44:28" },
  { name: "Instagram", status: "error", rateLimit: "200/min", callsToday: 1240, callsRemaining: 0, lastSuccess: "2026-03-27 08:42:15" },
  { name: "Alibaba", status: "ok", rateLimit: "30/min", callsToday: 890, callsRemaining: 29110, lastSuccess: "2026-03-27 09:41:50" },
  { name: "Etsy", status: "ok", rateLimit: "40/min", callsToday: 1120, callsRemaining: 38880, lastSuccess: "2026-03-27 09:43:12" },
  { name: "AliExpress", status: "ok", rateLimit: "30/min", callsToday: 760, callsRemaining: 29240, lastSuccess: "2026-03-27 09:40:35" },
  { name: "Gumroad", status: "ok", rateLimit: "20/min", callsToday: 340, callsRemaining: 19660, lastSuccess: "2026-03-27 09:39:18" },
  { name: "PartnerStack", status: "ok", rateLimit: "20/min", callsToday: 180, callsRemaining: 19820, lastSuccess: "2026-03-27 09:38:45" },
];

/* ── Mock Alert History ───────────────────────────────────────── */

interface Alert {
  id: string;
  timestamp: string;
  severity: "critical" | "warning" | "info";
  message: string;
}

const ALERTS: Alert[] = [
  { id: "a1", timestamp: "2026-03-27 08:45:00", severity: "critical", message: "Instagram Discovery engine failed: API rate limit exceeded (429). Auto-retry scheduled." },
  { id: "a2", timestamp: "2026-03-27 07:12:00", severity: "warning", message: "Reddit Discovery engine response time degraded: 4200ms avg (threshold: 2000ms)" },
  { id: "a3", timestamp: "2026-03-27 06:30:00", severity: "info", message: "Demand Scorer cache refreshed. 12,400 products re-scored." },
  { id: "a4", timestamp: "2026-03-26 22:15:00", severity: "warning", message: "Pricing Optimizer latency spike: 3800ms avg for 15 minutes" },
  { id: "a5", timestamp: "2026-03-26 18:00:00", severity: "info", message: "Daily engine fleet health check completed. 24/25 engines healthy." },
  { id: "a6", timestamp: "2026-03-26 14:30:00", severity: "critical", message: "Instagram API returned 503 Service Unavailable. Provider marked as down." },
  { id: "a7", timestamp: "2026-03-25 09:00:00", severity: "info", message: "Scheduled maintenance completed. All engines restarted successfully." },
  { id: "a8", timestamp: "2026-03-24 16:45:00", severity: "warning", message: "AliExpress rate limit approaching: 28,500/30,000 daily calls used" },
  { id: "a9", timestamp: "2026-03-23 11:20:00", severity: "info", message: "New engine deployed: Fraud Detector v2.1 with enhanced pattern matching" },
  { id: "a10", timestamp: "2026-03-22 08:10:00", severity: "critical", message: "Database connection pool exhausted. Auto-scaled from 10 to 20 connections." },
  { id: "a11", timestamp: "2026-03-21 14:55:00", severity: "warning", message: "YouTube API quota at 85%. Rate limiting applied to non-priority requests." },
];

/* ── Helpers ──────────────────────────────────────────────────── */

function StatusDot({ status }: { status: EngineStatus }) {
  if (status === "ok") return <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />OK</span>;
  if (status === "slow") return <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />Slow</span>;
  return <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Error</span>;
}

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "critical") return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Critical</Badge>;
  if (severity === "warning") return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Warning</Badge>;
  return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Info</Badge>;
}

/* ── Page Component ──────────────────────────────────────────── */

export default function HealthPage() {
  const [refreshing, setRefreshing] = useState(false);

  const okCount = ENGINES.filter((e) => e.status === "ok").length;
  const slowCount = ENGINES.filter((e) => e.status === "slow").length;
  const errorCount = ENGINES.filter((e) => e.status === "error").length;
  const provOk = PROVIDERS.filter((p) => p.status === "ok").length;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Health Monitor</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time status of all engines and providers</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Server className="w-4 h-4" /> Engines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{okCount}/{ENGINES.length}</div>
            <p className="text-xs text-muted-foreground">healthy</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> OK
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{okCount}</div>
            <p className="text-xs text-muted-foreground">engines running normally</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Slow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{slowCount}</div>
            <p className="text-xs text-muted-foreground">engines degraded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-500" /> Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{errorCount}</div>
            <p className="text-xs text-muted-foreground">engines down</p>
          </CardContent>
        </Card>
      </div>

      {/* All 25 Engines Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            All Engines ({ENGINES.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Engine Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead>Next Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ENGINES.map((e) => (
                <TableRow key={e.name} className={e.status === "error" ? "bg-red-50/50 dark:bg-red-950/20" : e.status === "slow" ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{e.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell><StatusDot status={e.status} /></TableCell>
                  <TableCell className="font-mono text-xs">{e.lastRun}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono font-medium ${e.score >= 90 ? "text-green-600 dark:text-green-400" : e.score >= 70 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                      {e.score > 0 ? e.score : "--"}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{e.nextRun}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* All 14 Providers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4" />
            All Providers ({PROVIDERS.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rate Limit</TableHead>
                <TableHead className="text-right">Calls Today</TableHead>
                <TableHead className="text-right">Calls Remaining</TableHead>
                <TableHead>Last Success</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PROVIDERS.map((p) => (
                <TableRow key={p.name} className={p.status === "error" ? "bg-red-50/50 dark:bg-red-950/20" : p.status === "slow" ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><StatusDot status={p.status} /></TableCell>
                  <TableCell className="font-mono text-xs">{p.rateLimit}</TableCell>
                  <TableCell className="text-right font-mono">{p.callsToday.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono">
                    <span className={p.callsRemaining === 0 ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                      {p.callsRemaining.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.lastSuccess}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alert History (7 days) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Alert History (7 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ALERTS.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <div className="shrink-0 mt-0.5">
                  <SeverityBadge severity={a.severity} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.message}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{a.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
