"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell, Star, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlatformTab {
  label: string;
  href: string;
}

const platformTabs: PlatformTab[] = [
  { label: "TikTok", href: "/dashboard/tiktok" },
  { label: "Amazon", href: "/dashboard/amazon" },
  { label: "Shopify", href: "/dashboard/shopify" },
  { label: "Pinterest", href: "/dashboard/pinterest" },
  { label: "Reddit", href: "/dashboard/reddit" },
  { label: "Digital", href: "/dashboard/digital" },
  { label: "AI/SaaS", href: "/dashboard/ai-saas" },
  { label: "Affiliates", href: "/dashboard/affiliates" },
];

interface ClientTopBarProps {
  onToggleSidebar: () => void;
}

export function ClientTopBar({ onToggleSidebar }: ClientTopBarProps) {
  const pathname = usePathname();

  const isTabActive = (href: string) => pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-50 flex items-center h-[var(--topbar-height,48px)] bg-[var(--color-brand-900)] border-b border-[var(--surface-border)] px-4 gap-2"
    >
      {/* Hamburger toggle */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden flex items-center justify-center h-8 w-8 text-[var(--color-brand-200)] hover:text-white transition-colors shrink-0"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-white font-bold text-lg shrink-0 mr-4"
      >
        <span>YOUSELL</span>
      </Link>

      {/* Platform tabs - centered, horizontally scrollable on mobile */}
      <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
        <nav className="flex items-center gap-1 h-full">
          {platformTabs.map((tab) => {
            const active = isTabActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap px-3 py-1 text-sm transition-colors shrink-0 h-full flex items-center ${
                  active
                    ? "text-white border-b-2 border-[var(--color-brand-400)]"
                    : "text-[var(--color-brand-200)] hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0 ml-2">
        {/* Search */}
        <button
          className="flex items-center justify-center h-8 w-8 text-[var(--color-brand-200)] hover:text-white transition-colors"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button
          className="flex items-center justify-center h-8 w-8 text-[var(--color-brand-200)] hover:text-white transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* Watchlist */}
        <Link
          href="/dashboard/watchlist"
          className="flex items-center justify-center h-8 w-8 text-[var(--color-brand-200)] hover:text-white transition-colors"
          aria-label="Watchlist"
        >
          <Star className="h-4 w-4" />
        </Link>

        {/* Profile avatar */}
        <Avatar size="sm" className="cursor-pointer">
          <AvatarImage src="" alt="Profile" />
          <AvatarFallback>
            <User className="h-3 w-3" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
