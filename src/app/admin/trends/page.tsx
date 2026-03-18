"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/score-badge";
import { EnginePageLayout } from "@/components/engines";
import { TrendingUp, Plus, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface TrendKeyword {
  id: string;
  keyword: string;
  category: string | null;
  volume: number;
  trend_direction: "rising" | "stable" | "declining";
  trend_score: number;
  related_keywords: string[];
  source: string;
  last_checked_at: string | null;
  created_at: string;
}

const directionIcons = {
  rising: <ArrowUp className="h-3 w-3 text-green-500" />,
  stable: <Minus className="h-3 w-3 text-yellow-500" />,
  declining: <ArrowDown className="h-3 w-3 text-red-500" />,
};

export default function TrendsPage() {
  const [trends, setTrends] = useState<TrendKeyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/admin/trends");
      if (!res.ok) throw new Error("Failed to load trends");
      const data = await res.json();
      setTrends(data.trends || []);
      setTotal(data.total || 0);
      setError(null);
    } catch {
      setError("Failed to load trends. Please refresh.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const handleAddKeywords = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const keywordList = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const res = await authFetch("/api/admin/trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: keywordList, category: category || undefined }),
    });

    if (res.ok) {
      setKeywords("");
      setCategory("");
      setDialogOpen(false);
      fetchTrends();
    } else {
      setError("Failed to add keywords. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <EnginePageLayout
      engineId="trend-detection"
      title="Trend Detection"
      description="Emerging trend analysis and keyword tracking"
      status="idle"
      healthy={true}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div></div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={<Button><Plus className="h-4 w-4 mr-2" />Add Keywords</Button>}
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Track Keywords</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddKeywords} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g. wireless earbuds, phone case, LED lights"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat">Category</Label>
                  <Input
                    id="cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Electronics"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Adding..." : "Track Keywords"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rising</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {trends.filter((t) => t.trend_direction === "rising").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Stable</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {trends.filter((t) => t.trend_direction === "stable").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Declining</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {trends.filter((t) => t.trend_direction === "declining").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : trends.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No keywords tracked</p>
                <p className="text-sm">
                  Add keywords to monitor trends via Google Trends and Reddit.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Volume</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trends.map((trend) => (
                    <TableRow key={trend.id}>
                      <TableCell className="font-medium">{trend.keyword}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {directionIcons[trend.trend_direction]}
                          <span className="text-xs capitalize">
                            {trend.trend_direction}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {trend.category || "\u2014"}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {trend.volume.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <ScoreBadge score={trend.trend_score} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {trend.source}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </EnginePageLayout>
  );
}
