"use client";

import Link from "next/link";
import { Bot, HandCoins, ArrowRight } from "lucide-react";

const programs = [
  {
    title: "AI Affiliate Programs",
    description: "Promote AI tools and services — SaaS, APIs, and automation platforms with recurring commissions.",
    href: "/admin/affiliates/ai",
    icon: Bot,
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    title: "Physical Affiliate Programs",
    description: "Promote physical products from major retailers — Amazon Associates, ShareASale, and more.",
    href: "/admin/affiliates/physical",
    icon: HandCoins,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
  },
];

export default function AffiliatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-outfit tracking-tight">
          Affiliate Programs
        </h1>
        <p className="text-muted-foreground">
          Manage and discover affiliate opportunities across AI and physical product channels.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {programs.map((program) => (
          <Link
            key={program.href}
            href={program.href}
            className="group block rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-lg ${program.bg} flex items-center justify-center mb-4`}>
                <program.icon size={24} className={program.color} />
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors mt-1" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {program.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {program.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
