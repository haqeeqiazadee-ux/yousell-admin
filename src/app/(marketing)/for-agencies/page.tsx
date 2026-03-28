import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Users, Code2, LayoutDashboard, Shield, Globe, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'YouSell for Agencies',
  description: 'One platform for every client. White-label intelligence for ecommerce agencies.',
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const benefits = [
  {
    icon: Users,
    title: 'Multi-Client Management',
    description:
      'Manage all your ecommerce clients from a single workspace. Switch between accounts instantly with unified analytics across every brand.',
  },
  {
    icon: Shield,
    title: 'White-Label Reports',
    description:
      'Generate beautiful, branded reports with your agency logo. Export PDFs or share live dashboards with clients — your brand, your data.',
  },
  {
    icon: Code2,
    title: 'Full API Access',
    description:
      'Build custom integrations, automate workflows, and pipe yousell data into your own tools. REST + webhook support included.',
  },
];

const features = [
  { label: 'Client Workspace Switching', description: 'One login, unlimited client accounts with role-based access control.' },
  { label: 'White-Label Dashboard', description: 'Custom branding, logo, and domain for client-facing analytics portals.' },
  { label: 'REST API + Webhooks', description: 'Full API access for custom integrations with your existing tech stack.' },
  { label: 'Bulk Product Research', description: 'Research products across all clients simultaneously with shared intelligence.' },
  { label: 'Automated Reporting', description: 'Schedule weekly and monthly reports delivered to client inboxes automatically.' },
  { label: 'Team Seats & Permissions', description: 'Add team members with granular permissions per client and feature.' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ForAgenciesPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 to-white py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-sm font-medium text-rose-700 mb-6">
            For Agencies
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-tight">
            One platform. Every client. Total intelligence.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            yousell gives ecommerce agencies multi-client management, white-label reporting,
            and full API access — so you can deliver world-class product intelligence at scale.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700 transition-colors"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-xl border border-gray-200 bg-white p-8 hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <b.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">{b.title}</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{b.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Built for agencies that manage ecommerce brands
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.label} className="rounded-lg bg-white p-6 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900">{f.label}</h4>
                <p className="mt-2 text-sm text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="mx-auto max-w-3xl px-6 py-16 lg:py-24 text-center">
        <blockquote className="text-xl text-gray-700 font-medium leading-relaxed italic">
          &ldquo;We manage 14 ecommerce brands. Before yousell, we had 14 sets of spreadsheets.
          Now we have one dashboard with white-label reports that clients actually love.
          It&apos;s a game changer for retention.&rdquo;
        </blockquote>
        <div className="mt-6">
          <p className="font-semibold text-gray-900">Dan W.</p>
          <p className="text-sm text-gray-500">Managing Director, Ecom Growth Agency</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-rose-600 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white">Scale your agency with yousell</h2>
          <p className="mt-3 text-rose-100">Multi-client intelligence, white-label reports, and API access — all included.</p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
