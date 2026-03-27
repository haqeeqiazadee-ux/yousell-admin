"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield, ShieldCheck, ShieldAlert, Layers, Eye,
  Ban, CheckCircle, AlertTriangle, Loader2,
  Radio, Cloud, Brain, Lock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FraudRule {
  id: string;
  name: string;
  threshold: string;
  active: boolean;
  last_triggered: string | null;
}

interface FlaggedOrder {
  id: string;
  order_id: string;
  date: string;
  value: number;
  flag_reason: string;
  status: "flagged" | "approved" | "blocked" | "investigating";
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_RULES: FraudRule[] = [
  { id: "r1", name: "High-value order threshold", threshold: "> £500 per transaction", active: true, last_triggered: "2026-03-26T14:30:00Z" },
  { id: "r2", name: "Velocity check", threshold: "> 5 orders in 1 hour from same IP", active: true, last_triggered: "2026-03-25T09:15:00Z" },
  { id: "r3", name: "Mismatched billing/shipping", threshold: "Country mismatch detected", active: true, last_triggered: "2026-03-24T18:45:00Z" },
  { id: "r4", name: "Disposable email detection", threshold: "Known disposable domain", active: false, last_triggered: null },
];

const MOCK_FLAGS: FlaggedOrder[] = [
  { id: "f1", order_id: "ORD-7829", date: "2026-03-27T02:14:00Z", value: 649.99, flag_reason: "High-value order from new account", status: "flagged" },
  { id: "f2", order_id: "ORD-7815", date: "2026-03-26T23:45:00Z", value: 312.50, flag_reason: "Billing/shipping country mismatch (GB/NG)", status: "investigating" },
  { id: "f3", order_id: "ORD-7801", date: "2026-03-26T18:30:00Z", value: 89.97, flag_reason: "6 orders from same IP in 45 minutes", status: "blocked" },
  { id: "f4", order_id: "ORD-7798", date: "2026-03-26T15:12:00Z", value: 524.00, flag_reason: "Card BIN mismatch with IP geolocation", status: "approved" },
  { id: "f5", order_id: "ORD-7790", date: "2026-03-26T11:08:00Z", value: 199.99, flag_reason: "Multiple failed payment attempts before success", status: "flagged" },
];

const FLAG_STATUS_STYLES: Record<string, string> = {
  flagged: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  blocked: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  investigating: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

const LAYERS = [
  {
    layer: 1,
    name: "Stripe Radar",
    description: "Machine-learning fraud scoring on every payment. Automatically blocks high-risk transactions before they reach your store.",
    icon: Lock,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    layer: 2,
    name: "YOUSELL ML",
    description: "Custom anomaly detection trained on your order history. Catches patterns Stripe misses: velocity spikes, geo anomalies, and repeat offenders.",
    icon: Brain,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    layer: 3,
    name: "Cloudflare Turnstile",
    description: "Bot mitigation at the edge. Stops automated checkout fraud, credential stuffing, and card testing before requests hit your server.",
    icon: Cloud,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function FraudDetectionPage() {
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [flags, setFlags] = useState<FlaggedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/settings/fraud");
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules ?? MOCK_RULES);
        setFlags(data.flags ?? MOCK_FLAGS);
      } else {
        setRules(MOCK_RULES);
        setFlags(MOCK_FLAGS);
      }
    } catch {
      setRules(MOCK_RULES);
      setFlags(MOCK_FLAGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleToggleRule(ruleId: string, active: boolean) {
    try {
      await authFetch("/api/admin/settings/fraud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_rule", ruleId, active }),
      });
      setRules((prev) => prev.map((r) => r.id === ruleId ? { ...r, active } : r));
    } catch (err) {
      console.error("Failed to toggle rule:", err);
    }
  }

  async function handleFlagAction(flagId: string, action: "approve" | "block" | "investigate") {
    setProcessing(flagId);
    try {
      await authFetch("/api/admin/settings/fraud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: `flag_${action}`, flagId }),
      });
      const statusMap: Record<string, FlaggedOrder["status"]> = {
        approve: "approved",
        block: "blocked",
        investigate: "investigating",
      };
      setFlags((prev) => prev.map((f) => f.id === flagId ? { ...f, status: statusMap[action] } : f));
    } catch (err) {
      console.error(`Failed to ${action} flag:`, err);
    } finally {
      setProcessing(null);
    }
  }

  const flaggedToday = flags.filter((f) => {
    const today = new Date().toISOString().slice(0, 10);
    return f.date.startsWith(today) && f.status === "flagged";
  }).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Status Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" /> Fraud Detection
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            3-layer protection with real-time anomaly detection
          </p>
        </div>
        <Badge
          className={
            flaggedToday === 0
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-3 py-1"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 px-3 py-1"
          }
        >
          <Radio className="h-3 w-3 mr-1" />
          {flaggedToday === 0 ? "0 orders flagged today" : `${flaggedToday} order${flaggedToday > 1 ? "s" : ""} flagged today`}
        </Badge>
      </div>

      {/* 3-Layer Architecture Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layers className="h-4 w-4" /> 3-Layer Fraud Protection Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LAYERS.map((layer) => {
              const Icon = layer.icon;
              return (
                <div key={layer.layer} className="relative p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-lg ${layer.bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${layer.color}`} />
                    </div>
                    <div>
                      <Badge variant="outline" className="text-xs mb-1">Layer {layer.layer}</Badge>
                      <h3 className="font-semibold">{layer.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{layer.description}</p>
                  <div className="absolute top-3 right-3">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Rules & Flagged Orders */}
      <Tabs defaultValue="flagged" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flagged">
            <ShieldAlert className="h-4 w-4 mr-1" /> Flagged Orders ({flags.filter(f => f.status === "flagged" || f.status === "investigating").length})
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Shield className="h-4 w-4 mr-1" /> Detection Rules ({rules.length})
          </TabsTrigger>
        </TabsList>

        {/* Flagged Orders Tab */}
        <TabsContent value="flagged">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Flag Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flags.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell className="font-mono font-medium">{flag.order_id}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(flag.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell className="font-medium">&pound;{flag.value.toFixed(2)}</TableCell>
                      <TableCell className="text-sm max-w-[250px]">{flag.flag_reason}</TableCell>
                      <TableCell>
                        <Badge className={FLAG_STATUS_STYLES[flag.status]}>{flag.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {(flag.status === "flagged" || flag.status === "investigating") && (
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleFlagAction(flag.id, "approve")}
                              disabled={processing === flag.id}
                            >
                              {processing === flag.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleFlagAction(flag.id, "block")}
                              disabled={processing === flag.id}
                            >
                              <Ban className="h-3 w-3 mr-1" /> Block
                            </Button>
                            {flag.status !== "investigating" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFlagAction(flag.id, "investigate")}
                                disabled={processing === flag.id}
                              >
                                <Eye className="h-3 w-3 mr-1" /> Investigate
                              </Button>
                            )}
                          </div>
                        )}
                        {flag.status === "approved" && (
                          <span className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Approved
                          </span>
                        )}
                        {flag.status === "blocked" && (
                          <span className="text-sm text-red-600 flex items-center gap-1">
                            <Ban className="h-3 w-3" /> Blocked
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detection Rules Tab */}
        <TabsContent value="rules">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Triggered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{rule.threshold}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={rule.active}
                            onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                          />
                          <Badge
                            className={
                              rule.active
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            }
                          >
                            {rule.active ? "Active" : "Disabled"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rule.last_triggered
                          ? new Date(rule.last_triggered).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                          : "Never"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
