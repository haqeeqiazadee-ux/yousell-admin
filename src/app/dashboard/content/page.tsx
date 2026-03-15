'use client'

import { useEffect, useState, useCallback } from 'react'
import { authFetch } from '@/lib/auth-fetch'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles, FileText, Clock, CheckCircle, AlertCircle, Copy, X,
  Loader2, ChevronDown,
} from 'lucide-react'
import { EngineGate } from '@/components/engine-gate'

interface ContentItem {
  id: string
  product_id: string | null
  content_type: string
  channel: string | null
  status: string
  generated_content: string | null
  error: string | null
  requested_at: string
  completed_at: string | null
}

interface Product {
  id: string
  title: string
  source: string
  price: number | null
}

const STATUS_CONFIG: Record<string, { color: string; icon: typeof Clock }> = {
  pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  generated: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  scheduled: { color: 'bg-purple-100 text-purple-800', icon: Clock },
  published: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
}

const CONTENT_TYPES = [
  { value: 'product_description', label: 'Product Description' },
  { value: 'social_post', label: 'Social Media Post' },
  { value: 'ad_copy', label: 'Ad Copy' },
  { value: 'email_sequence', label: 'Email Sequence' },
  { value: 'video_script', label: 'Video Script' },
]

const CHANNELS = [
  { value: '', label: 'General' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'amazon', label: 'Amazon' },
  { value: 'shopify', label: 'Shopify' },
]

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerator, setShowGenerator] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  // Generator form state
  const [selectedProduct, setSelectedProduct] = useState('')
  const [contentType, setContentType] = useState('product_description')
  const [channel, setChannel] = useState('')

  const loadContent = useCallback(() => {
    authFetch('/api/dashboard/content')
      .then(r => r.json())
      .then(data => setItems(data.items || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadContent()
    // Load allocated products for the generator
    authFetch('/api/dashboard/products')
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .catch(console.error)
  }, [loadContent])

  const handleGenerate = async () => {
    if (!selectedProduct || !contentType) return
    setGenerating(true)
    try {
      const res = await authFetch('/api/dashboard/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct,
          contentType,
          channel: channel || undefined,
        }),
      })
      const data = await res.json()
      if (data.id) {
        setShowGenerator(false)
        setSelectedProduct('')
        setContentType('product_description')
        setChannel('')
        loadContent()
      }
    } catch (err) {
      console.error('Generation failed:', err)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <EngineGate engine="content" featureName="Content Studio">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Studio</h1>
          <p className="text-muted-foreground">AI-generated marketing content for your products</p>
        </div>
        <Button onClick={() => setShowGenerator(true)}>
          <Sparkles className="h-4 w-4 mr-2" />
          Generate Content
        </Button>
      </div>

      {/* Generator Panel */}
      {showGenerator && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                Generate New Content
              </h3>
              <button onClick={() => setShowGenerator(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Select */}
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <div className="relative">
                <select
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm appearance-none pr-8"
                >
                  <option value="">Select a product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.source}{p.price ? ` · $${p.price}` : ''})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              {products.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No products allocated yet. Products appear here once allocated by an admin.
                </p>
              )}
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium mb-1">Content Type</label>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map(ct => (
                  <button
                    key={ct.value}
                    onClick={() => setContentType(ct.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      contentType === ct.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {ct.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Channel */}
            <div>
              <label className="block text-sm font-medium mb-1">Target Channel</label>
              <div className="relative">
                <select
                  value={channel}
                  onChange={e => setChannel(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm appearance-none pr-8"
                >
                  {CHANNELS.map(ch => (
                    <option key={ch.value} value={ch.value}>{ch.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedProduct || generating}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Content List */}
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
            <Button onClick={() => setShowGenerator(true)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Create Your First Content
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending
            const isExpanded = expandedId === item.id
            return (
              <Card
                key={item.id}
                className={`cursor-pointer transition-shadow ${isExpanded ? 'shadow-md' : 'hover:shadow-sm'}`}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={config.color}>{item.status}</Badge>
                      <span className="text-sm font-medium capitalize">
                        {item.content_type.replace(/_/g, ' ')}
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
                    <p className={`text-sm text-muted-foreground whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-3'}`}>
                      {item.generated_content}
                    </p>
                    {isExpanded && (
                      <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(item.generated_content!, item.id)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          {copied === item.id ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                )}
                {item.status === 'failed' && item.error && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-red-600">{item.error}</p>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
    </EngineGate>
  )
}
