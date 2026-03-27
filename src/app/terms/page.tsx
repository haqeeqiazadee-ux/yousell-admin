import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0B1120] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              You<span className="text-red-500">Sell</span><span className="text-emerald-400">.</span><span className="text-gray-400">Online</span>
            </h1>
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-12 md:px-6 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-400">
          <p><strong className="text-white">Last updated:</strong> March 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the YouSell platform (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p>YouSell is an AI-powered commerce intelligence platform that provides product discovery, trend analysis, influencer matching, supplier sourcing, and store management tools across multiple e-commerce platforms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must not share your account or API keys with unauthorized parties. You are responsible for all activity under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Subscription and Billing</h2>
            <p>Paid plans are billed monthly via Stripe. You may cancel at any time from your billing dashboard. Upon cancellation, you retain access until the end of your current billing period. No refunds are issued for partial months.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Acceptable Use</h2>
            <p>You may not use the Service for any illegal purpose, to scrape or harvest data in violation of third-party terms, to impersonate others, or to interfere with the operation of the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Intellectual Property</h2>
            <p>The YouSell platform, including its AI models, scoring algorithms, and user interface, is the property of YouSell Online LLC. Content generated for your account using the Service belongs to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
            <p>The Service is provided &quot;as is&quot; without warranties of any kind. YouSell is not liable for any indirect, incidental, or consequential damages arising from use of the Service, including lost profits or data loss.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Termination</h2>
            <p>We reserve the right to suspend or terminate your account for violations of these terms. You may delete your account at any time by contacting support@yousell.online.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:legal@yousell.online" className="text-emerald-400 hover:text-emerald-300">legal@yousell.online</a>.</p>
          </section>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} YouSell Online LLC &middot;{' '}
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy</Link> &middot;{' '}
            <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
