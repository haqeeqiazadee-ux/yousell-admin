"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
} from "lucide-react";
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
import { useRouter } from "next/navigation";
import { useUser } from "@/components/user-context";

const mainNav = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Scan Control", href: "/admin/scan", icon: Scan },
  { title: "Products", href: "/admin/products", icon: Package },
  { title: "Trend Scout", href: "/admin/trends", icon: TrendingUp },
];

const channelNav = [
  { title: "TikTok Shop", href: "/admin/tiktok", icon: Music2 },
  { title: "Amazon FBA", href: "/admin/amazon", icon: ShoppingCart },
  { title: "Shopify DTC", href: "/admin/shopify", icon: Store },
  { title: "Pinterest", href: "/admin/pinterest", icon: PinIcon },
  { title: "Digital Products", href: "/admin/digital", icon: FileText },
  { title: "AI Affiliates", href: "/admin/affiliates/ai", icon: Bot },
  { title: "Physical Affiliates", href: "/admin/affiliates/physical", icon: HandCoins },
];

const intelligenceNav = [
  { title: "Competitors", href: "/admin/competitors", icon: Swords },
  { title: "Influencers", href: "/admin/influencers", icon: UserSearch },
  { title: "Suppliers", href: "/admin/suppliers", icon: Truck },
  { title: "Blueprints", href: "/admin/blueprints", icon: Eye },
];

const managementNav = [
  { title: "Clients", href: "/admin/clients", icon: Users },
  { title: "Allocate Products", href: "/admin/allocate", icon: Package },
  { title: "Notifications", href: "/admin/notifications", icon: Bell },
  { title: "Import CSV", href: "/admin/import", icon: FileText },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
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

  const renderNav = (items: typeof mainNav) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            render={<Link href={item.href} />}
            isActive={isActive(item.href)}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border px-4 py-3">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold font-outfit tracking-tight">
            You<span className="text-red-500">|</span>Sell
            <span className="text-red-500">|</span>
            <span className="text-muted-foreground text-sm">.admin</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>{renderNav(mainNav)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Discovery Channels</SidebarGroupLabel>
          <SidebarGroupContent>{renderNav(channelNav)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>{renderNav(intelligenceNav)}</SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>{renderNav(managementNav)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          {user && (
            <SidebarMenuItem>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-medium truncate">
                    {user.full_name || user.email}
                  </span>
                  <Badge variant="outline" className="w-fit text-[10px] px-1 py-0">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
