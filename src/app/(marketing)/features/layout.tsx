import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features',
  description: 'Explore all YouSell features — Trend Radar, AI Agents, Pricing Intelligence, Demand Forecasting, AI Briefings, and more.',
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
