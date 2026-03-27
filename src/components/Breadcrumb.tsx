"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  customLabels?: Record<string, string>;
  className?: string;
}

const builtInLabels: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  products: "Products",
  engines: "Engines",
  alerts: "Alerts",
  settings: "Settings",
  users: "Users",
  analytics: "Analytics",
  briefing: "Briefing",
  tiktok: "TikTok Intelligence",
  "pre-viral": "Pre-Viral Detection",
  "shop-connect": "Shop Connect",
  "trend-engine": "Trend Engine",
  "competitor-radar": "Competitor Radar",
};

function formatSegment(segment: string): string {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getLabel(
  segment: string,
  customLabels?: Record<string, string>
): string {
  if (customLabels?.[segment]) return customLabels[segment];
  if (builtInLabels[segment]) return builtInLabels[segment];
  return formatSegment(segment);
}

function getHomePath(pathname: string): { href: string; label: string } {
  if (pathname.startsWith("/admin")) {
    return { href: "/", label: "Home" };
  }
  return { href: "/dashboard", label: "Dashboard" };
}

interface Crumb {
  label: string;
  href: string;
}

export function Breadcrumb({ customLabels, className }: BreadcrumbProps) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const home = getHomePath(pathname);

  // Build full crumb list (excluding home)
  const crumbs: Crumb[] = segments.map((segment, index) => ({
    label: getLabel(segment, customLabels),
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));

  // Prepend home
  const allCrumbs: Crumb[] = [home, ...crumbs];

  // Collapse if more than 4 levels: Home > ... > Parent > Current
  let visibleCrumbs: (Crumb | "ellipsis")[];
  if (allCrumbs.length > 4) {
    visibleCrumbs = [
      allCrumbs[0],
      "ellipsis" as const,
      allCrumbs[allCrumbs.length - 2],
      allCrumbs[allCrumbs.length - 1],
    ];
  } else {
    visibleCrumbs = allCrumbs;
  }

  // Mobile: only parent + current (last 2)
  const mobileCrumbs: (Crumb | "ellipsis")[] = visibleCrumbs.slice(-2);

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      {/* Desktop */}
      <ol className="hidden sm:flex items-center gap-1">
        {visibleCrumbs.map((crumb, index) => {
          const isLast = index === visibleCrumbs.length - 1;

          if (crumb === "ellipsis") {
            return (
              <li key="ellipsis" className="flex items-center gap-1">
                <span className="text-muted-foreground px-1">/</span>
                <span className="text-muted-foreground">...</span>
              </li>
            );
          }

          return (
            <li key={crumb.href} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-muted-foreground px-1">/</span>
              )}
              {isLast ? (
                <span className="text-foreground font-medium">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: max 2 items */}
      <ol className="flex sm:hidden items-center gap-1">
        {mobileCrumbs.map((crumb, index) => {
          const isLast = index === mobileCrumbs.length - 1;

          if (crumb === "ellipsis") {
            return (
              <li key="ellipsis" className="flex items-center gap-1">
                {index > 0 && (
                  <span className="text-muted-foreground px-1">/</span>
                )}
                <span className="text-muted-foreground">...</span>
              </li>
            );
          }

          return (
            <li key={crumb.href} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-muted-foreground px-1">/</span>
              )}
              {isLast ? (
                <span className="text-foreground font-medium">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
