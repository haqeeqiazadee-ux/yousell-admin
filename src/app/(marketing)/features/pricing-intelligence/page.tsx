"use client";

import Link from "next/link";

/* ─────────────────────── data ─────────────────────── */

const steps = [
  {
    num: "01",
    title: "Monitor",
    description:
      "Automatically track competitor prices across Amazon, eBay, Shopify stores, and more. Pricing Intelligence captures every change in real time.",
  },
  {
    num: "02",
    title: "Analyse",
    description:
      "Our elasticity engine models how price changes affect demand. See price-volume curves, margin sweet spots, and competitor positioning maps.",
  },
  {
    num: "03",
    title: "Optimise",
    description:
      "Receive dynamic pricing suggestions backed by data. Apply recommended prices manually or set rules for automated adjustments within your guardrails.",
  },
];

const metrics = [
  { value: "12%", label: "Avg. margin improvement" },
  { value: "50K+", label: "Competitor prices tracked" },
  { value: "Real-time", label: "Price change detection" },
  { value: "98.5%", label: "Data accuracy rate" },
];

const relatedFeatures = [
  {
    slug: "trend-radar",
    title: "Trend Radar",
    description:
      "Discover trending products, then use Pricing Intelligence to find the optimal entry price.",
  },
  {
    slug: "demand-forecasting",
    title: "Demand Forecasting",
    description:
      "Combine pricing data with demand predictions to maximise revenue per unit.",
  },
  {
    slug: "ai-agents",
    title: "AI Agents",
    description:
      "Deploy pricing agents that automatically monitor and recommend price adjustments.",
  },
];

/* ─────────────────────── component ─────────────────────── */

export default function PricingIntelligencePage() {
  return (
    <div className="bg-[var(--surface-base)]">
      {/* ── Hero ── */}
      <section className="aurora-bg py-24 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
          </div>
          <h1
            className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Pricing Intelligence
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-200">
            Monitor competitor prices across every marketplace in real time. Get
            dynamic pricing suggestions powered by elasticity analysis so you
            always hit the margin sweet spot.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-050"
            >
              Start free trial
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See it in action
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24">
        <h2
          className="text-center text-3xl font-bold text-brand-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          How it works
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-050 text-lg font-bold text-brand-400">
                {s.num}
              </div>
              <h3
                className="mt-4 text-xl font-semibold text-brand-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Screenshot Placeholder ── */}
      <section className="mx-auto max-w-5xl px-6">
        <div className="flex h-[400px] items-center justify-center rounded-2xl border border-surface-border bg-[var(--surface-elevated)]">
          <p className="text-sm text-neutral">
            Product screenshot — Pricing Intelligence dashboard
          </p>
        </div>
      </section>

      {/* ── Metrics ── */}
      <section className="mx-auto max-w-5xl px-6 py-24">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="text-center">
              <p
                className="text-3xl font-bold text-brand-400"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {m.value}
              </p>
              <p className="mt-1 text-sm text-neutral">{m.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-neutral">
          Trusted by <span className="font-semibold text-brand-900">60,000+ operators</span> worldwide
        </p>
      </section>

      {/* ── Related Features ── */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2
          className="text-center text-3xl font-bold text-brand-900"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Related features
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {relatedFeatures.map((f) => (
            <Link
              key={f.slug}
              href={`/features/${f.slug}`}
              className="group rounded-2xl border border-surface-border bg-[var(--surface-card)] p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-elevated"
            >
              <h3
                className="text-lg font-semibold text-brand-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-neutral">{f.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-400 transition group-hover:gap-2">
                Learn more
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="aurora-bg py-20 text-center text-white">
        <h2
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Start using Pricing Intelligence today
        </h2>
        <p className="mt-3 text-brand-200">
          14-day free trial. No credit card required.
        </p>
        <Link
          href="/signup"
          className="mt-8 inline-block rounded-xl bg-white px-8 py-3 text-sm font-semibold text-brand-900 transition hover:bg-brand-050"
        >
          Start free trial
        </Link>
      </section>
    </div>
  );
}
