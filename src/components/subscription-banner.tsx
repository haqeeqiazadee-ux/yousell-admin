"use client";

import Link from "next/link";
import { useSubscription } from "@/components/subscription-context";
import { ArrowRight, Sparkles, AlertTriangle } from "lucide-react";

export function SubscriptionBanner() {
  const sub = useSubscription();

  if (sub.loading) return null;

  // No subscription — show upgrade prompt
  if (!sub.isActive) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">
              You&apos;re on the free tier. Upgrade to unlock product discovery, content automation, and more.
            </span>
          </div>
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-1 text-sm font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors"
          >
            View Plans <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // Subscription cancelling
  if (sub.cancelAtPeriodEnd && sub.currentPeriodEnd) {
    return (
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="container mx-auto flex items-center justify-between px-4 py-2.5 md:px-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              Your {sub.planName} plan ends on{" "}
              {new Date(sub.currentPeriodEnd).toLocaleDateString()}. Reactivate to keep your features.
            </span>
          </div>
          <Link
            href="/dashboard/billing"
            className="text-sm font-semibold text-amber-700 hover:text-amber-900"
          >
            Manage Subscription
          </Link>
        </div>
      </div>
    );
  }

  // Active subscription — show plan badge (subtle)
  return null;
}
