"use client";

import { useState } from "react";
import Link from "next/link";

/* ─────────────────────── data ─────────────────────── */

const tiers = [
  {
    name: "Starter",
    monthly: 49,
    annual: 39,
    description: "For solo sellers getting started with product research.",
    cta: "Start free trial",
    features: [
      "Trend Radar — 5 searches/day",
      "Basic AI Briefing (daily digest)",
      "3 tracked products",
      "Community support",
      "CSV export",
      "1 user seat",
    ],
  },
  {
    name: "Pro",
    monthly: 149,
    annual: 119,
    popular: true,
    description:
      "For growing operators who need deep intelligence and automation.",
    cta: "Start free trial",
    features: [
      "Trend Radar — unlimited searches",
      "Full AI Briefings + natural language Q&A",
      "25 AI Agents (Governor orchestrated)",
      "Pricing Intelligence dashboard",
      "Demand Forecasting with confidence bands",
      "50 tracked products",
      "External Engine API access",
      "Priority support",
      "Team collaboration (3 seats)",
      "Slack & webhook integrations",
    ],
  },
  {
    name: "Agency",
    monthly: 499,
    annual: 399,
    description:
      "For agencies and power sellers managing multiple brands at scale.",
    cta: "Contact sales",
    features: [
      "Everything in Pro",
      "Unlimited AI Agent runs",
      "White-label reports",
      "Unlimited tracked products",
      "Dedicated account manager",
      "Custom integrations & API",
      "SSO & advanced security",
      "10 user seats (expandable)",
      "SLA guarantee (99.9% uptime)",
      "Onboarding & training sessions",
    ],
  },
];

const comparisonFeatures: {
  name: string;
  starter: boolean;
  pro: boolean;
  agency: boolean;
}[] = [
  { name: "Trend Radar product discovery", starter: true, pro: true, agency: true },
  { name: "AI Briefings (daily digest)", starter: true, pro: true, agency: true },
  { name: "CSV data export", starter: true, pro: true, agency: true },
  { name: "Natural language Q&A", starter: false, pro: true, agency: true },
  { name: "AI Agents (Governor orchestrated)", starter: false, pro: true, agency: true },
  { name: "External Engine API adapter", starter: false, pro: true, agency: true },
  { name: "Pricing Intelligence dashboard", starter: false, pro: true, agency: true },
  { name: "Demand Forecasting", starter: false, pro: true, agency: true },
  { name: "Restock alerts", starter: false, pro: true, agency: true },
  { name: "Slack & webhook integrations", starter: false, pro: true, agency: true },
  { name: "Team collaboration", starter: false, pro: true, agency: true },
  { name: "White-label reports", starter: false, pro: false, agency: true },
  { name: "Custom integrations & API", starter: false, pro: false, agency: true },
  { name: "SSO & advanced security", starter: false, pro: false, agency: true },
  { name: "Dedicated account manager", starter: false, pro: false, agency: true },
];

const faqs = [
  {
    q: "How does the pricing model work?",
    a: "All plans are billed per-workspace on a monthly or annual basis. Annual billing saves you 20%. You can upgrade, downgrade, or cancel at any time from your account settings.",
  },
  {
    q: "How does YouSell compare to competitors?",
    a: "YouSell is the only platform that combines real-time trend scanning across 14+ platforms, 25 orchestrated AI agents, and dynamic pricing intelligence in a single dashboard. Most competitors offer only one of these capabilities.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! Every plan includes a 14-day free trial with full access to all features in your selected tier. No credit card required to start.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. There are no long-term contracts. You can cancel your subscription at any time from your account settings and you will retain access until the end of your current billing period.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and bank transfers for annual Agency plans. All payments are processed securely through Stripe.",
  },
  {
    q: "Do you offer enterprise or custom plans?",
    a: "Yes. For teams larger than 10 or with custom requirements, contact our sales team for a tailored plan with volume discounts, dedicated infrastructure, and bespoke SLAs.",
  },
];

