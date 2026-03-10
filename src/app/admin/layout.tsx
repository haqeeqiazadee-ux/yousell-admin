import { getUser } from '@/lib/auth/get-user';
import { UserProvider } from '@/components/user-context';
import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { Profile } from '@/lib/types/database';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser().catch(() => null);

  // If no user, just render children (login page, unauthorized, etc.)
  if (!user) {
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
