"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/score-badge";
import {
  Package,
  TrendingUp,
  Sparkles,
  FileText,
} from "lucide-react";
import type { Product } from "@/lib/types/product";

const platformColors: Record<string, string> = {
  tiktok: "text-pink-500 border-pink-500/30 bg-pink-500/10",
  amazon: "text-orange-500 border-orange-500/30 bg-orange-500/10",
  shopify: "text-green-500 border-green-500/30 bg-green-500/10",
  pinterest: "text-purple-500 border-purple-500/30 bg-purple-500/10",
  manual: "text-blue-500 border-blue-500/30 bg-blue-500/10",
  digital: "text-cyan-500 border-cyan-500/30 bg-cyan-500/10",
  ai_affiliate: "text-violet-500 border-violet-500/30 bg-violet-500/10",
  physical_affiliate: "text-amber-500 border-amber-500/30 bg-amber-500/10",
};

const trendStageColors: Record<string, string> = {
  emerging: "text-green-600 border-green-500/30 bg-green-500/10",
  rising: "text-blue-600 border-blue-500/30 bg-blue-500/10",
  exploding: "text-red-600 border-red-500/30 bg-red-500/10",
  saturated: "text-gray-500 border-gray-500/30 bg-gray-500/10",
};

export default function ClientProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            My Products
          </h1>
          <p className="text-muted-foreground mt-1">
            Products curated and allocated to your account.
          </p>
        </div>
        <Link href="/dashboard/requests">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Request More
          </Button>
        </Link>
      </div>

      {/* Products */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-44 w-full rounded-md" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No products yet</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Your curated products will appear here once our team allocates
              them to your account.
            </p>
            <Link href="/dashboard/requests" className="mt-4">
              <Button className="gap-2">
                <Sparkles className="h-4 w-4" />
                Request Products
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:border-foreground/20 transition-colors"
            >
              {product.image_url ? (
                <div className="relative h-44 bg-muted">
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-44 bg-muted flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight line-clamp-2">
                    {product.title}
                  </h3>
                  <ScoreBadge score={product.final_score} showTier />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={
                      platformColors[product.platform] ?? platformColors.manual
                    }
                  >
                    {product.platform}
                  </Badge>
                  {product.trend_stage && (
                    <Badge
                      variant="outline"
                      className={
                        trendStageColors[product.trend_stage] ??
                        trendStageColors.saturated
                      }
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {product.trend_stage}
                    </Badge>
                  )}
                  {product.category && (
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  )}
                </div>

                {(product.ai_insight_haiku || product.ai_summary) && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {product.ai_insight_haiku || product.ai_summary}
                  </p>
                )}

                {product.ai_blueprint && (
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <FileText className="h-3 w-3" />
                    View Blueprint
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
