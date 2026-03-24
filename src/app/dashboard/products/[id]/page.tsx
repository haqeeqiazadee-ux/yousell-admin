"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink, Sparkles, TrendingUp, Zap, DollarSign, Store, Loader2 } from "lucide-react"
import { authFetch } from "@/lib/auth-fetch"

interface Product {
  id: string
  title: string
  description?: string
  platform?: string
  channel?: string
  category?: string
  price?: number
  cost?: number
  currency?: string
  margin_percent?: number
  final_score?: number
  trend_score?: number
  viral_score?: number
  profit_score?: number
  trend_stage?: string
  external_url?: string
  image_url?: string
  ai_summary?: string
  ai_insight_haiku?: string
  ai_blueprint?: string
  tags?: string[]
  created_at?: string
}

interface ContentItem {
  id: string
  content_type: string
  status: string
  generated_content?: string
  created_at: string
}

function ScoreBadge({ label, score, icon: Icon }: { label: string; score?: number; icon: React.ElementType }) {
  if (score === undefined || score === null) return null
  const color = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-yellow-400" : score >= 40 ? "text-orange-400" : "text-red-400"
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-1">
      <Icon className={`h-5 w-5 ${color}`} />
      <span className="text-2xl font-bold text-white">{score}</span>
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [pushing, setPushing] = useState<string | null>(null)
  const [pushResult, setPushResult] = useState<{ channel: string; success: boolean; message: string } | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch(`/api/dashboard/products?id=${params.id}`)
        const data = await res.json()
        if (data.products?.length > 0) {
          setProduct(data.products[0])
        }
        // Load content for this product
        const contentRes = await authFetch(`/api/dashboard/content?product_id=${params.id}`)
        const contentData = await contentRes.json()
        setContent(contentData.items || [])
      } catch (err) {
        console.error("Failed to load product:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  if (loading) {
    return <div className="flex items-center justify-center min-h-[50vh] text-gray-400">Loading...</div>
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-gray-400">Product not found</p>
        <button onClick={() => router.back()} className="text-sm text-rose-400 hover:underline">Go back</button>
      </div>
    )
  }

  const tier = (product.final_score ?? 0) >= 80 ? "HOT" : (product.final_score ?? 0) >= 60 ? "WARM" : (product.final_score ?? 0) >= 40 ? "WATCH" : "COLD"
  const tierColor = tier === "HOT" ? "bg-rose-500" : tier === "WARM" ? "bg-amber-500" : tier === "WATCH" ? "bg-blue-500" : "bg-gray-500"

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </button>

      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          {product.image_url && (
            <img src={product.image_url} alt={product.title} className="w-24 h-24 rounded-xl object-cover border border-white/10" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${tierColor}`}>{tier}</span>
              {product.trend_stage && <span className="text-xs text-gray-500 capitalize">{product.trend_stage}</span>}
              {product.platform && <span className="text-xs text-gray-500">{product.platform}</span>}
            </div>
            <h1 className="text-xl font-bold text-white truncate">{product.title}</h1>
            {product.description && <p className="text-sm text-gray-400 mt-1 line-clamp-3">{product.description}</p>}
            <div className="flex items-center gap-4 mt-3">
              {product.price !== undefined && <span className="text-lg font-semibold text-emerald-400">${product.price}</span>}
              {product.external_url && (
                <a href={product.external_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
                  View source <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-4 gap-3">
        <ScoreBadge label="Final" score={product.final_score} icon={Sparkles} />
        <ScoreBadge label="Trend" score={product.trend_score} icon={TrendingUp} />
        <ScoreBadge label="Viral" score={product.viral_score} icon={Zap} />
        <ScoreBadge label="Profit" score={product.profit_score} icon={DollarSign} />
      </div>

      {/* AI Insights */}
      {(product.ai_summary || product.ai_insight_haiku) && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">AI Insights</h2>
          {product.ai_summary && <p className="text-sm text-gray-300 mb-2">{product.ai_summary}</p>}
          {product.ai_insight_haiku && <p className="text-sm text-gray-400 italic">{product.ai_insight_haiku}</p>}
        </div>
      )}

      {/* Push to Store */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Push to Store</h2>
        <div className="flex gap-3">
          {(["shopify", "tiktok", "amazon"] as const).map(channel => (
            <button
              key={channel}
              onClick={async () => {
                setPushing(channel)
                setPushResult(null)
                try {
                  const res = await authFetch("/api/dashboard/shop/push", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId: params.id, channel }),
                  })
                  const data = await res.json()
                  setPushResult({
                    channel,
                    success: res.ok,
                    message: res.ok ? "Product queued for push!" : (data.error || "Push failed"),
                  })
                } catch {
                  setPushResult({ channel, success: false, message: "Network error" })
                } finally {
                  setPushing(null)
                }
              }}
              disabled={pushing !== null}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              {pushing === channel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Store className="h-4 w-4" />}
              <span className="capitalize">{channel === "tiktok" ? "TikTok Shop" : channel}</span>
            </button>
          ))}
        </div>
        {pushResult && (
          <p className={`text-xs mt-2 ${pushResult.success ? "text-emerald-400" : "text-red-400"}`}>
            {pushResult.message}
          </p>
        )}
      </div>

      {/* Generated Content */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Generated Content</h2>
          <a href="/dashboard/content" className="text-xs text-rose-400 hover:underline">Generate new</a>
        </div>
        {content.length === 0 ? (
          <p className="text-sm text-gray-500">No content generated yet for this product.</p>
        ) : (
          <div className="space-y-3">
            {content.map((c) => (
              <div key={c.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-300 capitalize">{c.content_type.replace(/_/g, " ")}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${c.status === "generated" ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-500/20 text-gray-400"}`}>
                    {c.status}
                  </span>
                </div>
                {c.generated_content && <p className="text-sm text-gray-400 line-clamp-3">{c.generated_content}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
