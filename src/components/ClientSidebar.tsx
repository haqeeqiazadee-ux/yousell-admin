"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  Zap,
  Target,
  Video,
  ShoppingCart,
  Store,
  Megaphone,
  Users,
  Star,
  Bookmark,
  Bell,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "DISCOVERY",
    items: [
      { href: "/dashboard", label: "Trending Now", icon: TrendingUp },
      { href: "/dashboard/pre-viral", label: "Pre-Viral", icon: Zap },
      { href: "/dashboard/opportunities", label: "Opportunity Feed", icon: Target },
    ],
  },
  {
    title: "RESEARCH",
    items: [
      { href: "/dashboard/tiktok", label: "TikTok Intelligence", icon: Video },
      { href: "/dashboard/amazon", label: "Amazon Intelligence", icon: ShoppingCart },
      { href: "/dashboard/shopify", label: "Shopify Intelligence", icon: Store },
      { href: "/dashboard/ads", label: "Ad Intelligence", icon: Megaphone },
      { href: "/dashboard/creators", label: "Creator Discovery", icon: Users },
    ],
  },
  {
    title: "MY TOOLS",
    items: [
      { href: "/dashboard/watchlist", label: "Watchlist", icon: Star },
      { href: "/dashboard/saved", label: "Saved Searches", icon: Bookmark },
      { href: "/dashboard/alerts", label: "My Alerts", icon: Bell },
      { href: "/dashboard/blueprints", label: "Launch Blueprints", icon: FileText },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { href: "/dashboard/usage", label: "Usage & Plan", icon: BarChart3 },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/help", label: "Help & Onboarding", icon: HelpCircle },
    ],
  },
];

interface ClientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="flex flex-col gap-1 py-4 overflow-y-auto h-full">
      {navGroups.map((group) => (
        <div key={group.title} className="mb-2">
          <h3 className="text-xs uppercase tracking-wider text-[var(--color-brand-200)] font-medium px-4 py-2">
            {group.title}
          </h3>
          {group.items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-brand-200)] hover:bg-[var(--state-hover-bg)] hover:text-white transition-colors rounded-md mx-2 ${
                  active
                    ? "border-l-2 border-solid border-[var(--color-brand-400)] bg-[var(--color-brand-800)] text-white"
                    : ""
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export function ClientSidebar({ isOpen, onClose }: ClientSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-[240px] shrink-0 bg-[var(--color-brand-900)] border-r border-[var(--surface-border)] h-screen sticky top-0"
      >
        <SidebarNav />
      </aside>

      {/* Mobile sidebar via Sheet overlay */}
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-[240px] p-0 bg-[var(--color-brand-900)] border-r border-[var(--surface-border)]"
        >
          <SheetHeader className="flex-row items-center justify-between p-4 border-b border-[var(--surface-border)]">
            <SheetTitle className="text-white text-base font-semibold">
              Menu
            </SheetTitle>
            <button
              onClick={onClose}
              className="text-[var(--color-brand-200)] hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </SheetHeader>
          <SidebarNav />
        </SheetContent>
      </Sheet>
    </>
  );
}
