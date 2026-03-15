'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Store, Link2, Unlink, ShoppingBag, ShoppingCart, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { EngineGate } from '@/components/engine-gate'
import { toast } from 'sonner'

interface Channel {
  id: string
  channel_type: string
  channel_name: string | null
  status: string
  connected_at: string
}

const AVAILABLE_CHANNELS = [
  {
    type: 'shopify',
    name: 'Shopify',
    icon: ShoppingBag,
    description: 'Push products to your Shopify store',
    gradient: 'gradient-emerald',
    iconColor: 'text-white',
    requiresDomain: true,
  },
  {
    type: 'tiktok_shop',
    name: 'TikTok Shop',
    icon: Store,
    description: 'List products on TikTok Shop',
    gradient: 'gradient-pink',
    iconColor: 'text-white',
    requiresDomain: false,
  },
  {
    type: 'amazon',
    name: 'Amazon',
    icon: ShoppingCart,
    description: 'Create FBA product listings',
    gradient: 'gradient-orange',
    iconColor: 'text-white',
    requiresDomain: false,
  },
]

export default function IntegrationsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [shopifyDomain, setShopifyDomain] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const connected = searchParams.get('connected')
    const error = searchParams.get('error')
    if (connected) toast.success(`Successfully connected ${connected}!`)
    if (error) toast.error(`Connection failed: ${error}`)
  }, [searchParams])

  useEffect(() => {
    fetch('/api/dashboard/channels')
      .then(r => r.json())
      .then(data => setChannels(data.channels || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getConnectedChannel = (type: string) => channels.find(c => c.channel_type === type && c.status === 'active')

  const handleConnect = async (channelType: string) => {
    setConnecting(channelType)
    try {
      const res = await fetch('/api/dashboard/channels/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelType,
          shopDomain: channelType === 'shopify' ? shopifyDomain : undefined,
        }),
      })
      const data = await res.json()

      if (data.notConfigured) {
        toast.error(`${channelType} OAuth is not configured yet. Contact admin.`)
      } else if (data.authUrl) {
        window.location.href = data.authUrl
        return
      } else {
        toast.error(data.error || 'Failed to initiate connection')
      }
    } catch {
      toast.error('Failed to connect')
    }
    setConnecting(null)
  }

  const handleDisconnect = async (channelId: string, channelType: string) => {
    setDisconnecting(channelId)
    try {
      const res = await fetch('/api/dashboard/channels/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId }),
      })
      if (res.ok) {
        setChannels(prev => prev.filter(c => c.id !== channelId))
        toast.success(`${channelType} disconnected`)
      } else {
        toast.error('Failed to disconnect')
      }
    } catch {
      toast.error('Failed to disconnect')
    }
    setDisconnecting(null)
  }

  return (
    <EngineGate engine="store_integration" featureName="Store Integrations">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Store Integrations</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Connect your e-commerce stores to push products automatically</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AVAILABLE_CHANNELS.map(ch => {
          const connected = getConnectedChannel(ch.type)
          const Icon = ch.icon
          return (
            <Card key={ch.type} className="card-hover">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl ${ch.gradient} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${ch.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{ch.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{ch.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {connected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400 border-0 flex items-center gap-1">
                        <CheckCircle size={12} /> Connected
                      </Badge>
                      <span className="text-xs text-gray-400">
                        Since {new Date(connected.connected_at).toLocaleDateString()}
                      </span>
                    </div>
                    {connected.channel_name && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <ExternalLink size={12} /> {connected.channel_name}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={disconnecting === connected.id}
                      onClick={() => handleDisconnect(connected.id, ch.name)}
                    >
                      {disconnecting === connected.id ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Disconnecting...</>
                      ) : (
                        <><Unlink className="h-4 w-4 mr-2" /> Disconnect</>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <AlertCircle size={12} /> Not Connected
                    </Badge>
                    {ch.requiresDomain && (
                      <Input
                        placeholder="your-store.myshopify.com"
                        value={shopifyDomain}
                        onChange={(e) => setShopifyDomain(e.target.value)}
                        className="text-sm"
                      />
                    )}
                    <Button
                      size="sm"
                      className={`w-full ${ch.gradient} text-white border-0 hover:opacity-90`}
                      disabled={connecting === ch.type || (ch.requiresDomain && !shopifyDomain)}
                      onClick={() => handleConnect(ch.type)}
                    >
                      {connecting === ch.type ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting...</>
                      ) : (
                        <><Link2 className="h-4 w-4 mr-2" /> Connect {ch.name}</>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!loading && channels.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No stores connected yet. Connect a store to start pushing products.</p>
        </div>
      )}
    </div>
    </EngineGate>
  )
}
