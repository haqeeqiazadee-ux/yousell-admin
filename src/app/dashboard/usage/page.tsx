"use client"

import { CreditCard, ExternalLink, Star, Lock, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

/* ------------------------------------------------------------------ */
/*  Mock data                                                         */
/* ------------------------------------------------------------------ */

const USAGE_ITEMS = [
  { label: "Products viewed",   used: 7800,  limit: 10000, pct: 78 },
  { label: "AI queries",        used: 1200,  limit: 2000,  pct: 60 },
  { label: "Blueprints",        used: 3,     limit: 5,     pct: 60 },
  { label: "Watchlist slots",   used: 24,    limit: 100,   pct: 24 },
  { label: "Creator searches",  used: 89,    limit: 500,   pct: 18 },
]

const FEATURES = [
  { name: "Product Discovery",     plan: "Starter+",  unlocked: true },
  { name: "AI Score & Analysis",   plan: "Pro+",      unlocked: true },
  { name: "Launch Blueprints",     plan: "Pro+",      unlocked: true },
  { name: "Creator Finder",        plan: "Pro+",      unlocked: true },
  { name: "Pre-Viral Detection",   plan: "Pro+",      unlocked: true },
  { name: "API Access",            plan: "Agency",    unlocked: false },
  { name: "White Label Reports",   plan: "Agency",    unlocked: false },
]

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function UsagePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-brand-400" />
            Usage &amp; Plan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your subscription and monitor usage.
          </p>
        </div>
        <Badge className="gap-1.5 text-sm px-3 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          <Star className="h-3.5 w-3.5" />
          PRO PLAN &pound;149/month
        </Badge>
      </div>

      {/* Plan Details */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Details</CardTitle>
          <CardDescription>
            Renews 1 May 2026 &middot; Annual billing (saving &pound;357/yr)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <CreditCard className="h-3.5 w-3.5" /> Manage billing
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>Your usage this billing period.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {USAGE_ITEMS.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">
                  {item.used.toLocaleString()} / {item.limit.toLocaleString()}{" "}
                  <span className="text-xs">({item.pct}%)</span>
                </span>
              </div>
              <Progress
                value={item.pct}
                indicatorClassName={
                  item.pct >= 80
                    ? "bg-red-500"
                    : item.pct >= 60
                      ? "bg-amber-500"
                      : undefined
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Feature Unlock Status */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Access</CardTitle>
          <CardDescription>
            Features available on your current plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Required Plan</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEATURES.map((f) => (
                <TableRow key={f.name}>
                  <TableCell className="font-medium">{f.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {f.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {f.unlocked ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-sm">
                        <Check className="h-4 w-4" /> Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
                        <Lock className="h-4 w-4" /> Upgrade
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4">
            <Button variant="link" className="gap-1 px-0">
              Compare plans <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
