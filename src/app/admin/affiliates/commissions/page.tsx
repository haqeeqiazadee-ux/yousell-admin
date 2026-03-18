"use client"

import { useEffect, useState } from "react"
import { DollarSign, CheckCircle, Clock } from "lucide-react"

interface Commission {
  id: string
  referrer_client_id: string
  commission_amount: number
  commission_rate: number
  status: string
  period_start: string
  period_end: string
  created_at: string
}

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    fetch("/api/admin/affiliates/commissions")
      .then(r => r.json())
      .then(data => setCommissions(data.commissions || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/affiliates/commissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    setCommissions(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const filtered = filter === "all" ? commissions : commissions.filter(c => c.status === filter)
  const totalPending = commissions.filter(c => c.status === "pending").reduce((s, c) => s + Number(c.commission_amount), 0)
  const totalPaid = commissions.filter(c => c.status === "paid").reduce((s, c) => s + Number(c.commission_amount), 0)

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Affiliate Commissions</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage referral commissions across all clients.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4 text-center">
          <Clock className="h-5 w-5 text-amber-500 mx-auto mb-1" />
          <p className="text-xl font-bold">${totalPending.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-xl font-bold">${totalPaid.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Paid</p>
        </div>
        <div className="bg-card border rounded-xl p-4 text-center">
          <DollarSign className="h-5 w-5 text-blue-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{commissions.length}</p>
          <p className="text-xs text-muted-foreground">Total Records</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "pending", "approved", "paid", "rejected"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm capitalize ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Referrer</th>
              <th className="text-left px-4 py-2 font-medium">Amount</th>
              <th className="text-left px-4 py-2 font-medium">Rate</th>
              <th className="text-left px-4 py-2 font-medium">Status</th>
              <th className="text-left px-4 py-2 font-medium">Period</th>
              <th className="text-left px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-mono text-xs">{c.referrer_client_id.slice(0, 8)}...</td>
                <td className="px-4 py-2 font-semibold">${Number(c.commission_amount).toFixed(2)}</td>
                <td className="px-4 py-2">{(Number(c.commission_rate) * 100).toFixed(0)}%</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    c.status === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                    c.status === "approved" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                    c.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}>{c.status}</span>
                </td>
                <td className="px-4 py-2 text-xs text-muted-foreground">
                  {c.period_start ? new Date(c.period_start).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-2 space-x-1">
                  {c.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(c.id, "approved")} className="text-xs text-emerald-600 hover:underline">Approve</button>
                      <button onClick={() => updateStatus(c.id, "rejected")} className="text-xs text-red-600 hover:underline">Reject</button>
                    </>
                  )}
                  {c.status === "approved" && (
                    <button onClick={() => updateStatus(c.id, "paid")} className="text-xs text-blue-600 hover:underline">Mark Paid</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No commissions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
