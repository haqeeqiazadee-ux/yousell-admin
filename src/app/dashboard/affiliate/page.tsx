"use client"

import { useEffect, useState } from "react"
import { Copy, Check, DollarSign, Users, TrendingUp } from "lucide-react"

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
    fetch("/api/dashboard/affiliate/referral")
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

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-gray-400">Loading...</div>
  if (!data) return <div className="text-gray-400 text-center py-8">Failed to load affiliate data</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Affiliate Program</h1>
        <p className="text-sm text-gray-400 mt-1">Earn 20% recurring commission for every referral that subscribes.</p>
      </div>

      {/* Referral Link */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Your Referral Link</h2>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={data.referral_url}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 font-mono"
          />
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Code: {data.referral_code}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <Users className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{data.stats.total_referrals}</p>
          <p className="text-xs text-gray-500">Total Referrals</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <TrendingUp className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{data.stats.subscribed}</p>
          <p className="text-xs text-gray-500">Converted</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <DollarSign className="h-5 w-5 text-amber-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">${data.total_earnings.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Total Earned</p>
        </div>
      </div>

      {data.pending_earnings > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-400">Pending: ${data.pending_earnings.toFixed(2)}</p>
        </div>
      )}

      {/* Commission History */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Commission History</h2>
        {data.commissions.length === 0 ? (
          <p className="text-sm text-gray-500">No commissions yet. Share your referral link to start earning!</p>
        ) : (
          <div className="space-y-2">
            {data.commissions.map(c => (
              <div key={c.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <div>
                  <span className="text-sm text-white font-medium">${Number(c.commission_amount).toFixed(2)}</span>
                  <span className="text-xs text-gray-500 ml-2">({(Number(c.commission_rate) * 100).toFixed(0)}% rate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    c.status === "paid" ? "bg-emerald-500/20 text-emerald-400" :
                    c.status === "approved" ? "bg-blue-500/20 text-blue-400" :
                    c.status === "rejected" ? "bg-red-500/20 text-red-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>{c.status}</span>
                  <span className="text-xs text-gray-600">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
