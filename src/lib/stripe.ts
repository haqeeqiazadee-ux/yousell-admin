import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    stripeInstance = new Stripe(key, { apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion })
  }
  return stripeInstance
}

// Pricing tiers matching v7 spec Section 3.2
export const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    price: 29,
    productsPerPlatform: 3,
    platforms: 1,
    engines: ['discovery'],
  },
  growth: {
    name: 'Growth',
    price: 79,
    productsPerPlatform: 10,
    platforms: 3,
    engines: ['discovery', 'analytics', 'content'],
  },
  professional: {
    name: 'Professional',
    price: 149,
    productsPerPlatform: 25,
    platforms: 5,
    engines: ['discovery', 'analytics', 'content', 'influencer', 'supplier', 'marketing'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 299,
    productsPerPlatform: 50,
    platforms: 5,
    engines: ['discovery', 'analytics', 'content', 'influencer', 'supplier', 'marketing', 'store_integration', 'affiliate'],
  },
} as const

export type PlanId = keyof typeof PRICING_TIERS
