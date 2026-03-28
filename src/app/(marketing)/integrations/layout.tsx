import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integrations',
  description: 'Connect YouSell to your entire ecommerce stack — Shopify, TikTok Shop, Amazon, Stripe, and 25+ more integrations.',
};

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
