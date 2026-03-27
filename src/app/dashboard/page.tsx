'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  TrendingUp,
  Star,
  Filter,
  Clock,
  ChevronDown,
  Users,
  Video,
  Megaphone,
  Globe,
} from 'lucide-react';
import { AIInsightCard } from '@/components/AIInsightCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectOption } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

/* ------------------------------------------------------------------ */
/*  Section 28.1 — Trending Now (Client Dashboard Home)               */
/* ------------------------------------------------------------------ */

// ── Types ──────────────────────────────────────────────────────────

type TimeFilter = 'today' | '7d' | '30d';
type SortOption = 'trend_score' | 'newest' | 'revenue_est';
type MinScore = '0' | '50' | '70' | '90';
type TrendStatus = 'hot' | 'rising' | 'stable';

interface MockProduct {
  id: string;
  title: string;
  image_url: string;
  trend_status: TrendStatus;
  platform: string;
  product_type: string;
  category: string;
  opportunity_score: number;
  est_revenue: number;
  revenue_change_7d: number;
  influencers: number;
  platforms: number;
  videos: number;
  ads: number;
  created_at: string;
  watched: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Beauty', 'Electronics', 'Fashion', 'Health', 'Home', 'Kitchen', 'Fitness', 'Pets'];

const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-001',
    title: 'Portable Neck Fan with LED Display',
    image_url: '/placeholder-product.png',
    trend_status: 'hot',
    platform: 'TikTok Shop',
    product_type: 'Physical',
    category: 'Electronics',
    opportunity_score: 94,
    est_revenue: 12400,
    revenue_change_7d: 34,
    influencers: 47,
    platforms: 3,
    videos: 218,
    ads: 12,
    created_at: '2026-03-27T08:00:00Z',
    watched: false,
  },
  {
    id: 'prod-002',
    title: 'Glass Skin Serum — Hyaluronic + Niacinamide',
    image_url: '/placeholder-product.png',
    trend_status: 'hot',
    platform: 'Amazon',
    product_type: 'Physical',
    category: 'Beauty',
    opportunity_score: 91,
    est_revenue: 8900,
    revenue_change_7d: 28,
    influencers: 62,
    platforms: 4,
    videos: 340,
    ads: 18,
    created_at: '2026-03-26T12:00:00Z',
    watched: true,
  },
  {
    id: 'prod-003',
    title: 'AI-Powered Pet Camera with Treat Dispenser',
    image_url: '/placeholder-product.png',
    trend_status: 'rising',
    platform: 'TikTok Shop',
    product_type: 'Physical',
    category: 'Pets',
    opportunity_score: 85,
    est_revenue: 6200,
    revenue_change_7d: 19,
    influencers: 23,
    platforms: 2,
    videos: 97,
    ads: 5,
    created_at: '2026-03-27T06:00:00Z',
    watched: false,
  },
  {
    id: 'prod-004',
    title: 'Magnetic Phone Mount for Car Dashboard',
    image_url: '/placeholder-product.png',
    trend_status: 'rising',
    platform: 'Amazon',
    product_type: 'Physical',
    category: 'Electronics',
    opportunity_score: 78,
    est_revenue: 4100,
    revenue_change_7d: 12,
    influencers: 18,
    platforms: 3,
    videos: 54,
    ads: 8,
    created_at: '2026-03-25T10:00:00Z',
    watched: false,
  },
  {
    id: 'prod-005',
    title: 'Posture Corrector Belt — Adjustable Back Brace',
    image_url: '/placeholder-product.png',
    trend_status: 'hot',
    platform: 'Shopify',
    product_type: 'Physical',
    category: 'Health',
    opportunity_score: 88,
    est_revenue: 7600,
    revenue_change_7d: 41,
    influencers: 35,
    platforms: 3,
    videos: 189,
    ads: 14,
    created_at: '2026-03-26T15:00:00Z',
    watched: false,
  },
  {
    id: 'prod-006',
    title: 'Mini Waffle Maker — 4-Inch Personal Size',
    image_url: '/placeholder-product.png',
    trend_status: 'stable',
    platform: 'Amazon',
    product_type: 'Physical',
    category: 'Kitchen',
    opportunity_score: 62,
    est_revenue: 3400,
    revenue_change_7d: 3,
    influencers: 14,
    platforms: 2,
    videos: 43,
    ads: 6,
    created_at: '2026-03-20T09:00:00Z',
    watched: true,
  },
  {
    id: 'prod-007',
    title: 'LED Sunset Projection Lamp',
    image_url: '/placeholder-product.png',
    trend_status: 'rising',
    platform: 'TikTok Shop',
    product_type: 'Physical',
    category: 'Home',
    opportunity_score: 76,
    est_revenue: 5100,
    revenue_change_7d: 22,
    influencers: 28,
    platforms: 2,
    videos: 112,
    ads: 9,
    created_at: '2026-03-26T18:00:00Z',
    watched: false,
  },
  {
    id: 'prod-008',
    title: 'Resistance Bands Set — 5 Levels with Bag',
    image_url: '/placeholder-product.png',
    trend_status: 'stable',
    platform: 'Amazon',
    product_type: 'Physical',
    category: 'Fitness',
    opportunity_score: 55,
    est_revenue: 2800,
    revenue_change_7d: -2,
    influencers: 11,
    platforms: 2,
    videos: 38,
    ads: 4,
    created_at: '2026-03-18T14:00:00Z',
    watched: false,
  },
  {
    id: 'prod-009',
    title: 'Oversized Blazer — Vintage Y2K Style',
    image_url: '/placeholder-product.png',
    trend_status: 'hot',
    platform: 'TikTok Shop',
    product_type: 'Physical',
    category: 'Fashion',
    opportunity_score: 92,
    est_revenue: 9200,
    revenue_change_7d: 55,
    influencers: 51,
    platforms: 3,
    videos: 267,
    ads: 11,
    created_at: '2026-03-27T02:00:00Z',
    watched: false,
  },
  {
    id: 'prod-010',
    title: 'Collagen Peptides Powder — Unflavored',
    image_url: '/placeholder-product.png',
    trend_status: 'rising',
    platform: 'Shopify',
    product_type: 'Physical',
    category: 'Health',
    opportunity_score: 73,
    est_revenue: 5800,
    revenue_change_7d: 15,
    influencers: 19,
    platforms: 2,
    videos: 76,
    ads: 7,
    created_at: '2026-03-25T08:00:00Z',
    watched: false,
  },
  {
    id: 'prod-011',
    title: 'Smart Aroma Diffuser with App Control',
    image_url: '/placeholder-product.png',
    trend_status: 'stable',
    platform: 'Amazon',
    product_type: 'Physical',
    category: 'Home',
    opportunity_score: 48,
    est_revenue: 2200,
    revenue_change_7d: -5,
    influencers: 8,
    platforms: 1,
    videos: 22,
    ads: 3,
    created_at: '2026-03-15T11:00:00Z',
    watched: false,
  },
  {
    id: 'prod-012',
    title: 'Cloud-Shaped Pillow — Soft Plush for Kids',
    image_url: '/placeholder-product.png',
    trend_status: 'rising',
    platform: 'TikTok Shop',
    product_type: 'Physical',
    category: 'Home',
    opportunity_score: 69,
    est_revenue: 3900,
    revenue_change_7d: 18,
    influencers: 16,
    platforms: 2,
    videos: 61,
    ads: 5,
    created_at: '2026-03-24T07:00:00Z',
    watched: false,
  },
];

