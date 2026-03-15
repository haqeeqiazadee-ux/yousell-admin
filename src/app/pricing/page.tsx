import Link from "next/link";
import { Check, ArrowRight, Zap, TrendingUp, Users, Shield } from "lucide-react";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    description: "Perfect for getting started with product discovery on one platform.",
    features: [
      "1 platform (TikTok, Amazon, or Shopify)",
      "3 products per platform",
      "Product discovery engine",
      "Score-based product ranking",
      "Basic trend insights",
      "Email support",
    ],
    cta: "Start Discovering",
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    description: "Scale across platforms with analytics and AI content generation.",
    features: [
      "3 platforms",
      "10 products per platform",
      "Product discovery engine",
      "Analytics & profit tracking",
      "AI content creation engine",
      "Trend velocity alerts",
      "Priority support",
    ],
    popular: true,
    cta: "Start Growing",
  },
  {
    id: "professional",
    name: "Professional",
    price: 149,
    description: "Full intelligence suite with influencer matching and supplier sourcing.",
    features: [
      "5 platforms",
      "25 products per platform",
      "All Growth features",
      "Influencer outreach engine",
      "Supplier intelligence engine",
      "Marketing & ads engine",
      "Launch blueprint generation",
      "Financial modeling",
    ],
    cta: "Go Professional",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 299,
    description: "Everything included. Push to store, affiliate tracking, and API access.",
    features: [
      "All platforms",
      "50 products per platform",
      "All Professional features",
      "Store integration (Shopify, TikTok, Amazon)",
      "AI affiliate revenue engine",
      "Dedicated account manager",
      "API access",
      "Custom integrations",
    ],
    cta: "Go Enterprise",
  },
];

const highlights = [
  {
    icon: Zap,
    title: "AI-Powered Discovery",
    description: "Detect trending products 2-3 weeks before mainstream adoption across 7 channels.",
  },
  {
    icon: TrendingUp,
    title: "3-Pillar Scoring",
    description: "Every product scored on Trend, Viral, and Profit potential for data-driven decisions.",
  },
  {
    icon: Users,
    title: "Influencer Matching",
    description: "Automatically match products with influencers based on niche, engagement, and price fit.",
  },
  {
    icon: Shield,
    title: "Full Automation",
    description: "Content creation, store integration, and marketing — all on autopilot.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm">
              YS
            </div>
            <span className="text-lg font-bold tracking-tight">
              You<span className="text-red-500">|</span>Sell
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            From solo operators to full commerce teams — pick the plan that fits your scale.
          </p>
          <p className="text-sm text-gray-500">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${
                  plan.popular
                    ? "border-blue-500 shadow-lg shadow-blue-100"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium text-sm transition-colors ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Highlights */}
      <section className="py-16 bg-white border-t">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Why teams choose YouSell
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {highlights.map((h) => (
              <div key={h.title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <h.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{h.title}</h3>
                <p className="text-sm text-gray-500">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I switch plans anytime?",
                a: "Yes. Upgrade or downgrade at any time from your billing dashboard. Changes take effect immediately with prorated billing.",
              },
              {
                q: "What happens when I cancel?",
                a: "You keep access until the end of your billing period. No data is deleted — you can reactivate anytime.",
              },
              {
                q: "Do I need technical skills?",
                a: "Not at all. YouSell handles the discovery, scoring, and automation. You just review recommendations and approve actions.",
              },
              {
                q: "How does the product scoring work?",
                a: "Every product is scored on three pillars: Trend (market timing), Viral (social buzz potential), and Profit (margin viability). The final score combines all three with weighted averages.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-1">{faq.q}</h3>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-sm text-gray-500">
            YouSell — AI-Powered Commerce Intelligence Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
