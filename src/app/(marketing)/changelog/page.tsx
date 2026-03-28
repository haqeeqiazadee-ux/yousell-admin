import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'What\'s new at YouSell. Product updates, improvements, and fixes.',
};

const entries = [
  {
    version: 'v2.4.0',
    date: 'Mar 27, 2026',
    tag: 'New Feature',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: 'External Engines',
    items: [
      'Connect any REST API or webhook as a data source',
      'Drag-and-drop field mapper for schema alignment',
      'Configurable refresh intervals (5 min on Agency, 15 min on Pro)',
      'External engine data flows into Trend Radar and AI Briefings',
    ],
  },
  {
    version: 'v2.3.2',
    date: 'Mar 14, 2026',
    tag: 'Improvement',
    tagColor: 'bg-blue-100 text-blue-700',
    title: 'AI Content Generation',
    items: [
      'Creative Studio now generates Amazon, Shopify, and TikTok Shop listings',
      'SEO-optimised titles, bullet points, and descriptions',
      'Brand voice settings in Account → AI Preferences',
      'Direct push to connected stores (Shopify integration)',
    ],
  },
  {
    version: 'v2.3.0',
    date: 'Mar 5, 2026',
    tag: 'New Feature',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: 'Pre-Viral Detection v2',
    items: [
      'Retrained model with 18 months of additional data',
      'False positive rate reduced by 34%',
      'New signal breakdown UI — see exactly which signals are driving the score',
      'Streaming AI predictions with typewriter effect',
      'Pre-viral window now estimated in days (not just a score)',
    ],
  },
  {
    version: 'v2.2.1',
    date: 'Feb 21, 2026',
    tag: 'Fix',
    tagColor: 'bg-amber-100 text-amber-700',
    title: 'Dashboard & Performance',
    items: [
      'Fixed TikTok Shop data delay (was up to 4 hours behind, now < 15 min)',
      'Resolved duplicate alert notifications for some users',
      'Improved product grid load time by 60%',
      'Fixed BSR chart rendering on Safari',
    ],
  },
  {
    version: 'v2.2.0',
    date: 'Feb 10, 2026',
    tag: 'New Feature',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: 'Amazon BSR Movers',
    items: [
      'New tab in Amazon Intelligence showing biggest BSR movements',
      'Filter by category, timeframe (7/14/30 days), and movement size',
      'Alert configuration for specific BSR thresholds',
      'Heatmap colouring for at-a-glance BSR health',
    ],
  },
  {
    version: 'v2.1.0',
    date: 'Jan 28, 2026',
    tag: 'New Feature',
    tagColor: 'bg-emerald-100 text-emerald-700',
    title: 'Shopify Store Integration',
    items: [
      'OAuth integration — connect your Shopify store in 60 seconds',
      'Push products directly from yousell to your store',
      'Live sync of product status and inventory',
      'Store analytics (revenue, orders) in the Client Dashboard',
    ],
  },
  {
    version: 'v2.0.0',
    date: 'Jan 15, 2026',
    tag: 'Major Release',
    tagColor: 'bg-purple-100 text-purple-700',
    title: 'Intelligence Chain & Product Detail',
    items: [
      'Completely rebuilt product detail page with full Intelligence Chain',
      '7-engine breakdown: Identity, Stats, Influencers, TikTok Shops, Channels, Videos & Ads, Opportunity Score',
      'Composite score gauge with real-time signal breakdown',
      'Blueprint generation from any product detail page',
      'Export to Excel for any product',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Changelog
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Every update, improvement, and fix — in one place.
          </p>
        </div>
      </section>

      {/* Entries */}
      <section className="mx-auto max-w-3xl px-6 pb-24">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />

          <div className="space-y-12">
            {entries.map((entry) => (
              <div key={entry.version} className="sm:pl-12 relative">
                {/* Timeline dot */}
                <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-white border-2 border-gray-300 hidden sm:block" />

                <div className="flex items-center gap-3 mb-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${entry.tagColor}`}>
                    {entry.tag}
                  </span>
                  <span className="text-xs text-gray-400">{entry.date}</span>
                  <span className="text-xs font-mono text-gray-400">{entry.version}</span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3">{entry.title}</h2>

                <ul className="space-y-2">
                  {entry.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-gray-400 mt-0.5 shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-400">
          Older releases available on{' '}
          <a href="https://github.com" className="text-gray-600 hover:underline">GitHub</a>
        </div>
      </section>
    </div>
  );
}
