"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { ScoreBadge } from "@/components/score-badge";
import { Package, Search, ExternalLink } from "lucide-react";
import type { Product } from "@/lib/types/product";
import type { LucideIcon } from "lucide-react";

interface PlatformProductsProps {
  title: string;
  apiPath: string;
  emptyIcon: LucideIcon;
  emptyMessage: string;
  emptyDescription: string;
  statusBadge?: { label: string; configured: boolean };
}

export function PlatformProducts({
  title,
  apiPath,
  emptyIcon: EmptyIcon,
  emptyMessage,
  emptyDescription,
  statusBadge,
}: PlatformProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`${apiPath}?${params}`);
    const data = await res.json();
    setProducts(data.products || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [apiPath, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground">
            {total} product{total !== 1 ? "s" : ""} discovered
          </p>
        </div>
        {statusBadge && (
          <Badge
            variant="outline"
            className={
              statusBadge.configured
                ? "text-green-500 border-green-500/30"
                : "text-yellow-500 border-yellow-500/30"
            }
          >
            {statusBadge.label}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
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
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <EmptyIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">{emptyMessage}</p>
              <p className="text-sm">{emptyDescription}</p>
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
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt=""
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.title}</p>
                          {product.ai_summary && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {product.ai_summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.category || "\u2014"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {product.price
                        ? `${product.currency} ${Number(product.price).toFixed(2)}`
                        : "\u2014"}
                    </TableCell>
                    <TableCell className="text-center">
                      <ScoreBadge score={product.final_score ?? product.score_overall} />
                    </TableCell>
                    <TableCell>
                      {product.external_url && (
                        <a
                          href={product.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
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
