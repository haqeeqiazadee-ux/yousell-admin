import { cookies } from 'next/headers';
import { getUser } from '@/lib/auth/get-user';
import { UserProvider } from '@/components/user-context';
import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { Profile } from '@/lib/types/database';

// Force dynamic rendering — never statically cache admin pages
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser().catch((err) => {
    console.error('[AdminLayout] getUser() failed:', err);
    return null;
  });

  // Determine if user has an active Supabase session via cookies
  // This is a lightweight check — middleware already enforced auth
  const hasSession = !user
    ? (await cookies()).getAll().some((c) => c.name.startsWith('sb-'))
    : true;

  // If no user AND no session cookies, render without sidebar (login/unauthorized pages)
  if (!user && !hasSession) {
    return <>{children}</>;
  }

  // Map getUser() result to Profile shape for UserProvider
  // If getUser() failed but session exists, use minimal fallback profile
  const profile: Profile = user
    ? {
        id: user.id,
        email: user.email,
        full_name: null,
        role: user.role as Profile['role'],
        avatar_url: null,
        push_token: null,
        created_at: '',
        updated_at: '',
      }
    : {
        id: '',
        email: '',
        full_name: null,
        role: 'admin',
        avatar_url: null,
        push_token: null,
        created_at: '',
        updated_at: '',
      };

  return (
    <UserProvider user={profile}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
