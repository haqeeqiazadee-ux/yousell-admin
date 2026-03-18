import Link from 'next/link';

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-gray-400">
          <p><strong className="text-white">Last updated:</strong> March 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly when creating an account (name, email), data from connected third-party platforms (Shopify, TikTok Shop, Amazon) with your authorization, and usage data (pages visited, features used) to improve our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide and maintain the YouSell platform, process transactions, send transactional emails, generate product intelligence and analytics, and improve our AI-powered features.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Third-Party Services</h2>
            <p>We integrate with third-party services including Supabase (authentication and database), Stripe (payment processing), and Anthropic (AI content generation). Each service has its own privacy policy governing the data they process.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption of OAuth tokens at rest, row-level security on all database tables, and HTTPS for all data in transit. We never store raw passwords.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at privacy@yousell.online. You may also disconnect any connected platform from your dashboard settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Cookies</h2>
            <p>We use essential cookies for authentication session management. We do not use third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:privacy@yousell.online" className="text-emerald-400 hover:text-emerald-300">privacy@yousell.online</a>.</p>
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
