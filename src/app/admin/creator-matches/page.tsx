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
import { EnginePageLayout } from "@/components/engines";
import { UserSearch, Rocket, DollarSign, Target } from "lucide-react";

interface CreatorMatch {
  id: string;
  product_id: string;
  influencer_id: string;
  match_score: number;
  niche_alignment: number;
  engagement_fit: number;
  price_range_fit: number;
  estimated_views: number;
  estimated_conversions: number;
  estimated_profit: number;
  status: string;
  matched_at: string;
  products?: { title: string; source: string; price: number } | null;
  influencers?: { username: string; platform: string; followers: number; engagement_rate: number } | null;
}

const statusColors: Record<string, string> = {
  suggested: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  contacted: "bg-purple-100 text-purple-700",
};

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function CreatorMatchesPage() {
  const [matches, setMatches] = useState<CreatorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [runLoading, setRunLoading] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("/api/admin/creator-matches");
      if (!res.ok) throw new Error("Failed to load matches");
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  const handleRunMatching = async () => {
    setRunLoading(true);
    setRunResult(null);
    try {
      const res = await authFetch("/api/admin/creator-matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minProductScore: 60 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRunResult(`Matching queued (Job ${data.jobId})`);
    } catch (e) {
      setRunResult(`Error: ${e instanceof Error ? e.message : "Failed"}`);
    } finally {
      setRunLoading(false);
    }
  };

  return (
    <EnginePageLayout
      engineId="creator-matching"
      title="Creator Matches"
      description="Influencer-product pairing with ROI projections"
      status="idle"
      healthy={true}
    >
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRunMatching} disabled={runLoading}>
            <Rocket className="h-4 w-4 mr-1" />
            {runLoading ? "Queuing..." : "Run Matching"}
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
            <Target className="h-5 w-5" />
            Creator-Product Matches with ROI Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700">{error}</div>}
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <UserSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No creator matches yet</p>
              <p className="text-sm text-muted-foreground mt-1">Run matching to pair high-scoring products with influencers</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead className="text-center">Match Score</TableHead>
                  <TableHead className="text-right">Niche</TableHead>
                  <TableHead className="text-right">Engagement</TableHead>
                  <TableHead className="text-right">Est. Views</TableHead>
                  <TableHead className="text-right">Est. Profit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[180px]">
                          {m.products?.title || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {m.products?.source} · ${Number(m.products?.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">@{m.influencers?.username || "unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.influencers?.platform} · {formatNumber(m.influencers?.followers || 0)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <ScoreBadge score={m.match_score} />
                    </TableCell>
                    <TableCell className="text-right text-sm">{m.niche_alignment?.toFixed(0)}%</TableCell>
                    <TableCell className="text-right text-sm">{m.engagement_fit?.toFixed(0)}%</TableCell>
                    <TableCell className="text-right text-sm">{formatNumber(m.estimated_views)}</TableCell>
                    <TableCell className="text-right">
                      <span className="flex items-center justify-end gap-0.5 text-sm font-medium text-green-600">
                        <DollarSign className="h-3 w-3" />
                        {m.estimated_profit?.toFixed(0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[m.status] || "bg-gray-100 text-gray-500"}`}>
                        {m.status}
                      </span>
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
