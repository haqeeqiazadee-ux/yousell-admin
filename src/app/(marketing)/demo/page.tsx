'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Star, Eye, ShoppingCart, ExternalLink } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type Platform = 'TikTok Shop' | 'Amazon' | 'Shopify';

interface SampleProduct {
  name: string;
  image: string; // emoji placeholder
  price: string;
  score: number;
  trend: string;
  sales: string;
  platform: Platform;
  category: string;
}

const products: SampleProduct[] = [
  {
    name: 'LED Sunset Projector Lamp',
    image: '🌅',
    price: '$14.99',
    score: 94,
    trend: '+340%',
    sales: '12.4K/week',
    platform: 'TikTok Shop',
    category: 'Home & Living',
  },
  {
    name: 'Portable Blender Pro 600ml',
    image: '🥤',
    price: '$22.50',
    score: 91,
    trend: '+180%',
    sales: '8.2K/week',
    platform: 'TikTok Shop',
    category: 'Kitchen',
  },
  {
    name: 'Cloud Slides Sandals',
    image: '☁️',
    price: '$18.99',
    score: 88,
    trend: '+95%',
    sales: '15.1K/week',
    platform: 'Amazon',
    category: 'Footwear',
  },
  {
    name: 'Smart Posture Corrector',
    image: '🦴',
    price: '$29.99',
    score: 85,
    trend: '+210%',
    sales: '5.7K/week',
    platform: 'Amazon',
    category: 'Health',
  },
  {
    name: 'Minimalist Phone Case MagSafe',
    image: '📱',
    price: '$12.99',
    score: 82,
    trend: '+120%',
    sales: '9.3K/week',
    platform: 'Shopify',
    category: 'Accessories',
  },
];

const platforms: Platform[] = ['TikTok Shop', 'Amazon', 'Shopify'];

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? 'bg-emerald-100 text-emerald-700'
      : score >= 80
        ? 'bg-amber-100 text-amber-700'
        : 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>
      {score}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function DemoPage() {
  const [activePlatform, setActivePlatform] = useState<Platform | 'All'>('All');

  const filtered =
    activePlatform === 'All' ? products : products.filter((p) => p.platform === activePlatform);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-rose-50 to-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            See yousell in action
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            No signup needed. Explore sample product data across platforms to see how yousell
            surfaces winning products.
          </p>
        </div>
      </section>

      {/* Mock Dashboard */}
      <section className="mx-auto max-w-7xl px-6 -mt-4 pb-20">
        <div className="relative rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <span className="text-gray-200 text-lg font-semibold rotate-[-15deg] select-none">
              Sample data. Sign up for real-time intelligence.
            </span>
          </div>

          {/* Toolbar */}
          <div className="relative z-20 border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">Product Discovery</span>
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-medium text-rose-600">
                DEMO
              </span>
            </div>
            <div className="flex gap-2">
              {(['All', ...platforms] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePlatform(p)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activePlatform === p
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="relative z-20 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filtered.map((product) => (
              <div
                key={product.name}
                className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
              >
                {/* Image placeholder */}
                <div className="h-28 rounded-lg bg-gray-50 flex items-center justify-center text-4xl mb-4">
                  {product.image}
                </div>

                <div className="flex items-center justify-between mb-2">
                  <ScoreBadge score={product.score} />
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> {product.trend}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{product.name}</h3>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">{product.price}</span>
                  <span className="text-[10px] text-gray-400">{product.platform}</span>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <ShoppingCart className="h-3 w-3" /> {product.sales}
                  </span>
                </div>

                <span className="inline-block mt-3 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                  {product.category}
                </span>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="relative z-20 border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-gray-50/50">
            <span className="text-xs text-gray-400">
              Showing {filtered.length} sample products
            </span>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
            >
              View all products <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sticky CTA */}
      <section className="sticky bottom-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur py-4">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <p className="text-sm text-gray-600 hidden sm:block">
            Like what you see? Get real-time data on thousands of products.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
          >
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
