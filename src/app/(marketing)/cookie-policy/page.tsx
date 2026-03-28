import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How YouSell uses cookies and similar tracking technologies on our website and application.',
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-b from-gray-50 to-white py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Cookie Policy</h1>
          <p className="mt-3 text-gray-500 text-sm">Last updated: March 2026</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl px-6 pb-24 space-y-10 text-gray-700">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">What are cookies?</h2>
          <p className="text-sm leading-relaxed">
            Cookies are small text files placed on your device when you visit a website. They help websites
            remember your preferences, keep you logged in, and understand how you use the site.
            We use cookies and similar technologies (local storage, session storage) across yousell.online
            and admin.yousell.online.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Cookies we use</h2>

          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm">Essential Cookies</h3>
                <p className="text-xs text-gray-500 mt-0.5">Required for the site to function. Cannot be disabled.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { name: 'sb-*', provider: 'Supabase', purpose: 'Authentication session tokens — keeps you logged in', duration: 'Session / 7 days' },
                  { name: '__stripe_*', provider: 'Stripe', purpose: 'Payment processing and fraud prevention', duration: 'Session' },
                  { name: 'theme', provider: 'YouSell', purpose: 'Remembers your dark/light mode preference', duration: '1 year' },
                ].map((c) => (
                  <div key={c.name} className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                    <span className="font-mono font-medium text-gray-900">{c.name}</span>
                    <span>{c.provider}</span>
                    <span className="sm:col-span-1 text-gray-500">{c.purpose}</span>
                    <span className="text-gray-400">{c.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm">Functional Cookies</h3>
                <p className="text-xs text-gray-500 mt-0.5">Improve your experience but are not strictly necessary.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { name: 'sidebar_state', provider: 'YouSell', purpose: 'Remembers whether your sidebar is collapsed', duration: '30 days' },
                  { name: 'onboarding_step', provider: 'YouSell', purpose: 'Tracks your onboarding progress', duration: '30 days' },
                ].map((c) => (
                  <div key={c.name} className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                    <span className="font-mono font-medium text-gray-900">{c.name}</span>
                    <span>{c.provider}</span>
                    <span className="sm:col-span-1 text-gray-500">{c.purpose}</span>
                    <span className="text-gray-400">{c.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm">Analytics Cookies</h3>
                <p className="text-xs text-gray-500 mt-0.5">Help us understand how you use the product. No personal data is shared with third parties for advertising.</p>
              </div>
              <div className="divide-y divide-gray-100">
                {[
                  { name: '_ys_session', provider: 'YouSell', purpose: 'Anonymous usage analytics — page views, feature usage', duration: '90 days' },
                ].map((c) => (
                  <div key={c.name} className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600">
                    <span className="font-mono font-medium text-gray-900">{c.name}</span>
                    <span>{c.provider}</span>
                    <span className="sm:col-span-1 text-gray-500">{c.purpose}</span>
                    <span className="text-gray-400">{c.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">What we do NOT use</h2>
          <ul className="space-y-2 text-sm">
            {[
              'No advertising or tracking cookies (Meta Pixel, Google Ads, etc.)',
              'No third-party behavioural profiling',
              'No cookie-based retargeting',
              'No sale of cookie data to third parties',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Managing cookies</h2>
          <p className="text-sm leading-relaxed">
            You can control cookies through your browser settings. Most browsers allow you to refuse new
            cookies, delete existing cookies, and set notifications when new cookies are set.
            Note that disabling essential cookies will prevent you from staying logged in.
          </p>
          <p className="text-sm leading-relaxed mt-3">
            For guidance on managing cookies in your specific browser, visit{' '}
            <a href="https://www.allaboutcookies.org" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              allaboutcookies.org
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact</h2>
          <p className="text-sm leading-relaxed">
            Questions about our cookie practices? Contact us at{' '}
            <a href="mailto:privacy@yousell.online" className="text-blue-600 hover:underline">
              privacy@yousell.online
            </a>.
          </p>
        </section>

      </article>
    </div>
  );
}
