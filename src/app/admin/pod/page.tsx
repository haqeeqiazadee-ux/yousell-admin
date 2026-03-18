"use client"

import { useEffect, useState } from "react"
import { Palette, Truck, RefreshCw, Loader2 } from "lucide-react"

interface Product {
  id: string
  title: string
  price: number
  category: string
  source: string
  final_score: number
  status: string
  created_at: string
}

export default function AdminPODPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const res = await fetch("/api/admin/products?channel=pod")
      const data = await res.json()
      setProducts(data.products || [])
    } catch (err) {
      console.error("Failed to load POD products:", err)
    } finally {
      setLoading(false)
    }
  }

  async function triggerScan() {
    setScanning(true)
    try {
      await fetch("/api/admin/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "pod", niche: "trending" }),
      })
      // Reload after brief delay
      setTimeout(() => { loadProducts(); setScanning(false) }, 3000)
    } catch (err) {
      console.error("POD scan failed:", err)
      setScanning(false)
    }
  }

  const tierBadge = (score: number) => {
    if (score >= 80) return <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">HOT</span>
    if (score >= 60) return <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">WARM</span>
    if (score >= 40) return <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">WATCH</span>
    return <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">COLD</span>
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-purple-500" /> Print on Demand
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Discover and manage POD products from Etsy, Redbubble, and Amazon Merch.
          </p>
        </div>
        <button
          onClick={triggerScan}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {scanning ? "Scanning..." : "Discover POD Trends"}
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Truck className="h-5 w-5 text-purple-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Fulfillment Partners</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
              Printful (340+ products, 10% commission), Printify (900+ products), Gelato (global print network).
              Connect via Settings to enable auto-provisioning.
            </p>
          </div>
        </div>
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Palette className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No POD products discovered yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Click &ldquo;Discover POD Trends&rdquo; to scan for trending designs.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Product</th>
                <th className="text-left px-4 py-2 font-medium">Category</th>
                <th className="text-left px-4 py-2 font-medium">Source</th>
                <th className="text-left px-4 py-2 font-medium">Price</th>
                <th className="text-left px-4 py-2 font-medium">Score</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{p.title}</td>
                  <td className="px-4 py-2 capitalize">{p.category}</td>
                  <td className="px-4 py-2 capitalize">{p.source}</td>
                  <td className="px-4 py-2">${p.price}</td>
                  <td className="px-4 py-2">{tierBadge(p.final_score || 0)}</td>
                  <td className="px-4 py-2 capitalize text-xs">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
