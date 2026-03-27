"use client"

import { useState } from "react"
import { Bell, Flame, TrendingDown, MapPin, DollarSign, Settings, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectOption } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

/* ------------------------------------------------------------------ */
/*  Alert types & mock data                                           */
/* ------------------------------------------------------------------ */

type AlertType = "score" | "competitor" | "viral" | "price"

interface Alert {
  id: string
  type: AlertType
  timestamp: string
  product: string
  description: string
  isNew: boolean
}

const ALERT_CONFIG: Record<AlertType, { emoji: string; label: string; color: string }> = {
  score:      { emoji: "\uD83D\uDD25", label: "Score Jump",       color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  competitor: { emoji: "\uD83D\uDCC9", label: "Competitor Launch", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  viral:      { emoji: "\uD83D\uDCCC", label: "Pre-Viral Signal", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  price:      { emoji: "\uD83D\uDCB0", label: "Price Change",     color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
}

const MOCK_ALERTS: Alert[] = [
  {
    id: "a1",
    type: "score",
    timestamp: "2026-03-27T14:32:00Z",
    product: "LED Strip Lights RGB 10m",
    description: "YOUSELL Score jumped from 72 to 89 (+17) in the last 24 hours. High demand signal detected.",
    isNew: true,
  },
  {
    id: "a2",
    type: "viral",
    timestamp: "2026-03-27T11:15:00Z",
    product: "Portable Blender 600ml",
    description: "Pre-viral signal detected: 3 TikTok videos trending with combined 2.1M views in 48 hours.",
    isNew: true,
  },
  {
    id: "a3",
    type: "price",
    timestamp: "2026-03-27T09:45:00Z",
    product: "Magnetic Phone Mount",
    description: "Competitor price dropped from $24.99 to $18.99 (-24%). Your margin advantage increased.",
    isNew: true,
  },
  {
    id: "a4",
    type: "competitor",
    timestamp: "2026-03-26T22:10:00Z",
    product: "Aroma Diffuser 300ml",
    description: "New competitor listing detected on Amazon UK. Similar product at $2 lower price point.",
    isNew: true,
  },
  {
    id: "a5",
    type: "score",
    timestamp: "2026-03-26T16:00:00Z",
    product: "Pet Grooming Glove",
    description: "YOUSELL Score increased from 65 to 78 (+13). Category demand rising ahead of summer.",
    isNew: true,
  },
  {
    id: "a6",
    type: "viral",
    timestamp: "2026-03-25T08:30:00Z",
    product: "LED Strip Lights RGB 10m",
    description: "Hashtag #ledlights gained 450k new posts this week. Strong content velocity.",
    isNew: false,
  },
  {
    id: "a7",
    type: "price",
    timestamp: "2026-03-24T19:20:00Z",
    product: "Portable Blender 600ml",
    description: "Supplier price decreased by 8%. Updated landed cost: $6.25/unit.",
    isNew: false,
  },
  {
    id: "a8",
    type: "competitor",
    timestamp: "2026-03-23T12:00:00Z",
    product: "Magnetic Phone Mount",
    description: "Top competitor out of stock on Amazon. Opportunity window estimated at 5-7 days.",
    isNew: false,
  },
]

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(MOCK_ALERTS)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [digestFrequency, setDigestFrequency] = useState("daily")

  const newCount = alerts.filter((a) => a.isNew).length

  function dismissAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }

  function filterAlerts(type: string | null) {
    if (!type) return alerts
    return alerts.filter((a) => a.type === type)
  }

  function formatTime(ts: string) {
    const d = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffHrs = Math.floor(diffMs / 3600000)
    if (diffHrs < 1) return "Just now"
    if (diffHrs < 24) return `${diffHrs}h ago`
    const diffDays = Math.floor(diffHrs / 24)
    return `${diffDays}d ago`
  }

  function AlertTimeline({ items }: { items: Alert[] }) {
    if (items.length === 0) {
      return (
        <p className="text-sm text-muted-foreground text-center py-8">
          No alerts in this category.
        </p>
      )
    }

    return (
      <div className="space-y-3">
        {items.map((alert) => {
          const cfg = ALERT_CONFIG[alert.type]
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                alert.isNew ? "bg-muted/40 border-brand-400/20" : ""
              }`}
            >
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <span className="text-lg leading-none">{cfg.emoji}</span>
                <Badge variant="secondary" className={`text-[10px] px-1.5 ${cfg.color}`}>
                  {cfg.label}
                </Badge>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{alert.product}</span>
                  {alert.isNew && (
                    <Badge className="text-[10px] px-1.5 bg-brand-400 text-white">NEW</Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <div className="flex gap-2 pt-1">
                  <Button size="xs" variant="outline" className="gap-1">
                    View product <span aria-hidden="true">&rarr;</span>
                  </Button>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-brand-400" />
          My Alerts
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {newCount} new &middot; {alerts.length} total
        </p>
      </div>

      {/* Alert Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="new">New ({newCount})</TabsTrigger>
          <TabsTrigger value="price">Price</TabsTrigger>
          <TabsTrigger value="score">Score</TabsTrigger>
          <TabsTrigger value="viral">Viral</TabsTrigger>
          <TabsTrigger value="competitor">Competitor</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <AlertTimeline items={alerts} />
        </TabsContent>
        <TabsContent value="new">
          <AlertTimeline items={alerts.filter((a) => a.isNew)} />
        </TabsContent>
        <TabsContent value="price">
          <AlertTimeline items={filterAlerts("price")} />
        </TabsContent>
        <TabsContent value="score">
          <AlertTimeline items={filterAlerts("score")} />
        </TabsContent>
        <TabsContent value="viral">
          <AlertTimeline items={filterAlerts("viral")} />
        </TabsContent>
        <TabsContent value="competitor">
          <AlertTimeline items={filterAlerts("competitor")} />
        </TabsContent>
      </Tabs>

      {/* Alert Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Alert Preferences
          </CardTitle>
          <CardDescription>Configure how and when you receive alerts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label>Email notifications</Label>
            </div>
            <Switch
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>

          {emailEnabled && (
            <div className="flex items-center gap-3 pl-6">
              <Label className="text-muted-foreground">Digest frequency</Label>
              <Select
                value={digestFrequency}
                onValueChange={setDigestFrequency}
                className="w-40"
              >
                <SelectOption value="instant">Instant</SelectOption>
                <SelectOption value="daily">Daily digest</SelectOption>
                <SelectOption value="weekly">Weekly digest</SelectOption>
                <SelectOption value="off">Off</SelectOption>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
