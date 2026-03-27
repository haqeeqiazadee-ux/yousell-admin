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
  Shield, ShieldAlert, Plus, AlertTriangle, Ban, CheckCircle,
  Eye, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
  DollarSign, Activity, AlertCircle
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface FraudRule {
  id: string;
  name: string;
  rule_type: string;
  description: string;
  threshold: Record<string, unknown>;
  severity: string;
  action: string;
  active: boolean;
  triggers_count: number;
  last_triggered_at: string | null;
  created_at: string;
}

interface FraudFlag {
  id: string;
  order_id: string;
  customer_email: string;
  risk_score: number;
  risk_level: string;
  risk_factors: Array<{ type: string; detail: string; weight: number }>;
  status: string;
  transaction_amount: number;
  ip_address: string;
  geo_location: string;
  action_taken_by: string;
  action_notes: string;
  created_at: string;
}

interface Metrics {
  flagged24h: number;
  blocked: number;
  cleared: number;
  escalated: number;
  fraudRate: string;
  protectedRevenue: number;
  avgRiskScore: number;
}

const PAGE_SIZE = 25;

const RISK_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const STATUS_COLORS: Record<string, string> = {
  flagged: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  blocked: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  cleared: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  escalated: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function FraudPage() {
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"monitor" | "rules">("monitor");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [ruleForm, setRuleForm] = useState({ name: "", ruleType: "amount", description: "", severity: "medium", ruleAction: "flag" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/fraud");
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
        setFlags(data.flags || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error("Error loading fraud data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleRule = async (id: string, active: boolean) => {
    await authFetch("/api/admin/fraud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_rule", id, active }),
    });
    await fetchData();
  };

  const takeAction = async (flagId: string, flagAction: string) => {
    setSubmitting(true);
    await authFetch("/api/admin/fraud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "take_action", flagId, flagAction }),
    });
    await fetchData();
    setSubmitting(false);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await authFetch("/api/admin/fraud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_rule", ...ruleForm }),
    });
    if (res.ok) {
      setRuleForm({ name: "", ruleType: "amount", description: "", severity: "medium", ruleAction: "flag" });
      setRuleDialogOpen(false);
      await fetchData();
    }
    setSubmitting(false);
  };

  const filteredFlags = flags.filter(f => {
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    if (riskFilter !== "all" && f.risk_level !== riskFilter) return false;
    return true;
  });

  const pagedFlags = filteredFlags.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function riskScoreColor(score: number): string {
    if (score >= 80) return "text-red-600 dark:text-red-400";
    if (score >= 60) return "text-orange-600 dark:text-orange-400";
    if (score >= 40) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" />
            Fraud & Security
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Transaction monitoring, risk detection, and fraud rules</p>
        </div>
      </div>

      {/* Metrics Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Flagged (24h)</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-amber-500" />{metrics?.flagged24h || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Blocked</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Ban className="w-5 h-5 text-red-500" />{metrics?.blocked || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fraud Rate</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-orange-500" />{metrics?.fraudRate || "0"}%</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Protected Revenue</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-500" />${(metrics?.protectedRevenue || 0).toLocaleString()}</div></CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["monitor", "rules"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {t === "monitor" ? "Transaction Monitor" : "Fraud Rules"}
          </button>
        ))}
      </div>

      {/* Monitor Tab */}
      {tab === "monitor" && (
        <Card>
          <CardHeader>
            <CardTitle>Flagged Transactions</CardTitle>
            <div className="flex gap-4 mt-2">
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground self-center">Status:</span>
                {["all", "flagged", "blocked", "cleared", "escalated"].map(f => (
                  <button key={f} onClick={() => { setStatusFilter(f); setPage(1); }} className={`px-3 py-1 rounded-lg text-xs capitalize ${statusFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground self-center">Risk:</span>
                {["all", "low", "medium", "high", "critical"].map(f => (
                  <button key={f} onClick={() => { setRiskFilter(f); setPage(1); }} className={`px-3 py-1 rounded-lg text-xs capitalize ${riskFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : filteredFlags.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No flagged transactions</p>
                <p className="text-sm">All transactions look clean</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Factors</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedFlags.map(flag => (
                      <TableRow key={flag.id}>
                        <TableCell className="font-mono text-sm">{flag.order_id || "—"}</TableCell>
                        <TableCell className="text-sm">{flag.customer_email || "—"}</TableCell>
                        <TableCell className="font-medium">${(flag.transaction_amount || 0).toFixed(2)}</TableCell>
                        <TableCell><span className={`font-bold ${riskScoreColor(flag.risk_score)}`}>{flag.risk_score}</span></TableCell>
                        <TableCell><Badge className={`text-xs ${RISK_COLORS[flag.risk_level] || ""}`}>{flag.risk_level}</Badge></TableCell>
                        <TableCell className="max-w-[150px]">
                          <div className="flex flex-wrap gap-1">
                            {(flag.risk_factors || []).slice(0, 2).map((f, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{f.type}</Badge>
                            ))}
                            {(flag.risk_factors || []).length > 2 && <Badge variant="outline" className="text-xs">+{flag.risk_factors.length - 2}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell><Badge className={`text-xs ${STATUS_COLORS[flag.status] || ""}`}>{flag.status}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(flag.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {flag.status === "flagged" && (
                            <div className="flex gap-1">
                              <button onClick={() => takeAction(flag.id, "clear")} disabled={submitting} className="text-xs px-2 py-1 rounded bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 disabled:opacity-50">Clear</button>
                              <button onClick={() => takeAction(flag.id, "block")} disabled={submitting} className="text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 disabled:opacity-50">Block</button>
                              <button onClick={() => takeAction(flag.id, "escalate")} disabled={submitting} className="text-xs px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 disabled:opacity-50">Escalate</button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredFlags.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <span className="text-xs text-muted-foreground">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredFlags.length)} of {filteredFlags.length}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center gap-1 text-xs disabled:opacity-50"><ChevronLeft className="h-4 w-4" /> Prev</button>
                      <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(filteredFlags.length / PAGE_SIZE)} className="flex items-center gap-1 text-xs disabled:opacity-50">Next <ChevronRight className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rules Tab */}
      {tab === "rules" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fraud Rules Engine</CardTitle>
            <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add Rule</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Fraud Rule</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateRule} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Rule Name</Label>
                    <Input value={ruleForm.name} onChange={e => setRuleForm(f => ({ ...f, name: e.target.value }))} placeholder="High Value Order Check" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Rule Type</Label>
                      <select value={ruleForm.ruleType} onChange={e => setRuleForm(f => ({ ...f, ruleType: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                        <option value="amount">Amount</option>
                        <option value="velocity">Velocity</option>
                        <option value="geo">Geo</option>
                        <option value="device">Device</option>
                        <option value="email">Email</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <select value={ruleForm.severity} onChange={e => setRuleForm(f => ({ ...f, severity: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={ruleForm.description} onChange={e => setRuleForm(f => ({ ...f, description: e.target.value }))} placeholder="What this rule checks for" />
                  </div>
                  <div className="space-y-2">
                    <Label>Action</Label>
                    <select value={ruleForm.ruleAction} onChange={e => setRuleForm(f => ({ ...f, ruleAction: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                      <option value="flag">Flag for Review</option>
                      <option value="block">Block Automatically</option>
                      <option value="escalate">Escalate</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Creating..." : "Create Rule"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : rules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No fraud rules configured</p>
                <p className="text-sm">Add rules to start monitoring transactions</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Triggers</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <span className="font-medium">{rule.name}</span>
                          {rule.description && <p className="text-xs text-muted-foreground mt-0.5">{rule.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-xs capitalize">{rule.rule_type}</Badge></TableCell>
                      <TableCell><Badge className={`text-xs ${SEVERITY_COLORS[rule.severity] || ""}`}>{rule.severity}</Badge></TableCell>
                      <TableCell className="text-sm capitalize">{rule.action}</TableCell>
                      <TableCell className="text-sm">{rule.triggers_count}</TableCell>
                      <TableCell>
                        <button onClick={() => toggleRule(rule.id, !rule.active)} className="cursor-pointer">
                          {rule.active
                            ? <span className="flex items-center gap-1 text-green-600"><ToggleRight size={18} /> Active</span>
                            : <span className="flex items-center gap-1 text-gray-400"><ToggleLeft size={18} /> Off</span>}
                        </button>
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
