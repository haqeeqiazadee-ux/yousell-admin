"use client";

import Link from "next/link";

/* ─────────────────────── data ─────────────────────── */

const steps = [
  {
    num: "01",
    title: "Collect",
    description:
      "Demand Forecasting ingests your historical sales data, seasonal patterns, competitor activity, and macro-economic signals into a unified model.",
  },
  {
    num: "02",
    title: "Predict",
    description:
      "Machine learning models generate demand forecasts with confidence bands — see best-case, expected, and worst-case scenarios for every SKU.",
  },
  {
    num: "03",
    title: "Act",
    description:
      "Receive automated restock alerts before you run out. Optimise inventory levels to minimise holding costs while preventing stockouts.",
  },
];

const metrics = [
  { value: "91%", label: "Forecast accuracy (30-day)" },
  { value: "34%", label: "Reduction in stockouts" },
  { value: "22%", label: "Lower holding costs" },
  { value: "< 2min", label: "Forecast generation time" },
];

const relatedFeatures = [
  {
    slug: "pricing-intelligence",
    title: "Pricing Intelligence",
    description:
      "Pair demand forecasts with dynamic pricing to maximise revenue at every inventory level.",
  },
  {
    slug: "trend-radar",
    title: "Trend Radar",
    description:
      "Spot trending products early, then forecast demand before committing to inventory.",
  },
  {
    slug: "ai-briefings",
    title: "AI Briefings",
    description:
      "Daily briefings include demand alerts and restock recommendations for your attention.",
  },
];

/* ─────────────────────── component ─────────────────────── */

export default function DemandForecastingPage() {
  return (
    <div className="bg-[var(--surface-base)]">
      {/* ── Hero ── */}
      <section className="aurora-bg py-24 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
          </div>
          <h1
            className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Demand Forecasting
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-200">
            Predict future demand with confidence bands so you never over-order
            or sell out. Get automated restock alerts and inventory optimisation
            powered by machine learning.
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
            Product screenshot — Demand Forecasting confidence bands
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
          Start using Demand Forecasting today
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
