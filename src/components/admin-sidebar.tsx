"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutDashboard,
  Package,
  TrendingUp,
  Swords,
  Music2,
  ShoppingCart,
  Store,
  PinIcon,
  FileText,
  Bot,
  HandCoins,
  Scan,
  Users,
  UserSearch,
  Truck,
  Settings,
  LogOut,
  Bell,
  Eye,
  Layers,
  Target,
  Megaphone,
  BarChart2,
  Sparkles,
  OctagonX,
  Shield,
  DollarSign,
  Lightbulb,
  Bug,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/components/user-context";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: string;
}

const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard, iconColor: "text-white", iconBg: "gradient-coral" },
  { title: "Scan Control", href: "/admin/scan", icon: Scan, iconColor: "text-white", iconBg: "gradient-teal" },
  { title: "Products", href: "/admin/products", icon: Package, iconColor: "text-white", iconBg: "gradient-blue" },
  { title: "Trend Scout", href: "/admin/trends", icon: TrendingUp, iconColor: "text-white", iconBg: "gradient-emerald" },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart2, iconColor: "text-white", iconBg: "gradient-purple" },
  { title: "Revenue", href: "/admin/revenue", icon: DollarSign, iconColor: "text-white", iconBg: "gradient-emerald" },
  { title: "Opportunities", href: "/admin/opportunities", icon: Lightbulb, iconColor: "text-white", iconBg: "gradient-coral", badge: "NEW" },
];

