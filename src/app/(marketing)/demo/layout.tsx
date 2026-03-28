import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Demo',
  description: 'See YouSell in action — live product data, real trend signals, and AI-powered intelligence. No signup required.',
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
