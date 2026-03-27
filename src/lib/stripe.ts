import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    stripeInstance = new Stripe(key, { apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion })
  }
  return stripeInstance
}

// Pricing tiers matching v8 spec Section 3.2 (Option C — approved pricing)
export const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    price: 29,
    annualPrice: 19,
    productsPerPlatform: 3,
    platforms: 1,
    contentCredits: 50,
    engines: ['discovery'],
  },
  growth: {
    name: 'Growth',
    price: 59,
    annualPrice: 39,
    productsPerPlatform: 10,
    platforms: 2,
    contentCredits: 200,
    engines: ['discovery', 'content', 'store_integration'],
  },
  professional: {
    name: 'Professional',
    price: 99,
    annualPrice: 69,
    productsPerPlatform: 25,
    platforms: 3,
    contentCredits: 500,
    engines: ['discovery', 'analytics', 'content', 'influencer', 'supplier', 'marketing', 'store_integration'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 149,
    annualPrice: 99,
    productsPerPlatform: 50,
    platforms: Infinity,
    contentCredits: Infinity,
    engines: ['discovery', 'analytics', 'content', 'influencer', 'supplier', 'marketing', 'store_integration', 'affiliate'],
  },
} as const

// Content credit costs per content type (v8 spec Section 3.2)
export const CONTENT_CREDIT_COSTS = {
  caption: 1,
  ad: 1,
  blog: 3,
  image: 2,
  carousel: 5,
  short_video: 5,
  long_video: 8,
  email_sequence: 3,
} as const

export type ContentType = keyof typeof CONTENT_CREDIT_COSTS

export type PlanId = keyof typeof PRICING_TIERS
