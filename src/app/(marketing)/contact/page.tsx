import type { Metadata } from 'next';
import { Mail, MessageSquare, BookOpen, Twitter, Linkedin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the YouSell team. We respond to all enquiries within one business day.',
};

const channels = [
  {
    icon: Mail,
    title: 'General Enquiries',
    description: 'Questions about pricing, features, or partnerships.',
    contact: 'hello@yousell.online',
    href: 'mailto:hello@yousell.online',
    cta: 'Send email',
  },
  {
    icon: MessageSquare,
    title: 'Customer Support',
    description: 'Need help with your account, billing, or integrations?',
    contact: 'support@yousell.online',
    href: 'mailto:support@yousell.online',
    cta: 'Get support',
  },
  {
    icon: BookOpen,
    title: 'Press & Media',
    description: 'Journalists, analysts, and content creators.',
    contact: 'press@yousell.online',
    href: 'mailto:press@yousell.online',
    cta: 'Contact press',
  },
];

export default function ContactPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            We respond to all enquiries within one business day.
            For urgent account issues, use the in-app chat.
          </p>
        </div>
      </section>

      {/* Contact channels */}
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {channels.map((ch) => {
            const Icon = ch.icon;
            return (
              <div
                key={ch.title}
                className="rounded-2xl border border-gray-200 bg-white p-8 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <div className="h-11 w-11 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{ch.title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{ch.description}</p>
                </div>
                <a
                  href={ch.href}
                  className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
                >
                  {ch.cta} →
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Office / Social */}
      <section className="mx-auto max-w-5xl px-6 py-12 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Our office</h2>
            <address className="not-italic text-gray-600 space-y-1 text-sm leading-relaxed">
              <p className="font-medium text-gray-900">YouSell Ltd.</p>
              <p>1 Canada Square</p>
              <p>Canary Wharf</p>
              <p>London E14 5AB</p>
              <p>United Kingdom</p>
            </address>
            <p className="mt-4 text-sm text-gray-500">
              Company registered in England & Wales · Company number 15437221
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Find us online</h2>
            <div className="flex flex-col gap-3">
              <a
                href="https://twitter.com/yousellhq"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                <Twitter className="h-4 w-4" /> @yousellhq on X (Twitter)
              </a>
              <a
                href="https://linkedin.com/company/yousell"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                <Linkedin className="h-4 w-4" /> yousell on LinkedIn
              </a>
            </div>

            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-2">Response times</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>General enquiries — within 1 business day</li>
                <li>Support (Pro/Agency) — within 4 hours</li>
                <li>Support (Starter) — within 1 business day</li>
                <li>Enterprise — dedicated account manager</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
