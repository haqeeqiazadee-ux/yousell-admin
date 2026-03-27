"use client";

import Link from "next/link";
import {
  Zap,
  Bell,
  Brain,
  Eye,
  FileText,
  TrendingUp,
  Search,
  BarChart3,
  ShoppingCart,
  Globe,
  ArrowRight,
  Check,
  X,
  Minus,
  Sparkles,
  Radio,
  Target,
  Layers,
} from "lucide-react";

/* ================================================================
   SECTION 1 — HERO
   ================================================================ */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Aurora gradient background — light-adapted */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 60% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 60%),
            #F8FAFC
          `,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-sm text-indigo-700 font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          25 AI Engines &middot; 14 Platform Providers &middot; Real-time
          Intelligence
        </div>

        {/* H1 */}
        <h1
          className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Discover Winning Products
          <br />
          Before Your Competitors Do
        </h1>

        {/* Subheadline */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 mb-10 leading-relaxed">
          yousell monitors TikTok, Amazon, Shopify and 11 more platforms 24/7.
          AI-powered intelligence tells you exactly what to sell, when, and why.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: "var(--color-brand-400)" }}
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
          >
            Watch 2-min demo
          </Link>
        </div>

        {/* Risk removal */}
        <p className="text-sm text-gray-500">
          No credit card &middot; 5 min setup &middot; Cancel anytime
        </p>

        {/* Floating dashboard mockup placeholder */}
        <div className="mt-16 mx-auto max-w-[600px] aspect-[16/10] rounded-xl shadow-2xl bg-gray-900 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Dashboard Preview</span>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 2 — SOCIAL PROOF BAR
   ================================================================ */
function SocialProofSection() {
  const platforms = [
    "Shopify",
    "TikTok",
    "Amazon",
    "Alibaba",
    "Ingram Micro",
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-8">
          Trusted by 60,000+ ecommerce operators
        </p>

        {/* Auto-scrolling marquee */}
        <div className="relative overflow-hidden mb-10">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...platforms, ...platforms, ...platforms].map((name, i) => (
              <span
                key={i}
                className="mx-8 text-xl font-semibold text-gray-300"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { label: "847K products tracked", icon: BarChart3 },
            { label: "\u00A355B revenue analysed", icon: TrendingUp },
            { label: "60K+ operators", icon: Globe },
          ].map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700"
            >
              <Icon className="w-4 h-4 text-indigo-500" />
              {label}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </section>
  );
}

/* ================================================================
   SECTION 3 — PROBLEM STATEMENT
   ================================================================ */
function ProblemSection() {
  const painPoints = [
    "Manually scrolling TikTok for hours to find trending products",
    "Guessing which products will sell based on gut feeling",
    "Missing viral trends because you found them too late",
    "Juggling 5+ tools with no unified view",
    "Wasting ad budget on products past their peak",
  ];

  const solutions = [
    "AI scans 14 platforms 24/7 and surfaces winners automatically",
    "Data-backed scoring ranks every product by real demand signals",
    "Pre-viral detection finds products 2-4 weeks before they peak",
    "One dashboard unifies all sources with AI briefings",
    "Real-time trend alerts so you ride the wave, not chase it",
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Pain column */}
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-8"
              style={{ fontFamily: "var(--font-display)" }}
            >
              You&apos;re spending hours manually researching...
            </h2>
            <ul className="space-y-4">
              {painPoints.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <span className="text-gray-600">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Solution column */}
          <div>
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-8"
              style={{ fontFamily: "var(--font-display)" }}
            >
              yousell does it in seconds...
            </h2>
            <ul className="space-y-4">
              {solutions.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-gray-600">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition"
          >
            See how it works
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 4 — INTELLIGENCE CHAIN
   ================================================================ */
function IntelligenceChainSection() {
  const steps = [
    {
      num: 1,
      title: "Platform Scan",
      desc: "Crawl 14 platforms for new and trending products in real time.",
    },
    {
      num: 2,
      title: "Signal Detection",
      desc: "Identify demand surges, velocity shifts, and social engagement spikes.",
    },
    {
      num: 3,
      title: "AI Scoring",
      desc: "25 engines score every product on profitability, risk, and timing.",
    },
    {
      num: 4,
      title: "Cluster Analysis",
      desc: "Group similar products and identify category-level trends.",
    },
    {
      num: 5,
      title: "Competitor Intel",
      desc: "Map competitor strategies, pricing, and ad spend patterns.",
    },
    {
      num: 6,
      title: "AI Briefing",
      desc: "Generate actionable reports with buy/skip/watch recommendations.",
    },
    {
      num: 7,
      title: "Alert & Act",
      desc: "Push alerts to your phone and auto-generate listing drafts.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Everything you need to know about a product.
            <br />
            In one place.
          </h2>
        </div>

        {/* Chain steps */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6 md:gap-4">
          {steps.map((step, i) => (
            <div key={step.num} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 text-center">
              {/* Number circle */}
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold shrink-0">
                {step.num}
              </div>
              <div className="md:text-center">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
              {/* Connector line on desktop */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 5 — FEATURE BENTO GRID
   ================================================================ */
function FeatureBentoSection() {
  const features = [
    {
      icon: Radio,
      title: "Trend Radar",
      desc: "Real-time trend detection across TikTok, Amazon, Shopify, and 11 more platforms. See what's rising before the crowd.",
      gradient: "from-blue-500/10 to-indigo-500/10",
      large: true,
    },
    {
      icon: Bell,
      title: "Real-time Alerts",
      desc: "Instant notifications when products hit your scoring thresholds. Never miss a winner.",
      gradient: "from-emerald-500/10 to-teal-500/10",
      large: false,
    },
    {
      icon: Brain,
      title: "25 AI Engines",
      desc: "Ensemble intelligence combining demand forecasting, sentiment analysis, and profitability scoring.",
      gradient: "from-purple-500/10 to-violet-500/10",
      large: false,
    },
    {
      icon: Eye,
      title: "Competitor Monitor",
      desc: "Track competitor product launches, pricing changes, and ad strategies across every platform.",
      gradient: "from-amber-500/10 to-orange-500/10",
      large: false,
    },
    {
      icon: FileText,
      title: "AI Briefings",
      desc: "Automated daily and weekly intelligence reports with actionable product recommendations and market insights.",
      gradient: "from-pink-500/10 to-rose-500/10",
      large: true,
    },
    {
      icon: Zap,
      title: "Pre-Viral Detection",
      desc: "Find products 2-4 weeks before they go viral using predictive signal analysis.",
      gradient: "from-cyan-500/10 to-blue-500/10",
      large: false,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Built for serious ecommerce operators
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Six core capabilities that give you an unfair advantage over your
            competition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={`rounded-2xl border border-gray-200 bg-gradient-to-br ${f.gradient} p-8 hover:shadow-lg transition-shadow ${
                  f.large ? "md:col-span-2" : ""
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-white/80 border border-gray-200 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3
                  className="text-xl font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {f.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 6 — PRE-VIRAL MOAT
   ================================================================ */
function PreViralSection() {
  const stages = [
    {
      label: "Signal Detected",
      week: "Week 1",
      desc: "Early engagement spikes flagged by AI",
      color: "bg-emerald-400",
    },
    {
      label: "Building Momentum",
      week: "Week 2",
      desc: "Cross-platform signals confirm trend",
      color: "bg-blue-400",
    },
    {
      label: "Early Viral",
      week: "Week 3",
      desc: "Exponential growth begins",
      color: "bg-purple-400",
    },
    {
      label: "Mass Viral",
      week: "Week 4+",
      desc: "Everyone else finds it now",
      color: "bg-red-400",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Find products 2-4 weeks before they go viral.
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Our pre-viral detection engine identifies products in their earliest
            growth phase, giving you a head start that competitors can&apos;t match.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Horizontal line */}
          <div className="hidden md:block absolute top-8 left-0 right-0 h-0.5 bg-gray-700" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stages.map((stage, i) => (
              <div key={stage.label} className="relative text-center">
                <div
                  className={`w-16 h-16 mx-auto rounded-full ${stage.color} flex items-center justify-center mb-4 text-white font-bold text-lg`}
                >
                  {i + 1}
                </div>
                <h3 className="font-semibold text-white mb-1">
                  {stage.label}
                </h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  {stage.week}
                </p>
                <p className="text-sm text-gray-400">{stage.desc}</p>
              </div>
            ))}
          </div>

          {/* yousell marker */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="text-sm text-emerald-400 font-semibold">
                yousell detects here
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-sm text-red-400 font-semibold">
                Others find it here
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/dashboard/pre-viral"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--color-brand-400)" }}
          >
            See current pre-viral products
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 7 — PLATFORM COVERAGE
   ================================================================ */
function PlatformCoverageSection() {
  const platforms = [
    { name: "TikTok Shop", track: "Viral products, creator content, ad performance" },
    { name: "Amazon", track: "BSR movements, new arrivals, price shifts" },
    { name: "Shopify Stores", track: "Best-sellers, theme changes, app installs" },
    { name: "Alibaba / 1688", track: "Supplier pricing, MOQ changes, new listings" },
    { name: "AliExpress", track: "Order volume, ratings velocity, shipping times" },
    { name: "eBay", track: "Sell-through rates, listing trends, price gaps" },
    { name: "Etsy", track: "Trending searches, new shop launches, seasonal spikes" },
    { name: "Walmart", track: "Category movers, price undercutting, stock levels" },
    { name: "Pinterest", track: "Pin velocity, board trends, seasonal demand" },
    { name: "Instagram", track: "Hashtag trends, Reel engagement, shop tags" },
    { name: "Google Trends", track: "Search volume shifts, breakout queries" },
    { name: "Facebook Ads", track: "Ad spend patterns, creative trends, audience signals" },
    { name: "Ingram Micro", track: "Wholesale availability, margin opportunities" },
    { name: "CJ Dropshipping", track: "New products, warehousing, shipping speeds" },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Monitoring 14 platforms so you don&apos;t have to
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {platforms.map((p) => (
            <div
              key={p.name}
              className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition"
            >
              <Globe className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{p.track}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 8 — HOW IT WORKS
   ================================================================ */
function HowItWorksSection() {
  const steps = [
    {
      num: "1",
      icon: Layers,
      title: "Connect",
      desc: "Link your store and choose which platforms and categories to monitor. Takes under 5 minutes.",
    },
    {
      num: "2",
      icon: Search,
      title: "Discover",
      desc: "Our 25 AI engines scan 14 platforms around the clock, scoring every product and surfacing the best opportunities.",
    },
    {
      num: "3",
      icon: Target,
      title: "Act",
      desc: "Get real-time alerts, AI briefings, and one-click listing drafts. Move faster than your competition.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                  <Icon className="w-10 h-10 text-indigo-600" />
                </div>
                <div className="text-5xl font-bold text-gray-200 mb-3">
                  {step.num}
                </div>
                <h3
                  className="text-xl font-bold text-gray-900 mb-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 9 — TESTIMONIALS
   ================================================================ */
function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Found 3 winning products in my first week. One of them did \u00A312K in revenue within 14 days. yousell paid for itself on day one.",
      name: "Sarah Chen",
      store: "Shopify Dropshipper",
      city: "London",
    },
    {
      quote:
        "The pre-viral detection is genuinely unreal. I was selling a product two weeks before my competitors even knew it existed.",
      name: "Marcus Williams",
      store: "TikTok Shop Seller",
      city: "Manchester",
    },
    {
      quote:
        "We switched from three separate tools to yousell. The AI briefings alone save our team 15 hours a week on product research.",
      name: "Priya Patel",
      store: "Agency Owner",
      city: "Birmingham",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Loved by operators who take ecommerce seriously
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-8 rounded-2xl border border-gray-200 bg-gray-50 hover:shadow-md transition-shadow"
            >
              <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {t.store} &middot; {t.city}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 10 — COMPETITOR COMPARISON
   ================================================================ */
function ComparisonSection() {
  type CellValue = "yes" | "no" | "partial";

  const features: {
    feature: string;
    yousell: CellValue;
    fastmoss: CellValue;
    junglescout: CellValue;
    triplewhale: CellValue;
    minea: CellValue;
  }[] = [
    { feature: "Pre-viral product detection", yousell: "yes", fastmoss: "no", junglescout: "no", triplewhale: "no", minea: "no" },
    { feature: "25 AI scoring engines", yousell: "yes", fastmoss: "no", junglescout: "partial", triplewhale: "no", minea: "no" },
    { feature: "14-platform monitoring", yousell: "yes", fastmoss: "partial", junglescout: "partial", triplewhale: "no", minea: "partial" },
    { feature: "Real-time trend alerts", yousell: "yes", fastmoss: "partial", junglescout: "yes", triplewhale: "partial", minea: "yes" },
    { feature: "AI-generated briefings", yousell: "yes", fastmoss: "no", junglescout: "no", triplewhale: "no", minea: "no" },
    { feature: "Competitor ad intelligence", yousell: "yes", fastmoss: "yes", junglescout: "no", triplewhale: "yes", minea: "yes" },
    { feature: "One-click listing drafts", yousell: "yes", fastmoss: "no", junglescout: "no", triplewhale: "no", minea: "no" },
  ];

  const renderCell = (val: CellValue) => {
    if (val === "yes")
      return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
    if (val === "no")
      return <X className="w-5 h-5 text-gray-300 mx-auto" />;
    return <Minus className="w-5 h-5 text-amber-400 mx-auto" />;
  };

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            See how yousell compares
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">
                  Feature
                </th>
                <th className="py-4 px-4 font-bold text-indigo-600">yousell</th>
                <th className="py-4 px-4 font-semibold text-gray-500">
                  FastMoss
                </th>
                <th className="py-4 px-4 font-semibold text-gray-500">
                  JungleScout
                </th>
                <th className="py-4 px-4 font-semibold text-gray-500">
                  Triple Whale
                </th>
                <th className="py-4 px-4 font-semibold text-gray-500">
                  Minea
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((row) => (
                <tr
                  key={row.feature}
                  className="border-b border-gray-100 hover:bg-gray-100/50 transition"
                >
                  <td className="py-4 px-4 text-gray-700">{row.feature}</td>
                  <td className="py-4 px-4">{renderCell(row.yousell)}</td>
                  <td className="py-4 px-4">{renderCell(row.fastmoss)}</td>
                  <td className="py-4 px-4">{renderCell(row.junglescout)}</td>
                  <td className="py-4 px-4">{renderCell(row.triplewhale)}</td>
                  <td className="py-4 px-4">{renderCell(row.minea)}</td>
                </tr>
              ))}
              {/* Price row */}
              <tr className="bg-indigo-50/50">
                <td className="py-4 px-4 font-semibold text-gray-900">
                  Starting price
                </td>
                <td className="py-4 px-4 text-center font-bold text-indigo-600">
                  &pound;49/mo
                </td>
                <td className="py-4 px-4 text-center text-gray-500">
                  $79/mo
                </td>
                <td className="py-4 px-4 text-center text-gray-500">
                  $49/mo
                </td>
                <td className="py-4 px-4 text-center text-gray-500">
                  $129/mo
                </td>
                <td className="py-4 px-4 text-center text-gray-500">
                  $49/mo
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 11 — PRICING PREVIEW
   ================================================================ */
function PricingPreviewSection() {
  const tiers = [
    {
      name: "Starter",
      price: "\u00A349",
      desc: "For solo operators getting started with product research.",
      features: [
        "5 AI engines",
        "3 platform sources",
        "Daily trend alerts",
        "Basic AI briefings",
      ],
      highlighted: false,
    },
    {
      name: "Pro",
      price: "\u00A3149",
      desc: "For serious sellers who want every competitive advantage.",
      features: [
        "25 AI engines",
        "14 platform sources",
        "Real-time alerts",
        "Full AI briefings",
        "Pre-viral detection",
        "Competitor monitoring",
      ],
      highlighted: true,
    },
    {
      name: "Agency",
      price: "\u00A3499",
      desc: "For agencies and teams managing multiple stores.",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "White-label reports",
        "API access",
        "Dedicated account manager",
        "Custom integrations",
      ],
      highlighted: false,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Simple, transparent pricing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 border-2 ${
                tier.highlighted
                  ? "border-indigo-500 shadow-xl relative"
                  : "border-gray-200"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-white text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <h3
                className="text-xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {tier.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {tier.price}
                </span>
                <span className="text-gray-500">/mo</span>
              </div>
              <p className="text-sm text-gray-600 mb-6">{tier.desc}</p>
              <ul className="space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className={`block text-center py-3 rounded-xl font-semibold transition ${
                  tier.highlighted
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition"
          >
            See full pricing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   SECTION 12 — FINAL CTA
   ================================================================ */
function FinalCtaSection() {
  return (
    <section className="py-20 md:py-28 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2
          className="text-3xl md:text-5xl font-bold mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Start discovering winning products today.
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          Join 60,000+ ecommerce operators who use yousell to find, validate,
          and launch products faster than the competition.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
            style={{ backgroundColor: "var(--color-brand-400)" }}
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-gray-600 text-gray-300 font-semibold text-lg hover:border-gray-400 hover:text-white transition-all"
          >
            Book a demo
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          No credit card required &middot; 5 min setup &middot; Cancel anytime
        </p>
      </div>
    </section>
  );
}

/* ================================================================
   COMPONENT — Marketing Homepage
   ================================================================ */
export default function MarketingHomepage() {
  return (
    <>
      <HeroSection />
      <SocialProofSection />
      <ProblemSection />
      <IntelligenceChainSection />
      <FeatureBentoSection />
      <PreViralSection />
      <PlatformCoverageSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <ComparisonSection />
      <PricingPreviewSection />
      <FinalCtaSection />
    </>
  );
}
