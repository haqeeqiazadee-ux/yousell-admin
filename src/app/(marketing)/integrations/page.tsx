'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, ExternalLink } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type Category = 'All' | 'Ecommerce' | 'Analytics' | 'Marketing' | 'Inventory' | 'Finance' | 'AI/Data';

interface Integration {
  name: string;
  category: Category;
  connected: boolean;
  featured: boolean;
  description: string;
  logo: string; // emoji placeholder
}

const integrations: Integration[] = [
  // Featured (top row)
  { name: 'Shopify', category: 'Ecommerce', connected: true, featured: true, description: 'Sync products, orders, and inventory with your Shopify store.', logo: '🟢' },
  { name: 'TikTok Shop', category: 'Ecommerce', connected: true, featured: true, description: 'Track TikTok Shop trends, viral products, and creator content.', logo: '🎵' },
  { name: 'Amazon', category: 'Ecommerce', connected: true, featured: true, description: 'Monitor Amazon BSR, reviews, pricing, and keyword rankings.', logo: '📦' },
  { name: 'Alibaba', category: 'Ecommerce', connected: false, featured: true, description: 'Source products and compare supplier pricing from Alibaba.', logo: '🏭' },
  { name: 'Ingram Micro', category: 'Inventory', connected: false, featured: true, description: 'Access wholesale distribution and inventory management.', logo: '🔗' },
  // Ecommerce
  { name: 'WooCommerce', category: 'Ecommerce', connected: false, featured: false, description: 'Connect your WooCommerce store for product sync.', logo: '🛒' },
  { name: 'eBay', category: 'Ecommerce', connected: false, featured: false, description: 'Track eBay listings, pricing, and seller analytics.', logo: '🏷️' },
  { name: 'Etsy', category: 'Ecommerce', connected: false, featured: false, description: 'Monitor Etsy trends and handmade product performance.', logo: '🎨' },
  { name: 'Walmart', category: 'Ecommerce', connected: false, featured: false, description: 'Walmart marketplace product tracking and analytics.', logo: '🏪' },
  // Analytics
  { name: 'Google Analytics', category: 'Analytics', connected: true, featured: false, description: 'Import traffic and conversion data from GA4.', logo: '📊' },
  { name: 'Hotjar', category: 'Analytics', connected: false, featured: false, description: 'Heatmaps and session recordings for store UX insights.', logo: '🔥' },
  { name: 'Mixpanel', category: 'Analytics', connected: false, featured: false, description: 'Advanced product analytics and user behavior tracking.', logo: '📈' },
  { name: 'Segment', category: 'Analytics', connected: false, featured: false, description: 'Unified customer data pipeline across all tools.', logo: '🔀' },
  // Marketing
  { name: 'Meta Ads', category: 'Marketing', connected: true, featured: false, description: 'Sync Facebook & Instagram ad spend and ROAS data.', logo: '📱' },
  { name: 'Google Ads', category: 'Marketing', connected: false, featured: false, description: 'Import Google Ads campaigns, spend, and conversions.', logo: '🔍' },
  { name: 'Klaviyo', category: 'Marketing', connected: false, featured: false, description: 'Email marketing automation and customer segmentation.', logo: '📧' },
  { name: 'Mailchimp', category: 'Marketing', connected: false, featured: false, description: 'Email campaigns and audience management integration.', logo: '🐵' },
  { name: 'TikTok Ads', category: 'Marketing', connected: false, featured: false, description: 'Track TikTok ad performance and creative analytics.', logo: '🎯' },
  // Inventory
  { name: 'ShipStation', category: 'Inventory', connected: false, featured: false, description: 'Shipping and fulfilment automation across carriers.', logo: '🚚' },
  { name: 'Oberlo', category: 'Inventory', connected: false, featured: false, description: 'Dropshipping product import and order management.', logo: '📋' },
  // Finance
  { name: 'Stripe', category: 'Finance', connected: true, featured: false, description: 'Payment processing and revenue analytics.', logo: '💳' },
  { name: 'QuickBooks', category: 'Finance', connected: false, featured: false, description: 'Accounting sync for profit and expense tracking.', logo: '📒' },
  { name: 'PayPal', category: 'Finance', connected: false, featured: false, description: 'PayPal transaction data and reconciliation.', logo: '💰' },
  // AI/Data
  { name: 'OpenAI', category: 'AI/Data', connected: true, featured: false, description: 'AI-powered product descriptions and content generation.', logo: '🤖' },
  { name: 'BigQuery', category: 'AI/Data', connected: false, featured: false, description: 'Export yousell data to Google BigQuery for custom analysis.', logo: '🗄️' },
  { name: 'Snowflake', category: 'AI/Data', connected: false, featured: false, description: 'Data warehouse integration for enterprise analytics.', logo: '❄️' },
];

const categories: Category[] = ['All', 'Ecommerce', 'Analytics', 'Marketing', 'Inventory', 'Finance', 'AI/Data'];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');

  const featured = integrations.filter((i) => i.featured);
  const filtered = integrations
    .filter((i) => !i.featured)
    .filter((i) => activeCategory === 'All' || i.category === activeCategory)
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-700 mb-6">
            50+ integrations
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Connect everything.<br />See everything.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            yousell connects to the platforms, tools, and data sources you already use — so you get a
            unified view of your entire ecommerce operation.
          </p>
        </div>
      </section>

      {/* Featured Row */}
      <section className="mx-auto max-w-7xl px-6 -mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">Featured Integrations</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {featured.map((integration) => (
            <div
              key={integration.name}
              className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-3xl mb-3">{integration.logo}</div>
              <h3 className="text-base font-semibold text-gray-900">{integration.name}</h3>
              <p className="mt-1 text-xs text-gray-500">{integration.category}</p>
              <div className="mt-3 flex items-center gap-1.5">
                {integration.connected ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                    <span className="inline-block h-2 w-2 rounded-full border border-gray-300" /> Available
                  </span>
                )}
              </div>
              <button className="mt-4 w-full rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors">
                {integration.connected ? 'Manage' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Filter + Search */}
      <section className="mx-auto max-w-7xl px-6 mt-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-16">
          {filtered.map((integration) => (
            <div
              key={integration.name}
              className="rounded-xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="text-2xl">{integration.logo}</div>
                {integration.connected ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                    <span className="inline-block h-2 w-2 rounded-full border border-gray-300" /> Available
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">{integration.name}</h3>
              <span className="inline-block mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                {integration.category}
              </span>
              <p className="mt-2 text-xs text-gray-500 leading-relaxed">{integration.description}</p>
              <button className="mt-4 w-full rounded-lg border border-rose-600 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                {integration.connected ? 'Manage' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Don&apos;t see your platform?</h2>
          <p className="mt-2 text-gray-600">We&apos;re adding new integrations every week. Let us know what you need.</p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 text-rose-600 font-semibold hover:text-rose-700 transition-colors"
          >
            Request an integration <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
