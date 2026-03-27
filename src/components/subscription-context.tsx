"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-fetch";

export interface SubscriptionInfo {
  plan: string | null;
  planName: string | null;
  status: string | null;
  engines: string[];
  productsPerPlatform: number;
  platforms: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
  loading: boolean;
}

const defaultSub: SubscriptionInfo = {
  plan: null,
  planName: null,
  status: null,
  engines: [],
  productsPerPlatform: 0,
  platforms: 0,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  isActive: false,
  loading: true,
};

const SubscriptionContext = createContext<SubscriptionInfo>(defaultSub);

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [sub, setSub] = useState<SubscriptionInfo>(defaultSub);

  useEffect(() => {
    authFetch("/api/dashboard/subscription")
      .then((r) => r.json())
      .then((data) => {
        const subscription = data.subscription;
        const plan = data.plan;

        if (subscription && plan) {
          setSub({
            plan: subscription.plan,
            planName: plan.name,
            status: subscription.status,
            engines: plan.engines || [],
            productsPerPlatform: plan.productsPerPlatform || 0,
            platforms: plan.platforms || 0,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
            isActive: subscription.status === "active",
            loading: false,
          });
        } else {
          setSub({ ...defaultSub, loading: false });
        }
      })
      .catch(() => {
        setSub({ ...defaultSub, loading: false });
      });
  }, []);

  return (
    <SubscriptionContext.Provider value={sub}>
      {children}
    </SubscriptionContext.Provider>
  );
}
