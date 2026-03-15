'use client'

import { useEffect, useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Check, ArrowRight, ExternalLink } from 'lucide-react'

interface Subscription {
  id: string
  plan: string
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
  stripe_customer_id: string
}

interface Plan {
  name: string
  price: number
  productsPerPlatform: number
  platforms: number
  engines: string[]
}

const ALL_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: ['1 platform', '3 products per platform', 'Product discovery engine', 'Basic analytics'],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 79,
    features: ['3 platforms', '10 products per platform', 'Discovery + Analytics + Content', 'Priority support'],
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    features: ['5 platforms', '25 products per platform', '6 engines included', 'Influencer + Supplier intelligence'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    features: ['All platforms', '50 products per platform', 'All 8 engines', 'Dedicated support + API access'],
  },
]

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    authFetch('/api/dashboard/subscription')
      .then(r => r.json())
      .then(data => {
        setSubscription(data.subscription)
        setPlan(data.plan)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleCheckout = async (planId: string) => {
    setCheckoutLoading(planId)
    try {
      const res = await authFetch('/api/dashboard/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setCheckoutLoading(null)
    }
  }

  const handleManage = async () => {
    try {
      const res = await authFetch('/api/dashboard/subscription/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Portal error:', err)
    }
  }

  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const showSuccess = params?.get('success') === 'true'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and payment details</p>
      </div>

      {showSuccess && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          Subscription activated successfully! Welcome to YouSell.
        </div>
      )}

      {/* Current Plan */}
      {!loading && subscription && plan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold">Current Plan: {plan.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    ${plan.price}/month
                    {subscription.cancel_at_period_end && ' (cancels at period end)'}
                  </p>
                </div>
              </div>
              <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
              <Button variant="outline" size="sm" onClick={handleManage}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {subscription ? 'Change Plan' : 'Choose a Plan'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ALL_PLANS.map(p => {
            const isCurrentPlan = subscription?.plan === p.id
            return (
              <Card key={p.id} className={`relative ${p.popular ? 'border-blue-500 border-2' : ''}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-blue-600">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${p.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {p.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={p.popular ? 'default' : 'outline'}
                      onClick={() => handleCheckout(p.id)}
                      disabled={checkoutLoading === p.id}
                    >
                      {checkoutLoading === p.id ? 'Redirecting...' : (
                        <>
                          {subscription ? 'Switch Plan' : 'Get Started'}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
