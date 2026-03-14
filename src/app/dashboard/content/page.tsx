'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface ContentItem {
  id: string
  content_type: string
  channel: string | null
  status: string
  generated_content: string | null
  requested_at: string
  completed_at: string | null
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Clock }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  generated: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  scheduled: { color: 'bg-purple-100 text-purple-800', icon: Clock },
  published: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
}

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/content')
      .then(r => r.json())
      .then(data => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Studio</h1>
          <p className="text-muted-foreground">AI-generated marketing content for your products</p>
        </div>
        <Button>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Content
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading content...</div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-semibold mb-1">No content generated yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate AI-powered marketing content for your allocated products.
            </p>
            <Button>
              <Sparkles className="h-4 w-4 mr-2" />
              Create Your First Content
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending
            return (
              <Card key={item.id}>
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={config.color}>{item.status}</Badge>
                      <span className="text-sm font-medium capitalize">
                        {item.content_type.replace('_', ' ')}
                      </span>
                      {item.channel && (
                        <span className="text-xs text-muted-foreground">
                          for {item.channel}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.requested_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                {item.generated_content && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                      {item.generated_content}
                    </p>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
