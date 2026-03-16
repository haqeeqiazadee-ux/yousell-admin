import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Zap, BarChart3, ShoppingBag, Users, Globe } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const headersList = await headers()
  const hostname = headersList.get('host') || ''
  const isAdminSubdomain = hostname.startsWith('admin.')

  // Admin subdomain: redirect (middleware should handle this, but fallback)
  if (isAdminSubdomain) {
    redirect(user ? '/admin' : '/admin/login')
  }

  // Client domain: logged-in users go to dashboard
  if (user) {
    redirect('/dashboard')
  }

  // Unauthenticated client-domain visitors see the homepage
  return <HomePage />
}

function HomePage() {
  return (
    <div className="min-h-screen bg-[#0B1120] relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full bg-emerald-500/5 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
          <h1 className="text-xl font-bold text-white tracking-tight">
            You<span className="text-red-500">Sell</span><span className="text-emerald-400">.</span><span className="text-gray-400">Online</span>
          </h1>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/20"
            >
              Get Started
            </Link>
          </nav>
          <div className="md:hidden flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <span className="inline-flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-widest uppercase mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Commerce Intelligence
          </span>
          <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl mx-auto">
            Find winning products<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">before they trend</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Discover trending e-commerce products across TikTok, Amazon, and Shopify. Score viability, match influencers, and launch — all from one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3.5 rounded-lg font-semibold text-sm hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/20"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-3.5 rounded-lg font-semibold text-sm hover:bg-white/10 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Platform badges */}
      <section className="relative z-10 pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-6">Discover products across</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['Amazon', 'TikTok Shop', 'Shopify', 'eBay', 'Etsy', 'Walmart', 'AliExpress'].map((platform) => (
              <span key={platform} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/[0.06] text-sm text-gray-400">
                <Globe className="w-3.5 h-3.5 text-emerald-500/60" />
                {platform}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-16 md:py-24 border-t border-white/[0.06]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to win
            </h3>
            <p className="text-gray-400 max-w-xl mx-auto">
              From product discovery to store launch — our AI handles the research so you can focus on selling.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: TrendingUp,
                title: 'Trend Detection',
                desc: 'Spot trending products 2-3 weeks before mainstream adoption using real-time marketplace data.',
              },
              {
                icon: BarChart3,
                title: '3-Pillar Scoring',
                desc: 'Every product scored on Trend, Viral, and Profit potential for confident, data-driven decisions.',
              },
              {
                icon: Users,
                title: 'Influencer Matching',
                desc: 'Auto-match products with influencers based on niche, engagement rate, and price fit.',
              },
              {
                icon: ShoppingBag,
                title: 'Supplier Intelligence',
                desc: 'Find verified suppliers with competitive pricing, MOQ data, and reliability scores.',
              },
              {
                icon: Zap,
                title: 'AI Content Engine',
                desc: 'Generate product descriptions, ad copy, and social content — optimized for each platform.',
              },
              {
                icon: Globe,
                title: 'Store Integration',
                desc: 'Push winning products directly to your Shopify, TikTok Shop, or Amazon store.',
              },
            ].map((f) => (
              <div key={f.title} className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="text-white font-semibold mb-2">{f.title}</h4>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-16 md:py-24 border-t border-white/[0.06]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to find your next winning product?
          </h3>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Join thousands of sellers using AI to stay ahead of trends. Start your 7-day free trial today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3.5 rounded-lg font-semibold text-sm hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/20"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} YouSell Online LLC
          </p>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Pricing</Link>
            <Link href="/privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
