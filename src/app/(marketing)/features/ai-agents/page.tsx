"use client";

import Link from "next/link";

/* ─────────────────────── data ─────────────────────── */

const steps = [
  {
    num: "01",
    title: "Deploy",
    description:
      "Choose from 25 specialised AI engines — competitor watchers, listing optimisers, review analysts, ad copy generators, and more. Activate them with one click.",
  },
  {
    num: "02",
    title: "Orchestrate",
    description:
      "The Governor coordinates all active agents, routes tasks intelligently, manages priorities, and prevents conflicts. External engines connect via the API adapter.",
  },
  {
    num: "03",
    title: "Deliver",
    description:
      "Agents produce actionable outputs: optimised listings, competitive reports, pricing recommendations, and automated workflows — all in your dashboard.",
  },
];

const metrics = [
  { value: "25", label: "Specialised AI engines" },
  { value: "1", label: "Governor orchestrator" },
  { value: "340hrs", label: "Avg. time saved per month" },
  { value: "94%", label: "Task completion rate" },
];

const relatedFeatures = [
  {
    slug: "trend-radar",
    title: "Trend Radar",
    description:
      "Feed trending products directly into AI Agents for automated deep-dive analysis.",
  },
  {
    slug: "pricing-intelligence",
    title: "Pricing Intelligence",
    description:
      "Agents leverage pricing data to generate optimal price-point recommendations.",
  },
  {
    slug: "ai-briefings",
    title: "AI Briefings",
    description:
      "Agent outputs are synthesised into daily briefings so you never miss a key insight.",
  },
];

/* ─────────────────────── component ─────────────────────── */

export default function AIAgentsPage() {
  return (
    <div className="bg-[var(--surface-base)]">
      {/* ── Hero ── */}
      <section className="aurora-bg py-24 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
          </div>
          <h1
            className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            AI Agents
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-200">
            25 specialised AI engines, one Governor orchestrator. From competitor
            analysis to listing optimisation, your AI workforce operates
            autonomously around the clock — including external engines connected
            via the API adapter.
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
            Product screenshot — AI Agents Governor dashboard
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
          Start using AI Agents today
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
