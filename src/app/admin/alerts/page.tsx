"use client"

import { useEffect, useState } from "react"
import { authFetch } from "@/lib/auth-fetch"
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react"

interface Alert {
  id: string
  alert_type: string
  severity: "critical" | "warning" | "info"
  message: string
  details: Record<string, unknown> | null
  acknowledged: boolean
  created_at: string
}

const SEVERITY_CONFIG = {
  critical: { icon: AlertCircle, bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-200 dark:border-red-800", text: "text-red-700 dark:text-red-400", badge: "bg-red-100 text-red-700" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-400", badge: "bg-amber-100 text-amber-700" },
  info: { icon: Info, bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-400", badge: "bg-blue-100 text-blue-700" },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [unacknowledged, setUnacknowledged] = useState(0)
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const [processing, setProcessing] = useState<string | null>(null)

  async function loadAlerts(evaluate = false) {
    if (evaluate) setEvaluating(true)
    else setLoading(true)
    try {
      const url = evaluate ? "/api/admin/alerts?evaluate=true" : "/api/admin/alerts"
      const res = await authFetch(url)
      if (res.ok) {
        const data = await res.json()
        setAlerts(data.alerts || [])
        setUnacknowledged(data.unacknowledged || 0)
      }
    } catch (err) {
      console.error("Failed to load alerts:", err)
    } finally {
      setLoading(false)
      setEvaluating(false)
    }
  }

  useEffect(() => { loadAlerts() }, [])

  async function acknowledgeAlert(alertId: string) {
    setProcessing(alertId)
    try {
      await authFetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge", alertId }),
      })
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a))
      setUnacknowledged(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to acknowledge alert:", err)
    } finally {
      setProcessing(null)
    }
  }

  async function dismissAlert(alertId: string) {
    setProcessing(alertId)
    try {
      await authFetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss", alertId }),
      })
      setAlerts(prev => prev.filter(a => a.id !== alertId))
    } catch (err) {
      console.error("Failed to dismiss alert:", err)
    } finally {
      setProcessing(null)
    }
  }

  async function acknowledgeAll() {
    const ids = alerts.filter(a => !a.acknowledged).map(a => a.id)
    if (ids.length === 0) return
    try {
      await authFetch("/api/admin/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge_all", alertIds: ids }),
      })
      setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))
      setUnacknowledged(0)
    } catch (err) {
      console.error("Failed to acknowledge all:", err)
    }
  }

  const filtered = filter === "all" ? alerts :
    filter === "unread" ? alerts.filter(a => !a.acknowledged) :
    alerts.filter(a => a.severity === filter)

  if (loading) return <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">Loading alerts...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-amber-500" /> System Alerts
            {unacknowledged > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unacknowledged}</span>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Budget, error rate, and system health alerts.</p>
        </div>
        <div className="flex gap-2">
          {unacknowledged > 0 && (
            <button onClick={acknowledgeAll} className="px-3 py-1.5 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors">
              Acknowledge All
            </button>
          )}
          <button
            onClick={() => loadAlerts(true)}
            disabled={evaluating}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {evaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {evaluating ? "Evaluating..." : "Re-evaluate"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "unread", "critical", "warning", "info"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-lg text-sm capitalize ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {f}
          </button>
        ))}
        <span className="text-xs text-muted-foreground self-center ml-2">{filtered.length} alerts</span>
      </div>

      {/* Alert List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No alerts. System is healthy.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const config = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.info
            const Icon = config.icon
            return (
              <div key={alert.id} className={`${config.bg} border ${config.border} rounded-xl p-4 ${alert.acknowledged ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${config.text}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${config.badge}`}>{alert.severity}</span>
                      <span className="text-xs text-muted-foreground">{alert.alert_type.replace(/_/g, " ")}</span>
                      <span className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm">{alert.message}</p>
                  </div>
                  <div className="flex gap-1">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => acknowledgeAlert(alert.id)}
                        disabled={processing === alert.id}
                        className="text-xs px-2 py-1 rounded bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 transition-colors"
                      >
                        {processing === alert.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Ack"}
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      disabled={processing === alert.id}
                      className="text-xs px-2 py-1 rounded text-red-600 bg-white/50 hover:bg-white/80 dark:bg-black/20 dark:hover:bg-black/40 transition-colors"
                    >
                      <XCircle className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
