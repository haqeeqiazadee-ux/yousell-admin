"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/score-badge";
import {
  Package,
  TrendingUp,
  Swords,
  Music2,
  ShoppingCart,
  Settings,
  ArrowRight,
  Scan,
  Users,
  Flame,
  Zap,
  Activity,
} from "lucide-react";

interface ServiceStatus {
  supabase: boolean;
  auth: boolean;
  railway: boolean;
  ai: boolean;
  email: boolean;
  apify: boolean;
}

interface DashboardStats {
  products: number;
  tiktok: number;
  amazon: number;
  trends: number;
  competitors: number;
  services: ServiceStatus;
}

interface PreViralProduct {
  id: string;
  title: string;
  platform: string;
  viral_score: number;
  final_score: number;
  trend_stage: string;
  price: number | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [preViral, setPreViral] = useState<PreViralProduct[]>([]);

  useEffect(() => {
    // Fetch dashboard stats
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch pre-viral products (viral_score >= 70)
    fetch("/api/admin/products?sort=viral_score&order=desc&limit=10")
      .then((res) => res.json())
      .then((data) => {
        setPreViral(
          (data.products || []).filter(
            (p: PreViralProduct) => (p.viral_score || 0) >= 70
          )
        );
      })
      .catch(() => {});
  }, []);

  const statCards = [
    {
      title: "Products Tracked",
      value: stats?.products ?? 0,
      icon: Package,
      href: "/admin/products",
    },
    {
      title: "Active Trends",
      value: stats?.trends ?? 0,
      icon: TrendingUp,
      href: "/admin/trends",
    },
    {
      title: "Competitors",
      value: stats?.competitors ?? 0,
      icon: Swords,
      href: "/admin/competitors",
    },
    {
      title: "TikTok Products",
      value: stats?.tiktok ?? 0,
      icon: Music2,
      href: "/admin/tiktok",
    },
    {
      title: "Amazon Listings",
      value: stats?.amazon ?? 0,
      icon: ShoppingCart,
      href: "/admin/amazon",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-outfit tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            YouSell Admin Intelligence Platform
          </p>
        </div>
        <Badge variant="outline" className="text-green-500 border-green-500/30">
          System Online
        </Badge>
      </div>

      {/* Pre-Viral Opportunities Strip */}
      {preViral.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-500" />
              Pre-Viral Opportunities
              <Badge variant="outline" className="text-red-500 border-red-500/30 text-xs">
                {preViral.length} detected
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {preViral.map((p) => (
                <div
                  key={p.id}
                  className="flex-shrink-0 w-48 rounded-lg border p-3 space-y-2 bg-background"
                >
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <div className="flex items-center gap-2">
                    <ScoreBadge score={p.viral_score} />
                    <Badge variant="outline" className="text-xs capitalize">
                      {p.trend_stage || "emerging"}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {p.platform}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* If no pre-viral products, show placeholder */}
      {preViral.length === 0 && !loading && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">
                  Pre-Viral Opportunities — No products detected yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Run a scan from the Scan Control Panel to discover trending products
                </p>
              </div>
              <Link href="/admin/scan" className="ml-auto">
                <Button size="sm" variant="outline">
                  <Scan className="h-3 w-3 mr-1" /> Run Scan
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:border-foreground/20 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions + System Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/scan">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Scan className="h-4 w-4" />
                  Run Product Scan
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Configure API Keys
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/clients">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Manage Clients
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              { label: "Supabase", key: "supabase" as const },
              { label: "Auth + RBAC", key: "auth" as const },
              { label: "AI Engine (Claude)", key: "ai" as const },
              { label: "Resend Email", key: "email" as const },
              { label: "Apify Scrapers", key: "apify" as const },
              { label: "Railway API", key: "railway" as const },
            ].map((svc) => {
              const active = stats?.services?.[svc.key] ?? false;
              return (
                <div key={svc.key} className="flex justify-between">
                  <span>{svc.label}</span>
                  <Badge
                    variant="outline"
                    className={
                      active
                        ? "text-green-500 border-green-500/30"
                        : "text-yellow-500 border-yellow-500/30"
                    }
                  >
                    {active ? "Connected" : "Not Configured"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Live Trend Feed placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Trend Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity yet</p>
                <p className="text-xs">
                  Real-time updates will appear here when scans detect new products
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
