import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, DollarSign, Truck, Target, LineChart, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'YouSell for Resellers',
  description: 'Buy smarter. Price sharper. Sell faster with AI-powered reseller intelligence.',
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const benefits = [
  {
    icon: LineChart,
    title: 'Demand Forecasting That Actually Works',
    description:
      'Our AI analyses historical sales velocity, seasonality, and search trends to predict demand — so you buy the right quantity at the right time.',
  },
  {
    icon: DollarSign,
    title: 'Competitor Pricing Intelligence',
    description:
      'Track competitor pricing across Amazon, eBay, and Walmart in real time. Get alerts when price wars start so you can adjust before margins erode.',
  },
  {
    icon: Truck,
    title: 'B2B Supplier Intel',
    description:
      'Compare wholesale pricing, MOQs, and lead times from verified distributors. Ingram Micro, Alibaba, and direct brand partnerships in one view.',
  },
];

const features = [
  { label: 'Multi-Platform Price Monitoring', description: 'Track competitor pricing on Amazon, eBay, Walmart, and Shopify simultaneously.' },
  { label: 'Demand Forecasting Engine', description: 'AI-predicted demand curves with confidence intervals for smarter purchasing.' },
  { label: 'Margin Optimization', description: 'Real-time margin analysis including FBA fees, shipping, returns, and ad spend.' },
  { label: 'Inventory Alerts', description: 'Get notified before competitors stock out — and when you should reorder.' },
  { label: 'BSR & Category Tracking', description: 'Track Best Seller Rank movement across Amazon categories over time.' },
  { label: 'Supplier Comparison', description: 'Side-by-side comparison of wholesale pricing, MOQs, and delivery timelines.' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ForResellersPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-700 mb-6">
            For Resellers
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
            Buy smarter. Price sharper. Sell faster.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            yousell gives resellers demand forecasting, competitor pricing intelligence, and
            B2B supplier data — so you stock the right products at the right price.
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
            Built for resellers who move volume
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
          &ldquo;yousell&apos;s demand forecasting saved us from over-ordering 2,000 units of a product
          that tanked after Prime Day. That alone paid for the subscription ten times over.&rdquo;
        </blockquote>
        <div className="mt-6">
          <p className="font-semibold text-gray-900">Rachel T.</p>
          <p className="text-sm text-gray-500">Amazon FBA Reseller, 7-figure annual revenue</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-rose-600 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to outsmart the competition?</h2>
          <p className="mt-3 text-rose-100">Join thousands of resellers making data-driven sourcing and pricing decisions.</p>
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
