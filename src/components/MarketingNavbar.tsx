'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const productsDropdown = [
  { label: 'Trending Products', href: '/products/trending' },
  { label: 'Pre-Viral Detection', href: '/products/pre-viral' },
  { label: 'Ad Intelligence', href: '/products/ad-intelligence' },
  { label: 'Creator Discovery', href: '/products/creator-discovery' },
  { label: 'Amazon Intelligence', href: '/products/amazon-intelligence' },
  { label: 'Shopify Intelligence', href: '/products/shopify-intelligence' },
];

const solutionsDropdown = [
  { label: 'For Dropshippers', href: '/solutions/dropshippers' },
  { label: 'For Resellers', href: '/solutions/resellers' },
  { label: 'For Agencies', href: '/solutions/agencies' },
  { label: 'Enterprise', href: '/solutions/enterprise' },
];

/* ------------------------------------------------------------------ */
/*  Dropdown (desktop)                                                 */
/* ------------------------------------------------------------------ */

function NavDropdown({
  label,
  items,
}: {
  label: string;
  items: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
      >
        {label}
        <ChevronDown
          className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mobile accordion section                                           */
/* ------------------------------------------------------------------ */

function MobileAccordion({
  label,
  items,
  onNavigate,
}: {
  label: string;
  items: { label: string; href: string }[];
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-lg font-medium text-gray-800"
      >
        {label}
        <ChevronDown
          className={`size-5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-1 px-6 pb-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="block rounded-lg px-3 py-2.5 text-base text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MarketingNavbar                                                    */
/* ------------------------------------------------------------------ */

export function MarketingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 80);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* ---- Desktop / tablet navbar ---- */}
      <header
        className={`sticky top-0 z-50 h-[72px] transition-all duration-300 ${
          scrolled
            ? 'border-b border-gray-200/60 bg-white/80 shadow-sm backdrop-blur-[20px]'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              yousell
            </span>
          </Link>

          {/* Center nav (hidden on mobile) */}
          <div className="hidden items-center gap-8 md:flex">
            <NavDropdown label="Products" items={productsDropdown} />
            <NavDropdown label="Solutions" items={solutionsDropdown} />
            <Link
              href="/pricing"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
            >
              Blog
            </Link>
          </div>

          {/* Right CTAs (hidden on mobile) */}
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button
              size="sm"
              className="bg-[var(--brand-400,#6366f1)] text-white hover:bg-[var(--brand-500,#4f46e5)]"
              asChild
            >
              <Link href="/signup">
                Get Started Free
                <span aria-hidden="true" className="ml-1">
                  &rarr;
                </span>
              </Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </nav>
      </header>

      {/* ---- Mobile overlay ---- */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-white md:hidden">
          {/* Mobile header */}
          <div className="flex h-[72px] items-center justify-between border-b border-gray-100 px-4">
            <Link href="/" onClick={closeMobile} className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-gray-900">
                yousell
              </span>
            </Link>
            <button
              type="button"
              onClick={closeMobile}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="size-6" />
            </button>
          </div>

          {/* Mobile nav links */}
          <div className="flex-1 overflow-y-auto">
            <MobileAccordion
              label="Products"
              items={productsDropdown}
              onNavigate={closeMobile}
            />
            <MobileAccordion
              label="Solutions"
              items={solutionsDropdown}
              onNavigate={closeMobile}
            />

            <Link
              href="/pricing"
              onClick={closeMobile}
              className="block border-b border-gray-100 px-6 py-4 text-lg font-medium text-gray-800 transition-colors hover:bg-gray-50"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              onClick={closeMobile}
              className="block border-b border-gray-100 px-6 py-4 text-lg font-medium text-gray-800 transition-colors hover:bg-gray-50"
            >
              Blog
            </Link>
          </div>

          {/* Mobile CTAs */}
          <div className="space-y-3 border-t border-gray-100 p-6">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login" onClick={closeMobile}>
                Log In
              </Link>
            </Button>
            <Button
              className="w-full bg-[var(--brand-400,#6366f1)] text-white hover:bg-[var(--brand-500,#4f46e5)]"
              asChild
            >
              <Link href="/signup" onClick={closeMobile}>
                Get Started Free
                <span aria-hidden="true" className="ml-1">
                  &rarr;
                </span>
              </Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
