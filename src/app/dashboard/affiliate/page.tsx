"use client"

import { useEffect, useState } from "react"
import { Copy, Check, DollarSign, Users, TrendingUp } from "lucide-react"
import { authFetch } from "@/lib/auth-fetch"

interface Commission {
  id: string
  commission_amount: number
  commission_rate: number
  status: string
  created_at: string
}

export default function AffiliateDashboard() {
  const [data, setData] = useState<{
    referral_code: string
    referral_url: string
    stats: { total_referrals: number; signed_up: number; subscribed: number }
    total_earnings: number
    pending_earnings: number
    commissions: Commission[]
  } | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch("/api/dashboard/affiliate/referral")
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const copyLink = () => {
    if (!data) return
    navigator.clipboard.writeText(data.referral_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading...</div>
  if (!data) return <div className="text-muted-foreground text-center py-8">Failed to load affiliate data</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Affiliate Program</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Earn 20% recurring commission for every referral that subscribes.</p>
      </div>

      {/* Referral Link */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Your Referral Link</h2>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={data.referral_url}
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 font-mono"
          />
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Code: {data.referral_code}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
          <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.stats.total_referrals}</p>
          <p className="text-xs text-gray-500">Total Referrals</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
          <TrendingUp className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data.stats.subscribed}</p>
          <p className="text-xs text-gray-500">Converted</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-center">
          <DollarSign className="h-5 w-5 text-amber-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${data.total_earnings.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Total Earned</p>
        </div>
      </div>

      {data.pending_earnings > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-400">Pending: ${data.pending_earnings.toFixed(2)}</p>
        </div>
      )}

      {/* Commission History */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Commission History</h2>
        {data.commissions.length === 0 ? (
          <p className="text-sm text-gray-400">No commissions yet. Share your referral link to start earning!</p>
        ) : (
          <div className="space-y-2">
            {data.commissions.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">${Number(c.commission_amount).toFixed(2)}</span>
                  <span className="text-xs text-gray-500 ml-2">({(Number(c.commission_rate) * 100).toFixed(0)}% rate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    c.status === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    c.status === "approved" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    c.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                  }`}>{c.status}</span>
                  <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