// ── Helpers ────────────────────────────────────────────────────────

function trendBadge(status: TrendStatus) {
  switch (status) {
    case 'hot':
      return { label: 'Hot', classes: 'bg-red-500/20 text-red-400 border-red-500/30' };
    case 'rising':
      return { label: 'Rising', classes: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    case 'stable':
      return { label: 'Stable', classes: 'bg-slate-500/20 text-slate-400 border-slate-500/30' };
  }
}

function scoreColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function scoreTrackColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500/20';
  if (score >= 40) return 'bg-amber-500/20';
  return 'bg-red-500/20';
}

function formatRevenue(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount}`;
}

// ── Skeleton Card ──────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <Card className="h-[240px] bg-white/5 border-white/10">
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-3">
          <Skeleton className="w-20 h-20 rounded-lg bg-white/10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-white/10" />
            <Skeleton className="h-4 w-1/2 bg-white/10" />
            <Skeleton className="h-3 w-1/3 bg-white/10" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full bg-white/10" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20 bg-white/10" />
          <Skeleton className="h-4 w-16 bg-white/10" />
        </div>
        <Skeleton className="h-3 w-2/3 bg-white/10" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1 bg-white/10" />
          <Skeleton className="h-8 w-20 bg-white/10" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Product Card ───────────────────────────────────────────────────

interface ProductCardProps {
  product: MockProduct;
  onToggleWatch: (id: string) => void;
}

function ProductCard({ product, onToggleWatch }: ProductCardProps) {
  const badge = trendBadge(product.trend_status);

  return (
    <Card className="relative h-[240px] bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        {/* Top-right trend badge */}
        <span
          className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.classes}`}
        >
          <TrendingUp className="h-3 w-3" />
          {badge.label}
        </span>

        {/* Product info row */}
        <div className="flex gap-3">
          <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-white/10">
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0 pr-16">
            <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
              {product.title}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="inline-flex items-center gap-1 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                <Globe className="h-2.5 w-2.5" />
                {product.platform}
              </span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
                {product.product_type}
              </span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/60">
                {product.category}
              </span>
            </div>
          </div>
        </div>

        {/* Opportunity Score bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/50 font-medium">Opportunity Score</span>
            <span className="text-xs font-bold text-white">{product.opportunity_score}/100</span>
          </div>
          <div className={`h-1.5 w-full rounded-full ${scoreTrackColor(product.opportunity_score)}`}>
            <div
              className={`h-full rounded-full transition-all ${scoreColor(product.opportunity_score)}`}
              style={{ width: `${product.opportunity_score}%` }}
            />
          </div>
        </div>

        {/* Revenue + stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{formatRevenue(product.est_revenue)}</span>
            <span
              className={`text-xs font-medium ${
                product.revenue_change_7d >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {product.revenue_change_7d >= 0 ? '+' : ''}
              {product.revenue_change_7d}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/40">
            <span className="inline-flex items-center gap-0.5">
              <Users className="h-3 w-3" />
              {product.influencers}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Globe className="h-3 w-3" />
              {product.platforms}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Video className="h-3 w-3" />
              {product.videos}
            </span>
            <span className="inline-flex items-center gap-0.5">
              <Megaphone className="h-3 w-3" />
              {product.ads}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/products/${product.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-white border-white/20 hover:bg-white/10">
              View Intelligence
              <ChevronDown className="h-3 w-3 -rotate-90" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onToggleWatch(product.id);
            }}
            className={`shrink-0 ${
              product.watched
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Star className={`h-4 w-4 ${product.watched ? 'fill-amber-400' : ''}`} />
            Watch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────

const PAGE_SIZE = 12;

const AI_BRIEFING =
  'Good morning! 12 new trending products detected overnight. 3 show pre-viral signals on Reddit. TikTok Shop engagement up 23% vs last week. Top opportunity: Portable Neck Fan with LED Display scoring 94/100.';

export default function DashboardPage() {
  // ── Filter state ─────────────────────────────────────────────────
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d');
  const [sortBy, setSortBy] = useState<SortOption>('trend_score');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [minScore, setMinScore] = useState<MinScore>('0');

  // ── UI state ─────────────────────────────────────────────────────
  const [briefingDismissed, setBriefingDismissed] = useState(false);
  const [briefingExpanded, setBriefingExpanded] = useState(false);
  const [products, setProducts] = useState<MockProduct[]>(MOCK_PRODUCTS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  // Clean up stale OAuth params from URL (code, next) that may leak from callback redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code') || params.has('next')) {
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  // Simulate initial loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  // ── Toggle watch ─────────────────────────────────────────────────
  const toggleWatch = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, watched: !p.watched } : p))
    );
  };

  // ── Filtered + sorted products ───────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    // Min score filter
    const minScoreNum = parseInt(minScore, 10);
    if (minScoreNum > 0) {
      result = result.filter((p) => p.opportunity_score >= minScoreNum);
    }

    // Sort
    switch (sortBy) {
      case 'trend_score':
        result.sort((a, b) => b.opportunity_score - a.opportunity_score);
        break;
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'revenue_est':
        result.sort((a, b) => b.est_revenue - a.est_revenue);
        break;
    }

    return result;
  }, [products, categoryFilter, minScore, sortBy]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* ── 1. STICKY TOP STRIP ─────────────────────────────────────── */}
      <div className="sticky top-0 z-30 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 bg-[var(--color-brand-900)]/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          {/* Time filter buttons */}
          <div className="flex items-center rounded-lg border border-white/10 overflow-hidden">
            {(
              [
                { key: 'today' as TimeFilter, label: 'Today' },
                { key: '7d' as TimeFilter, label: '7 Days' },
                { key: '30d' as TimeFilter, label: '30 Days' },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeFilter(key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  timeFilter === key
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Clock className="inline h-3 w-3 mr-1 -mt-0.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as SortOption)}
            className="w-40"
          >
            <SelectOption value="trend_score">Trend Score</SelectOption>
            <SelectOption value="newest">Newest</SelectOption>
            <SelectOption value="revenue_est">Revenue Est</SelectOption>
          </Select>

          {/* Category filter */}
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            className="w-36"
          >
            {CATEGORIES.map((cat) => (
              <SelectOption key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </SelectOption>
            ))}
          </Select>

          {/* Min score */}
          <Select
            value={minScore}
            onValueChange={(v) => setMinScore(v as MinScore)}
            className="w-32"
          >
            <SelectOption value="0">Any Score</SelectOption>
            <SelectOption value="50">50+</SelectOption>
            <SelectOption value="70">70+</SelectOption>
            <SelectOption value="90">90+</SelectOption>
          </Select>

          {/* Filter icon indicator */}
          <div className="ml-auto flex items-center gap-1 text-white/40 text-xs">
            <Filter className="h-3.5 w-3.5" />
            <span>{filteredProducts.length} products</span>
          </div>
        </div>
      </div>

      {/* ── 2. AI BRIEFING CARD ─────────────────────────────────────── */}
      {!briefingDismissed && (
        <div className="space-y-2">
          <AIInsightCard
            title="Daily Intelligence Briefing"
            content={
              briefingExpanded
                ? `${AI_BRIEFING} The Beauty category is surging with 4 new entrants this week. Consider prioritizing products with 70+ scores in Health and Electronics — both categories show strong seasonal momentum heading into Q2.`
                : AI_BRIEFING
            }
            confidence={88}
            streaming
            className="bg-white/5"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setBriefingExpanded(!briefingExpanded)}
              className="text-indigo-400 hover:text-indigo-300"
            >
              {briefingExpanded ? 'Collapse brief' : 'Expand full brief'}
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setBriefingDismissed(true)}
              className="text-white/40 hover:text-white/60"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* ── 3. PRODUCT GRID ─────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Filter className="h-10 w-10 text-white/20 mb-3" />
          <p className="text-white/60 font-medium">No products match your filters</p>
          <p className="text-white/40 text-sm mt-1">Try adjusting the score or category filters</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 text-white border-white/20"
            onClick={() => {
              setCategoryFilter('All');
              setMinScore('0');
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleWatch={toggleWatch}
              />
            ))}
          </div>

          {/* ── 5. LOAD MORE + COUNTER ──────────────────────────────── */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-white/40">
              Showing {visibleProducts.length} of {filteredProducts.length} products
            </span>
            {hasMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="text-white border-white/20 hover:bg-white/10"
              >
                Load more
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
