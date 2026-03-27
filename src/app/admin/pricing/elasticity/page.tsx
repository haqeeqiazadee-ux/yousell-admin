"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  TrendingDown, TrendingUp, Sparkles, BarChart3,
  ArrowRight, Calculator, Activity
} from "lucide-react";

interface CategoryElasticity {
  id: string;
  category: string;
  elasticity: number;
  interpretation: string;
  lastUpdated: string;
  minPrice: number;
  maxPrice: number;
  currentPrice: number;
  status: "optimal" | "review" | "warning";
}

const CATEGORIES: CategoryElasticity[] = [
  {
    id: "1",
    category: "Electronics",
    elasticity: -2.1,
    interpretation: "Very elastic \u2014 price-sensitive buyers",
    lastUpdated: "2026-03-25",
    minPrice: 15,
    maxPrice: 299,
    currentPrice: 89,
    status: "optimal",
  },
  {
    id: "2",
    category: "Fashion & Apparel",
    elasticity: -1.4,
    interpretation: "Elastic \u2014 moderate price sensitivity",
    lastUpdated: "2026-03-24",
    minPrice: 8,
    maxPrice: 150,
    currentPrice: 42,
    status: "optimal",
  },
  {
    id: "3",
    category: "Home & Garden",
    elasticity: -0.7,
    interpretation: "Inelastic \u2014 low price sensitivity",
    lastUpdated: "2026-03-23",
    minPrice: 5,
    maxPrice: 200,
    currentPrice: 65,
    status: "review",
  },
  {
    id: "4",
    category: "Premium / Luxury",
    elasticity: -0.3,
    interpretation: "Very inelastic \u2014 brand-driven demand",
    lastUpdated: "2026-03-22",
    minPrice: 50,
    maxPrice: 999,
    currentPrice: 320,
    status: "warning",
  },
];

const STATUS_COLORS: Record<string, string> = {
  optimal: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  review: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  warning: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function ElasticitySpectrum({ value }: { value: number }) {
  // Map elasticity from -3..0 to 0..100% position
  const clamped = Math.max(-3, Math.min(0, value));
  const pct = ((clamped + 3) / 3) * 100;

  return (
    <div className="space-y-1">
      <div className="relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500">
        {/* Pointer */}
        <div
          className="absolute top-0 h-full w-1 bg-white border border-gray-800 rounded-full shadow-lg"
          style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>-3 (Very elastic)</span>
        <span>-1.5</span>
        <span>0 (Inelastic)</span>
      </div>
    </div>
  );
}

export default function PriceElasticityPage() {
  const [simProduct, setSimProduct] = useState("");
  const [simPercent, setSimPercent] = useState("");
  const [simResult, setSimResult] = useState<{
    demandChange: string;
    revenueImpact: string;
  } | null>(null);
  const [simulating, setSimulating] = useState(false);

  const handleSimulate = () => {
    if (!simProduct || !simPercent) return;
    setSimulating(true);

    setTimeout(() => {
      const pctNum = parseFloat(simPercent);
      // Simple mock: use average elasticity of -1.1
      const demandChange = Math.round(-1.1 * pctNum * 10) / 10;
      const baseRevenue = 7400;
      const revenueChange = Math.round(baseRevenue * (pctNum / 100) * (1 + demandChange / 100));

      setSimResult({
        demandChange: `${demandChange > 0 ? "+" : ""}${demandChange}%`,
        revenueImpact: `${revenueChange >= 0 ? "+" : ""}\u00a3${Math.abs(revenueChange).toLocaleString()}/month`,
      });
      setSimulating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-violet-500" />
          Price Elasticity Configuration
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage elasticity coefficients, pricing bounds, and simulate price changes
        </p>
      </div>

      {/* Category Coefficients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-violet-500" />
            Category Elasticity Coefficients
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Elasticity</TableHead>
                  <TableHead className="w-64">Spectrum</TableHead>
                  <TableHead>Interpretation</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CATEGORIES.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.category}</TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-bold">
                        {cat.elasticity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ElasticitySpectrum value={cat.elasticity} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cat.interpretation}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cat.lastUpdated}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Elasticity Spectrum Visualization (standalone) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Elasticity Spectrum Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex items-center gap-4">
                <span className="text-sm font-medium w-36 shrink-0">{cat.category}</span>
                <div className="flex-1">
                  <ElasticitySpectrum value={cat.elasticity} />
                </div>
                <span className="text-xs font-mono w-10 text-right shrink-0">{cat.elasticity}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Bounds Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Pricing Bounds
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Min Price</TableHead>
                  <TableHead>Max Price</TableHead>
                  <TableHead>Current Avg Price</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CATEGORIES.map((cat) => {
                  const range = cat.maxPrice - cat.minPrice;
                  const posPct = ((cat.currentPrice - cat.minPrice) / range) * 100;
                  return (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.category}</TableCell>
                      <TableCell className="font-mono text-sm">{"\u00a3"}{cat.minPrice}</TableCell>
                      <TableCell className="font-mono text-sm">{"\u00a3"}{cat.maxPrice}</TableCell>
                      <TableCell className="font-mono text-sm font-bold">{"\u00a3"}{cat.currentPrice}</TableCell>
                      <TableCell>
                        <div className="w-24 h-2 bg-muted rounded-full relative">
                          <div
                            className="absolute top-0 h-full w-2 bg-violet-500 rounded-full"
                            style={{ left: `${Math.min(100, posPct)}%`, transform: "translateX(-50%)" }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${STATUS_COLORS[cat.status]}`}>
                          {cat.status.charAt(0).toUpperCase() + cat.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Tool */}
      <Card className="border-violet-500/40 bg-violet-500/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4 text-violet-500" />
            Price Change Simulator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            What happens if I raise [product] by [%]?
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs">Product or Category</Label>
              <Input
                placeholder="e.g. Electronics, Bluetooth speakers..."
                value={simProduct}
                onChange={(e) => setSimProduct(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5 w-32">
              <Label className="text-xs">Price Change (%)</Label>
              <Input
                type="number"
                placeholder="e.g. 10"
                value={simPercent}
                onChange={(e) => setSimPercent(e.target.value)}
                className="bg-background"
              />
            </div>
            <Button
              onClick={handleSimulate}
              disabled={simulating || !simProduct || !simPercent}
              className="gap-1 bg-violet-600 hover:bg-violet-700 text-white"
            >
              <Sparkles className="h-4 w-4" />
              {simulating ? "Simulating..." : "Simulate"}
            </Button>
          </div>

          {/* Simulation Result */}
          {simResult && (
            <div className="mt-4 p-4 rounded-lg border border-violet-500/30 bg-background flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold">Simulation Result</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <TrendingDown className="h-4 w-4 text-amber-500" />
                    <span className="text-muted-foreground">Expected demand change:</span>
                    <span className="font-bold">{simResult.demandChange}</span>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted-foreground hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-muted-foreground">Revenue impact:</span>
                    <span className="font-bold text-emerald-500">{simResult.revenueImpact}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
