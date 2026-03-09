import { getUser } from '@/lib/auth/get-user';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check is handled by middleware - layout just provides the chrome.
  // Login/unauthorized pages render without the nav wrapper via their own markup.
  const user = await getUser().catch(() => null);

  // If no user, just render children (login page, unauthorized, etc.)
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold dark:text-gray-100">YouSell Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded">
              {user.role}
            </span>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4">{children}</main>
    </div>
  );
}
