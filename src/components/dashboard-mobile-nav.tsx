'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package, FileText, CreditCard, Link2, Sparkles, ShoppingBag, Menu, X } from 'lucide-react';

const navItems = [
  { href: '/dashboard/products', label: 'My Products', icon: Package },
  { href: '/dashboard/requests', label: 'Requests', icon: FileText },
  { href: '/dashboard/content', label: 'Content', icon: Sparkles },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Link2 },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
];

export function DashboardMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(!open)}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-b bg-white dark:bg-gray-900 shadow-lg">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
