"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CreditCard, Download, Crown, Calendar, Package,
  Zap, Brain, Users, ArrowUpRight, Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UsageItem {
  label: string;
  current: number;
  limit: number;
  icon: typeof Package;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "pending";
  pdf_url: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_USAGE: UsageItem[] = [
  { label: "Products indexed", current: 38241, limit: 50000, icon: Package },
  { label: "API calls", current: 2341, limit: 10000, icon: Zap },
  { label: "AI queries", current: 891, limit: 2000, icon: Brain },
  { label: "Team members", current: 4, limit: 10, icon: Users },
];

const MOCK_INVOICES: Invoice[] = [
  { id: "INV-2026-003", date: "2026-03-01", amount: "149.00", status: "paid", pdf_url: "#" },
  { id: "INV-2026-002", date: "2026-02-01", amount: "149.00", status: "paid", pdf_url: "#" },
  { id: "INV-2026-001", date: "2026-01-01", amount: "149.00", status: "paid", pdf_url: "#" },
  { id: "INV-2025-012", date: "2025-12-01", amount: "149.00", status: "paid", pdf_url: "#" },
  { id: "INV-2025-011", date: "2025-11-01", amount: "99.00", status: "pending", pdf_url: "#" },
];

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);

  const fetchBilling = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/settings/billing");
      if (res.ok) {
        const data = await res.json();
        setUsage(data.usage ?? MOCK_USAGE);
        setInvoices(data.invoices ?? MOCK_INVOICES);
      } else {
        setUsage(MOCK_USAGE);
        setInvoices(MOCK_INVOICES);
      }
    } catch {
      setUsage(MOCK_USAGE);
      setInvoices(MOCK_INVOICES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBilling(); }, [fetchBilling]);

  function formatNumber(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : n.toString();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="h-6 w-6" /> Billing & Subscriptions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your plan, usage, and payment details
        </p>
      </div>

      {/* Current Plan Card */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">PRO PLAN</h2>
                  <Badge className="bg-primary/20 text-primary">Active</Badge>
                </div>
                <p className="text-2xl font-bold mt-1">
                  &pound;149<span className="text-sm font-normal text-muted-foreground">/month</span>
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-3 w-3" /> Renews on April 1, 2026
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ArrowUpRight className="h-4 w-4 mr-2" /> Change Plan
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Plan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <Card className="border-muted">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">Starter</h3>
                        <p className="text-2xl font-bold">&pound;49<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <p className="text-sm text-muted-foreground mt-1">10,000 products, 2,000 API calls</p>
                      </CardContent>
                    </Card>
                    <Card className="border-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Pro</h3>
                          <Badge variant="outline">Current</Badge>
                        </div>
                        <p className="text-2xl font-bold">&pound;149<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <p className="text-sm text-muted-foreground mt-1">50,000 products, 10,000 API calls</p>
                      </CardContent>
                    </Card>
                    <Card className="border-muted">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">Enterprise</h3>
                        <p className="text-2xl font-bold">&pound;399<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                        <p className="text-sm text-muted-foreground mt-1">Unlimited products, priority support</p>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="destructive" size="sm">Cancel</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {usage.map((item) => {
          const pct = Math.round((item.current / item.limit) * 100);
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {item.label}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(item.current)} / {formatNumber(item.limit)}
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{pct}% used</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-14 rounded bg-muted flex items-center justify-center text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 09/27</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <CreditCard className="h-4 w-4 mr-2" /> Update Card
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.id}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(inv.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>&pound;{inv.amount}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[inv.status]}>{inv.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
