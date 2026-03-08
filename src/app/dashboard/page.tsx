"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/score-badge";
import {
  Package,
  FileText,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

interface DashboardData {
  products: Product[];
  productCount: number;
  pendingRequests: number;
  clientName: string;
}

export default function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [productsRes, requestsRes] = await Promise.all([
          fetch("/api/dashboard/products"),
          fetch("/api/dashboard/requests"),
        ]);

        const productsData = await productsRes.json();
        const requestsData = await requestsRes.json();

        const pendingRequests = (requestsData.requests || []).filter(
          (r: { status: string }) => r.status === "pending"
        ).length;

        // Get client name from supabase auth
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user?.id ?? "")
          .single();

        setData({
          products: productsData.products || [],
          productCount: productsData.products?.length || 0,
          pendingRequests,
          clientName: profile?.full_name || profile?.email || "there",
        });
      } catch {
        setData({
          products: [],
          productCount: 0,
          pendingRequests: 0,
          clientName: "there",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight">
          {loading ? (
            <Skeleton className="h-9 w-64" />
          ) : (
            <>Welcome back, {data?.clientName}</>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is your product dashboard overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/products">
          <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Your Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{data?.productCount}</div>
              )}
              <p className="text-xs text-muted-foreground">
                Curated products allocated to you
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/requests">
          <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">
                  {data?.pendingRequests}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Awaiting review by our team
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/requests">
          <Card className="hover:border-foreground/20 transition-colors cursor-pointer border-dashed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Need More Products?
              </CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button size="sm" className="mt-1 gap-2">
                Request More Products
                <ArrowRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Product List */}
      <div>
        <h2 className="text-xl font-semibold font-outfit mb-4">
          Your Products
        </h2>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-40 w-full rounded-md" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : data?.products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
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
            {data?.products.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:border-foreground/20 transition-colors"
              >
                {product.image_url && (
                  <div className="relative h-44 bg-muted">
                    <Image
                      src={product.image_url}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
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
                  </div>

                  {(product.ai_insight_haiku || product.ai_summary) && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.ai_insight_haiku || product.ai_summary}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
