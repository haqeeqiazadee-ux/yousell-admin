"use client";

import Link from "next/link";

/* ─────────────────────── data ─────────────────────── */

const steps = [
  {
    num: "01",
    title: "Aggregate",
    description:
      "AI Briefings pull data from every YouSell module — Trend Radar, AI Agents, Pricing Intelligence, and Demand Forecasting — into a single knowledge layer.",
  },
  {
    num: "02",
    title: "Synthesise",
    description:
      "Natural language AI transforms complex data into concise, human-readable insights. No dashboards to decipher — just clear answers and recommendations.",
  },
  {
    num: "03",
    title: "Deliver",
    description:
      "Receive your daily briefing in-app, via email, or in Slack. Each briefing includes prioritised action items so you know exactly what to do next.",
  },
];

const metrics = [
  { value: "6:30 AM", label: "Daily briefing delivery" },
  { value: "< 2min", label: "Average read time" },
  { value: "5+", label: "Actionable insights per report" },
  { value: "93%", label: "Users act on briefing insights" },
];

const relatedFeatures = [
  {
    slug: "ai-agents",
    title: "AI Agents",
    description:
      "Agent outputs feed directly into briefings for a complete daily intelligence summary.",
  },
  {
    slug: "trend-radar",
    title: "Trend Radar",
    description:
      "Briefings highlight the day's most promising trends discovered by Trend Radar.",
  },
  {
    slug: "demand-forecasting",
    title: "Demand Forecasting",
    description:
      "Get restock alerts and demand shifts summarised in every morning briefing.",
  },
];

/* ─────────────────────── component ─────────────────────── */

export default function AIBriefingsPage() {
  return (
    <div className="bg-[var(--surface-base)]">
      {/* ── Hero ── */}
      <section className="aurora-bg py-24 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          </div>
          <h1
            className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            AI Briefings
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-brand-200">
            Start every day with a concise, AI-generated intelligence report.
            Natural language synthesis turns raw data from across your entire
            operation into actionable insights you can act on in minutes.
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
            Product screenshot — AI Briefing daily report
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
          Start using AI Briefings today
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
