"use client"

import { useState } from "react"
import { authFetch } from "@/lib/auth-fetch"
import { Bug, CheckCircle, XCircle, AlertTriangle, MinusCircle, Loader2, RefreshCw } from "lucide-react"

interface TestResult {
  test: string
  layer: string
  status: "PASS" | "FAIL" | "WARN" | "SKIP"
  detail: string
  fix?: string
}

interface DebugData {
  summary: { total: number; pass: number; fail: number; warn: number; skip: number }
  verdict: string
  failures?: TestResult[]
  results: TestResult[]
}

const STATUS_ICON = {
  PASS: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  FAIL: <XCircle className="h-4 w-4 text-red-500" />,
  WARN: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  SKIP: <MinusCircle className="h-4 w-4 text-gray-400" />,
}

const STATUS_BG = {
  PASS: "bg-emerald-50 dark:bg-emerald-900/20",
  FAIL: "bg-red-50 dark:bg-red-900/20",
  WARN: "bg-amber-50 dark:bg-amber-900/20",
  SKIP: "bg-gray-50 dark:bg-gray-800/50",
}

export default function DebugPage() {
  const [data, setData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(false)

  async function runDiagnostics() {
    setLoading(true)
    setData(null)
    try {
      const res = await authFetch("/api/admin/debug")
      if (res.ok) setData(await res.json())
      else setData(null)
    } catch (err) {
      console.error("Debug failed:", err)
    } finally {
      setLoading(false)
    }
  }

  // Group results by layer
  const layers = data ? [...new Set(data.results.map(r => r.layer))] : []
  const grouped = layers.map(layer => ({
    layer,
    results: data!.results.filter(r => r.layer === layer),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bug className="h-6 w-6 text-gray-500" /> System Diagnostics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Run a full diagnostic check across all platform layers.</p>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {loading ? "Running..." : "Run Diagnostics"}
        </button>
      </div>

      {!data && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <Bug className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Click &ldquo;Run Diagnostics&rdquo; to check database, auth, env vars, APIs, and backend.</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin" />
          <p>Running diagnostics across all layers...</p>
        </div>
      )}

      {data && (
        <>
          {/* Verdict */}
          <div className={`rounded-xl p-4 border ${data.summary.fail === 0 ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800" : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"}`}>
            <p className={`font-bold text-lg ${data.summary.fail === 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
              {data.verdict}
            </p>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-emerald-600">{data.summary.pass} passed</span>
              <span className="text-red-600">{data.summary.fail} failed</span>
              <span className="text-amber-600">{data.summary.warn} warnings</span>
              <span className="text-gray-500">{data.summary.skip} skipped</span>
            </div>
          </div>

          {/* Results by Layer */}
          {grouped.map(({ layer, results }) => (
            <div key={layer} className="bg-card border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/50">
                <h2 className="text-sm font-semibold uppercase tracking-wider">{layer.replace(/_/g, " ")}</h2>
              </div>
              <div className="divide-y">
                {results.map((r, i) => (
                  <div key={i} className={`px-4 py-3 ${STATUS_BG[r.status]}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{STATUS_ICON[r.status]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{r.test}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.detail}</p>
                        {r.fix && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Fix: {r.fix}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
