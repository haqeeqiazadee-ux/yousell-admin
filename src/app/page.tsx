import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { MarketingNavbar } from '@/components/MarketingNavbar';
import MarketingFooter from '@/components/MarketingFooter';
import MarketingHomepage from '@/components/MarketingHomepage';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'YouSell — AI Commerce Intelligence Platform',
  description: 'Discover winning products, track trends across 14 platforms, and grow your ecommerce business with 25 AI engines. No guesswork — just data.',
};

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  const isAdminSubdomain = hostname.startsWith('admin.');

  if (isAdminSubdomain) {
    redirect(user ? '/admin' : '/admin/login');
  }

  if (user) {
    redirect('/dashboard');
  }

  // Unauthenticated users see the marketing homepage
  return (
    <div className="min-h-screen bg-[var(--surface-base)]" data-theme="light">
      <MarketingNavbar />
      <main>
        <MarketingHomepage />
      </main>
      <MarketingFooter />
    </div>
  );
}
