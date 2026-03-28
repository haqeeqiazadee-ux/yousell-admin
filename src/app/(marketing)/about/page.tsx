import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Linkedin, Twitter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About YouSell',
  description: 'Meet the team behind YouSell...',
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const team = [
  {
    name: 'Alex Chen',
    role: 'Founder & CEO',
    bio: 'Former dropshipper turned data nerd. Built yousell after losing $40K guessing which products to sell.',
    avatar: 'AC',
  },
  {
    name: 'Priya Sharma',
    role: 'CTO',
    bio: 'Ex-Amazon engineer. Obsessed with real-time data pipelines and making complex systems feel simple.',
    avatar: 'PS',
  },
  {
    name: 'James Okafor',
    role: 'Head of AI',
    bio: 'PhD in ML from Imperial. Previously built recommendation engines at a FTSE 100 retailer.',
    avatar: 'JO',
  },
  {
    name: 'Sarah Kim',
    role: 'Head of Product',
    bio: 'Product leader from Shopify. Passionate about giving indie sellers the tools that big brands take for granted.',
    avatar: 'SK',
  },
];

const stats = [
  { label: 'Operators using yousell', value: '60K+' },
  { label: 'Platforms tracked', value: '14' },
  { label: 'Intelligence engines', value: '25' },
  { label: 'GMV tracked', value: '\u00a355B' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
            We built the tool we wished existed when we were dropshipping.
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Our Story</h2>
        <div className="space-y-6 text-gray-600 leading-relaxed text-base">
          <p>
            yousell started in 2023, born from frustration. Our founder was running a 6-figure
            dropshipping operation across Shopify and TikTok Shop and spending more time on
            spreadsheets than actually selling. Every decision — what to source, when to reorder,
            which creator to partner with — required stitching data from five different dashboards.
          </p>
          <p>
            So we built a prototype. One screen that pulled product performance, competitor pricing,
            supplier costs, and trend velocity into a single view. Within weeks, friends in the
            ecommerce space were asking for access. Within months, we had hundreds of operators
            relying on it daily to make faster, smarter decisions.
          </p>
          <p>
            Today, yousell is the intelligence layer for ecommerce operators worldwide. We track
            14 platforms, run 25 AI-powered engines, and process billions of data points every day
            — all so you can stop guessing and start knowing.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Meet the Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((person) => (
              <div
                key={person.name}
                className="rounded-xl border border-gray-200 bg-white p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xl font-bold">
                  {person.avatar}
                </div>
                <h3 className="text-base font-semibold text-gray-900">{person.name}</h3>
                <p className="text-sm text-rose-600 font-medium">{person.role}</p>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{person.bio}</p>
                <div className="mt-4 flex justify-center gap-3">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Linkedin className="h-4 w-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Twitter className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-4xl px-6 py-16 lg:py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
        <blockquote className="text-xl sm:text-2xl text-gray-700 font-medium leading-relaxed italic">
          &ldquo;To give every ecommerce operator access to intelligence that was once
          reserved for billion-dollar brands — in real time, across every platform,
          powered by AI.&rdquo;
        </blockquote>
      </section>

      {/* Numbers */}
      <section className="bg-gray-900 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-2xl font-bold text-white mb-12">yousell by the Numbers</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-rose-400">{stat.value}</div>
                <div className="mt-2 text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 text-center">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold text-gray-900">Ready to join 60K+ operators?</h2>
          <p className="mt-3 text-gray-600">Start discovering winning products today.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              See a Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
