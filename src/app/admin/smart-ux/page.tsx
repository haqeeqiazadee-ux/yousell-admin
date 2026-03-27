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
  Sparkles, ToggleLeft, ToggleRight, Plus, FlaskConical,
  ShoppingCart, MousePointerClick, Home, Search, Package,
  Star, Users, TrendingUp, BarChart3, Zap, Target
} from "lucide-react";
import { authFetch } from "@/lib/auth-fetch";

interface SmartUXFeature {
  id: string;
  feature_key: string;
  display_name: string;
  description: string;
  category: string;
  enabled: boolean;
  config: Record<string, unknown>;
  impact_metrics: { conversion_lift?: number; cart_value_change?: number; bounce_rate_change?: number; engagement_score?: number };
}

interface ABTest {
  id: string;
  name: string;
  feature_key: string;
  variant_a: string;
  variant_b: string;
  traffic_split_pct: number;
  status: string;
  current_winner: string | null;
  confidence_pct: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface PersonalizationRule {
  id: string;
  name: string;
  segment: string;
  feature_key: string;
  conditions: Record<string, unknown>;
  action: Record<string, unknown>;
  priority: number;
  active: boolean;
  triggers_count: number;
}

interface SmartUXMetrics {
  enabledFeatures: number;
  totalFeatures: number;
  runningTests: number;
  completedTests: number;
  activeRules: number;
}

const FEATURE_ICONS: Record<string, typeof ShoppingCart> = {
  "smart-cart": ShoppingCart,
  "exit-intent": MousePointerClick,
  "personalized-homepage": Home,
  "smart-search": Search,
  "dynamic-bundles": Package,
  "social-proof": Star,
};

const CATEGORY_COLORS: Record<string, string> = {
  conversion: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  engagement: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  personalization: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  discovery: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

const TEST_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  running: "bg-blue-100 text-blue-800",
  paused: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-800",
};

const SEGMENT_COLORS: Record<string, string> = {
  "new-visitor": "bg-blue-100 text-blue-800",
  returning: "bg-green-100 text-green-800",
  "high-value": "bg-purple-100 text-purple-800",
  "cart-abandoner": "bg-amber-100 text-amber-800",
  "frequent-buyer": "bg-indigo-100 text-indigo-800",
};

export default function SmartUXPage() {
  const [features, setFeatures] = useState<SmartUXFeature[]>([]);
  const [tests, setTests] = useState<ABTest[]>([]);
  const [rules, setRules] = useState<PersonalizationRule[]>([]);
  const [metrics, setMetrics] = useState<SmartUXMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"features" | "tests" | "rules">("features");
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [testForm, setTestForm] = useState({ name: "", featureKey: "", variantA: "Control", variantB: "Treatment", trafficSplitPct: 50 });
  const [ruleForm, setRuleForm] = useState({ name: "", segment: "new-visitor", featureKey: "", priority: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/smart-ux");
      if (res.ok) {
        const data = await res.json();
        setFeatures(data.features || []);
        setTests(data.tests || []);
        setRules(data.rules || []);
        setMetrics(data.metrics || null);
      }
    } catch (err) {
      console.error("Error loading smart UX data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleFeature = async (featureKey: string, enabled: boolean) => {
    await authFetch("/api/admin/smart-ux", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_feature", featureKey, enabled }),
    });
    await fetchData();
  };

  const updateTestStatus = async (id: string, status: string) => {
    setSubmitting(true);
    await authFetch("/api/admin/smart-ux", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_test_status", id, status }),
    });
    await fetchData();
    setSubmitting(false);
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await authFetch("/api/admin/smart-ux", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_test", ...testForm }),
    });
    if (res.ok) {
      setTestForm({ name: "", featureKey: "", variantA: "Control", variantB: "Treatment", trafficSplitPct: 50 });
      setTestDialogOpen(false);
      await fetchData();
    }
    setSubmitting(false);
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await authFetch("/api/admin/smart-ux", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create_rule", ...ruleForm }),
    });
    if (res.ok) {
      setRuleForm({ name: "", segment: "new-visitor", featureKey: "", priority: 0 });
      setRuleDialogOpen(false);
      await fetchData();
    }
    setSubmitting(false);
  };

  const toggleRule = async (id: string, active: boolean) => {
    await authFetch("/api/admin/smart-ux", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_rule", id, active }),
    });
    await fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-pink-500" />
            Smart UX / AI Features
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered frontend features, A/B testing, and personalization rules</p>
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
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Enabled Features</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Zap className="w-5 h-5 text-green-500" />{metrics?.enabledFeatures || 0} / {metrics?.totalFeatures || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Running Tests</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><FlaskConical className="w-5 h-5 text-blue-500" />{metrics?.runningTests || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Completed Tests</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Target className="w-5 h-5 text-purple-500" />{metrics?.completedTests || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Rules</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-amber-500" />{metrics?.activeRules || 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Impact</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" />Tracking</div></CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["features", "tests", "rules"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            {t === "features" ? "Feature Toggles" : t === "tests" ? "A/B Tests" : "Personalization Rules"}
          </button>
        ))}
      </div>

      {/* Features Tab */}
      {tab === "features" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)
          ) : features.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No features configured</p>
            </div>
          ) : (
            features.map(f => {
              const Icon = FEATURE_ICONS[f.feature_key] || Sparkles;
              return (
                <Card key={f.id} className={`transition-all ${f.enabled ? "border-green-300 dark:border-green-800 shadow-sm" : ""}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${f.enabled ? "text-green-500" : "text-gray-400"}`} />
                        <CardTitle className="text-base">{f.display_name}</CardTitle>
                      </div>
                      <button onClick={() => toggleFeature(f.feature_key, !f.enabled)} className="cursor-pointer">
                        {f.enabled
                          ? <ToggleRight className="h-6 w-6 text-green-500" />
                          : <ToggleLeft className="h-6 w-6 text-gray-400" />}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{f.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${CATEGORY_COLORS[f.category] || ""}`}>{f.category}</Badge>
                      {f.enabled
                        ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">Active</Badge>
                        : <Badge variant="outline" className="text-xs">Disabled</Badge>}
                    </div>
                    {f.impact_metrics && (f.impact_metrics.conversion_lift || f.impact_metrics.cart_value_change) && (
                      <div className="text-xs space-y-1 pt-1 border-t">
                        {f.impact_metrics.conversion_lift !== undefined && (
                          <div className="flex justify-between"><span className="text-muted-foreground">Conversion lift</span><span className={f.impact_metrics.conversion_lift > 0 ? "text-green-600" : "text-red-600"}>{f.impact_metrics.conversion_lift > 0 ? "+" : ""}{f.impact_metrics.conversion_lift}%</span></div>
                        )}
                        {f.impact_metrics.cart_value_change !== undefined && (
                          <div className="flex justify-between"><span className="text-muted-foreground">Cart value change</span><span className={f.impact_metrics.cart_value_change > 0 ? "text-green-600" : "text-red-600"}>{f.impact_metrics.cart_value_change > 0 ? "+" : ""}{f.impact_metrics.cart_value_change}%</span></div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* A/B Tests Tab */}
      {tab === "tests" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>A/B Test Manager</CardTitle>
            <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />New Test</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create A/B Test</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateTest} className="space-y-4">
                  <div className="space-y-2"><Label>Test Name</Label><Input value={testForm.name} onChange={e => setTestForm(f => ({ ...f, name: e.target.value }))} placeholder="Homepage CTA Color Test" required /></div>
                  <div className="space-y-2">
                    <Label>Feature</Label>
                    <select value={testForm.featureKey} onChange={e => setTestForm(f => ({ ...f, featureKey: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" required>
                      <option value="">Select feature...</option>
                      {features.map(f => <option key={f.feature_key} value={f.feature_key}>{f.display_name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Variant A</Label><Input value={testForm.variantA} onChange={e => setTestForm(f => ({ ...f, variantA: e.target.value }))} /></div>
                    <div className="space-y-2"><Label>Variant B</Label><Input value={testForm.variantB} onChange={e => setTestForm(f => ({ ...f, variantB: e.target.value }))} /></div>
                  </div>
                  <div className="space-y-2"><Label>Traffic Split (% to Variant B)</Label><Input type="number" min="1" max="99" value={testForm.trafficSplitPct} onChange={e => setTestForm(f => ({ ...f, trafficSplitPct: parseInt(e.target.value) }))} /></div>
                  <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Creating..." : "Create Test"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FlaskConical className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No A/B tests</p>
                <p className="text-sm">Create an experiment to start optimizing</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Variant A</TableHead>
                    <TableHead>Variant B</TableHead>
                    <TableHead>Split</TableHead>
                    <TableHead>Winner</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tests.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell className="text-sm">{t.feature_key}</TableCell>
                      <TableCell className="text-sm">{t.variant_a}</TableCell>
                      <TableCell className="text-sm">{t.variant_b}</TableCell>
                      <TableCell>{100 - t.traffic_split_pct}% / {t.traffic_split_pct}%</TableCell>
                      <TableCell>{t.current_winner ? <Badge className="bg-green-100 text-green-800 text-xs">{t.current_winner}</Badge> : "—"}</TableCell>
                      <TableCell>{t.confidence_pct > 0 ? `${t.confidence_pct}%` : "—"}</TableCell>
                      <TableCell><Badge className={`text-xs ${TEST_STATUS_COLORS[t.status] || ""}`}>{t.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {t.status === "draft" && (
                            <button onClick={() => updateTestStatus(t.id, "running")} disabled={submitting} className="text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 disabled:opacity-50">Start</button>
                          )}
                          {t.status === "running" && (
                            <>
                              <button onClick={() => updateTestStatus(t.id, "paused")} disabled={submitting} className="text-xs px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 disabled:opacity-50">Pause</button>
                              <button onClick={() => updateTestStatus(t.id, "completed")} disabled={submitting} className="text-xs px-2 py-1 rounded bg-green-50 hover:bg-green-100 text-green-700 disabled:opacity-50">Complete</button>
                            </>
                          )}
                          {t.status === "paused" && (
                            <button onClick={() => updateTestStatus(t.id, "running")} disabled={submitting} className="text-xs px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 disabled:opacity-50">Resume</button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Personalization Rules Tab */}
      {tab === "rules" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personalization Rules</CardTitle>
            <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1"><Plus className="h-4 w-4" />Add Rule</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Personalization Rule</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateRule} className="space-y-4">
                  <div className="space-y-2"><Label>Rule Name</Label><Input value={ruleForm.name} onChange={e => setRuleForm(f => ({ ...f, name: e.target.value }))} placeholder="Show exit-intent to cart abandoners" required /></div>
                  <div className="space-y-2">
                    <Label>Segment</Label>
                    <select value={ruleForm.segment} onChange={e => setRuleForm(f => ({ ...f, segment: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700">
                      <option value="new-visitor">New Visitor</option>
                      <option value="returning">Returning</option>
                      <option value="high-value">High Value</option>
                      <option value="cart-abandoner">Cart Abandoner</option>
                      <option value="frequent-buyer">Frequent Buyer</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Feature</Label>
                    <select value={ruleForm.featureKey} onChange={e => setRuleForm(f => ({ ...f, featureKey: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" required>
                      <option value="">Select feature...</option>
                      {features.map(f => <option key={f.feature_key} value={f.feature_key}>{f.display_name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Priority</Label><Input type="number" value={ruleForm.priority} onChange={e => setRuleForm(f => ({ ...f, priority: parseInt(e.target.value) }))} /></div>
                  <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Creating..." : "Create Rule"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {rules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No personalization rules</p>
                <p className="text-sm">Create rules to target specific user segments</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Triggers</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell><Badge className={`text-xs capitalize ${SEGMENT_COLORS[r.segment] || ""}`}>{r.segment.replace(/-/g, " ")}</Badge></TableCell>
                      <TableCell className="text-sm">{r.feature_key}</TableCell>
                      <TableCell>{r.priority}</TableCell>
                      <TableCell>{r.triggers_count}</TableCell>
                      <TableCell>
                        <button onClick={() => toggleRule(r.id, !r.active)} className="cursor-pointer">
                          {r.active
                            ? <span className="flex items-center gap-1 text-green-600 text-sm"><ToggleRight size={18} /> Active</span>
                            : <span className="flex items-center gap-1 text-gray-400 text-sm"><ToggleLeft size={18} /> Off</span>}
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
