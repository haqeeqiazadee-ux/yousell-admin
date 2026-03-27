'use client'

import { useState } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShoppingBag, Store, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BatchPushModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  products: Array<{
    id: string
    title: string
  }>
  connectedChannels: string[]
}

const CHANNEL_INFO: Record<string, { name: string; icon: typeof ShoppingBag; color: string }> = {
  shopify: { name: 'Shopify', icon: ShoppingBag, color: 'text-emerald-600' },
  tiktok: { name: 'TikTok Shop', icon: Store, color: 'text-pink-600' },
  amazon: { name: 'Amazon', icon: ShoppingCart, color: 'text-orange-600' },
}

export function BatchPushModal({ open, onOpenChange, products, connectedChannels }: BatchPushModalProps) {
  const [pushing, setPushing] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, { queued: number; skipped: number }>>({})

  const handleBatchPush = async (channel: string) => {
    setPushing(channel)
    try {
      const res = await authFetch('/api/dashboard/shop/push-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: products.map(p => p.id),
          channel,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setResults(prev => ({
          ...prev,
          [channel]: { queued: data.queued, skipped: data.skipped },
        }))
        toast.success(`${data.queued} products queued for ${CHANNEL_INFO[channel]?.name || channel}`)
      } else {
        toast.error(data.error || 'Batch push failed')
      }
    } catch {
      toast.error('Failed to push products')
    }
    setPushing(null)
  }

  const done = Object.keys(results)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Batch Push to Store</DialogTitle>
          <DialogDescription>
            Push {products.length} selected product{products.length !== 1 ? 's' : ''} to your connected stores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Product count summary */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium">{products.length} product{products.length !== 1 ? 's' : ''} selected</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {products.slice(0, 3).map(p => p.title).join(', ')}
              {products.length > 3 && ` +${products.length - 3} more`}
            </p>
          </div>

          {/* Channel buttons */}
          {connectedChannels.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No stores connected.</p>
            </div>
          ) : (
            connectedChannels.map(channel => {
              const info = CHANNEL_INFO[channel]
              if (!info) return null
              const Icon = info.icon
              const result = results[channel]
              const isPushing = pushing === channel
              const isDone = done.includes(channel)

              return (
                <Button
                  key={channel}
                  variant={isDone ? 'outline' : 'default'}
                  className="w-full justify-start gap-3 h-12"
                  disabled={isPushing || isDone}
                  onClick={() => handleBatchPush(channel)}
                >
                  {isPushing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isDone ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Icon className={`h-5 w-5 ${info.color}`} />
                  )}
                  <span className="flex-1 text-left">
                    {isDone
                      ? `${result?.queued || 0} queued to ${info.name}`
                      : `Push all to ${info.name}`
                    }
                  </span>
                  {isDone && result?.skipped ? (
                    <Badge variant="secondary" className="text-xs">{result.skipped} skipped</Badge>
                  ) : null}
                </Button>
              )
            })
          )}
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
