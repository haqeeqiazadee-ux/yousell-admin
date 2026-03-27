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
  { feature: 'TikTok Shop product tracking', yousell: 'yes', competitor: 'yes' },
  { feature: 'Multi-platform support (Amazon, Shopify, eBay)', yousell: 'yes', competitor: 'no', note: 'FastMoss focuses on TikTok only' },
  { feature: 'Pre-viral product detection', yousell: 'yes', competitor: 'partial' },
  { feature: 'Creator/influencer discovery', yousell: 'yes', competitor: 'yes' },
  { feature: 'Ad creative intelligence', yousell: 'yes', competitor: 'partial' },
  { feature: 'Supplier matching & sourcing', yousell: 'yes', competitor: 'no' },
  { feature: 'Profit & margin calculator', yousell: 'yes', competitor: 'no' },
  { feature: 'AI content generation', yousell: 'yes', competitor: 'no' },
  { feature: 'Real-time trend velocity scoring', yousell: 'yes', competitor: 'yes' },
  { feature: 'Store push (Shopify, Amazon)', yousell: 'yes', competitor: 'no' },
  { feature: 'White-label / agency support', yousell: 'yes', competitor: 'no' },
  { feature: 'API access', yousell: 'yes', competitor: 'no' },
  { feature: 'External engine integrations', yousell: 'yes', competitor: 'no' },
  { feature: 'Free plan available', yousell: 'yes', competitor: 'yes' },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === 'yes') return <Check className="h-5 w-5 text-emerald-500" />;
  if (status === 'no') return <X className="h-5 w-5 text-gray-300" />;
  return <Minus className="h-5 w-5 text-amber-400" />;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function VsFastMossPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-rose-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
            yousell vs FastMoss — Which Is Better in 2026?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            FastMoss is a solid tool for TikTok product research. But if you sell on multiple
            platforms or need supplier data, AI content, and store integrations — yousell goes further.
          </p>
        </div>
      </section>

      {/* What FastMoss Does Well */}
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Where FastMoss shines</h2>
        <p className="text-gray-600 leading-relaxed">
          FastMoss has strong TikTok-specific analytics, including shop rankings, creator data,
          and live-stream tracking. If your entire business is TikTok-only, FastMoss gives you
          deep visibility into that single platform. Their free tier is generous for TikTok research.
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
                <th className="text-center py-4 px-6 font-semibold text-gray-500">FastMoss</th>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Why operators choose yousell</h2>
        <ul className="space-y-3 text-gray-600">
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Track products across 14 platforms, not just TikTok.</li>
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Supplier matching, profit analysis, and AI content — built in.</li>
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Push products directly to Shopify, Amazon, or TikTok Shop.</li>
          <li className="flex gap-3"><Check className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" /> Enterprise features: API, white-label, multi-client workspaces.</li>
        </ul>
      </section>

      {/* CTA */}
      <section className="bg-rose-600 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white">See the difference for yourself</h2>
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
