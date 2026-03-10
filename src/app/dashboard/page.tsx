'use client';

import { useEffect, useState, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';

function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

interface AllocatedProduct {
  id: string;
  title: string;
  platform: string;
  final_score: number | null;
  trend_stage: string | null;
  image_url: string | null;
  allocated_at: string;
}

interface DashboardStats {
  productsAvailable: number;
  hotProducts: number;
  pendingRequests: number;
  productsReleased: number;
}

function getBadge(score: number | null) {
  if (!score) return { label: 'N/A', color: 'bg-gray-100 text-gray-600' };
  if (score >= 80) return { label: 'HOT', color: 'bg-red-100 text-red-700' };
  if (score >= 60) return { label: 'WARM', color: 'bg-orange-100 text-orange-700' };
  if (score >= 40) return { label: 'WATCH', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'COLD', color: 'bg-gray-100 text-gray-600' };
}

export default function DashboardPage() {
  const [products, setProducts] = useState<AllocatedProduct[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    productsAvailable: 0,
    hotProducts: 0,
    pendingRequests: 0,
    productsReleased: 0,
  });
  const [loading, setLoading] = useState(true);
  const [requestNote, setRequestNote] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch allocated products for this client
      const { data: allocations } = await supabase
        .from('product_allocations')
        .select('*, products(id, title, platform, final_score, trend_stage, image_url)')
        .eq('client_id', user.id)
        .eq('status', 'active')
        .order('allocated_at', { ascending: false });

      const mapped: AllocatedProduct[] = (allocations || []).map((a: Record<string, unknown>) => {
        const p = a.products as Record<string, unknown> | null;
        return {
          id: (p?.id as string) || a.id as string,
          title: (p?.title as string) || 'Untitled',
          platform: (p?.platform as string) || 'unknown',
          final_score: (p?.final_score as number) || null,
          trend_stage: (p?.trend_stage as string) || null,
          image_url: (p?.image_url as string) || null,
          allocated_at: a.allocated_at as string,
        };
      });

      setProducts(mapped);

      // Count stats
      const hotCount = mapped.filter(p => (p.final_score || 0) >= 80).length;

      const { count: pendingCount } = await supabase
        .from('product_requests')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'pending');

      setStats({
        productsAvailable: mapped.length,
        hotProducts: hotCount,
        pendingRequests: pendingCount || 0,
        productsReleased: mapped.length,
      });
    } catch {
      // API may not be ready
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestProducts = async () => {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('product_requests').insert({
        client_id: user.id,
        note: requestNote || 'Requesting more products',
        status: 'pending',
      });

      setRequestSubmitted(true);
      setRequestNote('');
      fetchData();
    } catch {
      // handle error
    }
  };

  const kpis = [
    { label: 'Products Available', value: stats.productsAvailable, icon: '📦' },
    { label: 'Hot Products', value: stats.hotProducts, icon: '🔥' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: '⏳' },
    { label: 'Products Released', value: stats.productsReleased, icon: '🚀' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Your product intelligence overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{kpi.label}</p>
              <span className="text-xl">{kpi.icon}</span>
            </div>
            <p className="text-3xl font-bold mt-2">
              {loading ? '—' : kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Allocated Products */}
      <div className="rounded-lg border bg-white shadow-sm">
        <div className="p-5 border-b">
          <h2 className="text-lg font-semibold">Your Allocated Products</h2>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg font-medium">No products allocated yet</p>
              <p className="text-sm mt-1">Request products below to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => {
                const badge = getBadge(product.final_score);
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-12 h-12 rounded object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{product.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500 uppercase">{product.platform}</span>
                          {product.trend_stage && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              {product.trend_stage}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{product.final_score ?? '—'}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Request More Products */}
      <div className="rounded-lg border bg-white shadow-sm p-5">
        <h2 className="text-lg font-semibold mb-3">Request More Products</h2>
        {requestSubmitted ? (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-700 text-sm">
            Request submitted successfully! Our team will review it shortly.
            <button
              onClick={() => setRequestSubmitted(false)}
              className="ml-2 underline"
            >
              Submit another
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <input
              type="text"
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="Optional note (e.g., 'Need fitness products for TikTok')"
              className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleRequestProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Request Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