const channelNav: NavItem[] = [
  { title: "TikTok Shop", href: "/admin/tiktok", icon: Music2, iconColor: "text-pink-600", iconBg: "bg-pink-50", badge: "NEW" },
  { title: "Amazon FBA", href: "/admin/amazon", icon: ShoppingCart, iconColor: "text-orange-600", iconBg: "bg-orange-50" },
  { title: "Shopify DTC", href: "/admin/shopify", icon: Store, iconColor: "text-green-600", iconBg: "bg-green-50" },
  { title: "Pinterest", href: "/admin/pinterest", icon: PinIcon, iconColor: "text-red-600", iconBg: "bg-red-50" },
  { title: "Digital Products", href: "/admin/digital", icon: FileText, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
  { title: "AI Affiliates", href: "/admin/affiliates/ai", icon: Bot, iconColor: "text-violet-600", iconBg: "bg-violet-50", badge: "NEW" },
  { title: "Physical Affiliates", href: "/admin/affiliates/physical", icon: HandCoins, iconColor: "text-amber-600", iconBg: "bg-amber-50" },
];

const intelligenceNav: NavItem[] = [
  { title: "Product Clusters", href: "/admin/clusters", icon: Layers, iconColor: "text-indigo-600", iconBg: "bg-indigo-50" },
  { title: "Creator Matches", href: "/admin/creator-matches", icon: Target, iconColor: "text-rose-600", iconBg: "bg-rose-50" },
  { title: "Ad Intelligence", href: "/admin/ads", icon: Megaphone, iconColor: "text-cyan-600", iconBg: "bg-cyan-50", badge: "NEW" },
  { title: "Competitors", href: "/admin/competitors", icon: Swords, iconColor: "text-slate-600", iconBg: "bg-slate-100" },
  { title: "Influencers", href: "/admin/influencers", icon: UserSearch, iconColor: "text-purple-600", iconBg: "bg-purple-50" },
  { title: "Suppliers", href: "/admin/suppliers", icon: Truck, iconColor: "text-teal-600", iconBg: "bg-teal-50" },
  { title: "Blueprints", href: "/admin/blueprints", icon: Eye, iconColor: "text-sky-600", iconBg: "bg-sky-50" },
  { title: "Scoring", href: "/admin/scoring", icon: Sparkles, iconColor: "text-violet-600", iconBg: "bg-violet-50" },
  { title: "Financial", href: "/admin/financial", icon: DollarSign, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
];

const managementNav: NavItem[] = [
  { title: "Clients", href: "/admin/clients", icon: Users, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
  { title: "Allocate Products", href: "/admin/allocate", icon: Package, iconColor: "text-violet-600", iconBg: "bg-violet-50" },
  { title: "Governor", href: "/admin/governor", icon: Shield, iconColor: "text-red-600", iconBg: "bg-red-50" },
  { title: "Monitoring", href: "/admin/monitoring", icon: Activity, iconColor: "text-cyan-600", iconBg: "bg-cyan-50" },
  { title: "Automation", href: "/admin/automation", icon: Sparkles, iconColor: "text-amber-600", iconBg: "bg-amber-50", badge: "NEW" },
  { title: "Notifications", href: "/admin/notifications", icon: Bell, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
  { title: "Import CSV", href: "/admin/import", icon: FileText, iconColor: "text-gray-600", iconBg: "bg-gray-100" },
  { title: "Debug", href: "/admin/debug", icon: Bug, iconColor: "text-gray-600", iconBg: "bg-gray-100" },
  { title: "Settings", href: "/admin/settings", icon: Settings, iconColor: "text-gray-600", iconBg: "bg-gray-100" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const user = useUser();
  const [killSwitchLoading, setKillSwitchLoading] = useState(false);

  const handleKillSwitch = async () => {
    if (!confirm("This will DISABLE ALL automation jobs. Continue?")) return;
    setKillSwitchLoading(true);
    try {
      await fetch("/api/admin/automation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ killSwitch: true }),
      });
    } catch (err) {
      console.error("Kill switch failed:", err);
    } finally {
      setKillSwitchLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "AD";

  const renderNav = (items: NavItem[]) => (
    <SidebarMenu>
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              render={<Link href={item.href} />}
              isActive={active}
              className={active ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-medium" : ""}
            >
              <span className={`icon-circle ${item.iconBg} ${active ? "ring-2 ring-rose-200 dark:ring-rose-800" : ""}`} style={{ width: "1.75rem", height: "1.75rem", borderRadius: item.iconBg?.startsWith("gradient") ? "0.5rem" : "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <item.icon className={`${item.iconColor}`} style={{ width: "0.875rem", height: "0.875rem" }} />
              </span>
              <span className="flex-1 truncate">{item.title}</span>
              {item.badge && (
                <span className="badge-new">{item.badge}</span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="icon-circle-lg gradient-coral" style={{ width: "2.25rem", height: "2.25rem", borderRadius: "0.625rem" }}>
              <Sparkles className="text-white" style={{ width: "1.125rem", height: "1.125rem" }} />
            </span>
            <span className="text-lg font-bold tracking-tight">
              You<span className="text-rose-500">Sell</span>
              <span className="text-muted-foreground text-xs font-normal ml-1">.admin</span>
            </span>
          </Link>
          <button
            onClick={handleKillSwitch}
            disabled={killSwitchLoading}
            title="Pause All Automation (Big Red Button)"
            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors disabled:opacity-50"
          >
            <OctagonX style={{ width: "1rem", height: "1rem" }} />
          </button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">Platform</SidebarGroupLabel>
          <SidebarGroupContent>{renderNav(mainNav)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">Discovery Channels</SidebarGroupLabel>
          <SidebarGroupContent>{renderNav(channelNav)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>{renderNav(intelligenceNav)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">Management</SidebarGroupLabel>
          <SidebarGroupContent>{renderNav(managementNav)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-3">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <div className="flex items-center gap-2.5 px-2 py-2">
                <Avatar className="h-8 w-8 ring-2 ring-rose-100 dark:ring-rose-900">
                  <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-rose-400 to-pink-500 text-white">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">
                    {user.full_name || user.email}
                  </span>
                  <Badge variant="outline" className="w-fit text-[10px] px-1.5 py-0 capitalize border-rose-200 text-rose-600 dark:border-rose-800 dark:text-rose-400">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-2">
              <SidebarMenuButton onClick={handleSignOut} className="flex-1">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </SidebarMenuButton>
              <ThemeToggle />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
