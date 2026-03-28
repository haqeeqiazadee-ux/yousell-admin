import type { Metadata } from 'next';
import { MapPin, Clock, Briefcase } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join the YouSell team. We\'re building the intelligence layer for modern ecommerce. See open roles.',
};

const openRoles = [
  {
    title: 'Senior Full-Stack Engineer',
    team: 'Engineering',
    location: 'London (Hybrid)',
    type: 'Full-time',
    description:
      'Build and scale the core yousell platform — data pipelines, AI orchestration, and the dashboard that thousands of operators use every day.',
  },
  {
    title: 'Machine Learning Engineer',
    team: 'AI',
    location: 'London (Hybrid)',
    type: 'Full-time',
    description:
      'Work on our trend prediction models, pre-viral detection engine, and AI scoring infrastructure. Python, PyTorch, and production ML experience required.',
  },
  {
    title: 'Product Designer',
    team: 'Product',
    location: 'London / Remote',
    type: 'Full-time',
    description:
      'Design the data-dense dashboards and flows that make complex intelligence easy to act on. Strong systems thinking and data visualisation skills required.',
  },
  {
    title: 'Customer Success Manager',
    team: 'Growth',
    location: 'London / Remote',
    type: 'Full-time',
    description:
      'Own the success of our Agency and Enterprise customers. Deep ecommerce knowledge essential — you should know what BSR, ROAS, and TikTok Shop mean.',
  },
  {
    title: 'Data Analyst',
    team: 'Data',
    location: 'London (Hybrid)',
    type: 'Full-time',
    description:
      'Turn millions of product signals into insights that improve our models and help customers make better decisions. SQL, Python, and curiosity required.',
  },
];

const perks = [
  { emoji: '💰', title: 'Competitive salary + equity', desc: 'Market-rate pay with meaningful equity in a growing company.' },
  { emoji: '🏠', title: 'Hybrid & remote options', desc: 'London HQ with flexible remote working for most roles.' },
  { emoji: '📚', title: '£2,000 learning budget', desc: 'Annual budget for courses, conferences, and books.' },
  { emoji: '🏥', title: 'Private healthcare', desc: 'Bupa health insurance for you and your family.' },
  { emoji: '🌍', title: '25 days holiday', desc: 'Plus bank holidays and a mandatory Christmas shutdown.' },
  { emoji: '🍕', title: 'Team lunches', desc: 'Weekly team lunch and regular social events in London.' },
];

export default function CareersPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-violet-50 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Build the future of ecommerce intelligence
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            We're a small, ambitious team building the platform that helps thousands of sellers
            discover winning products and grow their businesses. Join us.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-500">
            <span>📍 London, UK</span>
            <span>·</span>
            <span>25+ team members</span>
            <span>·</span>
            <span>Series A · 2025</span>
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Open roles</h2>
        <div className="space-y-4">
          {openRoles.map((role) => (
            <div
              key={role.title}
              className="rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{role.title}</h3>
                  <div className="mt-2 flex items-center flex-wrap gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" /> {role.team}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {role.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {role.type}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{role.description}</p>
                </div>
                <a
                  href={`mailto:careers@yousell.online?subject=Application: ${encodeURIComponent(role.title)}`}
                  className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  Apply
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-gray-50 border border-gray-200 p-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't see a role that fits?{' '}
            <a href="mailto:careers@yousell.online" className="text-violet-600 hover:underline font-medium">
              Send us a speculative application
            </a>{' '}
            — we're always interested in great people.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Why YouSell</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((perk) => (
              <div key={perk.title} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="text-2xl mb-3">{perk.emoji}</div>
                <h3 className="font-semibold text-gray-900 text-sm">{perk.title}</h3>
                <p className="mt-1 text-xs text-gray-500">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
