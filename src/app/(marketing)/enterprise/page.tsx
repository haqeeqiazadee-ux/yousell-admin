import type { Metadata } from 'next';
import { Shield, Zap, Users, HeadphonesIcon, Lock, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Enterprise',
  description: 'YouSell Enterprise — custom intelligence infrastructure for large ecommerce operators, agencies, and marketplaces.',
};

const features = [
  {
    icon: Shield,
    title: 'Custom SLA & Uptime',
    description: '99.9% uptime guarantee with dedicated infrastructure. Custom SLAs available for mission-critical deployments.',
  },
  {
    icon: Users,
    title: 'Unlimited Seats',
    description: 'No per-seat limits. Roll out to your entire team, agency, or portfolio — one flat fee.',
  },
  {
    icon: Lock,
    title: 'SSO & SAML',
    description: 'Enterprise-grade authentication with SSO, SAML 2.0, and SCIM provisioning. Works with Okta, Azure AD, and Google Workspace.',
  },
  {
    icon: Zap,
    title: 'Custom Integrations',
    description: 'Direct integrations with your ERP, WMS, or proprietary systems via our Enterprise API and dedicated integration support.',
  },
  {
    icon: BarChart3,
    title: 'White-Label Reports',
    description: 'Generate branded intelligence reports for your clients. Custom logo, colours, and domain.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Dedicated Account Manager',
    description: 'A named account manager who knows your business. Quarterly business reviews, onboarding sessions, and priority escalation.',
  },
];

const testimonials = [
  {
    quote: "We manage intelligence for 47 brand clients. yousell Enterprise replaced 3 separate tools and gave us a unified data layer we couldn't build ourselves.",
    name: 'Oliver T.',
    role: 'Director of Growth, Apex Commerce Agency',
  },
  {
    quote: "The white-label reports alone pay for the Enterprise plan 10x over. Our clients think we have a proprietary intelligence platform — we do, it's yousell.",
    name: 'Sarah M.',
    role: 'CEO, Meridian Ecommerce Group',
  },
];

export default function EnterprisePage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-20 lg:py-28 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 mb-6">
            Enterprise
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Intelligence infrastructure<br />for serious operators
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
            YouSell Enterprise gives large teams, agencies, and marketplace operators
            the custom infrastructure, integrations, and support they need to run at scale.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <a
              href="mailto:enterprise@yousell.online"
              className="bg-white text-slate-900 font-semibold px-6 py-3 rounded-lg hover:bg-slate-100 transition text-sm"
            >
              Talk to sales
            </a>
            <a
              href="/demo"
              className="border border-white/30 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition text-sm"
            >
              See a demo
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-16 lg:py-20">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          Everything in Agency, plus
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-slate-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-slate-50 border-t border-slate-100 py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Trusted by leading agencies
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <blockquote
                key={t.name}
                className="bg-white rounded-2xl border border-slate-200 p-6"
              >
                <p className="text-gray-700 text-sm leading-relaxed">"{t.quote}"</p>
                <footer className="mt-4">
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Ready to talk?</h2>
        <p className="mt-3 text-gray-600">
          Our enterprise team will put together a custom proposal within 48 hours.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <a
            href="mailto:enterprise@yousell.online"
            className="bg-slate-900 text-white font-semibold px-6 py-3 rounded-lg hover:bg-slate-800 transition text-sm"
          >
            Contact enterprise sales
          </a>
          <a
            href="/pricing"
            className="text-gray-600 font-medium text-sm hover:text-gray-900 transition"
          >
            View all plans →
          </a>
        </div>
      </section>
    </div>
  );
}
