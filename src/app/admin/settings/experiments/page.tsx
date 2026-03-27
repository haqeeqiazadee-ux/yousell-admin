"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FlaskConical, Plus, Pause, Play, Trophy, BarChart3,
  Clock, Target, Loader2, ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Experiment {
  id: string;
  name: string;
  feature: string;
  variant_a: string;
  variant_b: string;
  traffic_split: number;
  status: "running" | "paused" | "completed";
  started_at: string;
  ctr_a: number;
  ctr_b: number;
  significance: number;
  target_significance: number;
  estimated_days: number;
  sample_a: number;
  sample_b: number;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: "exp1",
    name: "Buy Button Color Test",
    feature: "Product Page CTA",
    variant_a: "Green button (control)",
    variant_b: "Orange button",
    traffic_split: 50,
    status: "running",
    started_at: "2026-03-15T10:00:00Z",
    ctr_a: 3.2,
    ctr_b: 4.1,
    significance: 87,
    target_significance: 95,
    estimated_days: 4,
    sample_a: 2341,
    sample_b: 2298,
  },
  {
    id: "exp2",
    name: "Pricing Display Format",
    feature: "Product Card",
    variant_a: "Price only",
    variant_b: "Price + savings badge",
    traffic_split: 50,
    status: "running",
    started_at: "2026-03-20T08:00:00Z",
    ctr_a: 2.8,
    ctr_b: 3.5,
    significance: 72,
    target_significance: 95,
    estimated_days: 8,
    sample_a: 1456,
    sample_b: 1489,
  },
  {
    id: "exp3",
    name: "Checkout Flow Steps",
    feature: "Checkout",
    variant_a: "3-step checkout",
    variant_b: "Single-page checkout",
    traffic_split: 50,
    status: "paused",
    started_at: "2026-03-10T14:00:00Z",
    ctr_a: 12.1,
    ctr_b: 14.8,
    significance: 91,
    target_significance: 95,
    estimated_days: 2,
    sample_a: 3891,
    sample_b: 3844,
  },
];