/* ─────────────────────── component ─────────────────────── */

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [sliderValue, setSliderValue] = useState(1000);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const paybackDays = (tier: "starter" | "pro" | "agency") => {
    const price = annual
      ? tier === "starter"
        ? 39
        : tier === "pro"
        ? 119
        : 399
      : tier === "starter"
      ? 49
      : tier === "pro"
      ? 149
      : 499;
    return Math.max(1, Math.ceil((price / sliderValue) * 30));
  };

  return (
    <div className="bg-[var(--surface-base)]">
      {/* ── Hero ── */}
      <section className="aurora-bg py-24 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <h1
            className="text-5xl font-bold leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-brand-200">
            Start free for 14 days. No credit card required. Scale as you grow.
          </p>

          {/* toggle */}
          <div className="mt-10 inline-flex items-center gap-4 rounded-full border border-brand-600 bg-brand-800/60 px-2 py-1">
            <span
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition ${
                !annual ? "bg-brand-400 text-white" : "text-brand-300"
              }`}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </span>
            <span
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition ${
                annual ? "bg-brand-400 text-white" : "text-brand-300"
              }`}
              onClick={() => setAnnual(true)}
            >
              Annual{" "}
              <span className="ml-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                Save 20%
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* ── Tier Cards ── */}
      <section className="-mt-16 relative z-10 mx-auto max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => {
            const price = annual ? tier.annual : tier.monthly;
            return (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all ${
                  tier.popular
                    ? "mesh-gradient-pro border-brand-400/50 bg-brand-800 shadow-ai-glow scale-[1.03]"
                    : "border-surface-border bg-[var(--surface-card)] shadow-card"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-400 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3
                  className={`text-xl font-semibold ${
                    tier.popular ? "text-white" : "text-brand-900"
                  }`}
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-end gap-1">
                  <span
                    className={`text-4xl font-bold ${
                      tier.popular ? "text-white" : "text-brand-900"
                    }`}
                  >
                    &pound;{price}
                  </span>
                  <span
                    className={`mb-1 text-sm ${
                      tier.popular ? "text-brand-200" : "text-neutral"
                    }`}
                  >
                    /mo
                  </span>
                </div>
                {annual && (
                  <p className="mt-1 text-xs text-green-500">
                    &pound;{tier.monthly}/mo if billed monthly
                  </p>
                )}
                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    tier.popular ? "text-brand-200" : "text-neutral"
                  }`}
                >
                  {tier.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className={`flex items-start gap-2 text-sm ${
                        tier.popular ? "text-brand-100" : "text-brand-700"
                      }`}
                    >
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.name === "Agency" ? "/contact" : "/signup"}
                  className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition ${
                    tier.popular
                      ? "bg-white text-brand-900 hover:bg-brand-050"
                      : "bg-brand-400 text-white hover:bg-brand-500"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Feature Comparison Table ── */}
      <section className="mx-auto mt-24 max-w-5xl px-6">
        <h2
          className="text-center text-3xl font-bold text-brand-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Compare plans in detail
        </h2>
        <div className="mt-10 overflow-x-auto rounded-xl border border-surface-border bg-[var(--surface-card)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border bg-[var(--surface-elevated)]">
                <th className="px-6 py-4 font-semibold text-brand-900">
                  Feature
                </th>
                <th className="px-6 py-4 text-center font-semibold text-brand-900">
                  Starter
                </th>
                <th className="px-6 py-4 text-center font-semibold text-brand-400">
                  Pro
                </th>
                <th className="px-6 py-4 text-center font-semibold text-brand-900">
                  Agency
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((f, i) => (
                <tr
                  key={f.name}
                  className={
                    i % 2 === 0 ? "" : "bg-[var(--surface-elevated)]/40"
                  }
                >
                  <td className="px-6 py-3 text-brand-700">{f.name}</td>
                  {(["starter", "pro", "agency"] as const).map((t) => (
                    <td key={t} className="px-6 py-3 text-center">
                      {f[t] ? (
                        <svg
                          className="mx-auto h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="mx-auto h-5 w-5 text-neutral/40"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── ROI Calculator ── */}
      <section className="mx-auto mt-24 max-w-2xl px-6 text-center">
        <h2
          className="text-3xl font-bold text-brand-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          How much is one winning product worth?
        </h2>
        <p className="mt-2 text-neutral">
          Drag the slider to see how quickly YouSell pays for itself.
        </p>
        <div className="mt-8 rounded-2xl border border-surface-border bg-[var(--surface-card)] p-8 shadow-card">
          <label className="block text-sm font-medium text-brand-700">
            Estimated profit per winning product
          </label>
          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="mt-4 w-full accent-brand-400"
          />
          <div className="mt-2 flex justify-between text-xs text-neutral">
            <span>&pound;100</span>
            <span className="font-semibold text-brand-900 text-lg">
              &pound;{sliderValue.toLocaleString()}
            </span>
            <span>&pound;10,000</span>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            {(["starter", "pro", "agency"] as const).map((t, i) => (
              <div
                key={t}
                className="rounded-xl border border-surface-border bg-[var(--surface-elevated)] p-4"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-neutral">
                  {tiers[i].name}
                </p>
                <p className="mt-1 text-2xl font-bold text-brand-400">
                  {paybackDays(t)} days
                </p>
                <p className="text-xs text-neutral">to pay for itself</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="mx-auto mt-24 max-w-3xl px-6 pb-24">
        <h2
          className="text-center text-3xl font-bold text-brand-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Frequently asked questions
        </h2>
        <div className="mt-10 space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-surface-border bg-[var(--surface-card)] transition"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-brand-900"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {faq.q}
                <svg
                  className={`h-5 w-5 flex-shrink-0 text-neutral transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-sm leading-relaxed text-neutral">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Social Proof ── */}
        <div className="mt-16 text-center">
          <p className="text-sm font-medium text-neutral">
            Trusted by operators worldwide
          </p>
          <p
            className="mt-2 text-2xl font-bold text-brand-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Join 60,000+ operators already using YouSell
          </p>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-xl bg-brand-400 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-500"
          >
            Start your free trial
          </Link>
        </div>
      </section>
    </div>
  );
}
