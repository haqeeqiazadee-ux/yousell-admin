"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  TrendingUp,
  Swords,
  Music2,
  ShoppingCart,
  Settings,
  ArrowRight,
} from "lucide-react";

interface DashboardStats {
  products: number;
  tiktok: number;
  amazon: number;
  trends: number;
  competitors: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: "Products Tracked",
      value: stats?.products ?? 0,
      description: stats?.products ? "Active products" : "No products yet",
      icon: Package,
      href: "/admin/products",
    },
    {
      title: "Active Trends",
      value: stats?.trends ?? 0,
      description: stats?.trends ? "Keywords tracked" : "Run Trend Scout to discover",
      icon: TrendingUp,
      href: "/admin/trends",
    },
    {
      title: "Competitors",
      value: stats?.competitors ?? 0,
      description: stats?.competitors ? "Being monitored" : "Add competitors to track",
      icon: Swords,
      href: "/admin/competitors",
    },
    {
      title: "TikTok Products",
      value: stats?.tiktok ?? 0,
      description: stats?.tiktok ? "Discovered" : "Connect TikTok to start",
      icon: Music2,
      href: "/admin/tiktok",
    },
    {
      title: "Amazon Listings",
      value: stats?.amazon ?? 0,
      description: stats?.amazon ? "Discovered" : "Connect Amazon to start",
      icon: ShoppingCart,
      href: "/admin/amazon",
    },
  ];

  return (
    <div className="space-y-6">
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
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/settings">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Setup Wizard — Configure API Keys
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Add Your First Product
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/trends">
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Start Tracking Trends
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
            <div className="flex justify-between">
              <span>Supabase</span>
              <Badge variant="outline" className="text-green-500 border-green-500/30">Connected</Badge>
            </div>
            <div className="flex justify-between">
              <span>Auth + RBAC</span>
              <Badge variant="outline" className="text-green-500 border-green-500/30">Active</Badge>
            </div>
            <div className="flex justify-between">
              <span>Railway API</span>
              <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">Not Configured</Badge>
            </div>
            <div className="flex justify-between">
              <span>AI Engine</span>
              <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">Not Configured</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
