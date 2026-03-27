"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  Clock,
  Zap,
  LayoutDashboard,
  Package,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: string;
  shortcut?: string;
  action: () => void;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const RECENT_PAGES_KEY = "yousell_recent_pages";
const MAX_RECENT = 5;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getRecentPages(): { label: string; path: string }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_PAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordRecentPage(label: string, path: string) {
  if (typeof window === "undefined") return;
  try {
    const pages = getRecentPages().filter((p) => p.path !== path);
    pages.unshift({ label, path });
    localStorage.setItem(
      RECENT_PAGES_KEY,
      JSON.stringify(pages.slice(0, MAX_RECENT))
    );
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/*  Navigation definitions                                             */
/* ------------------------------------------------------------------ */

const adminPages = [
  { label: "Admin Dashboard", path: "/admin" },
  { label: "Products", path: "/admin/products" },
  { label: "Analytics", path: "/admin/analytics" },
  { label: "Clients", path: "/admin/clients" },
  { label: "Revenue", path: "/admin/revenue" },
  { label: "Financial", path: "/admin/financial" },
  { label: "Scan", path: "/admin/scan" },
  { label: "Trends", path: "/admin/trends" },
  { label: "Competitors", path: "/admin/competitors" },
  { label: "Suppliers", path: "/admin/suppliers" },
  { label: "Automation", path: "/admin/automation" },
  { label: "Monitoring", path: "/admin/monitoring" },
  { label: "Ads", path: "/admin/ads" },
  { label: "Affiliates", path: "/admin/affiliates" },
  { label: "Influencers", path: "/admin/influencers" },
  { label: "Content", path: "/admin/content" },
  { label: "Blueprints", path: "/admin/blueprints" },
  { label: "Settings", path: "/admin/settings" },
  { label: "Notifications", path: "/admin/notifications" },
  { label: "Alerts", path: "/admin/alerts" },
  { label: "Clusters", path: "/admin/clusters" },
  { label: "Opportunities", path: "/admin/opportunities" },
  { label: "Scoring", path: "/admin/scoring" },
  { label: "Allocate", path: "/admin/allocate" },
  { label: "Amazon", path: "/admin/amazon" },
  { label: "Shopify", path: "/admin/shopify" },
  { label: "TikTok", path: "/admin/tiktok" },
  { label: "Pinterest", path: "/admin/pinterest" },
  { label: "POD", path: "/admin/pod" },
  { label: "Digital", path: "/admin/digital" },
  { label: "Import", path: "/admin/import" },
  { label: "Creator Matches", path: "/admin/creator-matches" },
  { label: "Debug", path: "/admin/debug" },
];

const clientPages = [
  { label: "Client Dashboard", path: "/dashboard" },
  { label: "My Products", path: "/dashboard/products" },
  { label: "Orders", path: "/dashboard/orders" },
  { label: "Client Analytics", path: "/dashboard/analytics" },
  { label: "Content Studio", path: "/dashboard/content" },
  { label: "Integrations", path: "/dashboard/integrations" },
  { label: "Engines", path: "/dashboard/engines" },
  { label: "Billing", path: "/dashboard/billing" },
  { label: "Affiliate", path: "/dashboard/affiliate" },
  { label: "Requests", path: "/dashboard/requests" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /* ---------- build command list ---------------------------------- */

  const items = useMemo<CommandItem[]>(() => {
    const nav = (path: string) => () => {
      router.push(path);
      setOpen(false);
    };

    const all: CommandItem[] = [];

    // AI Queries
    const aiQueries = [
      { label: "Generate briefing", shortcut: undefined },
      { label: "Analyse trends", shortcut: undefined },
      { label: "Price suggestion", shortcut: undefined },
    ];
    aiQueries.forEach((q) =>
      all.push({
        id: `ai-${q.label}`,
        label: q.label,
        icon: <Sparkles className="h-4 w-4 text-violet-400" />,
        group: "AI Queries",
        shortcut: q.shortcut,
        action: nav(`/admin/trends`), // default landing for AI
      })
    );

    // Recent pages (from localStorage)
    const recents = getRecentPages();
    recents.forEach((r) =>
      all.push({
        id: `recent-${r.path}`,
        label: r.label,
        icon: <Clock className="h-4 w-4 text-sky-400" />,
        group: "Recent",
        action: nav(r.path),
      })
    );

    // Actions
    const actions: { label: string; shortcut?: string; path: string }[] = [
      { label: "Run scan", shortcut: "S", path: "/admin/scan" },
      { label: "Export data", shortcut: "E", path: "/admin/analytics" },
      { label: "Toggle dark mode", shortcut: "D", path: "#toggle-theme" },
    ];
    actions.forEach((a) =>
      all.push({
        id: `action-${a.label}`,
        label: a.label,
        icon: <Zap className="h-4 w-4 text-amber-400" />,
        group: "Actions",
        shortcut: a.shortcut,
        action:
          a.path === "#toggle-theme"
            ? () => {
                // Toggle theme by dispatching a custom event the ThemeToggle can listen to,
                // or directly toggling the html class for simplicity.
                document.documentElement.classList.toggle("dark");
                setOpen(false);
              }
            : nav(a.path),
      })
    );

    // Navigation — Admin
    adminPages.forEach((p) =>
      all.push({
        id: `nav-${p.path}`,
        label: p.label,
        icon: <LayoutDashboard className="h-4 w-4 text-emerald-400" />,
        group: "Navigation",
        action: nav(p.path),
      })
    );

    // Navigation — Client
    clientPages.forEach((p) =>
      all.push({
        id: `nav-${p.path}`,
        label: p.label,
        icon: <LayoutDashboard className="h-4 w-4 text-emerald-400" />,
        group: "Navigation",
        action: nav(p.path),
      })
    );

    // Products placeholder
    all.push({
      id: "products-search",
      label: "Search products\u2026",
      icon: <Package className="h-4 w-4 text-orange-400" />,
      group: "Products",
      action: nav("/admin/products"),
    });

    return all;
  }, [router]);

  /* ---------- filtered + grouped ---------------------------------- */

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  const grouped = useMemo(() => {
    const order = ["AI Queries", "Recent", "Actions", "Navigation", "Products"];
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const arr = map.get(item.group) ?? [];
      arr.push(item);
      map.set(item.group, arr);
    }
    return order
      .filter((g) => map.has(g))
      .map((g) => ({ group: g, items: map.get(g)! }));
  }, [filtered]);

  /* ---------- keyboard shortcut to open --------------------------- */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* ---------- focus input when opened ----------------------------- */

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      // Small delay to let the dialog render
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  /* ---------- keep selected index in range ------------------------ */

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  /* ---------- keyboard navigation --------------------------------- */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        filtered[selectedIndex]?.action();
      }
    },
    [filtered, selectedIndex]
  );

  /* ---------- scroll selected into view --------------------------- */

  useEffect(() => {
    const el = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  /* ---------- render ---------------------------------------------- */

  if (!open) return null;

  let flatIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          backgroundColor: "rgba(14, 22, 41, 0.75)",
        }}
      />

      {/* Panel */}
      <div
        className="relative w-full max-w-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(30, 41, 70, 0.92) 0%, rgba(14, 22, 41, 0.96) 100%)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-white/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
          />
          <button
            onClick={() => setOpen(false)}
            className="shrink-0 rounded-md p-1 text-white/40 hover:text-white/70 transition-colors"
            aria-label="Close command palette"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[380px] overflow-y-auto overscroll-contain py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
        >
          {grouped.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-white/30">
              No results found.
            </p>
          )}

          {grouped.map(({ group, items: groupItems }) => (
            <div key={group}>
              {/* Group heading */}
              <p className="px-4 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                {group}
              </p>

              {groupItems.map((item) => {
                flatIdx += 1;
                const idx = flatIdx;
                const isSelected = idx === selectedIndex;

                return (
                  <button
                    key={item.id}
                    data-index={idx}
                    onClick={() => item.action()}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    {item.icon}
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="ml-auto hidden shrink-0 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-white/40 sm:inline-block">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 border-t border-white/10 px-4 py-2 text-[11px] text-white/25">
          <span>
            <kbd className="rounded border border-white/15 bg-white/5 px-1 py-0.5 text-[10px]">
              &uarr;&darr;
            </kbd>{" "}
            navigate
          </span>
          <span>
            <kbd className="rounded border border-white/15 bg-white/5 px-1 py-0.5 text-[10px]">
              &crarr;
            </kbd>{" "}
            select
          </span>
          <span>
            <kbd className="rounded border border-white/15 bg-white/5 px-1 py-0.5 text-[10px]">
              esc
            </kbd>{" "}
            close
          </span>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
