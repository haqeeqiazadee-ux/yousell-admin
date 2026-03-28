import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started',
  description: 'Set up your YouSell account and start discovering winning products in minutes.',
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
