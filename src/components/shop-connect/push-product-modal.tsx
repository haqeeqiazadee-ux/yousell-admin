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

interface PushProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: {
    id: string
    title: string
    image_url?: string | null
    price?: number | null
  }
  connectedChannels: string[]
}

const CHANNEL_INFO: Record<string, { name: string; icon: typeof ShoppingBag; color: string }> = {
  shopify: { name: 'Shopify', icon: ShoppingBag, color: 'text-emerald-600' },
  tiktok: { name: 'TikTok Shop', icon: Store, color: 'text-pink-600' },
  amazon: { name: 'Amazon', icon: ShoppingCart, color: 'text-orange-600' },
}

export function PushProductModal({ open, onOpenChange, product, connectedChannels }: PushProductModalProps) {
  const [pushing, setPushing] = useState<string | null>(null)
  const [pushed, setPushed] = useState<Set<string>>(new Set())

  const handlePush = async (channel: string) => {
    setPushing(channel)
    try {
      const res = await authFetch('/api/dashboard/shop/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, channel }),
      })
      const data = await res.json()

      if (res.ok) {
        setPushed(prev => new Set([...prev, channel]))
        toast.success(`Product queued for push to ${CHANNEL_INFO[channel]?.name || channel}`)
      } else if (data.status === 'already_live') {
        setPushed(prev => new Set([...prev, channel]))
        toast.info('Product is already live on this channel')
      } else {
        toast.error(data.error || 'Push failed')
      }
    } catch {
      toast.error('Failed to push product')
    }
    setPushing(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Push to Store</DialogTitle>
          <DialogDescription>
            Push &ldquo;{product.title}&rdquo; to your connected stores.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Product preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            {product.image_url && (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-12 h-12 rounded-md object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.title}</p>
              {product.price != null && (
                <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Channel buttons */}
          {connectedChannels.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No stores connected. Go to Integrations to connect a store.</p>
            </div>
          ) : (
            connectedChannels.map(channel => {
              const info = CHANNEL_INFO[channel]
              if (!info) return null
              const Icon = info.icon
              const isPushed = pushed.has(channel)
              const isPushing = pushing === channel

              return (
                <Button
                  key={channel}
                  variant={isPushed ? 'outline' : 'default'}
                  className="w-full justify-start gap-3 h-12"
                  disabled={isPushing || isPushed}
                  onClick={() => handlePush(channel)}
                >
                  {isPushing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isPushed ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Icon className={`h-5 w-5 ${info.color}`} />
                  )}
                  <span className="flex-1 text-left">
                    {isPushed ? `Pushed to ${info.name}` : `Push to ${info.name}`}
                  </span>
                  {isPushed && <Badge variant="secondary" className="text-xs">Queued</Badge>}
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
