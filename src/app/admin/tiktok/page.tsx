"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/score-badge";
import {
  Music2,
  Search,
  Play,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  Hash,
  TrendingUp,
  Rocket,
  ExternalLink,
  ShoppingBag,
} from "lucide-react";
import type { Product } from "@/lib/types/product";

// ── Types ──────────────────────────────────────────────────

interface TikTokVideo {
  id: string;
  video_id: string;
  url: string;
  description: string;
  author_username: string;
  author_followers: number;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  hashtags: string[];
  has_product_link: boolean;
  thumbnail_url: string | null;
  discovered_at: string;
}

interface HashtagSignal {
  id: string;
  hashtag: string;
  total_videos: number;
  total_views: number;
  unique_creators: number;
  video_growth_rate: number;
  view_velocity: number;
  creator_growth_rate: number;
  engagement_rate: number;
  product_video_pct: number;
  snapshot_at: string;
}

// ── Main Page ──────────────────────────────────────────────

export default function TikTokPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            TikTok Intelligence
          </h1>
          <p className="text-muted-foreground">
            Discover trending videos, extract product signals, and track hashtag velocity
          </p>
        </div>
        <DiscoveryTrigger />
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="signals">Hashtag Signals</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>
        <TabsContent value="videos">
          <VideosTab />
        </TabsContent>
        <TabsContent value="signals">
          <SignalsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Discovery Trigger ──────────────────────────────────────

function DiscoveryTrigger() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleDiscover = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/tiktok/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), limit: 30 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(`Discovery queued (Job ${data.jobId})`);
      setQuery("");
    } catch (e) {
      setResult(`Error: ${e instanceof Error ? e.message : "Failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Search query or #hashtag..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-64"
        onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
      />
      <Button onClick={handleDiscover} disabled={loading || !query.trim()}>
        <Rocket className="h-4 w-4 mr-1" />
        {loading ? "Queuing..." : "Discover"}
      </Button>
      {result && (
        <Badge variant={result.startsWith("Error") ? "destructive" : "secondary"}>
          {result}
        </Badge>
      )}
    </div>
  );
}

// ── Products Tab ───────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/tiktok?${params}`);
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Music2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No TikTok products discovered yet</p>
            <p className="text-sm text-muted-foreground mt-1">Use the Discover button to find trending products</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="max-w-xs truncate font-medium">{p.title}</TableCell>
                  <TableCell>${p.price?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell><ScoreBadge score={p.score_overall || 0} /></TableCell>
                  <TableCell>{p.sales_count?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
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
  );
}

// ── Videos Tab ─────────────────────────────────────────────

function VideosTab() {
  const [videos, setVideos] = useState<TikTokVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [productOnly, setProductOnly] = useState(false);
  const [error, setError] = useState("");

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (productOnly) params.set("has_product", "true");
      const res = await fetch(`/api/admin/tiktok/videos?${params}`);
      if (!res.ok) throw new Error("Failed to load videos");
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [search, productOnly]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const formatNumber = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search video descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button
            variant={productOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setProductOnly(!productOnly)}
          >
            <ShoppingBag className="h-4 w-4 mr-1" />
            Product Links
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No TikTok videos discovered yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead className="text-right"><Eye className="h-3 w-3 inline" /> Views</TableHead>
                <TableHead className="text-right"><Heart className="h-3 w-3 inline" /> Likes</TableHead>
                <TableHead className="text-right"><Share2 className="h-3 w-3 inline" /> Shares</TableHead>
                <TableHead className="text-right"><MessageCircle className="h-3 w-3 inline" /> Comments</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Product</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="max-w-xs">
                    <a
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline line-clamp-2"
                    >
                      {v.description?.slice(0, 80) || "Untitled"}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">@{v.author_username}</div>
                    <div className="text-xs text-muted-foreground">{formatNumber(v.author_followers)} followers</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatNumber(v.views)}</TableCell>
                  <TableCell className="text-right">{formatNumber(v.likes)}</TableCell>
                  <TableCell className="text-right">{formatNumber(v.shares)}</TableCell>
                  <TableCell className="text-right">{formatNumber(v.comments)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-32">
                      {v.hashtags?.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {v.has_product_link ? (
                      <Badge className="bg-green-100 text-green-700 text-[10px]">
                        <ShoppingBag className="h-3 w-3 mr-0.5" />
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ── Hashtag Signals Tab ────────────────────────────────────

function SignalsTab() {
  const [signals, setSignals] = useState<HashtagSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSignals = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/tiktok/signals");
      if (!res.ok) throw new Error("Failed to load signals");
      const data = await res.json();
      setSignals(data.signals || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSignals(); }, [fetchSignals]);

  const formatRate = (n: number) => {
    if (n > 0) return `+${n.toFixed(1)}%`;
    return `${n.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Hash className="h-5 w-5" />
          Hashtag Velocity Signals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : signals.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hashtag signals yet</p>
            <p className="text-sm text-muted-foreground mt-1">Run a discovery scan to start tracking hashtag velocity</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hashtag</TableHead>
                <TableHead className="text-right">Videos</TableHead>
                <TableHead className="text-right">Total Views</TableHead>
                <TableHead className="text-right">Creators</TableHead>
                <TableHead className="text-right">View Velocity</TableHead>
                <TableHead className="text-right">Video Growth</TableHead>
                <TableHead className="text-right">Creator Growth</TableHead>
                <TableHead className="text-right">Engagement</TableHead>
                <TableHead className="text-right">Product %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">#{s.hashtag}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{s.total_videos}</TableCell>
                  <TableCell className="text-right">{(s.total_views / 1000).toFixed(0)}K</TableCell>
                  <TableCell className="text-right">{s.unique_creators}</TableCell>
                  <TableCell className="text-right">
                    <span className={s.view_velocity > 100 ? "text-green-600 font-medium" : ""}>
                      {s.view_velocity.toFixed(0)}/hr
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={s.video_growth_rate > 0 ? "text-green-600" : "text-red-500"}>
                      {formatRate(s.video_growth_rate)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={s.creator_growth_rate > 0 ? "text-green-600" : "text-red-500"}>
                      {formatRate(s.creator_growth_rate)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{(s.engagement_rate * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right">
                    {s.product_video_pct > 0 ? (
                      <Badge className="bg-blue-100 text-blue-700 text-[10px]">{s.product_video_pct.toFixed(0)}%</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">0%</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
