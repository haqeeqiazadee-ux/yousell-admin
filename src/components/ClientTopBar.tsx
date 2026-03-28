"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, Bell, Star, User, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PlatformTab {
  label: string;
  href: string;
  key: string; // matches platform_access.platform value
}

const platformTabs: PlatformTab[] = [
  { label: "TikTok", href: "/dashboard/tiktok", key: "tiktok" },
  { label: "Amazon", href: "/dashboard/amazon", key: "amazon" },
  { label: "Shopify", href: "/dashboard/shopify", key: "shopify" },
  { label: "Pinterest", href: "/dashboard/pinterest", key: "pinterest" },
  { label: "Reddit", href: "/dashboard/reddit", key: "reddit" },
  { label: "Digital", href: "/dashboard/digital", key: "digital" },
  { label: "AI/SaaS", href: "/dashboard/ai-saas", key: "ai_saas" },
  { label: "Affiliates", href: "/dashboard/affiliates", key: "affiliates" },
];

interface ClientTopBarProps {
  onToggleSidebar: () => void;
}

export function ClientTopBar({ onToggleSidebar }: ClientTopBarProps) {
  const pathname = usePathname();
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>([]);
  const [accessLoaded, setAccessLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/platform-access')
      .then((r) => r.ok ? r.json() : { platforms: [] })
      .then((d) => {
        setEnabledPlatforms(d.platforms || []);
        setAccessLoaded(true);
      })
      .catch(() => setAccessLoaded(true));
  }, []);

  const isTabActive = (href: string) => pathname.startsWith(href);
  const isLocked = (key: string) => accessLoaded && !enabledPlatforms.includes(key);

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
            const locked = isLocked(tab.key);
            return locked ? (
              <span
                key={tab.href}
                title="Upgrade your plan to unlock this platform"
                className="whitespace-nowrap px-3 py-1 text-sm shrink-0 h-full flex items-center gap-1 cursor-not-allowed opacity-40 select-none"
              >
                <Lock className="h-2.5 w-2.5" />
                {tab.label}
              </span>
            ) : (
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
