"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/score-badge";
import {
  ShoppingCart,
  Search,
  Rocket,
  Package,
  ExternalLink,
} from "lucide-react";
import type { Product } from "@/lib/types/product";

export default function AmazonPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [scanQuery, setScanQuery] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/amazon?${params}`);
      if (!res.ok) throw new Error("Failed to load products");
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

  const handleScan = async () => {
    if (!scanQuery.trim()) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      const res = await fetch("/api/admin/amazon/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: scanQuery.trim(), limit: 50 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setScanResult(`Scan queued (Job ${data.jobId})`);
      setScanQuery("");
    } catch (e) {
      setScanResult(`Error: ${e instanceof Error ? e.message : "Failed"}`);
    } finally {
      setScanLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Amazon Intelligence
          </h1>
          <p className="text-muted-foreground">
            {total} product{total !== 1 ? "s" : ""} discovered
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search Amazon for..."
            value={scanQuery}
            onChange={(e) => setScanQuery(e.target.value)}
            className="w-64"
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
          />
          <Button onClick={handleScan} disabled={scanLoading || !scanQuery.trim()}>
            <Rocket className="h-4 w-4 mr-1" />
            {scanLoading ? "Queuing..." : "Scan BSR"}
          </Button>
          {scanResult && (
            <Badge variant={scanResult.startsWith("Error") ? "destructive" : "secondary"}>
              {scanResult}
            </Badge>
          )}
        </div>
      </div>

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
          </div>
        </CardHeader>
        <CardContent>
          {error && <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700">{error}</div>}
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Amazon products discovered</p>
              <p className="text-sm">Use the Scan BSR button to discover trending Amazon products.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right">BSR / Sales</TableHead>
                  <TableHead className="text-right">Reviews</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img src={product.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm truncate max-w-[200px]">{product.title}</p>
                          {product.ai_summary && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{product.ai_summary}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.category || "—"}</TableCell>
                    <TableCell className="text-right text-sm">
                      {product.price ? `$${Number(product.price).toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      <ScoreBadge score={product.final_score ?? product.score_overall} />
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {product.sales_count?.toLocaleString() || "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {product.review_count?.toLocaleString() || "—"}
                    </TableCell>
                    <TableCell>
                      {product.external_url && (
                        <a href={product.external_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
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
