'use client'

import { useEffect, useState, useCallback } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ShoppingBag,
  Store,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  ExternalLink,
} from 'lucide-react'

interface ConnectedChannel {
  id: string
  channel_type: string
  channel_name: string | null
  status: string
  connected_at: string
  metadata?: Record<string, unknown>
}

interface ConnectionHubProps {
  /** Callback when connected channels list changes */
  onChannelsChange?: (channels: string[]) => void
  /** Compact mode for embedding in other pages */
  compact?: boolean
}

const CHANNEL_META: Record<string, {
  name: string
  icon: typeof ShoppingBag
  gradient: string
}> = {
  shopify: { name: 'Shopify', icon: ShoppingBag, gradient: 'gradient-emerald' },
  tiktok_shop: { name: 'TikTok Shop', icon: Store, gradient: 'gradient-pink' },
  amazon: { name: 'Amazon', icon: ShoppingCart, gradient: 'gradient-orange' },
}

export function ConnectionHub({ onChannelsChange, compact }: ConnectionHubProps) {
  const [channels, setChannels] = useState<ConnectedChannel[]>([])
  const [loading, setLoading] = useState(true)

  const fetchChannels = useCallback(async () => {
    try {
      const res = await authFetch('/api/dashboard/channels')
      const data = await res.json()
      const list: ConnectedChannel[] = data.channels || []
      setChannels(list)
      onChannelsChange?.(
        list.filter(c => c.status === 'active').map(c => c.channel_type)
      )
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [onChannelsChange])

  useEffect(() => {
    fetchChannels()
  }, [fetchChannels])

  const activeChannels = channels.filter(c => c.status === 'active')

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading connections...
      </div>
    )
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(CHANNEL_META).map(([type, meta]) => {
          const connected = activeChannels.find(c => c.channel_type === type)
          const Icon = meta.icon
          return (
            <Badge
              key={type}
              variant={connected ? 'default' : 'secondary'}
              className={`flex items-center gap-1.5 px-2.5 py-1 ${
                connected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border-0'
                  : ''
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.name}
              {connected ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertCircle className="h-3 w-3 opacity-50" />
              )}
            </Badge>
          )
        })}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => fetchChannels()}
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Connected Stores</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => fetchChannels()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {activeChannels.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No stores connected yet. Go to Integrations to connect.
          </p>
        ) : (
          activeChannels.map(ch => {
            const meta = CHANNEL_META[ch.channel_type]
            if (!meta) return null
            const Icon = meta.icon
            return (
              <div key={ch.id} className="flex items-center gap-2 text-sm">
                <div className={`h-7 w-7 rounded-md ${meta.gradient} flex items-center justify-center`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {ch.channel_name || meta.name}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-0">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            )
          })
        )}
        {activeChannels.length > 0 && (
          <a
            href="/dashboard/integrations"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-2"
          >
            <ExternalLink className="h-3 w-3" /> Manage connections
          </a>
        )}
      </CardContent>
    </Card>
  )
}
