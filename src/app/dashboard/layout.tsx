"use client";

import { useState } from "react";
import { ClientTopBar } from "@/components/ClientTopBar";
import { ClientSidebar } from "@/components/ClientSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen dark bg-[var(--color-brand-900)] text-white">
      {/* Top Bar — 48px sticky */}
      <ClientTopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Collapsible Sidebar */}
        <ClientSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-4 py-6 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
