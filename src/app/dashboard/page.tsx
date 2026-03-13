'use client';

import { useEffect, useState, useCallback } from 'react';

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
  const [error, setError] = useState<string | null>(null);
  const [requestNote, setRequestNote] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, requestsRes] = await Promise.all([
        fetch('/api/dashboard/products'),
        fetch('/api/dashboard/requests'),
      ]);

      if (!productsRes.ok || !requestsRes.ok) {
        setError('Failed to load dashboard data.');
        setLoading(false);
        return;
      }

      const productsData = await productsRes.json();
      const requestsData = await requestsRes.json();

      const allProducts = (productsData.products || []) as AllocatedProduct[];
      setProducts(allProducts);

      const hotCount = allProducts.filter((p: AllocatedProduct) => (p.final_score || 0) >= 80).length;
      const pendingCount = (requestsData.requests || []).filter(
        (r: Record<string, unknown>) => r.status === 'pending'
      ).length;

      setStats({
        productsAvailable: allProducts.length,
        hotProducts: hotCount,
        pendingRequests: pendingCount,
        productsReleased: allProducts.length,
      });
      setError(null);
    } catch {
      setError('Failed to load dashboard data. Please refresh.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestProducts = async () => {
    try {
      const res = await fetch('/api/dashboard/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'general',
          note: requestNote || 'Requesting more products',
        }),
      });

      if (!res.ok) {
        setError('Failed to submit request. Please try again.');
        return;
      }

      setRequestSubmitted(true);
      setRequestNote('');
      setError(null);
      fetchData();
    } catch {
      setError('Failed to submit request. Please try again.');
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

      {/* Error Banner */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

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
