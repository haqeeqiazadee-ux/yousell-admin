"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/auth-fetch"
import { Shield, Plus, XCircle, Clock, RefreshCw, Loader2 } from "lucide-react"

interface Override {
  id: string
  override_type: string
  created_by: string
  reason: string
  target_client_id: string | null
  target_engine: string | null
  expires_at: string
  active: boolean
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  single_request: "Single Request",
  client_bypass: "Client Bypass (24h max)",
  engine_bypass: "Engine Bypass (24h max)",
  full_bypass: "Full Bypass (1h max)",
}

export default function GovernorOverridesPage() {
  const [active, setActive] = useState<Override[]>([])
  const [expired, setExpired] = useState<Override[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [deactivating, setDeactivating] = useState<string | null>(null)

  // Form state
  const [overrideType, setOverrideType] = useState("single_request")
  const [reason, setReason] = useState("")
  const [duration, setDuration] = useState(60)
  const [targetEngine, setTargetEngine] = useState("")
  const [targetClient, setTargetClient] = useState("")

  async function loadOverrides() {
    setLoading(true)
    try {
      const res = await authFetch("/api/admin/governor/overrides")
      if (res.ok) {
        const data = await res.json()
        setActive(data.active || [])
        setExpired(data.expired || [])
      }
    } catch (err) {
      console.error("Failed to load overrides:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOverrides() }, [])

  async function createOverride() {
    if (!reason.trim()) return
    setCreating(true)
    try {
      const res = await authFetch("/api/admin/governor/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          overrideType,
          reason,
          createdBy: "admin",
          durationMinutes: duration,
          targetEngine: targetEngine || undefined,
          targetClientId: targetClient || undefined,
        }),
      })
      if (res.ok) {
        setShowForm(false)
        setReason("")
        await loadOverrides()
      }
    } catch (err) {
      console.error("Failed to create override:", err)
    } finally {
      setCreating(false)
    }
  }

  async function deactivateOverride(id: string) {
    setDeactivating(id)
    try {
      await authFetch("/api/admin/governor/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deactivate", overrideId: id }),
      })
      setActive(prev => prev.filter(o => o.id !== id))
    } catch (err) {
      console.error("Failed to deactivate:", err)
    } finally {
      setDeactivating(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading overrides...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" /> Governor Overrides
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Temporary bypass rules for governor rate limiting and budget enforcement.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadOverrides} className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="h-4 w-4" /> New Override
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">Create Override</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Type</label>
              <select value={overrideType} onChange={e => setOverrideType(e.target.value)} className="w-full text-sm bg-white dark:bg-gray-900 border rounded-lg px-3 py-2">
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Duration (minutes)</label>
              <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full text-sm bg-white dark:bg-gray-900 border rounded-lg px-3 py-2" min={1} max={1440} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Target Engine (optional)</label>
              <input value={targetEngine} onChange={e => setTargetEngine(e.target.value)} placeholder="e.g. content-creation" className="w-full text-sm bg-white dark:bg-gray-900 border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Target Client ID (optional)</label>
              <input value={targetClient} onChange={e => setTargetClient(e.target.value)} placeholder="Client UUID" className="w-full text-sm bg-white dark:bg-gray-900 border rounded-lg px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Reason (required)</label>
            <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this override needed?" className="w-full text-sm bg-white dark:bg-gray-900 border rounded-lg px-3 py-2" />
          </div>
          <div className="flex gap-2">
            <button onClick={createOverride} disabled={creating || !reason.trim()} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create Override
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-muted text-sm rounded-lg hover:bg-muted/80 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Active Overrides */}
      <div className="bg-card border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b bg-red-50 dark:bg-red-900/10">
          <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">Active Overrides ({active.length})</h2>
        </div>
        {active.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">No active overrides. Governor is enforcing all rules.</div>
        ) : (
          <div className="divide-y">
            {active.map(o => (
              <div key={o.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">{TYPE_LABELS[o.override_type] || o.override_type}</span>
                    {o.target_engine && <span className="text-xs text-muted-foreground">Engine: {o.target_engine}</span>}
                    {o.target_client_id && <span className="text-xs text-muted-foreground">Client: {o.target_client_id.slice(0, 8)}...</span>}
                  </div>
                  <p className="text-sm mt-1">{o.reason}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Expires: {new Date(o.expires_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deactivateOverride(o.id)}
                  disabled={deactivating === o.id}
                  className="text-xs px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                >
                  {deactivating === o.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 inline mr-1" />}
                  Deactivate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Expired */}
      {expired.length > 0 && (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold text-muted-foreground">Expired / Deactivated ({expired.length})</h2>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {expired.map(o => (
              <div key={o.id} className="px-4 py-2 opacity-60">
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">{TYPE_LABELS[o.override_type] || o.override_type}</span>
                  <span className="text-muted-foreground">{o.reason}</span>
                  <span className="text-muted-foreground ml-auto">{new Date(o.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
