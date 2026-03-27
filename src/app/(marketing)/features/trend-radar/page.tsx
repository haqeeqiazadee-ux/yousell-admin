"use client";

import Link from "next/link";

/* ─────────────────────── data ─────────────────────── */

const steps = [
  {
    num: "01",
    title: "Scan",
    description:
      "Trend Radar continuously monitors 14+ platforms including TikTok, Amazon Movers & Shakers, AliExpress, Google Trends, and more in real time.",
  },
  {
    num: "02",
    title: "Score",
    description:
      "Each product is scored using momentum velocity, search volume growth, competition density, and profit margin potential to surface only the best opportunities.",
  },
  {
    num: "03",
    title: "Alert",
    description:
      "Get instant alerts via email, Slack, or in-app when a product breaks through your custom threshold. Act before the market catches up.",
  },
];

const metrics = [
  { value: "14+", label: "Platforms scanned" },
  { value: "2.4M", label: "Products analysed daily" },
  { value: "< 30s", label: "Average scan time" },
  { value: "87%", label: "Accuracy on trend prediction" },
];

const relatedFeatures = [
  {
    slug: "ai-agents",
    title: "AI Agents",
    description:
      "Let 25 specialised AI engines deep-dive into the trends Radar surfaces.",
  },
  {
    slug: "demand-forecasting",
    title: "Demand Forecasting",
    description:
      "Predict demand trajectories for products discovered via Trend Radar.",
  },
  {
    slug: "ai-briefings",
    title: "AI Briefings",
    description:
      "Get a daily summary of the most promising trends and recommended actions.",
  },
];

/* ─────────────────────── component ─────────────────────── */

export default function TrendRadarPage() {
  return (
    <div className="bg-[var(--surface-base)]">
      {/* ── Hero ── */}
      <section className="aurora-bg py-24 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            </div>
          </div>
          <h1
            className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Trend Radar
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-200">
            Discover winning products before they go mainstream. Trend Radar
            scans 14+ platforms in real time, scores every product on momentum
            and margin potential, and alerts you the moment opportunity strikes.
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
            Product screenshot — Trend Radar dashboard
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
          Start using Trend Radar today
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
