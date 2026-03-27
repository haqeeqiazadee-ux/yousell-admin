"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText, Search, RefreshCw, ChevronDown, ChevronUp,
  Filter, Info, AlertTriangle, XCircle,
} from "lucide-react";

/* ── Types ────────────────────────────────────────────────────── */

type LogLevel = "info" | "warning" | "error";
type LogSource = "API" | "Engine" | "Auth" | "Webhook";

interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  details: string;
}

/* ── Mock Data: 15 Log Entries ─────────────────────────────── */

const MOCK_LOGS: LogEntry[] = [
  { id: "log-001", timestamp: "2026-03-27 09:45:12", level: "info", source: "Engine", message: "TikTok Discovery scan completed successfully", details: "Scanned 342 products in 12.4s. Found 28 new trending items. Memory: 124MB peak." },
  { id: "log-002", timestamp: "2026-03-27 09:44:38", level: "error", source: "API", message: "Instagram API returned 429 Too Many Requests", details: "Endpoint: /api/v1/media/search. Rate limit: 200/hour. Current usage: 201. Retry-After: 3600s. Request ID: ig-req-8842." },
  { id: "log-003", timestamp: "2026-03-27 09:43:55", level: "info", source: "Engine", message: "Composite Scorer batch completed for 1,200 products", details: "Avg score: 62.4. Hot tier: 48 products. Warm: 312. Watch: 540. Cold: 300. Duration: 8.2s." },
  { id: "log-004", timestamp: "2026-03-27 09:42:10", level: "warning", source: "Engine", message: "Pricing Optimizer response time exceeded threshold", details: "Average latency: 3,800ms (threshold: 2,000ms). Affected requests: 45/120. Consider scaling or cache optimization." },
  { id: "log-005", timestamp: "2026-03-27 09:41:22", level: "info", source: "Auth", message: "Admin user authenticated via SSO", details: "User: admin@yousell.io. Provider: Google OAuth. IP: 82.132.xxx.xxx. Session expires: 2026-03-27 17:41:22." },
  { id: "log-006", timestamp: "2026-03-27 09:40:05", level: "error", source: "Webhook", message: "Webhook delivery failed to https://hooks.slack.com/...", details: "HTTP 502 Bad Gateway. Payload: product.scored event. Retry attempt 2/3. Next retry in 60s." },
  { id: "log-007", timestamp: "2026-03-27 09:38:48", level: "info", source: "API", message: "Bulk product import completed", details: "Imported 85 products from CSV upload. 82 successful, 3 skipped (duplicate SKUs). User: admin@yousell.io." },
  { id: "log-008", timestamp: "2026-03-27 09:37:15", level: "warning", source: "Engine", message: "Reddit Discovery API rate limit approaching", details: "Current usage: 28/30 requests per minute. Throttling enabled. Queue depth: 12 pending requests." },
  { id: "log-009", timestamp: "2026-03-27 09:35:30", level: "info", source: "Engine", message: "AI Briefing generated for client cl-042", details: "Model: Claude 3.5 Sonnet. Input tokens: 2,140. Output tokens: 890. Latency: 1,180ms. Quality score: 5/5." },
  { id: "log-010", timestamp: "2026-03-27 09:34:12", level: "error", source: "API", message: "Database connection timeout on products query", details: "Query: SELECT * FROM products WHERE... Timeout after 30,000ms. Connection pool: 18/20 in use. Retrying with fresh connection." },
  { id: "log-011", timestamp: "2026-03-27 09:32:45", level: "info", source: "Webhook", message: "Webhook delivered: product.discovered event", details: "URL: https://api.partner.com/webhooks. Response: 200 OK. Duration: 245ms. Payload size: 1.2KB." },
  { id: "log-012", timestamp: "2026-03-27 09:30:18", level: "warning", source: "Auth", message: "Failed login attempt detected", details: "Email: unknown@test.com. IP: 45.33.xxx.xxx. Reason: Invalid credentials. Attempt 3/5 before lockout." },
  { id: "log-013", timestamp: "2026-03-27 09:28:50", level: "info", source: "Engine", message: "Amazon Discovery completed product enrichment", details: "Enriched 156 products with pricing data, reviews (avg 4.2 stars), and BSR rankings. Duration: 22.1s." },
  { id: "log-014", timestamp: "2026-03-27 09:26:30", level: "info", source: "API", message: "Cron job executed: daily-score-recalculation", details: "Recalculated scores for 4,280 active products. Updated 892 tier assignments. Duration: 45.2s." },
  { id: "log-015", timestamp: "2026-03-27 09:24:15", level: "warning", source: "Engine", message: "Demand Scorer cache miss rate above threshold", details: "Cache miss rate: 34% (threshold: 20%). Cache size: 2.1GB/4GB. Consider warming cache during off-peak." },
];

/* ── Helpers ──────────────────────────────────────────────────── */

function LevelBadge({ level }: { level: LogLevel }) {
  if (level === "info") return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><Info className="w-3 h-3 mr-1" />Info</Badge>;
  if (level === "warning") return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
  return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
}

/* ── Page Component ──────────────────────────────────────────── */

export default function LogsPage() {
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => setLastRefresh(new Date()), 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredLogs = MOCK_LOGS.filter((log) => {
    if (levelFilter !== "all" && log.level !== levelFilter) return false;
    if (sourceFilter !== "all" && log.source !== sourceFilter) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase()) && !log.details.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const infoCount = MOCK_LOGS.filter((l) => l.level === "info").length;
  const warnCount = MOCK_LOGS.filter((l) => l.level === "warning").length;
  const errorCount = MOCK_LOGS.filter((l) => l.level === "error").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor system activity and troubleshoot issues</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "border-green-500 text-green-600 dark:text-green-400" : ""}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Last: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Summary Badges */}
      <div className="flex gap-3">
        <Badge variant="outline" className="text-xs">
          <Info className="w-3 h-3 mr-1 text-blue-500" />
          {infoCount} Info
        </Badge>
        <Badge variant="outline" className="text-xs">
          <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
          {warnCount} Warnings
        </Badge>
        <Badge variant="outline" className="text-xs">
          <XCircle className="w-3 h-3 mr-1 text-red-500" />
          {errorCount} Errors
        </Badge>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">All Sources</option>
              <option value="API">API</option>
              <option value="Engine">Engine</option>
              <option value="Auth">Auth</option>
              <option value="Webhook">Webhook</option>
            </select>
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Logs ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Timestamp</TableHead>
                <TableHead className="w-[100px]">Level</TableHead>
                <TableHead className="w-[90px]">Source</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-[60px]">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <>
                  <TableRow
                    key={log.id}
                    className={`cursor-pointer hover:bg-muted/50 ${log.level === "error" ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                    <TableCell><LevelBadge level={log.level} /></TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{log.source}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.message}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {expandedLog === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedLog === log.id && (
                    <TableRow key={`${log.id}-details`}>
                      <TableCell colSpan={5} className="bg-muted/30">
                        <div className="p-3 text-sm font-mono text-muted-foreground whitespace-pre-wrap">
                          {log.details}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No logs match your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
