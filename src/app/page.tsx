import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

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

  // Redirect to marketing site — served by (marketing) layout
  // This avoids the route group conflict
  redirect('/home');
}
