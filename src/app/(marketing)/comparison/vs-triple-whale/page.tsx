import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, X, Minus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'YouSell vs Triple Whale',
  description: 'YouSell vs Triple Whale: Product discovery intelligence vs ad attribution analytics.',
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type Status = 'yes' | 'no' | 'partial';

interface Row {
  feature: string;
  yousell: Status;
  competitor: Status;
  note?: string;
}

const rows: Row[] = [
  { feature: 'Multi-platform product research', yousell: 'yes', competitor: 'no', note: 'Triple Whale focuses on analytics, not discovery' },
  { feature: 'Ad attribution & ROAS tracking', yousell: 'partial', competitor: 'yes', note: 'Triple Whale excels here' },
  { feature: 'Shopify integration', yousell: 'yes', competitor: 'yes' },
  { feature: 'TikTok Shop product tracking', yousell: 'yes', competitor: 'no' },
  { feature: 'Amazon product intelligence', yousell: 'yes', competitor: 'no' },
  { feature: 'Pixel-based attribution', yousell: 'no', competitor: 'yes' },
  { feature: 'Product discovery engine', yousell: 'yes', competitor: 'no' },
  { feature: 'Pre-viral trend detection', yousell: 'yes', competitor: 'no' },
  { feature: 'Supplier matching & sourcing', yousell: 'yes', competitor: 'no' },
  { feature: 'AI content generation', yousell: 'yes', competitor: 'no' },
  { feature: 'Creator/influencer discovery', yousell: 'yes', competitor: 'no' },
  { feature: 'Profit & loss dashboard', yousell: 'yes', competitor: 'yes' },
  { feature: 'Customer lifetime value (LTV)', yousell: 'partial', competitor: 'yes' },
  { feature: 'Cohort analysis', yousell: 'no', competitor: 'yes' },
  { feature: 'API access', yousell: 'yes', competitor: 'yes' },
  { feature: 'Free plan available', yousell: 'yes', competitor: 'no', note: 'Triple Whale starts at $129/mo' },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === 'yes') return <Check className="h-5 w-5 text-emerald-500" />;
  if (status === 'no') return <X className="h-5 w-5 text-gray-300" />;
  return <Minus className="h-5 w-5 text-amber-400" />;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function VsTripleWhalePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-rose-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
            yousell vs Triple Whale — Which Is Better in 2026?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Triple Whale is excellent for DTC ad attribution and Shopify analytics. yousell is
            built for product discovery and multi-platform intelligence. Different tools for
            different jobs — here&apos;s how they compare.
          </p>
        </div>
      </section>

      {/* What Triple Whale Does Well */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Where Triple Whale shines</h2>
        <p className="text-gray-600 leading-relaxed">
          Triple Whale is the best-in-class tool for Shopify-based DTC brands that spend heavily
          on paid ads. Their pixel-based attribution, cohort analysis, and LTV modelling are
          genuinely excellent. If your primary concern is understanding ad performance and
          customer retention on Shopify, Triple Whale is hard to beat.
        </p>
      </section>

      {/* Comparison Table */}
      <section className="mx-auto max-w-4xl px-6 py-8">
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                <th className="text-center py-4 px-6 font-semibold text-rose-600">yousell</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-500">Triple Whale</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="py-3 px-6 text-gray-700">
                    {row.feature}
                    {row.note && <span className="block text-xs text-gray-400 mt-0.5">{row.note}</span>}
                  </td>
                  <td className="py-3 px-6 text-center"><StatusIcon status={row.yousell} /></td>
                  <td className="py-3 px-6 text-center"><StatusIcon status={row.competitor} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* yousell Advantage */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Why operators add yousell alongside Triple Whale</h2>
        <ul className="space-y-3 text-gray-600">
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Product discovery and trend detection — find what to sell, not just track what you already sell.</li>
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Multi-platform intelligence across TikTok Shop, Amazon, Shopify, and more.</li>
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Supplier matching, AI content, and store push — Triple Whale doesn&apos;t do sourcing.</li>
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Free plan to get started — Triple Whale starts at $129/month.</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-rose-600 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white">Discover products, not just track them</h2>
          <p className="mt-3 text-rose-100">Start a free trial — no credit card required.</p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Try yousell free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
