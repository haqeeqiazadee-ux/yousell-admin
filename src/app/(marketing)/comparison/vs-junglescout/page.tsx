import Link from 'next/link';
import { ArrowRight, Check, X, Minus } from 'lucide-react';

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
  { feature: 'Amazon product research', yousell: 'yes', competitor: 'yes' },
  { feature: 'TikTok Shop tracking', yousell: 'yes', competitor: 'no', note: 'Jungle Scout is Amazon-focused' },
  { feature: 'Shopify store tracking', yousell: 'yes', competitor: 'no' },
  { feature: 'Multi-platform intelligence', yousell: 'yes', competitor: 'partial', note: 'Amazon + limited Walmart' },
  { feature: 'Keyword research', yousell: 'yes', competitor: 'yes' },
  { feature: 'Supplier database', yousell: 'yes', competitor: 'yes' },
  { feature: 'Pre-viral product detection', yousell: 'yes', competitor: 'no' },
  { feature: 'Ad creative intelligence', yousell: 'yes', competitor: 'no' },
  { feature: 'AI content generation', yousell: 'yes', competitor: 'partial' },
  { feature: 'Creator/influencer discovery', yousell: 'yes', competitor: 'no' },
  { feature: 'Profit & margin analytics', yousell: 'yes', competitor: 'yes' },
  { feature: 'Store push integration', yousell: 'yes', competitor: 'no' },
  { feature: 'Review analytics', yousell: 'partial', competitor: 'yes' },
  { feature: 'Sales estimation accuracy', yousell: 'yes', competitor: 'yes', note: 'Both use different models' },
  { feature: 'API access', yousell: 'yes', competitor: 'no' },
  { feature: 'Free plan available', yousell: 'yes', competitor: 'no' },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === 'yes') return <Check className="h-5 w-5 text-emerald-500" />;
  if (status === 'no') return <X className="h-5 w-5 text-gray-300" />;
  return <Minus className="h-5 w-5 text-amber-400" />;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function VsJungleScoutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-rose-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
            yousell vs Jungle Scout — Which Is Better in 2026?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Jungle Scout is the OG of Amazon product research. But ecommerce in 2026 is
            multi-platform — and yousell is built for the way sellers work today.
          </p>
        </div>
      </section>

      {/* What Jungle Scout Does Well */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Where Jungle Scout shines</h2>
        <p className="text-gray-600 leading-relaxed">
          Jungle Scout has been the gold standard for Amazon sellers for years. Their sales
          estimation models are mature, their keyword research tool (Keyword Scout) is excellent,
          and they have a large, well-maintained supplier database. If you sell exclusively on
          Amazon and need deep keyword and review analytics, Jungle Scout is a strong choice.
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
                <th className="text-center py-4 px-6 font-semibold text-gray-500">Jungle Scout</th>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Why operators choose yousell over Jungle Scout</h2>
        <ul className="space-y-3 text-gray-600">
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Track TikTok Shop, Shopify, eBay, and 14 platforms — not just Amazon.</li>
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Pre-viral detection catches trends days before they hit Amazon.</li>
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> AI-powered content generation for listings across every platform.</li>
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Free plan available — Jungle Scout starts at $49/month.</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-rose-600 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white">Try the multi-platform alternative</h2>
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
