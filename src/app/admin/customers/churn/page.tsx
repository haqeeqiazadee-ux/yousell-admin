"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertTriangle, DollarSign, Sparkles, Mail, Phone,
  UserCheck, ChevronDown, ChevronUp, Activity, Users
} from "lucide-react";

interface AtRiskCustomer {
  id: string;
  name: string;
  email: string;
  segment: string;
  riskScore: number;
  signals: string[];
  lastOrder: string;
  ltv: number;
  interventions: Intervention[];
}

interface Intervention {
  date: string;
  type: string;
  outcome: string;
}

const RISK_CUSTOMERS: AtRiskCustomer[] = [
  {
    id: "1", name: "Sarah Mitchell", email: "sarah.m@example.com", segment: "Loyal",
    riskScore: 89, signals: ["No order 45d", "Ignored last 2 emails", "Browsed competitors"],
    lastOrder: "2026-02-10", ltv: 3200,
    interventions: [{ date: "2026-03-01", type: "Email", outcome: "Opened, no click" }],
  },
  {
    id: "2", name: "James Cooper", email: "j.cooper@example.com", segment: "Champions",
    riskScore: 82, signals: ["Order value dropped 60%", "Cancelled subscription add-on"],
    lastOrder: "2026-03-05", ltv: 8400,
    interventions: [],
  },
  {
    id: "3", name: "Emily Watson", email: "e.watson@example.com", segment: "At Risk",
    riskScore: 76, signals: ["Cart abandoned x3", "Support ticket unresolved"],
    lastOrder: "2026-01-28", ltv: 1900,
    interventions: [{ date: "2026-02-15", type: "Call", outcome: "Voicemail" }],
  },
  {
    id: "4", name: "David Park", email: "d.park@example.com", segment: "Loyal",
    riskScore: 73, signals: ["Returned last 2 orders", "Negative review"],
    lastOrder: "2026-02-20", ltv: 2700,
    interventions: [],
  },
  {
    id: "5", name: "Olivia Chen", email: "o.chen@example.com", segment: "Promising",
    riskScore: 65, signals: ["Frequency dropped", "Unsubscribed from newsletter"],
    lastOrder: "2026-02-28", ltv: 1100,
    interventions: [{ date: "2026-03-10", type: "Email", outcome: "Clicked, no purchase" }],
  },
  {
    id: "6", name: "Marcus Brown", email: "m.brown@example.com", segment: "At Risk",
    riskScore: 58, signals: ["Login frequency dropped 80%"],
    lastOrder: "2026-01-15", ltv: 2100,
    interventions: [],
  },
  {
    id: "7", name: "Hannah Lee", email: "h.lee@example.com", segment: "Loyal",
    riskScore: 52, signals: ["Wishlist stale 60d", "Support complaint"],
    lastOrder: "2026-03-01", ltv: 3600,
    interventions: [{ date: "2026-03-15", type: "Discount code", outcome: "Redeemed" }],
  },
  {
    id: "8", name: "Thomas Wright", email: "t.wright@example.com", segment: "Hibernate",
    riskScore: 45, signals: ["Last order 92d ago", "Low engagement score"],
    lastOrder: "2025-12-25", ltv: 800,
    interventions: [],
  },
];

function getRiskBadge(score: number) {
  if (score >= 70) return { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", label: "High" };
  if (score >= 50) return { color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", label: "Medium" };
  return { color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", label: "Low" };
}

export default function ChurnRiskPage() {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const atRiskCount = RISK_CUSTOMERS.filter((c) => c.riskScore >= 50).length;
  const projectedLostArr = RISK_CUSTOMERS.filter((c) => c.riskScore >= 70)
    .reduce((s, c) => s + c.ltv, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-500" />
          Churn Risk Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Identify at-risk customers and take proactive action
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{atRiskCount}</p>
              <p className="text-xs text-muted-foreground">At-risk customers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {"\u00a3"}{projectedLostArr.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Projected lost ARR</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Interventions this week</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">1</p>
              <p className="text-xs text-muted-foreground">Saved this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Churn Risk Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">At-Risk Customers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Signals</TableHead>
                  <TableHead>LTV</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RISK_CUSTOMERS.map((customer) => {
                  const risk = getRiskBadge(customer.riskScore);
                  const isExpanded = expandedRow === customer.id;

                  return (
                    <>
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer hover:bg-muted/30"
                        onClick={() => setExpandedRow(isExpanded ? null : customer.id)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            <div>
                              <p className="font-medium text-sm">{customer.name}</p>
                              <p className="text-xs text-muted-foreground">{customer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{customer.segment}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  customer.riskScore >= 70 ? "bg-red-500" : customer.riskScore >= 50 ? "bg-amber-500" : "bg-gray-400"
                                }`}
                                style={{ width: `${customer.riskScore}%` }}
                              />
                            </div>
                            <Badge className={`text-xs ${risk.color}`}>
                              {customer.riskScore}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[250px]">
                            {customer.signals.map((sig, i) => (
                              <span key={i} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                                {sig}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {"\u00a3"}{customer.ltv.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs"
                              onClick={(e) => { e.stopPropagation(); }}
                            >
                              <Sparkles className="h-3 w-3" /> Draft email
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs"
                              onClick={(e) => { e.stopPropagation(); }}
                            >
                              <Phone className="h-3 w-3" /> Log call
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs"
                              onClick={(e) => { e.stopPropagation(); }}
                            >
                              <UserCheck className="h-3 w-3" /> Assign
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {/* Expanded: Intervention History */}
                      {isExpanded && (
                        <TableRow key={`${customer.id}-expand`}>
                          <TableCell colSpan={6} className="bg-muted/20 px-8 py-3">
                            <p className="text-xs font-semibold mb-2">Intervention History</p>
                            {customer.interventions.length === 0 ? (
                              <p className="text-xs text-muted-foreground">No interventions recorded yet.</p>
                            ) : (
                              <div className="space-y-1">
                                {customer.interventions.map((intv, i) => (
                                  <div key={i} className="flex items-center gap-3 text-xs">
                                    <span className="text-muted-foreground w-20">{intv.date}</span>
                                    <Badge variant="outline" className="text-[10px]">{intv.type}</Badge>
                                    <span>{intv.outcome}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* AI Recommendation */}
                            <div className="mt-3 p-2 rounded-md bg-violet-500/5 border border-violet-500/20 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-violet-400 shrink-0" />
                              <p className="text-xs">
                                <strong>AI Suggestion:</strong>{" "}
                                {customer.riskScore >= 70
                                  ? "Send personalized win-back offer with 15% discount"
                                  : customer.riskScore >= 50
                                  ? "Schedule a check-in call to address concerns"
                                  : "Monitor for 7 more days before intervention"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Intervention History Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Recent Interventions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {RISK_CUSTOMERS
              .flatMap((c) => c.interventions.map((intv) => ({ ...intv, customer: c.name })))
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)
              .map((intv, i) => (
                <div key={i} className="flex items-center gap-4 text-sm">
                  <span className="text-xs text-muted-foreground w-24">{intv.date}</span>
                  <span className="font-medium w-32">{intv.customer}</span>
                  <Badge variant="outline" className="text-xs">{intv.type}</Badge>
                  <span className="text-muted-foreground">{intv.outcome}</span>
                </div>
              ))}
            {RISK_CUSTOMERS.flatMap((c) => c.interventions).length === 0 && (
              <p className="text-sm text-muted-foreground">No interventions recorded.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
