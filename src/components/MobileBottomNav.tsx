"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ScanLine,
  Bell,
  MoreHorizontal,
  Home,
  Search,
  Star,
  Menu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Section 9 — Mobile bottom navigation (< lg breakpoint).
 * Fixed bottom bar with 5 nav items, hidden on lg+ screens.
 */

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const adminItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Scan", href: "/admin/scan", icon: ScanLine },
  { label: "Alerts", href: "/admin/alerts", icon: Bell },
  { label: "More", href: "/admin/settings", icon: MoreHorizontal },
];

const clientItems: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Search", href: "/dashboard/search", icon: Search },
  { label: "Watchlist", href: "/dashboard/watchlist", icon: Star },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { label: "Menu", href: "/dashboard/menu", icon: Menu },
];

interface MobileBottomNavProps {
  variant: "admin" | "client";
}

export default function MobileBottomNav({ variant }: MobileBottomNavProps) {
  const pathname = usePathname();
  const items = variant === "admin" ? adminItems : clientItems;

  const isActive = (href: string) => {
    if (href === "/admin" || href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-14 border-t border-border bg-background lg:hidden">
      <div className="flex h-full items-center justify-around">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                active
                  ? "text-[var(--color-brand-400)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
