"use client";

import Link from "next/link";
import { useSubscription } from "@/components/subscription-context";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EngineGateProps {
  /** The engine ID required (e.g., 'discovery', 'content', 'influencer') */
  engine: string;
  /** Display name for the feature (e.g., 'Content Creation') */
  featureName: string;
  /** The content to show when the engine is available */
  children: React.ReactNode;
  /** Optional: override the required plan text */
  requiredPlan?: string;
}

/**
 * Wraps a dashboard feature section.
 * If the client's subscription includes the required engine, shows children.
 * If not, shows a locked upgrade prompt.
 */
export function EngineGate({ engine, featureName, children, requiredPlan }: EngineGateProps) {
  const sub = useSubscription();

  if (sub.loading) {
    return (
      <div className="rounded-xl border bg-white dark:bg-gray-900 p-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-3" />
        <div className="h-4 bg-gray-100 rounded w-72" />
      </div>
    );
  }

  // Allow access if subscription is active and includes this engine
  if (sub.isActive && sub.engines.includes(engine)) {
    return <>{children}</>;
  }

  // Show gated UI
  const planNeeded = requiredPlan || getPlanForEngine(engine);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
        <Lock className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
        {featureName}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
        This feature requires the <strong>{planNeeded}</strong> plan or higher.
        Upgrade to unlock {featureName.toLowerCase()} and accelerate your business.
      </p>
      <Link href="/dashboard/billing">
        <Button className="gap-2">
          Upgrade Plan <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

function getPlanForEngine(engine: string): string {
  const enginePlanMap: Record<string, string> = {
    discovery: "Starter",
    analytics: "Growth",
    content: "Growth",
    influencer: "Professional",
    supplier: "Professional",
    marketing: "Professional",
    store_integration: "Enterprise",
    affiliate: "Enterprise",
  };
  return enginePlanMap[engine] || "Growth";
}
