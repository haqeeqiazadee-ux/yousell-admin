import Link from 'next/link';
import { ArrowRight, TrendingUp, Zap, Package, Search, BarChart3, Users } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const benefits = [
  {
    icon: TrendingUp,
    title: 'Spot Trends Before They Peak',
    description:
      'Our pre-viral detection engine analyses velocity, engagement, and search volume to surface products days before they trend on TikTok.',
  },
  {
    icon: Search,
    title: 'Find Reliable Suppliers Fast',
    description:
      'Supplier matching scores rate quality, shipping speed, and pricing across Alibaba, CJ, and 1688 — so you stop wasting time on bad suppliers.',
  },
  {
    icon: Zap,
    title: 'Validate in Minutes, Not Weeks',
    description:
      'See real-time sales velocity, competitor pricing, and margin estimates before you commit to a product. Data-driven decisions, not gut feelings.',
  },
];

const features = [
  { label: 'Product Discovery Engine', description: 'AI-curated trending products across TikTok, Amazon, and Shopify.' },
  { label: 'TikTok Trend Velocity', description: 'Real-time tracking of viral product acceleration and engagement rate.' },
  { label: 'Supplier Matching', description: 'Auto-match products to verified suppliers with cost and shipping estimates.' },
  { label: 'Competitor Price Tracking', description: 'Monitor competitor pricing across platforms in real time.' },
  { label: 'Profit Calculator', description: 'Instant margin analysis including ads, shipping, platform fees, and COGS.' },
  { label: 'Ad Creative Intelligence', description: 'See which creatives are winning for products you want to sell.' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ForDropshippersPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-700 mb-6">
            For Dropshippers
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
            Stop guessing. Start selling products that are already winning.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            yousell gives you the same product intelligence that 7-figure sellers use —
            TikTok trend detection, supplier matching, and competitor analysis — all in one dashboard.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              See Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-xl border border-gray-200 bg-white p-8 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <b.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">{b.title}</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Everything a dropshipper needs, nothing you don&apos;t
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.label} className="rounded-lg bg-white p-6 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900">{f.label}</h4>
                <p className="mt-2 text-sm text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="mx-auto max-w-3xl px-6 py-16 lg:py-24 text-center">
        <blockquote className="text-xl text-gray-700 font-medium leading-relaxed italic">
          &ldquo;I was spending 3 hours a day researching products on TikTok. Now yousell shows me
          exactly what&apos;s trending before everyone else sees it. My first product hit $12K
          in week one.&rdquo;
        </blockquote>
        <div className="mt-6">
          <p className="font-semibold text-gray-900">Jordan M.</p>
          <p className="text-sm text-gray-500">Dropshipper, TikTok Shop &amp; Shopify</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-rose-600 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to find your next winning product?</h2>
          <p className="mt-3 text-rose-100">Join 60K+ operators using yousell to discover, validate, and sell smarter.</p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