const STATUS_STYLES: Record<string, string> = {
  running: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  paused: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    feature: "",
    variant_a: "",
    variant_b: "",
    traffic_split: "50",
    success_metric: "ctr",
    min_sample: "1000",
  });

  const fetchExperiments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/settings/experiments");
      if (res.ok) {
        const data = await res.json();
        setExperiments(data.experiments ?? MOCK_EXPERIMENTS);
      } else {
        setExperiments(MOCK_EXPERIMENTS);
      }
    } catch {
      setExperiments(MOCK_EXPERIMENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExperiments(); }, [fetchExperiments]);

  async function handleCreate() {
    if (!form.name || !form.feature) return;
    setSubmitting(true);
    try {
      await authFetch("/api/admin/settings/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...form }),
      });
      const newExp: Experiment = {
        id: `exp${Date.now()}`,
        name: form.name,
        feature: form.feature,
        variant_a: form.variant_a || "Control",
        variant_b: form.variant_b || "Variant B",
        traffic_split: parseInt(form.traffic_split),
        status: "running",
        started_at: new Date().toISOString(),
        ctr_a: 0,
        ctr_b: 0,
        significance: 0,
        target_significance: 95,
        estimated_days: 14,
        sample_a: 0,
        sample_b: 0,
      };
      setExperiments((prev) => [newExp, ...prev]);
      setForm({ name: "", feature: "", variant_a: "", variant_b: "", traffic_split: "50", success_metric: "ctr", min_sample: "1000" });
      setCreateOpen(false);
    } catch (err) {
      console.error("Failed to create experiment:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAction(expId: string, action: string) {
    try {
      await authFetch("/api/admin/settings/experiments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, experimentId: expId }),
      });
      setExperiments((prev) =>
        prev.map((e) => {
          if (e.id !== expId) return e;
          if (action === "pause") return { ...e, status: "paused" as const };
          if (action === "resume") return { ...e, status: "running" as const };
          if (action === "declare_winner") return { ...e, status: "completed" as const };
          return e;
        })
      );
    } catch (err) {
      console.error(`Failed to ${action} experiment:`, err);
    }
  }

  /* KPIs */
  const running = experiments.filter((e) => e.status === "running").length;
  const paused = experiments.filter((e) => e.status === "paused").length;
  const completed = experiments.filter((e) => e.status === "completed").length;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="h-6 w-6" /> A/B Test Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Run experiments and measure what converts best
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Create Experiment</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Experiment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Experiment Name</Label>
                <Input placeholder="e.g. Buy Button Color Test" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Feature</Label>
                <Select value={form.feature} onValueChange={(v) => setForm({ ...form, feature: v })}>
                  <SelectTrigger><SelectValue placeholder="Select feature..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product Page CTA">Product Page CTA</SelectItem>
                    <SelectItem value="Product Card">Product Card</SelectItem>
                    <SelectItem value="Checkout">Checkout</SelectItem>
                    <SelectItem value="Search Results">Search Results</SelectItem>
                    <SelectItem value="Navigation">Navigation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Variant A (Control)</Label>
                  <Input placeholder="Control description" value={form.variant_a} onChange={(e) => setForm({ ...form, variant_a: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Variant B</Label>
                  <Input placeholder="Variant description" value={form.variant_b} onChange={(e) => setForm({ ...form, variant_b: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Traffic Split (%)</Label>
                  <Input type="number" min="10" max="90" value={form.traffic_split} onChange={(e) => setForm({ ...form, traffic_split: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Success Metric</Label>
                  <Select value={form.success_metric} onValueChange={(v) => setForm({ ...form, success_metric: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ctr">CTR</SelectItem>
                      <SelectItem value="conversion">Conversion Rate</SelectItem>
                      <SelectItem value="revenue">Revenue per User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Min Sample Size</Label>
                  <Input type="number" value={form.min_sample} onChange={(e) => setForm({ ...form, min_sample: e.target.value })} />
                </div>
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={submitting || !form.name || !form.feature}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FlaskConical className="h-4 w-4 mr-2" />}
                Launch Experiment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Running</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-500">{running}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Paused</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-amber-500">{paused}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-500">{completed}</p></CardContent>
        </Card>
      </div>

      {/* Experiment Cards */}
      <div className="space-y-4">
        {experiments.map((exp) => {
          const winner = exp.ctr_b > exp.ctr_a ? "B" : "A";
          const uplift = exp.ctr_a > 0 ? Math.abs(((exp.ctr_b - exp.ctr_a) / exp.ctr_a) * 100).toFixed(1) : "0";
          return (
            <Card key={exp.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{exp.name}</h3>
                      <Badge className={STATUS_STYLES[exp.status]}>{exp.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Feature: {exp.feature} | Started: {new Date(exp.started_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {exp.status === "running" && (
                      <Button variant="outline" size="sm" onClick={() => handleAction(exp.id, "pause")}>
                        <Pause className="h-3 w-3 mr-1" /> Pause
                      </Button>
                    )}
                    {exp.status === "paused" && (
                      <Button variant="outline" size="sm" onClick={() => handleAction(exp.id, "resume")}>
                        <Play className="h-3 w-3 mr-1" /> Resume
                      </Button>
                    )}
                    {exp.status !== "completed" && (
                      <Button variant="outline" size="sm" onClick={() => handleAction(exp.id, "declare_winner")}>
                        <Trophy className="h-3 w-3 mr-1" /> Declare Winner
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="h-3 w-3 mr-1" /> View Results
                    </Button>
                  </div>
                </div>

                {/* Variant comparison */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className={`p-3 rounded-lg border ${winner === "A" && exp.significance >= 95 ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-muted"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Variant A</span>
                      <Badge variant="outline">{exp.traffic_split}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{exp.variant_a}</p>
                    <p className="text-xl font-bold mt-2">{exp.ctr_a}% CTR</p>
                    <p className="text-xs text-muted-foreground">{exp.sample_a.toLocaleString()} visitors</p>
                  </div>
                  <div className={`p-3 rounded-lg border ${winner === "B" && exp.significance >= 95 ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-muted"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Variant B</span>
                      <Badge variant="outline">{100 - exp.traffic_split}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{exp.variant_b}</p>
                    <p className="text-xl font-bold mt-2">{exp.ctr_b}% CTR</p>
                    <p className="text-xs text-muted-foreground">{exp.sample_b.toLocaleString()} visitors</p>
                  </div>
                </div>

                {/* Significance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" /> Statistical Significance
                    </span>
                    <span className="font-medium">
                      {exp.significance}% <span className="text-muted-foreground">/ {exp.target_significance}% target</span>
                    </span>
                  </div>
                  <Progress value={exp.significance} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Variant {winner} leading by +{uplift}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> ~{exp.estimated_days} days to significance
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
