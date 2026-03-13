"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Megaphone,
  Rocket,
  ExternalLink,
  TrendingUp,
  DollarSign,
} from "lucide-react";

interface Ad {
  id: string;
  platform: string;
  ad_id: string;
  advertiser_name: string | null;
  title: string;
  description: string | null;
  url: string | null;
  impressions: number;
  estimated_spend: number;
  is_scaling: boolean;
  first_seen: string | null;
  last_seen: string | null;
  created_at: string;
}

const platformColors: Record<string, string> = {
  tiktok: "text-pink-500 border-pink-500/30",
  facebook: "text-blue-500 border-blue-500/30",
  instagram: "text-purple-500 border-purple-500/30",
};

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [scalingOnly, setScalingOnly] = useState(false);

  const [query, setQuery] = useState("");
  const [runLoading, setRunLoading] = useState(false);
  const [runResult, setRunResult] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (platformFilter !== "all") params.set("platform", platformFilter);
      if (scalingOnly) params.set("scaling_only", "true");
      const res = await fetch(`/api/admin/ads?${params}`);
      if (!res.ok) throw new Error("Failed to load ads");
      const data = await res.json();
      setAds(data.ads || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [platformFilter, scalingOnly]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  const handleDiscover = async () => {
    if (!query.trim()) return;
    setRunLoading(true);
    setRunResult(null);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRunResult(`Discovery queued (Job ${data.jobId})`);
      setQuery("");
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
            Ad Intelligence
          </h1>
          <p className="text-muted-foreground">
            {ads.length} ad{ads.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search niche or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
            onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
          />
          <Button onClick={handleDiscover} disabled={runLoading || !query.trim()}>
            <Rocket className="h-4 w-4 mr-1" />
            {runLoading ? "Queuing..." : "Discover Ads"}
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
          <div className="flex items-center gap-2">
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Platforms</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
            </select>
            <Button
              variant={scalingOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setScalingOnly(!scalingOnly)}
            >
              <TrendingUp className="h-4 w-4 mr-1" />
              Scaling Only
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700">{error}</div>}
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : ads.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No ads discovered yet</p>
              <p className="text-sm text-muted-foreground mt-1">Search for a niche to discover active ads on TikTok and Facebook</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Advertiser</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">Est. Spend</TableHead>
                  <TableHead>Scaling</TableHead>
                  <TableHead>First Seen</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => (
                  <TableRow key={ad.id}>
                    <TableCell className="max-w-xs">
                      <p className="font-medium text-sm truncate">{ad.title}</p>
                      {ad.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{ad.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={platformColors[ad.platform] || ""}>
                        {ad.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{ad.advertiser_name || "—"}</TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatNumber(ad.impressions)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="flex items-center justify-end gap-0.5 text-sm">
                        <DollarSign className="h-3 w-3" />
                        {ad.estimated_spend?.toFixed(0) || "0"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {ad.is_scaling ? (
                        <Badge className="bg-green-100 text-green-700 text-[10px]">
                          <TrendingUp className="h-3 w-3 mr-0.5" />
                          Scaling
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {ad.first_seen ? new Date(ad.first_seen).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      {ad.url && (
                        <a href={ad.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
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
