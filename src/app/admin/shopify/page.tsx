"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Store,
  Search,
  Rocket,
  Package,
  ExternalLink,
  Swords,
} from "lucide-react";
import type { Product } from "@/lib/types/product";

interface Competitor {
  id: string;
  name: string;
  url: string | null;
  platform: string | null;
  product_count: number | null;
  niche: string | null;
  discovered_at: string | null;
}

export default function ShopifyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Shopify Intelligence
          </h1>
          <p className="text-muted-foreground">
            Discover fast-growing Shopify stores and their top products
          </p>
        </div>
        <ScanTrigger />
      </div>

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="stores">Competitor Stores</TabsTrigger>
        </TabsList>
        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="stores"><StoresTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function ScanTrigger() {
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleScan = async () => {
    if (!niche.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/shopify/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: niche.trim(), limit: 20 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(`Scan queued (Job ${data.jobId})`);
      setNiche("");
    } catch (e) {
      setResult(`Error: ${e instanceof Error ? e.message : "Failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Niche to scan..."
        value={niche}
        onChange={(e) => setNiche(e.target.value)}
        className="w-64"
        onKeyDown={(e) => e.key === "Enter" && handleScan()}
      />
      <Button onClick={handleScan} disabled={loading || !niche.trim()}>
        <Rocket className="h-4 w-4 mr-1" />
        {loading ? "Queuing..." : "Scan Stores"}
      </Button>
      {result && (
        <Badge variant={result.startsWith("Error") ? "destructive" : "secondary"}>
          {result}
        </Badge>
      )}
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ platform: "shopify" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/products?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <span className="text-sm text-muted-foreground ml-auto">{total} products</span>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Shopify products discovered</p>
            <p className="text-sm">Scan a niche to discover fast-growing Shopify stores and products.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <p className="font-medium text-sm truncate max-w-[200px]">{p.title}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.category || "—"}</TableCell>
                  <TableCell className="text-right text-sm">
                    {p.price ? `$${Number(p.price).toFixed(2)}` : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <ScoreBadge score={p.final_score ?? p.score_overall} />
                  </TableCell>
                  <TableCell>
                    {p.external_url && (
                      <a href={p.external_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
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
  );
}

function StoresTab() {
  const [stores, setStores] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/competitors");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      const shopifyStores = (data.competitors || []).filter(
        (c: Competitor) => c.platform === "shopify"
      );
      setStores(shopifyStores);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  return (
    <Card>
      <CardContent className="pt-6">
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Swords className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Shopify stores discovered</p>
            <p className="text-sm">Scan a niche to auto-discover competitor Shopify stores.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store</TableHead>
                <TableHead>Niche</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead>Discovered</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stores.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.niche || "—"}</TableCell>
                  <TableCell className="text-right">{s.product_count || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.discovered_at ? new Date(s.discovered_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>
                    {s.url && (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
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
  );
}
