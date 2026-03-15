"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/auth-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/score-badge";
import { Layers, Rocket } from "lucide-react";

interface ProductCluster {
  id: string;
  name: string;
  keywords: string[];
  product_count: number;
  avg_score: number;
  trend_stage: string | null;
  created_at: string;
}

const stageColors: Record<string, string> = {
  emerging: "bg-blue-100 text-blue-700",
  growing: "bg-green-100 text-green-700",
  peak: "bg-orange-100 text-orange-700",
  declining: "bg-gray-100 text-gray-500",
};

export default function ClustersPage() {
  const [clusters, setClusters] = useState<ProductCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [runLoading, setRunLoading] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);

  const fetchClusters = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("/api/admin/clusters");
      if (!res.ok) throw new Error("Failed to load clusters");
      const data = await res.json();
      setClusters(data.clusters || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClusters(); }, [fetchClusters]);

  const handleRunClustering = async () => {
    setRunLoading(true);
    setRunResult(null);
    try {
      const res = await authFetch("/api/admin/clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minScore: 30, similarityThreshold: 0.3 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRunResult(`Clustering queued (Job ${data.jobId})`);
    } catch (e) {
      setRunResult(`Error: ${e instanceof Error ? e.message : "Failed"}`);
    } finally {
      setRunLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Product Clusters
          </h1>
          <p className="text-muted-foreground">
            {clusters.length} cluster{clusters.length !== 1 ? "s" : ""} detected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRunClustering} disabled={runLoading}>
            <Rocket className="h-4 w-4 mr-1" />
            {runLoading ? "Queuing..." : "Run Clustering"}
          </Button>
          {runResult && (
            <Badge variant={runResult.startsWith("Error") ? "destructive" : "secondary"}>
              {runResult}
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5" />
            Product Clusters by Keyword Similarity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700">{error}</div>}
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : clusters.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No product clusters yet</p>
              <p className="text-sm text-muted-foreground mt-1">Run clustering to group similar products by keywords</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cluster</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead>Trend Stage</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clusters.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.keywords?.slice(0, 5).map((kw) => (
                          <Badge key={kw} variant="outline" className="text-[10px]">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{c.product_count}</TableCell>
                    <TableCell className="text-center">
                      <ScoreBadge score={c.avg_score} />
                    </TableCell>
                    <TableCell>
                      {c.trend_stage ? (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${stageColors[c.trend_stage] || "bg-gray-100 text-gray-500"}`}>
                          {c.trend_stage}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
