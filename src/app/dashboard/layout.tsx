import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, FileText, LogOut, CreditCard, Link2, Sparkles, ShoppingBag, BarChart3, Cog, Users } from "lucide-react";
import { SubscriptionProvider } from "@/components/subscription-context";
import { SubscriptionBanner } from "@/components/subscription-banner";
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav";

// Force dynamic rendering — never statically cache dashboard pages
export const dynamic = 'force-dynamic';

interface ProfileData {
  full_name: string | null;
  email: string | null;
  role: string;
  avatar_url: string | null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let profile: ProfileData | null = null;

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('[DashboardLayout] auth.getUser failed:', authError.message);
    }

    if (!user) {
      // Check if cookies exist (middleware already validated auth)
      const cookieStore = await cookies();
      const hasSession = cookieStore.getAll().some(c => c.name.includes('auth-token'));
      if (!hasSession) {
        redirect("/login");
      }
      // Cookies exist but getUser failed — render with minimal profile
      profile = { full_name: null, email: null, role: 'client', avatar_url: null };
    } else {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, role, avatar_url")
        .eq("id", user.id)
        .single();

      if (!profileData || profileData.role !== "client") {
        redirect("/admin/unauthorized");
      }

      profile = profileData;
    }
  } catch (err) {
    // If redirect was thrown, re-throw it
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    console.error('[DashboardLayout] unexpected error:', err);
    // Fallback: render with minimal profile
    profile = { full_name: null, email: null, role: 'client', avatar_url: null };
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : profile.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 border-b bg-white dark:bg-gray-900 shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm">
                YS
              </div>
              <span className="text-lg font-bold font-outfit tracking-tight">
                YouSell
              </span>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/dashboard/products">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Package className="h-4 w-4" />
                  My Products
                </Button>
              </Link>
              <Link href="/dashboard/requests">
                <Button variant="ghost" size="sm" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Requests
                </Button>
              </Link>
              <Link href="/dashboard/content">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Content
                </Button>
              </Link>
              <Link href="/dashboard/integrations">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Link2 className="h-4 w-4" />
                  Integrations
                </Button>
              </Link>
              <Link href="/dashboard/orders">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Orders
                </Button>
              </Link>
              <Link href="/dashboard/analytics">
                <Button variant="ghost" size="sm" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/dashboard/engines">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Cog className="h-4 w-4" />
                  Engines
                </Button>
              </Link>
              <Link href="/dashboard/affiliate">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  Affiliate
                </Button>
              </Link>
              <Link href="/dashboard/billing">
                <Button variant="ghost" size="sm" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Toggle */}
            <DashboardMobileNav />

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium leading-none">
                  {profile.full_name || profile.email || "Client"}
                </p>
                <p className="text-xs text-muted-foreground">Client</p>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <form action="/api/auth/signout" method="POST">
                <Button variant="ghost" size="icon" className="h-8 w-8" type="submit">
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </form>
            </div>
          </div>
        </header>

        {/* Subscription Banner */}
        <SubscriptionBanner />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </SubscriptionProvider>
  );
}
