"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";
import {
  BarChart2, TrendingUp, Package, DollarSign, Users,
  Activity, Target, Layers
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

interface AnalyticsData {
  overview: {
    totalProducts: number;
    totalScans: number;
    totalClients: number;
    activeSubscriptions: number;
    mrr: number;
    totalAllocations: number;
  };
  platformBreakdown: { platform: string; count: number; avgScore: number }[];
  scoreDistribution: { range: string; count: number }[];
  trendStages: { stage: string; count: number }[];
  scanPerformance: { date: string; productsFound: number; hotProducts: number; duration: number; mode: string; status: string }[];
  planBreakdown: Record<string, number>;
  pillarAverages: { trend: number; viral: number; profit: number };
  topCategories: { category: string; count: number }[];
  trendKeywords: { keyword: string; score: number; direction: string; volume: number }[];
}

const PLATFORM_COLORS: Record<string, string> = {
  tiktok: "#ff0050",
  amazon: "#ff9900",
  shopify: "#96bf48",
  pinterest: "#e60023",
  digital: "#6366f1",
  affiliate: "#14b8a6",
  unknown: "#94a3b8",
};

const STAGE_COLORS: Record<string, string> = {
  emerging: "#3b82f6",
  rising: "#f59e0b",
  exploding: "#ef4444",
  saturated: "#6b7280",
  unknown: "#94a3b8",
};

const PLAN_COLORS: Record<string, string> = {
  starter: "#3b82f6",
  growth: "#10b981",
  professional: "#8b5cf6",
  enterprise: "#f97316",
  free: "#9ca3af",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#6366f1"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch("/api/admin/analytics");
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        console.error("Failed to load analytics:", e);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Loading analytics data...</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          <p className="text-sm text-red-500 mt-0.5">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const { overview, platformBreakdown, scoreDistribution, trendStages, scanPerformance, planBreakdown, pillarAverages, topCategories, trendKeywords } = data;

  const radarData = [
    { subject: "Trend", value: pillarAverages.trend, fullMark: 100 },
    { subject: "Viral", value: pillarAverages.viral, fullMark: 100 },
    { subject: "Profit", value: pillarAverages.profit, fullMark: 100 },
  ];

  const planData = Object.entries(planBreakdown).map(([plan, count]) => ({
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    value: count,
    color: PLAN_COLORS[plan] || "#9ca3af",
  }));

  const kpis = [
    { label: "Total Products", value: overview.totalProducts, icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Scans", value: overview.totalScans, icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Clients", value: overview.totalClients, icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Active Subs", value: overview.activeSubscriptions, icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "MRR", value: `$${overview.mrr.toLocaleString()}`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "Allocations", value: overview.totalAllocations, icon: Layers, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Product performance, platform insights, and revenue metrics
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className={`w-9 h-9 rounded-lg ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon size={18} className={kpi.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{kpi.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1: Platform + Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by Platform */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-gray-700" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Products by Platform</h2>
          </div>
          {platformBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No product data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={platformBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                  formatter={(value) => [String(value), "Products"]}
                />
                <Bar dataKey="count" name="Products" radius={[4, 4, 0, 0]}>
                  {platformBreakdown.map((entry) => (
                    <Cell key={entry.platform} fill={PLATFORM_COLORS[entry.platform] || "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Score Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-gray-700" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Score Distribution</h2>
          </div>
          {overview.totalProducts === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No product data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="count" name="Products" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2: Trend Stages + Scoring Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Stage Pie */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-gray-700" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Trend Stages</h2>
          </div>
          {trendStages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={trendStages} dataKey="count" nameKey="stage" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {trendStages.map((entry) => (
                      <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] || "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {trendStages.map(s => (
                  <span key={s.stage} className="text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[s.stage] || "#94a3b8" }} />
                    <span className="capitalize text-gray-600">{s.stage}: {s.count}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Scoring Radar */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-gray-700" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Avg Score Pillars</h2>
          </div>
          {overview.totalProducts === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Subscription Plans */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} className="text-gray-700" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Plan Distribution</h2>
          </div>
          {planData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-400">No active subscriptions</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={planData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {planData.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.color || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${overview.mrr}/mo</p>
                <p className="text-xs text-gray-500">Monthly Recurring Revenue</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts Row 3: Scan Performance */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-gray-700" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Scan Performance Over Time</h2>
        </div>
        {scanPerformance.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No scan data yet. Run your first scan to see performance metrics.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scanPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
                labelFormatter={(v) => new Date(v).toLocaleString()}
              />
              <Line type="monotone" dataKey="productsFound" name="Products Found" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="hotProducts" name="Hot Products" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom Row: Top Categories + Trending Keywords */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={16} className="text-gray-700" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Top Categories</h2>
          </div>
          {topCategories.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No category data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topCategories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="category" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="count" name="Products" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {topCategories.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Trending Keywords */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-gray-700" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Trending Keywords</h2>
          </div>
          {trendKeywords.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No trend data yet</p>
          ) : (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {trendKeywords.map((kw, i) => (
                <div key={kw.keyword} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-gray-400 w-5">{i + 1}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{kw.keyword}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      kw.direction === "rising" ? "bg-green-50 text-green-600" :
                      kw.direction === "declining" ? "bg-red-50 text-red-600" :
                      "bg-gray-50 text-gray-600"
                    }`}>
                      {kw.direction || "stable"}
                    </span>
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100 w-8 text-right">{Math.round(kw.score)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
