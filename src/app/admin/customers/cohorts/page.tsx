"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, Eye, Pencil, TestTube, Sparkles, BarChart3,
  Settings2, RotateCcw
} from "lucide-react";

interface Cohort {
  id: string;
  name: string;
  members: number;
  primaryPurchases: string;
  avgOrder: string;
  frequency: string;
  ltv: string;
  recModel: string;
  emailTemplate: string;
  color: string;
}

const COHORTS: Cohort[] = [
  {
    id: "1",
    name: "Premium Enthusiasts",
    members: 234,
    primaryPurchases: "Electronics, Premium accessories",
    avgOrder: "\u00a3189",
    frequency: "2.4x/month",
    ltv: "\u00a35,400",
    recModel: "High-value cross-sell (v3.2)",
    emailTemplate: "Premium curated picks",
    color: "border-amber-500",
  },
  {
    id: "2",
    name: "Budget-Conscious Regulars",
    members: 412,
    primaryPurchases: "Home essentials, Basics",
    avgOrder: "\u00a334",
    frequency: "4.1x/month",
    ltv: "\u00a31,680",
    recModel: "Bundle & save (v2.1)",
    emailTemplate: "Weekly deals roundup",
    color: "border-blue-500",
  },
  {
    id: "3",
    name: "Seasonal Shoppers",
    members: 187,
    primaryPurchases: "Fashion, Gifts",
    avgOrder: "\u00a372",
    frequency: "0.8x/month",
    ltv: "\u00a3920",
    recModel: "Event-triggered (v1.4)",
    emailTemplate: "Seasonal lookbook",
    color: "border-rose-500",
  },
  {
    id: "4",
    name: "New Explorers",
    members: 156,
    primaryPurchases: "Mixed categories",
    avgOrder: "\u00a345",
    frequency: "1.2x/month",
    ltv: "\u00a3540",
    recModel: "Discovery & explore (v2.0)",
    emailTemplate: "Getting started guide",
    color: "border-emerald-500",
  },
  {
    id: "5",
    name: "B2B Bulk Buyers",
    members: 89,
    primaryPurchases: "Office supplies, Wholesale",
    avgOrder: "\u00a3420",
    frequency: "1.8x/month",
    ltv: "\u00a39,100",
    recModel: "Reorder prediction (v3.0)",
    emailTemplate: "Business restock reminder",
    color: "border-violet-500",
  },
  {
    id: "6",
    name: "Trend Followers",
    members: 298,
    primaryPurchases: "Trending items, Social picks",
    avgOrder: "\u00a356",
    frequency: "3.2x/month",
    ltv: "\u00a32,150",
    recModel: "Trending + social proof (v2.3)",
    emailTemplate: "What\u2019s hot this week",
    color: "border-pink-500",
  },
];

type AssignmentMode = "auto" | "manual";

export default function CohortPersonalisationPage() {
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>("auto");
  const [rerunning, setRerunning] = useState(false);

  const totalMembers = COHORTS.reduce((s, c) => s + c.members, 0);

  const handleRerun = () => {
    setRerunning(true);
    setTimeout(() => setRerunning(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-violet-500" />
            Cohort-Based Personalisation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {COHORTS.length} AI-defined cohorts &middot; {totalMembers.toLocaleString()} total members
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1 bg-violet-600 hover:bg-violet-700 text-white"
          onClick={handleRerun}
          disabled={rerunning}
        >
          <Sparkles className="h-4 w-4" />
          {rerunning ? "Clustering..." : "Rerun clustering"}
        </Button>
      </div>

      {/* Cohort Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COHORTS.map((cohort) => (
          <Card key={cohort.id} className={`border-l-4 ${cohort.color}`}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{cohort.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cohort.members} members
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  {cohort.members}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Primary purchases</p>
                  <p className="font-medium mt-0.5">{cohort.primaryPurchases}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg order</p>
                  <p className="font-medium mt-0.5">{cohort.avgOrder}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Frequency</p>
                  <p className="font-medium mt-0.5">{cohort.frequency}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">LTV</p>
                  <p className="font-bold mt-0.5">{cohort.ltv}</p>
                </div>
              </div>

              <div className="pt-2 border-t space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium">{cohort.recModel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{cohort.emailTemplate}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 flex-1">
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 flex-1">
                  <Eye className="h-3 w-3" /> View members
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 flex-1">
                  <TestTube className="h-3 w-3" /> Test recs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cohort Performance Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-violet-500" />
            Cohort Recommendation Performance (30d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-lg border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <BarChart3 className="h-10 w-10 opacity-40" />
            <p className="text-sm font-medium">Stacked Bar Chart</p>
            <p className="text-xs">Recommendation CTR per cohort, last 30 days</p>
            <p className="text-xs opacity-60">Connect a charting library (e.g. Recharts, Nivo) to render</p>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Assignment Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAssignmentMode("auto")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                assignmentMode === "auto"
                  ? "bg-violet-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Auto (ML weekly)
            </button>
            <button
              onClick={() => setAssignmentMode("manual")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                assignmentMode === "manual"
                  ? "bg-violet-600 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Manual override
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {assignmentMode === "auto"
              ? "Customers are automatically reassigned to cohorts every Monday at 3:00 AM via ML clustering."
              : "Manual mode: cohort assignments are frozen until you run clustering or move customers manually."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
