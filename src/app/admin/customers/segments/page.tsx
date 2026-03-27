"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Crown, Heart, Sprout, AlertTriangle, Moon, Ghost,
  Download, Mail, Sparkles, ScatterChart
} from "lucide-react";

interface Segment {
  name: string;
  emoji: React.ReactNode;
  count: number;
  avgLtv: string;
  description: string;
  borderColor: string;
  bgColor: string;
}

const SEGMENTS: Segment[] = [
  {
    name: "Champions",
    emoji: <Crown className="h-6 w-6 text-amber-400" />,
    count: 142,
    avgLtv: "\u00a38,000",
    description: "High value, high frequency, recent",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    name: "Loyal",
    emoji: <Heart className="h-6 w-6 text-rose-400" />,
    count: 318,
    avgLtv: "\u00a33,000",
    description: "Consistent repeat purchasers",
    borderColor: "border-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    name: "Promising",
    emoji: <Sprout className="h-6 w-6 text-emerald-400" />,
    count: 89,
    avgLtv: "\u00a3950",
    description: "New + growing engagement",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    name: "At Risk",
    emoji: <AlertTriangle className="h-6 w-6 text-orange-400" />,
    count: 67,
    avgLtv: "\u00a32,400",
    description: "Declining purchase frequency",
    borderColor: "border-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    name: "Hibernate",
    emoji: <Moon className="h-6 w-6 text-indigo-400" />,
    count: 201,
    avgLtv: "\u00a31,100",
    description: "No purchase in >90 days",
    borderColor: "border-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    name: "Lost",
    emoji: <Ghost className="h-6 w-6 text-gray-400" />,
    count: 155,
    avgLtv: "\u00a3600",
    description: "No purchase in >180 days",
    borderColor: "border-gray-500",
    bgColor: "bg-gray-500/10",
  },
];

export default function RFMSegmentationPage() {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const totalCustomers = SEGMENTS.reduce((s, seg) => s + seg.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ScatterChart className="h-6 w-6 text-violet-500" />
            RFM Segmentation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCustomers.toLocaleString()} customers across 6 segments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" /> Export list
          </Button>
          <Button size="sm" className="gap-1 bg-violet-600 hover:bg-violet-700 text-white">
            <Mail className="h-4 w-4" /> Create email campaign
          </Button>
        </div>
      </div>

      {/* Segment Tiles — 2x3 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SEGMENTS.map((seg) => (
          <Card
            key={seg.name}
            className={`cursor-pointer transition-all border-2 ${seg.borderColor} ${
              selectedSegment === seg.name ? seg.bgColor : ""
            } hover:shadow-md`}
            onClick={() => setSelectedSegment(selectedSegment === seg.name ? null : seg.name)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {seg.emoji}
                  <div>
                    <p className="font-semibold text-lg">{seg.name}</p>
                    <p className="text-xs text-muted-foreground">{seg.description}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs font-mono">
                  {seg.count}
                </Badge>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Avg LTV</span>
                <span className="font-bold text-base">{seg.avgLtv}</span>
              </div>
              {/* Segment proportion bar */}
              <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${seg.borderColor.replace("border-", "bg-")}`}
                  style={{ width: `${(seg.count / totalCustomers) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                {((seg.count / totalCustomers) * 100).toFixed(1)}% of customers
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RFM Scatter Plot Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ScatterChart className="h-4 w-4 text-violet-500" />
            RFM Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 rounded-lg border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center text-muted-foreground gap-2">
            <ScatterChart className="h-10 w-10 opacity-40" />
            <p className="text-sm font-medium">3D-style 2D Scatter Plot</p>
            <p className="text-xs">x = Frequency &middot; y = Recency &middot; Bubble size = Monetary</p>
            <p className="text-xs opacity-60">Connect a charting library (e.g. Recharts, Nivo) to render</p>
          </div>
          {/* Axis labels */}
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground px-2">
            <span>Low Frequency</span>
            <span>High Frequency</span>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommended Action */}
      <Card className="border-violet-500/40 bg-violet-500/5">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">AI Recommended Action</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Send exclusive early-access email to <strong>Champions</strong> (142 customers).
              Expected open rate: 42% &middot; Revenue uplift: +12%
            </p>
          </div>
          <Button size="sm" className="gap-1 bg-violet-600 hover:bg-violet-700 text-white shrink-0">
            <Mail className="h-4 w-4" /> Draft Campaign
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
