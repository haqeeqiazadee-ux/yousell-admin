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

  // No authenticated user — render without sidebar (login, unauthorized, etc.)
  // Also skip sidebar for non-admin users (defense-in-depth: middleware should
  // already redirect, but this prevents sidebar flash for non-admins)
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return <>{children}</>;
  }

  // Map getUser() result to Profile shape for UserProvider
  const profile: Profile = {
    id: user.id,
    email: user.email,
    full_name: null,
    role: user.role as Profile['role'],
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
