"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, XCircle, DollarSign, Clock, RefreshCw } from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface EngineHealth {
  name: string;
  status: "healthy" | "degraded" | "down";
  lastActivity: string | null;
  operationsLast24h: number;
  errorRate: number;
  avgLatencyMs: number;
  costLast24h: number;
}

interface MonitoringData {
  timestamp: string;
  system: {
    totalOperations24h: number;
    totalErrors24h: number;
    errorRate: number;
    totalCost24h: number;
  };
  engines: EngineHealth[];
  recentErrors: Array<{ engine: string; timestamp: string; costUsd: number }>;
  budgetAlerts: Array<{ clientId: string; spentPct: number; capUsd: number; spentUsd: number }>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "healthy") return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
  if (status === "degraded") return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Degraded</Badge>;
  return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Down</Badge>;
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await authFetch("/api/admin/monitoring");
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000); // 30s refresh
    return () => clearInterval(interval);
  }, [fetchData, autoRefresh]);

  if (loading) return <div className="p-6">Loading monitoring data...</div>;
  if (!data) return <div className="p-6 text-red-600">Failed to load monitoring data</div>;

  const { system, engines, recentErrors, budgetAlerts } = data;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Monitoring</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`text-sm px-3 py-1 rounded ${autoRefresh ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
          >
            <RefreshCw className={`w-3 h-3 inline mr-1 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </button>
          <span className="text-xs text-muted-foreground">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Operations (24h)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" />{system.totalOperations24h.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Error Rate</CardTitle></CardHeader>
          <CardContent><div className={`text-2xl font-bold ${system.errorRate > 10 ? "text-red-600" : system.errorRate > 5 ? "text-yellow-600" : "text-green-600"}`}>{system.errorRate}%</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Errors (24h)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" />{system.totalErrors24h}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Cost (24h)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" />${system.totalCost24h.toFixed(2)}</div></CardContent>
        </Card>
      </div>

      {/* Engine Health Grid */}
      <Card>
        <CardHeader><CardTitle>Engine Health</CardTitle></CardHeader>
        <CardContent>
          {engines.length === 0 ? (
            <p className="text-muted-foreground text-sm">No engine activity in the last 24 hours</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Engine</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium text-right">Ops</th>
                    <th className="pb-2 font-medium text-right">Error %</th>
                    <th className="pb-2 font-medium text-right">Avg Latency</th>
                    <th className="pb-2 font-medium text-right">Cost</th>
                    <th className="pb-2 font-medium text-right">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {engines.map((engine) => (
                    <tr key={engine.name} className="border-b last:border-0">
                      <td className="py-2 font-mono text-xs">{engine.name}</td>
                      <td className="py-2"><StatusBadge status={engine.status} /></td>
                      <td className="py-2 text-right">{engine.operationsLast24h}</td>
                      <td className={`py-2 text-right ${engine.errorRate > 10 ? "text-red-600 font-bold" : ""}`}>{engine.errorRate}%</td>
                      <td className="py-2 text-right flex items-center justify-end gap-1"><Clock className="w-3 h-3" />{engine.avgLatencyMs}ms</td>
                      <td className="py-2 text-right">${engine.costLast24h.toFixed(3)}</td>
                      <td className="py-2 text-right text-xs text-muted-foreground">
                        {engine.lastActivity ? new Date(engine.lastActivity).toLocaleTimeString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Errors */}
        <Card>
          <CardHeader><CardTitle className="text-red-600">Recent Errors (1h)</CardTitle></CardHeader>
          <CardContent>
            {recentErrors.length === 0 ? (
              <p className="text-sm text-green-600">No errors in the last hour</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentErrors.map((err, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b pb-1">
                    <span className="font-mono text-xs">{err.engine}</span>
                    <span className="text-xs text-muted-foreground">{new Date(err.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Alerts */}
        <Card>
          <CardHeader><CardTitle className="text-amber-600">Budget Alerts</CardTitle></CardHeader>
          <CardContent>
            {budgetAlerts.length === 0 ? (
              <p className="text-sm text-green-600">All budgets within limits</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {budgetAlerts.map((alert, i) => (
                  <div key={i} className="flex justify-between items-center text-sm border-b pb-1">
                    <span className="font-mono text-xs">Client {alert.clientId.slice(0, 8)}...</span>
                    <div className="text-right">
                      <span className={`font-bold ${alert.spentPct >= 90 ? "text-red-600" : "text-amber-600"}`}>{alert.spentPct}%</span>
                      <span className="text-xs text-muted-foreground ml-2">${alert.spentUsd} / ${alert.capUsd}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
