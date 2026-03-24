"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/auth-fetch"
import { Cog, Lock, Check, X, Loader2 } from "lucide-react"

interface EngineInfo {
  id: string
  name: string
  description: string
  entitled: boolean
  enabled: boolean
  config: Record<string, unknown> | null
  requiredPlan: string
}

export default function EnginesPage() {
  const [engines, setEngines] = useState<EngineInfo[]>([])
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<string | null>(null)

  async function loadEngines() {
    setLoading(true)
    try {
      const res = await authFetch("/api/dashboard/engines")
      if (res.ok) {
        const data = await res.json()
        setEngines(data.engines || [])
        setPlan(data.plan || null)
      }
    } catch (err) {
      console.error("Failed to load engines:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEngines() }, [])

  async function toggleEngine(engineId: string, enabled: boolean) {
    setToggling(engineId)
    try {
      const res = await authFetch("/api/dashboard/engines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engineId, enabled }),
      })
      if (res.ok) {
        setEngines(prev => prev.map(e => e.id === engineId ? { ...e, enabled } : e))
      }
    } catch (err) {
      console.error("Failed to toggle engine:", err)
    } finally {
      setToggling(null)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-gray-400">Loading engines...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Engine Controls</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage which AI engines are active for your account.
          {plan && <span className="ml-1">Current plan: <strong className="capitalize">{plan}</strong></span>}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {engines.map(engine => (
          <div
            key={engine.id}
            className={`border rounded-xl p-5 transition-colors ${
              engine.entitled
                ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                : "bg-gray-50 dark:bg-gray-950 border-gray-100 dark:border-gray-900 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cog className={`h-5 w-5 ${engine.entitled ? "text-blue-500" : "text-gray-400"}`} />
                <h3 className="font-semibold">{engine.name}</h3>
              </div>
              {engine.entitled ? (
                <button
                  onClick={() => toggleEngine(engine.id, !engine.enabled)}
                  disabled={toggling === engine.id}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    engine.enabled ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  {toggling === engine.id ? (
                    <Loader2 className="h-4 w-4 animate-spin absolute top-1 left-3.5 text-white" />
                  ) : (
                    <span
                      className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        engine.enabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  )}
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Lock className="h-3 w-3" /> {engine.requiredPlan}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-2">{engine.description}</p>
            <div className="flex items-center gap-2">
              {engine.entitled ? (
                engine.enabled ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600"><Check className="h-3 w-3" />Active</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-400"><X className="h-3 w-3" />Disabled</span>
                )
              ) : (
                <span className="text-xs text-gray-400">Upgrade to {engine.requiredPlan} to unlock</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
