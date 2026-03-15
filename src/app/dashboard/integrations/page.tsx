'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Store, Link2, Unlink, ShoppingBag, ShoppingCart } from 'lucide-react'
import { EngineGate } from '@/components/engine-gate'

interface Channel {
  id: string
  channel_type: string
  channel_name: string | null
  status: string
  connected_at: string
}

const AVAILABLE_CHANNELS = [
  { type: 'shopify', name: 'Shopify', icon: ShoppingBag, description: 'Push products to your Shopify store' },
  { type: 'tiktok_shop', name: 'TikTok Shop', icon: Store, description: 'List products on TikTok Shop' },
  { type: 'amazon', name: 'Amazon', icon: ShoppingCart, description: 'Create FBA product listings' },
]

export default function IntegrationsPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/channels')
      .then(r => r.json())
      .then(data => setChannels(data.channels || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const getConnectedChannel = (type: string) => channels.find(c => c.channel_type === type)

  return (
    <EngineGate engine="store_integration" featureName="Store Integrations">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Store Integrations</h1>
        <p className="text-muted-foreground">Connect your e-commerce stores to push products automatically</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {AVAILABLE_CHANNELS.map(ch => {
          const connected = getConnectedChannel(ch.type)
          const Icon = ch.icon
          return (
            <Card key={ch.type}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{ch.name}</h3>
                      <p className="text-xs text-muted-foreground">{ch.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {connected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
                      <span className="text-xs text-muted-foreground">
                        Since {new Date(connected.connected_at).toLocaleDateString()}
                      </span>
                    </div>
                    {connected.channel_name && (
                      <p className="text-sm text-muted-foreground">{connected.channel_name}</p>
                    )}
                    <Button variant="outline" size="sm" className="w-full">
                      <Unlink className="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Badge variant="secondary">Not Connected</Badge>
                    <Button variant="default" size="sm" className="w-full">
                      <Link2 className="h-4 w-4 mr-2" />
                      Connect {ch.name}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!loading && channels.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Store className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No stores connected yet. Connect a store to start pushing products.</p>
        </div>
      )}
    </div>
    </EngineGate>
  )
}
